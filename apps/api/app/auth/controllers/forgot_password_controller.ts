import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'
import limiter from '@adonisjs/limiter/services/main'
import mail from '@adonisjs/mail/services/main'

import User from '#auth/models/user'
import PasswordResetService from '#auth/services/password_reset_service'
import ResetPasswordNotification from '#auth/mails/reset_password_notification'
import { forgotPasswordValidator } from '#auth/validators/user'

@inject()
export default class ForgotPasswordController {
  private sendLimiter

  constructor(private passwordResetService: PasswordResetService) {
    this.sendLimiter = limiter.use({
      requests: 3,
      duration: '15 mins',
      blockDuration: '15 mins',
    })
  }

  async handle({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)

    // every request consumes a point: this throttles email sending itself
    try {
      await this.sendLimiter.consume(`forgot_${request.ip()}_${email}`)
    } catch {
      return response.status(400).send({
        errors: [
          { message: 'Too many reset requests. Try again later.', code: 'E_TOO_MANY_REQUESTS' },
        ],
      })
    }

    const user = await User.findBy('email', email)

    // always answer 204, even for unknown emails, to avoid account enumeration
    if (!user) {
      return response.noContent()
    }

    const { code } = await this.passwordResetService.generateCode(user)
    await mail.send(new ResetPasswordNotification(user, code))

    return response.noContent()
  }
}
