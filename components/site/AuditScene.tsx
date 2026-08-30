'use client';

import { useEffect, useRef } from 'react';

/* ==========================================================================
   The relabel audit, as an animation rather than a paragraph.

   143 validated flood events are drawn where our labeller *put* them: snapped
   to the nearest pilot city inside 120 km. Scroll draws that radius, and then
   every event flies back to the river it actually happened on. What is left on
   the Mahanadi is one dot.

   The motion is the argument: you watch the evidence leave the river we
   claimed it for. Procedural canvas, no assets.
   ========================================================================== */

type Basin = 'Baitarani' | 'Brahmani' | 'Rushikulya' | 'Mahanadi';

const BASIN_COLOR: Record<Basin, string> = {
  Baitarani: '#4fa89c',
  Brahmani: '#7fb08a',
  Rushikulya: '#8e9a93',
  Mahanadi: '#c4622f',
};

/* schematic courses in 0..1 space, west to east */
const RIVERS: Record<Basin, [number, number][]> = {
  Baitarani: [
    [0.10, 0.18],
    [0.34, 0.26],
    [0.58, 0.33],
    [0.80, 0.46],
    [0.94, 0.60],
  ],
  Brahmani: [
    [0.06, 0.32],
    [0.30, 0.38],
    [0.55, 0.44],
    [0.78, 0.54],
    [0.94, 0.64],
  ],
  Mahanadi: [
    [0.04, 0.60],
    [0.28, 0.62],
    [0.52, 0.64],
    [0.74, 0.67],
    [0.94, 0.72],
  ],
  Rushikulya: [
    [0.24, 0.90],
    [0.44, 0.88],
    [0.64, 0.87],
    [0.82, 0.88],
  ],
};

/* what the relabel audit actually found */
const COUNTS: [Basin, number][] = [
  ['Baitarani', 79],
  ['Rushikulya', 34],
  ['Brahmani', 29],
  ['Mahanadi', 1],
];

const CUTTACK: [number, number] = [0.62, 0.655]; // on the Mahanadi, lower reach

function alongRiver(basin: Basin, t: number): [number, number] {
  const pts = RIVERS[basin];
  const f = Math.max(0, Math.min(0.999, t)) * (pts.length - 1);
  const i = Math.floor(f);
  const u = f - i;
  const a = pts[i];
  const b = pts[Math.min(pts.length - 1, i + 1)];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));

