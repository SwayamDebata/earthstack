'use client';

import Link from 'next/link';
import { ArrowUpRight, Shield } from 'lucide-react';

/**
 * Above-the-fold proof: live ops + one honest offline number + advisory disclaimer.
 * War Room and Benchmark stay the serious surfaces; this only points there.
 */
export default function LandingProofStrip() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-md md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live ops
        </span>
        <span className="text-[11px] text-slate-500">5 Odisha pilot cities</span>
      </div>

      <p className="mt-3 text-base font-semibold leading-snug text-white md:text-lg">
        99.3% recall at 24-hour lead on gauged historical flood events
        <span className="ml-2 align-middle text-[11px] font-medium text-slate-400">(offline · rule engine)</span>
      </p>

      <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
        <Shield size={13} className="mt-0.5 shrink-0 text-amber-300/80" />
        Advisory only. Does not override IMD or CWC official warnings.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/dashboard/ops"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
        >
          Open War Room
          <ArrowUpRight size={13} />
        </Link>
        <Link
          href="/dashboard/benchmark"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
        >
          See Benchmark evidence
        </Link>
      </div>
    </div>
  );
}
