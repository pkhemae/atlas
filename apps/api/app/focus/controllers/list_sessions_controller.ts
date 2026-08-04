import type { HttpContext } from '@adonisjs/core/http'

import FocusSession from '#focus/models/focus_session'
import FocusSessionTransformer from '#focus/transformers/focus_session_transformer'

export default class ListSessionsController {
  async handle({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    const sessions = await FocusSession.query()
      .where('user_id', user.id)
      .orderBy('started_at', 'desc')

    return serialize(FocusSessionTransformer.transform(sessions))
  }
}
