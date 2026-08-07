import { BaseTransformer } from '@adonisjs/core/transformers'

import type { PublicProfile } from '#users/services/public_profile_service'

export default class PublicProfileTransformer extends BaseTransformer<PublicProfile> {
  toObject() {
    return this.pick(this.resource, ['user', 'progression', 'weeklyRank', 'activity'])
  }
}
