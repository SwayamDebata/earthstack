'use client';

import { Caption, Chip, Reveal, SectionHead } from './primitives';

const EVIDENCE: { k: string; v: string; sub?: string }[] = [
  { k: 'Rain 6 h', v: '78 mm' },
  { k: 'p95 baseline', v: '41 mm' },
  { k: 'Antecedent', v: '3 wet d' },
  { k: 'Forecast 24 h', v: '46 mm' },
];

export default function DecisionEngine() {
  return (
    <section className="me-band" style={{ background: 'var(--bg-2)' }}>
      <div className="me-wrap">
        <Reveal>
          <SectionHead index="03" label="Decision engine, not predictor" />
        </Reveal>

        <Reveal>
          <h2 className="me-display me-d2" style={{ maxWidth: '18ch', marginBottom: '1.25rem' }}>
            A forecast is not a decision.
          </h2>
        </Reveal>

        <Reveal delay={70}>
          <p className="me-lede" style={{ marginBottom: '3.25rem' }}>
            Forecasts answer <em>what will happen</em>. A district officer at three in the morning
            needs an answer to <em>what do I do</em>, and needs to defend that answer at nine. Those
            are different products.
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
            alignItems: 'stretch',
          }}
        >
          {/* ---- what a forecast gives you ---- */}
          <Reveal delay={90}>
            <div
              className="me-panel"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'transparent',
                borderStyle: 'dashed',
              }}
            >
              <span className="me-label" style={{ marginBottom: '1.75rem', display: 'block' }}>
                What a forecast gives you
              </span>

              <p
                className="me-num"
                style={{ fontSize: 'clamp(3rem, 6vw, 4.25rem)', color: 'var(--muted)' }}
              >
                62%
              </p>
              <p style={{ margin: '10px 0 2rem', fontSize: 14.5, color: 'var(--muted)' }}>
                probability of flooding, next 24 hours
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  margin: '0 0 auto',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  background: 'var(--line)',
                  border: '1px solid var(--line)',
                }}
              >
                {['Do I evacuate?', 'Which wards?', 'How do I justify it tomorrow?'].map((q) => (
                  <li
                    key={q}
                    style={{
                      background: 'var(--bg-2)',
                      padding: '0.85rem 1rem',
                      fontSize: 14.5,
                      color: 'var(--text)',
                    }}
                  >
                    {q}
                  </li>
                ))}
              </ul>

              <p
                className="me-label"
                style={{
                  marginTop: '1.75rem',
                  lineHeight: 1.7,
                  letterSpacing: '0.12em',
                  color: 'var(--faint)',
                }}
              >
                The officer improvises. The number takes no responsibility.
              </p>
            </div>
          </Reveal>

          {/* ---- what a decision engine gives you ---- */}
          <Reveal delay={140}>
            <div
              className="me-panel"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--surface)',
                borderColor: 'var(--line-2)',
              }}
            >
              <span className="me-label" style={{ marginBottom: '1.75rem', display: 'block' }}>
                What a decision engine gives you
              </span>

              {/* score header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  paddingBottom: '1.1rem',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <Chip kind="live" />
                <span
                  className="me-num"
                  style={{ fontSize: 'clamp(1.9rem, 3vw, 2.4rem)', color: 'var(--laterite)' }}
                >
                  HIGH
                </span>
                <span
                  className="me-mono"
                  style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}
                >
                  rule_score 0.71 · Cuttack · 04:12 IST
                </span>
              </div>

              {/* terms */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: 1,
                  background: 'var(--line)',
                  border: '1px solid var(--line)',
                  marginBlock: '1.1rem',
                }}
              >
                {EVIDENCE.map((e) => (
                  <div key={e.k} style={{ background: 'var(--surface)', padding: '0.8rem 0.85rem' }}>
                    <p className="me-label" style={{ marginBottom: 6 }}>
                      {e.k}
                    </p>
                    <p className="me-num" style={{ fontSize: 19 }}>
                      {e.v}
                    </p>
                  </div>
                ))}
              </div>

              <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {[
                  {
                    t: 'Why this score',
                    d: '78 mm in 6 h against a p95 of 41 mm, on soil already saturated by three wet days. Forecast adds 46 mm in the next 24 h.',
                  },
                  {
                    t: 'Closest past event',
                    d: 'Nearest match in 653 labelled historical events, and what happened in the 48 hours after it. Officers reason by precedent, not probability.',
                  },
                  {
                    t: 'Suggested action',
                    d: 'Pre-position at Naraj. Alert wards 4 to 9. One line, not a plan.',
                  },
                  {
                    t: 'What we could not see',
                    d: 'No live gauge on this reach, so this read is rainfall-only and the score is capped accordingly. The absence is stated, not smoothed over.',
                  },
                ].map((row) => (
                  <div key={row.t}>
                    <dt
                      className="me-mono"
                      style={{
                        fontSize: 10.5,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'var(--laterite)',
                        marginBottom: 5,
                      }}
                    >
                      {row.t}
                    </dt>
                    <dd
                      style={{
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: 'var(--text)',
                      }}
                    >
                      {row.d}
                    </dd>
                  </div>
                ))}
              </dl>

              <p
                className="me-label"
                style={{
                  marginTop: '1.75rem',
                  lineHeight: 1.7,
                  letterSpacing: '0.12em',
                  color: 'var(--faint)',
                }}
              >
                Every field is something the engine already computed. None of it needs a bigger
                model.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <Caption>
            Interface mockup with sample values. The layout is the product; the numbers here are
            illustrative. Advisory only - does not override IMD, CWC or OSDMA.
          </Caption>
        </Reveal>
      </div>
    </section>
  );
}
