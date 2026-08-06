import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@atlas/ui/components/tabs";
import { type LeaderboardPeriod } from "@/lib/focus";
import {
  LeaderboardRow,
  type LeaderboardEntry,
} from "@/pages/leaderboards/ui/leaderboard-row";
import { PeriodNav } from "@/pages/leaderboards/ui/period-nav";

export interface LeaderboardData {
  period: string;
  start: string;
  end: string;
  top: LeaderboardEntry[];
  me: { rank: number; totalSeconds: number } | null;
  neighbors: LeaderboardEntry[];
}

interface LeaderboardProps {
  data: LeaderboardData | null;
  loading: boolean;
  error: boolean;
  myId: string | null;
  period: LeaderboardPeriod;
  anchorStart: Date;
  nextDisabled: boolean;
  onPeriodChange: (period: LeaderboardPeriod) => void;
  onShift: (delta: 1 | -1) => void;
}

export function Leaderboard({
  data,
  loading,
  error,
  myId,
  period,
  anchorStart,
  nextDisabled,
  onPeriodChange,
  onShift,
}: LeaderboardProps) {
  const { t } = useTranslation();

  const row = (entry: LeaderboardEntry) => (
    <LeaderboardRow
      key={entry.user.id}
      entry={entry}
      isMe={entry.user.id === myId}
    />
  );

  return (
    <main className="min-h-svh px-6 pt-12 pb-8">
      <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto w-full max-w-3xl duration-500">
        <h2 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
          {t("leaderboards.heading")}
        </h2>
        <div className="mb-3 flex items-center justify-between gap-3">
          {/* triggers-only segmented control: the single list below swaps
              with the value, there is no per-tab panel to point at */}
          <Tabs
            value={period}
            onValueChange={(value) =>
              onPeriodChange(value as LeaderboardPeriod)
            }
          >
            <TabsList
              aria-label={t("leaderboards.tabsLabel")}
              className="bg-foreground/[0.04]"
            >
              <TabsTrigger value="daily">
                {t("leaderboards.tabs.daily")}
              </TabsTrigger>
              <TabsTrigger value="weekly">
                {t("leaderboards.tabs.weekly")}
              </TabsTrigger>
              <TabsTrigger value="monthly">
                {t("leaderboards.tabs.monthly")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <PeriodNav
            period={period}
            anchorStart={anchorStart}
            nextDisabled={nextDisabled}
            onShift={onShift}
          />
        </div>
        {/* blended into the page background — no card surface, like the
            levels road */}
        <section aria-label={t("leaderboards.ariaLabel")}>
          {error ? (
            <p className="text-muted-foreground py-4 text-xs font-medium">
              {t("leaderboards.error")}
            </p>
          ) : !data ? (
            // structure first, no skeleton — the board pops in when loaded
            <div
              aria-hidden="true"
              className={loading ? "min-h-40" : undefined}
            />
          ) : data.top.length === 0 ? (
            <p className="text-muted-foreground py-4 text-xs font-medium">
              {t("leaderboards.empty")}
            </p>
          ) : (
            <>
              <ol className="divide-foreground/5 divide-y">
                {data.top.map(row)}
              </ol>
              {/* only present when I'm ranked beyond the top 10 */}
              {data.neighbors.length > 0 && (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div
                      aria-hidden="true"
                      className="bg-foreground/5 h-px flex-1"
                    />
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                      {t("leaderboards.yourPosition")}
                    </span>
                    <div
                      aria-hidden="true"
                      className="bg-foreground/5 h-px flex-1"
                    />
                  </div>
                  <ol className="divide-foreground/5 divide-y">
                    {data.neighbors.map(row)}
                  </ol>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
