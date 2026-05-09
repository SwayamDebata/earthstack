'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Activity, Brain, Radio } from 'lucide-react';

type Stage = {
  badge: string;
  title: string;
  body: string;
  glyph: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  metrics: { label: string; value: string }[];
};

const stages: Stage[] = [
  {
    badge: '01 · OBSERVE',
    title: 'Capture every signal that matters',
    body: 'Rainfall, river levels, satellite features, and field telemetry, fused without dropping provenance.',
    glyph: 'OBS',
    icon: Radio,
    metrics: [
      { label: 'rainfall', value: 'streaming' },
      { label: 'rivers', value: 'streaming' },
      { label: 'features', value: 'streaming' },
      { label: 'satellite', value: 'tiled' },
      { label: 'field IoT', value: 'queued' },
      { label: 'cadence', value: '60s' },
    ],
  },
  {
    badge: '02 · REASON',
    title: 'Rules, ML, and replay, together',
    body: 'Run rule-based scoring beside ML inference, with shadow-mode comparison so trust is earned, not assumed.',
    glyph: 'RSN',
    icon: Brain,
    metrics: [
      { label: 'rule_score', value: 'computed' },
      { label: 'ml_score', value: 'shadow' },
      { label: 'final_score', value: 'fused' },
      { label: 'replay', value: 'on demand' },
      { label: 'logs', value: 'observed' },
      { label: 'audit', value: 'enabled' },
    ],
  },
  {
    badge: '03 · ACT',
    title: 'Decisions land in operations, fast',
    body: 'Alerts feed, forecast deck, and replay panels are wired end-to-end. No extra "BI tool" required.',
    glyph: 'ACT',
    icon: Activity,
    metrics: [
      { label: 'alerts', value: 'active first' },
      { label: 'severity', value: 'tagged' },
      { label: 'forecast', value: 'horizon 6h' },
      { label: 'replay', value: 'reproducible' },
      { label: 'distribution', value: 'API + UI' },
      { label: 'SLA', value: 'sub-minute' },
    ],
  },
];

/**
 * Sticky-scroll observe → reason → act sequence.
 * Single useScroll listener + one state update on threshold crossing.
 * All visual swaps use CSS transitions, so no per-frame motion values.
 */
export default function LandingPinnedReveal() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(stages.length - 1, Math.max(0, Math.floor(v * stages.length)));
    setActive((prev) => (prev === idx ? prev : idx));
  });

  return (
    <section
      ref={ref}
      className="relative bg-[#040814] px-4 md:px-8"
      style={{ height: '180vh' }}
      aria-label="Operating loop"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_50%,rgba(34,211,238,0.08),transparent_60%)]" />

        <div className="relative mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col justify-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.4em] text-cyan-400/80">The loop</p>
            <h2 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
              Observe → reason →{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                act
              </span>
            </h2>
            <p className="mt-5 max-w-md text-slate-400">
              Scroll through ModelEarth&apos;s operating loop. Each stage is a real surface in the dashboard, not a marketing claim.
            </p>

            <ol className="mt-8 space-y-3">
              {stages.map((s, i) => {
                const isActive = i === active;
                return (
                  <li
                    key={s.badge}
                    className={`rounded-xl border p-4 transition-[opacity,transform,border-color,background-color] duration-500 ${
                      isActive
                        ? 'border-cyan-400/40 bg-cyan-500/[0.06] opacity-100'
                        : 'translate-x-[-2px] border-white/10 bg-slate-950/60 opacity-50'
                    }`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">{s.badge}</p>
                    <p className="mt-1 text-base font-semibold text-white">{s.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{s.body}</p>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Right stage. CSS transitions only, no per-frame transforms. */}
          <div className="relative hidden h-[440px] [perspective:1200px] md:block">
            {stages.map((s, i) => {
              const isActive = i === active;
              return <Slide key={s.badge} stage={s} isActive={isActive} index={i} active={active} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Slide({
  stage,
  isActive,
  index,
  active,
}: {
  stage: Stage;
  isActive: boolean;
  index: number;
  active: number;
}) {
  const direction = index < active ? -1 : index > active ? 1 : 0;

  const transform = isActive
    ? 'translateY(0) rotateY(0deg) scale(1)'
    : `translateY(${direction * 30}px) rotateY(${direction * 18}deg) scale(0.96)`;

  return (
    <motion.div
      initial={false}
      style={{ opacity: isActive ? 1 : 0, transform, pointerEvents: isActive ? 'auto' : 'none' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-400/25 bg-slate-950 p-7">
        {/* Subtle scanline */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(34,211,238,0.4) 2px, rgba(34,211,238,0.4) 3px)',
          }}
        />
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full border border-cyan-400/20" />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/25 bg-black/40 text-cyan-200">
                <stage.icon size={16} strokeWidth={1.5} />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">{stage.badge}</span>
            </div>
            <span className="rounded-md border border-cyan-400/20 bg-black/40 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200">
              {stage.glyph}
            </span>
          </div>

          <h3 className="mt-6 text-2xl font-semibold text-white">{stage.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{stage.body}</p>

          {/* Real telemetry tiles. No more empty boxes. */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {stage.metrics.map((m, i) => (
              <div
                key={m.label}
                className="rounded-md border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950 p-2.5"
              >
                <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{m.label}</p>
                <p className="mt-1 truncate font-mono text-[11px] text-cyan-200">{m.value}</p>
                {/* Tiny activity bar, deterministic per index */}
                <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400/70 to-violet-400/60"
                    style={{ width: `${30 + ((i + index * 7) % 10) * 7}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <span>session://modelearth/{stage.glyph.toLowerCase()}</span>
            <span className="flex items-center gap-1.5 text-cyan-300/80">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              live
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
