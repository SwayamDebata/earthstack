'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

const lines = [
  'In Odisha, the rivers rise every monsoon.',
  'In 1999, a super cyclone took thousands before a single warning reached the last village.',
  'The technology to see it coming already existed.',
  'It just never reached the people standing in the water.',
];

export default function LandingStakes() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const imageY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden bg-[#040810] px-4 py-28 md:px-8 md:py-36"
      aria-label="Why ModelEarth exists"
    >
      {/* Background photograph */}
      <motion.div style={{ scale: imageScale, y: imageY }} className="absolute inset-0 z-0">
        <Image
          src="/story/stakes.png"
          alt="A swollen monsoon river delta at dusk in eastern India"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover opacity-70"
        />
      </motion.div>

      {/* Legibility overlays */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#040810]/55" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#040810] via-[#040810]/35 to-[#040810]/80" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-[#050816] to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-8 font-mono text-[11px] uppercase tracking-[0.45em] text-cyan-300/80"
        >
          The water always comes
        </motion.p>

        <div className="space-y-5">
          {lines.map((line, i) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={
                i === lines.length - 1
                  ? 'text-2xl font-semibold leading-snug text-white md:text-4xl'
                  : 'text-2xl font-light leading-snug text-slate-200/90 md:text-4xl'
              }
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-12 flex items-start gap-4 border-l-2 border-cyan-400/50 pl-5"
        >
          <p className="max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
            ModelEarth exists to close that gap, to turn raw signal into the{' '}
            <span className="font-semibold text-cyan-200">72 hours</span> a family needs to move to higher ground.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
