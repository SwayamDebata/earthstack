'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Thermometer } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { LOCATIONS, POLLING_INTERVALS, STALE_THRESHOLDS_MS, withJitter } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';
import ShadowBadge from '@/components/dashboard/heat/ShadowBadge';
import type { HeatMapCity } from '@/lib/api/schemas';
import { severityChipClass } from '@/lib/ui/severity';
import { relTime } from '@/components/dashboard/util';

function fmtScore(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return 'awaiting data';
  return n.toFixed(2);
}

function isStale(ts: string | undefined): boolean {
  if (!ts) return false;
  const t = new Date(ts).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t > STALE_THRESHOLDS_MS.heat;
}

/**
 * Compact HEAT SHADOW strip for the main map / War Room.
 * Always visible even when all cities are LOW (correct August state).
 */
export default function HeatStrip({ onSelectCity }: { onSelectCity: (city: string) => void }) {
  const { uiMode, setLocation } = useMission();
  const std = uiMode === 'standard';

  const q = useQuery({
    queryKey: ['heat-map'],
    queryFn: ({ signal }) => api.heatMap(signal),
    refetchInterval: () => withJitter(POLLING_INTERVALS.heat),
  });

  const cities = useMemo(() => {
    const rows = q.data?.cities ?? [];
    const byName = new Map(rows.map((c) => [c.region.toLowerCase(), c]));
    // Render product order only; never Titlagarh / reference cities.
    return (LOCATIONS as readonly string[]).map((name) => {
      const hit = byName.get(name.toLowerCase());
      return hit ?? ({ region: name, severity: undefined, heat_score: null } as HeatMapCity);
    });
  }, [q.data]);

  const newestTs = cities.map((c) => c.timestamp).filter(Boolean).sort().at(-1);
  const stale = isStale(newestTs);
  const engineOff =
    q.isSuccess && (cities.every((c) => c.heat_score === null || c.heat_score === undefined) || cities.length === 0);

  const shell = std
    ? 'rounded-lg border border-amber-200 bg-amber-50/60 p-3 shadow-sm'
    : 'rounded-md border border-amber-400/20 bg-amber-500/[0.04] p-3';

  return (
    <section className={shell} aria-label="Heat shadow strip">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Thermometer size={14} className={std ? 'text-amber-700' : 'text-amber-300'} />
          <p className={std ? 'text-xs font-semibold uppercase tracking-wide text-amber-900' : 'font-mono text-[10px] uppercase tracking-[0.28em] text-amber-200'}>
            Heat
          </p>
          <ShadowBadge mode={uiMode} showDisclaimer={false} />
        </div>
        <div className="flex items-center gap-2">
          {stale ? (
            <span className={std ? 'text-[11px] font-medium text-amber-800' : 'font-mono text-[9px] uppercase tracking-widest text-amber-300'}>
              Stale · updated {relTime(newestTs)}
            </span>
          ) : newestTs ? (
            <span className={std ? 'text-[11px] text-slate-500' : 'font-mono text-[9px] uppercase tracking-widest text-slate-500'}>
              Updated {relTime(newestTs)}
            </span>
          ) : null}
        </div>
      </div>

      <p className={std ? 'mb-2 text-[11px] text-slate-600' : 'mb-2 text-[10px] text-slate-500'}>
        Advisory. Does not replace IMD. Shadow heat decision layer for 5 Odisha cities.
      </p>

      {q.isLoading ? (
        <div className={`h-12 animate-pulse rounded-md ${std ? 'bg-amber-100' : 'bg-white/5'}`} />
      ) : q.isError ? (
        <p className={std ? 'text-sm text-red-700' : 'text-sm text-red-300'}>
          Heat score unavailable. Flood surfaces still work.
        </p>
      ) : engineOff ? (
        <p className={std ? 'text-sm text-slate-600' : 'text-sm text-slate-400'}>Heat engine off</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {cities.map((c) => {
            const awaiting = c.heat_score === null || c.heat_score === undefined;
            return (
              <button
                key={c.region}
                type="button"
                onClick={() => {
                  setLocation(c.region);
                  onSelectCity(c.region);
                }}
                className={
                  std
                    ? 'inline-flex items-center gap-2 rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-left transition hover:border-amber-400 hover:bg-amber-50'
                    : 'inline-flex items-center gap-2 rounded-sm border border-amber-400/25 bg-black/30 px-2.5 py-1.5 text-left transition hover:border-amber-300/50 hover:bg-amber-500/10'
                }
              >
                <span className={`text-sm font-medium ${std ? 'text-slate-900' : 'text-white'}`}>{c.region}</span>
                {awaiting ? (
                  <span className={std ? 'text-[11px] text-slate-500' : 'text-[10px] text-slate-500'}>awaiting data</span>
                ) : (
                  <>
                    <span className={severityChipClass(c.severity, uiMode)}>{c.severity ?? 'n/a'}</span>
                    <span className={`tabular-nums text-xs ${std ? 'text-slate-600' : 'text-slate-300'}`}>
                      {fmtScore(c.heat_score)}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
