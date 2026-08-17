'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Thermometer, X, Shield } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { LOCATIONS, POLLING_INTERVALS, STALE_THRESHOLDS_MS, withJitter } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';
import ShadowBadge from '@/components/dashboard/heat/ShadowBadge';
import HeatEvidencePanel from '@/components/dashboard/heat/HeatEvidencePanel';
import HeatMapPanel from '@/components/dashboard/heat/HeatMapPanel';
import type { HeatMapCity } from '@/lib/api/schemas';
import { severityChipClass } from '@/lib/ui/severity';
import { relTime } from '@/components/dashboard/util';

function fmtScore(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return 'n/a';
  return n.toFixed(2);
}

function isStale(ts: string | undefined): boolean {
  if (!ts) return false;
  const t = new Date(ts).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t > STALE_THRESHOLDS_MS.heat;
}

/**
 * Heat Ops: map-first product surface (separate from Flood Ops).
 */
export default function HeatOpsView() {
  const { uiMode, setLocation } = useMission();
  const std = uiMode === 'standard';
  const [selected, setSelected] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ['heat-map'],
    queryFn: ({ signal }) => api.heatMap(signal),
    refetchInterval: () => withJitter(POLLING_INTERVALS.heat),
  });

  const gridQ = useQuery({
    queryKey: ['heat-grid'],
    queryFn: ({ signal }) => api.heatGrid(signal),
    refetchInterval: () => withJitter(POLLING_INTERVALS.heat),
  });

  const cities = useMemo(() => {
    const rows = q.data?.cities ?? [];
    const byName = new Map(rows.map((c) => [c.region.toLowerCase(), c]));
    return (LOCATIONS as readonly string[]).map((name) => {
      const hit = byName.get(name.toLowerCase());
      return hit ?? ({ region: name, severity: undefined, heat_score: null } as HeatMapCity);
    });
  }, [q.data]);

  const newestTs = cities.map((c) => c.timestamp).filter(Boolean).sort().at(-1);
  const stale = isStale(newestTs);

  const openCity = useCallback(
    (city: string) => {
      setLocation(city);
      setSelected(city);
    },
    [setLocation],
  );
  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, close]);

  const shell = std
    ? 'rounded-lg border border-slate-200 bg-white shadow-sm'
    : 'rounded-md border border-amber-400/20 bg-[#0a0c10]';

  const refreshAll = () => {
    void q.refetch();
    void gridQ.refetch();
  };

  return (
    <div className="space-y-4 p-3 md:p-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Thermometer size={16} className={std ? 'text-amber-700' : 'text-amber-300'} />
            <p
              className={
                std
                  ? 'text-xs font-semibold uppercase tracking-wide text-amber-800'
                  : 'font-mono text-[10px] uppercase tracking-[0.35em] text-amber-300/90'
              }
            >
              Heat product
            </p>
            <ShadowBadge mode={uiMode} showDisclaimer={false} />
          </div>
          <h1 className={`mt-1 text-2xl font-semibold tracking-tight ${std ? 'text-slate-900' : 'text-white'}`}>
            Heat Ops
          </h1>
          <p className={`mt-1 max-w-2xl text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
            Shadow heat decision layer for five Odisha cities. Advisory only. Does not replace IMD heat warnings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {stale ? (
            <span className={std ? 'text-xs font-medium text-amber-800' : 'text-xs text-amber-300'}>
              Stale · updated {relTime(newestTs)}
            </span>
          ) : newestTs ? (
            <span className={std ? 'text-xs text-slate-500' : 'text-xs text-slate-500'}>
              Updated {relTime(newestTs)}
            </span>
          ) : null}
          <button
            type="button"
            onClick={refreshAll}
            className={
              std
                ? 'rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
                : 'rounded-md border border-white/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:bg-white/5'
            }
          >
            Refresh
          </button>
          <Link
            href="/dashboard/ops"
            className={
              std
                ? 'inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                : 'inline-flex items-center gap-2 rounded-md border border-cyan-400/25 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/10'
            }
          >
            <Shield size={14} />
            Flood Ops
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <HeatMapPanel
            grid={gridQ.data}
            cities={cities}
            isLoading={gridQ.isLoading || q.isLoading}
            isError={gridQ.isError}
            onRetry={refreshAll}
            activeLocation={selected}
            onSelectCity={openCity}
          />
        </div>

        <aside className={`xl:col-span-4 ${shell} p-3`} aria-label="Heat city scoreboard">
          <p className={std ? 'mb-2 text-sm font-semibold text-slate-900' : 'mb-2 text-sm font-semibold text-white'}>
            Cities
          </p>
          {q.isLoading ? (
            <div className={`h-48 animate-pulse rounded-md ${std ? 'bg-slate-100' : 'bg-white/5'}`} />
          ) : q.isError ? (
            <p className={std ? 'text-sm text-red-700' : 'text-sm text-red-300'}>
              Heat scores unavailable. Retry or check the heat pipeline.
            </p>
          ) : (
            <ul className={std ? 'divide-y divide-slate-200' : 'divide-y divide-white/10'}>
              {cities.map((c) => {
                const awaiting = c.heat_score === null || c.heat_score === undefined;
                const active = selected?.toLowerCase() === c.region.toLowerCase();
                return (
                  <li key={c.region}>
                    <button
                      type="button"
                      onClick={() => openCity(c.region)}
                      className={
                        std
                          ? `flex w-full items-center justify-between gap-3 px-2 py-3 text-left transition hover:bg-amber-50 ${active ? 'bg-amber-50' : ''}`
                          : `flex w-full items-center justify-between gap-3 px-2 py-3 text-left transition hover:bg-amber-500/10 ${active ? 'bg-amber-500/10' : ''}`
                      }
                    >
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>
                          {c.region}
                        </p>
                        <p className="text-xs text-slate-500">
                          {awaiting ? 'Awaiting pipeline data' : `Updated ${relTime(c.timestamp)}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {awaiting ? (
                          <span className="text-xs text-slate-500">n/a</span>
                        ) : (
                          <>
                            <span className={severityChipClass(c.severity, uiMode)}>{c.severity ?? 'n/a'}</span>
                            <span
                              className={`tabular-nums text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}
                            >
                              {fmtScore(c.heat_score)}
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label="Heat evidence">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={close} aria-hidden />
          <aside
            className={
              std
                ? 'relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-slate-200 bg-white text-slate-900 shadow-2xl'
                : 'relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-amber-400/20 bg-[#0a0c10] text-slate-100 shadow-2xl'
            }
          >
            <div
              className={
                std
                  ? 'sticky top-0 z-10 flex items-start gap-3 border-b border-slate-200 bg-white px-5 py-4'
                  : 'sticky top-0 z-10 flex items-start gap-3 border-b border-amber-400/15 bg-[#0a0c10] px-5 py-4'
              }
            >
              <div className="min-w-0 flex-1">
                <p
                  className={
                    std
                      ? 'text-[11px] font-semibold uppercase tracking-wide text-slate-500'
                      : 'font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500'
                  }
                >
                  Heat evidence
                </p>
                <h2 className={`mt-1 truncate text-xl font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>
                  {selected}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close heat evidence"
                className={
                  std
                    ? 'rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50'
                    : 'rounded-md border border-white/15 p-1.5 text-slate-300 hover:bg-white/5'
                }
              >
                <X size={16} />
              </button>
            </div>
            <HeatEvidencePanel location={selected} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
