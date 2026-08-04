import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@atlas/ui/components/dropdown-menu";

interface UserMenuProps {
  initials: string;
  loggingOut: boolean;
  onLogout: () => void;
}

export function UserMenu({ initials, loggingOut, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="flex size-9 items-center justify-center rounded-full bg-linear-to-b from-red-500 to-red-700 text-xs font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_4px_12px_-4px_rgba(220,38,38,0.5)] transition-[scale,filter] hover:brightness-110 active:scale-[0.96]"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-40">
        {/* future profile screen */}
        <DropdownMenuItem>
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
