import SiteBrandMark from '@/components/site/BrandMark';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

/** ModelEarth mark — shared with the marketing site. */
export default function BrandMark({ size = 44, className = '' }: Props) {
  return <SiteBrandMark size={size} className={className} />;
}
