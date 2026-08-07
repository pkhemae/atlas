import vine from '@vinejs/vine'

/**
 * Per-app usage submitted when completing a session. Kept a static
 * compile so Tuyau can infer the request type (a validator factory
 * breaks that inference).
 */
export const renameSessionValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(80),
})

export const completeSessionValidator = vine.create({
  apps: vine
    .array(
      vine.object({
        name: vine.string().trim().minLength(1).maxLength(120),
        bundleId: vine.string().trim().maxLength(160).nullable().optional(),
        seconds: vine
          .number()
          .withoutDecimals()
          .min(0)
          .max(24 * 3600),
      })
    )
    .maxLength(40)
    .optional(),
})
