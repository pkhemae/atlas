import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import FocusSessionService from '#focus/services/focus_session_service'
import FocusSessionTransformer from '#focus/transformers/focus_session_transformer'
import { listSessionsValidator } from '#focus/validators/session'

@inject()
export default class ListSessionsController {
  constructor(private focusSessionService: FocusSessionService) {}

  async handle({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    // on a GET, validateUsing sees the query string through request.all()
    const { month } = await request.validateUsing(listSessionsValidator)
    const sessions = await this.focusSessionService.monthSessions(user, month)

    return serialize(FocusSessionTransformer.transform(sessions))
  }
}
