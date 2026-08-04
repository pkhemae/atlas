import type { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'

import { WithPrimaryUuid } from '#core/mixins/with_primary_uuid'
import { WithTimestamps } from '#core/mixins/with_timestamps'
import User from '#auth/models/user'

export default class ResetPasswordToken extends compose(
  BaseModel,
  WithTimestamps,
  WithPrimaryUuid
) {
  @column()
  declare userId: string

  @column()
  declare tokenHash: string

  @column.dateTime()
  declare expiresAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
