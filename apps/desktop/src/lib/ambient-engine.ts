import {
  AMBIENT_SOUNDS,
  type AmbientSoundId,
  type AmbientState,
} from "@/lib/ambient";
import rainUrl from "@/assets/ambient/rain.m4a";

/*
 * Web Audio ambient engine. Sounds are recorded samples looped
 * sample-accurately via loopStart/loopEnd (HTMLAudio can't loop without
 * encoder gaps), fades ride gain ramps, and the context sleeps when
 * nothing plays. Sources and licenses: src/assets/ambient/ATTRIBUTION.md.
 */

// ---- tunables, iterate by ear ----
const FADE_SECONDS = 0.4;
/** setTargetAtTime constant — short so slider drags feel continuous. */
const VOLUME_SMOOTHING = 0.06;
/*
 * Each sample carries 2s margins around a crossfade-built loop region, so
 * the audio at loopEnd flows into the audio at loopStart by construction.
 * Loop points sit inside the margins — codec edge padding (AAC priming)
 * shifts the decoded samples slightly, but only the loop LENGTH matters
 * for seamlessness, and that stays exact.
 */
const RAIN_LOOP = { start: 2, end: 72 };

interface RunningRecipe {
  output: AudioNode;
  stop: () => void;
}

type Recipe = (ctx: AudioContext) => RunningRecipe;

interface ActiveSound {
  gain: GainNode;
  stop: () => void;
}

let ctx: AudioContext | null = null;
const active = new Map<AmbientSoundId, ActiveSound>();

function context(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Decoded samples, fetched once per app lifetime (failed loads retry). */
const bufferCache = new Map<string, Promise<AudioBuffer>>();

function loadBuffer(audio: AudioContext, url: string): Promise<AudioBuffer> {
  let cached = bufferCache.get(url);
  if (!cached) {
    cached = fetch(url)
      .then((res) => res.arrayBuffer())
      .then((data) => audio.decodeAudioData(data));
    cached.catch(() => bufferCache.delete(url));
    bufferCache.set(url, cached);
  }
  return cached;
}

function sampleRecipe(
  url: string,
  loop: { start: number; end: number },
): Recipe {
  return (audio) => {
    const output = audio.createGain();
    let source: AudioBufferSourceNode | null = null;
    let stopped = false;
    loadBuffer(audio, url)
      .then((buffer) => {
        if (stopped) return;
        source = audio.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopStart = loop.start;
        source.loopEnd = loop.end;
        source.connect(output);
        source.start(0, loop.start);
      })
      .catch((error: unknown) => {
        console.error("ambient: sample failed to load", url, error);
      });
    return {
      output,
      stop: () => {
        stopped = true;
        if (source) {
          source.stop();
          source.disconnect();
        }
      },
    };
  };
}

const SOUND_RECIPES: Record<AmbientSoundId, Recipe> = {
  rain: sampleRecipe(rainUrl, RAIN_LOOP),
};

/** Slider 0–100 → quadratic gain: linear position ≈ perceived loudness. */
function targetGain(volume: number): number {
  const v = volume / 100;
  return v * v;
}

/**
 * Idempotent sync: makes the audio graph reflect `enabled && active`
 * plus each sound's volume. `active` = a focus session exists (running
 * OR paused — the timer's pause deliberately does not silence ambience).
 */
export function syncAmbient(state: AmbientState, sessionActive: boolean) {
  for (const { id } of AMBIENT_SOUNDS) {
    const wanted = sessionActive && state[id].enabled;
    const playing = active.get(id);

    if (wanted && !playing) {
      const audio = context();
      // resume on the user-gesture path (toggle click / session start)
      void audio.resume().catch(() => {});
      const recipe = SOUND_RECIPES[id](audio);
      const gain = audio.createGain();
      gain.gain.setValueAtTime(0, audio.currentTime);
      gain.gain.linearRampToValueAtTime(
        targetGain(state[id].volume),
        audio.currentTime + FADE_SECONDS,
      );
      recipe.output.connect(gain).connect(audio.destination);
      active.set(id, {
        gain,
        stop: () => {
          recipe.stop();
          gain.disconnect();
        },
      });
    } else if (!wanted && playing) {
      const audio = context();
      const gainParam = playing.gain.gain;
      gainParam.cancelScheduledValues(audio.currentTime);
      gainParam.setValueAtTime(gainParam.value, audio.currentTime);
      gainParam.linearRampToValueAtTime(0, audio.currentTime + FADE_SECONDS);
      active.delete(id);
      const doomed = playing;
      setTimeout(() => doomed.stop(), FADE_SECONDS * 1000 + 50);
    } else if (wanted && playing) {
      playing.gain.gain.setTargetAtTime(
        targetGain(state[id].volume),
        context().currentTime,
        VOLUME_SMOOTHING,
      );
    }
  }

  // battery: an idle context sleeps once the last fade-out has finished
  if (ctx && active.size === 0) {
    setTimeout(
      () => {
        if (ctx && active.size === 0) void ctx.suspend().catch(() => {});
      },
      FADE_SECONDS * 1000 + 100,
    );
  }
}

/** Hard stop (unmount/HMR) — no fade, everything torn down. */
export function stopAllAmbient() {
  for (const [id, sound] of active) {
    sound.stop();
    active.delete(id);
  }
  if (ctx) void ctx.suspend().catch(() => {});
}
