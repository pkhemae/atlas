import limiter from '@adonisjs/limiter/services/main'
import type { HttpContext } from '@adonisjs/core/http'

import User from '#auth/models/user'
import UserTransformer from '#auth/transformers/user_transformer'
import { loginValidator } from '#auth/validators/user'

export default class SignInController {
  private loginLimiter

  constructor() {
    this.loginLimiter = limiter.use({ requests: 5, duration: '1 min', blockDuration: '1 min' })
  }

  async handle({ request, response, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const key = `login_${request.ip()}_${email}`

    let user: User
    try {
      // penalize only returns the throttle error in the tuple; the callback
      // error (invalid credentials) is re-thrown after consuming a point
      const [throttleError, verifiedUser] = await this.loginLimiter.penalize(key, () => {
        return User.verifyCredentials(email, password)
      })

      if (throttleError) {
        return response.badRequest({
          errors: [
            { message: 'Too many login attempts. Try again shortly.', code: 'E_TOO_MANY_REQUESTS' },
          ],
        })
      }
      user = verifiedUser!
    } catch {
      return response.badRequest({
        errors: [
          {
            message: 'Invalid credentials. Check your email and password.',
            code: 'E_INVALID_CREDENTIALS',
          },
        ],
      })
    }

    const token = await User.accessTokens.create(user, ['*'], {
      name: 'desktop',
      expiresIn: '30 days',
    })

    return serialize({ user: UserTransformer.transform(user), token: token.value!.release() })
  }
}
