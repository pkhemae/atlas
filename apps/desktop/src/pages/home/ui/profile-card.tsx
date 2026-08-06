import { useTranslation } from "react-i18next";
import { Flame, MapPin, Trophy } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@atlas/ui/components/avatar";
import { Button } from "@atlas/ui/components/button";
import { formatXp, romanDivision, TIER_KEYS, type TierId } from "@/lib/focus";

export interface ProfileProgression {
  tier: TierId;
  division: 1 | 2 | 3;
  next: { tier: TierId; division: 1 | 2 | 3 } | null;
  xpIntoLevel: number;
  xpForLevel: number | null;
  streakDays: number;
}

interface ProfileCardProps {
  fullName: string;
  handle: string;
  initials: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  memberSince: string | null;
  progression: ProfileProgression | null;
  /** This week's leaderboard position; null while loading or unranked. */
  weeklyRank: number | null;
  onEditProfile: () => void;
}

export function ProfileCard({
  fullName,
  handle,
  initials,
  bio,
  location,
  avatarUrl,
  bannerUrl,
  memberSince,
  progression,
  weeklyRank,
  onEditProfile,
}: ProfileCardProps) {
  const { t } = useTranslation();

  const progressPct = progression
    ? progression.xpForLevel === null
      ? 100
      : Math.min(
          100,
          Math.round((progression.xpIntoLevel / progression.xpForLevel) * 100),
        )
    : 0;

  return (
    <section
      aria-label={t("home.profile.ariaLabel")}
      className="bg-card w-60 shrink-0 overflow-hidden rounded-xl"
    >
      {bannerUrl ? (
        <img src={bannerUrl} alt="" className="h-18 w-full object-cover" />
      ) : (
        <div aria-hidden="true" className="bg-foreground/[0.04] h-18" />
      )}
      <div className="px-4 pb-4">
        <Avatar className="ring-card -mt-8 size-16 ring-4">
          <AvatarImage src={avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <h1 className="mt-2.5 text-base font-semibold text-balance">
          {fullName}
        </h1>
        <p className="text-primary text-xs font-semibold tracking-wide uppercase">
          @{handle}
        </p>
        {bio && (
          <p className="text-muted-foreground mt-1.5 text-xs break-words">
            {bio}
          </p>
        )}
        {location && (
          <p className="text-muted-foreground/70 mt-1.5 flex items-center gap-1 text-[11px]">
            <MapPin aria-hidden="true" className="size-3 shrink-0" />
            {location}
          </p>
        )}
        {memberSince && (
          <p className="text-muted-foreground/70 mt-1 text-[11px]">
            {t("home.profile.memberSince", { date: memberSince })}
          </p>
        )}

        <Button
          variant="secondary"
          size="sm"
          className="mt-3 w-full"
          onClick={onEditProfile}
        >
          {t("home.profile.editProfile")}
        </Button>

        <div aria-hidden="true" className="bg-foreground/5 my-4 h-px" />

        {/* the bar runs from the current level toward the next one */}
        <div className="flex items-baseline justify-between gap-2">
          <p
            className="text-primary text-xs font-semibold tracking-wide uppercase"
            // the tier name wears its metal — same color the road uses
            style={
              progression
                ? { color: `var(--tier-${progression.tier}-glow)` }
                : undefined
            }
          >
            {progression
              ? t("home.profile.rankLabel", {
                  tier: t(TIER_KEYS[progression.tier]),
                  division: romanDivision(progression.division),
                })
              : "—"}
          </p>
          {progression?.next && (
            <p className="text-muted-foreground/70 text-[10px] font-semibold tracking-wide uppercase">
              {t("home.profile.rankLabel", {
                tier: t(TIER_KEYS[progression.next.tier]),
                division: romanDivision(progression.next.division),
              })}
            </p>
          )}
        </div>
        <div className="bg-foreground/[0.06] mt-1.5 h-1 overflow-hidden rounded-full">
          {/* Tailwind can't do data-driven widths — inline style it is */}
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-muted-foreground mt-1.5 text-[11px] tabular-nums">
          {progression
            ? progression.xpForLevel === null
              ? t("home.profile.apex")
              : t("home.profile.xp", {
                  current: formatXp(progression.xpIntoLevel),
                  max: formatXp(progression.xpForLevel),
                })
            : "—"}
        </p>

        <div className="bg-foreground/[0.04] mt-4 flex items-start justify-between rounded-lg p-3">
          <div>
            <p className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase">
              <Flame className="size-3" />
              {t("home.profile.streakLabel")}
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {progression
                ? t("home.profile.streak", { count: progression.streakDays })
                : "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground flex items-center justify-end gap-1 text-[11px] font-semibold tracking-wide uppercase">
              <Trophy className="size-3" />
              {t("home.profile.rank")}
            </p>
            {/* this week's leaderboard position */}
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {weeklyRank !== null ? `#${weeklyRank}` : "—"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
