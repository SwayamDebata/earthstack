/* ==========================================================================
   The mark.

   Three things inside one aperture:

     the ring    the instrument, and the edge of the planet it is pointed at
     the body    the ground, filled, because the ground is the thing at stake
     the layer   one thin arc standing off the surface: the intelligence layer,
                 which is the whole company in one line

   It is drawn rather than shipped as a file so it inherits the accent token,
   animates, and stays sharp at every size. The earlier mark was a sphere over
   an "e"; a sphere centred above a symmetric arc reads as a head and
   shoulders at small sizes, which is why the planet here is a filled limb
   clipped by the aperture instead.

   Authored on a 64 grid. Legible down to 20px; at 16 the layer arc thins out
   and it reads as ring-and-ground, which is the right thing to lose first.
   ========================================================================== */

import { useId } from 'react';

export default function BrandMark({
  size = 26,
  /** assemble on mount, then hold still. The nav mark does this once per
      page load; the intro overlay drives its own copy imperatively instead. */
  animate = false,
  className,
}: {
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  // clip and mask ids have to be unique per instance: the nav mark and the
  // intro mark are on the page at the same time during the handoff
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="ModelEarth"
      className={[className, animate ? 'me-brand-anim' : ''].filter(Boolean).join(' ')}
      style={{ display: 'block', flex: '0 0 auto', color: 'var(--accent, #4d78e4)' }}
    >
      <defs>
        <clipPath id={`c${uid}`}>
          <circle cx="32" cy="32" r="27" />
        </clipPath>
      </defs>

      <g clipPath={`url(#c${uid})`}>
        {/* the ground: a limb far wider than the aperture, so its curve reads
            as planetary rather than as a hill inside a circle */}
        <path className="me-brand-body" d="M-6 64 A 42 42 0 0 1 70 64 Z" fill="currentColor" />
        {/* the layer, standing off the surface */}
        <path
          className="me-brand-layer"
          d="M-4 30 A 44 44 0 0 1 68 30"
          pathLength="100"
          stroke="currentColor"
          strokeWidth="3.4"
          fill="none"
          opacity="0.6"
        />
      </g>

      <circle
        className="me-brand-ring"
        cx="32"
        cy="32"
        r="27"
        pathLength="100"
        stroke="currentColor"
        strokeWidth="3.5"
        fill="none"
      />
    </svg>
  );
}
