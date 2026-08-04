import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

import User from '#auth/models/user'
import FocusSession from '#focus/models/focus_session'

const DAYS_BACK = 180
const FOCUS_DAY_PROBABILITY = 0.65

/**
 * Fills the activity graph with realistic history: on ~2 days out of 3,
 * one to three completed sessions of 1h–4h each. Additive — re-running
 * stacks more sessions on top of what exists.
 *
 * Targets SEED_USER_EMAIL, or the most recently created user by default.
 */
export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    const email = process.env.SEED_USER_EMAIL
    const user = email
      ? await User.findByOrFail('email', email)
      : await User.query().orderBy('created_at', 'desc').firstOrFail()

    const sessions: Partial<FocusSession>[] = []
    const today = DateTime.now().startOf('day')

    for (let daysAgo = DAYS_BACK; daysAgo >= 1; daysAgo--) {
      if (Math.random() > FOCUS_DAY_PROBABILITY) continue

      const day = today.minus({ days: daysAgo })
      const count = pickSessionCount()
      // first session starts mid-morning, the next ones after a break
      let cursor = day.plus({ hours: randomBetween(8, 11), minutes: randomBetween(0, 59) })

      for (let i = 0; i < count; i++) {
        const durationSeconds = randomBetween(60, 240) * 60
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
    console.log(`seeded ${sessions.length} sessions for ${user.email}`)
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
