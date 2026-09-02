/* ==========================================================================
   The mark.

   Five things the company is about, inside one aperture:

     the ring    the Earth, and the instrument pointed at it     --laterite
     the range   mountains, where the rain lands                 --laterite
     the plain   vegetation, the ground that is farmed           --green
     the river   water, cutting down through both                --water
     the layer   one arc reading the surface from above,         --amber
                 which is the climate intelligence layer

   Every colour is a theme token, so the mark restates the site's palette
   rather than being a second, fixed opinion about it. That also means it is
   not one flat orange: the river and the plain are the only places on the
   site where water and land get to be themselves at this size.

   Authored on a 64 grid, checked at 16 / 20 / 26 / 32 / 44 / 96. Two things
   were tried and cut: a literal tree on the ridge (invisible below 44px) and
   a second layer arc (busy, and it added nothing the first one did not say).

   Geometry note: everything inside the aperture is clipped by it, so each
   element's extent is chosen to sit inside r27 from (32,32). An arc drawn
   wider than the clip is silently erased, which is easy to miss because it
   fails invisibly.
   ========================================================================== */

import { useId } from 'react';

/* the range, shared by the mark and the favicon rasteriser */
export const RANGE_PATH = 'M-2 47 L 21 28 L 34 42 L 46 31 L 66 47 Z';
/* starts at the range and ends past the coast, so the draw animation
   runs the way water does: source first, sea last */
export const RIVER_PATH = 'M32 29 C 33 33, 29 37, 32 42 C 36 47, 31 52, 33 60';
export const LAYER_PATH = 'M11 26 A 29 29 0 0 1 53 26';

export default function BrandMark({
  size = 26,
  /** assemble on mount, then hold still. The nav mark does this once per page
      load; the intro overlay drives its own copy imperatively instead. */
  animate = false,
  className,
}: {
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  // clip ids must be unique per instance: the nav mark and the intro mark are
  // both in the document during the handoff
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="ModelEarth"
      className={[className, animate ? 'me-brand-anim' : ''].filter(Boolean).join(' ')}
      style={{ display: 'block', flex: '0 0 auto' }}
    >
      <defs>
        <clipPath id={`c${uid}`}>
          <circle cx="32" cy="32" r="27" />
        </clipPath>
      </defs>

      <g clipPath={`url(#c${uid})`}>
        {/* ground: the plain and the range are one system and rise together */}
        <g className="me-brand-ground">
          <path d="M-4 47 H 68 V 56 H -4 Z" fill="var(--green, #2f6b41)" />
          <path d={RANGE_PATH} fill="var(--laterite, #c4622f)" />
        </g>

        {/* water, cutting down through both */}
        <path
          className="me-brand-river"
          d={RIVER_PATH}
          pathLength="100"
          stroke="var(--water, #2f7f77)"
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* the layer, standing off the surface and reading it */}
        <path
          className="me-brand-layer"
          d={LAYER_PATH}
          pathLength="100"
          stroke="var(--amber, #b8791f)"
          strokeWidth="3.2"
          fill="none"
        />
      </g>

      <circle
        className="me-brand-ring"
        cx="32"
        cy="32"
        r="27"
        pathLength="100"
        stroke="var(--laterite, #c4622f)"
        strokeWidth="3.5"
        fill="none"
      />
    </svg>
  );
}
