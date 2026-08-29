'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ==========================================================================
   The ambient bed, synthesised in the browser, ported from the prototype.

   No audio file and no licence: a brown-noise river under a slowly sweeping
   lowpass, a low drone of two detuned sines a fifth apart, and a sparse minor
   pentatonic bell. On by default; see the effect below for how that squares
   with browser autoplay policy.
   ========================================================================== */

type Graph = {
  ctx: AudioContext;
  master: GainNode;
  stop: () => void;
};

function buildGraph(): Graph | null {
  const AC: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const started: { stop: (when?: number) => void }[] = [];

  // river: looping filtered noise, brown-ish so it reads as water not hiss
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.2;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 620;
  lp.Q.value = 0.6;
  const ng = ctx.createGain();
  ng.gain.value = 0.16;
  src.connect(lp);
  lp.connect(ng);
  ng.connect(master);
  src.start();
  started.push(src);

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.045;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 260;
  lfo.connect(lfoG);
  lfoG.connect(lp.frequency);
  lfo.start();
  started.push(lfo);

  // drone: two detuned sines a fifth apart, low, each with its own tremolo
  [55, 82.4].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = i ? 0.05 : 0.08;
    const trem = ctx.createOscillator();
    trem.frequency.value = 0.07 + i * 0.03;
    const tg = ctx.createGain();
    tg.gain.value = i ? 0.02 : 0.03;
    trem.connect(tg);
    tg.connect(g.gain);
    o.connect(g);
    g.connect(master);
    o.start();
    trem.start();
    started.push(o, trem);
  });

  // bell: a sparse minor pentatonic, one note every few seconds
  const SCALE = [220, 261.6, 293.7, 329.6, 392, 440, 523.3];
  let timer = 0;
  const bell = () => {
    timer = window.setTimeout(bell, 2600 + Math.random() * 5200);
    if (master.gain.value < 0.01) return; // keep the loop alive while muted
    const f = SCALE[(Math.random() * SCALE.length) | 0];
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = f;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.055, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
    const bp = ctx.createBiquadFilter();
    bp.type = 'lowpass';
    bp.frequency.value = 1800;
    o.connect(bp);
    bp.connect(g);
    g.connect(master);
    o.start(now);
    o.stop(now + 4.4);
  };
  timer = window.setTimeout(bell, 1400);

  return {
    ctx,
    master,
    stop: () => {
      window.clearTimeout(timer);
      started.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      });
      void ctx.close();
    },
  };
}

export default function AmbientScore({ label = 'Ambient score' }: { label?: string }) {
  const graph = useRef<Graph | null>(null);
  const [on, setOn] = useState(true); // on by default
  const [unavailable, setUnavailable] = useState(false);

  /* Start the score on load. Browsers refuse an AudioContext until the page has
     been interacted with, so if the context comes up suspended we arm a
     one-shot listener and start on the first gesture instead. The control still
     reads "on", because that is the state the moment sound is permitted. */
  useEffect(() => {
    let armed = false;

    const start = () => {
      if (!graph.current) {
        graph.current = buildGraph();
        if (!graph.current) {
          setUnavailable(true);
          return;
        }
      }
      const { ctx, master } = graph.current;
      void ctx.resume();
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0.5, now + 2.2);
    };

    const onGesture = () => {
      if (!armed) return;
      armed = false;
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('scroll', onGesture);
      start();
    };

    // try immediately; fall back to the first gesture if the browser blocks it
    const probe = buildGraph();
    if (!probe) {
      setUnavailable(true);
      return;
    }
    graph.current = probe;
    if (probe.ctx.state === 'running') {
      start();
    } else {
      armed = true;
      window.addEventListener('pointerdown', onGesture, { once: false });
      window.addEventListener('keydown', onGesture, { once: false });
      window.addEventListener('scroll', onGesture, { once: false, passive: true });
    }

    return () => {
      armed = false;
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('scroll', onGesture);
      graph.current?.stop();
      graph.current = null;
    };
  }, []);

  const toggle = useCallback(() => {
    if (!graph.current) {
      graph.current = buildGraph();
      if (!graph.current) {
        setUnavailable(true);
        return;
      }
    }
    const { ctx, master } = graph.current;
    if (ctx.state === 'suspended') void ctx.resume();
    const next = !on;
    setOn(next);
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(next ? 0.5 : 0, now + (next ? 2.2 : 1.1));
  }, [on]);

  if (unavailable) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className="me-sound-btn"
      title="A drone, a river and a sparse bell, generated in your browser"
    >
      <span className="me-sound-eq" aria-hidden="true" data-on={on ? 'true' : 'false'}>
        <i />
        <i />
        <i />
        <i />
      </span>
      {label} · {on ? 'on' : 'off'}
    </button>
  );
}
