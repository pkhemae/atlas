import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'
import FocusSession from '#focus/models/focus_session'

async function createUser(username: string, fullName: string | null = null) {
  return User.create({
    fullName,
    email: `${username}@atlas.app`,
    username,
    password: 'secret1234',
  })
}

/** Settled sessions seeded at explicit instants — only frozen state matters. */
async function seedSessionAt(userId: string, startedAt: DateTime, durationSeconds: number) {
  return FocusSession.create({
    userId,
    status: 'completed',
    startedAt,
    endedAt: startedAt.plus({ seconds: durationSeconds }),
    lastPausedAt: null,
    pausedSeconds: 0,
    durationSeconds,
  })
}

interface ProfileBody {
  user: {
    id: string
    name: string
    username: string | null
    avatarUrl: string | null
    initials: string
    bannerUrl: string | null
    bio: string | null
    location: string | null
    createdAt: string
  }
  progression: {
    xp: number
    level: { index: number; tier: string; division: number }
    nextLevel: { index: number; tier: string; division: number } | null
    xpIntoLevel: number
    xpForLevel: number | null
    streakDays: number
    multiplier: number
  }
  weeklyRank: number | null
  activity: { date: string; totalSeconds: number }[]
}

function body(response: { body(): unknown }): ProfileBody {
  return (response.body() as unknown as { data: ProfileBody }).data
}

test.group('Users / profile', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('requires authentication', async ({ client }) => {
    const response = await client.get('/api/v1/users/ada')
    response.assertStatus(401)
  })

  test('404s on an unknown username', async ({ client, assert }) => {
    const viewer = await createUser('viewer')

    const response = await client.get('/api/v1/users/ghost').loginAs(viewer)

    response.assertStatus(404)
    const errors = response.body() as unknown as { errors: { code: string }[] }
    assert.equal(errors.errors[0]!.code, 'E_USER_NOT_FOUND')
  })

  test('serves the composite profile payload', async ({ client, assert }) => {
    const viewer = await createUser('viewer')
    const ada = await createUser('ada', 'Ada Lovelace')
    ada.bio = 'Analytical engines'
    ada.location = 'London'
    await ada.save()
    const rival = await createUser('grace', 'Grace Hopper')

    // sessions TODAY: today never decays, so the XP stays exactly 20
    // whatever weekday the suite runs on; today is always in this ISO
    // week, so the rank window sees both (ada 20 min, rival 40 min)
    const today = DateTime.now().startOf('day').plus({ minutes: 5 })
    await seedSessionAt(ada.id, today, 1200)
    await seedSessionAt(rival.id, today.plus({ hours: 1 }), 2400)

    const response = await client.get('/api/v1/users/ada').loginAs(viewer)

    response.assertStatus(200)
    const data = body(response)
    assert.equal(data.user.name, 'Ada Lovelace')
    assert.equal(data.user.username, 'ada')
    assert.equal(data.user.initials, 'AL')
    assert.equal(data.user.bio, 'Analytical engines')
    assert.equal(data.user.location, 'London')
    assert.isString(data.user.createdAt)
    // 1200s of focus = 20 XP (600s daily gate passed)
    assert.equal(data.progression.xp, 20)
    assert.equal(data.progression.level.tier, 'bronze')
    assert.equal(data.weeklyRank, 2)
    const day = data.activity.find((entry) => entry.date === today.toISODate())
    assert.equal(day?.totalSeconds, 1200)
  })

  test('resolves a mixed-case username param', async ({ client, assert }) => {
    const viewer = await createUser('viewer')
    await createUser('ada', 'Ada Lovelace')

    const response = await client.get('/api/v1/users/ADA').loginAs(viewer)

    response.assertStatus(200)
    assert.equal(body(response).user.username, 'ada')
  })

  test('weeklyRank is null without settled focus this week', async ({ client, assert }) => {
    const viewer = await createUser('viewer')
    const ada = await createUser('ada')
    // focus far in the past: the activity feed still shows it, but this
    // week's rank does not (and two months of idle decay wiped the XP)
    const past = DateTime.now().minus({ months: 2 })
    await seedSessionAt(ada.id, past, 1200)

    const response = await client.get('/api/v1/users/ada').loginAs(viewer)

    const data = body(response)
    assert.isNull(data.weeklyRank)
    assert.equal(data.progression.xp, 0)
    const day = data.activity.find((entry) => entry.date === past.toISODate())
    assert.equal(day?.totalSeconds, 1200)
  })

  test('never leaks an email', async ({ client, assert }) => {
    const viewer = await createUser('viewer')
    // no fullName — every derived field must fall back to the username
    await createUser('nameless_one')

    const response = await client.get('/api/v1/users/nameless_one').loginAs(viewer)

    const data = body(response)
    assert.equal(data.user.name, '@nameless_one')
    assert.equal(data.user.initials, 'NA')
    // every seeded email ends in @atlas.app — any leak trips this,
    // including the model initials getter's email fallback
    assert.notInclude(JSON.stringify(response.body()), 'atlas.app')
  })

  test('your own username resolves normally', async ({ client, assert }) => {
    const ada = await createUser('ada', 'Ada Lovelace')

    const response = await client.get('/api/v1/users/ada').loginAs(ada)

    response.assertStatus(200)
    assert.equal(body(response).user.username, 'ada')
  })
})
