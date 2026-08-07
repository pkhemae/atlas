import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import FocusSessionService from '#focus/services/focus_session_service'
import RecentSessionTransformer from '#focus/transformers/recent_session_transformer'

@inject()
export default class RecentSessionsController {
  constructor(private focusSessionService: FocusSessionService) {}

  async handle({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const sessions = await this.focusSessionService.recentSessions(user)

    return serialize(RecentSessionTransformer.transform(sessions))
  }
}
