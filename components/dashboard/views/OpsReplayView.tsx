'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import HistoricalReplayPanel from '@/components/dashboard/replay/HistoricalReplayPanel';

/**
 * Operational replay theatre - hero capability per CTO SOP (Sprint 2 entry point).
 * Reuses HistoricalReplayPanel; analytics replay console remains at /dashboard/replay.
 */
export default function OpsReplayView() {
  return (
    <div className="space-y-4 p-3 md:p-4">
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

      <HistoricalReplayPanel />
    </div>
  );
}
