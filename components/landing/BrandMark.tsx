import Image from 'next/image';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

/** ModelEarth hex mark. `public/modelearth-favicon.svg` */
export default function BrandMark({ size = 44, className = '', priority = false }: Props) {
  return (
    <Image
      src="/modelearth-favicon.svg"
      alt="ModelEarth"
      width={size}
      height={size}
      className={className}
      priority={priority}
    />
  );
}
