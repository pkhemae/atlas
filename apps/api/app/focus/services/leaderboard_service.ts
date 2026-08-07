import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

import FocusSession from '#focus/models/focus_session'
import User from '#auth/models/user'
import { publicUser } from '#auth/services/public_user'
import type { PublicUser } from '#auth/services/public_user'
import { calculateProgression } from '#focus/services/progression'
import type { Level } from '#focus/services/progression'

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly'

export interface LeaderboardUser extends PublicUser {
  level: Level
}

export interface LeaderboardEntry {
  /** 1-based row position in the full ordered aggregate. */
  rank: number
  totalSeconds: number
  user: LeaderboardUser
}

export interface LeaderboardSnapshot {
  period: LeaderboardPeriod
  /** Inclusive first day of the period, server-local YYYY-MM-DD. */
  start: string
  /** Inclusive LAST day of the period. */
  end: string
  top: LeaderboardEntry[]
  /** null = no settled focus in the period (unranked). */
  me: { rank: number; totalSeconds: number } | null
  /** Window around me, MY row included; empty when in the top or unranked. */
  neighbors: LeaderboardEntry[]
}

/**
 * How Lucid writes SQLite timestamps ('2026-08-04 19:16:47', local time) —
 * range bounds must use the same shape so the comparison stays lexicographic
 * and the started_at index does the work without SQL date math. Revisit on
 * the Postgres dialect switch.
 */
const SQLITE_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'

const TOP_SIZE = 10
const NEIGHBOR_SPAN = 3

const PERIOD_UNIT = { daily: 'day', weekly: 'week', monthly: 'month' } as const

export default class LeaderboardService {
  /**
   * Ranks every user's settled focus inside the period holding `anchor`.
   * Date math stays in Luxon (house stance) — SQL only aggregates. The
   * whole aggregate is small (hundreds of users), so ranking happens in
   * JS off a single query.
   */
  async snapshot(
    user: User,
    period: LeaderboardPeriod,
    anchor: DateTime
  ): Promise<LeaderboardSnapshot> {
    // clamp future anchors to today: a client clock ahead of the server
    // must degrade to the current period, never 400 the default view
    const today = DateTime.now().startOf('day')
    const day = anchor.startOf('day') > today ? today : anchor.startOf('day')

    // Luxon startOf('week') is ISO Monday — the leaderboard's FIXED
    // competition week for everyone; deliberately different from the
    // home chart's Sunday-started weeks
    const unit = PERIOD_UNIT[period]
    const start = day.startOf(unit)
    const end = start.plus({ [`${unit}s`]: 1 })

    const rows = await db
      .from('focus_sessions')
      .whereNotNull('duration_seconds')
      .where('started_at', '>=', start.toFormat(SQLITE_DATETIME_FORMAT))
      .where('started_at', '<', end.toFormat(SQLITE_DATETIME_FORMAT))
      .groupBy('user_id')
      .select('user_id')
      .sum('duration_seconds as total_seconds')
      .orderBy('total_seconds', 'desc')
      // deterministic ties; uuid v7 is time-ordered ⇒ earlier signup wins
      .orderBy('user_id', 'asc')

    const ranking = rows.map((row, i) => ({
      userId: row.user_id as string,
      totalSeconds: Number(row.total_seconds),
      rank: i + 1,
    }))

    const myIndex = ranking.findIndex((entry) => entry.userId === user.id)
    const me =
      myIndex === -1 ? null : { rank: myIndex + 1, totalSeconds: ranking[myIndex]!.totalSeconds }

    const top = ranking.slice(0, TOP_SIZE)
    // window around me, trimmed at both boundaries, never overlapping the
    // top — my own row is included so the client renders a contiguous list
    const neighbors =
      myIndex >= TOP_SIZE
        ? ranking.slice(Math.max(TOP_SIZE, myIndex - NEIGHBOR_SPAN), myIndex + NEIGHBOR_SPAN + 1)
        : []

    const shown = [...top, ...neighbors]
    const users = await User.query().whereIn(
      'id',
      shown.map((entry) => entry.userId)
    )
    const levels = await this.#levelsFor(users.map((u) => u.id))
    const byId = new Map(users.map((u) => [u.id, u]))

    const toEntry = (entry: (typeof ranking)[number]): LeaderboardEntry => ({
      rank: entry.rank,
      totalSeconds: entry.totalSeconds,
      user: { ...publicUser(byId.get(entry.userId)!), level: levels.get(entry.userId)! },
    })

    return {
      period,
      start: start.toISODate()!,
      end: end.minus({ days: 1 }).toISODate()!,
      top: top.map(toEntry),
      me,
      neighbors: neighbors.map(toEntry),
    }
  }

  /** Level chips for the shown users: one query, JS grouping, pure folds. */
  async #levelsFor(userIds: string[]): Promise<Map<string, Level>> {
    if (userIds.length === 0) return new Map()

    const sessions = await FocusSession.query()
      .whereIn('user_id', userIds)
      .whereNotNull('duration_seconds')
      .select('user_id', 'started_at', 'duration_seconds')

    const byUser = new Map<string, Map<string, number>>()
    for (const session of sessions) {
      const days = byUser.get(session.userId) ?? new Map<string, number>()
      const date = session.startedAt.toISODate()!
      days.set(date, (days.get(date) ?? 0) + session.durationSeconds!)
      byUser.set(session.userId, days)
    }

    const today = DateTime.now().toISODate()!
    const levels = new Map<string, Level>()
    for (const id of userIds) {
      const days = [...(byUser.get(id) ?? new Map<string, number>())].map(
        ([date, totalSeconds]) => ({ date, totalSeconds })
      )
      levels.set(id, calculateProgression(days, today).level)
    }
    return levels
  }
}
