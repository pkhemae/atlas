import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'

const CREDENTIALS = {
  fullName: 'Ada Lovelace',
  email: 'ada@atlas.app',
  password: 'secret1234',
}

test.group('Auth / logout', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('deletes the current access token', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const token = await User.accessTokens.create(user, ['*'], { name: 'desktop' })

    const response = await client
      .post('/api/v1/auth/logout')
      .header('Authorization', `Bearer ${token.value!.release()}`)

    response.assertStatus(204)
    const remaining = await User.accessTokens.all(user)
    assert.lengthOf(remaining, 0)
  })

  test('rejects unauthenticated requests', async ({ client }) => {
    const response = await client.post('/api/v1/auth/logout')

    response.assertStatus(401)
  })
})
