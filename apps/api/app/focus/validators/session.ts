import vine from '@vinejs/vine'

/**
 * Calendar month being viewed, exactly as the desktop's month cursor
 * emits it ("2025-10"). Kept a static compile so Tuyau can infer the
 * request type (a validator factory breaks that inference).
 */
export const listSessionsValidator = vine.create({
  month: vine
    .string()
    .trim()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/),
})
