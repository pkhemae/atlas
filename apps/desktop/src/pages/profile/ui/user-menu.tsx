import { User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@atlas/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@atlas/ui/components/dropdown-menu";

interface UserMenuProps {
  initials: string;
  avatarUrl: string | null;
  loggingOut: boolean;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export function UserMenu({
  initials,
  avatarUrl,
  loggingOut,
  onOpenProfile,
  onLogout,
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="group rounded-full transition-[scale] active:scale-[0.96]"
        >
          <Avatar className="size-9">
            <AvatarImage src={avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="group-hover:bg-red-500 text-xs transition-colors">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-40">
        <DropdownMenuItem onSelect={onOpenProfile}>
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={loggingOut}
          onSelect={onLogout}
          className="group"
        >
          <LogOutIcon />
          {loggingOut ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// lucide's log-out, re-drawn so the arrow lives in its own group and can
// slide right when the menu item is hovered or keyboard-highlighted
function LogOutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <g className="transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-[2px] group-data-[highlighted]:translate-x-[2px]">
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </g>
    </svg>
  );
}
