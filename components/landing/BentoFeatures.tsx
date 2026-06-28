'use client';

import { motion } from 'framer-motion';
import { Orbit, Radar, Layers3, Cpu, Radio, Compass } from 'lucide-react';

const tiles = [
  {
    icon: Orbit,
    title: 'Orbital context',
    body: 'District maps, river context, and live telemetry in one spatial view. Built for situation rooms, not slide decks.',
    span: 'md:col-span-2',
    accent: 'from-cyan-500/20 to-blue-600/10',
  },
  {
    icon: Radar,
    title: 'Signal fusion',
    body: 'Built for multi-layer climate ops. Rainfall, hydrology, risk, and ML observability in one rail.',
    span: 'md:col-span-1',
    accent: 'from-violet-500/15 to-fuchsia-500/10',
  },
  {
    icon: Layers3,
    title: 'Stacked intelligence',
    body: 'Composable modules you can ship to NOCs, agencies, or field teams without diluting the brand.',
    span: 'md:col-span-1',
    accent: 'from-emerald-500/15 to-teal-500/10',
  },
  {
    icon: Cpu,
    title: 'Model-ready',
    body: 'Wire your own inference, rules, and replay jobs. The UI is engineered for production paths.',
    span: 'md:col-span-2',
    accent: 'from-amber-500/15 to-orange-500/10',
  },
  {
    icon: Radio,
    title: 'Always-on UX',
    body: 'Glass telemetry, alert streams, and replay panels stay readable under pressure. Designed for 3am coordination calls.',
    span: 'md:col-span-1',
    accent: 'from-sky-500/15 to-cyan-500/10',
  },
  {
    icon: Compass,
    title: 'Navigate faster',
    body: 'From landing to command center in one click. Same visual language your field team and leadership already trust.',
    span: 'md:col-span-2',
    accent: 'from-rose-500/10 to-indigo-500/15',
  },
];

export default function BentoFeatures() {
  return (
    <section id="capabilities" className="relative scroll-mt-24 bg-gradient-to-b from-[#050816] via-[#080B14] to-[#0a0f1c] px-4 py-28 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.4em] text-cyan-300/80">ModelEarth</p>
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Built like a <span className="gradient-text">flight console</span>. Not a slide deck
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Every surface is built for flood-season operations: fast reads, honest empty states, and evidence you can defend in a briefing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {tiles.map((tile, index) => (
            <motion.article
              key={tile.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: index * 0.06 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${tile.span}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${tile.accent}`}
              />
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-black/30 p-3 text-cyan-300">
                  <tile.icon size={22} strokeWidth={1.25} />
                </div>
                <h3 className="text-lg font-semibold text-white">{tile.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{tile.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
