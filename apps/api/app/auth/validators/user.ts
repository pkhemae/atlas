import vine from '@vinejs/vine'

/**
 * Shared rule factories, reused across every auth validator.
 */
const email = () => vine.string().trim().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

export const signupValidator = vine.create({
  fullName: vine.string().trim().nullable().optional(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

export const forgotPasswordValidator = vine.create({
  email: email(),
})

export const resetPasswordValidator = vine.create({
  email: email(),
  code: vine.string().trim(),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})
