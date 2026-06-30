'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function LandingHumanImpact() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);
  const boatY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden bg-[#0a0805] px-4 py-28 md:px-8 md:py-36"
      aria-label="Who we're for"
    >
      {/* Full-bleed warm background photograph */}
      <motion.div style={{ scale: bgScale, y: bgY }} className="absolute inset-0 z-0">
        <Image
          src="/story/village.png"
          alt="A riverside village in eastern India at golden sunset"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Warm legibility overlays: dark on the left for text, golden glow kept on the right */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#0a0805] via-[#0a0805]/75 to-[#0a0805]/20" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_60%_70%_at_18%_45%,rgba(0,0,0,0.55),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-28 bg-gradient-to-b from-[#050816] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-gradient-to-t from-[#050816] to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mb-5 font-mono text-[11px] uppercase tracking-[0.4em] text-amber-300/90"
          >
            Who we&apos;re for
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-6xl"
          >
            For the people
            <span className="block bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
              downstream
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-6 space-y-4 text-lg leading-relaxed text-slate-200/90"
          >
            <p>
              Every score, every alert, every replay points back to one place: the home at the river&apos;s edge, and
              the family that has nowhere higher to go.
            </p>
            <p>
              And it points to one person too. The district officer at 3 a.m., with half the data and all of the
              responsibility, deciding whether to wake a town. We build so that call is never a guess.
            </p>
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-8 border-l-4 border-amber-400 bg-black/30 py-4 pl-5 pr-4 text-lg font-medium italic text-amber-50 backdrop-blur-sm"
          >
            &ldquo;A warning that arrives in time is the difference between a story and a statistic.&rdquo;
          </motion.blockquote>
        </div>
      </div>

      {/* Intimate paper-boat inset, framed */}
      <motion.div
        style={{ y: boatY }}
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-12 right-6 z-10 hidden w-48 overflow-hidden rounded-xl border border-white/15 shadow-[0_18px_50px_rgba(0,0,0,0.5)] md:block lg:right-12 lg:w-64"
      >
        <Image
          src="/story/paperboat.png"
          alt="A child's paper boat floating on floodwater at golden hour"
          width={512}
          height={341}
          sizes="(max-width: 1024px) 192px, 256px"
          className="h-auto w-full object-cover"
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 font-mono text-[9px] uppercase tracking-[0.25em] text-white/80">
          What stays behind
        </span>
      </motion.div>
    </section>
  );
}
