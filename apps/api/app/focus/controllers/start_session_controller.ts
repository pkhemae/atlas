import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import FocusSessionService from '#focus/services/focus_session_service'
import FocusSessionTransformer from '#focus/transformers/focus_session_transformer'

@inject()
export default class StartSessionController {
  constructor(private focusSessionService: FocusSessionService) {}

  async handle({ auth, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const session = await this.focusSessionService.start(user)

    response.status(201)
    return serialize(FocusSessionTransformer.transform(session))
  }
}
