/* ==========================================================================
   ModelEarth mark — public/modelearth-demo-logo.svg
   Square artwork; rendered as an image (full colour, not a CSS mask).
   ========================================================================== */

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
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/modelearth-demo-logo.svg"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      className={['me-brand', className, animate ? 'me-brand-anim' : ''].filter(Boolean).join(' ')}
      style={{
        flex: '0 0 auto',
        display: 'block',
        width: size,
        height: size,
        objectFit: 'contain',
      }}
    />
  );
}
