'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import { ErrorBlock, EmptyBlock } from '@/components/dashboard/Atoms';
import { relTime } from '@/components/dashboard/util';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import { listRow, listRowMeta, listRowPrimary, panelCard, showHudChrome } from '@/lib/ui/standard-surface';

/**
 * Historical Backtest / Validation card.
 * Reads `/ml/backtest/summary` (offline-generated; long staleTime).
 *
 * Renders:
 *   - Hero recall at 24h lead time
 *   - Headline narrative + scored/total
 *   - 48h secondary row
 *   - Per-city breakdown (24h)
 *   - Coverage footer (events across pilot cities)
 *   - Collapsible caveats
 */
export default function BacktestCard() {
  const [showCaveats, setShowCaveats] = useState(false);
  const mode = useDashboardUiMode();
  const std = mode === 'standard';

  const q = useQuery({
    queryKey: ['ml-backtest-summary'],
    queryFn: () => api.mlBacktestSummary(),
    staleTime: 30 * 60_000,
    refetchInterval: false,
    refetchOnMount: false,
  });

  const data = q.data;
  const available = data?.available !== false && Boolean(data?.lead_time_24h);

  const cities = useMemo(() => {
    const by = data?.lead_time_24h?.by_city ?? {};
    return Object.entries(by)
      .map(([name, v]) => ({
        name,
        scored: v?.scored ?? 0,
        triggered: v?.triggered ?? 0,
        recall: v?.recall ?? null,
      }))
      .sort((a, b) => b.scored - a.scored);
  }, [data]);

  const coverage = data?.flood_events_coverage;
  const totalEvents = coverage?.pilot_city_mapped;
  const pilotCount = data?.pilot_cities?.length ?? cities.length;

  const recall24 = data?.lead_time_24h?.recall_pct;
  const recall48 = data?.lead_time_48h?.recall_pct;
  const scored = data?.lead_time_24h?.scored_events;
  const total = data?.total_pilot_events;
  const triggered24 = data?.lead_time_24h?.triggered_medium_plus;
  const triggered48 = data?.lead_time_48h?.triggered_medium_plus;

  const caveats = data?.caveats ?? [];
  const generatedAt = data?.generated_at;

  return (
    <HudFrame
      label="HISTORICAL BACKTEST"
      subtitle="/ml/backtest/summary · rule engine v2"
      status={q.isError ? 'critical' : available ? 'nominal' : 'idle'}
      statusText={q.isLoading ? 'SYNC' : q.isError ? 'FAULT' : available ? 'VALIDATED' : 'N/A'}
      meta={[
        ...(generatedAt ? [{ label: 'GENERATED', value: relTime(generatedAt) }] : []),
        ...(totalEvents !== undefined ? [{ label: 'COVERAGE', value: `${totalEvents} ev` }] : []),
      ]}
    >
      {q.isError ? (
        <ErrorBlock onRetry={() => void q.refetch()} message="backtest summary endpoint failed" />
      ) : q.isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr]">
          <div className="h-32 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
          <div className="h-32 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
        </div>
      ) : !available ? (
        <EmptyBlock message="backtest report not available yet" />
      ) : (
        <div className="space-y-4">
          {/* HERO + BY-CITY */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr]">
            {/* Hero - 24h recall */}
            <div
              className={
                std
                  ? 'rounded-lg border border-emerald-200 bg-emerald-50 p-4'
                  : 'relative overflow-hidden rounded-md border border-emerald-400/25 bg-gradient-to-br from-emerald-950/30 via-slate-950/60 to-slate-950/80 p-4'
              }
            >
              {showHudChrome(mode) ? (
                <>
                  <span className="hud-bracket hud-bracket-tl" />
                  <span className="hud-bracket hud-bracket-br" />
                </>
              ) : null}
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className={std ? 'text-emerald-700' : 'text-emerald-300'} />
                <p className={std ? 'text-xs font-semibold uppercase tracking-wide text-emerald-800' : 'font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/80'}>
                  24h Lead-Time Recall
                </p>
              </div>
              <div className="mt-2 flex items-end gap-3">
                <p className={std ? 'text-5xl font-bold tabular-nums text-emerald-900' : 'font-mono text-5xl font-semibold tabular-nums text-emerald-200'}>
                  {recall24 !== undefined ? `${recall24.toFixed(1)}%` : 'n/a'}
                </p>
                <p className={std ? 'mb-1.5 text-sm text-slate-600' : 'mb-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-400'}>
                  {triggered24 ?? 'n/a'} / {scored ?? 'n/a'} scored · {total ?? 'n/a'} total events
                </p>
              </div>
              {data?.headline ? (
                <p className={`mt-3 max-w-3xl text-sm leading-relaxed ${std ? 'text-slate-700' : 'text-slate-300'}`}>{data.headline}</p>
              ) : null}

              <div className={`mt-4 flex flex-wrap items-center gap-3 border-t pt-3 ${std ? 'border-emerald-200' : 'border-white/5'}`}>
                <span className={std ? 'text-xs font-medium text-slate-600' : 'font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500'}>
                  48h Lead Time
                </span>
                <span className={std ? 'text-base font-semibold tabular-nums text-slate-900' : 'font-mono text-base font-semibold tabular-nums text-cyan-200'}>
                  {recall48 !== undefined ? `${recall48.toFixed(1)}%` : 'n/a'}
                </span>
                <span className={std ? 'text-xs text-slate-500' : 'font-mono text-[10px] uppercase tracking-widest text-slate-500'}>
                  {triggered48 ?? 'n/a'} / {scored ?? 'n/a'}
                </span>
                <span className={`ml-auto ${std ? 'text-xs text-slate-500' : 'font-mono text-[10px] uppercase tracking-widest text-slate-500'}`}>
                  threshold ≥ {data?.lead_time_24h?.alert_threshold ?? '0.40'}
                </span>
              </div>
            </div>

            <div className={panelCard(mode)}>
              {showHudChrome(mode) ? (
                <>
                  <span className="hud-bracket hud-bracket-tl" />
                  <span className="hud-bracket hud-bracket-br" />
                </>
              ) : null}
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
                  Per City · 24h
                </p>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                  scored · triggered
                </span>
              </div>
              <div className="space-y-1.5">
                {cities.map((c) => {
                  const inactive = c.scored === 0;
                  const recallPct = c.recall !== null ? c.recall * 100 : null;
                  const tone =
                    recallPct === null
                      ? 'idle'
                      : recallPct >= 99
                        ? 'nominal'
                        : recallPct >= 95
                          ? 'info'
                          : 'warning';
                  return (
                    <div
                      key={c.name}
                      className={`grid grid-cols-[18px_1fr_auto_auto] items-center gap-2 ${listRow(mode)} ${inactive ? 'opacity-50' : ''}`}
                    >
                      <StatusLed tone={tone} size={6} pulse={!std} />
                      <span className={listRowPrimary(mode)}>{c.name}</span>
                      <span className={`tabular-nums ${listRowMeta(mode)}`}>
                        {c.scored} · {c.triggered}
                      </span>
                      <span
                        className={`tabular-nums text-xs font-semibold ${
                          recallPct === null
                            ? 'text-slate-500'
                            : recallPct >= 99
                              ? std ? 'text-emerald-800' : 'text-emerald-200'
                              : recallPct >= 95
                                ? std ? 'text-blue-800' : 'text-cyan-200'
                                : std ? 'text-amber-900' : 'text-amber-200'
                        }`}
                      >
                        {recallPct === null ? 'n/a' : `${recallPct.toFixed(1)}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Coverage footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-white/5 bg-slate-950/40 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
            <span>
              <span className="text-slate-500">Coverage · </span>
              <span className="text-cyan-200">
                {totalEvents ?? 'n/a'} events
              </span>{' '}
              across <span className="text-cyan-200">{pilotCount}</span> pilot cities
            </span>
            {coverage?.by_source ? (
              <span className="text-slate-500">
                {Object.entries(coverage.by_source)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' · ')}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => void q.refetch()}
              className="flex items-center gap-1 rounded-sm border border-white/10 bg-black/40 px-1.5 py-0.5 text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200"
            >
              <RefreshCw size={9} /> Refresh
            </button>
          </div>

          {/* Caveats - collapsible for honesty */}
          {caveats.length > 0 ? (
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2">
              <button
                type="button"
                onClick={() => setShowCaveats((s) => !s)}
                className="flex w-full items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-200/90"
              >
                <span>
                  Caveats <span className="text-amber-300/60">({caveats.length})</span>
                </span>
                {showCaveats ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
              {!showCaveats ? (
                <p className="mt-1 line-clamp-1 text-[11px] text-amber-100/70">{caveats[0]}</p>
              ) : (
                <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-amber-100/80">
                  {caveats.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-amber-300/70" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      )}
    </HudFrame>
  );
}
