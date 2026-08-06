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
 * Settled sessions are seeded directly — progression only reads frozen
 * durations. daysAgo >= 1 keeps every scenario clear of the midnight
 * boundary (minus({ days }) preserves the time of day).
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

test.group('Focus / progression', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('requires authentication', async ({ client }) => {
    const response = await client.get('/api/v1/focus/progression')
    response.assertStatus(401)
  })

  test('a fresh account rests at Bronze I', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const response = await client.get('/api/v1/focus/progression').loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as { data: unknown }
    assert.deepEqual(data, {
      xp: 0,
      level: { index: 1, tier: 'bronze', division: 1 },
      nextLevel: { index: 2, tier: 'bronze', division: 2 },
      xpIntoLevel: 0,
      xpForLevel: 100,
      streakDays: 0,
      multiplier: 1,
    })
  })

  test('scores worked days, streak bonus and yesterday decay', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    await seedSession(user.id, 3, 3600)
    await seedSession(user.id, 2, 3600)

    const response = await client.get('/api/v1/focus/progression').loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as { data: unknown }
    // 60 + 63 (streak), then -10 for the idle yesterday
    assert.deepEqual(data, {
      xp: 113,
      level: { index: 2, tier: 'bronze', division: 2 },
      nextLevel: { index: 3, tier: 'bronze', division: 3 },
      xpIntoLevel: 13,
      xpForLevel: 150,
      streakDays: 0,
      multiplier: 1,
    })
  })

  test('only counts the requesting user sessions', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const other = await User.create({ ...CREDENTIALS, email: 'grace@atlas.app' })
    await seedSession(other.id, 1, 3600)

    const response = await client.get('/api/v1/focus/progression').loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as { data: { xp: number; streakDays: number } }
    assert.equal(data.xp, 0)
  })

  test('unsettled sessions neither score nor decay', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    await seedSession(user.id, 1, null)

    const response = await client.get('/api/v1/focus/progression').loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as { data: { xp: number; streakDays: number } }
    assert.equal(data.xp, 0)
    assert.equal(data.streakDays, 0)
  })
})
