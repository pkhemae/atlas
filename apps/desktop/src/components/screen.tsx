import type { ReactNode } from "react";
import { cn } from "@atlas/ui/lib/utils";

interface ScreenProps {
  children: ReactNode;
  className?: string;
}

// Full-window centered layout.
// pt-10 keeps content clear of the transparent macOS title-bar overlay.
export function Screen({ children, className }: ScreenProps) {
  return (
    <main
      className={cn(
        "bg-background relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6 pt-10",
        className,
      )}
    >
      <div className="relative flex w-full flex-col items-center">
        {children}
      </div>
    </main>
  );
}
