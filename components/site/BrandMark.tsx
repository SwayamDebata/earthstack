/* ==========================================================================
   The mark: the original sphere over an "e".

   Painted as a mask rather than shown as an image. The source file is a flat
   single colour, so masking it lets the mark take --laterite like everything
   else, which means it works on the cream page, on the white theme, and on
   the dark hero without needing a second asset or a white plate behind it.

   The supplied JPEG is the same drawing but sits on solid white with no alpha,
   so it would show a white box over the night hero. modelearth-mark.png is
   that drawing already cut out, tightly cropped, and is what is used here.

   624 x 1099 is the artwork's aspect; the width is derived from the height so
   the lockup keeps its proportions at any size.
   ========================================================================== */

const ASPECT = 624 / 1099;

export default function BrandMark({
  size = 26,
  /** fill on mount, then hold still */
  animate = false,
  className,
}: {
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={['me-brand', className, animate ? 'me-brand-anim' : ''].filter(Boolean).join(' ')}
      style={{
        flex: '0 0 auto',
        display: 'block',
        width: Math.round(size * ASPECT),
        height: size,
      }}
    />
  );
}
