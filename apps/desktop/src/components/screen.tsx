import type { ReactNode } from "react";
import { cn } from "@atlas/ui/lib/utils";

interface ScreenProps {
  children: ReactNode;
  className?: string;
}

// Full-window centered layout with the landing's subtle red glow up top.
// pt-10 keeps content clear of the transparent macOS title-bar overlay.
export function Screen({ children, className }: ScreenProps) {
  return (
    <main
      className={cn(
        "bg-background relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6 pt-10",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgba(220,38,38,0.14),transparent)]"
      />
      <div className="relative flex w-full flex-col items-center">
        {children}
      </div>
    </main>
  );
}
