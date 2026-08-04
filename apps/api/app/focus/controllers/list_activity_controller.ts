import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import FocusSessionService from '#focus/services/focus_session_service'
import FocusActivityTransformer from '#focus/transformers/focus_activity_transformer'

@inject()
export default class ListActivityController {
  constructor(private focusSessionService: FocusSessionService) {}

  async handle({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const activity = await this.focusSessionService.dailyActivity(user)

    return serialize(FocusActivityTransformer.transform(activity))
  }
}
