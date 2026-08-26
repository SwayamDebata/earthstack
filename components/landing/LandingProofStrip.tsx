'use client';

import Link from 'next/link';
import { ArrowUpRight, Shield } from 'lucide-react';

/**
 * Above-the-fold proof: live ops + honest north Odisha pair (recall and miss together).
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
        <span className="text-[11px] text-slate-500">5 Odisha pilot cities · alerts only</span>
      </div>

      <p className="mt-3 text-base font-semibold leading-snug text-white md:text-lg">
        94.4% of north Odisha flood onsets detected
        <span className="ml-2 align-middle text-[11px] font-medium text-slate-400">
          (102/108, 1990-2020 backtest)
        </span>
      </p>
      <p className="mt-1.5 text-sm leading-snug text-slate-300">
        and the engine went LOW on 14 of 18 location-days during active flooding.
      </p>

      <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
        <Shield size={13} className="mt-0.5 shrink-0 text-amber-300/80" />
        Advisory only. Does not override IMD, CWC or OSDMA warnings. Limitation ships with the number.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/dashboard/ops"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
        >
          Flood Ops
          <ArrowUpRight size={13} />
        </Link>
        <Link
          href="/dashboard/shadow"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/30 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-100 transition hover:border-slate-300/50 hover:bg-white/10"
        >
          North Odisha
          <ArrowUpRight size={13} />
        </Link>
        <Link
          href="/dashboard/heat"
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-100 transition hover:border-amber-400/40 hover:bg-amber-500/15"
        >
          Heat Ops
          <ArrowUpRight size={13} />
        </Link>
        <Link
          href="/dashboard/benchmark"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
        >
          Benchmark
        </Link>
      </div>
    </div>
  );
}
