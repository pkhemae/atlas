import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import FocusSessionService from '#focus/services/focus_session_service'

/**
 * Called by the desktop main window on boot: any session still active at
 * that point was orphaned by a crash or force-quit.
 */
@inject()
export default class AbandonActiveSessionController {
  constructor(private focusSessionService: FocusSessionService) {}

  async handle({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await this.focusSessionService.abandonActive(user)

    return response.noContent()
  }
}
