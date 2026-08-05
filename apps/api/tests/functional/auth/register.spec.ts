import { test } from '@japa/runner'
import limiter from '@adonisjs/limiter/services/main'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'

const CREDENTIALS = {
  fullName: 'Ada Lovelace',
  email: 'ada@atlas.app',
  password: 'secret1234',
}

test.group('Auth / register', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => limiter.clear())

  test('creates an account and returns a token', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/register').json({
      ...CREDENTIALS,
      passwordConfirmation: CREDENTIALS.password,
    })

    response.assertStatus(201)
    const { data } = response.body()
    assert.equal(data.user.email, CREDENTIALS.email)
    assert.equal(data.user.initials, 'AL')
    assert.isString(data.user.id)
    assert.match(data.token, /^oat_/)
    assert.notProperty(data.user, 'password')
  })

  test('generates a default username from the email', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/register').json({
      ...CREDENTIALS,
      passwordConfirmation: CREDENTIALS.password,
    })

    response.assertStatus(201)
    const { data } = response.body()
    assert.equal(data.user.username, 'ada')
  })

  test('suffixes the default username when already taken', async ({ client, assert }) => {
    await User.create({ ...CREDENTIALS, email: 'other@atlas.app', username: 'ada' })

    const response = await client.post('/api/v1/auth/register').json({
      ...CREDENTIALS,
      passwordConfirmation: CREDENTIALS.password,
    })

    response.assertStatus(201)
    const { data } = response.body()
    assert.match(data.user.username!, /^ada\d{4}$/)
  })

  test('rejects duplicate emails', async ({ client, assert }) => {
    await User.create({ ...CREDENTIALS })

    const response = await client.post('/api/v1/auth/register').json({
      ...CREDENTIALS,
      passwordConfirmation: CREDENTIALS.password,
    })

    response.assertStatus(422)
    const body = response.body() as unknown as { errors: { field: string }[] }
    assert.equal(body.errors[0].field, 'email')
  })

  test('rejects mismatched password confirmation', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/register').json({
      ...CREDENTIALS,
      passwordConfirmation: 'not-the-same-1',
    })

    response.assertStatus(422)
    const body = response.body() as unknown as { errors: { field: string }[] }
    assert.equal(body.errors[0].field, 'passwordConfirmation')
  })
})
