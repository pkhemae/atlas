import { useTranslation } from "react-i18next";
import { cn } from "@atlas/ui/lib/utils";
import { currentLocale } from "@/i18n";
import { romanDivision, TIER_KEYS, type TierId } from "@/lib/focus";

export type BadgeState = "done" | "current" | "locked";

interface LevelBadgeProps {
  tier: TierId;
  division: 1 | 2 | 3;
  cumulative: number;
  state: BadgeState;
}

export const BADGE_SIZE = 72;

/**
 * Rounded-corner polygon for clip-path: each corner is cut `radius` in
 * along both edges and bridged with a quadratic curve — polygon() can't
 * round, path() can.
 */
function roundedPolygonPath(points: [number, number][], radius: number) {
  const n = points.length;
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const [px, py] = points[i]!;
    const [ax, ay] = points[(i - 1 + n) % n]!;
    const [bx, by] = points[(i + 1) % n]!;
    const inLen = Math.hypot(px - ax, py - ay);
    const outLen = Math.hypot(bx - px, by - py);
    const sx = px - ((px - ax) / inLen) * radius;
    const sy = py - ((py - ay) / inLen) * radius;
    const ex = px + ((bx - px) / outLen) * radius;
    const ey = py + ((by - py) / outLen) * radius;
    parts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(2)} ${sy.toFixed(2)}`);
    parts.push(`Q${px} ${py} ${ex.toFixed(2)} ${ey.toFixed(2)}`);
  }
  return `${parts.join(" ")} Z`;
}

/** Pointy-top regular pentagon vertices, circumradius r around (cx, cy). */
function pentagonPoints(cx: number, cy: number, r: number) {
  return [-90, -18, 54, 126, 198].map((deg): [number, number] => [
    cx + r * Math.cos((deg * Math.PI) / 180),
    cy + r * Math.sin((deg * Math.PI) / 180),
  ]);
}

// the pentagon sits a touch low in its square so it reads centered
const CENTER_X = BADGE_SIZE / 2;
const CENTER_Y = BADGE_SIZE * 0.54;
const OUTER_PATH = roundedPolygonPath(
  pentagonPoints(CENTER_X, CENTER_Y, BADGE_SIZE / 2),
  8,
);
const INNER_PATH = roundedPolygonPath(
  pentagonPoints(CENTER_X, CENTER_Y, BADGE_SIZE / 2 - 2),
  7,
);

// literal classes — the Tailwind scanner can't see template strings
const TIER_BG = {
  bronze: "bg-[image:var(--tier-bronze)]",
  silver: "bg-[image:var(--tier-silver)]",
  gold: "bg-[image:var(--tier-gold)]",
  platinum: "bg-[image:var(--tier-platinum)]",
  diamond: "bg-[image:var(--tier-diamond)]",
} as const;

const STATE_LABEL_KEYS = {
  done: "levels.badgeDone",
  current: "levels.badgeCurrent",
  locked: "levels.badgeLocked",
} as const;

export function LevelBadge({
  tier,
  division,
  cumulative,
  state,
}: LevelBadgeProps) {
  const { t } = useTranslation();
  const locked = state === "locked";
  const rank = t("home.profile.rankLabel", {
    tier: t(TIER_KEYS[tier]),
    division: romanDivision(division),
  });

  return (
    <div
      role="img"
      aria-label={t(STATE_LABEL_KEYS[state], {
        rank,
        xp: cumulative.toLocaleString(currentLocale()),
      })}
      className="flex w-28 shrink-0 flex-col items-center gap-3"
    >
      {/* halo wrapper: drop-shadow follows the clipped pentagon shape
          (a box-shadow would be cut off by the clip-path) */}
      <div
        className={cn(
          "transition-transform",
          state === "current" && "scale-110",
        )}
        style={
          state === "current"
            ? { filter: `drop-shadow(0 0 16px var(--tier-${tier}-glow))` }
            : undefined
        }
      >
        {/* nested clips: clip-path cuts box-shadows, so the ring is a
            pentagon behind the (inset) metal one */}
        <div
          className={cn(
            "relative",
            locked ? "bg-foreground/10" : "bg-foreground/20",
          )}
          style={{
            width: BADGE_SIZE,
            height: BADGE_SIZE,
            clipPath: `path("${OUTER_PATH}")`,
          }}
        >
          <div
            className={cn(
              "absolute inset-0 grid place-items-center",
              locked
                ? "bg-foreground/[0.06]"
                : cn(
                    TIER_BG[tier],
                    // bevel: inset shadows render inside the clip
                    "shadow-[inset_0_2px_0_rgba(255,255,255,0.28),inset_0_-2px_0_rgba(0,0,0,0.25)]",
                  ),
            )}
            style={{ clipPath: `path("${INNER_PATH}")` }}
          >
            <span
              className={cn(
                "text-xl font-bold",
                locked
                  ? "text-muted-foreground/50"
                  : // white numeral on the metal — deliberately fixed, the
                    // tier gradients guarantee contrast in every theme
                    "text-white text-shadow-[0_1px_1px_rgba(0,0,0,0.3)]",
              )}
            >
              {romanDivision(division)}
            </span>
          </div>
        </div>
      </div>
      <div className="text-center">
        <p
          className={cn(
            "text-[13px] font-semibold",
            state === "current"
              ? "text-foreground"
              : state === "done"
                ? "text-foreground/80"
                : "text-muted-foreground/60",
          )}
        >
          {t(TIER_KEYS[tier])}
        </p>
        <p className="text-muted-foreground/70 mt-0.5 text-[11px] tabular-nums">
          {t("levels.xpThreshold", {
            xp: cumulative.toLocaleString(currentLocale()),
          })}
        </p>
      </div>
    </div>
  );
}
