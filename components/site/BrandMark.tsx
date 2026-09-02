/* ==========================================================================
   The mark.

   One roundel holding the things the company is actually about:

     the ring     the Earth, and the instrument pointed at it
     the land     a ridge line: mountains, the ground where a warning lands
     the water    two bands under the ridge, the river and the coast
     the layer    a single arc standing off the surface, the climate
                  intelligence layer reading everything below it

   The land and the water are one group on purpose. They rise together in the
   animation because they are one system, and separating them made the mark
   read as a stack of unrelated stripes.

   Drawn rather than shipped as a file so it inherits the accent token,
   animates, and stays sharp at any size. Authored on a 64 grid and checked at
   16 / 20 / 26 / 32 / 44 / 96: a tree on the ridge was tried and cut, because
   it disappeared below 44px while still costing clutter above it.
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
  // clip ids have to be unique per instance: the nav mark and the intro mark
  // are both on the page during the handoff
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="ModelEarth"
      className={[className, animate ? 'me-brand-anim' : ''].filter(Boolean).join(' ')}
      style={{ display: 'block', flex: '0 0 auto', color: 'var(--accent, #418e29)' }}
    >
      <defs>
        <clipPath id={`c${uid}`}>
          <circle cx="32" cy="32" r="27" />
        </clipPath>
      </defs>

      <g clipPath={`url(#c${uid})`}>
        {/* ground and water: one system, so they move as one */}
        <g className="me-brand-body">
          <path d="M-2 46 L 21 27 L 34 41 L 46 30 L 66 46 Z" fill="currentColor" />
          <path d="M-4 51.5 H 68" stroke="currentColor" strokeWidth="3.4" opacity="0.5" />
          <path d="M-4 56.5 H 68" stroke="currentColor" strokeWidth="2.8" opacity="0.3" />
        </g>

        {/* The layer, standing off the surface. Its endpoints and its rise are
            both chosen to sit inside the aperture: an arc drawn wider than the
            clip is silently erased by it, which is exactly what happened to the
            first draft of this mark. */}
        <path
          className="me-brand-layer"
          d="M10 23 A 29.2 29.2 0 0 1 54 23"
          pathLength="100"
          stroke="currentColor"
          strokeWidth="3.2"
          fill="none"
          opacity="0.62"
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
