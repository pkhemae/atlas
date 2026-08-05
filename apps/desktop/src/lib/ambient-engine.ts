import {
  AMBIENT_SOUNDS,
  type AmbientSoundId,
  type AmbientState,
} from "@/lib/ambient";

/*
 * Web Audio ambient engine. Everything is synthesized or looped
 * sample-accurately (HTMLAudio can't loop without encoder gaps), fades
 * ride gain ramps, and the context sleeps when nothing plays. A future
 * recorded sound is just another recipe (fetch + decodeAudioData +
 * AudioBufferSourceNode(loop)) — same interface.
 */

// ---- tunables, iterate by ear ----
const FADE_SECONDS = 0.4;
/** setTargetAtTime constant — short so slider drags feel continuous. */
const VOLUME_SMOOTHING = 0.06;
const RAIN = {
  /** noise loops seamlessly by nature; 4s avoids audible periodicity */
  noiseSeconds: 4,
  /** lowpass carrying the rain "shhh" */
  hissFrequency: 1600,
  /** darker low layer giving the rain some body */
  bodyFrequency: 400,
  bodyGain: 0.5,
  /** slow swell so the rain never sounds perfectly static */
  lfoFrequency: 0.2,
  lfoDepth: 0.1,
};

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

function createNoiseBuffer(audio: AudioContext, seconds: number): AudioBuffer {
  const buffer = audio.createBuffer(
    1,
    Math.floor(audio.sampleRate * seconds),
    audio.sampleRate,
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

const SOUND_RECIPES: Record<AmbientSoundId, Recipe> = {
  rain: (audio) => {
    const noise = audio.createBufferSource();
    noise.buffer = createNoiseBuffer(audio, RAIN.noiseSeconds);
    noise.loop = true;

    const output = audio.createGain();

    const hiss = audio.createBiquadFilter();
    hiss.type = "lowpass";
    hiss.frequency.value = RAIN.hissFrequency;
    noise.connect(hiss).connect(output);

    const body = audio.createBiquadFilter();
    body.type = "lowpass";
    body.frequency.value = RAIN.bodyFrequency;
    const bodyGain = audio.createGain();
    bodyGain.gain.value = RAIN.bodyGain;
    noise.connect(body).connect(bodyGain).connect(output);

    // audio-rate modulation of the output gain (base 1 ± depth)
    const lfo = audio.createOscillator();
    lfo.frequency.value = RAIN.lfoFrequency;
    const lfoGain = audio.createGain();
    lfoGain.gain.value = RAIN.lfoDepth;
    lfo.connect(lfoGain).connect(output.gain);

    noise.start();
    lfo.start();

    return {
      output,
      stop: () => {
        noise.stop();
        lfo.stop();
        noise.disconnect();
        lfo.disconnect();
        lfoGain.disconnect();
      },
    };
  },
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
