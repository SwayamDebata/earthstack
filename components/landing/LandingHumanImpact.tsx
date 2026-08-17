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
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden bg-[#050816] px-4 py-28 md:px-8 md:py-36"
      aria-label="Who we're for"
    >
      {/* Full-bleed nocturne (restored) */}
      <motion.div style={{ scale: bgScale, y: bgY }} className="absolute inset-0 z-0">
        <Image
          src="/story/people-dusk.png"
          alt="A dark painterly nocturne of a lone boat on a still river beneath an ember dusk sky"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Legibility: darken only the left for text, let the painting breathe elsewhere */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#050816]/95 via-[#050816]/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-[#050816] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-[#050816] to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mb-5 text-xs font-medium tracking-wide text-amber-300/90"
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
            <span className="block bg-gradient-to-r from-amber-200 via-orange-200 to-rose-200 bg-clip-text text-transparent">
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
            className="mt-8 border-l-4 border-amber-400/80 pl-5 text-lg font-medium italic text-amber-50"
          >
            &ldquo;A warning that arrives in time is the difference between a story and a statistic.&rdquo;
          </motion.blockquote>
        </div>
      </div>
    </section>
  );
}
