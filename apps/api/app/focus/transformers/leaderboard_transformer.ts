import { BaseTransformer } from '@adonisjs/core/transformers'

import type { LeaderboardSnapshot } from '#focus/services/leaderboard_service'

export default class LeaderboardTransformer extends BaseTransformer<LeaderboardSnapshot> {
  toObject() {
    return this.pick(this.resource, ['period', 'start', 'end', 'top', 'me', 'neighbors'])
  }
}
