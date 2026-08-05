import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import User from '#auth/models/user'
import UsernameService from '#auth/services/username_service'
import UserTransformer from '#auth/transformers/user_transformer'
import { signupValidator } from '#auth/validators/user'

@inject()
export default class SignUpController {
  constructor(private usernameService: UsernameService) {}

  async handle({ request, response, serialize }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)
    const user = await User.create({
      fullName: fullName ?? null,
      email,
      password,
      username: await this.usernameService.generateFromEmail(email),
    })

    const token = await User.accessTokens.create(user, ['*'], {
      name: 'desktop',
      expiresIn: '30 days',
    })

    response.status(201)
    return serialize({ user: UserTransformer.transform(user), token: token.value!.release() })
  }
}
