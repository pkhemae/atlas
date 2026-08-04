import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import { WithPrimaryUuid } from '#core/mixins/with_primary_uuid'
import { WithTimestamps } from '#core/mixins/with_timestamps'

export default class User extends compose(
  BaseModel,
  withAuthFinder(hash),
  WithTimestamps,
  WithPrimaryUuid
) {
  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return (first ?? '').slice(0, 2).toUpperCase()
  }
}
