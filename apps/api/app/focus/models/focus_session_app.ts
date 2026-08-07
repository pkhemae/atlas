import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'

import { WithPrimaryUuid } from '#core/mixins/with_primary_uuid'
import { WithTimestamps } from '#core/mixins/with_timestamps'
import FocusSession from '#focus/models/focus_session'

/** One application's share of a completed focus session. */
export default class FocusSessionApp extends compose(BaseModel, WithTimestamps, WithPrimaryUuid) {
  @column()
  declare focusSessionId: string

  @column()
  declare name: string

  /** macOS bundle identifier — the client resolves icons locally from it. */
  @column()
  declare bundleId: string | null

  @column()
  declare seconds: number

  @belongsTo(() => FocusSession)
  declare session: BelongsTo<typeof FocusSession>
}
