import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'
import FocusSession from '#focus/models/focus_session'
import FocusSessionService from '#focus/services/focus_session_service'
import type { FocusSessionStatus } from '#focus/models/focus_session'

const CREDENTIALS = {
  fullName: 'Ada Lovelace',
  email: 'ada@atlas.app',
  password: 'secret1234',
}

/** Settled sessions seeded directly — the feed only reads frozen state. */
async function seedSession(
  userId: string,
  daysAgo: number,
  status: FocusSessionStatus = 'completed',
  durationSeconds: number | null = 600
) {
  return FocusSession.create({
    userId,
    name: `Seeded ${daysAgo}`,
    status,
    startedAt: DateTime.now().minus({ days: daysAgo }),
    endedAt:
      durationSeconds === null
        ? null
        : DateTime.now().minus({ days: daysAgo }).plus({ seconds: durationSeconds }),
    lastPausedAt: null,
    pausedSeconds: 0,
    durationSeconds,
  })
}

interface RecentSessionBody {
  id: string
  name: string
  startedAt: string
  durationSeconds: number
  apps: { name: string; bundleId: string | null; seconds: number }[]
}

test.group('Focus / recent sessions', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('requires authentication', async ({ client }) => {
    const response = await client.get('/api/v1/focus/sessions/recent')
    response.assertStatus(401)
  })

  test('returns completed sessions newest-first with their apps', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new FocusSessionService()
    await seedSession(user.id, 3)

    const session = await service.start(user)
    await service.complete(session, [
      { name: 'Safari', bundleId: 'com.apple.Safari', seconds: 120 },
      { name: 'Xcode', bundleId: 'com.apple.dt.Xcode', seconds: 300 },
    ])

    const response = await client.get('/api/v1/focus/sessions/recent').loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as { data: RecentSessionBody[] }
    assert.lengthOf(data, 2)
    // newest first: the just-completed session leads
    assert.equal(data[0]!.name, 'Session 2')
    assert.equal(data[1]!.name, 'Seeded 3')
    // apps ordered heaviest first
    assert.deepEqual(
      data[0]!.apps.map(({ name, seconds }) => ({ name, seconds })),
      [
        { name: 'Xcode', seconds: 300 },
        { name: 'Safari', seconds: 120 },
      ]
    )
    assert.equal(data[0]!.apps[0]!.bundleId, 'com.apple.dt.Xcode')
    assert.deepEqual(data[1]!.apps, [])
  })

  test('excludes running, paused and abandoned sessions', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    await seedSession(user.id, 1, 'abandoned')
    await seedSession(user.id, 2, 'running', null)
    await seedSession(user.id, 3, 'paused', null)
    await seedSession(user.id, 4, 'completed')

    const response = await client.get('/api/v1/focus/sessions/recent').loginAs(user)

    const { data } = response.body() as unknown as { data: RecentSessionBody[] }
    assert.lengthOf(data, 1)
    assert.equal(data[0]!.name, 'Seeded 4')
  })

  test('scopes sessions to their owner', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const other = await User.create({ ...CREDENTIALS, email: 'grace@atlas.app' })
    await seedSession(other.id, 1)

    const response = await client.get('/api/v1/focus/sessions/recent').loginAs(user)

    const { data } = response.body() as unknown as { data: RecentSessionBody[] }
    assert.deepEqual(data, [])
  })

  test('caps the list at 3', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    for (let daysAgo = 1; daysAgo <= 5; daysAgo++) {
      await seedSession(user.id, daysAgo)
    }

    const response = await client.get('/api/v1/focus/sessions/recent').loginAs(user)

    const { data } = response.body() as unknown as { data: RecentSessionBody[] }
    assert.lengthOf(data, 3)
    assert.equal(data[0]!.name, 'Seeded 1')
    assert.equal(data[2]!.name, 'Seeded 3')
  })

  test('excludes sessions older than a week', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    await seedSession(user.id, 2)
    await seedSession(user.id, 9)

    const response = await client.get('/api/v1/focus/sessions/recent').loginAs(user)

    const { data } = response.body() as unknown as { data: RecentSessionBody[] }
    assert.lengthOf(data, 1)
    assert.equal(data[0]!.name, 'Seeded 2')
  })
})
