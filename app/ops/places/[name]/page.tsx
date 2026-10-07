import PlaceView from '@/components/ops/PlaceView';

export default async function PlacePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <PlaceView name={decodeURIComponent(name)} />;
}
