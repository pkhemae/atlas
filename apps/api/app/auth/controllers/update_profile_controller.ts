import { randomUUID } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'

import UserTransformer from '#auth/transformers/user_transformer'
import { updateProfileValidator } from '#auth/validators/user'

// SQLite-specific message — revisit on a dialect change (Postgres says
// `duplicate key value violates unique constraint`), or the race would
// surface as a 500 instead of the 422 the client renders inline
function isUsernameConflict(error: unknown) {
  return (
    error instanceof Error && error.message.includes('UNIQUE constraint failed: users.username')
  )
}

export default class UpdateProfileController {
  async handle({ auth, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateProfileValidator, {
      meta: { userId: user.id },
    })

    // only touch the keys the client actually sent
    if (payload.fullName !== undefined) user.fullName = payload.fullName
    if (payload.username !== undefined) user.username = payload.username
    if (payload.bio !== undefined) user.bio = payload.bio
    if (payload.location !== undefined) user.location = payload.location

    // images: a file replaces, an explicit null removes. The new file is
    // moved first and the old one deleted only after the row is saved —
    // a failure in between must never leave the user imageless.
    const oldAvatar = payload.avatar !== undefined ? user.avatarPath : null
    const oldBanner = payload.banner !== undefined ? user.bannerPath : null

    if (payload.avatar) {
      const key = `${user.id}/avatar-${randomUUID()}.${payload.avatar.extname}`
      await drive.use().moveFromFs(payload.avatar.tmpPath!, key)
      user.avatarPath = key
    } else if (payload.avatar === null) {
      user.avatarPath = null
    }

    if (payload.banner) {
      const key = `${user.id}/banner-${randomUUID()}.${payload.banner.extname}`
      await drive.use().moveFromFs(payload.banner.tmpPath!, key)
      user.bannerPath = key
    } else if (payload.banner === null) {
      user.bannerPath = null
    }

    try {
      await user.save()
    } catch (error) {
      if (isUsernameConflict(error)) {
        // the vine check passed but a concurrent writer won the unique
        // index — drop the freshly moved files, answer as a 422
        if (payload.avatar && user.avatarPath)
          await drive
            .use()
            .delete(user.avatarPath)
            .catch(() => {})
        if (payload.banner && user.bannerPath)
          await drive
            .use()
            .delete(user.bannerPath)
            .catch(() => {})
        return response.unprocessableEntity({
          errors: [{ message: 'This username is already taken.', field: 'username' }],
        })
      }
      throw error
    }

    if (oldAvatar)
      await drive
        .use()
        .delete(oldAvatar)
        .catch(() => {})
    if (oldBanner)
      await drive
        .use()
        .delete(oldBanner)
        .catch(() => {})

    return await serialize.withoutWrapping(UserTransformer.transform(user))
  }
}
