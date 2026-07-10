'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ShieldAlert, Info, Trophy } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import { PageTitle, ErrorBlock } from '@/components/dashboard/Atoms';
import MonsoonTrackRecord from '@/components/dashboard/warroom/MonsoonTrackRecord';
import { btnSecondary, panelCard } from '@/lib/ui/standard-surface';
import { coverageBadgeClass, coverageColor } from '@/lib/ui/severity';
import type {
  FloodBenchSummary,
  FloodBenchEvent,
  FloodBenchCoverageScore,
  FloodBenchBaseline,
} from '@/lib/api/schemas';

const SYSTEM_ORDER = ['ModelEarth', 'Google Flood Hub', 'CWC', 'IMD'];

function orderSystems(keys: string[]): string[] {
  const set = new Set(keys);
  const ordered = SYSTEM_ORDER.filter((s) => set.has(s));
  const rest = keys.filter((k) => !SYSTEM_ORDER.includes(k));
  return [...ordered, ...rest];
}

function pct01(n: unknown): string {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 'n/a';
  return `${(v * 100).toFixed(1)}%`;
}

function dec(n: unknown, digits = 4): string {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 'n/a';
  return v.toFixed(digits);
}

export default function BenchmarkView() {
  const mode = useDashboardUiMode();
  const std = mode === 'standard';

  const q = useQuery({
    queryKey: ['floodbench-summary'],
    queryFn: ({ signal }) => api.floodbenchSummary(signal),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const label = std
    ? 'text-[11px] font-semibold uppercase tracking-wide text-slate-500'
    : 'font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500';

  const b = q.data as FloodBenchSummary | undefined;

  const systems = useMemo(() => {
    if (!b) return [];
    const cov = b.coverage;
    const fromSystems = Object.keys(cov?.systems ?? {});
    if (fromSystems.length) return orderSystems(fromSystems);
    const firstCoverage = cov?.per_event?.[0]?.coverage;
    const fromEvent = firstCoverage ? Object.keys(firstCoverage) : [];
    if (fromEvent.length) return orderSystems(fromEvent);
    return orderSystems(Object.keys(b.contenders ?? {}));
  }, [b]);

  return (
    <div className="space-y-5 p-3 md:p-4">
      <PageTitle eyebrow="Evidence · Reproducible benchmark" title={b?.name ?? 'FloodBench'}>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className={btnSecondary(mode)}
          aria-label="Refresh benchmark"
        >
          <RefreshCw size={13} className={q.isFetching ? 'animate-spin' : ''} /> Refresh
        </button>
      </PageTitle>

      {q.isLoading ? (
        <BenchSkeleton std={std} />
      ) : q.isError ? (
        <ErrorBlock message="benchmark summary unavailable" onRetry={() => void q.refetch()} />
      ) : b ? (
        <>
          {/* Arena + disclaimer, kept prominent */}
          <section className={panelCard(mode)}>
            {b.arena ? (
              <p className={`text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>
                <span className={label}>Arena </span>
                {b.arena}
              </p>
            ) : null}
            {b.disclaimer ? (
              <div
                className={
                  std
                    ? 'mt-3 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2'
                    : 'mt-3 flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2'
                }
              >
                <ShieldAlert size={15} className={`mt-0.5 shrink-0 ${std ? 'text-amber-700' : 'text-amber-300'}`} />
                <p className={`text-sm ${std ? 'text-amber-900' : 'text-amber-200'}`}>{b.disclaimer}</p>
              </div>
            ) : null}
          </section>

          {/* Headline numbers */}
          {(b.headline_numbers ?? []).length > 0 ? (
            <section>
              <p className={`${label} mb-2`}>Headline results</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {b.headline_numbers!.map((line, i) => (
                  <div key={line} className={`${panelCard(mode)} flex gap-3`}>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        std ? 'bg-blue-600 text-white' : 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/40'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <p className={`text-[15px] leading-relaxed ${std ? 'text-slate-800' : 'text-slate-200'}`}>{line}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Coverage matrix */}
          <CoverageMatrix
            events={b.coverage?.per_event ?? []}
            systems={systems}
            methodology={b.coverage?.methodology}
            std={std}
            mode={mode}
            label={label}
          />

          {/* Coverage scores */}
          <CoverageScores
            groups={[
              { key: 'urban_pluvial_only', title: 'Urban / pluvial events only', data: b.coverage?.urban_pluvial_only },
              { key: 'modelearth_arena_only', title: "ModelEarth's arena", data: b.coverage?.modelearth_arena_only },
              { key: 'all_events', title: 'All benchmark events', data: b.coverage?.all_events },
            ]}
            systems={systems}
            std={std}
            label={label}
          />

          {/* Detection panel */}
          <DetectionPanel
            ml={b.detection?.ModelEarth_ML_v2}
            rule={b.detection?.ModelEarth_rule_v2_2}
            std={std}
            mode={mode}
            label={label}
          />

          {/* Baseline callout */}
          <BaselineCallout
            baselines={(b.detection?.baselines ?? {}) as Record<string, unknown>}
            std={std}
            mode={mode}
            label={label}
          />

          {/* Honesty footer */}
          {b.detection?.cross_vendor_note ? (
            <section
              className={
                std
                  ? 'rounded-lg border border-slate-300 bg-slate-50 p-4'
                  : 'rounded-md border border-white/10 bg-white/[0.03] p-4'
              }
            >
              <div className="flex items-start gap-2">
                <Info size={15} className={`mt-0.5 shrink-0 ${std ? 'text-slate-500' : 'text-slate-400'}`} />
                <div>
                  <p className={label}>On cross-vendor accuracy</p>
                  <p className={`mt-1 text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>
                    {b.detection.cross_vendor_note}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      <MonsoonTrackRecord />
    </div>
  );
}

function CoverageMatrix({
  events,
  systems,
  methodology,
  std,
  mode,
  label,
}: {
  events: FloodBenchEvent[];
  systems: string[];
  methodology?: string;
  std: boolean;
  mode: ReturnType<typeof useDashboardUiMode>;
  label: string;
}) {
  if (events.length === 0 || systems.length === 0) return null;
  const headCell = std
    ? 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500'
    : 'px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-slate-400';
  return (
    <section>
      <p className={`${label} mb-2`}>Coverage by event · published operational scope</p>
      <div className={std ? 'overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm' : 'overflow-x-auto rounded-md border border-cyan-400/15 bg-[#060b18]/95'}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className={std ? 'border-b border-slate-200 bg-slate-50' : 'border-b border-white/10 bg-white/[0.03]'}>
              <th className={`${headCell} min-w-[220px]`}>Event</th>
              {systems.map((s) => (
                <th key={s} className={`${headCell} text-center`}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr
                key={ev.id}
                className={std ? 'border-b border-slate-100 last:border-0' : 'border-b border-white/5 last:border-0'}
                title={ev.note ?? undefined}
              >
                <td className="px-3 py-2.5 align-top">
                  <p className={`font-medium ${std ? 'text-slate-900' : 'text-white'}`}>{ev.name ?? ev.id}</p>
                  <p className={`mt-0.5 flex flex-wrap items-center gap-2 text-xs ${std ? 'text-slate-500' : 'text-slate-400'}`}>
                    {ev.date ? <span>{ev.date}</span> : null}
                    {ev.hazard_type ? (
                      <span
                        className={
                          std
                            ? 'rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600'
                            : 'rounded-sm bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-400'
                        }
                      >
                        {ev.hazard_type.replace(/_/g, ' ')}
                      </span>
                    ) : null}
                    {ev.in_arena === false ? (
                      <span className={std ? 'text-[10px] italic text-slate-400' : 'font-mono text-[9px] uppercase tracking-widest text-slate-500'}>
                        out of arena
                      </span>
                    ) : null}
                  </p>
                </td>
                {systems.map((s) => {
                  const val = (ev.coverage ?? {})[s];
                  return (
                    <td key={s} className="px-3 py-2.5 text-center align-middle">
                      <span className={coverageBadgeClass(val, mode)}>{coverageColor(val).label}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {methodology ? (
        <p className={`mt-2 text-xs ${std ? 'text-slate-500' : 'text-slate-500'}`}>{methodology}</p>
      ) : null}
    </section>
  );
}

function CoverageScores({
  groups,
  systems,
  std,
  label,
}: {
  groups: { key: string; title: string; data?: Record<string, FloodBenchCoverageScore> }[];
  systems: string[];
  std: boolean;
  label: string;
}) {
  const usable = groups.filter((g) => g.data && Object.keys(g.data).length > 0);
  if (usable.length === 0) return null;
  return (
    <section>
      <p className={`${label} mb-2`}>Coverage score by scope</p>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {usable.map((g) => (
          <div
            key={g.key}
            className={
              std
                ? 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm'
                : 'rounded-md border border-cyan-400/15 bg-[#060b18]/95 p-4'
            }
          >
            <p className={`mb-3 text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>{g.title}</p>
            <div className="space-y-2.5">
              {systems.map((s) => {
                const pct = g.data?.[s]?.coverage_score_pct;
                const value = typeof pct === 'number' ? pct : 0;
                const isModel = s === 'ModelEarth';
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between text-xs">
                      <span className={isModel ? (std ? 'font-semibold text-slate-900' : 'font-semibold text-cyan-200') : std ? 'text-slate-600' : 'text-slate-400'}>
                        {s}
                      </span>
                      <span className={`tabular-nums ${std ? 'text-slate-700' : 'text-slate-300'}`}>
                        {typeof pct === 'number' ? `${pct.toFixed(1)}%` : 'n/a'}
                      </span>
                    </div>
                    <div className={`mt-1 h-2 w-full overflow-hidden rounded-full ${std ? 'bg-slate-200' : 'bg-white/10'}`}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(100, value))}%`,
                          background: isModel ? (std ? '#2563eb' : '#22d3ee') : std ? '#94a3b8' : '#475569',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OfflineTag({ std }: { std: boolean }) {
  return (
    <span
      className={
        std
          ? 'ml-1.5 rounded bg-slate-200 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-slate-600'
          : 'ml-1.5 rounded-sm bg-white/10 px-1.5 py-0.5 align-middle font-mono text-[9px] uppercase tracking-widest text-slate-400'
      }
    >
      offline
    </span>
  );
}

type Detection = NonNullable<FloodBenchSummary['detection']>;

function DetectionPanel({
  ml,
  rule,
  std,
  mode,
  label,
}: {
  ml?: Detection['ModelEarth_ML_v2'];
  rule?: Detection['ModelEarth_rule_v2_2'];
  std: boolean;
  mode: ReturnType<typeof useDashboardUiMode>;
  label: string;
}) {
  if (!ml && !rule) return null;

  const stat = (title: string, value: string) => (
    <div key={title} className={std ? 'rounded-lg border border-slate-200 bg-slate-50 p-3' : 'rounded-md border border-white/10 bg-white/5 p-3'}>
      <p className={label}>
        {title}
        <OfflineTag std={std} />
      </p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${std ? 'text-slate-900' : 'text-white'}`}>{value}</p>
    </div>
  );

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <Trophy size={15} className={std ? 'text-blue-600' : 'text-cyan-300'} />
        <p className={label}>Detection performance</p>
      </div>
      <div className={panelCard(mode)}>
        {ml ? (
          <>
            <p className={`text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>
              ModelEarth ML v2 · event holdout
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {stat('Recall', pct01(ml.event_holdout?.recall))}
              {stat('Precision', pct01(ml.event_holdout?.precision))}
              {stat('ROC AUC', pct01(ml.event_holdout?.roc_auc))}
              {stat('Operational FPR', pct01(ml.operational_holdout?.false_positive_rate))}
              {stat('Confidence on flood days', dec(ml.calibration?.mean_predicted_when_flood))}
              {stat('Confidence on dry days', dec(ml.calibration?.mean_predicted_when_no_flood))}
              {stat('Leave-one-region-out recall', pct01(ml.leave_one_region_out_mean_recall))}
              {typeof ml.operational_holdout?.decision_threshold === 'number'
                ? stat('Decision threshold', dec(ml.operational_holdout.decision_threshold, 2))
                : null}
            </div>
            {ml.calibration?.interpretation ? (
              <p className={`mt-2 text-xs ${std ? 'text-slate-500' : 'text-slate-400'}`}>{ml.calibration.interpretation}</p>
            ) : null}
          </>
        ) : null}

        {rule ? (
          <div className={ml ? (std ? 'mt-4 border-t border-slate-200 pt-4' : 'mt-4 border-t border-white/10 pt-4') : ''}>
            <p className={`text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>
              ModelEarth rule engine v2.2 · lead time
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              {stat('Recall at T-24h', pct01(rule['recall_at_T-24h']))}
              {stat('Recall at T-48h', pct01(rule['recall_at_T-48h']))}
            </div>
            {rule.note ? (
              <p className={`mt-2 text-xs ${std ? 'text-slate-500' : 'text-slate-400'}`}>{rule.note}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function BaselineCallout({
  baselines,
  std,
  mode,
  label,
}: {
  baselines: Record<string, unknown>;
  std: boolean;
  mode: ReturnType<typeof useDashboardUiMode>;
  label: string;
}) {
  const skillNote = typeof baselines.skill_note === 'string' ? baselines.skill_note : null;
  const rows = Object.entries(baselines).filter(
    ([k, v]) => k !== 'skill_note' && v && typeof v === 'object',
  ) as [string, FloodBenchBaseline][];

  if (!skillNote && rows.length === 0) return null;

  return (
    <section>
      <p className={`${label} mb-2`}>Why this is skillful</p>
      {skillNote ? (
        <div
          className={
            std
              ? 'rounded-lg border-l-4 border-l-emerald-500 border border-emerald-200 bg-emerald-50 p-4'
              : 'rounded-md border-l-4 border-l-emerald-400 border border-emerald-400/20 bg-emerald-500/10 p-4'
          }
        >
          <p className={`text-sm ${std ? 'text-emerald-900' : 'text-emerald-200'}`}>{skillNote}</p>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className={`mt-3 ${panelCard(mode)}`}>
          <p className={`${label} mb-2`}>Trivial baselines for comparison</p>
          <div className="space-y-2">
            {rows.map(([name, data]) => (
              <div
                key={name}
                className={std ? 'rounded-md border border-slate-200 bg-slate-50 p-2.5' : 'rounded-sm border border-white/10 bg-white/5 p-2.5'}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className={`text-sm font-medium ${std ? 'text-slate-900' : 'text-white'}`}>
                    {name.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-xs tabular-nums ${std ? 'text-slate-600' : 'text-slate-300'}`}>
                    recall {typeof data.recall === 'number' ? pct01(data.recall) : String(data.recall ?? 'n/a')}
                  </span>
                  <span className={`text-xs tabular-nums ${std ? 'text-slate-600' : 'text-slate-300'}`}>
                    false-alarm {typeof data.false_positive_rate === 'number' ? pct01(data.false_positive_rate) : String(data.false_positive_rate ?? 'n/a')}
                  </span>
                </div>
                {data.why ? (
                  <p className={`mt-1 text-xs ${std ? 'text-slate-500' : 'text-slate-400'}`}>{data.why}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BenchSkeleton({ std }: { std: boolean }) {
  const block = std ? 'animate-pulse rounded-lg border border-slate-200 bg-slate-100' : 'animate-pulse rounded-md border border-white/5 bg-white/5';
  return (
    <div className="space-y-4">
      <div className={`h-24 ${block}`} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className={`h-20 ${block}`} />
        <div className={`h-20 ${block}`} />
      </div>
      <div className={`h-72 ${block}`} />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className={`h-40 ${block}`} />
        <div className={`h-40 ${block}`} />
        <div className={`h-40 ${block}`} />
      </div>
    </div>
  );
}
