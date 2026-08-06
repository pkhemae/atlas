import vine from '@vinejs/vine'

/**
 * Ranking period + any date inside it ("2026-08-06"). Kept a static
 * compile so Tuyau can infer the request type (a validator factory
 * breaks that inference).
 */
export const leaderboardValidator = vine.create({
  period: vine.enum(['daily', 'weekly', 'monthly'] as const),
  anchor: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})
