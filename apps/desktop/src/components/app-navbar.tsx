import { Link } from "@tanstack/react-router";
import { House, Play, Trophy } from "lucide-react";
import { Button } from "@atlas/ui/components/button";

export function AppNavbar() {
  return (
    <nav
      aria-label="Application"
      className="animate-in fade-in slide-in-from-bottom-2 bg-secondary/70 fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md duration-500"
    >
      <Link
        to="/"
        aria-label="Home"
        className="text-muted-foreground hover:text-foreground data-[status=active]:bg-foreground/10 data-[status=active]:text-foreground flex size-10 items-center justify-center rounded-full transition-colors"
      >
        <House className="size-5" />
      </Link>
      {/* hero CTA of the app — wired to the focus timer in the next iteration */}
      <Button variant="relief" className="rounded-full">
        <Play />
        Start a session
      </Button>
      <button
        type="button"
        aria-label="Leaderboards (coming soon)"
        title="Leaderboards — coming soon"
        className="text-muted-foreground/60 hover:text-muted-foreground flex size-10 cursor-default items-center justify-center rounded-full transition-colors"
      >
        <Trophy className="size-5" />
      </button>
    </nav>
  );
}
