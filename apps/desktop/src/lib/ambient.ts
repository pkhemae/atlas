import { CloudRain, type LucideIcon } from "lucide-react";

/**
 * Ambient sound registry — UI groundwork for the audio feature. Adding
 * a sound = one entry here + one i18n key (+ its audio asset later).
 */
export interface AmbientSound {
  id: string;
  labelKey: "dock.rain";
  Icon: LucideIcon;
}

export const AMBIENT_SOUNDS = [
  { id: "rain", labelKey: "dock.rain", Icon: CloudRain },
] as const satisfies readonly AmbientSound[];

export type AmbientSoundId = (typeof AMBIENT_SOUNDS)[number]["id"];

export interface AmbientSoundState {
  enabled: boolean;
  /** 0–100 */
  volume: number;
}

export type AmbientState = Record<AmbientSoundId, AmbientSoundState>;

export const DEFAULT_AMBIENT_STATE: AmbientState = {
  rain: { enabled: false, volume: 70 },
};

const STORAGE_KEY = "atlas.ambient";

/** Restores saved settings, merged over defaults (schema-tolerant). */
export function loadAmbientState(): AmbientState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AMBIENT_STATE;
    const parsed = JSON.parse(raw) as Partial<
      Record<AmbientSoundId, Partial<AmbientSoundState>>
    >;
    const merged = {} as Record<AmbientSoundId, AmbientSoundState>;
    for (const { id } of AMBIENT_SOUNDS) {
      merged[id] = { ...DEFAULT_AMBIENT_STATE[id], ...parsed[id] };
    }
    return merged;
  } catch {
    return DEFAULT_AMBIENT_STATE;
  }
}

export function saveAmbientState(state: AmbientState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
