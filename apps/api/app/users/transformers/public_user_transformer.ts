import { BaseTransformer } from '@adonisjs/core/transformers'

import type { PublicUser } from '#auth/services/public_user'

export default class PublicUserTransformer extends BaseTransformer<PublicUser> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'username', 'avatarUrl', 'initials'])
  }
}
