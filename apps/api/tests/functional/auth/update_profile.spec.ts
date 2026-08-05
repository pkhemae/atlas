import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import drive from '@adonisjs/drive/services/main'
import app from '@adonisjs/core/services/app'

import User from '#auth/models/user'

const CREDENTIALS = {
  fullName: 'Ada Lovelace',
  email: 'ada@atlas.app',
  password: 'secret1234',
}

const AVATAR_FIXTURE = app.makePath('tests/fixtures/avatar.png')

/** Extracts the storage key from an absolute /uploads URL. */
function keyFromUrl(url: string) {
  return url.split('/uploads/')[1]!
}

test.group('Auth / update profile', (group) => {
  let fakeDisk: ReturnType<typeof drive.fake>

  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => {
    fakeDisk = drive.fake('fs')
    return () => drive.restore('fs')
  })

  test('requires authentication', async ({ client }) => {
    const response = await client.patch('/api/v1/auth/me').fields({ fullName: 'X' })
    response.assertStatus(401)
  })

  test('updates text fields and answers without an envelope', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const response = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .fields({ fullName: 'Ada King', bio: 'First programmer.', location: 'London, UK' })

    response.assertStatus(200)
    const body = response.body() as unknown as {
      fullName: string
      bio: string
      location: string
      data?: unknown
    }
    assert.equal(body.fullName, 'Ada King')
    assert.equal(body.bio, 'First programmer.')
    assert.equal(body.location, 'London, UK')
    assert.notProperty(body, 'data')
  })

  test('an empty string clears bio and location', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS, bio: 'Old bio', location: 'Paris' })

    const response = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .fields({ bio: '', location: '' })

    response.assertStatus(200)
    await user.refresh()
    assert.isNull(user.bio)
    assert.isNull(user.location)
  })

  test('leaves untouched fields alone', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS, bio: 'Keep me' })

    const response = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .fields({ location: 'Lyon' })

    response.assertStatus(200)
    await user.refresh()
    assert.equal(user.bio, 'Keep me')
    assert.equal(user.location, 'Lyon')
  })

  test('claims a username, stored lowercase', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const response = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .fields({ username: 'Ada_Dev' })

    response.assertStatus(200)
    const body = response.body() as unknown as { username: string }
    assert.equal(body.username, 'ada_dev')
  })

  test('rejects malformed usernames', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    for (const username of ['ab', 'has space', 'émoji', 'way_too_long_username_here']) {
      const response = await client.patch('/api/v1/auth/me').loginAs(user).fields({ username })
      response.assertStatus(422)
      const body = response.body() as unknown as { errors: { field: string }[] }
      assert.equal(body.errors[0]!.field, 'username')
    }
  })

  test('rejects a username already taken, case-insensitively', async ({ client, assert }) => {
    await User.create({ ...CREDENTIALS, email: 'grace@atlas.app', username: 'ada' })
    const user = await User.create({ ...CREDENTIALS })

    const response = await client.patch('/api/v1/auth/me').loginAs(user).fields({ username: 'Ada' })

    response.assertStatus(422)
    const body = response.body() as unknown as { errors: { field: string }[] }
    assert.equal(body.errors[0]!.field, 'username')
  })

  test('an empty username never unclaims the current one', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS, username: 'ada' })

    const response = await client.patch('/api/v1/auth/me').loginAs(user).fields({ username: '' })

    response.assertStatus(200)
    await user.refresh()
    assert.equal(user.username, 'ada')
  })

  test('re-submitting your own username succeeds', async ({ client }) => {
    const user = await User.create({ ...CREDENTIALS, username: 'ada' })

    const response = await client.patch('/api/v1/auth/me').loginAs(user).fields({ username: 'ada' })

    response.assertStatus(200)
  })

  test('rejects a bio longer than 160 characters', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const response = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .fields({ bio: 'a'.repeat(161) })

    response.assertStatus(422)
    const body = response.body() as unknown as { errors: { field: string }[] }
    assert.equal(body.errors[0]!.field, 'bio')
  })

  test('uploads avatar and banner', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const response = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .file('avatar', AVATAR_FIXTURE)
      .file('banner', AVATAR_FIXTURE)

    response.assertStatus(200)
    const body = response.body() as unknown as { avatarUrl: string; bannerUrl: string }
    assert.include(body.avatarUrl, '/uploads/')
    assert.include(body.bannerUrl, '/uploads/')
    fakeDisk.assertExists(keyFromUrl(body.avatarUrl))
    fakeDisk.assertExists(keyFromUrl(body.bannerUrl))
  })

  test('replacing the avatar deletes the previous file', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const first = await client.patch('/api/v1/auth/me').loginAs(user).file('avatar', AVATAR_FIXTURE)
    const firstKey = keyFromUrl((first.body() as unknown as { avatarUrl: string }).avatarUrl)

    const second = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .file('avatar', AVATAR_FIXTURE)
    second.assertStatus(200)
    const secondKey = keyFromUrl((second.body() as unknown as { avatarUrl: string }).avatarUrl)

    assert.notEqual(firstKey, secondKey)
    fakeDisk.assertExists(secondKey)
    fakeDisk.assertMissing(firstKey)
  })

  test('an empty avatar field removes the photo and its file', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const upload = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .file('avatar', AVATAR_FIXTURE)
    const key = keyFromUrl((upload.body() as unknown as { avatarUrl: string }).avatarUrl)

    const response = await client.patch('/api/v1/auth/me').loginAs(user).fields({ avatar: '' })

    response.assertStatus(200)
    const body = response.body() as unknown as { avatarUrl: string | null }
    assert.isNull(body.avatarUrl)
    fakeDisk.assertMissing(key)
  })

  test('accepts a pure JSON body — the client sends JSON when no file is attached', async ({
    client,
    assert,
  }) => {
    const user = await User.create({ ...CREDENTIALS })

    const response = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .json({ fullName: 'Ada JSON', bio: 'json path', avatar: null })

    response.assertStatus(200)
    const body = response.body() as unknown as { fullName: string; bio: string }
    assert.equal(body.fullName, 'Ada JSON')
    assert.equal(body.bio, 'json path')
  })

  test('mixed multipart: removes the avatar while uploading a banner', async ({
    client,
    assert,
  }) => {
    const user = await User.create({ ...CREDENTIALS })
    const upload = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .file('avatar', AVATAR_FIXTURE)
    const avatarKey = keyFromUrl((upload.body() as unknown as { avatarUrl: string }).avatarUrl)

    // tuyau serializes { avatar: null, banner: File } as multipart with an
    // empty avatar field — three libraries' defaults have to line up here
    const response = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .fields({ avatar: '' })
      .file('banner', AVATAR_FIXTURE)

    response.assertStatus(200)
    const body = response.body() as unknown as {
      avatarUrl: string | null
      bannerUrl: string | null
    }
    assert.isNull(body.avatarUrl)
    assert.include(body.bannerUrl!, '/uploads/')
    fakeDisk.assertMissing(avatarKey)
  })

  test('rejects an oversized or non-image file by extension', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const response = await client
      .patch('/api/v1/auth/me')
      .loginAs(user)
      .file('avatar', app.makePath('package.json'))

    response.assertStatus(422)
    const body = response.body() as unknown as { errors: { field: string }[] }
    assert.equal(body.errors[0]!.field, 'avatar')
  })
})
