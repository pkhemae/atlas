/**
 * Minimum-duration filter for the sessions calendar, persisted locally
 * like the theme and language preferences. Values are seconds; 0 means
 * "show everything".
 */
export const MIN_DURATION_OPTIONS = [0, 300, 600, 1800, 3600] as const;

export type MinDuration = (typeof MIN_DURATION_OPTIONS)[number];

export const DEFAULT_MIN_DURATION: MinDuration = 600;

const STORAGE_KEY = "atlas.sessions.minDuration";

export function loadMinDuration(): MinDuration {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return DEFAULT_MIN_DURATION;
  const value = Number(raw);
  return (
    MIN_DURATION_OPTIONS.find((option) => option === value) ??
    DEFAULT_MIN_DURATION
  );
}

export function saveMinDuration(value: MinDuration): void {
  localStorage.setItem(STORAGE_KEY, String(value));
}
