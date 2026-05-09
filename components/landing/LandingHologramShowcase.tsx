'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Activity, AlertTriangle, Map, LineChart } from 'lucide-react';

type Card = {
  title: string;
  caption: string;
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  body: React.ReactNode;
  accent: string;
};

const cards: Card[] = [
  {
    title: 'Risk surface',
    caption: 'risk_score · rule · ml · final',
    Icon: Activity,
    accent: 'from-cyan-500/25 to-blue-600/10',
    body: (
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-cyan-100/85">
        {['risk_score', 'rule_score', 'ml_score', 'final_score', 'severity', 'trend'].map((k) => (
          <div key={k} className="rounded-md border border-cyan-400/20 bg-black/40 px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-widest text-slate-500">{k}</p>
            <p className="text-cyan-200">live</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Geospatial theatre',
    caption: 'mapbox · districts · severity',
    Icon: Map,
    accent: 'from-violet-500/20 to-fuchsia-500/10',
    body: (
      <div className="relative h-32 overflow-hidden rounded-md border border-violet-400/20 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(167,139,250,0.18),transparent_70%)]">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'linear-gradient(rgba(167,139,250,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.18) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {[
          { t: '20%', l: '30%', c: '#22d3ee' },
          { t: '54%', l: '45%', c: '#f59e0b' },
          { t: '70%', l: '70%', c: '#ef4444' },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute h-2.5 w-2.5 rounded-full"
            style={{ top: p.t, left: p.l, background: p.c }}
          />
        ))}
      </div>
    ),
  },
  {
    title: 'Alert stream',
    caption: 'active-first · severity tags',
    Icon: AlertTriangle,
    accent: 'from-amber-500/20 to-rose-500/10',
    body: (
      <div className="space-y-1.5 text-[11px]">
        {[
          { s: 'critical', t: 'Mahanadi spike · Cuttack' },
          { s: 'warning', t: 'Rainfall anomaly · Puri' },
          { s: 'info', t: 'Replay job complete' },
        ].map((a, i) => (
          <div key={i} className="flex items-center justify-between rounded-md border border-amber-400/20 bg-black/40 px-2 py-1.5">
            <span className="truncate text-slate-200">{a.t}</span>
            <span
              className={`ml-2 shrink-0 rounded-full px-1.5 py-0.5 font-mono uppercase tracking-wider ${
                a.s === 'critical'
                  ? 'bg-red-500/20 text-red-200'
                  : a.s === 'warning'
                    ? 'bg-amber-500/20 text-amber-200'
                    : 'bg-cyan-500/20 text-cyan-200'
              }`}
            >
              {a.s}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Forecast deck',
    caption: 'rainfall · baseline · horizon',
    Icon: LineChart,
    accent: 'from-emerald-500/20 to-teal-500/10',
    body: (
      <svg viewBox="0 0 200 80" className="h-32 w-full">
        <defs>
          <linearGradient id="line-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,60 C20,50 40,30 60,42 C80,55 100,28 120,32 C140,36 160,18 200,22 L200,80 L0,80 Z"
          fill="url(#line-fill)"
        />
        <path
          d="M0,60 C20,50 40,30 60,42 C80,55 100,28 120,32 C140,36 160,18 200,22"
          stroke="#34d399"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M0,55 C30,52 50,48 90,46 C130,44 160,42 200,40"
          stroke="#f59e0b"
          strokeWidth="1"
          strokeDasharray="3 3"
          fill="none"
        />
      </svg>
    ),
  },
];

export default function LandingHologramShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-15% 0px -15% 0px', amount: 0.1 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const stackRotateY = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const stackRotateX = useTransform(scrollYProgress, [0, 1], [8, -2]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-[#050816] via-[#070b1a] to-[#050816] px-4 py-28 md:px-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_30%,rgba(99,102,241,0.1),transparent_60%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.4em] text-cyan-400/80">Hologram deck</p>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Operational surfaces, <br />
            stacked in{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              parallel
            </span>
            .
          </h2>
          <p className="mt-5 max-w-md text-slate-400">
            Risk, geospatial, alerts, and forecasts. Composable surfaces driven by a typed API SDK and React Query.
            Slide between them like a HUD.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
            {['typed sdk', 'zod validated', 'widget-isolated', 'replayable'].map((t) => (
              <span key={t} className="rounded-full border border-cyan-400/20 bg-slate-950/70 px-3 py-1.5">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative h-[480px] [perspective:1300px] md:h-[540px]">
          <motion.div
            style={inView ? { rotateY: stackRotateY, rotateX: stackRotateX } : undefined}
            className="absolute inset-0 [transform-style:preserve-3d]"
          >
            {cards.map((card, i) => {
              const offset = i - (cards.length - 1) / 2;
              return (
                <div
                  key={card.title}
                  className="absolute left-1/2 top-1/2 w-[88%] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950 p-5 [transform-style:preserve-3d]"
                  style={{
                    transform: `translate3d(${offset * 38}px, ${offset * 22}px, ${
                      -Math.abs(offset) * 60
                    }px) rotateY(${offset * 8}deg)`,
                    zIndex: 10 - Math.abs(offset),
                  }}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${card.accent} opacity-60`}
                  />
                  <div className="relative">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/25 bg-black/40 text-cyan-200">
                          <card.Icon size={16} strokeWidth={1.5} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{card.title}</p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500">{card.caption}</p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-300/70">live</span>
                    </div>
                    {card.body}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
