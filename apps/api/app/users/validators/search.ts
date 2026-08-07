import vine from '@vinejs/vine'

/**
 * Kept a static compile so Tuyau can infer the request type (a validator
 * factory breaks that inference). minLength 2 matches the client's typing
 * gate — a single-char `LIKE '%a%'` buys nothing.
 */
export const searchUsersValidator = vine.create({
  q: vine.string().trim().minLength(2).maxLength(50),
})
