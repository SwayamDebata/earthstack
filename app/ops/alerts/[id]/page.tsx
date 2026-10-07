import AlertDetail from '@/components/ops/AlertDetail';

/** params is a promise in this Next version. */
export default async function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AlertDetail alertId={decodeURIComponent(id)} />;
}
