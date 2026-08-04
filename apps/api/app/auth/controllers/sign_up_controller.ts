import type { HttpContext } from '@adonisjs/core/http'

import User from '#auth/models/user'
import UserTransformer from '#auth/transformers/user_transformer'
import { signupValidator } from '#auth/validators/user'

export default class SignUpController {
  async handle({ request, response, serialize }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)
    const user = await User.create({ fullName: fullName ?? null, email, password })

    const token = await User.accessTokens.create(user, ['*'], {
      name: 'desktop',
      expiresIn: '30 days',
    })

    response.status(201)
    return serialize({ user: UserTransformer.transform(user), token: token.value!.release() })
  }
}
