import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'
import FocusSession from '#focus/models/focus_session'

const CREDENTIALS = {
  fullName: 'Ada Lovelace',
  email: 'ada@atlas.app',
  password: 'secret1234',
}

/**
 * Settled sessions are seeded directly — the graph only reads frozen
 * durations, so the start/pause lifecycle is irrelevant here.
 */
async function seedSession(userId: string, daysAgo: number, durationSeconds: number | null) {
  return FocusSession.create({
    userId,
    status: durationSeconds === null ? 'running' : 'completed',
    startedAt: DateTime.now().minus({ days: daysAgo }),
    endedAt: durationSeconds === null ? null : DateTime.now().minus({ days: daysAgo }),
    lastPausedAt: null,
    pausedSeconds: 0,
    durationSeconds,
  })
}

test.group('Focus / activity', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('requires authentication', async ({ client }) => {
    const response = await client.get('/api/v1/focus/activity')
    response.assertStatus(401)
  })

  test('sums settled sessions per day, oldest first', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    await seedSession(user.id, 2, 1200)
    await seedSession(user.id, 0, 600)
    await seedSession(user.id, 0, 300)
    await seedSession(user.id, 0, null) // running: no frozen duration, excluded

    const response = await client.get('/api/v1/focus/activity').loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as {
      data: { date: string; totalSeconds: number }[]
    }
    assert.deepEqual(data, [
      { date: DateTime.now().minus({ days: 2 }).toISODate(), totalSeconds: 1200 },
      { date: DateTime.now().toISODate(), totalSeconds: 900 },
    ])
  })

  test('only counts the requesting user sessions', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const other = await User.create({ ...CREDENTIALS, email: 'grace@atlas.app' })
    await seedSession(other.id, 0, 900)

    const response = await client.get('/api/v1/focus/activity').loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as { data: unknown[] }
    assert.deepEqual(data, [])
  })
})
