import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'
import FocusSession from '#focus/models/focus_session'

/**
 * Usernames are explicit — User.create never generates one (that lives
 * in the signup flow), and the leaderboard's fallback name needs them.
 */
async function createUser(username: string, fullName: string | null = null) {
  return User.create({
    fullName,
    email: `${username}@atlas.app`,
    username,
    password: 'secret1234',
  })
}

/** Settled sessions seeded at explicit instants — only frozen state matters. */
async function seedSessionAt(userId: string, startedAt: DateTime, durationSeconds: number | null) {
  return FocusSession.create({
    userId,
    status: durationSeconds === null ? 'running' : 'completed',
    startedAt,
    endedAt: durationSeconds === null ? null : startedAt.plus({ seconds: durationSeconds }),
    lastPausedAt: null,
    pausedSeconds: 0,
    durationSeconds,
  })
}

interface Entry {
  rank: number
  totalSeconds: number
  user: {
    id: string
    name: string
    username: string | null
    avatarUrl: string | null
    initials: string
    level: { index: number; tier: string; division: number }
  }
}

interface Snapshot {
  period: string
  start: string
  end: string
  top: Entry[]
  me: { rank: number; totalSeconds: number } | null
  neighbors: Entry[]
}

function body(response: { body(): unknown }): Snapshot {
  return (response.body() as unknown as { data: Snapshot }).data
}

