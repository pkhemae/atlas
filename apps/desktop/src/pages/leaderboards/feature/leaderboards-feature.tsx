import { Screen } from "@/components/screen";

// placeholder — the real leaderboards land later
export function LeaderboardsFeature() {
  return (
    <Screen>
      <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center gap-2 text-center duration-500">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Leaderboards
        </p>
        <p className="text-muted-foreground text-sm">
          Compete with other students soon.
        </p>
      </div>
    </Screen>
  );
}
