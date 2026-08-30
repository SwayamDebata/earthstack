import Image from 'next/image';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
  /** Icon mark (default) or stacked wordmark. */
  variant?: 'mark' | 'wordmark';
};

/** ModelEarth brand. Mark: `public/modelearth-mark.png`. Wordmark: `public/modelearth-wordmark.png`. */
export default function BrandMark({
  size = 44,
  className = '',
  priority = false,
  variant = 'mark',
}: Props) {
  if (variant === 'wordmark') {
    const height = size;
    const width = Math.round(size * (1490 / 678));
    return (
      <Image
        src="/modelearth-wordmark.png"
        alt="ModelEarth"
        width={width}
        height={height}
        className={className}
        priority={priority}
        style={{ width: 'auto', height, objectFit: 'contain' }}
      />
    );
  }

  // Source mark is taller than wide (sphere over e).
  const height = size;
  const width = Math.round(size * (778 / 1361));
  return (
    <Image
      src="/modelearth-mark.png"
      alt="ModelEarth"
      width={width}
      height={height}
      className={className}
      priority={priority}
      style={{ width: 'auto', height, objectFit: 'contain' }}
    />
  );
}
