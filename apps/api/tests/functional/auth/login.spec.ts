import { test } from '@japa/runner'
import limiter from '@adonisjs/limiter/services/main'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'

const CREDENTIALS = {
  fullName: 'Ada Lovelace',
  email: 'ada@atlas.app',
  password: 'secret1234',
}

test.group('Auth / login', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => limiter.clear())

  test('returns a token for valid credentials', async ({ client, assert }) => {
    await User.create({ ...CREDENTIALS })

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: CREDENTIALS.email, password: CREDENTIALS.password })

    response.assertStatus(200)
    const { data } = response.body() as { data: { token: string; user: { email: string } } }
    assert.match(data.token, /^oat_/)
    assert.equal(data.user.email, CREDENTIALS.email)
  })

  test('rejects invalid credentials with a stable code', async ({ client, assert }) => {
    await User.create({ ...CREDENTIALS })

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: CREDENTIALS.email, password: 'wrong-password' })

    response.assertStatus(400)
    const body = response.body() as unknown as { errors: { code: string }[] }
    assert.equal(body.errors[0].code, 'E_INVALID_CREDENTIALS')
  })

  test('throttles after five failed attempts', async ({ client, assert }) => {
    await User.create({ ...CREDENTIALS })

    for (let attempt = 0; attempt < 5; attempt++) {
      await client
        .post('/api/v1/auth/login')
        .json({ email: CREDENTIALS.email, password: 'wrong-password' })
    }

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: CREDENTIALS.email, password: 'wrong-password' })

    response.assertStatus(400)
    const body = response.body() as unknown as { errors: { code: string }[] }
    assert.equal(body.errors[0].code, 'E_TOO_MANY_REQUESTS')
  })
})
