import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'

import FocusSession from '#focus/models/focus_session'
import FocusSessionService from '#focus/services/focus_session_service'
import FocusSessionTransformer from '#focus/transformers/focus_session_transformer'
import { renameSessionValidator } from '#focus/validators/session'

@inject()
export default class RenameSessionController {
  constructor(private focusSessionService: FocusSessionService) {}

  async handle({ auth, params, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { name } = await request.validateUsing(renameSessionValidator)

    // scoping the query to the owner makes someone else's session a 404
    const session = await FocusSession.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    await this.focusSessionService.rename(session, name)
    return serialize(FocusSessionTransformer.transform(session))
  }
}
