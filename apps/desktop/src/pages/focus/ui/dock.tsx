import { Pause, Play, Settings, Square } from "lucide-react";
import { cn } from "@atlas/ui/lib/utils";
import { formatElapsed } from "@/lib/focus";

interface DockProps {
  elapsed: number;
  status: "running" | "paused";
  pending: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const CHIP =
  "flex size-7 items-center justify-center rounded-full transition-[color,background-color,scale] active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50";

export function Dock({
  elapsed,
  status,
  pending,
  onPause,
  onResume,
  onStop,
}: DockProps) {
  return (
    // the window itself is transparent: the pill carries the shape
    <div
      data-tauri-drag-region
      className="flex h-svh w-svw items-center justify-center"
    >
      <div
        data-tauri-drag-region
        className="animate-in fade-in zoom-in-95 flex h-9 items-center gap-1.5 rounded-full bg-zinc-900/95 py-1 pr-1 pl-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_6px_16px_rgba(0,0,0,0.45)] duration-300"
      >
        <span
          data-tauri-drag-region
          className={cn(
            // explicit Menlo stack: WKWebView resolves ui-monospace weights
            // to Times through CoreText fallbacks
            "font-[Menlo,Consolas,monospace] text-sm font-semibold text-red-500 tabular-nums transition-opacity",
            status === "paused" && "animate-pulse opacity-70",
          )}
        >
          {formatElapsed(elapsed)}
        </span>
        {status === "running" ? (
          <button
            type="button"
            aria-label="Pause session"
            disabled={pending}
            onClick={onPause}
            className={cn(
              CHIP,
              "animate-in fade-in text-zinc-400 duration-200 hover:bg-white/10 hover:text-white",
            )}
          >
            <Pause className="size-3.5 fill-current" />
          </button>
        ) : (
          <div className="animate-in fade-in flex items-center gap-1 duration-200">
            <button
              type="button"
              aria-label="Resume session"
              disabled={pending}
              onClick={onResume}
              className={cn(
                CHIP,
                "text-zinc-400 hover:bg-white/10 hover:text-white",
              )}
            >
              <Play className="size-3.5 fill-current" />
            </button>
            <button
              type="button"
              aria-label="Stop and save session"
              disabled={pending}
              onClick={onStop}
              className={cn(
                CHIP,
                "bg-linear-to-b from-red-500 to-red-700 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] hover:brightness-110",
              )}
            >
              <Square className="size-3 fill-current" />
            </button>
          </div>
        )}
        {/* future dock settings */}
        <button
          type="button"
          aria-label="Session settings (coming soon)"
          className={cn(
            CHIP,
            "cursor-default text-zinc-500 hover:bg-white/10 hover:text-zinc-300",
          )}
        >
          <Settings className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
