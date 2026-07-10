'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ShieldAlert, Check, Minus, ShieldCheck, ShieldX } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import { btnSecondary, panelCard } from '@/lib/ui/standard-surface';
import { scorePct, severityChipClass } from '@/lib/ui/severity';
import type {
  MonsoonScorecard,
  MonsoonEvent,
  MonsoonCityDetection,
  MonsoonCityTrust,
} from '@/lib/api/schemas';

const SPARSE_EVENT_THRESHOLD = 5;

function pct1(n: unknown): string {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 'n/a';
  return `${(v * 100).toFixed(1)}%`;
}

function mm(n: unknown): string {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 'n/a';
  return `${Math.round(v * 100) / 100} mm`;
}

/** Honest source-gap: OpenWeather (past_rain) and IMD disagree materially. */
function isSourceGap(past: number | null | undefined, imd: number | null | undefined): boolean {
  const a = typeof past === 'number' ? past : null;
  const b = typeof imd === 'number' ? imd : null;
  if (a === null || b === null) return false;
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return hi >= 10 && (lo === 0 || hi >= lo * 3);
}

export default function MonsoonTrackRecord() {
  const mode = useDashboardUiMode();
  const std = mode === 'standard';

  const q = useQuery({
    queryKey: ['monsoon-scorecard'],
    queryFn: ({ signal }) => api.monsoonScorecard(undefined, signal),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const label = std
    ? 'text-[11px] font-semibold uppercase tracking-wide text-slate-500'
    : 'font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500';

  const s = q.data as MonsoonScorecard | undefined;
  const totalEvents = s?.detection?.total_events ?? s?.events?.length ?? 0;
  const isEmpty = totalEvents === 0;
  const isSparse = totalEvents > 0 && totalEvents < SPARSE_EVENT_THRESHOLD;

  return (
    <section className="space-y-4">
      <div className={std ? 'mt-2 border-t border-slate-200 pt-5' : 'mt-2 border-t border-white/10 pt-5'}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className={std ? 'text-xs font-semibold uppercase tracking-wide text-blue-800' : 'font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-400/80'}>
                Evidence · Live season
              </p>
              <LiveSeasonTag std={std} />
            </div>
            <h2 className={`mt-1 text-xl font-semibold tracking-tight ${std ? 'text-slate-900' : 'text-white'}`}>
              Live Monsoon Track Record
            </h2>
            {s?.season_start ? (
              <p className={`mt-0.5 text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
                Season since {s.season_start}
              </p>
            ) : null}
          </div>
          <button type="button" onClick={() => void q.refetch()} className={btnSecondary(mode)} aria-label="Refresh scorecard">
            <RefreshCw size={13} className={q.isFetching ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {q.isLoading ? (
        <MonsoonSkeleton std={std} />
      ) : q.isError ? (
        <div className={std ? 'rounded-lg border-2 border-red-600 bg-white p-4' : 'rounded-md border border-red-500/40 bg-red-500/10 p-4'}>
          <p className={std ? 'text-sm font-semibold text-red-800' : 'font-mono text-[11px] uppercase tracking-widest text-red-200'}>
            Live scorecard unavailable
          </p>
          <p className={`mt-1 text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
            {q.error instanceof Error ? q.error.message : 'Request failed'}
          </p>
          <button type="button" onClick={() => void q.refetch()} className={`mt-3 ${btnSecondary(mode)}`}>
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      ) : s ? (
        <>
          {/* Mode + disclaimer, always visible */}
          <div className={panelCard(mode)}>
            {s.mode ? (
              <p className={`text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>
                <span className={label}>Mode </span>
                {s.mode}
              </p>
            ) : null}
            {s.disclaimer ? (
              <div
                className={
                  std
                    ? 'mt-3 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2'
                    : 'mt-3 flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2'
                }
              >
                <ShieldAlert size={15} className={`mt-0.5 shrink-0 ${std ? 'text-amber-700' : 'text-amber-300'}`} />
                <p className={`text-sm ${std ? 'text-amber-900' : 'text-amber-200'}`}>{s.disclaimer}</p>
              </div>
            ) : null}
          </div>

          {isEmpty ? (
            <div className={`${panelCard(mode)} text-center`}>
              <p className={`text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>
                This season&apos;s record is still being collected ({totalEvents} events tagged so far).
              </p>
              <p className={`mt-1 text-xs ${std ? 'text-slate-500' : 'text-slate-400'}`}>
                The scorecard grows as the monsoon progresses. Check back through the season.
              </p>
            </div>
          ) : (
            <>
              {isSparse ? (
                <div
                  className={
                    std
                      ? 'rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700'
                      : 'rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300'
                  }
                >
                  This season&apos;s record is still being collected ({totalEvents} events tagged so far). Figures will
                  firm up as the monsoon progresses.
                </div>
              ) : null}

              {/* Headline stats */}
              {(s.headline_numbers ?? []).length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {s.headline_numbers!.map((line) => (
                    <div key={line} className={panelCard(mode)}>
                      <p className={`text-sm leading-relaxed ${std ? 'text-slate-800' : 'text-slate-200'}`}>{line}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Detection summary */}
              <DetectionSummary detection={s.detection} std={std} label={label} mode={mode} />

              {/* Trust gate */}
              <TrustGate dry={s.dry_day_discipline} std={std} label={label} mode={mode} />

              {/* Event log */}
              <EventLog events={s.events ?? []} std={std} label={label} mode={mode} />
            </>
          )}
        </>
      ) : null}
    </section>
  );
}

function LiveSeasonTag({ std }: { std: boolean }) {
  return (
    <span
      className={
        std
          ? 'inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800'
          : 'inline-flex items-center gap-1 rounded-sm bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-emerald-200 ring-1 ring-emerald-400/40'
      }
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> live-season
    </span>
  );
}

function DetectionSummary({
  detection,
  std,
  label,
  mode,
}: {
  detection: MonsoonScorecard['detection'];
  std: boolean;
  label: string;
  mode: ReturnType<typeof useDashboardUiMode>;
}) {
  if (!detection) return null;
  const byCity = Object.entries(detection.by_city ?? {}) as [string, MonsoonCityDetection][];
  const hero = std ? 'rounded-lg border border-slate-200 bg-slate-50 p-4' : 'rounded-md border border-white/10 bg-white/5 p-4';
  const headCell = std
    ? 'px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500'
    : 'px-3 py-1.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-400';

  return (
    <div>
      <p className={`${label} mb-2`}>Detection recall · live season</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className={hero}>
          <p className={label}>Recall (MEDIUM+)</p>
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${std ? 'text-slate-900' : 'text-white'}`}>
            {pct1(detection.recall_medium)}
          </p>
          <p className={`mt-1 text-xs ${std ? 'text-slate-500' : 'text-slate-400'}`}>
            {detection.alerted_medium ?? 0} of {detection.total_events ?? 0} events alerted
          </p>
        </div>
        <div className={hero}>
          <p className={label}>Recall (HIGH)</p>
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${std ? 'text-slate-900' : 'text-white'}`}>
            {pct1(detection.recall_high)}
          </p>
          <p className={`mt-1 text-xs ${std ? 'text-slate-500' : 'text-slate-400'}`}>
            {detection.alerted_high ?? 0} reached HIGH
          </p>
        </div>
        <div className={hero}>
          <p className={label}>Labeled events</p>
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${std ? 'text-slate-900' : 'text-white'}`}>
            {detection.total_events ?? 0}
          </p>
          <p className={`mt-1 text-xs ${std ? 'text-slate-500' : 'text-slate-400'}`}>rain events tagged this season</p>
        </div>
      </div>

      {byCity.length > 0 ? (
        <div className={`mt-3 overflow-x-auto ${panelCard(mode)}`}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className={std ? 'border-b border-slate-200' : 'border-b border-white/10'}>
                <th className={headCell}>City</th>
                <th className={`${headCell} text-right`}>Events</th>
                <th className={`${headCell} text-right`}>Alerted MED+</th>
                <th className={`${headCell} text-right`}>Alerted HIGH</th>
                <th className={`${headCell} text-right`}>Recall MED+</th>
              </tr>
            </thead>
            <tbody>
              {byCity.map(([city, c]) => (
                <tr key={city} className={std ? 'border-b border-slate-100 last:border-0' : 'border-b border-white/5 last:border-0'}>
                  <td className={`px-3 py-1.5 font-medium ${std ? 'text-slate-900' : 'text-white'}`}>{city}</td>
                  <td className={`px-3 py-1.5 text-right tabular-nums ${std ? 'text-slate-700' : 'text-slate-300'}`}>{c.events ?? 0}</td>
                  <td className={`px-3 py-1.5 text-right tabular-nums ${std ? 'text-slate-700' : 'text-slate-300'}`}>{c.alerted_medium ?? 0}</td>
                  <td className={`px-3 py-1.5 text-right tabular-nums ${std ? 'text-slate-700' : 'text-slate-300'}`}>{c.alerted_high ?? 0}</td>
                  <td className={`px-3 py-1.5 text-right tabular-nums ${std ? 'text-slate-700' : 'text-slate-300'}`}>{pct1(c.recall_medium)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function TrustGate({
  dry,
  std,
  label,
  mode,
}: {
  dry: MonsoonScorecard['dry_day_discipline'];
  std: boolean;
  label: string;
  mode: ReturnType<typeof useDashboardUiMode>;
}) {
  if (!dry) return null;
  const passed = dry.trust_gate_passed === true;
  const target = dry.target_days ?? 14;
  const perCity = Object.entries(dry.per_city ?? {}) as [string, MonsoonCityTrust][];
  const falseHigh = dry.false_high_days ?? [];

  return (
    <div>
      <p className={`${label} mb-2`}>Trust gate · dry-day discipline</p>
      <div className={panelCard(mode)}>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={
              passed
                ? std
                  ? 'inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-300'
                  : 'inline-flex items-center gap-1.5 rounded-sm bg-emerald-500/20 px-2.5 py-1 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/40'
                : std
                  ? 'inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-1 text-sm font-semibold text-amber-900 ring-1 ring-amber-300'
                  : 'inline-flex items-center gap-1.5 rounded-sm bg-amber-500/20 px-2.5 py-1 text-sm font-semibold text-amber-200 ring-1 ring-amber-400/40'
            }
          >
            {passed ? <ShieldCheck size={15} /> : <ShieldX size={15} />}
            Trust gate {passed ? 'passed' : 'open'}
          </span>
          <span className={`text-sm ${std ? 'text-slate-600' : 'text-slate-300'}`}>
            Min clean streak <span className="font-semibold tabular-nums">{dry.min_consecutive_clean_days ?? 0}</span> / {target} days
          </span>
          <span
            className={
              falseHigh.length > 0
                ? std ? 'text-sm font-semibold text-amber-800' : 'text-sm font-semibold text-amber-300'
                : std ? 'text-sm text-slate-600' : 'text-sm text-slate-300'
            }
          >
            False-HIGH days: <span className="tabular-nums">{falseHigh.length}</span>
          </span>
        </div>

        {perCity.length > 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {perCity.map(([city, c]) => {
              const clean = c.consecutive_clean_days ?? 0;
              const tgt = c.target_days ?? target;
              const meets = c.meets_target === true;
              const fill = tgt > 0 ? Math.max(0, Math.min(100, (clean / tgt) * 100)) : 0;
              return (
                <div key={city} className={std ? 'rounded-md border border-slate-200 bg-white p-2.5' : 'rounded-sm border border-white/10 bg-white/5 p-2.5'}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={std ? 'font-medium text-slate-800' : 'text-slate-200'}>{city}</span>
                    <span className={`tabular-nums ${std ? 'text-slate-600' : 'text-slate-400'}`}>
                      {clean} / {tgt} days
                    </span>
                  </div>
                  <div className={`mt-1.5 h-2 w-full overflow-hidden rounded-full ${std ? 'bg-slate-200' : 'bg-white/10'}`}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${fill}%`, background: meets ? '#10b981' : std ? '#f59e0b' : '#fbbf24' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {falseHigh.length > 0 ? (
          <div className="mt-3">
            <p className={label}>False-HIGH days</p>
            <ul className="mt-1 space-y-1">
              {falseHigh.map((d, i) => (
                <li key={`${d.day}-${d.location}-${i}`} className={`text-xs ${std ? 'text-slate-600' : 'text-slate-400'}`}>
                  {d.day} · {d.location}
                  {typeof d.max_rule === 'number' ? ` · rule ${Math.round(d.max_rule * 100) / 100}` : ''}
                  {typeof d.max_past_rain_mm === 'number' ? ` · past ${mm(d.max_past_rain_mm)}` : ''}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {dry.notes ? (
          <p className={`mt-3 text-xs ${std ? 'text-slate-500' : 'text-slate-500'}`}>{dry.notes}</p>
        ) : null}
      </div>
    </div>
  );
}

function EventLog({
  events,
  std,
  label,
  mode,
}: {
  events: MonsoonEvent[];
  std: boolean;
  label: string;
  mode: ReturnType<typeof useDashboardUiMode>;
}) {
  if (events.length === 0) return null;
  const headCell = std
    ? 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500'
    : 'px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-slate-400';

  return (
    <div>
      <p className={`${label} mb-2`}>Event log · labeled rain events</p>
      <div className={std ? 'overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm' : 'overflow-x-auto rounded-md border border-cyan-400/15 bg-[#060b18]/95'}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className={std ? 'border-b border-slate-200 bg-slate-50' : 'border-b border-white/10 bg-white/[0.03]'}>
              <th className={headCell}>Date</th>
              <th className={headCell}>City</th>
              <th className={headCell}>Severity</th>
              <th className={`${headCell} text-center`}>Alerted</th>
              <th className={`${headCell} text-right`}>Rule score</th>
              <th className={`${headCell} text-right`}>Past rain (OW)</th>
              <th className={`${headCell} text-right`}>IMD rain</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => {
              const rule = scorePct(ev.peak_rule_score);
              const gap = isSourceGap(ev.past_rain_mm, ev.imd_rain_mm);
              return (
                <tr
                  key={ev.event_id}
                  className={std ? 'border-b border-slate-100 last:border-0' : 'border-b border-white/5 last:border-0'}
                  title={ev.notes ?? undefined}
                >
                  <td className={`px-3 py-2 tabular-nums ${std ? 'text-slate-700' : 'text-slate-300'}`}>{ev.date ?? 'n/a'}</td>
                  <td className={`px-3 py-2 font-medium ${std ? 'text-slate-900' : 'text-white'}`}>{ev.region ?? 'n/a'}</td>
                  <td className="px-3 py-2">
                    <span className={severityChipClass(ev.severity, mode)}>{ev.severity ?? 'n/a'}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {ev.alerted ? (
                      <Check size={16} className={`inline ${std ? 'text-emerald-600' : 'text-emerald-400'}`} aria-label="alerted" />
                    ) : (
                      <Minus size={16} className={`inline ${std ? 'text-slate-300' : 'text-slate-600'}`} aria-label="not alerted" />
                    )}
                  </td>
                  <td className={`px-3 py-2 text-right tabular-nums ${std ? 'text-slate-700' : 'text-slate-300'}`}>
                    {rule !== null ? `${rule}%` : 'n/a'}
                  </td>
                  <td className={`px-3 py-2 text-right tabular-nums ${gap ? (std ? 'font-semibold text-amber-700' : 'font-semibold text-amber-300') : std ? 'text-slate-700' : 'text-slate-300'}`}>
                    {mm(ev.past_rain_mm)}
                  </td>
                  <td className={`px-3 py-2 text-right tabular-nums ${gap ? (std ? 'font-semibold text-amber-700' : 'font-semibold text-amber-300') : std ? 'text-slate-700' : 'text-slate-300'}`}>
                    {mm(ev.imd_rain_mm)}
                    {gap ? (
                      <span
                        className={
                          std
                            ? 'ml-1.5 rounded bg-amber-100 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-800'
                            : 'ml-1.5 rounded-sm bg-amber-500/20 px-1 py-0.5 font-mono text-[8px] uppercase tracking-widest text-amber-200'
                        }
                      >
                        source gap
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={`mt-2 text-xs ${std ? 'text-slate-500' : 'text-slate-500'}`}>
        Rain columns compare OpenWeather past rain with IMD. A source gap flags where the two disagree materially.
      </p>
    </div>
  );
}

function MonsoonSkeleton({ std }: { std: boolean }) {
  const block = std ? 'animate-pulse rounded-lg border border-slate-200 bg-slate-100' : 'animate-pulse rounded-md border border-white/5 bg-white/5';
  return (
    <div className="space-y-4">
      <div className={`h-20 ${block}`} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className={`h-24 ${block}`} />
        <div className={`h-24 ${block}`} />
        <div className={`h-24 ${block}`} />
      </div>
      <div className={`h-40 ${block}`} />
    </div>
  );
}
