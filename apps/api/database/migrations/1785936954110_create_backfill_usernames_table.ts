import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Data migration: accounts created before default usernames existed get
 * one derived from their email, same rules as UsernameService.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const users = await db.from('users').whereNull('username').select('id', 'email')
      const rows = await db.from('users').whereNotNull('username').select('username')
      const taken = new Set<string>(rows.map((row) => row.username))

      for (const user of users) {
        const base = String(user.email)
          .split('@')[0]!
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 20)

        let candidate = base.length >= 3 ? base : `user_${base}`.slice(0, 20)
        while (taken.has(candidate)) {
          const suffix = String(Math.floor(1000 + Math.random() * 9000))
          candidate = `${candidate.slice(0, 20 - suffix.length)}${suffix}`
        }

        taken.add(candidate)
        await db.from('users').where('id', user.id).update({ username: candidate })
      }
    })
  }

  async down() {
    // backfilled data stays — nothing structural to revert
  }
}
