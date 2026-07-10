'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { X, Info, ArrowUpRight, Clock, Film } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/client';
import type { SimilarEvent } from '@/lib/api/schemas';
import { useMission } from '@/components/dashboard/MissionContext';
import WhyBar from '@/components/dashboard/warroom/WhyBar';
import {
  confidencePct,
  isLowConfidence,
  needsAttention,
  normalizeSeverity,
  replayViewHref,
  scorePct,
  severityChipClass,
  trendArrow,
  trendLabel,
} from '@/lib/ui/severity';

function numOf(rec: Record<string, unknown>, key: string): number | null {
  const v = rec[key];
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function EvidenceMode({
  location,
  onClose,
}: {
  location: string | null;
  onClose: () => void;
}) {
  const { uiMode } = useMission();
  const std = uiMode === 'standard';
  const open = Boolean(location);

  const q = useQuery({
    queryKey: ['risk-explain', location],
    queryFn: ({ signal }) => api.riskExplain(location as string, signal),
    enabled: open,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const data = q.data;
  const sev = normalizeSeverity(data?.severity ?? data?.risk_level);
  const urgent = needsAttention(sev);
  const conf = confidencePct(data?.confidence);
  const score = scorePct(data?.risk_score);
  const is404 = q.error instanceof ApiError && q.error.status === 404;

  const panel = std
    ? 'border-l border-slate-200 bg-white text-slate-900'
    : 'border-l border-cyan-400/20 bg-[#060b18] text-slate-100';
  const label = std
    ? 'text-[11px] font-semibold uppercase tracking-wide text-slate-500'
    : 'font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500';

  return (
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label="Evidence mode">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <aside className={`relative flex h-full w-full max-w-xl flex-col overflow-y-auto shadow-2xl ${panel}`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-start gap-3 px-5 py-4 ${std ? 'border-b border-slate-200 bg-white' : 'border-b border-cyan-400/15 bg-[#060b18]'}`}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={label}>Evidence mode</span>
              <span className={severityChipClass(sev, uiMode)}>{data?.severity ?? 'n/a'}</span>
            </div>
            <h2 className={`mt-1 truncate text-xl font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>
              {data?.location ?? location}
            </h2>
            <p className={`mt-0.5 text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
              {q.isLoading ? 'Loading assessment' : data?.headline ?? 'Flood risk assessment'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close evidence mode"
            className={
              std
                ? 'rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50'
                : 'rounded-md border border-white/15 p-1.5 text-slate-300 hover:bg-white/5'
            }
          >
            <X size={16} />
          </button>
        </div>

        {q.isLoading ? (
          <EvidenceSkeleton std={std} />
        ) : q.isError ? (
          <div className="p-5">
            <div
              className={
                std
                  ? 'rounded-lg border-2 border-red-600 bg-white p-4'
                  : 'rounded-md border border-red-500/40 bg-red-500/10 p-4'
              }
            >
              <p className={std ? 'text-sm font-semibold text-red-800' : 'font-mono text-[11px] uppercase tracking-widest text-red-200'}>
                {is404 ? `No assessment available for ${location}` : 'Could not load evidence'}
              </p>
              <p className={`mt-1 text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
                {q.error instanceof Error ? q.error.message : 'Request failed'}
              </p>
              <button
                type="button"
                onClick={() => void q.refetch()}
                className={
                  std
                    ? 'mt-3 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
                    : 'mt-3 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20'
                }
              >
                Retry
              </button>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6 p-5">
            {/* Score + confidence strip */}
            <div className="grid grid-cols-2 gap-3">
              <div className={std ? 'rounded-lg border border-slate-200 bg-slate-50 p-3' : 'rounded-md border border-white/10 bg-white/5 p-3'}>
                <p className={label}>Risk score</p>
                <p className={`mt-1 text-2xl font-semibold tabular-nums ${std ? 'text-slate-900' : 'text-white'}`}>
                  {score !== null ? `${score}%` : 'n/a'}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-sm">
                  <span className={std ? 'text-slate-500' : 'text-slate-400'}>{trendArrow(data.trend)}</span>
                  <span className={std ? 'text-slate-600' : 'text-slate-300'}>{trendLabel(data.trend)}</span>
                  {data.time_to_peak ? (
                    <span className={`ml-auto inline-flex items-center gap-1 ${std ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Clock size={12} /> {data.time_to_peak}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className={std ? 'rounded-lg border border-slate-200 bg-slate-50 p-3' : 'rounded-md border border-white/10 bg-white/5 p-3'}>
                <p className={label}>Confidence</p>
                <p className={`mt-1 text-2xl font-semibold tabular-nums ${std ? 'text-slate-900' : 'text-white'}`}>
                  {conf !== null ? `${conf}%` : 'n/a'}
                  {isLowConfidence(data.confidence) ? (
                    <span className={`ml-2 align-middle text-[11px] font-medium ${std ? 'text-amber-700' : 'text-amber-300'}`}>
                      lower confidence
                    </span>
                  ) : null}
                </p>
                <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${std ? 'bg-slate-200' : 'bg-white/10'}`}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${conf ?? 0}%`,
                      background: isLowConfidence(data.confidence) ? '#f59e0b' : std ? '#2563eb' : '#22d3ee',
                    }}
                  />
                </div>
                {(data.confidence_factors ?? []).length > 0 ? (
                  <ul className={`mt-2 space-y-0.5 ${std ? 'text-slate-500' : 'text-slate-400'}`}>
                    {data.confidence_factors!.map((cf) => (
                      <li key={cf} className="flex items-start gap-1.5 text-xs">
                        <Info size={11} className="mt-0.5 shrink-0" /> <span>{cf}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

            {/* Why this score */}
            <section>
              <h3 className={`mb-2 text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>Why this score?</h3>
              <WhyBar why={data.why ?? []} mode={uiMode} />
            </section>

            {/* Reasons */}
            {(data.reasons ?? []).length > 0 ? (
              <section>
                <h3 className={`mb-2 text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>What we are seeing</h3>
                <ul className="space-y-1.5">
                  {data.reasons!.map((r) => (
                    <li key={r} className={`flex items-start gap-2 text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${std ? 'bg-slate-400' : 'bg-cyan-400/70'}`} />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Suggested actions */}
            {(data.suggested_actions ?? []).length > 0 ? (
              <section
                className={
                  urgent
                    ? std
                      ? 'rounded-lg border-l-4 border-l-red-600 border border-red-200 bg-red-50 p-4'
                      : 'rounded-md border-l-4 border-l-red-500 border border-red-500/25 bg-red-500/10 p-4'
                    : std
                      ? 'rounded-lg border border-slate-200 bg-slate-50 p-4'
                      : 'rounded-md border border-white/10 bg-white/5 p-4'
                }
              >
                <h3 className={`mb-2 text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>
                  Suggested actions
                </h3>
                <ol className="space-y-2">
                  {data.suggested_actions!.map((a, i) => (
                    <li key={a} className={`flex items-start gap-2.5 text-sm ${std ? 'text-slate-800' : 'text-slate-200'}`}>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          urgent
                            ? std ? 'bg-red-600 text-white' : 'bg-red-500/80 text-white'
                            : std ? 'bg-slate-700 text-white' : 'bg-white/15 text-white'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {/* Evidence */}
            <EvidencePanel evidence={(data.evidence ?? {}) as Record<string, unknown>} std={std} label={label} />

            {/* Historical similarity */}
            <HistoricalSimilarity event={data.similar_event ?? null} std={std} label={label} />
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function EvidencePanel({
  evidence,
  std,
  label,
}: {
  evidence: Record<string, unknown>;
  std: boolean;
  label: string;
}) {
  const past = numOf(evidence, 'rainfall_past_24h_mm');
  const fcst = numOf(evidence, 'rainfall_forecast_24h_mm');
  const p95 = numOf(evidence, 'historical_p95_rain_mm');
  const level = numOf(evidence, 'river_level_m');
  const threshold = numOf(evidence, 'flood_threshold_m');
  const station = evidence.river_station ?? evidence.river_station_name;
  const source = evidence.rainfall_source_used;
  const decay = evidence.antecedent_decay_applied;
  const gaugePct = level !== null && threshold ? Math.max(0, Math.min(100, (level / threshold) * 100)) : null;

  const cell = std ? 'rounded-lg border border-slate-200 bg-slate-50 p-3' : 'rounded-md border border-white/10 bg-white/5 p-3';
  const val = `text-sm font-semibold tabular-nums ${std ? 'text-slate-900' : 'text-white'}`;

  const fmt = (n: number | null, unit = '') => (n === null ? 'n/a' : `${Math.round(n * 100) / 100}${unit}`);

  return (
    <section>
      <h3 className={`mb-2 text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>Evidence</h3>

      {/* River gauge */}
      {level !== null && threshold !== null ? (
        <div className={`${cell} mb-3`}>
          <div className="flex items-center justify-between">
            <p className={label}>River level vs flood mark{station ? ` · ${String(station)}` : ''}</p>
            <p className={val}>
              {fmt(level, ' m')} <span className={std ? 'text-slate-400' : 'text-slate-500'}>/ {fmt(threshold, ' m')}</span>
            </p>
          </div>
          <div className={`relative mt-2 h-3 w-full overflow-hidden rounded-full ${std ? 'bg-slate-200' : 'bg-white/10'}`}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${gaugePct ?? 0}%`,
                background: gaugePct !== null && gaugePct >= 90 ? '#b91c1c' : gaugePct !== null && gaugePct >= 70 ? '#f59e0b' : '#10b981',
              }}
            />
            {/* flood-mark marker at 100% */}
            <span className="absolute right-0 top-0 h-full w-0.5 bg-slate-900/60" aria-hidden />
          </div>
          {gaugePct !== null ? (
            <p className={`mt-1 text-xs ${std ? 'text-slate-500' : 'text-slate-400'}`}>
              {Math.round(gaugePct)}% of flood level
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        <div className={cell}>
          <p className={label}>Rain last 24h</p>
          <p className={`mt-1 ${val}`}>{fmt(past, ' mm')}</p>
        </div>
        <div className={cell}>
          <p className={label}>Rain next 24h</p>
          <p className={`mt-1 ${val}`}>{fmt(fcst, ' mm')}</p>
        </div>
        <div className={cell}>
          <p className={label}>Heavy-rain p95</p>
          <p className={`mt-1 ${val}`}>{fmt(p95, ' mm')}</p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className={cell}>
          <p className={label}>Rainfall source</p>
          <p className={`mt-1 text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>{source ? String(source) : 'n/a'}</p>
        </div>
        <div className={cell}>
          <p className={label}>Antecedent decay</p>
          <p className={`mt-1 text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>{decay ? 'Applied' : 'Not applied'}</p>
        </div>
      </div>
    </section>
  );
}

function HistoricalSimilarity({
  event,
  std,
  label,
}: {
  event: SimilarEvent | null;
  std: boolean;
  label: string;
}) {
  if (!event) {
    return (
      <section className={std ? 'rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4' : 'rounded-md border border-dashed border-white/15 bg-white/5 p-4'}>
        <p className={label}>Historical similarity</p>
        <p className={`mt-1 text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
          No comparable historical event on record
        </p>
      </section>
    );
  }

  const sim = typeof event.similarity_pct === 'number' ? Math.round(event.similarity_pct) : null;
  const parts = [event.river_name, event.description].filter(Boolean).join(', ');
  const peak = typeof event.peak_water_level === 'number' ? `${event.peak_water_level} m` : null;
  const href = replayViewHref({ eventId: event.event_id, source: event.source, replayUrl: event.replay_url });

  return (
    <section className={std ? 'rounded-lg border border-blue-200 bg-blue-50 p-4' : 'rounded-md border border-cyan-400/25 bg-cyan-500/5 p-4'}>
      <p className={label}>Historical similarity</p>
      <p className={`mt-1 text-sm ${std ? 'text-slate-800' : 'text-slate-200'}`}>
        {sim !== null ? (
          <>
            Today is <span className="font-semibold">{sim}% similar</span> to {event.date ?? 'a past event'}
          </>
        ) : (
          <>Comparable to {event.date ?? 'a past event'}</>
        )}
        {parts ? `. ${parts}` : ''}
        {peak ? `. Peak ${peak}` : ''}
      </p>
      <Link
        href={href}
        className={
          std
            ? 'mt-3 inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700'
            : 'mt-3 inline-flex items-center gap-2 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20'
        }
      >
        <Film size={13} /> Compare in replay <ArrowUpRight size={13} />
      </Link>
    </section>
  );
}

function EvidenceSkeleton({ std }: { std: boolean }) {
  const block = std ? 'animate-pulse rounded-lg border border-slate-200 bg-slate-100' : 'animate-pulse rounded-md border border-white/5 bg-white/5';
  return (
    <div className="space-y-4 p-5">
      <div className={`h-20 ${block}`} />
      <div className={`h-24 ${block}`} />
      <div className={`h-32 ${block}`} />
      <div className={`h-28 ${block}`} />
    </div>
  );
}
