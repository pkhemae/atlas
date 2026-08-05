import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'
import limiter from '@adonisjs/limiter/services/main'

import User from '#auth/models/user'
import PasswordResetService from '#auth/services/password_reset_service'
import { resetPasswordValidator } from '#auth/validators/user'

@inject()
export default class ResetPasswordController {
  private verifyLimiter

  constructor(private passwordResetService: PasswordResetService) {
    this.verifyLimiter = limiter.use({
      requests: 5,
      duration: '1 min',
      blockDuration: '1 min',
    })
  }

  async handle({ request, response }: HttpContext) {
    const { email, code, password } = await request.validateUsing(resetPasswordValidator)
    const key = `reset_${request.ip()}_${email}`

    const user = await User.findBy('email', email)

    try {
      // penalize consumes a point only on failure — a short typed code is
      // guessable without this throttle
      const [throttleError] = await this.verifyLimiter.penalize(key, async () => {
        const resetToken = user ? await this.passwordResetService.verifyCode(user, code) : null
        if (!resetToken) {
          throw new Error('E_INVALID_OR_EXPIRED_CODE')
        }
        return resetToken
      })

      if (throttleError) {
        return response.badRequest({
          errors: [
            { message: 'Too many attempts. Try again shortly.', code: 'E_TOO_MANY_REQUESTS' },
          ],
        })
      }
    } catch {
      return response.badRequest({
        errors: [
          {
            message: 'This code is invalid or has expired.',
            code: 'E_INVALID_OR_EXPIRED_CODE',
          },
        ],
      })
    }

    // the code checked out, so user is guaranteed here
    const owner = user!
    owner.password = password
    await owner.save()

    await this.passwordResetService.deleteTokens(owner)

    // a password reset invalidates every existing session on other devices
    const tokens = await User.accessTokens.all(owner)
    for (const token of tokens) {
      await User.accessTokens.delete(owner, token.identifier)
    }

    await this.passwordResetService.clearRateLimits(request.ip(), owner.email)

    return response.noContent()
  }
}
