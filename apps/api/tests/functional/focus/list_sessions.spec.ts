import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'
import FocusSession from '#focus/models/focus_session'
import type { FocusSessionStatus } from '#focus/models/focus_session'

const CREDENTIALS = {
  fullName: 'Ada Lovelace',
  email: 'ada@atlas.app',
  password: 'secret1234',
}

const MONTH_START = DateTime.now().startOf('month')
const MONTH = MONTH_START.toFormat('yyyy-MM')

/**
 * Sessions are seeded directly at explicit instants around the current
 * month — the list endpoint only reads frozen state, so the lifecycle
 * is irrelevant here.
 */
async function seedSession(
  userId: string,
  name: string,
  startedAt: DateTime,
  status: FocusSessionStatus = 'completed',
  durationSeconds: number | null = 600
) {
  return FocusSession.create({
    userId,
    name,
    status,
    startedAt,
    endedAt: durationSeconds === null ? null : startedAt.plus({ seconds: durationSeconds }),
    lastPausedAt: status === 'paused' ? startedAt : null,
    pausedSeconds: 0,
    durationSeconds,
  })
}

test.group('Focus / list sessions', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('requires authentication', async ({ client }) => {
    const response = await client.get('/api/v1/focus/sessions')
    response.assertStatus(401)
  })

  test('rejects a missing month', async ({ client }) => {
    const user = await User.create({ ...CREDENTIALS })

    const response = await client.get('/api/v1/focus/sessions').loginAs(user)

    response.assertStatus(422)
  })

  test('rejects a malformed month', async ({ client }) => {
    const user = await User.create({ ...CREDENTIALS })

    for (const month of ['2025-13', 'oct-2025']) {
      const response = await client.get('/api/v1/focus/sessions').qs({ month }).loginAs(user)
      response.assertStatus(422)
    }
  })

  test('returns completed and abandoned sessions of the month, oldest first', async ({
    client,
    assert,
  }) => {
    const user = await User.create({ ...CREDENTIALS })
    await seedSession(user.id, 'Deep work', MONTH_START.plus({ days: 4, hours: 9 }))
    await seedSession(user.id, 'False start', MONTH_START.plus({ days: 9, hours: 14 }), 'abandoned')
    await seedSession(user.id, 'Morning review', MONTH_START.plus({ days: 1, hours: 8 }))

    const response = await client.get('/api/v1/focus/sessions').qs({ month: MONTH }).loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as {
      data: { name: string; status: string; durationSeconds: number }[]
    }
    assert.deepEqual(
      data.map(({ name, status }) => ({ name, status })),
      [
        { name: 'Morning review', status: 'completed' },
        { name: 'Deep work', status: 'completed' },
        { name: 'False start', status: 'abandoned' },
      ]
    )
    assert.equal(data[0]!.durationSeconds, 600)
  })

  test('excludes running and paused sessions', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    await seedSession(user.id, 'Live', MONTH_START.plus({ days: 2 }), 'running', null)
    await seedSession(user.id, 'On hold', MONTH_START.plus({ days: 3 }), 'paused', null)

    const response = await client.get('/api/v1/focus/sessions').qs({ month: MONTH }).loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as { data: unknown[] }
    assert.deepEqual(data, [])
  })

  test('excludes sessions outside the month', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    await seedSession(user.id, 'Last month', MONTH_START.minus({ minutes: 1 }))
    await seedSession(user.id, 'Next month', MONTH_START.plus({ months: 1 }))

    const response = await client.get('/api/v1/focus/sessions').qs({ month: MONTH }).loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as { data: unknown[] }
    assert.deepEqual(data, [])
  })

  test('scopes sessions to their owner', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const other = await User.create({ ...CREDENTIALS, email: 'grace@atlas.app' })
    await seedSession(other.id, 'Not yours', MONTH_START.plus({ days: 5 }))

    const response = await client.get('/api/v1/focus/sessions').qs({ month: MONTH }).loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as { data: unknown[] }
    assert.deepEqual(data, [])
  })
})
