import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'

const CREDENTIALS = {
  fullName: 'Ada Lovelace',
  email: 'ada@atlas.app',
  password: 'secret1234',
}

test.group('Focus / list levels', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('requires authentication', async ({ client }) => {
    const response = await client.get('/api/v1/focus/levels')
    response.assertStatus(401)
  })

  test('serves the full 15-level ladder', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const response = await client.get('/api/v1/focus/levels').loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as {
      data: {
        index: number
        tier: string
        division: number
        xpForLevel: number | null
        cumulative: number
      }[]
    }
    assert.lengthOf(data, 15)
    assert.deepEqual(data[0], {
      index: 1,
      tier: 'bronze',
      division: 1,
      xpForLevel: 100,
      cumulative: 0,
    })
    assert.deepEqual(data[14], {
      index: 15,
      tier: 'diamond',
      division: 3,
      xpForLevel: null,
      cumulative: 39800,
    })
    for (let i = 1; i < data.length; i++) {
      assert.isAbove(data[i]!.cumulative, data[i - 1]!.cumulative)
    }
  })
})
