import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import FocusSessionService from '#focus/services/focus_session_service'
import ProgressionTransformer from '#focus/transformers/progression_transformer'

@inject()
export default class ProgressionController {
  constructor(private focusSessionService: FocusSessionService) {}

  async handle({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const snapshot = await this.focusSessionService.progression(user)

    return serialize(ProgressionTransformer.transform(snapshot))
  }
}
