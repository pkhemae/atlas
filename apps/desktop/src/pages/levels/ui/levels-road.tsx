import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@atlas/ui/lib/utils";
import { currentLocale } from "@/i18n";
import { formatXp, romanDivision, TIER_KEYS, type TierId } from "@/lib/focus";
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

export interface RoadStats {
  xp: number;
  tier: TierId;
  division: 1 | 2 | 3;
  streakDays: number;
  multiplier: number;
}

interface LevelsRoadProps {
  levels: RoadLevel[];
  stats: RoadStats | null;
  /** The user's current level index, or null while loading. */
  currentIndex: number | null;
  /** 0-100 fill of the segment toward the next level. */
  progressPct: number;
  error: boolean;
}

/* Road geometry: badges snake across the full height of the page on a
 * sine wave, far apart — the distance is the point. Flatter and longer
 * than it could be: the stats row above needs the headroom. */
const SPACING = 260;
const PAD_X = 100;
const COLUMN_WIDTH = 112; // w-28 badge column
const SHAPE_HALF = BADGE_SIZE / 2;
const PAD_TOP = 48;
const PAD_BOTTOM = 132; // shape half + the labels hanging below

function waveFraction(i: number) {
  return 0.5 + 0.4 * Math.sin(i * 1.15);
}

const TIER_STROKE = {
  bronze: "var(--tier-bronze-glow)",
  silver: "var(--tier-silver-glow)",
  gold: "var(--tier-gold-glow)",
  platinum: "var(--tier-platinum-glow)",
  diamond: "var(--tier-diamond-glow)",
} as const;

const DASHED_STROKE = "color-mix(in srgb, var(--foreground) 20%, transparent)";

/**
 * Catmull-Rom → Bézier controls for the segment centers[i] → centers[i+1]:
 * consecutive segments share their tangents, so the road reads as ONE
 * smooth sinusoid the badges sit on — while each piece stays
 * individually styleable (done / partial / future).
 */
function segmentControls(centers: [number, number][], i: number) {
  const [p0x, p0y] = centers[Math.max(0, i - 1)]!;
  const [p1x, p1y] = centers[i]!;
  const [p2x, p2y] = centers[i + 1]!;
  const [p3x, p3y] = centers[Math.min(centers.length - 1, i + 2)]!;
  return {
    p1x,
    p1y,
    c1x: p1x + (p2x - p0x) / 6,
    c1y: p1y + (p2y - p0y) / 6,
    c2x: p2x - (p3x - p1x) / 6,
    c2y: p2y - (p3y - p1y) / 6,
    p2x,
    p2y,
  };
}

function segmentPath(centers: [number, number][], i: number): string {
  const s = segmentControls(centers, i);
  return `M ${s.p1x} ${s.p1y} C ${s.c1x} ${s.c1y}, ${s.c2x} ${s.c2y}, ${s.p2x} ${s.p2y}`;
}

function bezierPoint(
  s: ReturnType<typeof segmentControls>,
  t: number,
): [number, number] {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * s.p1x + b * s.c1x + c * s.c2x + d * s.p2x,
    a * s.p1y + b * s.c1y + c * s.c2y + d * s.p2y,
  ];
}

/**
 * Point at a FRACTION OF ARC LENGTH along the cubic — the same measure
 * strokeDasharray uses, so the marker lands exactly where the filled
 * stroke stops (the raw Bézier parameter drifts from it on curves).
 */
function bezierPointAtArcLength(
  s: ReturnType<typeof segmentControls>,
  fraction: number,
): [number, number] {
  const STEPS = 64;
  const points: [number, number][] = [];
  const lengths: number[] = [0];
  let total = 0;
  for (let i = 0; i <= STEPS; i++) {
    const p = bezierPoint(s, i / STEPS);
    if (i > 0) {
      const prev = points[i - 1]!;
      total += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      lengths.push(total);
    }
    points.push(p);
  }
  const target = total * Math.min(1, Math.max(0, fraction));
  for (let i = 1; i <= STEPS; i++) {
    if (lengths[i]! >= target) {
      const span = lengths[i]! - lengths[i - 1]!;
      const t = span === 0 ? 0 : (target - lengths[i - 1]!) / span;
      const [ax, ay] = points[i - 1]!;
      const [bx, by] = points[i]!;
      return [ax + (bx - ax) * t, ay + (by - ay) * t];
    }
  }
  return points[STEPS]!;
}

