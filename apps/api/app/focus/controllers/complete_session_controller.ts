import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import FocusSession from '#focus/models/focus_session'
import FocusSessionService from '#focus/services/focus_session_service'
import FocusSessionTransformer from '#focus/transformers/focus_session_transformer'

@inject()
export default class CompleteSessionController {
  constructor(private focusSessionService: FocusSessionService) {}

  async handle({ auth, params, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    const session = await FocusSession.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    if (session.status !== 'running' && session.status !== 'paused') {
      return response.status(400).send({
        errors: [
          {
            message: 'Only an active session can be completed.',
            code: 'E_INVALID_SESSION_STATE',
          },
        ],
      })
    }

    await this.focusSessionService.complete(session)
    return serialize(FocusSessionTransformer.transform(session))
  }
}
