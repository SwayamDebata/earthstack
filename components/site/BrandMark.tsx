/* ==========================================================================
   ModelEarth mark — public/modelearth-logo.png
   Landscape artwork; `size` sets the height and the width follows the ratio.
   Rendered as an image (full colour, not a CSS mask).
   ========================================================================== */

const ASPECT = 230 / 160;

export default function BrandMark({
  size = 26,
  /** brief rise on mount, then hold */
  animate = false,
  className,
}: {
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  const width = Math.round(size * ASPECT);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/modelearth-logo.png"
      alt=""
      width={width}
      height={size}
      aria-hidden="true"
      className={['me-brand', className, animate ? 'me-brand-anim' : ''].filter(Boolean).join(' ')}
      style={{
        flex: '0 0 auto',
        display: 'block',
        width,
        height: size,
        objectFit: 'contain',
      }}
    />
  );
}
