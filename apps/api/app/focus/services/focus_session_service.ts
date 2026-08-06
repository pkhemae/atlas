import { DateTime } from 'luxon'

import FocusSession from '#focus/models/focus_session'
import type User from '#auth/models/user'

export interface DailyActivity {
  date: string
  totalSeconds: number
}

/**
 * How Lucid writes SQLite timestamps ('2026-08-04 19:16:47', local time) —
 * range bounds must use the same shape so the comparison stays lexicographic
 * and the (user_id, started_at) index does the work without SQL date math.
 */
const SQLITE_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'

export default class FocusSessionService {
  async start(user: User) {
    await this.abandonActive(user)

    // The default name is per-user sequential. "Session" is deliberately
    // the same word in English and French, so the stored default reads
    // natively in every supported language; users will rename later. Two
    // concurrent starts could mint the same N — harmless (no unique
    // constraint) and unreachable with a single desktop client per user.
    const [row] = await FocusSession.query().where('user_id', user.id).count('* as total')
    const name = `Session ${Number(row!.$extras.total) + 1}`

    // explicit nulls so a fresh session serializes every field of the
    // contract instead of omitting the untouched ones
    return FocusSession.create({
      userId: user.id,
      name,
      status: 'running',
      startedAt: DateTime.now(),
      endedAt: null,
      lastPausedAt: null,
      pausedSeconds: 0,
      durationSeconds: null,
    })
  }

  /**
   * Settled sessions (completed AND abandoned — both carry a frozen
   * duration) whose start falls inside the given server-local month
   * ("2025-10"). The calendar buckets a session on the day it started,
   * the same convention as dailyActivity. Half-open interval.
   */
  async monthSessions(user: User, month: string): Promise<FocusSession[]> {
    const start = DateTime.fromFormat(month, 'yyyy-MM').startOf('month')
    const end = start.plus({ months: 1 })

    return FocusSession.query()
      .where('user_id', user.id)
      .whereIn('status', ['completed', 'abandoned'])
      .where('started_at', '>=', start.toFormat(SQLITE_DATETIME_FORMAT))
      .where('started_at', '<', end.toFormat(SQLITE_DATETIME_FORMAT))
      .orderBy('started_at', 'asc')
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
