import { Link } from "@tanstack/react-router";
import { House, Play, Trophy } from "lucide-react";
import { Button } from "@atlas/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@atlas/ui/components/tooltip";

export function AppNavbar() {
  return (
    <TooltipProvider delayDuration={300}>
      {/* blended into the window top: no surface, the empty areas keep
          dragging the window (the attribute only fires on this element) */}
      <nav
        aria-label="Application"
        data-tauri-drag-region
        className="animate-in fade-in slide-in-from-top-2 fixed inset-x-0 top-0 z-[60] flex h-14 items-center justify-center gap-2 duration-500"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/"
              aria-label="Home"
              className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 data-[status=active]:text-foreground flex size-10 items-center justify-center rounded-full transition-colors"
            >
              <House className="size-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Home</TooltipContent>
        </Tooltip>
        {/* hero CTA — wired to the focus timer in the next iteration.
            hover: a light streak sweeps across (instant invisible reset on
            leave via duration-0) and the play glyph nudges forward */}
        <Button
          variant="relief"
          className="group relative overflow-hidden rounded-full before:absolute before:inset-0 before:-translate-x-full before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-0 hover:before:translate-x-full hover:before:duration-500"
        >
          <Play className="transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-0.5" />
          Start a session
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Leaderboards (coming soon)"
              className="text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/5 flex size-10 cursor-default items-center justify-center rounded-full transition-colors"
            >
              <Trophy className="size-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Leaderboards — coming soon</TooltipContent>
        </Tooltip>
      </nav>
    </TooltipProvider>
  );
}
