'use client';

import { useEffect, useRef } from 'react';

/* ==========================================================================
   The reading-page ambience.

   Weather, moving very slowly, at almost no contrast: soft haze banks drifting
   across the page, a slow current beneath them, and a few motes catching the
   light. It is deliberately quiet — this sits behind body text, so anything
   with edges or speed would make the page harder to read, not nicer.

   Everything is drawn in the page's own paper tones, so it works in all three
   themes, and it stops completely under reduced motion.
   ========================================================================== */

export default function BlogAmbience() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rnd = (i: number) => {
      const n = Math.sin(i * 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    // haze banks: big, soft, and slower than the eye tracks. Two tints, so the
    // page breathes warm and cool rather than just getting dirtier.
    const TINTS = ['196, 98, 47', '79, 168, 156', '224, 160, 90'];
    const BANKS = Array.from({ length: 9 }, (_, i) => ({
      x: rnd(i),
      y: 0.08 + rnd(i + 20) * 0.84,
      r: 0.22 + rnd(i + 40) * 0.3,
      sp: 0.005 + rnd(i + 60) * 0.009,
      a: 0.1 + rnd(i + 80) * 0.1,
      tint: TINTS[i % TINTS.length],
      wob: 0.02 + rnd(i + 100) * 0.03,
    }));

    // motes: a handful, drifting up and sideways like dust in a window
    const MOTES = Array.from({ length: 54 }, (_, i) => ({
      x: rnd(i + 200),
      y: rnd(i + 240),
      r: 0.8 + rnd(i + 280) * 2.2,
      sp: 0.008 + rnd(i + 320) * 0.018,
      dr: (rnd(i + 360) - 0.5) * 0.012,
      a: 0.16 + rnd(i + 400) * 0.24,
    }));

    // a slow current across the foot of the page, like light on water
    const BANDS = Array.from({ length: 5 }, (_, i) => ({
      y: 0.62 + i * 0.085,
      w: 0.3 + rnd(i + 500) * 0.4,
      sp: 0.01 + rnd(i + 540) * 0.02,
      a: 0.05 + rnd(i + 580) * 0.06,
    }));

    let raf = 0;
    let W = 0;
    let H = 0;
    let ink = '20, 24, 18';

    const readInk = () => {
      // borrow the page's own ink so the haze belongs to whatever theme is on
      const root = document.querySelector('.me-root');
      if (!root) return;
      const c = getComputedStyle(root).getPropertyValue('--ink').trim();
      const m = /^#([0-9a-f]{6})$/i.exec(c);
      if (m) {
        const n = parseInt(m[1], 16);
        ink = `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readInk();
    };

    const draw = (ms: number) => {
      raf = requestAnimationFrame(draw);
      if (document.hidden) return;
      const t = ms * 0.001;

      ctx.clearRect(0, 0, W, H);

      for (const b of BANKS) {
        const x = ((b.x + t * b.sp) % 1.4 - 0.2) * W;
        const y = b.y * H + Math.sin(t * 0.09 + b.x * 12) * H * b.wob;
        const r = b.r * Math.min(W, H);
        const breathe = 0.75 + 0.25 * Math.sin(t * 0.14 + b.x * 9);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${b.tint}, ${b.a * breathe})`);
        g.addColorStop(0.55, `rgba(${b.tint}, ${b.a * breathe * 0.32})`);
        g.addColorStop(1, `rgba(${b.tint}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }

      // the current
      for (const bd of BANDS) {
        const w = bd.w * W;
        const x = ((bd.y * 3 + t * bd.sp) % 1.5 - 0.25) * W;
        const y = bd.y * H + Math.sin(t * 0.2 + bd.y * 30) * 6;
        const g = ctx.createLinearGradient(x, y, x + w, y);
        g.addColorStop(0, `rgba(79, 168, 156, 0)`);
        g.addColorStop(0.5, `rgba(79, 168, 156, ${bd.a})`);
        g.addColorStop(1, `rgba(79, 168, 156, 0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
      }

      for (const m of MOTES) {
        const y = ((m.y - t * m.sp) % 1 + 1) % 1;
        const x = ((m.x + t * m.dr) % 1 + 1) % 1;
        ctx.beginPath();
        ctx.arc(x * W, y * H, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ink}, ${m.a * (0.45 + 0.55 * Math.sin(t * 0.5 + m.x * 20))})`;
        ctx.fill();
      }
    };

    resize();
    window.addEventListener('resize', resize);
    // the ink changes when the reader switches theme
    const obs = new MutationObserver(readInk);
    const root = document.querySelector('.me-root');
    if (root) obs.observe(root, { attributes: true, attributeFilter: ['data-me-theme'] });

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      obs.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="me-ambience" aria-hidden="true" />;
}
