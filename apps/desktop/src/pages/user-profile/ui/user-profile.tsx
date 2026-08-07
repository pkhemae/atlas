import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Button } from "@atlas/ui/components/button";
import type { ActivityDay } from "@/lib/focus";
import { ActivityGraph } from "@/pages/home/ui/activity-graph";
import {
  ProfileCard,
  type ProfileProgression,
} from "@/pages/home/ui/profile-card";
import { WeeklyFocusChart } from "@/pages/home/ui/weekly-focus-chart";

interface UserProfileData {
  fullName: string;
  handle: string;
  initials: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  memberSince: string | null;
  progression: ProfileProgression;
  weeklyRank: number | null;
}

interface UserProfileProps {
  profile: UserProfileData | null;
  days: ActivityDay[];
  loading: boolean;
  error: boolean;
  notFound: boolean;
}

// Mirror of the home layout, read-only: no Edit button on the card and —
// privacy decision — no recent sessions or app usage, activity only.
export function UserProfile({
  profile,
  days,
  loading,
  error,
  notFound,
}: UserProfileProps) {
  const { t } = useTranslation();

  // the query is composite — a failure leaves nothing to show, so both
  // terminal states get the same centered treatment
  if (notFound || error) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground text-sm font-medium">
          {t(notFound ? "profile.notFound" : "profile.error")}
        </p>
        <Button asChild variant="secondary" size="sm">
          <Link to="/">{t("profile.backHome")}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-svh px-6 pt-12 pb-8">
      <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto flex w-full max-w-2xl items-start gap-8 duration-500">
        <div className="sticky top-12 shrink-0 self-start">
          {profile ? (
            <ProfileCard
              fullName={profile.fullName}
              handle={profile.handle}
              initials={profile.initials}
              bio={profile.bio}
              location={profile.location}
              avatarUrl={profile.avatarUrl}
              bannerUrl={profile.bannerUrl}
              memberSince={profile.memberSince}
              progression={profile.progression}
              weeklyRank={profile.weeklyRank}
            />
          ) : (
            <div className="bg-card h-96 w-60 animate-pulse rounded-xl" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
            {t("profile.activity")}
          </h2>
          <div className="bg-card overflow-hidden rounded-xl">
            <ActivityGraph days={days} loading={loading} error={false} />
            <div aria-hidden="true" className="bg-foreground/5 h-px" />
            <WeeklyFocusChart days={days} loading={loading} error={false} />
          </div>
        </div>
      </div>
    </main>
  );
}
