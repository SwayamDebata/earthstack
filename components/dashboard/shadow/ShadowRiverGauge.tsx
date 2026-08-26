'use client';

import type { ShadowRiverGauge as Gauge } from '@/lib/api/schemas';
import { fmtMetres, fmtSignedMetres } from '@/lib/api/risk-status';
import type { UiMode } from '@/lib/access/ui-mode';

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return null;
}

function trendArrow(trend: string | null | undefined): string {
  const t = String(trend ?? '').toLowerCase();
  if (t === 'rising') return '↑';
  if (t === 'falling') return '↓';
  if (t === 'steady') return '→';
  return '·';
}

/**
 * DoWR bulletin gauge row - strong visual when above danger, never an alert affordance.
 * Null danger/warning render as -, never 0.
 */
export default function ShadowRiverGauge({
  gauge,
  mode = 'command',
}: {
  gauge: Gauge;
  mode?: UiMode;
}) {
  const std = mode === 'standard';
  const present = num(gauge.present_level_m);
  const danger = num(gauge.danger_level_m);
  const warning = num(gauge.warning_level_m);
  const hfl = num(gauge.highest_recorded_m);
  const wrt = num(gauge.metres_wrt_danger);
  const above = Boolean(gauge.above_danger);

  const scaleMax = Math.max(
    hfl ?? 0,
    danger ?? 0,
    warning ?? 0,
    present ?? 0,
    1,
  );
  const presentPct =
    present !== null && scaleMax > 0 ? Math.max(0, Math.min(100, (present / scaleMax) * 100)) : null;
  const dangerPct = danger !== null && scaleMax > 0 ? (danger / scaleMax) * 100 : null;
  const warningPct = warning !== null && scaleMax > 0 ? (warning / scaleMax) * 100 : null;

  const shell = above
    ? std
      ? 'rounded-lg border border-orange-300 bg-orange-50/80 p-3'
      : 'rounded-md border border-orange-400/35 bg-orange-500/10 p-3'
    : std
      ? 'rounded-lg border border-slate-200 bg-white p-3'
      : 'rounded-md border border-white/10 bg-white/[0.03] p-3';

  return (
    <div className={shell}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>
            {gauge.site ?? 'Gauge'}
            {gauge.river ? (
              <span className={`font-normal ${std ? 'text-slate-500' : 'text-slate-400'}`}> · {gauge.river}</span>
            ) : null}
          </p>
          <p className={`mt-0.5 text-xs ${std ? 'text-slate-500' : 'text-slate-500'}`}>
            {gauge.observed_time ? `Observed ${gauge.observed_time}` : 'Observed time n/a'}
            {hfl !== null ? ` · HFL ${fmtMetres(hfl)}${gauge.highest_recorded_date ? ` (${gauge.highest_recorded_date})` : ''}` : ''}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold tabular-nums ${std ? 'text-slate-900' : 'text-white'}`}>
            {fmtMetres(present)}
          </p>
          <p className={`text-xs tabular-nums ${above ? (std ? 'text-orange-800' : 'text-orange-200') : std ? 'text-slate-500' : 'text-slate-400'}`}>
            {trendArrow(gauge.trend)} {String(gauge.trend ?? 'n/a')} · wrt danger {fmtSignedMetres(wrt)}
          </p>
        </div>
      </div>

      <div className={`relative mt-3 h-2.5 w-full overflow-hidden rounded-full ${std ? 'bg-slate-200' : 'bg-white/10'}`}>
        {presentPct !== null ? (
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${presentPct}%`,
              background: above ? '#ea580c' : std ? '#0284c7' : '#38bdf8',
            }}
          />
        ) : null}
        {warningPct !== null ? (
          <span
            className="absolute top-0 h-full w-0.5 bg-amber-500"
            style={{ left: `${Math.min(99, warningPct)}%` }}
            title={`Warning ${fmtMetres(warning)}`}
          />
        ) : null}
        {dangerPct !== null ? (
          <span
            className="absolute top-0 h-full w-0.5 bg-red-600"
            style={{ left: `${Math.min(99, dangerPct)}%` }}
            title={`Danger ${fmtMetres(danger)}`}
          />
        ) : null}
      </div>

      <div className={`mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] tabular-nums ${std ? 'text-slate-500' : 'text-slate-500'}`}>
        <span>Warn {fmtMetres(warning)}</span>
        <span>Danger {fmtMetres(danger)}</span>
        {above ? (
          <span className={std ? 'font-semibold text-orange-800' : 'font-semibold text-orange-200'}>
            Above danger
          </span>
        ) : null}
      </div>
    </div>
  );
}
