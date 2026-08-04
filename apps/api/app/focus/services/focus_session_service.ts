import { DateTime } from 'luxon'

import FocusSession from '#focus/models/focus_session'
import type User from '#auth/models/user'

export interface DailyActivity {
  date: string
  totalSeconds: number
}

export default class FocusSessionService {
  async start(user: User) {
    await this.abandonActive(user)

    // explicit nulls so a fresh session serializes every field of the
    // contract instead of omitting the untouched ones
    return FocusSession.create({
      userId: user.id,
      status: 'running',
      startedAt: DateTime.now(),
      endedAt: null,
      lastPausedAt: null,
      pausedSeconds: 0,
      durationSeconds: null,
    })
  }

  /**
   * Total focus seconds per day, for the activity graph. Only settled
   * sessions count — running/paused ones have no frozen duration yet and
   * will land in their day's bucket once they end. Days are the server's
   * local calendar dates; grouping happens here rather than in SQL so the
   * date math stays in Luxon instead of dialect-specific functions.
   */
  async dailyActivity(user: User): Promise<DailyActivity[]> {
    const sessions = await FocusSession.query()
      .where('user_id', user.id)
      .whereNotNull('duration_seconds')
      .select('started_at', 'duration_seconds')
      .orderBy('started_at', 'asc')

    const totals = new Map<string, number>()
    for (const session of sessions) {
      const date = session.startedAt.toISODate()!
      totals.set(date, (totals.get(date) ?? 0) + session.durationSeconds!)
    }

    return [...totals.entries()].map(([date, totalSeconds]) => ({ date, totalSeconds }))
  }

  async findActive(user: User) {
    return FocusSession.query()
      .where('user_id', user.id)
      .whereIn('status', ['running', 'paused'])
      .first()
  }

  /**
   * Self-healing: a session left active by a crash or force-quit gets
   * closed so a new one can always start. A paused orphan freezes at the
   * moment it was paused; a running orphan can only be counted up to now.
   */
  async abandonActive(user: User) {
    const active = await this.findActive(user)
    if (!active) return

    this.#settleCurrentPause(active)
    active.status = 'abandoned'
    active.endedAt = DateTime.now()
    active.durationSeconds = active.activeSeconds
    await active.save()
  }

  async pause(session: FocusSession) {
    session.status = 'paused'
    session.lastPausedAt = DateTime.now()
    await session.save()
    return session
  }

  async resume(session: FocusSession) {
    this.#settleCurrentPause(session)
    session.status = 'running'
    await session.save()
    return session
  }

  async complete(session: FocusSession) {
    this.#settleCurrentPause(session)
    session.status = 'completed'
    session.endedAt = DateTime.now()
    session.durationSeconds = session.activeSeconds
    await session.save()
    return session
  }

  /**
   * Folds an open pause into pausedSeconds — the server owns all time math.
   */
  #settleCurrentPause(session: FocusSession) {
    if (session.lastPausedAt) {
      session.pausedSeconds += Math.round(
        DateTime.now().diff(session.lastPausedAt, 'seconds').seconds
      )
      session.lastPausedAt = null
    }
  }
}
