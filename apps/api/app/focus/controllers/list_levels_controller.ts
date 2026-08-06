import type { HttpContext } from '@adonisjs/core/http'

import { LEVELS } from '#focus/services/progression'
import LevelTransformer from '#focus/transformers/level_transformer'

export default class ListLevelsController {
  async handle({ serialize }: HttpContext) {
    // the ladder is static per deployment — no user data involved
    return serialize(LevelTransformer.transform([...LEVELS]))
  }
}
