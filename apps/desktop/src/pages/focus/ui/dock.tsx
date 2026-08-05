import { useTranslation } from "react-i18next";
import { Pause, Play, Settings, Square } from "lucide-react";
import { cn } from "@atlas/ui/lib/utils";
import { formatElapsed } from "@/lib/focus";

interface DockProps {
  elapsed: number;
  status: "running" | "paused";
  pending: boolean;
  error: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const CHIP =
  "flex size-7 items-center justify-center rounded-full transition-[color,background-color,scale] active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50";

const MORPH_ICON =
  "absolute inset-0 size-3.5 transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)]";
const MORPH_VISIBLE = "scale-100 opacity-100 blur-none";
const MORPH_HIDDEN = "scale-25 opacity-0 blur-[2px]";

export function Dock({
  elapsed,
  status,
  pending,
  error,
  onPause,
  onResume,
  onStop,
}: DockProps) {
  const { t } = useTranslation();
  const paused = status === "paused";

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
            "font-[Menlo,Consolas,monospace] text-sm font-semibold text-red-500 tabular-nums transition-opacity duration-300",
            paused && "animate-pulse opacity-70",
          )}
        >
          {formatElapsed(elapsed)}
        </span>
        {error && (
          <span
            role="alert"
            aria-label={t("dock.resyncError")}
            title={t("dock.resyncError")}
            className="size-1.5 shrink-0 animate-pulse rounded-full bg-red-500"
          />
        )}
        {/* one button, two glyphs: pause and play morph in place */}
        <button
          type="button"
          aria-label={paused ? t("dock.resume") : t("dock.pause")}
          disabled={pending}
          onClick={paused ? onResume : onPause}
          className={cn(
            CHIP,
            "text-zinc-400 hover:bg-white/10 hover:text-white",
          )}
        >
          <span className="relative size-3.5" aria-hidden="true">
            <Pause
              className={cn(
                MORPH_ICON,
                "fill-current",
                paused ? MORPH_HIDDEN : MORPH_VISIBLE,
              )}
            />
            <Play
              className={cn(
                MORPH_ICON,
                "fill-current",
                paused ? MORPH_VISIBLE : MORPH_HIDDEN,
              )}
            />
          </span>
        </button>
        {/* the stop grows out from behind the toggle while the pill width
            follows — width + margin animate so nothing ever jumps */}
        <div
          className={cn(
            "overflow-hidden transition-[width,margin-left] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
            paused ? "ml-0 w-7" : "-ml-1.5 w-0",
          )}
        >
          <button
            type="button"
            aria-label={t("dock.stop")}
            aria-hidden={!paused}
            tabIndex={paused ? 0 : -1}
            disabled={pending || !paused}
            onClick={onStop}
            className={cn(
              CHIP,
              "bg-red-600 text-white transition-[opacity,scale,background-color] duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-red-500",
              paused ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
          >
            <Square className="size-3 fill-current" />
          </button>
        </div>
        {/* future dock settings */}
        <button
          type="button"
          aria-label={t("dock.settingsSoon")}
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
