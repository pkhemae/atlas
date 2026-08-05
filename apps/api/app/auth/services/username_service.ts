import User from '#auth/models/user'

export default class UsernameService {
  /**
   * Derives a unique username from an email's local part: sanitized to
   * the username charset, deduplicated with a random numeric suffix.
   * Every account gets one at signup — claiming later just renames.
   */
  async generateFromEmail(email: string) {
    const base = email
      .split('@')[0]!
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 20)

    let candidate = base.length >= 3 ? base : `user_${base}`.slice(0, 20)

    while (await User.query().where('username', candidate).first()) {
      const suffix = String(Math.floor(1000 + Math.random() * 9000))
      candidate = `${candidate.slice(0, 20 - suffix.length)}${suffix}`
    }

    return candidate
  }
}
