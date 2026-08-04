import type { HttpContext } from '@adonisjs/core/http'

import User from '#auth/models/user'

export default class SignOutController {
  async handle({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return response.noContent()
  }
}
