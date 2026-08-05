import { useTranslation } from "react-i18next";
import { Pause, Play, Settings, Square, Volume2 } from "lucide-react";
import { Slider } from "@atlas/ui/components/slider";
import { Switch } from "@atlas/ui/components/switch";
import { cn } from "@atlas/ui/lib/utils";
import {
  AMBIENT_SOUNDS,
  type AmbientSoundId,
  type AmbientState,
} from "@/lib/ambient";
import { formatElapsed } from "@/lib/focus";

interface DockProps {
  elapsed: number;
  status: "running" | "paused";
  pending: boolean;
  error: boolean;
  settingsOpen: boolean;
  ambient: AmbientState;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onToggleSettings: () => void;
  onToggleSound: (id: AmbientSoundId) => void;
  onVolumeChange: (id: AmbientSoundId, volume: number) => void;
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
  settingsOpen,
  ambient,
  onPause,
  onResume,
  onStop,
  onToggleSettings,
  onToggleSound,
  onVolumeChange,
}: DockProps) {
  const { t } = useTranslation();
  const paused = status === "paused";

  return (
    // the window itself is transparent: the pill carries the shape. Column
    // layout with pt-1 keeps the pill exactly where the centered 44px
    // window used to put it, while the settings panel grows below.
    <div
      data-tauri-drag-region
      className="flex h-svh w-svw flex-col items-center pt-1"
    >
      <div
        data-tauri-drag-region
        className="animate-in fade-in zoom-in-95 flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-zinc-900/95 py-1 pr-1 pl-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_6px_16px_rgba(0,0,0,0.45)] duration-300"
      >
        <span
          data-tauri-drag-region
          className={cn(
            // explicit Menlo stack: WKWebView resolves ui-monospace weights
            // to Times through CoreText fallbacks
            "font-[Menlo,Consolas,monospace] text-primary text-sm font-semibold tabular-nums transition-opacity duration-300",
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
            className="bg-destructive size-1.5 shrink-0 animate-pulse rounded-full"
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
              "bg-primary text-primary-foreground hover:bg-primary/90 transition-[opacity,scale,background-color] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
              paused ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
          >
            <Square className="size-3 fill-current" />
          </button>
        </div>
        <button
          type="button"
          aria-label={t("dock.settings")}
          aria-expanded={settingsOpen}
          onClick={onToggleSettings}
          className={cn(
            CHIP,
            "text-zinc-500 hover:bg-white/10 hover:text-zinc-300",
            settingsOpen && "bg-white/10 text-zinc-200",
          )}
        >
          <Settings
            className={cn(
              "size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
              settingsOpen && "rotate-90",
            )}
          />
        </button>
      </div>

      {/* ambient sounds panel — the window grows to make room for it */}
      {settingsOpen && (
        <div className="animate-in fade-in slide-in-from-top-1 zoom-in-95 mt-2 w-52 rounded-2xl bg-zinc-900/95 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_6px_16px_rgba(0,0,0,0.45)] duration-200">
          <p className="text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">
            {t("dock.ambientTitle")}
          </p>
          <div className="mt-1.5 flex flex-col">
            {AMBIENT_SOUNDS.map(({ id, labelKey, Icon }) => {
              const sound = ambient[id];
              return (
                <div key={id}>
                  <div className="flex h-8 items-center gap-2">
                    <Icon
                      aria-hidden="true"
                      className="size-3.5 text-zinc-400"
                    />
                    <span className="flex-1 text-xs font-medium text-zinc-200">
                      {t(labelKey)}
                    </span>
                    <Switch
                      size="sm"
                      checked={sound.enabled}
                      onCheckedChange={() => onToggleSound(id)}
                      aria-label={t(labelKey)}
                      className="data-[state=unchecked]:bg-white/15"
                    />
                  </div>
                  {/* per-sound volume, revealed when the sound is on */}
                  {sound.enabled && (
                    <div className="animate-in fade-in slide-in-from-top-1 flex items-center gap-2 pt-0.5 pb-2 pl-[22px] duration-200">
                      <Volume2
                        aria-hidden="true"
                        className="size-3 shrink-0 text-zinc-500"
                      />
                      <Slider
                        value={[sound.volume]}
                        onValueChange={([volume]) =>
                          onVolumeChange(id, volume ?? 0)
                        }
                        aria-label={t("dock.volumeFor", { sound: t(labelKey) })}
                        className="[&_[data-slot=slider-track]]:bg-white/15 **:data-[slot=slider-thumb]:size-3 **:data-[slot=slider-thumb]:border-0"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
