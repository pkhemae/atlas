import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import LeaderboardService from '#focus/services/leaderboard_service'
import LeaderboardTransformer from '#focus/transformers/leaderboard_transformer'
import { leaderboardValidator } from '#focus/validators/leaderboard'

@inject()
export default class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  async handle({ auth, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    // on a GET, validateUsing sees the query string through request.all()
    const { period, anchor } = await request.validateUsing(leaderboardValidator)

    // the regex admits impossible dates (2026-02-31) — Luxon arbitrates
    const date = DateTime.fromISO(anchor)
    if (!date.isValid) {
      return response.badRequest({
        errors: [{ message: 'anchor is not a valid calendar date', code: 'E_INVALID_ANCHOR' }],
      })
    }

    const snapshot = await this.leaderboardService.snapshot(user, period, date)
    return serialize(LeaderboardTransformer.transform(snapshot))
  }
}
