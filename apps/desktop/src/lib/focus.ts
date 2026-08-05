import type { Data } from "@atlas/api/data";

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

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}min`;
  if (minutes > 0) return `${minutes}min ${seconds}s`;
  return `${seconds}s`;
}

/** One day of settled focus, as served by GET /focus/activity. */
export interface ActivityDay {
  date: string;
  totalSeconds: number;
}

/** Local calendar date key (YYYY-MM-DD), matching the API's per-day buckets. */
export function localKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The duration copy used across the profile activity cards ("1h 5min"). */
export function formatTotal(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  if (minutes > 0) return `${minutes}min`;
  return `${totalSeconds}s`;
}

/** Parses a local YYYY-MM-DD key — new Date(string) would read it as UTC. */
function parseKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
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
