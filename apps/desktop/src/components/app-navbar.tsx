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
        <Tooltip>
          <TooltipTrigger asChild>
            {/* hero CTA — wired to the focus timer in the next iteration */}
            <Button variant="relief" className="rounded-full">
              <Play />
              Start a session
            </Button>
          </TooltipTrigger>
          <TooltipContent>Coming soon</TooltipContent>
        </Tooltip>
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
