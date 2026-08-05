import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'
import limiter from '@adonisjs/limiter/services/main'

import User from '#auth/models/user'
import PasswordResetService from '#auth/services/password_reset_service'
import { verifyResetCodeValidator } from '#auth/validators/user'

@inject()
export default class VerifyResetCodeController {
  private verifyLimiter

  constructor(private passwordResetService: PasswordResetService) {
    this.verifyLimiter = limiter.use({
      requests: 5,
      duration: '1 min',
      blockDuration: '1 min',
    })
  }

  async handle({ request, response }: HttpContext) {
    const { email, code } = await request.validateUsing(verifyResetCodeValidator)

    // same key as ResetPasswordController: checking and consuming the code
    // share a single brute-force budget
    const key = `reset_${request.ip()}_${email}`

    const user = await User.findBy('email', email)

    try {
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
          { message: 'This code is invalid or has expired.', code: 'E_INVALID_OR_EXPIRED_CODE' },
        ],
      })
    }

    return response.noContent()
  }
}
