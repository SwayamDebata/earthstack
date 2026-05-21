'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function LandingHorizonCTA() {
  return (
    <section id="horizon" className="relative px-4 py-24 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050816] via-[#0a1628] to-[#050816]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(520px,70vw)] w-[min(900px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.65 }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950 p-10 text-center shadow-[0_0_80px_rgba(34,211,238,0.12)] md:p-14"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full border border-cyan-400/20" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full border border-violet-400/15" />

        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.4em] text-cyan-300/80">Horizon</p>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          Ship the console your climate program deserves
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          ModelEarth is built for demos that close, and deployments that stay up.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40"
          >
            Open command center
            <ArrowUpRight size={18} />
          </Link>
          <a
            href="https://www.modelearth.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-3.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
          >
            Visit modelearth.in
          </a>
        </div>
      </motion.div>
    </section>
  );
}
