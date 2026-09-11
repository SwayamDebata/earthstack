'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, ShieldCheck, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api/endpoints';
import HudFrame from '@/components/dashboard/HudFrame';
import { ErrorBlock, EmptyBlock } from '@/components/dashboard/Atoms';
import { relTime } from '@/components/dashboard/util';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import { listRow, panelCard, showHudChrome } from '@/lib/ui/standard-surface';

/**
 * Historical validation card — river-truth evidence (D031/D032/D033).
 *
 * Reads `/ml/backtest/summary`, whose shape changed on 2026-09-10:
 * `lead_time_24h`, `lead_time_48h` and `by_city` no longer exist, and the old
 * 99.3% payload survives upstream only under `legacy_v4_retired`, which is
 * provenance and is never rendered.
 *
 * The one rule this card enforces structurally: the basin headline and the
 * statewide context render together or not at all. A 13/13 result on one basin
 * is only an honest number when the ~14-false-alarms-per-flood statewide figure
 * is next to it, so `available` requires both. Showing the good half alone is
 * the exact failure D023/D031 exist to prevent.
 */

const pct = (v: number | null | undefined, digits = 1) =>
  typeof v === 'number' && Number.isFinite(v) ? `${(v * 100).toFixed(digits)}%` : 'n/a';

const range = (a: number[] | undefined) =>
  a && a.length >= 2 ? `${pct(a[0])} / ${pct(a[1])}` : a && a.length === 1 ? pct(a[0]) : 'n/a';

