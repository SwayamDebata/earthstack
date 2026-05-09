'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

/**
 * CSS-only 3D "data tunnel". Performance-tuned:
 * - Background grid is a static SVG (no continuous keyframe animation)
 * - Scroll listeners + animations are gated with useInView so they don't run off-screen
 * - No backdrop-filter / box-shadow pulses (those killed scroll perf earlier)
 */
export default function Landing3DTunnel() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: '-15% 0px -15% 0px', amount: 0.1 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const ringScale = useTransform(scrollYProgress, [0, 1], [0.92, 1.08]);

  return (
    <section
      ref={ref}
      className="relative min-h-[80vh] overflow-hidden bg-[#03060f] px-4 py-24 md:px-8"
      aria-label="Data tunnel"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(34,211,238,0.15),transparent_60%)]" />

      {/* Static perspective tunnel. No JS scroll transforms, no keyframes */}
      <div className="pointer-events-none absolute inset-0 [perspective:1100px]">
        <div
          className="absolute inset-x-[-25%] bottom-0 top-1/2 origin-bottom"
          style={{ transform: 'rotateX(65deg)' }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(34,211,238,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.18) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              maskImage: 'linear-gradient(to top, black, transparent 85%)',
              WebkitMaskImage: 'linear-gradient(to top, black, transparent 85%)',
            }}
          />
        </div>
        <div
          className="absolute inset-x-[-25%] bottom-1/2 top-0 origin-top"
          style={{ transform: 'rotateX(-65deg)' }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(34,211,238,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.18) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)',
            }}
          />
        </div>
      </div>

      {/* Receding rings. Only animates while in view */}
      <motion.div
        style={inView ? { scale: ringScale } : undefined}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full border border-cyan-400/25"
            style={{
              width: 240 + i * 110,
              height: 240 + i * 110,
              transform: `translate(-50%, -50%) rotate(${i * 12}deg)`,
              opacity: 0.85 - i * 0.15,
              borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
            }}
          />
        ))}
      </motion.div>

      {/* Static decorative dots */}
      <div className="pointer-events-none absolute inset-0">
        {[
          { top: '18%', left: '12%' },
          { top: '28%', right: '18%' },
          { top: '70%', left: '22%' },
          { top: '74%', right: '14%' },
          { top: '46%', left: '8%' },
          { top: '52%', right: '7%' },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300/80"
            style={p}
          />
        ))}
      </div>

      <motion.div
        style={inView ? { y: headlineY } : undefined}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.4em] text-cyan-400/80">Data tunnel</p>
        <h2 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
          Step inside the{' '}
          <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
            live grid
          </span>
        </h2>
        <p className="mt-5 max-w-xl text-base text-slate-400 md:text-lg">
          Every region streams through a single addressable surface. Observation in, decisions out, with full
          traceability.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-3 text-left text-xs font-mono text-cyan-200/80 md:gap-5">
          {[
            { k: 'channels', v: 'rainfall · rivers · ml' },
            { k: 'cadence', v: 'live · replay · forecast' },
            { k: 'scope', v: 'Odisha · expandable' },
          ].map((it) => (
            <div key={it.k} className="rounded-lg border border-cyan-400/15 bg-slate-950/80 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{it.k}</p>
              <p className="mt-1 text-cyan-200">{it.v}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050816] to-transparent" />
    </section>
  );
}
