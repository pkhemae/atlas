import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'

import { WithPrimaryUuid } from '#core/mixins/with_primary_uuid'
import { WithTimestamps } from '#core/mixins/with_timestamps'
import User from '#auth/models/user'

// inlined as literals so the tuyau-inferred client type stays a plain
// string union instead of leaking a server-side TS enum
export type FocusSessionStatus = 'running' | 'paused' | 'completed' | 'abandoned'

export default class FocusSession extends compose(BaseModel, WithTimestamps, WithPrimaryUuid) {
  @column()
  declare userId: string

  @column()
  declare name: string

  @column()
  declare status: FocusSessionStatus

  @column.dateTime()
  declare startedAt: DateTime

  @column.dateTime()
  declare endedAt: DateTime | null

  @column.dateTime()
  declare lastPausedAt: DateTime | null

  @column()
  declare pausedSeconds: number

  @column()
  declare durationSeconds: number | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Active (non-paused) time at this instant. For finished sessions this
   * equals the frozen duration; for live ones it keeps counting.
   */
  get activeSeconds() {
    const end = this.endedAt ?? DateTime.now()
    const currentPause =
      this.status === 'paused' && this.lastPausedAt
        ? DateTime.now().diff(this.lastPausedAt, 'seconds').seconds
        : 0

    return Math.max(
      0,
      Math.round(end.diff(this.startedAt, 'seconds').seconds - this.pausedSeconds - currentPause)
    )
  }
}
