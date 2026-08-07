import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'

/**
 * Usernames are explicit — User.create never generates one (that lives
 * in the signup flow), and search filters the null ones out anyway.
 */
async function createUser(username: string | null, fullName: string | null = null) {
  return User.create({
    fullName,
    email: `${username ?? 'nameless'}@atlas.app`,
    username,
    password: 'secret1234',
  })
}

interface PublicUserBody {
  id: string
  name: string
  username: string | null
  avatarUrl: string | null
  initials: string
}

function body(response: { body(): unknown }): PublicUserBody[] {
  return (response.body() as unknown as { data: PublicUserBody[] }).data
}

test.group('Users / search', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('requires authentication', async ({ client }) => {
    const response = await client.get('/api/v1/users/search').qs({ q: 'ada' })
    response.assertStatus(401)
  })

  test('rejects a missing, too-short or too-long q', async ({ client }) => {
    const user = await createUser('ada')

    const missing = await client
      .get('/api/v1/users/search')
      .qs({} as never)
      .loginAs(user)
    missing.assertStatus(422)

    const short = await client.get('/api/v1/users/search').qs({ q: 'a' }).loginAs(user)
    short.assertStatus(422)

    const long = await client
      .get('/api/v1/users/search')
      .qs({ q: 'x'.repeat(51) })
      .loginAs(user)
    long.assertStatus(422)
  })

  test('matches username substrings case-insensitively', async ({ client, assert }) => {
    const viewer = await createUser('viewer')
    await createUser('ada', 'Ada Lovelace')
    await createUser('grace', 'Grace Hopper')

    const response = await client.get('/api/v1/users/search').qs({ q: 'ADA' }).loginAs(viewer)

    response.assertStatus(200)
    const data = body(response)
    assert.lengthOf(data, 1)
    assert.equal(data[0]!.username, 'ada')
    assert.equal(data[0]!.name, 'Ada Lovelace')
    assert.equal(data[0]!.initials, 'AL')
  })

  test('matches full names', async ({ client, assert }) => {
    const viewer = await createUser('viewer')
    await createUser('ada', 'Ada Lovelace')

    const response = await client.get('/api/v1/users/search').qs({ q: 'lovel' }).loginAs(viewer)

    const data = body(response)
    assert.lengthOf(data, 1)
    assert.equal(data[0]!.username, 'ada')
  })

  test('excludes the requesting user', async ({ client, assert }) => {
    const viewer = await createUser('ada', 'Ada Lovelace')

    const response = await client.get('/api/v1/users/search').qs({ q: 'ada' }).loginAs(viewer)

    assert.deepEqual(body(response), [])
  })

  test('excludes users without a username', async ({ client, assert }) => {
    const viewer = await createUser('viewer')
    await createUser(null, 'Ada Ghost')

    const response = await client.get('/api/v1/users/search').qs({ q: 'ada' }).loginAs(viewer)

    assert.deepEqual(body(response), [])
  })

  test('caps results and surfaces username-prefix matches first', async ({ client, assert }) => {
    const viewer = await createUser('viewer')
    // 6 prefix matches + 4 substring-only matches = 10 candidates
    for (let i = 0; i < 6; i++) await createUser(`ada_${i}`)
    for (let i = 0; i < 4; i++) await createUser(`x${i}_ada`)

    const response = await client.get('/api/v1/users/search').qs({ q: 'ada' }).loginAs(viewer)

    const data = body(response)
    assert.lengthOf(data, 8)
    // all prefix matches lead, alphabetically
    assert.deepEqual(
      data.slice(0, 6).map((entry) => entry.username),
      ['ada_0', 'ada_1', 'ada_2', 'ada_3', 'ada_4', 'ada_5']
    )
    assert.match(data[6]!.username!, /_ada$/)
  })

  test('never leaks an email', async ({ client, assert }) => {
    const viewer = await createUser('viewer')
    // no fullName: name and initials must both fall back to the username,
    // never to the email local-part (the model getter's trap)
    await createUser('nameless_one')

    const response = await client.get('/api/v1/users/search').qs({ q: 'nameless' }).loginAs(viewer)

    const data = body(response)
    assert.equal(data[0]!.name, '@nameless_one')
    assert.equal(data[0]!.initials, 'NA')
    // every seeded email ends in @atlas.app — any leak trips this
    assert.notInclude(JSON.stringify(response.body()), 'atlas.app')
  })
})
