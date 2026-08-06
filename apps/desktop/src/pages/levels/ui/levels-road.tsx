import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type TierId } from "@/lib/focus";
import {
  BADGE_SIZE,
  LevelBadge,
  type BadgeState,
} from "@/pages/levels/ui/level-badge";

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

/* Road geometry: badges snake across the full height of the page on a
 * sine wave, far apart — the distance is the point. */
const SPACING = 240;
const PAD_X = 100;
const COLUMN_WIDTH = 112; // w-28 badge column
const SHAPE_HALF = BADGE_SIZE / 2;
const PAD_TOP = 64;
const PAD_BOTTOM = 132; // shape half + the labels hanging below

function waveFraction(i: number) {
  return 0.5 + 0.45 * Math.sin(i * 1.15);
}

const TIER_STROKE = {
  bronze: "var(--tier-bronze-glow)",
  silver: "var(--tier-silver-glow)",
  gold: "var(--tier-gold-glow)",
  platinum: "var(--tier-platinum-glow)",
  diamond: "var(--tier-diamond-glow)",
} as const;

const DASHED_STROKE = "color-mix(in srgb, var(--foreground) 20%, transparent)";

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
  const [height, setHeight] = useState(0);

  // the serpentine needs real pixels: measure the road's height
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const observer = new ResizeObserver(() => setHeight(scroller.clientHeight));
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  // land with the current badge centered (scrollIntoView could scroll
  // the page vertically too — set scrollLeft by hand instead)
  useEffect(() => {
    const scroller = scrollerRef.current;
    const badge = currentRef.current;
    if (!scroller || !badge) return;
    scroller.scrollLeft =
      badge.offsetLeft - (scroller.clientWidth - badge.offsetWidth) / 2;
  }, [levels.length, currentIndex, height]);

  const totalWidth = PAD_X * 2 + Math.max(0, levels.length - 1) * SPACING;
  const band = Math.max(0, height - PAD_TOP - PAD_BOTTOM);
  const centers = levels.map((_, i): [number, number] => [
    PAD_X + i * SPACING,
    PAD_TOP + waveFraction(i) * band,
  ]);

  return (
    <main className="bg-background flex h-svh flex-col pt-12 pb-4">
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
        className="scrollbar-none min-h-0 flex-1 overflow-x-auto overflow-y-hidden"
      >
        {height > 0 && (
          <div className="relative h-full" style={{ width: `${totalWidth}px` }}>
            <svg
              aria-hidden="true"
              className="absolute inset-0"
              width={totalWidth}
              height={height}
              viewBox={`0 0 ${totalWidth} ${height}`}
            >
              {levels.slice(1).map((level, i) => {
                const [ax, ay] = centers[i]!;
                const [bx, by] = centers[i + 1]!;
                // center-to-center S-curve with horizontal tangents: the
                // badges paint over the ends, so the joins can't gap
                const mx = (ax + bx) / 2;
                const d = `M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`;
                const segment =
                  currentIndex === null || level.index > currentIndex + 1
                    ? "future"
                    : level.index === currentIndex + 1
                      ? "partial"
                      : "done";
                return (
                  <Fragment key={level.index}>
                    {segment === "done" ? (
                      <path
                        d={d}
                        fill="none"
                        stroke={TIER_STROKE[level.tier]}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    ) : (
                      <>
                        <path
                          d={d}
                          fill="none"
                          stroke={DASHED_STROKE}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray="1 12"
                        />
                        {segment === "partial" && (
                          // pathLength normalizes the curve to 100 units,
                          // so the dash IS the percentage
                          <path
                            d={d}
                            fill="none"
                            pathLength={100}
                            stroke={TIER_STROKE[level.tier]}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray={`${progressPct} 100`}
                          />
                        )}
                      </>
                    )}
                  </Fragment>
                );
              })}
            </svg>
            {levels.map((level, i) => {
              const state = badgeState(level.index, currentIndex);
              const [x, y] = centers[i]!;
              return (
                <div
                  key={level.index}
                  ref={state === "current" ? currentRef : undefined}
                  className="animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards absolute duration-500"
                  style={{
                    left: x - COLUMN_WIDTH / 2,
                    top: y - SHAPE_HALF,
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  <LevelBadge
                    tier={level.tier}
                    division={level.division}
                    cumulative={level.cumulative}
                    state={state}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
