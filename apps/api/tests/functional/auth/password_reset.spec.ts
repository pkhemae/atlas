import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import limiter from '@adonisjs/limiter/services/main'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'
import ResetPasswordToken from '#auth/models/reset_password_token'
import ResetPasswordNotification from '#auth/mails/reset_password_notification'
import PasswordResetService from '#auth/services/password_reset_service'
import { TokenUtils } from '#core/utils/token_utils'

const CREDENTIALS = {
  fullName: 'Ada Lovelace',
  email: 'ada@atlas.app',
  password: 'secret1234',
}

test.group('Auth / password reset', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => limiter.clear())
  group.each.teardown(() => mail.restore())

  test('sends a reset email and stores only a hash of the code', async ({ client, assert }) => {
    const { mails } = mail.fake()
    const user = await User.create({ ...CREDENTIALS })

    const response = await client
      .post('/api/v1/auth/forgot-password')
      .json({ email: CREDENTIALS.email })

    response.assertStatus(204)
    mails.assertSent(ResetPasswordNotification)

    const row = await ResetPasswordToken.query().where('user_id', user.id).firstOrFail()
    assert.lengthOf(row.tokenHash, 64)
    assert.isTrue(row.expiresAt > DateTime.now())
  })

  test('renders the code in the email', async ({ assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new PasswordResetService()
    const { code } = await service.generateCode(user)

    const email = new ResetPasswordNotification(user, code)
    await email.buildWithContents()

    email.message.assertTo(user.email)
    email.message.assertSubject('Reset your Atlas password')
    email.message.assertHtmlIncludes(code)
    assert.match(code, /^[0-9A-F]{5}-[0-9A-F]{5}$/)
  })

  test('does not reveal unknown emails', async ({ client, assert }) => {
    const { mails } = mail.fake()

    const response = await client
      .post('/api/v1/auth/forgot-password')
      .json({ email: 'unknown@atlas.app' })

    response.assertStatus(204)
    mails.assertNotSent(ResetPasswordNotification)
    assert.lengthOf(await ResetPasswordToken.all(), 0)
  })

  test('resets the password with a valid code and invalidates it', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new PasswordResetService()
    const { code } = await service.generateCode(user)

    const row = await ResetPasswordToken.query().where('user_id', user.id).firstOrFail()
    assert.notEqual(row.tokenHash, code)
    assert.equal(row.tokenHash, TokenUtils.hashToken(code.replace('-', '')))

    const response = await client.post('/api/v1/auth/reset-password').json({
      email: CREDENTIALS.email,
      code,
      password: 'brand-new-pass1',
      passwordConfirmation: 'brand-new-pass1',
    })
    response.assertStatus(204)

    const oldLogin = await client
      .post('/api/v1/auth/login')
      .json({ email: CREDENTIALS.email, password: CREDENTIALS.password })
    oldLogin.assertStatus(400)

    const newLogin = await client
      .post('/api/v1/auth/login')
      .json({ email: CREDENTIALS.email, password: 'brand-new-pass1' })
    newLogin.assertStatus(200)

    const reuse = await client.post('/api/v1/auth/reset-password').json({
      email: CREDENTIALS.email,
      code,
      password: 'yet-another-pass1',
      passwordConfirmation: 'yet-another-pass1',
    })
    reuse.assertStatus(400)
    const body = reuse.body() as unknown as { errors: { code: string }[] }
    assert.equal(body.errors[0].code, 'E_INVALID_OR_EXPIRED_CODE')
  })

  test('rejects an expired code', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new PasswordResetService()
    const { code } = await service.generateCode(user)

    await ResetPasswordToken.query()
      .where('user_id', user.id)
      .update({ expires_at: DateTime.now().minus({ minutes: 1 }).toSQL() })

    const response = await client.post('/api/v1/auth/reset-password').json({
      email: CREDENTIALS.email,
      code,
      password: 'brand-new-pass1',
      passwordConfirmation: 'brand-new-pass1',
    })

    response.assertStatus(400)
    const body = response.body() as unknown as { errors: { code: string }[] }
    assert.equal(body.errors[0].code, 'E_INVALID_OR_EXPIRED_CODE')
  })

  test('invalidates existing access tokens on reset', async ({ client }) => {
    const user = await User.create({ ...CREDENTIALS })
    const accessToken = await User.accessTokens.create(user, ['*'], { name: 'desktop' })
    const bearer = accessToken.value!.release()

    const service = new PasswordResetService()
    const { code } = await service.generateCode(user)

    const before = await client.get('/api/v1/auth/me').header('Authorization', `Bearer ${bearer}`)
    before.assertStatus(200)

    const reset = await client.post('/api/v1/auth/reset-password').json({
      email: CREDENTIALS.email,
      code,
      password: 'brand-new-pass1',
      passwordConfirmation: 'brand-new-pass1',
    })
    reset.assertStatus(204)

    const after = await client.get('/api/v1/auth/me').header('Authorization', `Bearer ${bearer}`)
    after.assertStatus(401)
  })

  test('throttles code verification after five failed attempts', async ({ client, assert }) => {
    await User.create({ ...CREDENTIALS })

    for (let attempt = 0; attempt < 5; attempt++) {
      await client.post('/api/v1/auth/reset-password').json({
        email: CREDENTIALS.email,
        code: 'AAAAA-AAAAA',
        password: 'brand-new-pass1',
        passwordConfirmation: 'brand-new-pass1',
      })
    }

    const response = await client.post('/api/v1/auth/reset-password').json({
      email: CREDENTIALS.email,
      code: 'AAAAA-AAAAA',
      password: 'brand-new-pass1',
      passwordConfirmation: 'brand-new-pass1',
    })

    response.assertStatus(400)
    const body = response.body() as unknown as { errors: { code: string }[] }
    assert.equal(body.errors[0].code, 'E_TOO_MANY_REQUESTS')
  })

  test('verifies a valid code without consuming it', async ({ client }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new PasswordResetService()
    const { code } = await service.generateCode(user)

    const first = await client
      .post('/api/v1/auth/verify-reset-code')
      .json({ email: CREDENTIALS.email, code })
    first.assertStatus(204)

    // verifying must not burn the code: it is consumed by the reset only
    const second = await client
      .post('/api/v1/auth/verify-reset-code')
      .json({ email: CREDENTIALS.email, code })
    second.assertStatus(204)

    const reset = await client.post('/api/v1/auth/reset-password').json({
      email: CREDENTIALS.email,
      code,
      password: 'brand-new-pass1',
      passwordConfirmation: 'brand-new-pass1',
    })
    reset.assertStatus(204)
  })

  test('rejects an invalid code on verify', async ({ client, assert }) => {
    await User.create({ ...CREDENTIALS })

    const response = await client
      .post('/api/v1/auth/verify-reset-code')
      .json({ email: CREDENTIALS.email, code: 'AAAAA-AAAAA' })

    response.assertStatus(400)
    const body = response.body() as unknown as { errors: { code: string }[] }
    assert.equal(body.errors[0].code, 'E_INVALID_OR_EXPIRED_CODE')
  })

  test('shares the throttle budget between verify and reset', async ({ client, assert }) => {
    await User.create({ ...CREDENTIALS })

    for (let attempt = 0; attempt < 5; attempt++) {
      await client
        .post('/api/v1/auth/verify-reset-code')
        .json({ email: CREDENTIALS.email, code: 'AAAAA-AAAAA' })
    }

    // the 6th failed attempt hits the reset endpoint: same limiter key
    const response = await client.post('/api/v1/auth/reset-password').json({
      email: CREDENTIALS.email,
      code: 'AAAAA-AAAAA',
      password: 'brand-new-pass1',
      passwordConfirmation: 'brand-new-pass1',
    })

    response.assertStatus(400)
    const body = response.body() as unknown as { errors: { code: string }[] }
    assert.equal(body.errors[0].code, 'E_TOO_MANY_REQUESTS')
  })

  test('unblocks the login throttle after a successful reset', async ({ client }) => {
    const user = await User.create({ ...CREDENTIALS })

    for (let attempt = 0; attempt < 6; attempt++) {
      await client
        .post('/api/v1/auth/login')
        .json({ email: CREDENTIALS.email, password: 'wrong-password' })
    }

    const service = new PasswordResetService()
    const { code } = await service.generateCode(user)

    const reset = await client.post('/api/v1/auth/reset-password').json({
      email: CREDENTIALS.email,
      code,
      password: 'brand-new-pass1',
      passwordConfirmation: 'brand-new-pass1',
    })
    reset.assertStatus(204)

    const login = await client
      .post('/api/v1/auth/login')
      .json({ email: CREDENTIALS.email, password: 'brand-new-pass1' })
    login.assertStatus(200)
  })
})
