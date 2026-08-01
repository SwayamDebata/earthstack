'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

const FOUNDER_NAME = 'Swayam Debata';
const FOUNDER_ROLE = 'Founder, ModelEarth';
const FOUNDER_PHOTO = '/story/profile.jpeg';

export default function LandingOrigin() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#050816] px-4 py-28 md:px-8 md:py-36"
      aria-label="Why we built ModelEarth"
    >
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <Image
          src="/story/origin.png"
          alt="A misty riverbank at dawn with a lone sensor pole"
          fill
          sizes="100vw"
          className="object-cover opacity-80"
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#050816]/35" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#050816] via-[#050816]/10 to-[#050816]" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-3xl rounded-3xl border border-white/[0.08] bg-slate-950/55 p-8 backdrop-blur-md md:p-12"
      >
        <p className="mb-6 text-xs font-medium tracking-wide text-amber-300/90">Why we built this</p>

        <blockquote className="space-y-5 text-lg leading-relaxed text-slate-200 md:text-xl">
          <p>
            I grew up where the rivers decide the year. When the water comes early, it doesn&apos;t make the news.
            It just quietly costs people everything.
          </p>
          <p>
            We have satellites overhead and models in the cloud, yet the warning still arrives last where it
            matters most. ModelEarth is my attempt to flip that order: to put the same intelligence a national
            agency has into the hands of the district officer making the call at 3 a.m.
          </p>
          <p className="font-medium text-white">
            If we can buy one family one more day, the whole thing was worth building.
          </p>
        </blockquote>

        <div className="mt-9 flex items-center gap-4">
          <Image
            src={FOUNDER_PHOTO}
            alt={FOUNDER_NAME}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full border border-amber-400/35 object-cover object-top shadow-[0_0_24px_rgba(251,191,36,0.15)]"
            priority={false}
          />
          <div>
            <p className="text-base font-semibold text-white">{FOUNDER_NAME}</p>
            <p className="text-sm text-slate-400">{FOUNDER_ROLE}</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
