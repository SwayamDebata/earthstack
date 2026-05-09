'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, Database, ShieldCheck, Sparkles } from 'lucide-react';
import HoloEarth from './HoloEarth';
import BrandMark from './BrandMark';
import VideoModal from './VideoModal';

const VIDEO_SOURCES = ['/videos/1766052690351.mp4', '/videos/1766052873555.mp4', '/videos/1766053030926.mp4'];

const SITE_URL = 'https://www.modelearth.in';

export default function HeroSection() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoSrc, setActiveVideoSrc] = useState(VIDEO_SOURCES[0]);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  /* Direct mapping. No spring physics (springs + Lenis fought the main thread). */
  const globeY = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 48]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.03]);

  const handleOpenVideo = () => {
    const randomIndex = Math.floor(Math.random() * VIDEO_SOURCES.length);
    setActiveVideoSrc(VIDEO_SOURCES[randomIndex]);
    setIsVideoModalOpen(true);
  };

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-[110vh] flex-col items-center justify-center overflow-hidden pt-20"
    >
      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} videoSrc={activeVideoSrc} />

      <nav className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-10">
        <Link href="/" className="group flex cursor-pointer items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/35 bg-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.2)] transition [transform-style:preserve-3d] group-hover:border-cyan-300/50 group-hover:shadow-[0_0_36px_rgba(34,211,238,0.35)]">
            <BrandMark size={44} className="h-9 w-9 object-contain transition-transform duration-500 group-hover:scale-110" priority />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white md:text-2xl">ModelEarth</span>
            <span className="hidden text-[10px] font-mono uppercase tracking-[0.28em] text-cyan-400/70 sm:block">
              Climate intelligence
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
          <a href="#capabilities" className="transition-colors hover:text-white">
            Capabilities
          </a>
          <a href="#platforms" className="transition-colors hover:text-white">
            Platform
          </a>
          <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-cyan-300">
            Website
          </a>
          <Link
            href="/dashboard"
            className="rounded-full border border-cyan-400/30 bg-slate-900/80 px-5 py-2.5 text-white shadow-[0_0_24px_rgba(34,211,238,0.12)] transition hover:border-cyan-300/50 hover:bg-cyan-500/10"
          >
            Command center
          </Link>
        </div>
      </nav>

      <motion.div style={{ y: globeY, scale: scaleBg }} className="absolute inset-0 z-0">
        <HoloEarth />
      </motion.div>

      {/* Radial spotlight */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_65%_50%_at_50%_35%,rgba(34,211,238,0.14),transparent_55%)]" />

      <motion.div style={{ y: contentY, opacity: heroOpacity }} className="relative z-10 container mx-auto px-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-black/60 px-4 py-1.5"
          >
            <Sparkles className="text-cyan-300" size={14} />
            <span className="font-mono text-[11px] tracking-[0.22em] text-cyan-200/90">MODEL EARTH · OPERATIONS SURFACE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mb-6 text-5xl font-bold tracking-tight text-white drop-shadow-2xl md:text-7xl lg:text-8xl"
          >
            <span className="block">Planetary-scale</span>
            <span className="relative mt-1 inline-block">
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(34,211,238,0.35)]">
                resilience intelligence
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="mb-12 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl"
          >
            Flood risk, hydrology, and climate operations, unified in a single, cinematic command experience. Built for
            agencies, infrastructure, and teams who cannot afford toy dashboards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-4 font-bold text-white shadow-[0_0_48px_rgba(34,211,238,0.35)] transition hover:shadow-[0_0_64px_rgba(34,211,238,0.45)]"
            >
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
              <span className="relative flex items-center gap-2">
                Enter mission control <ArrowRight size={20} />
              </span>
            </Link>

            <button
              type="button"
              onClick={handleOpenVideo}
              className="group flex items-center gap-3 rounded-full border border-white/15 px-8 py-4 font-medium text-slate-300 transition hover:border-cyan-400/40 hover:bg-white/5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition group-hover:bg-cyan-500/20">
                <Play size={14} fill="currentColor" />
              </span>
              Watch the story
            </button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.9 }}
        className="absolute left-4 top-[32%] z-20 hidden -translate-y-1/2 xl:block lg:left-8"
      >
        <div className="w-64 rounded-md border border-l-4 border-white/10 border-l-cyan-400 bg-slate-950/85 p-4">
          <div className="mb-2 flex items-center gap-3 text-cyan-300">
            <Database size={18} />
            <span className="text-[10px] font-bold tracking-[0.2em]">DATA MESH</span>
          </div>
          <div className="space-y-2">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full origin-left bg-gradient-to-r from-cyan-400 to-blue-500"
                animate={{ scaleX: [0.15, 0.92, 0.4, 0.88] }}
                style={{ width: '100%' }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-500">Ingest · validate · route to models</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.05, duration: 0.9 }}
        className="absolute right-4 top-[68%] z-20 hidden -translate-y-1/2 text-right xl:block lg:right-8"
      >
        <div className="w-64 rounded-md border border-r-4 border-white/10 border-r-emerald-400 bg-slate-950/85 p-4">
          <div className="mb-2 flex items-center justify-end gap-3 text-emerald-300">
            <span className="text-[10px] font-bold tracking-[0.2em]">TRUST LAYER</span>
            <ShieldCheck size={18} />
          </div>
          <p className="text-sm font-semibold text-white">Policy-grade workflows</p>
          <p className="mt-1 text-[11px] text-slate-500">Audit trails, roles, and controlled replay, by design.</p>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-40 bg-gradient-to-t from-[#050816] via-[#050816]/80 to-transparent" />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-24 left-1/2 z-20 hidden -translate-x-1/2 md:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex h-12 w-7 justify-center rounded-full border border-white/20 pt-2">
          <div className="h-2 w-1 rounded-full bg-cyan-400/80" />
        </div>
      </motion.div>
    </section>
  );
}
