'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 11) % 100}%`,
  size: 1 + (i % 3),
  delay: (i % 7) * 0.4,
  duration: 4 + (i % 5),
}));

export default function LandingBhoomiG1() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { margin: '-80px', amount: 0.2 });
  const [load3d, setLoad3d] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const stageY = useTransform(scrollYProgress, [0, 1], [48, -48]);
  const copyY = useTransform(scrollYProgress, [0, 1], [32, -24]);
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.35, 0.75, 0.4]);

  useEffect(() => {
    if (inView) setLoad3d(true);
  }, [inView]);

  const applyTilt = useCallback(() => {
    setTilt({ x: pendingRef.current.x, y: pendingRef.current.y });
    rafRef.current = null;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      pendingRef.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      };
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(applyTilt);
      }
    },
    [applyTilt],
  );

  const onPointerLeave = useCallback(() => {
    pendingRef.current = { x: 0, y: 0 };
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(applyTilt);
    }
  }, [applyTilt]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const scrollToHorizon = () => {
    document.getElementById('horizon')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      ref={sectionRef}
      id="bhoomi-g1"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative min-h-[100vh] overflow-hidden bg-[#030806] px-4 py-24 md:px-8 md:py-32"
    >
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_15%_40%,rgba(16,185,129,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_85%_35%,rgba(34,211,238,0.1),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(6,78,59,0.35),transparent_60%)]" />

      {/* Terrain contour grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(52,211,153,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.35) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 85% 70% at 50% 45%, black 20%, transparent 75%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 48px, rgba(34,211,238,0.8) 49px, transparent 50px)`,
        }}
      />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-emerald-300/40 shadow-[0_0_12px_rgba(52,211,153,0.35)]"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animation: `bhoomi-drift ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
              opacity: 0.35 + (p.id % 4) * 0.08,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* LEFT · copy */}
        <motion.div style={{ y: copyY }} className="relative z-10 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-emerald-950/40 via-slate-950/60 to-slate-950/80 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:p-10"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/[0.06] via-transparent to-cyan-400/[0.04]" />
            <div className="pointer-events-none absolute -left-px top-8 h-16 w-px bg-gradient-to-b from-emerald-400/60 to-transparent" />

            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.45em] text-emerald-400/80">
              Bhoomi G1 · In development
            </p>

            <h2 className="text-3xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
              Built for the
              <span className="block bg-gradient-to-r from-emerald-200 via-cyan-100 to-emerald-300 bg-clip-text text-transparent">
                Physical World
              </span>
            </h2>

            <p className="mt-5 text-lg font-medium text-emerald-100/90 md:text-xl">
              A new layer of environmental intelligence is coming.
            </p>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 md:text-base">
              Designed to interact directly with the real world, capturing signals, understanding conditions,
              and powering the next generation of climate intelligence.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={scrollToHorizon}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-emerald-400/35 bg-emerald-500/10 px-7 py-3.5 text-sm font-semibold text-emerald-50 transition duration-300 hover:border-emerald-300/55 hover:bg-emerald-500/20 hover:shadow-[0_0_40px_rgba(52,211,153,0.25)]"
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/15 to-emerald-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative">Explore the Future</span>
                <ArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
                Prototype 01 · Experimental Interface
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT · 3D stage */}
        <motion.div
          ref={stageRef}
          style={{ y: stageY }}
          className="relative order-1 flex min-h-[420px] items-center justify-center lg:order-2 lg:min-h-[560px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[520px]"
            style={{
              transform: `perspective(1200px) rotateY(${tilt.x * 5}deg) rotateX(${-tilt.y * 4}deg)`,
              transition: 'transform 0.35s ease-out',
            }}
          >
            {/* Environmental glow beneath device */}
            <motion.div
              style={{ opacity: glowOpacity }}
              className="pointer-events-none absolute left-1/2 top-[72%] h-32 w-[85%] -translate-x-1/2 rounded-[100%] bg-emerald-400/25 blur-3xl"
            />
            <div className="pointer-events-none absolute left-1/2 top-[68%] h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

            {/* Glass frame */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-slate-950/80 to-[#060809] shadow-[0_32px_100px_rgba(0,0,0,0.55),0_0_60px_rgba(16,185,129,0.08)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />

              {/* Scan pulse */}
              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl">
                <div className="bhoomi-scan absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-emerald-400/12 to-transparent" />
              </div>

              {/* Corner brackets */}
              <span className="pointer-events-none absolute left-3 top-3 z-30 h-4 w-4 border-l border-t border-emerald-400/35" />
              <span className="pointer-events-none absolute right-3 top-3 z-30 h-4 w-4 border-r border-t border-emerald-400/35" />
              <span className="pointer-events-none absolute bottom-3 left-3 z-30 h-4 w-4 border-b border-l border-emerald-400/35" />
              <span className="pointer-events-none absolute bottom-3 right-3 z-30 h-4 w-4 border-b border-r border-emerald-400/35" />

              <div className="bhoomi-float relative aspect-[4/5] w-full sm:aspect-square">
                {load3d ? (
                  <iframe
                    title="Bhoomi G1 prototype"
                    src="/bhoomi-g1.html"
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    allow="autoplay"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#060809]">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Initializing field unit</p>
                  </div>
                )}
              </div>

              <div className="relative border-t border-white/[0.06] px-4 py-3">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400/80" />
                    Signal locked
                  </span>
                  <span className="text-emerald-400/60">Bhoomi G1</span>
                </div>
              </div>
            </div>

            {/* Orbital ring */}
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] border border-emerald-400/[0.07]" />
            <div
              className="pointer-events-none absolute -inset-10 rounded-[2.5rem] border border-cyan-400/[0.04]"
              style={{ transform: `rotate(${tilt.x * 2}deg)` }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
