import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import User from '#auth/models/user'
import PublicProfileService from '#users/services/public_profile_service'
import PublicProfileTransformer from '#users/transformers/public_profile_transformer'

@inject()
export default class ShowUserController {
  constructor(private publicProfileService: PublicProfileService) {}

  async handle({ auth, params, response, serialize }: HttpContext) {
    auth.getUserOrFail()

    // usernames are stored lowercase — fold the param so pasted
    // mixed-case handles still resolve
    const username = String(params.username).toLowerCase()
    const user = await User.query().where('username', username).first()
    if (!user) {
      return response.notFound({
        errors: [{ message: 'User not found.', code: 'E_USER_NOT_FOUND' }],
      })
    }

    return serialize(PublicProfileTransformer.transform(await this.publicProfileService.show(user)))
  }
}
