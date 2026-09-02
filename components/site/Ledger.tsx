'use client';

import { Chip, Reveal, type ChipKind } from './primitives';
import { Num } from './scroll';

const ROWS: {
  value: string;
  unit?: string;
  caption: string;
  kind: ChipKind;
}[] = [
  {
    value: '5',
    caption: 'cities alerting: Bhubaneswar, Cuttack, Puri, Sambalpur, Rourkela',
    kind: 'live',
  },
  {
    value: '30',
    unit: 'min',
    caption: 'scoring cycle, every day of the year, wet or dry',
    kind: 'live',
  },
  {
    value: '48',
    unit: 'h',
    caption: 'lead on all six onsets in the August 2026 north Odisha replay',
    kind: 'backtest',
  },
  {
    value: '14/18',
    caption: 'location-days scored LOW while people were still displaced',
    kind: 'miss',
  },
];

export default function Ledger() {
  return (
    <section
      aria-label="Current position"
      style={{ background: 'var(--bg)', paddingBlock: 'clamp(3rem, 6vw, 4.5rem)' }}
    >
      <div className="me-wrap">
        <Reveal>
          <p
            className="me-label"
            style={{ marginBottom: '1.5rem', color: 'var(--muted)', letterSpacing: '0.18em' }}
          >
            The position, August 2026 - stated the way we would want it stated back to us
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div
            className="me-hairgrid"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}
          >
            {ROWS.map((r) => (
              <div key={r.caption} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <Num
                    value={r.value}
                    className="me-num"
                    style={{ fontSize: 'clamp(2.2rem, 3.6vw, 2.9rem)' }}
                  />
                  {r.unit && (
                    <span
                      className="me-mono"
                      style={{ fontSize: 13, color: 'var(--muted)' }}
                    >
                      {r.unit}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    color: 'var(--muted)',
                    flex: 1,
                  }}
                >
                  {r.caption}
                </p>
                <div>
                  <Chip kind={r.kind} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={140}>
          <p
            className="me-label"
            style={{
              marginTop: '1.25rem',
              lineHeight: 1.8,
              letterSpacing: '0.1em',
              maxWidth: '86ch',
            }}
          >
            The ML model runs beside the engine in shadow and cannot alter a user-facing score. Heat
            has no live mode in the code at all. There is no signed MoU and no paying customer.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
