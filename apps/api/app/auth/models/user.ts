import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import { WithPrimaryUuid } from '#core/mixins/with_primary_uuid'
import { WithTimestamps } from '#core/mixins/with_timestamps'
import { appUrl } from '#config/app'

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

  @column()
  declare username: string | null

  @column()
  declare bio: string | null

  @column()
  declare location: string | null

  @column()
  declare avatarPath: string | null

  @column()
  declare bannerPath: string | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  // absolute URLs — the desktop webview is a different origin
  get avatarUrl() {
    return this.avatarPath ? `${appUrl}/uploads/${this.avatarPath}` : null
  }

  get bannerUrl() {
    return this.bannerPath ? `${appUrl}/uploads/${this.bannerPath}` : null
  }

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return (first ?? '').slice(0, 2).toUpperCase()
  }
}
