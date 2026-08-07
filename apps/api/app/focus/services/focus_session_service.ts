import { DateTime } from 'luxon'

import FocusSession from '#focus/models/focus_session'
import { calculateProgression } from '#focus/services/progression'
import type { ProgressionSnapshot } from '#focus/services/progression'
import type User from '#auth/models/user'

export interface DailyActivity {
  date: string
  totalSeconds: number
}

/** One application's share of a session, as submitted by the client. */
export interface SessionAppUsage {
  name: string
  bundleId?: string | null
  seconds: number
}

export interface RecentSessionApp {
  name: string
  bundleId: string | null
  seconds: number
}

export interface RecentSession {
  id: string
  name: string
  startedAt: string
  durationSeconds: number
  apps: RecentSessionApp[]
}

const RECENT_LIMIT = 3

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

  async rename(session: FocusSession, name: string) {
    session.name = name
    await session.save()
    return session
  }

  /**
   * Deleting a session erases its focus time everywhere derived —
   * activity, XP, streaks, rankings all recompute without it (they are
   * pure reads). App-usage rows follow via the FK cascade.
   */
  async remove(session: FocusSession) {
    await session.delete()
  }

  /**
   * The home page's session feed: the last few completed sessions of the
   * past week, newest first, each with its per-app usage (heaviest
   * first). Lexicographic bound over Lucid's SQLite timestamp format —
   * same dialect note as the leaderboard.
   */
  async recentSessions(user: User): Promise<RecentSession[]> {
    const weekAgo = DateTime.now().minus({ days: 7 }).toFormat('yyyy-MM-dd HH:mm:ss')
    const sessions = await FocusSession.query()
      .where('user_id', user.id)
      .where('status', 'completed')
      .where('started_at', '>=', weekAgo)
      .orderBy('started_at', 'desc')
      .limit(RECENT_LIMIT)
      .preload('apps', (query) => query.orderBy('seconds', 'desc'))

    return sessions.map((session) => ({
      id: session.id,
      name: session.name,
      startedAt: session.startedAt.toISO()!,
      durationSeconds: session.durationSeconds ?? 0,
      apps: session.apps.map(({ name, bundleId, seconds }) => ({ name, bundleId, seconds })),
    }))
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

  /**
   * XP/rank snapshot — a pure fold over dailyActivity, anchored to the
   * server-local date (same toISODate bucketing as the activity days).
   */
  async progression(user: User): Promise<ProgressionSnapshot> {
    const days = await this.dailyActivity(user)
    return calculateProgression(days, DateTime.now().toISODate())
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

  async complete(session: FocusSession, apps?: SessionAppUsage[]) {
    this.#settleCurrentPause(session)
    session.status = 'completed'
    session.endedAt = DateTime.now()
    session.durationSeconds = session.activeSeconds
    await session.save()

    // only a successfully settled session earns usage rows; abandoned
    // sessions never submit any
    if (apps?.length) {
      await session.related('apps').createMany(
        apps.map(({ name, bundleId, seconds }) => ({
          name,
          bundleId: bundleId ?? null,
          seconds,
        }))
      )
    }
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
