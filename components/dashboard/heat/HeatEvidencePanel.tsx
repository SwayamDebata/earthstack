'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/client';
import { isProductHeatCity, STALE_THRESHOLDS_MS } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';
import ShadowBadge from '@/components/dashboard/heat/ShadowBadge';
import { confidencePct, severityChipClass } from '@/lib/ui/severity';
import { relTime } from '@/components/dashboard/util';
import type { HeatWhy } from '@/lib/api/schemas';

function numOf(rec: Record<string, unknown>, key: string): number | null {
  const v = rec[key];
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmtC(n: number | null): string {
  return n === null ? 'n/a' : `${Math.round(n * 10) / 10} C`;
}

function heatReadingIsStale(ts: string | undefined, nowMs: number): boolean {
  if (!ts) return false;
  const t = new Date(ts).getTime();
  if (!Number.isFinite(t)) return false;
  return nowMs - t > STALE_THRESHOLDS_MS.heat;
}

function HeatWhyBars({ why, std }: { why: HeatWhy[]; std: boolean }) {
  const rows = (why ?? []).filter((w) => w && (w.label || w.id) && typeof w.value === 'number');
  if (rows.length === 0) {
    return <p className={std ? 'text-sm text-slate-500' : 'text-sm text-slate-500'}>No driver breakdown available</p>;
  }
  return (
    <ul className="space-y-2.5">
      {rows.map((w) => {
        const v = Math.max(0, Math.min(1, Number(w.value ?? 0)));
        const pct = Math.round(v * 100);
        return (
          <li key={w.id ?? w.label}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className={std ? 'text-slate-700' : 'text-slate-300'}>{w.label ?? w.id}</span>
              <span className={`tabular-nums font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>{v.toFixed(2)}</span>
            </div>
            <div className={`h-2 w-full overflow-hidden rounded-full ${std ? 'bg-slate-200' : 'bg-white/10'}`}>
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * City heat evidence body for Heat Ops (/dashboard/heat).
 * Display-only. Does not compute scores. SHADOW badge always visible.
 */
export default function HeatEvidencePanel({ location }: { location: string }) {
  const { uiMode } = useMission();
  const std = uiMode === 'standard';
  const allowed = isProductHeatCity(location);
  const [nowMs] = useState(() => Date.now());

  const q = useQuery({
    queryKey: ['heat', location],
    queryFn: ({ signal }) => api.heatCity(location, signal),
    enabled: allowed,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const label = std
    ? 'text-[11px] font-semibold uppercase tracking-wide text-slate-500'
    : 'font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500';

  if (!allowed) {
    return (
      <div className="p-5">
        <p className={std ? 'text-sm text-slate-600' : 'text-sm text-slate-400'}>
          Heat scores are only available for the five Odisha pilot cities.
        </p>
      </div>
    );
  }

  if (q.isLoading) {
    const block = std ? 'animate-pulse rounded-lg border border-slate-200 bg-slate-100' : 'animate-pulse rounded-md border border-white/5 bg-white/5';
    return (
      <div className="space-y-3 p-5">
        <div className={`h-16 ${block}`} />
        <div className={`h-24 ${block}`} />
        <div className={`h-28 ${block}`} />
      </div>
    );
  }

  if (q.isError || q.data?.ok === false) {
    const is404 = q.error instanceof ApiError && q.error.status === 404;
    return (
      <div className="p-5">
        <ShadowBadge mode={uiMode} />
        <p className={`mt-3 text-sm font-semibold ${std ? 'text-slate-800' : 'text-slate-200'}`}>
          {is404 ? 'Heat score unavailable for this location' : 'Heat score unavailable'}
        </p>
        <p className={`mt-1 text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
          {q.data?.error || (q.error instanceof Error ? q.error.message : 'Try again or pick another city.')}
        </p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className={
            std
              ? 'mt-3 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
              : 'mt-3 rounded-sm border border-cyan-400/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/10'
          }
        >
          Retry
        </button>
      </div>
    );
  }

  const d = q.data!;
  const features = (d.features ?? {}) as Record<string, unknown>;
  const components = (d.components ?? {}) as Record<string, unknown>;
  const conf = confidencePct(d.confidence);
  const consecutive = numOf(components, 'consecutive_qualifying_days') ?? 0;
  const tmax = numOf(features, 'tmax_c');
  const feels = numOf(features, 'heat_index_c');
  const normal = numOf(features, 'tmax_normal_c');
  const rh = numOf(features, 'rh_midday_pct');
  const baseline = typeof features.baseline_source === 'string' ? features.baseline_source : 'n/a';
  const ts = d.timestamp;
  const stale = heatReadingIsStale(ts, nowMs);

  const cell = std ? 'rounded-lg border border-slate-200 bg-slate-50 p-3' : 'rounded-md border border-white/10 bg-white/5 p-3';

  return (
    <div className="space-y-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={severityChipClass(d.severity, uiMode)}>{d.severity ?? 'n/a'}</span>
            <span className={`text-2xl font-semibold tabular-nums ${std ? 'text-slate-900' : 'text-white'}`}>
              {typeof d.heat_score === 'number' ? d.heat_score.toFixed(2) : 'n/a'}
            </span>
          </div>
          <p className={`mt-1 text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
            Shadow heat decision layer · {d.location ?? location}
          </p>
        </div>
        <ShadowBadge mode={uiMode} />
      </div>

      {stale ? (
        <p className={std ? 'text-xs font-medium text-amber-800' : 'text-xs text-amber-300'}>
          Stale reading (older than 36h). Pipeline runs twice daily.
        </p>
      ) : null}

      <div className={`${cell} text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>
        <span className="font-medium">Tmax {fmtC(tmax)}</span>
        <span className="mx-2 text-slate-500">·</span>
        <span>Feels like {fmtC(feels)}</span>
        <span className="mx-2 text-slate-500">·</span>
        <span>vs normal {fmtC(normal)}</span>
        <span className="mx-2 text-slate-500">·</span>
        <span>RH {rh === null ? 'n/a' : `${Math.round(rh)}%`}</span>
      </div>

      <section>
        <h3 className={`mb-2 text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>Why this score?</h3>
        <HeatWhyBars why={d.why ?? []} std={std} />
      </section>

      {consecutive > 0 ? (
        <p className={`text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>
          Persistence: <span className="font-semibold tabular-nums">{consecutive}</span> qualifying day
          {consecutive === 1 ? '' : 's'}
        </p>
      ) : null}

      <section>
        <p className={label}>Evidence quality</p>
        <p className={`mt-1 text-xl font-semibold tabular-nums ${std ? 'text-slate-900' : 'text-white'}`}>
          {conf !== null ? `${conf}%` : 'n/a'}
        </p>
        <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${std ? 'bg-slate-200' : 'bg-white/10'}`}>
          <div className="h-full rounded-full bg-amber-500" style={{ width: `${conf ?? 0}%` }} />
        </div>
        <p className={`mt-1 text-xs ${std ? 'text-slate-500' : 'text-slate-500'}`}>
          Evidence quality, not probability of a heatwave
        </p>
        {(d.confidence_factors ?? []).length > 0 ? (
          <ul className={`mt-2 space-y-0.5 text-xs ${std ? 'text-slate-500' : 'text-slate-400'}`}>
            {d.confidence_factors!.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {(d.suggested_actions ?? []).length > 0 ? (
        <section className={std ? 'rounded-lg border border-amber-200 bg-amber-50 p-4' : 'rounded-md border border-amber-400/25 bg-amber-500/10 p-4'}>
          <h3 className={`mb-2 text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>Suggested actions</h3>
          <ol className="space-y-2">
            {d.suggested_actions!.map((a, i) => (
              <li key={a} className={`flex gap-2 text-sm ${std ? 'text-slate-800' : 'text-slate-200'}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${std ? 'bg-amber-700 text-white' : 'bg-amber-500/80 text-white'}`}>
                  {i + 1}
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {d.similar_event ? (
        <section className={cell}>
          <p className={label}>Similar event</p>
          <p className={`mt-1 text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>{String(d.similar_event)}</p>
        </section>
      ) : null}

      <p className={`text-xs ${std ? 'text-slate-500' : 'text-slate-500'}`}>
        Updated {relTime(ts)} · engine {d.engine_version ?? 'heat_v1'} · baseline {baseline}
      </p>
    </div>
  );
}
