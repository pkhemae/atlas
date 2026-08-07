import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import {
  History,
  House,
  LogOut,
  Play,
  Settings,
  TrendingUp,
  Trophy,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@atlas/ui/components/avatar";
import { cn } from "@atlas/ui/lib/utils";
import { SidebarSearch } from "@/components/sidebar-search";

interface SidebarUser {
  name: string;
  initials: string;
  avatarUrl: string | null;
}

interface AppSidebarProps {
  user: SidebarUser | null;
  mePending: boolean;
  meError: boolean;
  onRetryMe: () => void;
  onStartSession: () => void;
  startPending: boolean;
  startError: string | null;
  onLogout: () => void;
  loggingOut: boolean;
}

// the active tab shows a small gradient bar (per-theme token) at the left
// edge — exported so sidebar-search wears the same clothes
export const NAV_ITEM =
  "relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground data-[status=active]:text-foreground before:absolute before:top-1/2 before:left-0 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[image:var(--nav-active-bar)] before:opacity-0 before:transition-opacity data-[status=active]:before:opacity-100";

/**
 * Blended sidebar: no surface, no border — the page background shows
 * through. Empty areas drag the window (the attribute only fires on the
 * elements carrying it, so items stay clickable); pt-12 keeps everything
 * clear of the macOS traffic lights and the top drag strip.
 */
export function AppSidebar({
  user,
  mePending,
  meError,
  onRetryMe,
  onStartSession,
  startPending,
  startError,
  onLogout,
  loggingOut,
}: AppSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside
      aria-label={t("sidebar.label")}
      data-tauri-drag-region
      className="animate-in fade-in slide-in-from-left-2 fixed inset-y-0 left-0 z-40 flex w-52 flex-col px-3 pt-12 pb-4 duration-500"
    >
      <nav data-tauri-drag-region className="mt-1 flex flex-1 flex-col gap-0.5">
        {/* same clothes as the nav items — only the red glyph says "action" */}
        <button
          type="button"
          disabled={startPending}
          onClick={onStartSession}
          className={cn(
            NAV_ITEM,
            // permanent fill: the one always-filled row marks the action
            "bg-foreground/5 group mb-2 disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          <Play
            aria-hidden="true"
            className="text-primary size-4 transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-0.5"
          />
          {t("sidebar.startSession")}
        </button>
        {startError && (
          <p className="text-destructive mb-2 px-2.5 text-xs" role="alert">
            {startError}
          </p>
        )}
        <SidebarSearch />
        <Link to="/" activeOptions={{ exact: true }} className={NAV_ITEM}>
          <House aria-hidden="true" className="size-4" />
          {t("sidebar.home")}
        </Link>
        <Link to="/leaderboards" className={NAV_ITEM}>
          <Trophy aria-hidden="true" className="size-4" />
          {t("sidebar.leaderboards")}
        </Link>
        <Link to="/levels" className={NAV_ITEM}>
          <TrendingUp aria-hidden="true" className="size-4" />
          {t("sidebar.levels")}
        </Link>
        <Link to="/sessions" className={NAV_ITEM}>
          <History aria-hidden="true" className="size-4" />
          {t("sidebar.sessions")}
        </Link>
        <Link to="/settings" className={NAV_ITEM}>
          <Settings aria-hidden="true" className="size-4" />
          {t("sidebar.settings")}
        </Link>
      </nav>

      <div className="group/footer flex items-center gap-2 rounded-md px-1.5 py-1.5">
        {mePending ? (
          <>
            <div
              aria-hidden="true"
              className="bg-foreground/10 size-7 animate-pulse rounded-full"
            />
            <div
              aria-hidden="true"
              className="bg-foreground/10 h-3 w-16 animate-pulse rounded"
            />
          </>
        ) : meError || !user ? (
          <button
            type="button"
            aria-label={t("sidebar.retryTitle")}
            title={t("sidebar.retryTitle")}
            onClick={onRetryMe}
            className="text-muted-foreground hover:text-foreground bg-foreground/10 flex size-7 items-center justify-center rounded-full text-sm transition-colors"
          >
            !
          </button>
        ) : (
          <>
            <Avatar className="size-7">
              <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="text-[10px]">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
              {user.name}
            </span>
            <button
              type="button"
              aria-label={t("sidebar.logOut")}
              disabled={loggingOut}
              onClick={onLogout}
              className="text-muted-foreground hover:text-foreground flex size-6 shrink-0 items-center justify-center rounded-md opacity-0 transition-[color,opacity] group-hover/footer:opacity-100 focus-visible:opacity-100 disabled:pointer-events-none disabled:opacity-50"
            >
              <LogOut aria-hidden="true" className="size-3.5" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
