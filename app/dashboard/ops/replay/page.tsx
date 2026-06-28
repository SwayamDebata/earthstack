import { Suspense } from 'react';
import OpsReplayView from '@/components/dashboard/views/OpsReplayView';

export const dynamic = 'force-dynamic';

export default function OpsReplayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-40 items-center justify-center font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Loading replay…
        </div>
      }
    >
      <OpsReplayView />
    </Suspense>
  );
}
