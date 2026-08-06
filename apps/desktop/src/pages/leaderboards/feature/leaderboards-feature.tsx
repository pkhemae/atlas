import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  localKey,
  periodStart,
  shiftPeriod,
  type LeaderboardPeriod,
} from "@/lib/focus";
import { useMe } from "@/app/use-me";
import { Leaderboard } from "@/pages/leaderboards/ui/leaderboard";

export function LeaderboardsFeature() {
  const me = useMe();
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const [anchor, setAnchor] = useState(() => new Date());

  // normalized to the period's first day: stable query keys, and the
  // exact anchor the API resolves back to the same bounds
  const anchorStart = periodStart(period, anchor);
  const anchorKey = localKey(anchorStart);
  const atCurrentPeriod =
    anchorKey >= localKey(periodStart(period, new Date()));

  // refreshed by the ["focus"] invalidation when a session completes
  const leaderboard = useQuery({
    queryKey: ["focus", "leaderboard", period, anchorKey],
    queryFn: () =>
      api.get("/api/v1/focus/leaderboard", {
        query: { period, anchor: anchorKey },
      }),
    retry: false,
    // keep the previous board on screen while tab/period switches load
    placeholderData: keepPreviousData,
  });

  return (
    <Leaderboard
      data={leaderboard.data?.data ?? null}
      loading={leaderboard.isPending}
      error={leaderboard.isError}
      myId={me.data?.id ?? null}
      period={period}
      anchorStart={anchorStart}
      nextDisabled={atCurrentPeriod}
      onPeriodChange={(next) => {
        // each tab opens on its current period — never stranded months back
        setPeriod(next);
        setAnchor(new Date());
      }}
      onShift={(delta) => setAnchor(shiftPeriod(period, anchorStart, delta))}
    />
  );
}