export default function AuditScene() {
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

    /* ---- build the 143 events, deterministically ---- */
    const rnd = (i: number) => {
      const n = Math.sin(i * 12.9898) * 43758.5453;
      return n - Math.floor(n);
    };
    type Ev = { basin: Basin; tx: number; ty: number; sx: number; sy: number; d: number };
    const EVENTS: Ev[] = [];
    let k = 0;
    for (const [basin, n] of COUNTS) {
      for (let j = 0; j < n; j++, k++) {
        // where it actually happened, spread along its own river
        const t = 0.12 + (j / Math.max(1, n - 1)) * 0.76 + (rnd(k) - 0.5) * 0.06;
        const [rx, ry] = alongRiver(basin, t);
        const tx = rx + (rnd(k + 700) - 0.5) * 0.03;
        const ty = ry + (rnd(k + 900) - 0.5) * 0.028;
        // where the labeller put it: clustered on Cuttack
        const ang = rnd(k + 1300) * Math.PI * 2;
        const rad = 0.012 + rnd(k + 1500) * 0.055;
        EVENTS.push({
          basin,
          tx,
          ty,
          sx: CUTTACK[0] + Math.cos(ang) * rad * 1.5,
          sy: CUTTACK[1] + Math.sin(ang) * rad,
          d: rnd(k + 2100),
        });
      }
    }

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

    // the map sits in the right-hand two thirds, clear of the copy
    const box = () => {
      const pad = Math.min(W, H) * 0.06;
      const left = W > 900 ? W * 0.34 : pad;
      return { x: left, y: pad, w: W - left - pad, h: H - pad * 2 };
    };
    const P = (nx: number, ny: number): [number, number] => {
      const b = box();
      return [b.x + nx * b.w, b.y + ny * b.h];
    };

    const draw = (ms: number) => {
      raf = requestAnimationFrame(draw);
      const r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight || document.hidden) return;

      const span = sec.offsetHeight - window.innerHeight;
      const target = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
      shown += (target - shown) * (reduce ? 1 : 0.1);
      const p = shown;
      const t = ms * 0.001;

      ctx.clearRect(0, 0, W, H);

      /* ---- rivers ---- */
      (Object.keys(RIVERS) as Basin[]).forEach((basin) => {
        const revealed = seg(p, 0.5, 0.72);
        const isM = basin === 'Mahanadi';
        ctx.strokeStyle = isM
          ? `rgba(196, 98, 47, ${0.32 + 0.5 * revealed})`
          : `rgba(140, 152, 146, ${0.16 + 0.42 * revealed})`;
        ctx.lineWidth = isM ? 2.4 : 1.8;
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const [x, y] = P(...alongRiver(basin, i / 60));
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();

        // name each river once it matters
        if (revealed > 0.15) {
          const [lx, ly] = P(...alongRiver(basin, 0.06));
          ctx.font = '500 10px ui-monospace, JetBrains Mono, monospace';
          ctx.fillStyle = isM
            ? `rgba(196, 98, 47, ${revealed})`
            : `rgba(154, 149, 132, ${revealed * 0.9})`;
          ctx.fillText(basin.toUpperCase(), lx, ly - 8);
        }
      });

      /* ---- the 120 km snap radius ---- */
      const ringP = seg(p, 0.16, 0.42);
      if (ringP > 0) {
        const [cx, cy] = P(...CUTTACK);
        const b = box();
        const rr = 0.30 * b.w * ease(ringP);
        ctx.setLineDash([6, 7]);
        ctx.strokeStyle = `rgba(224, 160, 90, ${0.75 * ringP * (1 - seg(p, 0.72, 0.9))})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        if (ringP > 0.6) {
          ctx.font = '500 10px ui-monospace, JetBrains Mono, monospace';
          ctx.fillStyle = `rgba(224, 160, 90, ${(ringP - 0.6) / 0.4})`;
          ctx.fillText('120 km SNAP RADIUS', cx - rr + 6, cy - rr + 16);
        }
      }

      /* ---- the events ---- */
      const fly = seg(p, 0.46, 0.80);
      const dim = seg(p, 0.84, 1.0);
      for (const e of EVENTS) {
        // stagger the flight so the migration reads as a movement, not a cut
        const own = ease(Math.max(0, Math.min(1, (fly - e.d * 0.32) / 0.68)));
        const nx = e.sx + (e.tx - e.sx) * own;
        const ny = e.sy + (e.ty - e.sy) * own;
        const [x, y] = P(nx, ny);

        const isM = e.basin === 'Mahanadi';
        // at the end everything but the single Mahanadi event falls away
        const alpha = isM ? 1 : 1 - dim * 0.88;
        const col = own < 0.15 ? '#e0a05a' : BASIN_COLOR[e.basin];

        if (isM && dim > 0.2) {
          ctx.beginPath();
          ctx.arc(x, y, 9 + Math.sin(t * 2.4) * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196, 98, 47, ${0.18 * dim})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(x, y, isM ? 4.2 : 2.6, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      /* ---- Cuttack, the city everything was snapped to ---- */
      const [cx, cy] = P(...CUTTACK);
      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ede9de';
      ctx.fill();
      ctx.font = '500 11px ui-monospace, JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(237,233,222,.92)';
      ctx.fillText('Cuttack', cx + 10, cy + 4);

      /* ---- the count that survives ---- */
      if (dim > 0.25) {
        const [mx, my] = P(...alongRiver('Mahanadi', 0.5));
        ctx.font = '500 11px ui-monospace, JetBrains Mono, monospace';
        ctx.fillStyle = `rgba(224,160,90,${dim})`;
        ctx.fillText('1 OF 143 IS MAHANADI', mx - 60, my + 30);
      }

      /* ---- captions ---- */
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
        // CSS centres the beat with top:50%, so the nudge rides on top of it
        el.style.transform = `translate3d(0, calc(-50% + ${((1 - inP) * 24 - outP * 18).toFixed(1)}px), 0)`;
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

  const BEATS = [
    {
      k: '01 · what we published',
      h: 'One hundred and forty-three validated positives.',
      s: 'Every one of them counted toward a 99.3% detection rate, and that number led every deck we had.',
    },
    {
      k: '02 · how they were labelled',
      h: 'Each one snapped to the nearest pilot city within 120 km.',
      s: 'In Odisha that radius crosses whole basins. Watch what it swept in.',
    },
    {
      k: '03 · where they actually were',
      h: 'They belonged to other rivers.',
      s: 'Baitarani 79. Rushikulya 34. Brahmani 29. The engine had been scored on water we were not claiming to watch.',
    },
    {
      k: '04 · what was left',
      h: 'One of 143 was Mahanadi.',
      s: 'We retired the number, published the audit, and put the precision problem it exposed on the public site.',
    },
  ];

  return (
    <section ref={secRef} className="me-audit" aria-label="The relabel audit">
      <div className="me-audit-pin">
        <canvas ref={cvRef} className="me-audit-canvas" />
        <div className="me-wrap me-audit-copy">
          {BEATS.map((b, i) => (
            <div
              key={b.k}
              ref={(el) => {
                beatRefs.current[i] = el;
              }}
              className="me-audit-beat"
            >
              <span className="me-eyebrow" style={{ color: '#e0a05a' }}>
                {b.k}
              </span>
              <p className="me-display me-audit-h">{b.h}</p>
              <p className="me-audit-s">{b.s}</p>
            </div>
          ))}
        </div>
        <p className="me-audit-note">
          Schematic. Basin courses are indicative; the event counts and distances are from the
          relabel audit.
        </p>
      </div>
    </section>
  );
}
