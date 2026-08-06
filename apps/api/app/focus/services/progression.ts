import { DateTime } from 'luxon'

import type { DailyActivity } from '#focus/services/focus_session_service'

/*
 * Pure, deterministic progression math: XP is a fold over the user's
 * daily activity — no stored XP column, no scheduled decay job. Every
 * read re-scores the full history, so changing any constant here
 * retroactively rebalances everyone (that is the tuning lever).
 *
 * All percentage math is done in integers so no float dust ever
 * reaches the serialized JSON.
 */

/** A day counts as "worked" from 10 focused minutes. */
export const ACTIVE_DAY_THRESHOLD_SECONDS = 600
export const XP_PER_MINUTE = 1
/** Each consecutive worked day beyond the first adds +5%… */
export const STREAK_BONUS_PCT = 5
/** …capped at ×1.5 (reached on the 11th day). */
export const STREAK_CAP_PCT = 150
/** Idle day n of a run costs min(10n, 60) XP — soft first, then steep. */
export const DECAY_PER_IDLE_DAY = 10
export const DECAY_DAILY_CAP = 60

export const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const
export type Tier = (typeof TIERS)[number]

export interface Level {
  index: number
  tier: Tier
  division: 1 | 2 | 3
}

export interface ProgressionSnapshot {
  xp: number
  level: Level
  /** The level the current bar fills toward; null at the apex. */
  nextLevel: Level | null
  xpIntoLevel: number
  /** XP required to leave this level; null at the apex (Diamond III). */
  xpForLevel: number | null
  streakDays: number
  /** The rate applying to today's earnings (prospective if idle so far). */
  multiplier: number
}

/**
 * Per-level XP requirements, division I lowest. Requirements grow
 * ~1.33-1.5× per level: the apex sits at 39,800 cumulative XP — about
 * 660 hours of base-rate focus, hundreds of hours even fully streaked.
 */
const LEVEL_XP = [
  100,
  150,
  200, // bronze I-III
  300,
  450,
  650, // silver I-III
  950,
  1400,
  2000, // gold I-III
  2900,
  4200,
  6000, // platinum I-III
  8500,
  12000, // diamond I-II
  null, // diamond III — apex
] as const

interface LevelRow extends Level {
  xpForLevel: number | null
  cumulative: number
}

export const LEVELS: readonly LevelRow[] = LEVEL_XP.map((xpForLevel, i) => ({
  index: i + 1,
  tier: TIERS[Math.floor(i / 3)]!,
  division: ((i % 3) + 1) as 1 | 2 | 3,
  xpForLevel,
  cumulative: LEVEL_XP.slice(0, i).reduce<number>((sum, xp) => sum + (xp ?? 0), 0),
}))

export function levelFromXp(
  xp: number
): Pick<ProgressionSnapshot, 'level' | 'nextLevel' | 'xpIntoLevel' | 'xpForLevel'> {
  let row = LEVELS[0]!
  for (const candidate of LEVELS) {
    if (xp >= candidate.cumulative) row = candidate
  }
  const next = LEVELS[row.index] ?? null // index is 1-based: LEVELS[index] IS the next row
  return {
    level: { index: row.index, tier: row.tier, division: row.division },
    nextLevel: next ? { index: next.index, tier: next.tier, division: next.division } : null,
    xpIntoLevel: xp - row.cumulative,
    xpForLevel: row.xpForLevel,
  }
}

function streakPct(streak: number): number {
  return Math.min(100 + STREAK_BONUS_PCT * (streak - 1), STREAK_CAP_PCT)
}

/**
 * Folds the (sparse) daily activity into a progression snapshot.
 * `today` is the server-local ISO date — passed in so tests own the
 * clock. Today's earnings count live, but today never decays and never
 * resets the streak: only fully-elapsed idle days do.
 */
export function calculateProgression(days: DailyActivity[], today: string): ProgressionSnapshot {
  const byDate = new Map<string, number>()
  for (const day of days) {
    if (day.date > today) continue // defensive: the future never scores
    byDate.set(day.date, (byDate.get(day.date) ?? 0) + day.totalSeconds)
  }
  const dates = [...byDate.keys()].sort()

  let xp = 0
  let streak = 0
  let idleRun = 0

  if (dates.length > 0) {
    const last = DateTime.fromISO(today)
    for (
      let cursor = DateTime.fromISO(dates[0]!);
      cursor <= last;
      cursor = cursor.plus({ days: 1 })
    ) {
      const date = cursor.toISODate()!
      const seconds = byDate.get(date) ?? 0
      // a day is binary: under the threshold it earns nothing AND (once
      // elapsed) counts as idle; over it, every minute counts
      if (seconds >= ACTIVE_DAY_THRESHOLD_SECONDS) {
        idleRun = 0
        streak += 1
        xp += Math.round((Math.floor(seconds / 60) * XP_PER_MINUTE * streakPct(streak)) / 100)
      } else if (date < today) {
        streak = 0
        idleRun += 1
        xp = Math.max(0, xp - Math.min(DECAY_PER_IDLE_DAY * idleRun, DECAY_DAILY_CAP))
      }
      // date === today and not (yet) worked: no-op — the streak shown is
      // yesterday's run, at risk until today is worked or ends
    }
  }

  const workedToday = (byDate.get(today) ?? 0) >= ACTIVE_DAY_THRESHOLD_SECONDS
  const multiplier = streakPct(workedToday ? streak : streak + 1) / 100

  return { xp, ...levelFromXp(xp), streakDays: streak, multiplier }
}
