'use client';

import Image from 'next/image';

const shots = [
  {
    src: '/story/field-flood-1.jpg',
    alt: 'Floodwater submerging trees and palms in Odisha',
  },
  {
    src: '/story/field-flood-2.jpg',
    alt: 'Wide floodplain and riverbank after heavy rain',
  },
  {
    src: '/story/rf-india-flood-street.jpg',
    alt: 'Aerial view of flooded farmland in Odisha',
  },
  {
    src: '/story/rf-india-monsoon.jpg',
    alt: 'Flooded rice fields in Odisha during monsoon',
  },
  {
    src: '/story/rf-india-heatwave.jpg',
    alt: 'Land surface temperature across India during a heatwave',
  },
  {
    src: '/story/rf-india-heat-street.jpg',
    alt: 'Northwest India under extreme heat',
  },
] as const;

/**
 * Compact horizontal auto-scroll of field stills. Not a photo collage.
 */
export default function LandingFieldMedia() {
  const loop = [...shots, ...shots];

  return (
    <section
      className="relative overflow-hidden border-y border-white/[0.06] bg-[#050816] py-8 md:py-10"
      aria-label="Field photography"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#050816] to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#050816] to-transparent md:w-24" />

      <div className="mb-4 px-4 md:px-8">
        <p className="text-xs font-medium tracking-wide text-slate-500">Field</p>
      </div>

      <div className="flex w-max animate-[marquee_55s_linear_infinite] gap-3 px-4 [will-change:transform] hover:[animation-play-state:paused] md:gap-4">
        {loop.map((shot, i) => (
          <div
            key={`${shot.src}-${i}`}
            className="relative h-28 w-44 shrink-0 overflow-hidden rounded-md border border-white/10 md:h-32 md:w-52"
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              sizes="208px"
              className="object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
