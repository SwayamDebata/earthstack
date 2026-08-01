'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const samples = [
  {
    src: '/story/playstore_shot_verdict.png',
    alt: 'krishiOS Today\'s Verdict: one clear answer for the field',
  },
  {
    src: '/story/playstore_shot_floodshield.png',
    alt: 'Flood Shield warning powered by ModelEarth',
  },
];

export default function LandingKrishiOS() {
  const scrollToHorizon = () => {
    document.getElementById('horizon')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="krishios"
      className="relative overflow-hidden bg-[#06140c] px-4 py-20 md:px-8 md:py-28"
      aria-label="krishiOS coming soon"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_40%,rgba(34,197,94,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050816] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050816] to-transparent" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65 }}
          className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-emerald-950/50 via-slate-950/60 to-slate-950/80 p-8 md:p-10"
        >
          <div className="pointer-events-none absolute -left-px top-8 h-16 w-px bg-gradient-to-b from-emerald-400/60 to-transparent" />

          <p className="mb-4 text-xs font-medium tracking-wide text-emerald-400/85">
            Meet krishiOS · coming soon
          </p>

          <h2 className="text-3xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl">
            Climate intelligence
            <span className="block bg-gradient-to-r from-emerald-200 via-lime-100 to-emerald-300 bg-clip-text text-transparent">
              for the farmer&apos;s pocket
            </span>
          </h2>

          <p className="mt-5 text-lg font-medium text-emerald-100/90">
            A morning verdict. A flood warning. In the languages of the field.
          </p>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 md:text-base">
            krishiOS is ModelEarth&apos;s edge app for farmers: voice-first advice, Flood Shield from the same risk
            layer as Mission Control, and WhatsApp share when family needs to know.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={scrollToHorizon}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-7 py-3.5 text-sm font-semibold text-emerald-50 transition hover:border-emerald-300/55 hover:bg-emerald-500/20"
            >
              Get early access
              <ArrowRight size={16} />
            </button>
            <p className="text-xs text-slate-500">Android · coming soon</p>
          </div>
        </motion.div>

        <div className="flex items-end justify-center gap-3 sm:gap-4">
          {samples.map((shot, i) => (
            <motion.div
              key={shot.src}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative w-[42%] max-w-[200px] overflow-hidden rounded-[1.4rem] border border-emerald-400/20 bg-emerald-950/40 shadow-[0_20px_50px_rgba(0,0,0,0.45)] ${
                i === 1 ? 'mb-6 sm:mb-10' : ''
              }`}
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                width={400}
                height={800}
                sizes="200px"
                className="h-auto w-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
