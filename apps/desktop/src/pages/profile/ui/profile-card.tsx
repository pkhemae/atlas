import { MapPin, Trophy } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@atlas/ui/components/avatar";
import { Button } from "@atlas/ui/components/button";

interface ProfileCardProps {
  fullName: string;
  handle: string;
  initials: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  memberSince: string | null;
  onEditProfile: () => void;
}

/**
 * Level, XP and rank are design placeholders — the real systems land later.
 */
export function ProfileCard({
  fullName,
  handle,
  initials,
  bio,
  location,
  avatarUrl,
  bannerUrl,
  memberSince,
  onEditProfile,
}: ProfileCardProps) {
  return (
    <section
      aria-label="Profile"
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
            Member since {memberSince}
          </p>
        )}

        <Button
          variant="secondary"
          size="sm"
          className="mt-3 w-full"
          onClick={onEditProfile}
        >
          Edit profile
        </Button>

        <div aria-hidden="true" className="bg-foreground/5 my-4 h-px" />

        <p className="text-primary text-xs font-semibold tracking-wide uppercase">
          Level 13
        </p>
        <div className="bg-foreground/[0.06] mt-1.5 h-1 overflow-hidden rounded-full">
          <div className="bg-primary h-full w-[58%] rounded-full" />
        </div>
        <div className="text-muted-foreground mt-1.5 flex items-baseline justify-between text-[11px]">
          <span className="tabular-nums">754 / 1.3K XP</span>
          <span>~55 min</span>
        </div>

        <div className="bg-foreground/[0.04] mt-4 flex items-start justify-between rounded-lg p-3">
          <div>
            <p className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase">
              <Trophy className="size-3" />
              Rank
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">#348</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              This week
            </p>
            <p className="text-muted-foreground mt-0.5 text-lg font-semibold">
              —
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
