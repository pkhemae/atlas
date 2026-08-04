import { Link } from "@tanstack/react-router";
import { House, Play, Trophy } from "lucide-react";
import { Button } from "@atlas/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@atlas/ui/components/tooltip";

interface AppNavbarProps {
  onStartSession: () => void;
  startPending: boolean;
}

export function AppNavbar({ onStartSession, startPending }: AppNavbarProps) {
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
              activeOptions={{ exact: true }}
              aria-label="Home"
              className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 data-[status=active]:text-foreground flex size-10 items-center justify-center rounded-full transition-colors"
            >
              <House className="size-4.5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Home</TooltipContent>
        </Tooltip>
        {/* hero CTA — flat accent pill, the play glyph nudges on hover */}
        <Button
          disabled={startPending}
          onClick={onStartSession}
          className="group rounded-full"
        >
          <Play className="transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-0.5" />
          Start a session
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Leaderboards"
              className="text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/5 flex size-10 cursor-default items-center justify-center rounded-full transition-colors"
            >
              <Trophy className="size-4.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Leaderboards</TooltipContent>
        </Tooltip>
      </nav>
    </TooltipProvider>
  );
}
