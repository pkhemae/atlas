import { LogOut, User } from "lucide-react";
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
        >
          <LogOut />
          {loggingOut ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
