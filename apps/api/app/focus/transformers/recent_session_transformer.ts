import { BaseTransformer } from '@adonisjs/core/transformers'

import type { RecentSession } from '#focus/services/focus_session_service'

export default class RecentSessionTransformer extends BaseTransformer<RecentSession> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'startedAt', 'durationSeconds', 'apps'])
  }
}
