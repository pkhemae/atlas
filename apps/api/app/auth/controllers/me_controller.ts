import type { HttpContext } from '@adonisjs/core/http'

import UserTransformer from '#auth/transformers/user_transformer'

export default class MeController {
  async show({ auth, serialize }: HttpContext) {
    return await serialize.withoutWrapping(UserTransformer.transform(auth.getUserOrFail()))
  }
}
