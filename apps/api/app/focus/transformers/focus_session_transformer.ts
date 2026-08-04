import { BaseTransformer } from '@adonisjs/core/transformers'

import type FocusSession from '#focus/models/focus_session'

export default class FocusSessionTransformer extends BaseTransformer<FocusSession> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'status',
      'startedAt',
      'endedAt',
      'lastPausedAt',
      'pausedSeconds',
      'durationSeconds',
      'activeSeconds',
    ])
  }
}