// the marker only shows when it has visible road to live on: far
// enough from both badges, and never at the apex (no segment there)
const MARKER_MIN_PCT = 8;
const MARKER_MAX_PCT = 92;

function badgeState(index: number, currentIndex: number | null): BadgeState {
  if (currentIndex === null || index > currentIndex) return "locked";
  return index === currentIndex ? "current" : "done";
}

export function LevelsRoad({
  levels,
  stats,
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

  // "you are here" position on the in-progress segment's curve
  const marker =
    currentIndex !== null &&
    currentIndex >= 1 &&
    currentIndex < levels.length &&
    progressPct >= MARKER_MIN_PCT &&
    progressPct <= MARKER_MAX_PCT
      ? bezierPointAtArcLength(
          segmentControls(centers, currentIndex - 1),
          progressPct / 100,
        )
      : null;

  return (
    <main className="flex h-svh flex-col pt-12 pb-4">
      <div className="px-6">
        <h2 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
          {t("levels.heading")}
        </h2>
        {error && (
          <p className="text-muted-foreground text-xs font-medium">
            {t("levels.error")}
          </p>
        )}
        {/* flat stat strip — no surface, the page stays blended */}
        <div className="mt-3 flex items-center gap-6">
          <div>
            <p className="text-muted-foreground/70 text-[10px] font-semibold tracking-wide uppercase">
              {t("levels.xpLabel")}
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {stats
                ? t("levels.xpThreshold", { xp: formatXp(stats.xp) })
                : "—"}
            </p>
          </div>
          <div aria-hidden="true" className="bg-foreground/5 h-8 w-px" />
          <div>
            <p className="text-muted-foreground/70 text-[10px] font-semibold tracking-wide uppercase">
              {t("home.profile.rank")}
            </p>
            <p
              className="mt-0.5 text-lg font-semibold"
              // the rank wears its metal — same color the road uses
              style={
                stats ? { color: `var(--tier-${stats.tier}-glow)` } : undefined
              }
            >
              {stats
                ? t("home.profile.rankLabel", {
                    tier: t(TIER_KEYS[stats.tier]),
                    division: romanDivision(stats.division),
                  })
                : "—"}
            </p>
          </div>
          <div aria-hidden="true" className="bg-foreground/5 h-8 w-px" />
          <div>
            <p className="text-muted-foreground/70 text-[10px] font-semibold tracking-wide uppercase">
              {t("home.profile.streakLabel")}
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {stats
                ? t("home.profile.streak", { count: stats.streakDays })
                : "—"}
            </p>
          </div>
          <div aria-hidden="true" className="bg-foreground/5 h-8 w-px" />
          <div>
            <p className="text-muted-foreground/70 text-[10px] font-semibold tracking-wide uppercase">
              {t("levels.bonusLabel")}
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {stats
                ? t("levels.bonusValue", {
                    value: stats.multiplier.toLocaleString(currentLocale(), {
                      maximumFractionDigits: 2,
                    }),
                  })
                : "—"}
            </p>
          </div>
        </div>
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
                  // center-to-center: the badges paint over the curve
                  // ends, so the joins can't gap
                  const d = segmentPath(centers, i);
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
              {marker && (
                // the badge's aria already announces the current level —
                // this is a purely visual pin, bar centered on the curve
                <div
                  aria-hidden="true"
                  // the column's bottom is the dot, whose CENTER sits
                  // exactly on the curve (half the 6px dot overhangs)
                  className="animate-in fade-in fill-mode-backwards pointer-events-none absolute flex -translate-x-1/2 -translate-y-[calc(100%_-_3px)] flex-col items-center duration-500"
                  style={{
                    left: marker[0],
                    top: marker[1],
                    animationDelay: "700ms",
                  }}
                >
                  <span className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap">
                    {t("levels.youAreHere")}
                  </span>
                  {/* the sidebar's active-tab gradient — the app's accent
                      bar, already declined per theme */}
                  <div className="h-14 w-0.5 rounded-full bg-[image:var(--nav-active-bar)]" />
                  {/* the tip: a dot resting on the stroke's end */}
                  <div className="-mt-0.5 size-1.5 rounded-full bg-[image:var(--nav-active-bar)]" />
                </div>
              )}
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
