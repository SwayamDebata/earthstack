'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Film } from 'lucide-react';
import HistoricalReplayPanel from '@/components/dashboard/replay/HistoricalReplayPanel';

/**
 * Operational replay theatre - hero capability per CTO SOP (Sprint 2 entry point).
 * Reuses HistoricalReplayPanel; analytics replay console remains at /dashboard/replay.
 */
export default function OpsReplayView() {
  const searchParams = useSearchParams();
  const tour = searchParams.get('tour') === '1';

  return (
    <div className="space-y-4 p-3 md:p-4">
      {tour ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-emerald-100">
          <Film size={14} />
          Guided replay tour · auto-play through verified flood frames
        </div>
      ) : null}
      <header>
        <Link
          href="/dashboard/ops"
          className="mb-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-cyan-200"
        >
          <ChevronLeft size={12} /> Command center
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-400/90">
          Operational Intelligence · Replay evidence
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
          Historical Replay Similarity
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">
          Demonstrate when the system would have warned before verified flood onset. Built for government and
          investor trust narratives.
        </p>
      </header>

      <HistoricalReplayPanel tourMode={tour} />
    </div>
  );
}
