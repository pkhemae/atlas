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

export const verifyResetCodeValidator = vine.create({
  email: email(),
  code: vine.string().trim(),
})

export const resetPasswordValidator = vine.create({
  email: email(),
  code: vine.string().trim(),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

/**
 * The unique() check must exclude the requesting user (re-submitting your
 * own username never conflicts with yourself) — the id arrives through
 * validation metadata so the validator itself stays a static compile
 * (a factory would break Tuyau's request-type inference).
 */
export const updateProfileValidator = vine.withMetaData<{ userId: string }>().create({
  fullName: vine.string().trim().minLength(1).maxLength(100).nullable().optional(),
  username: vine
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/)
    .unique({
      table: 'users',
      column: 'username',
      caseInsensitive: true,
      filter: (query, _value, field) => {
        query.whereNot('id', (field.meta as { userId: string }).userId)
      },
    })
    .nullable()
    .optional(),
  bio: vine.string().trim().maxLength(160).nullable().optional(),
  location: vine.string().trim().maxLength(100).nullable().optional(),
  // nullable: an empty multipart field arrives as null and removes the image
  avatar: vine
    .file({ size: '2mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] })
    .nullable()
    .optional(),
  banner: vine
    .file({ size: '4mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] })
    .nullable()
    .optional(),
})
