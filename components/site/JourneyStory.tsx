'use client';

import { useEffect, useRef } from 'react';
import { readAccent } from './accent';

/* ==========================================================================
   One house on the bank, across twenty-seven years.

   The scene holds still and the night moves around it: the 1999 storm, the
   signal that reaches the district and stops, the long ordinary years, and a
   dawn with the window lit again. The window is the whole point, so it is the
   one thing that changes state.

   Procedural canvas, no assets. Scroll drives the weather, the light and the
   signal, and the copy is keyed to the same progress.
   ========================================================================== */

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const BEATS = [
  {
    k: 'October 1999',
    h: 'The models had seen it. The satellites had seen it.',
    s: 'A super cyclone crossed the coast and took thousands of lives. Nothing about the physics was unknown that night.',
  },
  {
    k: 'The last step',
    h: 'What did not happen was the warning reaching the house.',
    s: 'The forecast was issued. It stopped at the district. Everyone who grew up here after that grew up with the same fact in the background.',
  },
  {
    k: 'Twenty-seven years',
    h: 'The rivers still rise on a schedule everyone knows.',
    s: 'The Mahanadi does not surprise anyone. The year is planned around it: when to plant, when to move the animals, when to sleep lightly.',
  },
  {
    k: 'The only metric that matters',
    h: 'One family, one more day.',
    s: 'Everything else on this site is instrumentation for that sentence.',
  },
];

