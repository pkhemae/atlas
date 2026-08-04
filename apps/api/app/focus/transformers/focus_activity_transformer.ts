import { BaseTransformer } from '@adonisjs/core/transformers'

import type { DailyActivity } from '#focus/services/focus_session_service'

export default class FocusActivityTransformer extends BaseTransformer<DailyActivity> {
  toObject() {
    return this.pick(this.resource, ['date', 'totalSeconds'])
  }
}
