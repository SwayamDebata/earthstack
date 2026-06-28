type AmbientNodes = {
  osc: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
};

let ctx: AudioContext | null = null;
let ambient: AmbientNodes | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export async function ensureRunning(): Promise<AudioContext | null> {
  const c = getCtx();
  if (!c) return null;
  if (c.state === 'suspended') await c.resume();
  return c;
}

async function playTone(
  freq: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  delayMs = 0,
) {
  const c = await ensureRunning();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(c.destination);

  const start = c.currentTime + delayMs / 1000;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.012);
  gain.gain.linearRampToValueAtTime(0, start + duration);

  osc.start(start);
  osc.stop(start + duration + 0.03);
}

export async function playReplayTick() {
  await playTone(740, 0.05, 0.06, 'triangle');
}

export async function playReplayAlert() {
  await playTone(392, 0.1, 0.07, 'sine');
  await playTone(523, 0.14, 0.08, 'sine', 90);
}

export async function playUiConfirm() {
  await playTone(620, 0.07, 0.05, 'sine');
}

/** Call directly from a click handler to unlock audio and give immediate feedback. */
export async function enableWithFeedback() {
  const c = await ensureRunning();
  if (!c) return;
  await playTone(520, 0.07, 0.08, 'sine');
  await playTone(780, 0.09, 0.07, 'sine', 75);
  await startAmbient();
}

export async function startAmbient() {
  const c = await ensureRunning();
  if (!c || ambient) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.value = 48;
  filter.type = 'lowpass';
  filter.frequency.value = 180;
  gain.gain.value = 0.018;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  osc.start();

  ambient = { osc, gain, filter };
}

export function stopAmbient() {
  if (!ambient) return;
  try {
    ambient.osc.stop();
    ambient.osc.disconnect();
    ambient.filter.disconnect();
    ambient.gain.disconnect();
  } catch {
    /* already stopped */
  }
  ambient = null;
}

export function pauseAmbientForHiddenTab() {
  if (!ambient) return;
  ambient.gain.gain.value = 0;
}

export function resumeAmbientForVisibleTab() {
  if (!ambient) return;
  ambient.gain.gain.value = 0.018;
}
