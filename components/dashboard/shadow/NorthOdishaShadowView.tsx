'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MapPinned, RefreshCw, Shield } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { POLLING_INTERVALS, withJitter } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';
import ShadowBadge from '@/components/dashboard/heat/ShadowBadge';
import ShadowRiverGauge from '@/components/dashboard/shadow/ShadowRiverGauge';
import EvidenceMode from '@/components/dashboard/warroom/EvidenceMode';
import { severityChipClass, normalizeSeverity } from '@/lib/ui/severity';
import type { ShadowRiskCity } from '@/lib/api/schemas';

/** Bulletin dates that replay the Aug 2026 north Odisha flood peak window. */
const DEMO_BULLETIN_DATES = [
  '2026-08-12',
  '2026-08-15',
  '2026-08-17',
  '2026-08-19',
  '2026-08-21',
  '2026-08-23',
  '2026-08-25',
] as const;

const PEAK_DEMO_DATE = '2026-08-19';

function fmtScore(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '-';
  return n.toFixed(2);
}

function fmtMm(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '-';
  return `${Math.round(n * 10) / 10} mm`;
}

/**
 * North Odisha flood shadow - scored and published, never alerted.
 * Separate from Flood Ops (5 product cities) and Heat Ops.
 */
export default function NorthOdishaShadowView() {
  const { uiMode } = useMission();
  const std = uiMode === 'standard';
  const [bulletinDate, setBulletinDate] = useState<string | undefined>(PEAK_DEMO_DATE);
  const [selected, setSelected] = useState<string | null>(null);

  const mapQ = useQuery({
    queryKey: ['shadow-risk-map'],
    queryFn: ({ signal }) => api.shadowRiskMap(signal),
    refetchInterval: () => withJitter(POLLING_INTERVALS.shadow),
  });

  const riversQ = useQuery({
    queryKey: ['shadow-rivers', bulletinDate ?? 'latest'],
    queryFn: ({ signal }) => api.shadowRivers(bulletinDate, signal),
    refetchInterval: () => withJitter(POLLING_INTERVALS.shadow),
  });

  const cities = mapQ.data?.cities ?? [];
  const basins = mapQ.data?.basins ?? [];
  const note =
    mapQ.data?.note ??
    'Shadow validation only. Scored and published, not alerted. Does not override IMD, CWC or OSDMA warnings.';
  const gauges = riversQ.data?.gauges ?? [];
  const aboveDanger = gauges.filter((g) => g.above_danger).length;
  const effectiveBulletin = riversQ.data?.bulletin_date ?? bulletinDate ?? '-';

  const close = useCallback(() => setSelected(null), []);
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, close]);

  const sortedCities = useMemo(() => {
    const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'];
    return [...cities].sort((a, b) => {
      const sa = order.indexOf(normalizeSeverity(a.severity ?? a.risk_level));
      const sb = order.indexOf(normalizeSeverity(b.severity ?? b.risk_level));
      return sa - sb || String(a.region).localeCompare(String(b.region));
    });
  }, [cities]);

  const shell = std
    ? 'rounded-lg border border-slate-200 bg-white shadow-sm'
    : 'rounded-md border border-slate-500/25 bg-[#0a0c10]';

  return (
    <div className="space-y-4 p-3 md:p-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <MapPinned size={16} className={std ? 'text-slate-600' : 'text-slate-300'} />
            <p
              className={
                std
                  ? 'text-xs font-semibold uppercase tracking-wide text-slate-600'
                  : 'font-mono text-[10px] uppercase tracking-[0.35em] text-slate-400'
              }
            >
              Flood shadow
            </p>
            <ShadowBadge
              mode={uiMode}
              showDisclaimer={false}
              label="SHADOW · not alerting"
            />
          </div>
          <h1 className={`mt-1 text-2xl font-semibold tracking-tight ${std ? 'text-slate-900' : 'text-white'}`}>
            North Odisha · shadow validation
          </h1>
          <p className={`mt-1 max-w-2xl text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
            {basins.length ? `${basins.join(' · ')}. ` : ''}
            Scored and published, not alerted. Advisory only; does not override IMD, CWC or OSDMA warnings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/ops"
            className={
              std
                ? 'inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50'
                : 'inline-flex items-center gap-2 rounded-md border border-cyan-400/25 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/10'
            }
          >
            <Shield size={14} />
            Flood Ops
          </Link>
          <button
            type="button"
            onClick={() => {
              void mapQ.refetch();
              void riversQ.refetch();
            }}
            className={
              std
                ? 'inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
                : 'inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:bg-white/5'
            }
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </header>

      <p
        className={
          std
            ? 'rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600'
            : 'rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-slate-400'
        }
      >
        {note}
      </p>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* City scores */}
        <section className={`xl:col-span-5 ${shell} p-4`}>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className={`text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>
              Shadow cities
            </h2>
            <span className={std ? 'text-xs text-slate-500' : 'text-xs text-slate-500'}>
              /risk/shadow/map · {cities.length}
            </span>
          </div>
          <p className={`mt-1 text-xs ${std ? 'text-slate-500' : 'text-slate-500'}`}>
            Rainfall-only scores. Colour shows severity; this surface does not alert.
          </p>

          {mapQ.isError ? (
            <p className={`mt-4 text-sm ${std ? 'text-red-700' : 'text-red-300'}`}>
              Shadow map unavailable.{' '}
              <button type="button" className="underline" onClick={() => void mapQ.refetch()}>
                Retry
              </button>
            </p>
          ) : mapQ.isLoading ? (
            <div className="mt-4 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-16 animate-pulse rounded-md ${std ? 'bg-slate-100' : 'bg-white/5'}`} />
              ))}
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {sortedCities.map((c) => (
                <CityRow
                  key={c.region}
                  city={c}
                  std={std}
                  mode={uiMode}
                  onOpen={() => setSelected(c.region)}
                />
              ))}
            </ul>
          )}
        </section>

        {/* DoWR rivers */}
        <section className={`xl:col-span-7 ${shell} p-4`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className={`text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>
                DoWR river gauges
              </h2>
              <p className={`mt-1 text-xs ${std ? 'text-slate-500' : 'text-slate-500'}`}>
                {riversQ.data?.source ?? 'Odisha DoWR daily Flood Bulletin'} · bulletin{' '}
                <span className="font-medium tabular-nums">{effectiveBulletin}</span>
                {aboveDanger > 0 ? (
                  <span className={std ? ' text-orange-800' : ' text-orange-200'}>
                    {' '}
                    · {aboveDanger} above danger
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className={`text-xs font-medium ${std ? 'text-slate-600' : 'text-slate-400'}`}>
              Bulletin date
            </label>
            <select
              value={bulletinDate ?? ''}
              onChange={(e) => setBulletinDate(e.target.value || undefined)}
              className={
                std
                  ? 'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800'
                  : 'rounded-md border border-white/15 bg-slate-950 px-2 py-1.5 font-mono text-xs text-slate-200'
              }
            >
              <option value="">Latest published</option>
              {DEMO_BULLETIN_DATES.map((d) => (
                <option key={d} value={d}>
                  {d}
                  {d === PEAK_DEMO_DATE ? ' · flood peak demo' : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setBulletinDate(PEAK_DEMO_DATE)}
              className={
                std
                  ? 'rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-medium text-orange-900 hover:bg-orange-100'
                  : 'rounded-md border border-orange-400/30 bg-orange-500/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-orange-200 hover:bg-orange-500/15'
              }
            >
              Peak · Aug 19
            </button>
          </div>

          <p className={`mt-2 text-[11px] ${std ? 'text-slate-500' : 'text-slate-500'}`}>
            Daily document, not a live feed. Rainfall shows what is coming; gauges show what is already there.
          </p>

          {riversQ.isError ? (
            <p className={`mt-4 text-sm ${std ? 'text-red-700' : 'text-red-300'}`}>
              River bulletin unavailable.{' '}
              <button type="button" className="underline" onClick={() => void riversQ.refetch()}>
                Retry
              </button>
            </p>
          ) : riversQ.isLoading ? (
            <div className="mt-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-20 animate-pulse rounded-md ${std ? 'bg-slate-100' : 'bg-white/5'}`} />
              ))}
            </div>
          ) : riversQ.data?.error ? (
            <p className={`mt-4 text-sm ${std ? 'text-amber-800' : 'text-amber-200'}`}>
              {String(riversQ.data.error)}
            </p>
          ) : gauges.length === 0 ? (
            <p className={`mt-4 text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
              No gauges returned for this bulletin date.
            </p>
          ) : (
            <div className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {gauges.map((g, i) => (
                <ShadowRiverGauge
                  key={`${g.site ?? 'g'}-${g.river ?? i}`}
                  gauge={g}
                  mode={uiMode}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Evidence uses product Evidence Mode shape; never treat as alerting */}
      <EvidenceMode location={selected} onClose={close} alerting={false} />
    </div>
  );
}

function CityRow({
  city,
  std,
  mode,
  onOpen,
}: {
  city: ShadowRiskCity;
  std: boolean;
  mode: 'standard' | 'command';
  onOpen: () => void;
}) {
  const sev = city.severity ?? city.risk_level ?? 'n/a';
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={
          std
            ? 'flex w-full items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-left transition hover:border-slate-300 hover:bg-white'
            : 'flex w-full items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-white/20 hover:bg-white/[0.05]'
        }
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`truncate text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>
              {city.region}
            </span>
            <span className={severityChipClass(sev, mode)}>{sev}</span>
          </div>
          <p className={`mt-0.5 text-xs tabular-nums ${std ? 'text-slate-500' : 'text-slate-500'}`}>
            Past 24h {fmtMm(city.rainfall_past_24h_mm)} · Fcst {fmtMm(city.rainfall_forecast_24h_mm)}
            {city.trend ? ` · ${city.trend}` : ''}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-lg font-semibold tabular-nums ${std ? 'text-slate-900' : 'text-white'}`}>
            {fmtScore(city.rule_score)}
          </p>
          <p className={`text-[10px] uppercase tracking-wide ${std ? 'text-slate-400' : 'text-slate-500'}`}>
            rule
          </p>
        </div>
      </button>
    </li>
  );
}
