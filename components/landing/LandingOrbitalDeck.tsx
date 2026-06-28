'use client';

import { motion } from 'framer-motion';
import { Hexagon, Orbit, Zap } from 'lucide-react';

const deck = [
  {
    icon: Orbit,
    title: 'Spatial OS',
    copy: 'Live globe, district context, and command surfaces that read as operational infrastructure.',
    hue: 'from-cyan-500/25 to-blue-600/10',
    card3d:
      'md:[transform:perspective(1200px)_rotateY(-14deg)_rotateX(5deg)] hover:[transform:perspective(1200px)_rotateY(0)_rotateX(0)]',
  },
  {
    icon: Hexagon,
    title: 'Hex topology',
    copy: 'Tessellated UI language inspired by mesh networks. Signal routing, not decoration.',
    hue: 'from-violet-500/20 to-fuchsia-500/10',
    card3d:
      'md:[transform:perspective(1200px)_rotateY(0deg)_rotateX(6deg)] hover:[transform:perspective(1200px)_rotateY(0)_rotateX(0)]',
  },
  {
    icon: Zap,
    title: 'Low-latency feel',
    copy: 'Native scroll, coalesced motion, GPU-aware globe. Fast where it matters.',
    hue: 'from-amber-500/15 to-orange-500/10',
    card3d:
      'md:[transform:perspective(1200px)_rotateY(14deg)_rotateX(5deg)] hover:[transform:perspective(1200px)_rotateY(0)_rotateX(0)]',
  },
] as const;

export default function LandingOrbitalDeck() {
  return (
    <section className="relative overflow-hidden bg-[#050816] px-4 py-24 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(59,130,246,0.12),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl [perspective:1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          className="mb-14 text-center"
        >
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.4em] text-cyan-400/70">Orbital deck</p>
          <h2 className="text-3xl font-bold text-white md:text-5xl">Built for real coordination rooms</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Spatial UI that stays fast on field laptops. Depth where it helps decisions, not where it slows operators down.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 [transform-style:preserve-3d] md:grid-cols-3 md:gap-6">
          {deck.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={`group relative rounded-2xl border border-white/10 bg-slate-900/85 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition-[transform,box-shadow] duration-500 [transform-style:preserve-3d] hover:border-cyan-400/25 hover:shadow-[0_32px_100px_rgba(34,211,238,0.08)] ${item.card3d}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${item.hue}`}
              />
              <div className="relative z-10">
                <div className="mb-5 inline-flex rounded-xl border border-cyan-400/20 bg-black/40 p-3 text-cyan-200">
                  <item.icon size={22} strokeWidth={1.25} />
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.copy}</p>
              </div>
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full border border-cyan-400/10 opacity-40 transition-opacity group-hover:opacity-70" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