export default function BacktestCard() {
  const [showMethod, setShowMethod] = useState(false);
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
  const head = data?.headline;
  const state = data?.statewide_context;

  // paired by design: never one without the other
  const available = data?.available !== false && Boolean(head) && Boolean(state);

  const basin = data?.basin_dependence;
  const method = data?.method;
  const retired = data?.retired ?? {};
  const generatedAt = data?.generated_at;

  return (
    <HudFrame
      label="RIVER-TRUTH VALIDATION"
      subtitle="/ml/backtest/summary · rule engine, rain-only"
      status={q.isError ? 'critical' : available ? 'nominal' : 'idle'}
      statusText={q.isLoading ? 'SYNC' : q.isError ? 'FAULT' : available ? 'BACKTEST' : 'N/A'}
      meta={[
        ...(generatedAt ? [{ label: 'GENERATED', value: relTime(generatedAt) }] : []),
        ...(method?.labelled_rows !== undefined
          ? [{ label: 'ROWS', value: `${method.labelled_rows}` }]
          : []),
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
        <EmptyBlock message="river-truth evidence not available (headline and statewide context must both be present)" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr]">
            {/* ---- basin headline ---- */}
            <div
              className={
                std
                  ? 'rounded-lg border border-slate-200 bg-slate-50 p-4'
                  : 'relative overflow-hidden rounded-md border border-white/10 bg-slate-950/60 p-4'
              }
            >
              {showHudChrome(mode) ? (
                <>
                  <span className="hud-bracket hud-bracket-tl" />
                  <span className="hud-bracket hud-bracket-br" />
                </>
              ) : null}
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className={std ? 'text-slate-500' : 'text-slate-400'} />
                <p
                  className={
                    std
                      ? 'text-xs font-semibold uppercase tracking-wide text-slate-600'
                      : 'font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500'
                  }
                >
                  {head?.scope ?? 'Basin'} · {head?.lead ?? 'T-2d'}
                </p>
              </div>

              <div className="mt-2 flex items-end gap-3">
                {/* floods caught, not a bare percentage: 13/13 read as a rate
                    invites "100% accurate", which the sample size cannot carry */}
                <p
                  className={
                    std
                      ? 'text-5xl font-bold tabular-nums text-slate-900'
                      : 'font-mono text-5xl font-semibold tabular-nums text-slate-100'
                  }
                >
                  {head?.floods_caught ?? 'n/a'}
                </p>
                <p
                  className={
                    std
                      ? 'mb-1.5 text-sm text-slate-600'
                      : 'mb-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-400'
                  }
                >
                  floods flagged at {head?.lead ?? 'T-2d'}
                </p>
              </div>

              <div className={`mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
                <span>precision {pct(head?.precision)}</span>
                <span>FAR {pct(head?.false_alarm_rate)}</span>
                <span>base rate {pct(head?.base_rate)}</span>
                {typeof head?.lift_over_base_rate === 'number' ? (
                  <span>{head.lift_over_base_rate.toFixed(1)}× lift</span>
                ) : null}
              </div>

              {/* required wherever floods_caught appears */}
              {head?.sample_size_warning ? (
                <p
                  className={
                    std
                      ? 'mt-3 rounded border border-amber-200 bg-amber-50 p-2.5 text-sm leading-relaxed text-amber-900'
                      : 'mt-3 rounded border border-amber-400/30 bg-amber-500/10 p-2.5 text-sm leading-relaxed text-amber-100/90'
                  }
                >
                  {head.sample_size_warning}
                </p>
              ) : null}
            </div>

            {/* ---- statewide context, structurally inseparable ---- */}
            <div className={panelCard(mode)}>
              {showHudChrome(mode) ? (
                <>
                  <span className="hud-bracket hud-bracket-tl" />
                  <span className="hud-bracket hud-bracket-br" />
                </>
              ) : null}
              <div className="mb-2 flex items-center gap-2">
                <TriangleAlert size={13} className={std ? 'text-slate-500' : 'text-slate-400'} />
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
                  Statewide · {state?.lead ?? 'T-1d / T-2d'}
                </p>
              </div>
              <dl className="space-y-1.5">
                {[
                  ['recall', range(state?.recall)],
                  ['precision', range(state?.precision)],
                  ['false alarm rate', range(state?.false_alarm_rate)],
                  ['base rate', pct(state?.base_rate)],
                ].map(([k, v]) => (
                  <div key={k} className={`flex items-baseline justify-between gap-3 ${listRow(mode)}`}>
                    <dt className={std ? 'text-sm text-slate-600' : 'font-mono text-[11px] uppercase tracking-widest text-slate-500'}>
                      {k}
                    </dt>
                    <dd className={std ? 'text-sm font-semibold tabular-nums text-slate-900' : 'font-mono text-sm tabular-nums text-slate-200'}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              {state?.caveat ? (
                <p className={`mt-3 text-sm leading-relaxed ${std ? 'text-slate-600' : 'text-slate-400'}`}>
                  {state.caveat}
                </p>
              ) : null}
            </div>
          </div>

          {/* ---- basin dependence: no figure without its basin ---- */}
          {basin ? (
            <div className={panelCard(mode)}>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
                Basin dependence
              </p>
              <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {[
                  ...Object.entries(basin.best ?? {}).map(([k, v]) => [k, v, true] as const),
                  ...Object.entries(basin.worst ?? {}).map(([k, v]) => [k, v, false] as const),
                ].map(([name, recall, good]) => (
                  <div key={name} className={`flex items-baseline justify-between gap-3 ${listRow(mode)}`}>
                    <span className={std ? 'text-sm text-slate-700' : 'text-sm text-slate-300'}>{name}</span>
                    <span
                      className={
                        good
                          ? 'font-mono text-sm tabular-nums text-emerald-500'
                          : 'font-mono text-sm tabular-nums text-amber-500'
                      }
                    >
                      {pct(recall, 0)}
                    </span>
                  </div>
                ))}
              </div>
              {basin.note ? (
                <p className={`mt-2 text-sm leading-relaxed ${std ? 'text-slate-600' : 'text-slate-400'}`}>
                  {basin.note}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* ---- method + retired figures ---- */}
          <div>
            <button
              type="button"
              onClick={() => setShowMethod((v) => !v)}
              className={
                std
                  ? 'inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900'
                  : 'inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500 hover:text-slate-300'
              }
            >
              {showMethod ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Method and retired figures
            </button>

            {showMethod ? (
              <div className={`mt-2 space-y-3 ${panelCard(mode)}`}>
                {method ? (
                  <dl className="space-y-1">
                    {Object.entries({
                      engine: method.engine,
                      'scored at': method.scored_at,
                      'label source': method.label_source,
                      'gauge readings': method.gauge_readings,
                      'labelled rows': method.labelled_rows,
                      'forecast rows': method.forecast_rows,
                      'ML measured': method.ml_model_measured === true ? 'yes' : 'no',
                    })
                      .filter(([, v]) => v !== undefined && v !== null)
                      .map(([k, v]) => (
                        <div key={k} className="flex flex-wrap items-baseline gap-2">
                          <dt className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{k}</dt>
                          <dd className={std ? 'text-sm text-slate-700' : 'text-sm text-slate-300'}>{String(v)}</dd>
                        </div>
                      ))}
                  </dl>
                ) : null}

                {Object.keys(retired).length > 0 ? (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
                      Retired — do not cite
                    </p>
                    <ul className="mt-1.5 space-y-1.5">
                      {Object.entries(retired).map(([k, v]) => (
                        <li key={k} className={`text-sm leading-relaxed ${std ? 'text-slate-600' : 'text-slate-400'}`}>
                          <span className="font-mono text-[11px] text-slate-500">{k}</span> — {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <Link
                  href="/dashboard/shadow"
                  className={
                    std
                      ? 'inline-flex text-sm font-semibold text-slate-900 underline'
                      : 'inline-flex text-sm font-semibold text-slate-200 underline'
                  }
                >
                  Open North Odisha shadow →
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </HudFrame>
  );
}
