'use client';

import { useState } from 'react';
import { useMutation, useQueries } from '@tanstack/react-query';
import { Play, RotateCcw, Square } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { LOCATIONS, withJitter } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import RegionChips from '@/components/dashboard/RegionChips';
import { PageTitle, Telemetry } from '@/components/dashboard/Atoms';
import { useStagger } from '@/components/dashboard/useStagger';
import { formatScalar } from '@/lib/api/payload';
import { relTime } from '@/components/dashboard/util';

type DispatchEntry = {
  id: string;
  location: string;
  startedAt: number;
  finishedAt?: number;
  status: 'pending' | 'success' | 'error';
  message?: string;
};

export default function ReplayView() {
  const { location } = useMission();
  const [history, setHistory] = useState<DispatchEntry[]>([]);

  // Stagger initial fetches across regions; refresh on a slow jittered cadence.
  const enabled = useStagger(LOCATIONS.length, 300);
  const queries = useQueries({
    queries: LOCATIONS.map((loc, i) => ({
      queryKey: ['replay', loc],
      queryFn: () => api.replay(loc),
      enabled: enabled[i],
      refetchInterval: () => withJitter(120_000),
    })),
  });

  const runMutation = useMutation({
    mutationFn: async (loc: string) => {
      const id = `${Date.now()}-${loc}`;
      const entry: DispatchEntry = { id, location: loc, startedAt: Date.now(), status: 'pending' };
      setHistory((prev) => [entry, ...prev].slice(0, 20));
      try {
        const res = await api.replayRun(loc);
        setHistory((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: 'success', finishedAt: Date.now(), message: formatScalar((res as Record<string, unknown>)?.status) } : e)),
        );
        return res;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'failed';
        setHistory((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'error', finishedAt: Date.now(), message: msg } : e)));
        throw err;
      }
    },
  });

  const runAll = async () => {
    for (const loc of LOCATIONS) {
      // Sequential to avoid hammering the upstream
      // eslint-disable-next-line no-await-in-loop
      try { await runMutation.mutateAsync(loc); } catch { /* per-location error already recorded */ }
    }
  };

  const totalDispatched = history.length;
  const successCount = history.filter((e) => e.status === 'success').length;
  const errorCount = history.filter((e) => e.status === 'error').length;
  const pendingCount = history.filter((e) => e.status === 'pending').length;

  return (
    <div className="space-y-3 p-3">
      <PageTitle eyebrow="Replay Console" title="Time-Series Replay & Backfill">
        <RegionChips />
        <button
          type="button"
          onClick={() => runMutation.mutate(location)}
          disabled={runMutation.isPending}
          className="flex items-center gap-1.5 rounded-sm border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          <Play size={11} />
          DISPATCH · {location.toUpperCase()}
        </button>
        <button
          type="button"
          onClick={runAll}
          disabled={runMutation.isPending}
          className="flex items-center gap-1.5 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
        >
          <RotateCcw size={11} />
          REPLAY ALL REGIONS
        </button>
      </PageTitle>

      {/* Dispatch summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryTile label="DISPATCHED" value={String(totalDispatched)} tone="info" />
        <SummaryTile label="SUCCESSFUL" value={String(successCount)} tone="nominal" />
        <SummaryTile label="PENDING" value={String(pendingCount)} tone={pendingCount > 0 ? 'warning' : 'idle'} />
        <SummaryTile label="FAILED" value={String(errorCount)} tone={errorCount > 0 ? 'critical' : 'idle'} />
      </div>

      {/* Per-region replay state */}
      <HudFrame label="REGION REPLAY MATRIX" subtitle="/replay/<location>" status="info" statusText="LIVE">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {LOCATIONS.map((loc, i) => {
            const q = queries[i];
            const data = q.data as Record<string, unknown> | undefined;
            const status = formatScalar(data?.status);
            const tone = q.isError ? 'critical' : status === 'idle' || status === 'unknown' ? 'idle' : 'nominal';
            const lastEvent = formatScalar(data?.event ?? data?.last_event);
            const ts = relTime(data?.timestamp);
            const isCurrent = loc === location;

            return (
              <div
                key={loc}
                className={`relative overflow-hidden rounded-md border p-3 transition ${
                  isCurrent ? 'border-cyan-400/50 bg-cyan-500/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'border-cyan-400/15 bg-[#060b18]/95'
                }`}
              >
                <span className="hud-bracket hud-bracket-tl" />
                <span className="hud-bracket hud-bracket-br" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusLed tone={tone} size={7} />
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">{loc}</p>
                  </div>
                  {isCurrent ? (
                    <span className="rounded-sm border border-cyan-400/30 bg-black/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cyan-200">FOCUS</span>
                  ) : null}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
                  <Telemetry label="STATUS" value={status} />
                  <Telemetry label="UPDATED" value={ts} />
                  <Telemetry label="EVENT" value={lastEvent} />
                  <Telemetry label="TARGET" value={loc} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => runMutation.mutate(loc)}
                    disabled={runMutation.isPending}
                    className="flex items-center gap-1 rounded-sm border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    <Play size={9} /> DISPATCH
                  </button>
                  <button
                    type="button"
                    onClick={() => void q.refetch()}
                    className="flex items-center gap-1 rounded-sm border border-white/10 bg-black/40 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200"
                  >
                    REFRESH
                  </button>
                  {q.isError ? (
                    <span className="rounded-sm border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-red-200">FAULT</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </HudFrame>

      {/* Dispatch log */}
      <HudFrame label="DISPATCH LOG" subtitle="run requests · this session" status="info" statusText={`${history.length}`}>
        {history.length === 0 ? (
          <p className="rounded-sm border border-white/5 bg-slate-950/40 p-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            NO DISPATCHES IN THIS SESSION · click DISPATCH on any region to begin
          </p>
        ) : (
          <div className="max-h-[420px] space-y-1 overflow-auto pr-1 font-mono text-[10px]">
            {history.map((e) => {
              const tone = e.status === 'success' ? 'nominal' : e.status === 'error' ? 'critical' : 'warning';
              const dur = e.finishedAt ? `${((e.finishedAt - e.startedAt) / 1000).toFixed(2)}s` : '…';
              return (
                <div key={e.id} className="grid grid-cols-[18px_120px_1fr_auto_auto] items-center gap-2 rounded-sm border border-white/5 bg-slate-950/50 px-2 py-1.5">
                  <StatusLed tone={tone} size={6} pulse={e.status === 'pending'} />
                  <span className="text-cyan-200">{e.location.toUpperCase()}</span>
                  <span className="truncate text-slate-300">{e.message ?? (e.status === 'pending' ? 'awaiting upstream…' : 'completed')}</span>
                  <span className="text-slate-500">{dur}</span>
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${
                      tone === 'critical'
                        ? 'bg-red-500/15 text-red-200 ring-1 ring-red-500/30'
                        : tone === 'warning'
                          ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30'
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </HudFrame>

      {/* Replay controls */}
      <HudFrame label="REPLAY CONTROLS" subtitle="/replay/run · POST" status="info" statusText="READY">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
            ENDPOINT <span className="text-cyan-200">POST /replay/run?location=&lt;region&gt;</span>
          </p>
          <button
            type="button"
            onClick={() => setHistory([])}
            disabled={history.length === 0}
            className="ml-auto flex items-center gap-1.5 rounded-sm border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200 disabled:opacity-40"
          >
            <Square size={10} /> CLEAR LOG
          </button>
        </div>
      </HudFrame>
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: string; tone: 'nominal' | 'warning' | 'critical' | 'info' | 'idle' }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-cyan-400/15 bg-gradient-to-b from-[#0b1325]/95 to-[#070d1b]/95 p-3">
      <span className="hud-bracket hud-bracket-tl" />
      <span className="hud-bracket hud-bracket-br" />
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <StatusLed tone={tone} size={6} />
      </div>
      <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-cyan-100">{value}</p>
    </div>
  );
}
