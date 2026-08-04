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
