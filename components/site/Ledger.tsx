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
    value: '497',
    caption:
      "daily flood bulletins archived, 2023 to 2026. The label is Odisha's own published gauge record: did the river cross its danger mark. Not our judgement, not an academic dataset.",
    kind: 'backtest',
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
  {
    value: '26/106',
    caption:
      'of our own flood labels were fabricated by a parser bug. Some bulletins print the time as 1200 rather than 12:00, and we read it as a water level: 1200 m against an 8 m danger mark. We found it, fixed it, and re-ran everything.',
    kind: 'miss',
  },
];

/* ==========================================================================
   The lead evidence (D032/D033).

   The basin claim and the statewide claim are one component on purpose. A
   13-of-13 result is only honest next to the roughly 14-false-alarms-per-flood
   statewide figure, and the API payload is built so you cannot fetch one
   without the other. Keeping them in a single block means nobody can later
   ship the good half by deleting a sibling.

   Three rules the copy below keeps:
     - n = 13 is always printed. A 13/13 result carries a 95% lower bound
       near 77% recall.
     - it is never rendered as a percentage or as "100% accurate".
     - it never appears without the statewide figure.
   ========================================================================== */

function LeadEvidence() {
  return (
    <Reveal delay={40}>
      <div
        className="me-panel"
        style={{
          borderLeft: '2px solid var(--laterite)',
          marginBottom: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          display: 'grid',
          gap: 'clamp(1.25rem, 3vw, 2.25rem)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        <div>
          <div style={{ marginBottom: 12 }}>
            <Chip kind="backtest" />
          </div>
          <p
            className="me-display"
            style={{
              margin: '0 0 0.75rem',
              fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
            }}
          >
            13 of 13 floods flagged two days before the river crossed its danger level.
          </p>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: 'var(--muted)' }}>
            Baitarani, 2024 to 2026, scored on the forecast as it was issued, against Odisha&rsquo;s own
            published gauge record. <strong style={{ color: 'var(--text)' }}>n = 13.</strong> Thirteen
            floods is a small sample: the 95% lower bound sits near 77% recall, so this is not a
            claim of perfect accuracy and we do not state it as a percentage. The Baitarani gauges
            are shadow, not among the five cities that alert, so this is a measurement of the engine
            and not a description of the running product.
          </p>
        </div>

        <div>
          <div style={{ marginBottom: 12 }}>
            <Chip kind="backtest" />
          </div>
          <p
            className="me-display"
            style={{
              margin: '0 0 0.75rem',
              fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
            }}
          >
            Across all 13 gauges: 51% of floods caught, at 6.6% precision.
          </p>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: 'var(--muted)' }}>
            Roughly fourteen false alarms for every true flood. Rainfall alone is not a statewide
            alerting product. It works on the Baitarani, a slow-response basin where two days of
            forecast rain actually reaches the gauge. It does not work everywhere, and the average
            hides both facts. This is why the number beside it is believable.
          </p>
        </div>
      </div>
    </Reveal>
  );
}

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
            The position, September 2026 - stated the way we would want it stated back to us
          </p>
        </Reveal>

        <LeadEvidence />

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