test.group('Focus / leaderboard', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('requires authentication', async ({ client }) => {
    const response = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'daily', anchor: '2026-01-15' })
    response.assertStatus(401)
  })

  test('rejects an unknown period', async ({ client }) => {
    const user = await createUser('ada')
    const response = await client
      .get('/api/v1/focus/leaderboard')
      // deliberately invalid — the typed client rightly refuses it
      .qs({ period: 'yearly', anchor: '2026-01-15' } as never)
      .loginAs(user)
    response.assertStatus(422)
  })

  test('rejects a malformed or missing anchor', async ({ client }) => {
    const user = await createUser('ada')

    const malformed = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'daily', anchor: '15-01-2026' })
      .loginAs(user)
    malformed.assertStatus(422)

    const missing = await client
      .get('/api/v1/focus/leaderboard')
      // deliberately incomplete — the typed client rightly refuses it
      .qs({ period: 'daily' } as never)
      .loginAs(user)
    missing.assertStatus(422)
  })

  test('rejects an impossible calendar date', async ({ client, assert }) => {
    const user = await createUser('ada')
    const response = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'daily', anchor: '2026-02-31' })
      .loginAs(user)
    response.assertStatus(400)
    const { errors } = response.body() as unknown as { errors: { code: string }[] }
    assert.equal(errors[0]!.code, 'E_INVALID_ANCHOR')
  })

  test('clamps a future anchor to the current period', async ({ client, assert }) => {
    const user = await createUser('ada')
    const response = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'daily', anchor: DateTime.now().plus({ days: 3 }).toISODate() })
      .loginAs(user)

    response.assertStatus(200)
    const data = body(response)
    assert.equal(data.start, DateTime.now().toISODate())
    assert.equal(data.end, DateTime.now().toISODate())
    assert.deepEqual(data.top, [])
    assert.isNull(data.me)
  })

  test('ranks daily totals descending and sums multiple sessions', async ({ client, assert }) => {
    const day = DateTime.now().minus({ days: 1 }).startOf('day').plus({ hours: 9 })
    const ada = await createUser('ada', 'Ada Lovelace')
    const grace = await createUser('grace', 'Grace Hopper')
    const linus = await createUser('linus', 'Linus Torvalds')

    await seedSessionAt(ada.id, day, 3600)
    await seedSessionAt(ada.id, day.plus({ hours: 3 }), 1800)
    await seedSessionAt(grace.id, day, 7200)
    await seedSessionAt(linus.id, day, 600)
    // previous day: excluded from this daily board
    await seedSessionAt(grace.id, day.minus({ days: 1 }), 5400)

    const response = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'daily', anchor: day.toISODate() })
      .loginAs(ada)

    response.assertStatus(200)
    const data = body(response)
    assert.deepEqual(
      data.top.map(({ rank, totalSeconds, user }) => ({
        rank,
        totalSeconds,
        name: user.name,
      })),
      [
        { rank: 1, totalSeconds: 7200, name: 'Grace Hopper' },
        { rank: 2, totalSeconds: 5400, name: 'Ada Lovelace' },
        { rank: 3, totalSeconds: 600, name: 'Linus Torvalds' },
      ]
    )
    assert.deepEqual(data.me, { rank: 2, totalSeconds: 5400 })
    assert.deepEqual(data.neighbors, [])

    // pins the batched progression fold and the safe public identity
    const graceEntry = data.top[0]!
    assert.equal(graceEntry.user.initials, 'GH')
    assert.equal(graceEntry.user.username, 'grace')
    // grace: 5400s (90 XP) then 7200s on a streak (120 × 1.05 = 126 XP)
    // -> 216 XP = Bronze II
    assert.deepEqual(graceEntry.user.level, { index: 2, tier: 'bronze', division: 2 })
  })

  test('buckets a session by its start day', async ({ client, assert }) => {
    const day = DateTime.now().minus({ days: 2 }).startOf('day')
    const ada = await createUser('ada')
    // starts at 23:00 and crosses midnight — counts fully on its start day
    await seedSessionAt(ada.id, day.plus({ hours: 23 }), 7200)

    const response = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'daily', anchor: day.toISODate() })
      .loginAs(ada)

    const data = body(response)
    assert.deepEqual(data.me, { rank: 1, totalSeconds: 7200 })
  })

  test('weekly periods run ISO Monday to Sunday', async ({ client, assert }) => {
    // Luxon startOf('week') IS Monday
    const monday = DateTime.now().startOf('week').minus({ weeks: 1 })
    const ada = await createUser('ada')
    const grace = await createUser('grace')

    await seedSessionAt(ada.id, monday.plus({ hours: 10 }), 3600)
    // the Sunday BEFORE the week — previous ISO week, excluded
    await seedSessionAt(grace.id, monday.minus({ hours: 10 }), 7200)

    const response = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'weekly', anchor: monday.toISODate() })
      .loginAs(ada)

    const data = body(response)
    assert.equal(data.start, monday.toISODate())
    assert.equal(data.end, monday.plus({ days: 6 }).toISODate())
    assert.lengthOf(data.top, 1)
    assert.equal(data.top[0]!.user.name, '@ada')

    // any date inside the period resolves to the same bounds
    const midWeek = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'weekly', anchor: monday.plus({ days: 3 }).toISODate() })
      .loginAs(ada)
    assert.equal(body(midWeek).start, data.start)
    assert.equal(body(midWeek).end, data.end)
  })

  test('monthly periods cover the calendar month', async ({ client, assert }) => {
    const first = DateTime.now().startOf('month').minus({ months: 1 })
    const ada = await createUser('ada')

    await seedSessionAt(ada.id, first.plus({ days: 4, hours: 9 }), 3600)
    // just before the month starts — excluded
    await seedSessionAt(ada.id, first.minus({ hours: 5 }), 7200)

    const response = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'monthly', anchor: first.plus({ days: 10 }).toISODate() })
      .loginAs(ada)

    const data = body(response)
    assert.equal(data.start, first.toISODate())
    assert.equal(data.end, first.endOf('month').toISODate())
    assert.deepEqual(data.me, { rank: 1, totalSeconds: 3600 })
  })

  test('serves me and trimmed neighbors outside the top 10', async ({ client, assert }) => {
    const day = DateTime.now().minus({ days: 1 }).startOf('day').plus({ hours: 8 })
    const me = await createUser('me', 'Just Me')
    await seedSessionAt(me.id, day, 300)

    for (let i = 1; i <= 13; i++) {
      const rival = await createUser(`rival${String(i).padStart(2, '0')}`)
      await seedSessionAt(rival.id, day.plus({ minutes: i }), (20 - i) * 600)
    }

    const response = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'daily', anchor: day.toISODate() })
      .loginAs(me)

    const data = body(response)
    assert.lengthOf(data.top, 10)
    assert.deepEqual(
      data.top.map((entry) => entry.rank),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    )
    // rival totals (20-i)*600 run 11400..4200, all above my 300 -> rank 14
    assert.deepEqual(data.me, { rank: 14, totalSeconds: 300 })
    // window 14±3 trimmed against the top (>=11) and the tail (14 is last)
    assert.deepEqual(
      data.neighbors.map((entry) => entry.rank),
      [11, 12, 13, 14]
    )
    assert.equal(data.neighbors[3]!.user.id, me.id)
  })

  test('an unranked user gets me null and empty neighbors', async ({ client, assert }) => {
    const day = DateTime.now().minus({ days: 1 }).startOf('day').plus({ hours: 8 })
    const me = await createUser('me')
    const rival = await createUser('rival')

    await seedSessionAt(rival.id, day, 3600)
    // mine: outside the period, plus an unsettled one inside it
    await seedSessionAt(me.id, day.minus({ days: 3 }), 3600)
    await seedSessionAt(me.id, day.plus({ hours: 1 }), null)

    const response = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'daily', anchor: day.toISODate() })
      .loginAs(me)

    const data = body(response)
    assert.lengthOf(data.top, 1)
    assert.isNull(data.me)
    assert.deepEqual(data.neighbors, [])
  })

  test('never leaks an email', async ({ client, assert }) => {
    const day = DateTime.now().minus({ days: 1 }).startOf('day').plus({ hours: 8 })
    const me = await createUser('me', 'Just Me')
    const nameless = await createUser('nameless', null)

    await seedSessionAt(me.id, day, 1200)
    await seedSessionAt(nameless.id, day, 3600)

    const response = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'daily', anchor: day.toISODate() })
      .loginAs(me)

    const data = body(response)
    assert.equal(data.top[0]!.user.name, '@nameless')
    assert.equal(data.top[0]!.user.initials, 'NA')
    // every seeded email ends in @atlas.app — any leak trips this,
    // including the model initials getter's email fallback
    assert.notInclude(JSON.stringify(response.body()), 'atlas.app')
  })

  test('breaks ties deterministically by user id', async ({ client, assert }) => {
    const day = DateTime.now().minus({ days: 1 }).startOf('day').plus({ hours: 8 })
    const ada = await createUser('ada')
    const grace = await createUser('grace')

    await seedSessionAt(ada.id, day, 3600)
    await seedSessionAt(grace.id, day.plus({ hours: 2 }), 3600)

    const response = await client
      .get('/api/v1/focus/leaderboard')
      .qs({ period: 'daily', anchor: day.toISODate() })
      .loginAs(ada)

    const data = body(response)
    const expectedOrder = [ada.id, grace.id].sort()
    assert.deepEqual(
      data.top.map((entry) => entry.user.id),
      expectedOrder
    )
    assert.deepEqual(
      data.top.map((entry) => entry.rank),
      [1, 2]
    )
  })
})
