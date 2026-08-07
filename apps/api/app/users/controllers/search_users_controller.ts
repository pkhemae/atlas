import type { HttpContext } from '@adonisjs/core/http'

import User from '#auth/models/user'
import { publicUser } from '#auth/services/public_user'
import PublicUserTransformer from '#users/transformers/public_user_transformer'
import { searchUsersValidator } from '#users/validators/search'

const RESULT_LIMIT = 8

export default class SearchUsersController {
  async handle({ auth, request, serialize }: HttpContext) {
    const me = auth.getUserOrFail()
    const { q } = await request.validateUsing(searchUsersValidator)
    // usernames are stored lowercase, so the lowercased needle makes LIKE
    // effectively case-insensitive for them; full_name folding is
    // ASCII-only on SQLite (é ≠ É) — accepted until the Postgres switch.
    // `%`/`_` in the needle act as wildcards (whereILike has no ESCAPE):
    // benign over-matching, bounded by the limit and the throttle.
    const needle = q.toLowerCase()

    const users = await User.query()
      // you already have home for yourself
      .whereNot('id', me.id)
      // no username = no /u/:username page to open
      .whereNotNull('username')
      .where((sub) =>
        sub.whereILike('username', `%${needle}%`).orWhereILike('full_name', `%${needle}%`)
      )
      // username-prefix matches read as the intended hits — surface them first
      .orderByRaw('case when username like ? then 0 else 1 end', [`${needle}%`])
      .orderBy('username', 'asc')
      .limit(RESULT_LIMIT)

    return serialize(PublicUserTransformer.transform(users.map(publicUser)))
  }
}
