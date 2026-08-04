import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'

const CREDENTIALS = {
  fullName: 'Ada Lovelace',
  email: 'ada@atlas.app',
  password: 'secret1234',
}

test.group('Auth / me', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('returns the authenticated user without an envelope', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const response = await client.get('/api/v1/auth/me').loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.email, CREDENTIALS.email)
    assert.equal(body.initials, 'AL')
    assert.notProperty(body, 'data')
    assert.notProperty(body, 'password')
  })

  test('rejects unauthenticated requests', async ({ client }) => {
    const response = await client.get('/api/v1/auth/me')

    response.assertStatus(401)
  })
})
