import type { Data } from "@atlas/api/data";
import i18n, { currentLocale } from "@/i18n";

export type FocusSession = Data.Focus.FocusSession;

/**
 * Drift-free elapsed active seconds, recomputed from the session's server
 * timestamps at every tick — never accumulated client-side.
 */
export function elapsedSeconds(session: FocusSession, nowMs: number): number {
  const startedMs = Date.parse(session.startedAt ?? "");
  if (Number.isNaN(startedMs)) return 0;

  const end =
    session.status === "paused" && session.lastPausedAt
      ? Date.parse(session.lastPausedAt)
      : nowMs;

  return Math.max(
    0,
    Math.floor((end - startedMs) / 1000 - session.pausedSeconds),
  );
}

export function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Contribution-graph intensity level for a day's total (0..4). */
export function levelFor(seconds: number): number {
  if (seconds <= 0) return 0;
  if (seconds < 30 * 60) return 1;
  if (seconds < 90 * 60) return 2;
  if (seconds < 180 * 60) return 3;
  return 4;
}

/**
 * Sunday-started weeks covering the last 6 months, GitHub-style:
 * full first week, last one cut at today.
 */
export function buildWeeks(now: Date): Date[][] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  start.setMonth(start.getMonth() - ACTIVITY_WINDOW_MONTHS);
  start.setDate(start.getDate() + 1);
  start.setDate(start.getDate() - start.getDay());

  const weeks: Date[][] = [];
  let current: Date[] = [];
  for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const day = new Date(d);
    if (day.getDay() === 0 && current.length > 0) {
      weeks.push(current);
      current = [];
    }
    current.push(day);
  }
  if (current.length > 0) weeks.push(current);
  return weeks;
}

/** Shared by buildWeeks and the graph copy so window and text can't drift. */
export const ACTIVITY_WINDOW_MONTHS = 6;

export function monthLabels(
  weeks: Date[][],
): { index: number; label: string }[] {
  const labels: { index: number; label: string }[] = [];
  weeks.forEach((week, index) => {
    const first = week[0];
    if (!first) return;
    const month = first.getMonth();
    if (month !== weeks[index - 1]?.[0]?.getMonth()) {
      labels.push({
        index,
        label: first.toLocaleDateString(currentLocale(), { month: "short" }),
      });
    }
  });
  // a label hugging the left edge gets overlapped by the next one — drop it
  const [first, second] = labels;
  if (first && second && second.index - first.index < 3) {
    labels.shift();
  }
  return labels;
}

/** Sum of daily totals from firstKey (inclusive, YYYY-MM-DD) onwards. */
export function totalSince(days: ActivityDay[], firstKey: string): number {
  return days
    .filter((day) => day.date >= firstKey)
    .reduce((sum, day) => sum + day.totalSeconds, 0);
}

/** Division 1..3 → Roman numeral for rank display ("Gold II"). */
export function romanDivision(division: number): string {
  return ["I", "II", "III"][division - 1] ?? String(division);
}

export type LeaderboardPeriod = "daily" | "weekly" | "monthly";

/**
 * Start of the ISO (Monday) week — the leaderboard's fixed competition
 * week shared by every user; deliberately different from the home
 * chart's Sunday-started weeks (weeklyTotals).
 */
export function isoWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

/** First day of the leaderboard period holding `date`. */
export function periodStart(period: LeaderboardPeriod, date: Date): Date {
  if (period === "weekly") return isoWeekStart(date);
  if (period === "monthly") {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The adjacent period, anchored on its first day. */
export function shiftPeriod(
  period: LeaderboardPeriod,
  date: Date,
  delta: 1 | -1,
): Date {
  const start = periodStart(period, date);
  if (period === "monthly") {
    return new Date(start.getFullYear(), start.getMonth() + delta, 1);
  }
  const days = period === "weekly" ? 7 : 1;
  return new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + delta * days,
  );
}

/** Tier ids as served by the API — display names live in the catalogs. */
export type TierId = "bronze" | "silver" | "gold" | "platinum" | "diamond";

// record lookup — a template-literal key would fight the typed t()
export const TIER_KEYS = {
  bronze: "tiers.bronze",
  silver: "tiers.silver",
  gold: "tiers.gold",
  platinum: "tiers.platinum",
  diamond: "tiers.diamond",
} as const satisfies Record<TierId, string>;

/** Parses a local YYYY-MM-DD key — new Date(string) would read it as UTC. */
export function parseKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

/** "Jun 15" / "15 juin" label for a YYYY-MM-DD week-start key. */
export function weekLabel(weekStart: string): string {
  return parseKey(weekStart).toLocaleDateString(currentLocale(), {
    month: "short",
    day: "numeric",
  });
}

/** "August 2026" / "août 2026" from an ISO timestamp, or null. */
export function memberSince(createdAt: string | null): string | null {
  const parsed = createdAt ? new Date(createdAt) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(currentLocale(), {
    month: "long",
    year: "numeric",
  });
}

/** One day of settled focus, exactly as served by GET /focus/activity. */
export type ActivityDay = Data.Focus.FocusActivity;

/** Local calendar date key (YYYY-MM-DD), matching the API's per-day buckets. */
export function localKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Compact XP display used everywhere XP shows ("1.1k", French "1,1k") —
 * below a thousand the raw number reads better.
 */
export function formatXp(value: number): string {
  if (value < 1000) return value.toLocaleString(currentLocale());
  const compact = (value / 1000).toLocaleString(currentLocale(), {
    maximumFractionDigits: 1,
  });
  return `${compact}k`;
}

/**
 * The duration copy used across the profile activity cards ("1h 5min",
 * French "1 h 5 min") — patterns live in the translation catalogs.
 */
export function formatTotal(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return minutes > 0
      ? i18n.t("duration.hoursMinutes", { h: hours, m: minutes })
      : i18n.t("duration.hours", { h: hours });
  }
  if (minutes > 0) return i18n.t("duration.minutes", { m: minutes });
  return i18n.t("duration.seconds", { s: totalSeconds });
}

/**
 * Total focus per Sunday-started week over the last weekCount weeks,
 * current partial week included — dense, zero-filled, oldest first.
 */
export function weeklyTotals(
  days: ActivityDay[],
  now: Date,
  weekCount = 8,
): { weekStart: string; totalSeconds: number }[] {
  const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  sunday.setDate(sunday.getDate() - sunday.getDay());

  const totals = new Map<string, number>();
  for (let i = weekCount - 1; i >= 0; i--) {
    const start = new Date(sunday);
    start.setDate(start.getDate() - i * 7);
    totals.set(localKey(start), 0);
  }

  for (const day of days) {
    const date = parseKey(day.date);
    date.setDate(date.getDate() - date.getDay());
    const key = localKey(date);
    if (totals.has(key)) totals.set(key, totals.get(key)! + day.totalSeconds);
  }

  return [...totals.entries()].map(([weekStart, totalSeconds]) => ({
    weekStart,
    totalSeconds,
  }));
}
