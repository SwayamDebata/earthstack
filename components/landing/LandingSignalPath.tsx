'use client';

import { motion } from 'framer-motion';
import { Satellite, Waves, Cpu, Radio } from 'lucide-react';

const phases = [
  { icon: Satellite, label: 'Ingest', detail: 'Multi-orbit & ground truth' },
  { icon: Waves, label: 'Hydrology', detail: 'Rainfall, rivers, basins' },
  { icon: Cpu, label: 'Models', detail: 'Rules + ML + replay' },
  { icon: Radio, label: 'Ops', detail: 'Alerts & command surface' },
];

export default function LandingSignalPath() {
  return (
    <section className="relative overflow-hidden bg-[#060a14] px-4 py-24 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(34,211,238,0.04)_50%,transparent_100%)]" />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.4em] text-cyan-400/70">Signal path</p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">From observation to decision</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            A linear narrative your stakeholders understand. No buzzword soup.
          </p>
        </motion.div>

        {/* 
          True centering: 4 equal columns. Connector runs from center of col1 → center of col4 
          (12.5% to 87.5% of row = 75% width starting at 12.5%).
        */}
        <div className="relative mx-auto w-full max-w-4xl">
          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-6">
            {/* Horizontal connector, aligned to icon row vertical center */}
            <div
              className="pointer-events-none absolute left-0 right-0 top-[22px] z-0 hidden h-[2px] md:block"
              aria-hidden
            >
              <div
                className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400/50 via-violet-400/45 to-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                style={{ left: '12.5%', width: '75%' }}
              />
              {/* End caps */}
              <div
                className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
                style={{ left: '12.5%' }}
              />
              <div
                className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
                style={{ left: '87.5%' }}
              />
            </div>

            {phases.map((phase, i) => (
              <motion.div
                key={phase.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/35 bg-slate-900 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.2)]">
                  <phase.icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-white">{phase.label}</h3>
                <p className="mt-1 max-w-[200px] text-xs text-slate-500">{phase.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
