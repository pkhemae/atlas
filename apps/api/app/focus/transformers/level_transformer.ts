import { BaseTransformer } from '@adonisjs/core/transformers'

import type { LevelRow } from '#focus/services/progression'

export default class LevelTransformer extends BaseTransformer<LevelRow> {
  toObject() {
    return this.pick(this.resource, ['index', 'tier', 'division', 'xpForLevel', 'cumulative'])
  }
}
