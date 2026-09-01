import SiteBrandMark from '@/components/site/BrandMark';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

/** ModelEarth mark. One drawing, shared with the marketing site, so the
    dashboard and the site cannot drift apart. `priority` is kept for callers
    that still pass it; there is no image to preload any more. */
export default function BrandMark({ size = 44, className = '' }: Props) {
  return <SiteBrandMark size={size} className={className} />;
}
