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

const HEX =
  "[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]";

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
      className="flex w-24 shrink-0 flex-col items-center gap-2.5"
    >
      {/* halo wrapper: drop-shadow follows the clipped hexagon shape
          (a box-shadow would be cut off by the clip-path) */}
      <div
        className={cn(
          "transition-transform",
          state === "current" && "scale-110",
        )}
        style={
          state === "current"
            ? { filter: `drop-shadow(0 0 14px var(--tier-${tier}-glow))` }
            : undefined
        }
      >
        {/* nested hexes: clip-path clips box-shadows, so the ring is a
            slightly larger hex behind the metal one */}
        <div
          className={cn(
            HEX,
            "size-16 p-[1.5px]",
            locked ? "bg-foreground/10" : "bg-foreground/20",
          )}
        >
          <div
            className={cn(
              HEX,
              "grid size-full place-items-center",
              locked
                ? "bg-foreground/[0.06]"
                : cn(
                    TIER_BG[tier],
                    // bevel: inset shadows render inside the clip
                    "shadow-[inset_0_2px_0_rgba(255,255,255,0.28),inset_0_-2px_0_rgba(0,0,0,0.25)]",
                  ),
            )}
          >
            <span
              className={cn(
                "text-lg font-bold",
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
            "text-xs font-semibold",
            state === "current"
              ? "text-foreground"
              : state === "done"
                ? "text-foreground/80"
                : "text-muted-foreground/60",
          )}
        >
          {t(TIER_KEYS[tier])}
        </p>
        <p className="text-muted-foreground/70 mt-0.5 text-[10px] tabular-nums">
          {t("levels.xpThreshold", {
            xp: cumulative.toLocaleString(currentLocale()),
          })}
        </p>
      </div>
    </div>
  );
}
