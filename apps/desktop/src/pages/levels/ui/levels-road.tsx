import { Fragment, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@atlas/ui/lib/utils";
import { type TierId } from "@/lib/focus";
import { LevelBadge, type BadgeState } from "@/pages/levels/ui/level-badge";

export interface RoadLevel {
  index: number;
  tier: TierId;
  division: 1 | 2 | 3;
  cumulative: number;
}

interface LevelsRoadProps {
  levels: RoadLevel[];
  /** The user's current level index, or null while loading. */
  currentIndex: number | null;
  /** 0-100 fill of the segment toward the next level. */
  progressPct: number;
  error: boolean;
}

// literal classes — the Tailwind scanner can't see template strings
const TIER_SEGMENT = {
  bronze: "bg-[image:var(--tier-bronze)]",
  silver: "bg-[image:var(--tier-silver)]",
  gold: "bg-[image:var(--tier-gold)]",
  platinum: "bg-[image:var(--tier-platinum)]",
  diamond: "bg-[image:var(--tier-diamond)]",
} as const;

function badgeState(index: number, currentIndex: number | null): BadgeState {
  if (currentIndex === null || index > currentIndex) return "locked";
  return index === currentIndex ? "current" : "done";
}

export function LevelsRoad({
  levels,
  currentIndex,
  progressPct,
  error,
}: LevelsRoadProps) {
  const { t } = useTranslation();
  const scrollerRef = useRef<HTMLElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  // land with the current badge centered (scrollIntoView could scroll
  // the page vertically too — set scrollLeft by hand instead)
  useEffect(() => {
    const scroller = scrollerRef.current;
    const badge = currentRef.current;
    if (!scroller || !badge) return;
    scroller.scrollLeft =
      badge.offsetLeft - (scroller.clientWidth - badge.offsetWidth) / 2;
  }, [levels.length, currentIndex]);

  return (
    <main className="bg-background min-h-svh pt-12 pb-8">
      <div className="px-6">
        <h2 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
          {t("levels.heading")}
        </h2>
        {error && (
          <p className="text-muted-foreground text-xs font-medium">
            {t("levels.error")}
          </p>
        )}
      </div>
      <section
        ref={scrollerRef}
        aria-label={t("levels.ariaLabel")}
        className="scrollbar-none mt-12 overflow-x-auto"
      >
        <div className="flex w-max items-start px-10">
          {levels.map((level, i) => {
            const state = badgeState(level.index, currentIndex);
            // the segment left of this badge tells whether this level
            // has been reached, is being worked toward, or lies ahead
            const segment =
              currentIndex === null || level.index > currentIndex + 1
                ? "future"
                : level.index === currentIndex + 1
                  ? "partial"
                  : "done";
            return (
              <Fragment key={level.index}>
                {i > 0 && (
                  <div
                    aria-hidden="true"
                    className="mt-[31px] h-0.5 w-16 shrink-0"
                  >
                    {segment === "done" ? (
                      <div className={cn("h-full", TIER_SEGMENT[level.tier])} />
                    ) : (
                      <div className="relative h-full">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-foreground/15" />
                        {segment === "partial" && (
                          <div
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-full",
                              TIER_SEGMENT[level.tier],
                            )}
                            style={{ width: `${progressPct}%` }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div
                  ref={state === "current" ? currentRef : undefined}
                  className="animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards duration-500"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <LevelBadge
                    tier={level.tier}
                    division={level.division}
                    cumulative={level.cumulative}
                    state={state}
                  />
                </div>
              </Fragment>
            );
          })}
        </div>
      </section>
    </main>
  );
}
