import { DateTime } from 'luxon'
import limiter from '@adonisjs/limiter/services/main'

import { TokenUtils } from '#core/utils/token_utils'
import ResetPasswordToken from '#auth/models/reset_password_token'
import type User from '#auth/models/user'

export default class PasswordResetService {
  loginLimiter

  constructor() {
    this.loginLimiter = limiter.use({
      requests: 5,
      duration: '1 min',
      blockDuration: '1 min',
    })
  }

  /**
   * Creates a short reset code the user types into the desktop app.
   * 10 uppercase hex chars (2^40) — brute force is neutralized by the
   * verify limiter, the 30 min expiry and the single active code.
   */
  async generateCode(user: User) {
    const raw = TokenUtils.generateToken(5).toUpperCase()
    const expiresAt = DateTime.now().plus({ minutes: 30 })

    await this.deleteTokens(user)

    await ResetPasswordToken.create({
      userId: user.id,
      tokenHash: TokenUtils.hashToken(raw),
      expiresAt,
    })

    return { code: `${raw.slice(0, 5)}-${raw.slice(5)}`, expiresAt }
  }

  /**
   * Accepts the code however the user typed it (with/without the dash,
   * any case) by canonicalizing to the generated form before hashing.
   */
  async verifyCode(user: User, code: string) {
    const canonical = code.replace(/[^0-9a-f]/gi, '').toUpperCase()

    return ResetPasswordToken.query()
      .where('user_id', user.id)
      .where('token_hash', TokenUtils.hashToken(canonical))
      .andWhere('expires_at', '>', DateTime.now().toSQL()!)
      .first()
  }

  async deleteTokens(user: User) {
    await ResetPasswordToken.query().where('user_id', user.id).delete()
  }

  /**
   * A successful reset unblocks the login throttle so the user can sign
   * in immediately — same key contract as SignInController.
   */
  async clearRateLimits(ip: string, email: string) {
    return this.loginLimiter.delete(this.getRateKey(ip, email))
  }

  getRateKey(ip: string, email: string) {
    return `login_${ip}_${email}`
  }
}
