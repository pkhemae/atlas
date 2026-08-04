import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@atlas/ui/components/button";

interface ProfileCardProps {
  fullName: string;
  handle: string;
  email: string;
  initials: string;
  memberSince: string | null;
}

/**
 * Level, XP, rank and the banner/avatar edit flow are design placeholders —
 * the real systems land later.
 */
export function ProfileCard({
  fullName,
  handle,
  email,
  initials,
  memberSince,
}: ProfileCardProps) {
  return (
    <section
      aria-label="Profile"
      className="bg-card w-80 shrink-0 overflow-hidden rounded-xl"
    >
      {/* banner placeholder */}
      <div aria-hidden="true" className="bg-foreground/[0.04] h-24" />
      <div className="px-5 pb-5">
        <div
          aria-hidden="true"
          className="bg-primary text-primary-foreground ring-card -mt-10 flex size-20 items-center justify-center rounded-full text-2xl font-semibold ring-4"
        >
          {initials}
        </div>
        <h1 className="mt-3 text-lg font-semibold text-balance">{fullName}</h1>
        <p className="text-primary text-xs font-semibold tracking-wide uppercase">
          @{handle}
        </p>
        <p className="text-muted-foreground mt-2 text-sm break-all">{email}</p>
        {memberSince && (
          <p className="text-muted-foreground/70 mt-0.5 text-xs">
            Member since {memberSince}
          </p>
        )}

        <Button variant="secondary" className="mt-4 w-full">
          Edit profile
        </Button>

        <div aria-hidden="true" className="bg-foreground/5 my-5 h-px" />

        <p className="text-primary text-xs font-semibold tracking-wide uppercase">
          Level 13
        </p>
        <div className="bg-foreground/[0.06] mt-2 h-1.5 overflow-hidden rounded-full">
          <div className="bg-primary h-full w-[58%] rounded-full" />
        </div>
        <div className="text-muted-foreground mt-2 flex items-baseline justify-between text-xs">
          <span className="tabular-nums">754 / 1.3K XP</span>
          <span>~55 min</span>
        </div>

        <div className="bg-foreground/[0.04] mt-5 flex items-start justify-between rounded-lg p-4">
          <div>
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
              <Trophy className="size-3.5" />
              Rank
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">#348</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              This week
            </p>
            <p className="text-muted-foreground mt-1 text-xl font-semibold">
              —
            </p>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="bg-foreground/5 h-px" />
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground flex w-full cursor-default items-center justify-between px-5 py-4 text-xs font-semibold tracking-wide uppercase transition-colors"
      >
        Full analytics
        <ArrowRight className="size-4" />
      </button>
    </section>
  );
}
