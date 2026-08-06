import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@atlas/ui/lib/utils";
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
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  // the arrows only show when that direction actually has more road
  const updateArrows = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const left = scroller.scrollLeft > 8;
    const right =
      scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 8;
    setCanScroll((previous) =>
      previous.left === left && previous.right === right
        ? previous
        : { left, right },
    );
  };

  const nudge = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    scroller?.scrollBy({
      left: direction * scroller.clientWidth * 0.6,
      behavior: "smooth",
    });
  };

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
    updateArrows();
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
      <div className="relative min-h-0 flex-1">
        <section
          ref={scrollerRef}
          aria-label={t("levels.ariaLabel")}
          onScroll={updateArrows}
          className="scrollbar-none h-full overflow-x-auto overflow-y-hidden"
        >
          {height > 0 && (
            <div
              className="relative h-full"
              style={{ width: `${totalWidth}px` }}
            >
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

        {/* edge fades: hidden road dissolves into the background */}
        <div
          aria-hidden="true"
          className={cn(
            "from-background pointer-events-none absolute inset-y-0 left-0 z-[5] w-20 bg-linear-to-r to-transparent transition-opacity duration-300",
            canScroll.left ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            "from-background pointer-events-none absolute inset-y-0 right-0 z-[5] w-20 bg-linear-to-l to-transparent transition-opacity duration-300",
            canScroll.right ? "opacity-100" : "opacity-0",
          )}
        />

        {/* floating chevrons: only when that direction has more road */}
        <button
          type="button"
          aria-label={t("levels.scrollLeft")}
          aria-hidden={!canScroll.left}
          tabIndex={canScroll.left ? 0 : -1}
          onClick={() => nudge(-1)}
          className={cn(
            "absolute top-1/2 left-4 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full",
            "bg-background/80 shadow-[0_0_0_1px_var(--surface-ring),0_12px_32px_-8px_var(--surface-shadow)] backdrop-blur-sm",
            "text-muted-foreground hover:text-foreground transition-[opacity,color,scale] duration-300 active:scale-[0.96]",
            canScroll.left ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          aria-label={t("levels.scrollRight")}
          aria-hidden={!canScroll.right}
          tabIndex={canScroll.right ? 0 : -1}
          onClick={() => nudge(1)}
          className={cn(
            "absolute top-1/2 right-4 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full",
            "bg-background/80 shadow-[0_0_0_1px_var(--surface-ring),0_12px_32px_-8px_var(--surface-shadow)] backdrop-blur-sm",
            "text-muted-foreground hover:text-foreground transition-[opacity,color,scale] duration-300 active:scale-[0.96]",
            canScroll.right ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </main>
  );
}
