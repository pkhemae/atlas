import { useEffect, useRef } from "react";
import { frontmostApp } from "@/lib/app-usage";

const SAMPLE_INTERVAL_MS = 5_000;
const MAX_APPS = 30; // client-side cap, below the API's 40

export interface SampledApp {
  name: string;
  bundleId: string | null;
  seconds: number;
}

/**
 * Samples the frontmost app while the session RUNS — a paused session
 * accumulates nothing, mirroring pausedSeconds. Each tick credits the
 * full interval to the app frontmost at tick time (approximation by
 * design). Accumulation lives in a ref so re-renders never reset it;
 * a reload/HMR of the dock webview does lose it — the session itself
 * recovers, its app data restarts from zero. Accepted.
 */
export function useAppSampler(running: boolean) {
  const usage = useRef(new Map<string, SampledApp>());

  useEffect(() => {
    if (!running) return;
    const id = setInterval(async () => {
      // sampling must never disturb the session — failures are silent
      const app = await frontmostApp().catch(() => null);
      if (!app) return;
      const key = app.bundleId ?? app.name;
      const entry = usage.current.get(key) ?? {
        name: app.name,
        bundleId: app.bundleId,
        seconds: 0,
      };
      entry.seconds += SAMPLE_INTERVAL_MS / 1000;
      usage.current.set(key, entry);
    }, SAMPLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [running]);

  const snapshot = (): SampledApp[] =>
    [...usage.current.values()]
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, MAX_APPS);

  const reset = () => {
    usage.current = new Map();
  };

  return { snapshot, reset };
}
