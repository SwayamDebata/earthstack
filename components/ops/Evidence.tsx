import { drivenBy, sourceName } from '@/lib/ops/language';
import { fmtRiverRatio } from '@/lib/api/risk-status';

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}

export default function Evidence({ raw }: { raw: Record<string, unknown> }) {
  const riverStatus = String(raw.river_status ?? '').toLowerCase();
  const riverLive = riverStatus === 'live';
  const riverRatio = num(raw.river_ratio);
  const ceiling = num(raw.max_achievable_score);
  const missing = Array.isArray(raw.missing_inputs) ? (raw.missing_inputs as unknown[]) : [];
  const past = num(raw.rainfall_past_24h);
  const fcst24 = num(raw.rainfall_forecast_24h);
  const fcst48 = num(raw.rainfall_forecast_48h);
  const p95 = num(raw.historical_p95_rain);
  const avg = num(raw.historical_avg_rain);
  const rainSource = sourceName(str(raw.rainfall_source_used));
  const baselineSource = sourceName(str(raw.historical_baseline_source));
  const loc = str(raw.location) ?? 'this location';
  const station =
    str(raw.river_station_cwc) ?? str(raw.river_station) ?? str(raw.river_station_name);

  const fill =
    riverRatio !== null ? Math.max(0, Math.min(120, riverRatio * 100)) : 0;
  const barColor =
    riverRatio !== null && riverRatio >= 1
      ? 'var(--imd-red)'
      : riverRatio !== null && riverRatio >= 0.9
        ? 'var(--imd-orange)'
        : 'var(--imd-green)';

  let riverCopy: string;
  if (riverStatus === 'stale') {
    riverCopy = station
      ? `The ${station} gauge reading is out of date, so it was not used in this score.`
      : 'The gauge reading is out of date, so it was not used in this score.';
  } else if (station) {
    riverCopy = `The ${station} river station is mapped, but it is not reporting live, so it was not used. This score is rainfall only.`;
  } else {
    riverCopy =
      'No live river reading is on the score path for this location. This score is rainfall only.';
  }

  return (
    <div className="ops-stack" style={{ gap: 16 }}>
      <p style={{ margin: 0, fontWeight: 650 }}>{drivenBy(str(raw.signal_source))}</p>

      <div>
        <h3 className="ops-h2">Rainfall</h3>
        <dl className="ops-dl">
          <div>
            <dt>Last 24 hours</dt>
            <dd>{past !== null ? `${past.toFixed(1)} mm` : 'not recorded'}</dd>
          </div>
          <div>
            <dt>Next 24 hours</dt>
            <dd>{fcst24 !== null ? `${fcst24.toFixed(1)} mm` : 'not recorded'}</dd>
          </div>
          <div>
            <dt>Next 48 hours</dt>
            <dd>{fcst48 !== null ? `${fcst48.toFixed(1)} mm` : 'not recorded'}</dd>
          </div>
          <div style={{ borderTop: '1px solid var(--ops-line)', paddingTop: 6 }}>
            <dt>Heavy rain for {loc} starts near</dt>
            <dd>{p95 !== null ? `${p95.toFixed(1)} mm` : 'not recorded'}</dd>
          </div>
          {avg !== null ? (
            <div>
              <dt>A normal wet day here</dt>
              <dd>{avg.toFixed(1)} mm</dd>
            </div>
          ) : null}
        </dl>
        {rainSource || baselineSource ? (
          <p className="ops-lede">
            {rainSource ? `Rainfall from ${rainSource}. ` : ''}
            {baselineSource ? `Heavy-rain level from ${baselineSource}, not a state average.` : ''}
          </p>
        ) : null}
      </div>

      <div>
        <h3 className="ops-h2">River</h3>
        {riverLive && riverRatio !== null ? (
          <>
            <div className="ops-bar" aria-hidden>
              <i style={{ width: `${Math.min(100, fill)}%`, background: barColor }} />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 14 }}>
              {station ? `${station}: ` : ''}
              {fmtRiverRatio(riverRatio)}.
            </p>
          </>
        ) : (
          <p className="ops-lede" style={{ marginTop: 0 }}>
            {riverCopy} The engine will use the river the moment a live reading returns. Without
            it, Red is unreachable: rainfall alone tops out at 0.665.
          </p>
        )}
      </div>

      {(ceiling !== null && ceiling < 1) || missing.length > 0 ? (
        <div className="ops-warn">
          <p style={{ fontWeight: 650, margin: 0 }}>This score could not use everything.</p>
          {ceiling !== null && ceiling < 1 ? (
            <p style={{ margin: '6px 0 0' }}>
              Highest it could have reached with the inputs available:{' '}
              <span className="ops-mono">{ceiling.toFixed(3)}</span> of 1.000. It has not been scaled
              up to hide that.
            </p>
          ) : null}
          {missing.length > 0 ? (
            <p style={{ margin: '6px 0 0' }}>Missing: {missing.map((m) => String(m)).join(', ')}.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

