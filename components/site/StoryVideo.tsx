'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ==========================================================================
   The story video, with a real transport: play/pause, a scrubbable progress
   bar, elapsed time and a sound toggle.

   The footage has no audio track, so the "sound" is a monsoon bed synthesised
   in the browser: rain as bandpassed noise, a low thunder rumble that swells
   every so often, and the same sparse bell as the journey score. It follows
   the video's play state, and starts muted because unrequested sound is rude.
   ========================================================================== */

type Bed = { ctx: AudioContext; master: GainNode; stop: () => void };

function buildMonsoonBed(): Bed | null {
  const AC: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  const started: { stop: (w?: number) => void }[] = [];
  const timers: number[] = [];

  // ---- rain: white-ish noise through a wide bandpass, so it hisses ----
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.9;
  const rain = ctx.createBufferSource();
  rain.buffer = buf;
  rain.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2400;
  bp.Q.value = 0.4;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 700;
  const rg = ctx.createGain();
  rg.gain.value = 0.11;
  rain.connect(bp);
  bp.connect(hp);
  hp.connect(rg);
  rg.connect(master);
  rain.start();
  started.push(rain);

  // gusts: the rain swells and falls back
  const gust = ctx.createOscillator();
  gust.frequency.value = 0.06;
  const gustG = ctx.createGain();
  gustG.gain.value = 0.045;
  gust.connect(gustG);
  gustG.connect(rg.gain);
  gust.start();
  started.push(gust);

  // ---- thunder: a low rumble, filtered noise pushed through now and then ----
  const rumbleSrc = ctx.createBufferSource();
  rumbleSrc.buffer = buf;
  rumbleSrc.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 110;
  lp.Q.value = 1.2;
  const rumbleG = ctx.createGain();
  rumbleG.gain.value = 0;
  rumbleSrc.connect(lp);
  lp.connect(rumbleG);
  rumbleG.connect(master);
  rumbleSrc.start();
  started.push(rumbleSrc);

  const thunder = () => {
    timers.push(window.setTimeout(thunder, 9000 + Math.random() * 16000));
    const now = ctx.currentTime;
    rumbleG.gain.cancelScheduledValues(now);
    rumbleG.gain.setValueAtTime(rumbleG.gain.value, now);
    rumbleG.gain.linearRampToValueAtTime(0.5 + Math.random() * 0.35, now + 0.5);
    rumbleG.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
  };
  timers.push(window.setTimeout(thunder, 3500));

  // ---- bell: the same sparse pentatonic that carries the journey ----
  const SCALE = [220, 261.6, 293.7, 329.6, 392];
  const bell = () => {
    timers.push(window.setTimeout(bell, 5200 + Math.random() * 7000));
    const f = SCALE[(Math.random() * SCALE.length) | 0];
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = f;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.04, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 4);
    const bl = ctx.createBiquadFilter();
    bl.type = 'lowpass';
    bl.frequency.value = 1500;
    o.connect(bl);
    bl.connect(g);
    g.connect(master);
    o.start(now);
    o.stop(now + 4.2);
  };
  timers.push(window.setTimeout(bell, 2000));

  return {
    ctx,
    master,
    stop: () => {
      timers.forEach((t) => window.clearTimeout(t));
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

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

export default function StoryVideo({
  src720,
  src1080,
  poster,
  label,
  caption,
}: {
  src720: string;
  src1080?: string;
  poster: string;
  label: string;
  caption?: string;
}) {
  const vidRef = useRef<HTMLVideoElement>(null);
  const bedRef = useRef<Bed | null>(null);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(true); // on by default
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(
    () => () => {
      bedRef.current?.stop();
      bedRef.current = null;
    },
    [],
  );

  // the bed follows the transport: it should never play over a paused picture
  const rampBed = useCallback((on: boolean) => {
    const bed = bedRef.current;
    if (!bed) return;
    const now = bed.ctx.currentTime;
    bed.master.gain.cancelScheduledValues(now);
    bed.master.gain.setValueAtTime(bed.master.gain.value, now);
    bed.master.gain.linearRampToValueAtTime(on ? 0.42 : 0, now + (on ? 1.4 : 0.5));
  }, []);

  const toggleSound = useCallback(() => {
    if (!bedRef.current) {
      bedRef.current = buildMonsoonBed();
      if (!bedRef.current) return;
    }
    void bedRef.current.ctx.resume();
    const next = !sound;
    setSound(next);
    rampBed(next && playing);
  }, [sound, playing, rampBed]);

  const togglePlay = useCallback(() => {
    const v = vidRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, []);

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    const onPlay = () => {
      setPlaying(true);
      if (!sound) return;
      // pressing play is the user gesture, so the context may start here
      if (!bedRef.current) bedRef.current = buildMonsoonBed();
      void bedRef.current?.ctx.resume();
      rampBed(true);
    };
    const onPause = () => {
      setPlaying(false);
      rampBed(false);
    };
    const onTime = () => setT(v.currentTime);
    const onMeta = () => setDur(v.duration);
    // metadata can already be in by the time this effect runs, in which case
    // loadedmetadata never fires again and the scrubber would sit at zero
    if (v.readyState >= 1) onMeta();

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('durationchange', onMeta);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('durationchange', onMeta);
    };
  }, [sound, rampBed]);

  // pause when it scrolls away, so audio never plays off screen
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting && !v.paused) v.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = vidRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
  };

  const pct = dur ? (t / dur) * 100 : 0;

  return (
    <figure className="me-player">
      <div className="me-player-stage">
        <video ref={vidRef} poster={poster} loop playsInline preload="metadata" muted>
          {src1080 && <source src={src1080} media="(min-width: 900px)" type="video/mp4" />}
          <source src={src720} type="video/mp4" />
        </video>

        {/* big centre control, the way a player behaves before first play */}
        <button
          type="button"
          className="me-player-big"
          data-hidden={playing ? 'true' : 'false'}
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
            {playing ? (
              <path d="M3 2h5v20H3zM14 2h5v20h-5z" fill="currentColor" />
            ) : (
              <path d="M3 1.6 20 12 3 22.4z" fill="currentColor" />
            )}
          </svg>
        </button>
      </div>

      <div className="me-player-bar">
        <button
          type="button"
          onClick={togglePlay}
          className="me-player-btn"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
            {playing ? (
              <path d="M1 1h3v10H1zM7 1h3v10H7z" fill="currentColor" />
            ) : (
              <path d="M1.5 0.8 10 6 1.5 11.2z" fill="currentColor" />
            )}
          </svg>
        </button>

        <span className="me-player-time">{fmt(t)}</span>

        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div className="me-player-track" onClick={scrub} role="presentation">
          <span style={{ width: `${pct}%` }} />
        </div>

        <span className="me-player-time">{fmt(dur)}</span>

        <button
          type="button"
          onClick={toggleSound}
          className="me-player-btn me-player-sound"
          aria-pressed={sound}
          aria-label={sound ? 'Mute monsoon bed' : 'Play monsoon bed'}
          title="Ambient rain bed"
        >
          <svg width="13" height="12" viewBox="0 0 13 12" aria-hidden="true" fill="none">
            <path d="M1 4.5h2.2L6 2v8L3.2 7.5H1z" fill="currentColor" />
            {sound ? (
              <>
                <path d="M8.2 4a2.8 2.8 0 0 1 0 4" stroke="currentColor" strokeWidth="1.1" />
                <path d="M10.2 2.6a5 5 0 0 1 0 6.8" stroke="currentColor" strokeWidth="1.1" />
              </>
            ) : (
              <path d="M8.4 4.2 11.6 7.4M11.6 4.2 8.4 7.4" stroke="currentColor" strokeWidth="1.1" />
            )}
          </svg>
          <span>{sound ? 'Sound on' : 'Sound off'}</span>
        </button>
      </div>

      <div className="me-player-meta">
        <span className="me-label">{label}</span>
      </div>
      {caption && <figcaption className="me-label me-player-cap">{caption}</figcaption>}
    </figure>
  );
}
