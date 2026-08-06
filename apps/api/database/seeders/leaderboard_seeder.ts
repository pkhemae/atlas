import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

import User from '#auth/models/user'
import FocusSession from '#focus/models/focus_session'

const DAYS_BACK = 70

/**
 * Rivals for the leaderboard: ~24 users with focus histories of varying
 * intensity, so daily/weekly/monthly rankings all have content. Additive-
 * safe (existing emails are reused, not duplicated).
 *
 * CAUTION: once rivals exist, the focus seeder's "most recently created
 * user" fallback would target one of them — always run it with
 * SEED_USER_EMAIL, or run seeders individually with --files.
 */
const RIVALS: [username: string, fullName: string][] = [
  ['heaven', 'Heaven Dubois'],
  ['optimike', 'Mike Ortega'],
  ['mathys', 'Mathys Laurent'],
  ['kamal', 'Kamal Benali'],
  ['guermabd', 'Abdel Guermat'],
  ['clement', 'Clément Roche'],
  ['maryam', 'Maryam Haddad'],
  ['badro', 'Badr Oulhaj'],
  ['kezro', 'Kenza Rousseau'],
  ['malik', 'Malik Diarra'],
  ['slk', 'Salim Khelifi'],
  ['blake', 'Blake Grosfield'],
  ['ada', 'Ada Moreau'],
  ['grace', 'Grace Fontaine'],
  ['linus', 'Linus Bergman'],
  ['margaux', 'Margaux Petit'],
  ['noah', 'Noah Lambert'],
  ['lea', 'Léa Girard'],
  ['hugo', 'Hugo Marchand'],
  ['ines', 'Inès Toumi'],
  ['sacha', 'Sacha Weber'],
  ['emma', 'Emma Blanchet'],
  ['tom', 'Tom Delacroix'],
  ['yuna', 'Yuna Lefevre'],
]

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    let created = 0
    let sessionCount = 0

    for (const [username, fullName] of RIVALS) {
      const email = `${username}@atlas.app`
      const existing = await User.findBy('email', email)
      if (existing) continue

      const user = await User.create({
        fullName,
        email,
        username,
        password: 'secret1234',
      })
      created++

      // per-rival intensity: some grind daily, some barely show up
      const focusProbability = 0.3 + Math.random() * 0.6
      const sessions: Partial<FocusSession>[] = []
      const today = DateTime.now().startOf('day')

      for (let daysAgo = DAYS_BACK; daysAgo >= 0; daysAgo--) {
        if (Math.random() > focusProbability) continue

        const day = today.minus({ days: daysAgo })
        const count = pickSessionCount()
        let cursor = day.plus({
          hours: randomBetween(7, 12),
          minutes: randomBetween(0, 59),
        })

        for (let i = 0; i < count; i++) {
          const durationSeconds = randomBetween(30, 240) * 60
          const pausedSeconds = Math.random() < 0.4 ? randomBetween(1, 10) * 60 : 0
          const endedAt = cursor.plus({ seconds: durationSeconds + pausedSeconds })

          sessions.push({
            userId: user.id,
            status: 'completed',
            startedAt: cursor,
            endedAt,
            lastPausedAt: null,
            pausedSeconds,
            durationSeconds,
          })

          cursor = endedAt.plus({ minutes: randomBetween(30, 120) })
        }
      }

      await FocusSession.createMany(sessions)
      sessionCount += sessions.length
    }

    console.log(`seeded ${created} rivals with ${sessionCount} sessions`)
  }
}

function randomBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pickSessionCount() {
  const roll = Math.random()
  if (roll < 0.5) return 1
  if (roll < 0.85) return 2
  return 3
}
