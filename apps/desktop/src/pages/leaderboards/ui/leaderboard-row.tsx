import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@atlas/ui/components/avatar";
import { cn } from "@atlas/ui/lib/utils";
import {
  formatTotal,
  romanDivision,
  TIER_KEYS,
  type TierId,
} from "@/lib/focus";

export interface LeaderboardEntry {
  rank: number;
  totalSeconds: number;
  user: {
    id: string;
    name: string;
    username: string | null;
    avatarUrl: string | null;
    initials: string;
    level: { index: number; tier: TierId; division: 1 | 2 | 3 };
  };
}

// medal treatment for the podium via the tier glow tokens — theme-aware
const MEDAL: Record<number, string> = {
  1: "text-[var(--tier-gold-glow)]",
  2: "text-[var(--tier-silver-glow)]",
  3: "text-[var(--tier-bronze-glow)]",
};

// the row's clothes live on the inner element (Link or div) so the
// parent list's dividers keep landing on the <li> itself
const ROW = "flex items-center gap-3 px-3 py-3";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isMe: boolean;
}

export function LeaderboardRow({ entry, isMe }: LeaderboardRowProps) {
  const { t } = useTranslation();

  // my own public page would just redirect home — the highlight + "(you)"
  // already say it's me, so my row stays inert; username-less rows too
  const clickable = entry.user.username !== null && !isMe;

  const content = (
    <>
      <span
        className={cn(
          "w-6 shrink-0 text-center text-sm font-semibold tabular-nums",
          MEDAL[entry.rank] ?? "text-muted-foreground",
        )}
      >
        {entry.rank}
      </span>
      <Avatar className="size-8">
        <AvatarImage src={entry.user.avatarUrl ?? undefined} alt="" />
        <AvatarFallback className="text-[10px]">
          {entry.user.initials}
        </AvatarFallback>
      </Avatar>
      <p className="min-w-0 flex-1 truncate text-sm font-medium">
        {entry.user.name}
        {isMe && (
          <span className="text-muted-foreground font-normal">
            {" "}
            {t("leaderboards.you")}
          </span>
        )}
      </p>
      <span
        className="shrink-0 text-[10px] font-semibold tracking-wide uppercase"
        // the tier name wears its metal — same color the road uses
        style={{ color: `var(--tier-${entry.user.level.tier}-glow)` }}
      >
        {t("home.profile.rankLabel", {
          tier: t(TIER_KEYS[entry.user.level.tier]),
          division: romanDivision(entry.user.level.division),
        })}
      </span>
      <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums">
        {formatTotal(entry.totalSeconds)}
      </span>
    </>
  );

  return (
    <li
      className={cn(
        // opaque wash mixed into the PAGE background — the list is
        // blended, there is no card underneath
        isMe &&
          "rounded-lg bg-[color-mix(in_srgb,var(--primary)_5%,var(--background))] shadow-[inset_0_0_0_1px_var(--surface-ring)]",
      )}
    >
      {clickable ? (
        <Link
          to="/u/$username"
          params={{ username: entry.user.username! }}
          className={cn(
            ROW,
            "hover:bg-foreground/[0.03] rounded-lg transition-colors",
          )}
        >
          {content}
        </Link>
      ) : (
        <div className={ROW}>{content}</div>
      )}
    </li>
  );
}
