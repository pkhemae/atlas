import { Button } from "@atlas/ui/components/button";
import type { AuthUser } from "@/lib/api";

interface HomeScreenProps {
  user: AuthUser;
  loggingOut: boolean;
  onLogout: () => void;
}

export function HomeScreen({ user, loggingOut, onLogout }: HomeScreenProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-xs flex-col items-center gap-6 text-center duration-500">
      <div className="flex size-16 items-center justify-center rounded-full bg-linear-to-b from-red-500 to-red-700 text-xl font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_24px_-8px_rgba(220,38,38,0.5)]">
        {user.initials}
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          {user.fullName ?? user.email}
        </h1>
        <p className="text-muted-foreground text-sm">{user.email}</p>
      </div>
      <p className="text-muted-foreground text-sm text-pretty">
        You are signed in. Focus sessions are coming soon.
      </p>
      <Button variant="secondary" onClick={onLogout} disabled={loggingOut}>
        {loggingOut ? "Logging out…" : "Log out"}
      </Button>
    </div>
  );
}
