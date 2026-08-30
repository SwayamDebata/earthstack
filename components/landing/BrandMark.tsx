import Image from 'next/image';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

/** ModelEarth icon mark: `public/modelearth-mark.png` (circle over e). */
export default function BrandMark({ size = 44, className = '', priority = false }: Props) {
  const height = size;
  const width = Math.round(size * (624 / 1099));
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
