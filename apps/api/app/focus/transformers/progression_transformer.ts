import { BaseTransformer } from '@adonisjs/core/transformers'

import type { ProgressionSnapshot } from '#focus/services/progression'

export default class ProgressionTransformer extends BaseTransformer<ProgressionSnapshot> {
  toObject() {
    return this.pick(this.resource, [
      'xp',
      'level',
      'xpIntoLevel',
      'xpForLevel',
      'streakDays',
      'multiplier',
    ])
  }
}