export default function JourneyStory() {
  const secRef = useRef<HTMLElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cv = cvRef.current;
    const sec = secRef.current;
    if (!cv || !sec) return;
    const ctx = cv.getContext('2d');
    // the hue comes from the stylesheet, so site.css stays the only place it lives
    const AC = readAccent();
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rnd = (i: number) => {
      const n = Math.sin(i * 91.7) * 43758.5453;
      return n - Math.floor(n);
    };

    const DROPS = Array.from({ length: 220 }, (_, i) => ({
      x: rnd(i),
      y: rnd(i + 60),
      len: 0.018 + rnd(i + 120) * 0.03,
      sp: 0.6 + rnd(i + 180) * 1.0,
    }));
    const TREES = Array.from({ length: 22 }, (_, i) => ({
      x: rnd(i + 400),
      h: 0.03 + rnd(i + 440) * 0.035,
    }));
    const STARS = Array.from({ length: 60 }, (_, i) => ({
      x: rnd(i + 800),
      y: rnd(i + 840) * 0.42,
      m: 0.3 + rnd(i + 880) * 0.7,
    }));

    let raf = 0;
    let W = 0;
    let H = 0;
    let shown = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (ms: number) => {
      raf = requestAnimationFrame(draw);
      const r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight || document.hidden) return;

      const span = sec.offsetHeight - window.innerHeight;
      const target = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
      shown += (target - shown) * (reduce ? 1 : 0.085);
      const p = shown;
      const t = ms * 0.001;

      // storm through the first act, calm by the third, dawn at the end
      const storm = 1 - seg(p, 0.30, 0.62);
      const dawn = seg(p, 0.74, 1.0);

      const horizon = H * 0.62;
      const bank = H * 0.74;

      /* ---- sky ---- */
      const sky = ctx.createLinearGradient(0, 0, 0, horizon);
      const topC = [
        mix(mix(0.055, 0.035, 1 - storm), 0.30, dawn),
        mix(mix(0.055, 0.048, 1 - storm), 0.36, dawn),
        mix(mix(0.070, 0.090, 1 - storm), 0.50, dawn),
      ];
      const horC = [
        mix(mix(0.115, 0.105, 1 - storm), 0.96, dawn),
        mix(mix(0.100, 0.098, 1 - storm), 0.72, dawn),
        mix(mix(0.095, 0.105, 1 - storm), 0.42, dawn),
      ];
      sky.addColorStop(0, `rgb(${topC.map((c) => Math.round(c * 255)).join(',')})`);
      sky.addColorStop(1, `rgb(${horC.map((c) => Math.round(c * 255)).join(',')})`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, horizon + 2);

      /* ---- stars, only once the storm has passed and before dawn ---- */
      const starA = Math.min(1 - storm, 1 - dawn);
      if (starA > 0.02) {
        for (const s of STARS) {
          ctx.globalAlpha = starA * s.m * (0.5 + 0.5 * Math.sin(t * 1.4 + s.x * 40));
          ctx.fillStyle = '#e8eef6';
          ctx.fillRect(s.x * W, s.y * H, 1.6, 1.6);
        }
        ctx.globalAlpha = 1;
      }

      /* ---- far treeline ---- */
      ctx.fillStyle = `rgb(${Math.round(mix(10, 26, dawn))},${Math.round(mix(12, 24, dawn))},${Math.round(mix(9, 16, dawn))})`;
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      for (const tr of TREES) {
        const x = tr.x * W;
        ctx.lineTo(x - 10, horizon);
        ctx.lineTo(x, horizon - tr.h * H);
        ctx.lineTo(x + 10, horizon);
      }
      ctx.lineTo(W, horizon);
      ctx.lineTo(W, bank);
      ctx.lineTo(0, bank);
      ctx.closePath();
      ctx.fill();

      /* ---- the river ---- */
      const wg = ctx.createLinearGradient(0, bank, 0, H);
      wg.addColorStop(0, `rgba(${Math.round(mix(22, 60, dawn))},${Math.round(mix(52, 88, dawn))},${Math.round(mix(54, 84, dawn))},.95)`);
      wg.addColorStop(1, 'rgba(8,20,22,.99)');
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.moveTo(0, bank);
      for (let x = 0; x <= W; x += 8) {
        ctx.lineTo(x, bank + Math.sin(x * 0.017 + t * 1.3) * (2 + storm * 3));
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // the light on the water, strongest at dawn
      ctx.strokeStyle = `rgba(${Math.round(mix(120, 255, dawn))},${Math.round(mix(150, 200, dawn))},${Math.round(mix(150, 130, dawn))},${0.06 + 0.2 * dawn})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const y = bank + 8 + i * ((H - bank) / 14);
        const w2 = (0.2 + rnd(i + 900) * 0.4) * W;
        const x0 = ((rnd(i + 940) * W + t * 8 * (i % 2 ? 1 : -1)) % W) - w2 / 2;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0 + w2, y);
        ctx.stroke();
      }

      /* ---- the house ---- */
      const hx = W * 0.5;
      const hw = Math.min(W, H) * 0.115;
      const hh = hw * 0.8;
      const base = bank - 6;
      // a shade lighter than the treeline, or the silhouette disappears into it
      ctx.fillStyle = `rgb(${Math.round(mix(26, 52, dawn))},${Math.round(mix(26, 46, dawn))},${Math.round(mix(21, 34, dawn))})`;
      ctx.fillRect(hx - hw / 2, base - hh, hw, hh);
      ctx.beginPath();
      ctx.moveTo(hx - hw * 0.62, base - hh);
      ctx.lineTo(hx, base - hh - hh * 0.5);
      ctx.lineTo(hx + hw * 0.62, base - hh);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(${Math.round(mix(46, 96, dawn))},${Math.round(mix(46, 88, dawn))},${Math.round(mix(38, 66, dawn))},.9)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(hx - hw * 1.5, base);
      ctx.lineTo(hx + hw * 1.5, base);
      ctx.stroke();

      // The window: lit through 1999, out through the years, lit again at dawn.
      // This is the only state in the scene that matters.
      const litEarly = 1 - seg(p, 0.16, 0.26);
      const litEnd = seg(p, 0.78, 0.94);
      const lit = Math.max(litEarly, litEnd);
      if (lit > 0.01) {
        const flick = 0.8 + 0.2 * Math.sin(t * 3 + 1);
        const wx = hx - hw * 0.16;
        const wy = base - hh * 0.62;
        const ww = hw * 0.32;
        const wh = hh * 0.36;
        const glow = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 2, wx + ww / 2, wy + wh / 2, hw * 1.6);
        glow.addColorStop(0, `rgba(240,180,96,${0.5 * lit * flick})`);
        glow.addColorStop(1, 'rgba(240,180,96,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(wx - hw * 1.6, wy - hw * 1.6, hw * 3.4, hw * 3.4);
        ctx.fillStyle = `rgba(247,198,120,${(0.72 + 0.28 * flick) * lit})`;
        ctx.fillRect(wx, wy, ww, wh);
      }

      /* ---- the signal that stops short ---- */
      const sig = seg(p, 0.30, 0.56);
      if (sig > 0) {
        const y0 = H * 0.20;
        const x0 = W * 0.14;
        const stopX = mix(x0, hx - hw * 2.6, ease(Math.min(1, sig * 1.6)));
        ctx.strokeStyle = `rgba(79,168,156,${0.75 * Math.min(1, sig * 2)})`;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -t * 22;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(W * 0.32, y0 + 20, stopX, base - hh * 1.45);
        ctx.stroke();
        ctx.setLineDash([]);

        // the transmitter it came from
        ctx.fillStyle = 'rgba(79,168,156,.9)';
        ctx.beginPath();
        ctx.arc(x0, y0, 3.4, 0, Math.PI * 2);
        ctx.fill();

        // and where it stopped: it never reaches the window
        if (sig > 0.55) {
          const a = (sig - 0.55) / 0.45;
          ctx.strokeStyle = AC.rgba(AC.accent, a);
          ctx.lineWidth = 1.8;
          const yStop = base - hh * 1.45;
          const s2 = 7;
          ctx.beginPath();
          ctx.moveTo(stopX - s2, yStop - s2);
          ctx.lineTo(stopX + s2, yStop + s2);
          ctx.moveTo(stopX + s2, yStop - s2);
          ctx.lineTo(stopX - s2, yStop + s2);
          ctx.stroke();
          ctx.font = '500 10px ui-monospace, JetBrains Mono, monospace';
          ctx.fillStyle = AC.rgba(AC.accent, a);
          ctx.fillText('THE LAST MILE', stopX - 42, yStop - 16);
          // the gap it never crosses, drawn to the window it should have reached
          ctx.setLineDash([3, 6]);
          ctx.strokeStyle = AC.rgba(AC.accent, a * 0.55);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(stopX + s2 + 4, yStop);
          ctx.lineTo(hx - hw * 0.2, base - hh * 0.55);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      /* ---- rain, only while the storm holds ---- */
      if (storm > 0.02) {
        ctx.strokeStyle = `rgba(178,196,204,${0.30 * storm})`;
        ctx.lineWidth = 1;
        const fall = reduce ? 0 : t;
        for (const d of DROPS) {
          const y = ((d.y + fall * d.sp * 0.6) % 1) * H;
          const x = (d.x * W + storm * 40) % W;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 5 * storm, y + d.len * H);
          ctx.stroke();
        }
      }

      /* ---- vignette ---- */
      const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.22, W / 2, H * 0.5, H);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, `rgba(3,5,4,${0.7 - 0.25 * dawn})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      /* ---- copy ---- */
      const n = beatRefs.current.length;
      for (let i = 0; i < n; i++) {
        const el = beatRefs.current[i];
        if (!el) continue;
        const a0 = i / n;
        const b0 = (i + 1) / n;
        const inP = i === 0 ? 1 : seg(p, a0, a0 + 0.34 / n);
        const outP = i === n - 1 ? 0 : seg(p, b0 - 0.26 / n, b0);
        const o = Math.min(inP, 1 - outP);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - inP) * 24 - outP * 18).toFixed(1)}px, 0)`;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section ref={secRef} className="me-jstory" aria-label="One house on the bank, across twenty-seven years">
      <div className="me-jstory-pin">
        <canvas ref={cvRef} className="me-jstory-canvas" />
        <div className="me-wrap me-jstory-copy">
          {BEATS.map((b, i) => (
            <div
              key={b.k}
              ref={(el) => {
                beatRefs.current[i] = el;
              }}
              className="me-jstory-beat"
            >
              <span className="me-eyebrow" style={{ color: 'var(--art-accent-hi)' }}>
                {b.k}
              </span>
              <p className="me-display me-jstory-h">{b.h}</p>
              <p className="me-jstory-s">{b.s}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
