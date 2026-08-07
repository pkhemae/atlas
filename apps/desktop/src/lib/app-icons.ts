import { invoke } from "@tauri-apps/api/core";

// In-memory, promise-valued cache: one invoke per unique bundle id per
// app run, concurrent callers share the in-flight promise. Icons are
// resolved locally by the Rust side and never persisted anywhere.
const cache = new Map<string, Promise<string | null>>();

export function appIcon(bundleId: string): Promise<string | null> {
  let hit = cache.get(bundleId);
  if (!hit) {
    hit = invoke<string | null>("app_icon", { bundleId })
      .then((value) => value ?? null)
      .catch(() => null);
    cache.set(bundleId, hit);
  }
  return hit;
}
