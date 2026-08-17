'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, AlertTriangle, ShieldCheck, ChevronRight, Film } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { useMission } from '@/components/dashboard/MissionContext';
import { relTime } from '@/components/dashboard/util';
import type { Briefing, BriefingDistrict } from '@/lib/api/schemas';
import {
  SEVERITY_ORDER,
  confidencePct,
  normalizeSeverity,
  replayViewHref,
  scorePct,
  severityBorderClass,
  severityChipClass,
  trendArrow,
  trendLabel,
} from '@/lib/ui/severity';

const BRIEFING_REFRESH_MS = 5 * 60_000;

export default function StateBriefing({
  onSelectDistrict,
  activeDistrict,
}: {
  onSelectDistrict: (location: string) => void;
  activeDistrict: string | null;
}) {
  const { uiMode } = useMission();
  const std = uiMode === 'standard';

  const q = useQuery({
    queryKey: ['briefing-odisha'],
    queryFn: ({ signal }) => api.briefing(signal),
    refetchInterval: BRIEFING_REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  if (q.isLoading) return <BriefingSkeleton std={std} />;

  if (q.isError) {
    return (
      <div
        className={
          std
            ? 'rounded-lg border-2 border-red-600 bg-white p-5'
            : 'rounded-md border border-red-500/40 bg-red-500/10 p-5'
        }
      >
        <p className={std ? 'text-sm font-semibold text-red-800' : 'font-mono text-[11px] uppercase tracking-widest text-red-200'}>
          Today&apos;s situation is unavailable
        </p>
        <p className={`mt-1 text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
          {q.error instanceof Error ? q.error.message : 'Could not reach the briefing service'}
        </p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className={
            std
              ? 'mt-3 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
              : 'mt-3 inline-flex items-center gap-2 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20'
          }
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  const b = q.data as Briefing;
  const districts = b.districts ?? [];
  const total = districts.length || 5;
  const attention = b.attention_count ?? 0;
  const allClear = attention === 0;
  const counts = b.counts ?? {};
  const briefingErrors = (b.errors ?? []).filter(Boolean);

  const label = std
    ? 'text-[11px] font-semibold uppercase tracking-wide text-slate-500'
    : 'font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500';
  const cardShell = std
    ? 'rounded-lg border border-slate-200 bg-white shadow-sm'
    : 'rounded-md border border-cyan-400/15 bg-[#060b18]/95';

  return (
    <div className="space-y-4">
      {/* Today's Situation banner */}
      <section
        className={`${cardShell} overflow-hidden ${
          allClear
            ? std ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-emerald-400'
            : std ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-red-500'
        }`}
      >
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-stretch">
          {/* Attention stat */}
          <div className={`flex shrink-0 flex-col justify-center md:w-52 ${std ? '' : ''}`}>
            <div className="flex items-center gap-2">
              {allClear ? (
                <ShieldCheck size={16} className={std ? 'text-emerald-600' : 'text-emerald-400'} />
              ) : (
                <AlertTriangle size={16} className={std ? 'text-red-600' : 'text-red-400'} />
              )}
              <p className={label}>Today&apos;s situation</p>
            </div>
            <p className={`mt-2 text-5xl font-semibold tabular-nums leading-none ${std ? 'text-slate-900' : 'text-white'}`}>
              {attention}
              <span className={`text-2xl font-normal ${std ? 'text-slate-400' : 'text-slate-500'}`}> / {total}</span>
            </p>
            <p className={`mt-1 text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
              {allClear ? 'All districts calm' : 'districts need attention'}
            </p>
          </div>

          {/* Summary + refresh */}
          <div className="min-w-0 flex-1 md:border-l md:pl-5 md:border-slate-200/60">
            <div className="flex items-start justify-between gap-3">
              <p className={label}>{b.region ?? 'Odisha pilot cities'}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${std ? 'text-slate-500' : 'font-mono text-[10px] uppercase tracking-widest text-slate-500'}`}>
                  Updated {relTime(b.generated_at)}
                </span>
                <button
                  type="button"
                  onClick={() => void q.refetch()}
                  aria-label="Refresh briefing"
                  className={
                    std
                      ? 'rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50'
                      : 'rounded-sm border border-white/15 p-1.5 text-slate-300 hover:bg-white/5'
                  }
                >
                  <RefreshCw size={13} className={q.isFetching ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            <p className={`mt-2 text-[15px] leading-relaxed ${std ? 'text-slate-800' : 'text-slate-200'}`}>
              {b.summary ?? 'Briefing summary is not available right now.'}
            </p>
          </div>
        </div>

        {/* Counts strip */}
        <div className={`flex flex-wrap gap-2 px-5 py-3 ${std ? 'border-t border-slate-200 bg-slate-50' : 'border-t border-white/10 bg-white/[0.03]'}`}>
          {SEVERITY_ORDER.map((key) => (
            <span key={key} className={severityChipClass(key, uiMode)}>
              {key}
              <span className="tabular-nums">{counts[key] ?? 0}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Briefing-level errors */}
      {briefingErrors.length > 0 ? (
        <div
          className={
            std
              ? 'flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900'
              : 'flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200'
          }
        >
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            Some inputs were degraded while generating this briefing ({briefingErrors.length}). Figures may be partial.
          </span>
        </div>
      ) : null}

      {/* Top Risks + Top Actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={`${cardShell} p-4`}>
          <p className={`${label} mb-2`}>Top risks</p>
          {(b.top_risks ?? []).length === 0 ? (
            <p className={`text-sm ${std ? 'text-slate-500' : 'text-slate-400'}`}>No elevated risks right now</p>
          ) : (
            <ul className="space-y-1.5">
              {b.top_risks!.map((r) => {
                const conf = confidencePct(r.confidence);
                return (
                  <li key={r.location}>
                    <button
                      type="button"
                      onClick={() => onSelectDistrict(r.location)}
                      className={
                        std
                          ? 'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-slate-50'
                          : 'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-white/5'
                      }
                    >
                      <span className={severityChipClass(r.severity, uiMode)}>{r.severity ?? 'n/a'}</span>
                      <span className={`flex-1 truncate text-sm font-medium ${std ? 'text-slate-800' : 'text-slate-200'}`}>
                        {r.location}
                      </span>
                      {conf !== null ? (
                        <span className={`text-xs tabular-nums ${std ? 'text-slate-500' : 'text-slate-400'}`}>{conf}% conf</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={`${cardShell} p-4`}>
          <p className={`${label} mb-2`}>Top actions</p>
          {(b.top_actions ?? []).length === 0 ? (
            <p className={`text-sm ${std ? 'text-slate-500' : 'text-slate-400'}`}>No field action required</p>
          ) : (
            <ul className="space-y-1.5">
              {b.top_actions!.map((a) => (
                <li key={a} className={`flex items-start gap-2 text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${std ? 'bg-blue-500' : 'bg-cyan-400/70'}`} />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* District ranking */}
      <section>
        <p className={`${label} mb-2`}>District ranking · highest risk first</p>
        <div className="space-y-2">
          {districts.map((d) => (
            <DistrictRow
              key={d.location}
              district={d}
              mode={uiMode}
              std={std}
              active={activeDistrict === d.location}
              onSelect={() => onSelectDistrict(d.location)}
            />
          ))}
        </div>
      </section>

      {/* Persistent disclaimer footer */}
      {b.disclaimer ? (
        <p className={`pt-1 text-center text-xs ${std ? 'text-slate-500' : 'font-mono text-[10px] uppercase tracking-widest text-slate-500'}`}>
          {b.disclaimer}
        </p>
      ) : null}
    </div>
  );
}

function DistrictRow({
  district: d,
  mode,
  std,
  active,
  onSelect,
}: {
  district: BriefingDistrict;
  mode: ReturnType<typeof useMission>['uiMode'];
  std: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const sev = normalizeSeverity(d.severity);
  const score = scorePct(d.risk_score);
  const conf = confidencePct(d.confidence);
  const ev = d.similar_event ?? null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group cursor-pointer border-l-4 ${severityBorderClass(sev, mode)} ${
        std
          ? `rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow ${active ? 'ring-2 ring-blue-400' : ''}`
          : `rounded-md border border-white/10 bg-[#060b18]/95 p-4 transition hover:border-cyan-400/30 hover:bg-white/[0.04] ${active ? 'ring-1 ring-cyan-400/60' : ''}`
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={severityChipClass(sev, mode)}>{d.severity ?? 'n/a'}</span>
        <span className={`text-base font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>{d.location}</span>
        <span className={`ml-auto flex items-center gap-3 text-sm ${std ? 'text-slate-600' : 'text-slate-300'}`}>
          {score !== null ? (
            <span className="tabular-nums">
              <span className={std ? 'text-slate-400' : 'text-slate-500'}>risk </span>
              <span className={`font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>{score}%</span>
            </span>
          ) : null}
          {conf !== null ? (
            <span className="tabular-nums">
              <span className={std ? 'text-slate-400' : 'text-slate-500'}>conf </span>
              {conf}%
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            {trendArrow(d.trend)} {trendLabel(d.trend)}
          </span>
          <ChevronRight size={16} className={`transition group-hover:translate-x-0.5 ${std ? 'text-slate-400' : 'text-slate-500'}`} />
        </span>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm md:grid-cols-2">
        {d.primary_driver ? (
          <p className={std ? 'text-slate-600' : 'text-slate-400'}>
            <span className={std ? 'text-slate-400' : 'text-slate-500'}>Driver: </span>
            {d.primary_driver}
          </p>
        ) : null}
        {d.top_reason ? (
          <p className={std ? 'text-slate-600' : 'text-slate-400'}>
            <span className={std ? 'text-slate-400' : 'text-slate-500'}>Why: </span>
            {d.top_reason}
          </p>
        ) : null}
      </div>

      {d.top_action ? (
        <p className={`mt-1.5 text-sm ${std ? 'text-slate-800' : 'text-slate-200'}`}>
          <span className={std ? 'text-slate-400' : 'text-slate-500'}>Action: </span>
          {d.top_action}
        </p>
      ) : null}

      {ev && ev.date ? (
        <Link
          href={replayViewHref({ eventId: ev.event_id, source: ev.source, replayUrl: ev.replay_url })}
          onClick={(e) => e.stopPropagation()}
          className={
            std
              ? 'mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline'
              : 'mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-300 hover:underline'
          }
        >
          <Film size={12} /> Compare with {ev.date}
        </Link>
      ) : null}
    </div>
  );
}

function BriefingSkeleton({ std }: { std: boolean }) {
  const block = std ? 'animate-pulse rounded-lg border border-slate-200 bg-slate-100' : 'animate-pulse rounded-md border border-white/5 bg-white/5';
  return (
    <div className="space-y-4">
      <div className={`h-40 ${block}`} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`h-28 ${block}`} />
        <div className={`h-28 ${block}`} />
      </div>
      <div className="space-y-2">
        <div className={`h-20 ${block}`} />
        <div className={`h-20 ${block}`} />
        <div className={`h-20 ${block}`} />
      </div>
    </div>
  );
}
