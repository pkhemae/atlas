import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import FocusSession from '#focus/models/focus_session'
import FocusSessionService from '#focus/services/focus_session_service'
import FocusSessionTransformer from '#focus/transformers/focus_session_transformer'

@inject()
export default class ResumeSessionController {
  constructor(private focusSessionService: FocusSessionService) {}

  async handle({ auth, params, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    const session = await FocusSession.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    if (session.status !== 'paused') {
      return response.badRequest({
        errors: [
          { message: 'Only a paused session can be resumed.', code: 'E_INVALID_SESSION_STATE' },
        ],
      })
    }

    await this.focusSessionService.resume(session)
    return serialize(FocusSessionTransformer.transform(session))
  }
}
