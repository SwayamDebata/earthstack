'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

const beliefs = [
  {
    k: '01',
    title: 'Warning is a right, not a privilege',
    body: 'The districts most exposed to floods are the least likely to have early-warning tools. We build for them first.',
  },
  {
    k: '02',
    title: 'Trust is earned in replay',
    body: 'Anyone can claim a forecast. We let you rewind real floods and watch when our system would have raised the alarm.',
  },
  {
    k: '03',
    title: 'Built in India, for India\u2019s rivers',
    body: 'Local hydrology, local rainfall, local ground truth. Not a foreign model bent to fit a map it has never seen.',
  },
];

export default function LandingMission() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#03070f] px-4 py-28 md:px-8 md:py-36"
      aria-label="Our mission"
    >
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <Image
          src="/story/mission.png"
          alt="Earth from orbit with rivers rendered as glowing data contours"
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#03070f]/70" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_75%_60%_at_50%_40%,rgba(16,185,129,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-6 font-mono text-[11px] uppercase tracking-[0.45em] text-emerald-300/80"
        >
          Our mission
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl"
        >
          Give every district in India a{' '}
          <span className="bg-gradient-to-r from-emerald-200 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
            72-hour head start
          </span>{' '}
          on the water.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300/90"
        >
          Not a dashboard for slide decks. A standing watch for the people who live where the rivers run.
        </motion.p>

        <div className="mt-16 grid gap-5 text-left md:grid-cols-3">
          {beliefs.map((b, i) => (
            <motion.div
              key={b.k}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl border border-white/[0.08] bg-slate-950/60 p-6 backdrop-blur-sm"
            >
              <div className="pointer-events-none absolute -left-px top-6 h-12 w-px bg-gradient-to-b from-emerald-400/60 to-transparent" />
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-300/70">{b.k}</p>
              <h3 className="mt-3 text-lg font-semibold text-white">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{b.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
