import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LevelsRoad } from "@/pages/levels/ui/levels-road";

export function LevelsFeature() {
  // the ladder only changes with deployments — cache it for the session
  const levels = useQuery({
    queryKey: ["focus", "levels"],
    queryFn: () => api.get("/api/v1/focus/levels", {}),
    retry: false,
    staleTime: Infinity,
  });

  // same key as the home card: shared cache, refreshed on focus:completed
  const progression = useQuery({
    queryKey: ["focus", "progression"],
    queryFn: () => api.get("/api/v1/focus/progression", {}),
    retry: false,
  });
  const snapshot = progression.data?.data ?? null;

  return (
    <LevelsRoad
      levels={levels.data?.data ?? []}
      stats={
        snapshot
          ? {
              xp: snapshot.xp,
              tier: snapshot.level.tier,
              division: snapshot.level.division,
              streakDays: snapshot.streakDays,
              multiplier: snapshot.multiplier,
            }
          : null
      }
      currentIndex={snapshot?.level.index ?? null}
      progressPct={
        snapshot
          ? snapshot.xpForLevel === null
            ? 100
            : Math.min(
                100,
                Math.round((snapshot.xpIntoLevel / snapshot.xpForLevel) * 100),
              )
          : 0
      }
      error={levels.isError || progression.isError}
    />
  );
}
