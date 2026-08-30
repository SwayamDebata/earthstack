'use client';

import { useEffect, useRef } from 'react';

/* ==========================================================================
   "The night the water came" — a full-bleed cinematic scene in the Alt Carbon
   ELI5 idiom: one pinned canvas, layered art, and captions that cross-fade as
   you scroll through it.

   Everything is procedural 2D canvas, so there are no image assets to ship and
   the scene reflows to any viewport. Scroll progress drives the water level,
   the rain density, how dark the sky gets, and which window is still lit.
   ========================================================================== */

const BEATS = [
  {
    time: '22:40',
    line: 'Six hours of rain upstream, and the river is still inside its banks.',
    sub: 'The engine has been scoring this location every thirty minutes since May.',
  },
  {
    time: '01:15',
    line: 'The gauge at Akhuapada passes its danger level.',
    sub: '18.45 metres against 18.33. The rule stops decaying yesterday’s rain.',
  },
  {
    time: '03:14',
    line: 'Someone has to wake a town.',
    sub: 'A score, three reasons, the closest past event, and one action. Small enough to read at three.',
  },
  {
    time: 'The only deadline',
    line: 'The warning has to arrive before the water does.',
    sub: 'Everything else on this site is instrumentation for that sentence.',
  },
];

export default function RisingWater() {
  const secRef = useRef<HTMLElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cv = cvRef.current;
    const sec = secRef.current;
    if (!cv || !sec) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;

    /* ---- deterministic scatter, so the village does not reshuffle on resize ---- */
    const rnd = (i: number) => {
      const n = Math.sin(i * 127.1) * 43758.5453;
      return n - Math.floor(n);
    };

    type House = { x: number; w: number; h: number; lit: boolean };
    const HOUSES: House[] = Array.from({ length: 9 }, (_, i) => ({
      x: 0.06 + rnd(i) * 0.86,
      w: 0.035 + rnd(i + 40) * 0.03,
      h: 0.05 + rnd(i + 80) * 0.035,
      lit: rnd(i + 120) > 0.45,
    }));
    const PALMS = Array.from({ length: 7 }, (_, i) => ({
      x: 0.04 + rnd(i + 200) * 0.9,
      h: 0.09 + rnd(i + 240) * 0.06,
    }));
    const DROPS = Array.from({ length: 260 }, (_, i) => ({
      x: rnd(i + 300),
      y: rnd(i + 340),
      len: 0.02 + rnd(i + 380) * 0.035,
      sp: 0.5 + rnd(i + 420) * 0.9,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const progress = () => {
      const r = sec.getBoundingClientRect();
      const span = sec.offsetHeight - window.innerHeight;
      return span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
    };

    let shown = 0;

    const draw = (ms: number) => {
      raf = requestAnimationFrame(draw);
      const r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight || document.hidden) return;

      const target = progress();
      shown += (target - shown) * (reduce ? 1 : 0.09);
      const p = shown;
      const t = ms * 0.001;

      // horizon and the waterline: the river climbs the frame as you scroll
      const horizon = H * 0.52;
      const bank = H * 0.72;
      const water = bank - (bank - horizon * 1.06) * p;

      /* ---- sky: dusk draining to night as the night goes on ---- */
      const sky = ctx.createLinearGradient(0, 0, 0, horizon);
      const k = p;
      sky.addColorStop(0, `rgb(${10 + 6 * (1 - k)}, ${12 + 8 * (1 - k)}, ${24 + 14 * (1 - k)})`);
      sky.addColorStop(0.7, `rgb(${26 + 26 * (1 - k)}, ${22 + 18 * (1 - k)}, ${24 + 10 * (1 - k)})`);
      sky.addColorStop(1, `rgb(${52 + 42 * (1 - k)}, ${38 + 26 * (1 - k)}, ${28 + 10 * (1 - k)})`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, horizon + 2);

      /* ---- far ridge ---- */
      ctx.fillStyle = '#14170f';
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      for (let x = 0; x <= W; x += 12) {
        const n = Math.sin(x * 0.004) * 14 + Math.sin(x * 0.011 + 2) * 8;
        ctx.lineTo(x, horizon - 16 - n);
      }
      ctx.lineTo(W, horizon + 4);
      ctx.lineTo(0, horizon + 4);
      ctx.closePath();
      ctx.fill();

      /* ---- ground between ridge and water ---- */
      ctx.fillStyle = '#1a1c12';
      ctx.fillRect(0, horizon, W, H - horizon);

      /* ---- village: houses drown from the base up as the water climbs ---- */
      for (const h of HOUSES) {
        const hx = h.x * W;
        const hw = h.w * W;
        const hh = h.h * H;
        const base = bank - 6;
        ctx.fillStyle = '#0e100a';
        ctx.fillRect(hx, base - hh, hw, hh);
        ctx.beginPath();
        ctx.moveTo(hx - hw * 0.14, base - hh);
        ctx.lineTo(hx + hw * 0.5, base - hh - hh * 0.42);
        ctx.lineTo(hx + hw * 1.14, base - hh);
        ctx.closePath();
        ctx.fillStyle = '#171a10';
        ctx.fill();

        // one window stays lit longer than the rest: somebody is awake
        const stillLit = h.lit && p < 0.82;
        if (stillLit) {
          const flick = 0.72 + 0.28 * Math.sin(t * 2.2 + h.x * 30);
          ctx.fillStyle = `rgba(224, 160, 90, ${(0.5 + 0.35 * flick) * (1 - p * 0.5)})`;
          ctx.fillRect(hx + hw * 0.32, base - hh * 0.62, hw * 0.3, hh * 0.3);
        }
      }

      /* ---- palms ---- */
      for (const pl of PALMS) {
        const px = pl.x * W;
        const ph = pl.h * H;
        ctx.strokeStyle = '#0d0f09';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(px, bank - 4);
        ctx.quadraticCurveTo(px + 5, bank - ph * 0.6, px + 2, bank - ph);
        ctx.stroke();
        for (let a = 0; a < 5; a++) {
          const ang = -Math.PI / 2 + (a - 2) * 0.55 + Math.sin(t * 0.8 + a) * 0.05;
          ctx.beginPath();
          ctx.moveTo(px + 2, bank - ph);
          ctx.quadraticCurveTo(
            px + 2 + Math.cos(ang) * ph * 0.34,
            bank - ph + Math.sin(ang) * ph * 0.3,
            px + 2 + Math.cos(ang) * ph * 0.52,
            bank - ph + Math.sin(ang) * ph * 0.42 + 8,
          );
          ctx.stroke();
        }
      }

      /* ---- the water itself ---- */
      const wg = ctx.createLinearGradient(0, water, 0, H);
      wg.addColorStop(0, 'rgba(30, 74, 70, .93)');
      wg.addColorStop(1, 'rgba(12, 30, 32, .99)');
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.moveTo(0, water);
      for (let x = 0; x <= W; x += 8) {
        ctx.lineTo(x, water + Math.sin(x * 0.02 + t * 1.6) * 2.2 + Math.sin(x * 0.05 - t) * 1.1);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // reflection bands, brighter as the surface widens
      ctx.strokeStyle = `rgba(122, 178, 170, ${0.1 + 0.16 * p})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const y = water + 10 + i * ((H - water) / 16);
        const w2 = (0.25 + rnd(i + 500) * 0.5) * W;
        const x0 = ((rnd(i + 540) * W + t * 9 * (i % 2 ? 1 : -1)) % W) - w2 / 2;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0 + w2, y);
        ctx.stroke();
      }

      // the danger line, crossed a little past the middle of the scene
      const dl = bank - (bank - horizon * 1.06) * 0.45;
      const crossed = water <= dl;
      ctx.setLineDash([7, 7]);
      ctx.strokeStyle = crossed ? 'rgba(196, 98, 47, .95)' : 'rgba(196, 98, 47, .45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, dl);
      ctx.lineTo(W, dl);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '500 10px ui-monospace, JetBrains Mono, monospace';
      ctx.fillStyle = crossed ? 'rgba(224, 160, 90, .95)' : 'rgba(224, 160, 90, .5)';
      ctx.fillText(
        crossed ? 'DANGER LEVEL 18.33 m · CROSSED' : 'DANGER LEVEL 18.33 m',
        W - 260,
        dl - 9,
      );

      /* ---- rain, heavier as the night goes on ---- */
      const rainAlpha = 0.16 + 0.3 * p;
      ctx.strokeStyle = `rgba(190, 205, 210, ${rainAlpha})`;
      ctx.lineWidth = 1;
      const fall = reduce ? 0 : t;
      for (const d of DROPS) {
        const y = ((d.y + fall * d.sp * 0.55) % 1) * H;
        const x = d.x * W + Math.sin(y * 0.01) * 6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 3, y + d.len * H);
        ctx.stroke();
      }

      /* ---- vignette ---- */
      const vg = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.2, W / 2, H * 0.5, H * 0.95);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(4,6,4,.72)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      /* ---- captions cross-fade on the same progress ---- */
      const n = BEATS.length;
      for (let i = 0; i < n; i++) {
        const el = beatRefs.current[i];
        if (!el) continue;
        const a0 = i / n;
        const b0 = (i + 1) / n;
        const inP = i === 0 ? 1 : Math.max(0, Math.min(1, (p - a0) / (0.34 / n)));
        const outP =
          i === n - 1 ? 0 : Math.max(0, Math.min(1, (p - (b0 - 0.26 / n)) / (0.26 / n)));
        const o = Math.min(inP, 1 - outP);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - inP) * 26 - outP * 20).toFixed(1)}px, 0)`;
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
    <section ref={secRef} className="me-rise" aria-label="The night the water came">
      <div className="me-rise-pin">
        <canvas ref={cvRef} className="me-rise-canvas" />

        {BEATS.map((b, i) => (
          <div
            key={b.time}
            ref={(el) => {
              beatRefs.current[i] = el;
            }}
            className="me-rise-beat"
          >
            <span className="me-eyebrow" style={{ color: '#e0a05a' }}>
              {b.time}
            </span>
            <p className="me-display me-rise-line">{b.line}</p>
            <p className="me-rise-sub">{b.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
