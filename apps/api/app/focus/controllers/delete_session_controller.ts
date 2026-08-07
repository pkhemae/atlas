import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import FocusSession from '#focus/models/focus_session'
import FocusSessionService from '#focus/services/focus_session_service'

@inject()
export default class DeleteSessionController {
  constructor(private focusSessionService: FocusSessionService) {}

  async handle({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // scoping the query to the owner makes someone else's session a 404
    const session = await FocusSession.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    // the dock owns the live session — deleting it under its feet would
    // strand the timer; settle it first
    if (session.status === 'running' || session.status === 'paused') {
      return response.badRequest({
        errors: [
          {
            message: 'An active session cannot be deleted.',
            code: 'E_INVALID_SESSION_STATE',
          },
        ],
      })
    }

    await this.focusSessionService.remove(session)
    return response.noContent()
  }
}
