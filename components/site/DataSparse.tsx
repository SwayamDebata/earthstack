'use client';

import { Caption, Chip, Reveal, SectionHead } from './primitives';
import { Num } from './scroll';
import { DiagramPanel } from './HeroScene';

const MEASURED = [
  {
    value: '0 / 12',
    title: 'CWC river stations that were decision-grade on day one',
    body: 'Feeds stalled 84 days, five sensors flatlined, one reading minus 834 m.',
  },
  {
    value: '34.6%',
    title: 'of readings at Kishan Nagar outside physical range',
    body: 'A platform that trusts the feed wholesale would have alerted on noise.',
  },
  {
    value: '3',
    title: 'conflicting danger-level tables for the same gauge',
    body: "DoWR's real danger level for Akhuapada is 18.33 m; INDOFLOODS lists 17.83, which is actually the warning level.",
  },
  {
    value: '0 mm',
    title: 'what the IMD daily grid can read on a peak event day',
    body: 'While OpenWeather reports localised Odisha rain falling hard. No single feed is safe alone.',
  },
];

/* Four traces that all arrive as valid rows with valid timestamps.
   Only the last one is a river rising. */
const TRACES: { label: string; note: string; pts: number[]; real: boolean }[] = [
  {
    label: 'FLATLINE',
    note: 'sensor stuck, months of identical values',
    pts: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    real: false,
  },
  {
    label: 'STALL',
    note: 'feed frozen 84 days, last good value repeats',
    pts: [0.28, 0.34, 0.42, 0.47, 0.52, 0.52, 0.52, 0.52, 0.52, 0.52, 0.52, 0.52],
    real: false,
  },
  {
    label: 'IMPOSSIBLE',
    note: 'spike to 1133 m, and minus 834 m at Jenapur',
    pts: [0.4, 0.42, 0.38, 0.41, 0.99, 0.4, 0.39, 0.02, 0.41, 0.4, 0.43, 0.4],
    real: false,
  },
  {
    label: 'A RIVER RISING',
    note: 'Akhuapada 18.45 m against a danger level of 18.33',
    pts: [0.22, 0.24, 0.27, 0.33, 0.41, 0.52, 0.63, 0.74, 0.85, 0.9, 0.86, 0.79],
    real: true,
  },
];

function Trace({ pts, real }: { pts: number[]; real: boolean }) {
  const W = 260;
  const H = 74;
  const step = W / (pts.length - 1);
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(H - p * H * 0.86 - 6).toFixed(1)}`)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-hidden="true"
    >
      {/* danger level reference, only meaningful on the real trace */}
      <line
        x1="0"
        y1={H - 0.8 * H * 0.86 - 6}
        x2={W}
        y2={H - 0.8 * H * 0.86 - 6}
        stroke={real ? 'var(--laterite)' : 'var(--line)'}
        strokeWidth="1"
        strokeDasharray="3 4"
        opacity={real ? 0.8 : 0.5}
      />
      <path
        d={d}
        fill="none"
        stroke={real ? 'var(--water)' : 'var(--muted)'}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DataSparse() {
  return (
    <section className="me-band" style={{ background: 'var(--bg)' }}>
      <div className="me-wrap">
        <Reveal>
          <SectionHead index="02" label="What data-sparse actually means" />
        </Reveal>

        <Reveal>
          <h2 className="me-display me-d2" style={{ maxWidth: '20ch', marginBottom: '1.25rem' }}>
            We measured it. It is worse than the brochures suggest.
          </h2>
        </Reveal>

        <Reveal delay={70}>
          <p className="me-lede" style={{ marginBottom: '3rem' }}>
            These are not estimates. Each one is a number we hit while building, on real Odisha
            feeds, and each one is a reason a platform designed for Rotterdam does not transfer.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div
            className="me-hairgrid"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
          >
            {MEASURED.map((m) => (
              <div key={m.value}>
                <p
                  className="me-num"
                  style={{
                    fontSize: 'clamp(1.9rem, 3vw, 2.5rem)',
                    color: 'var(--laterite)',
                    marginBottom: 14,
                  }}
                >
                  <Num value={m.value} />
                </p>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontSize: 14.5,
                    lineHeight: 1.45,
                    fontWeight: 500,
                    color: 'var(--ink)',
                  }}
                >
                  {m.title}
                </p>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--muted)' }}>
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ---- the four failure modes ---- */}
        <Reveal delay={120}>
          <figure style={{ margin: '4.5rem 0 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 20,
                flexWrap: 'wrap',
                marginBottom: '1.25rem',
              }}
            >
              <h3 className="me-h" style={{ fontSize: 'clamp(1.15rem, 1.8vw, 1.45rem)' }}>
                Three of these four look like data.
              </h3>
              <span className="me-label">Raw gauge feed · before validation</span>
            </div>

            <div
              className="me-hairgrid"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
            >
              {TRACES.map((t) => (
                <div key={t.label}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    <span
                      className="me-mono"
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.14em',
                        color: t.real ? 'var(--water)' : 'var(--faint)',
                      }}
                    >
                      {t.label}
                    </span>
                    {t.real && <Chip kind="live">counts</Chip>}
                  </div>
                  <Trace pts={t.pts} real={t.real} />
                  <p
                    style={{
                      margin: '12px 0 0',
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      color: 'var(--muted)',
                    }}
                  >
                    {t.note}
                  </p>
                </div>
              ))}
            </div>

            <Caption>
              A flatline, a stall and an impossible spike all arrive as valid rows with valid
              timestamps. Only the fourth is a river rising.
            </Caption>

            <div style={{ marginTop: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              <DiagramPanel
                scene="thesisFailureModes"
              />
            </div>
          </figure>
        </Reveal>

        <Reveal delay={140}>
          <div
            className="me-panel"
            style={{
              marginTop: '2.5rem',
              borderLeft: '2px solid var(--laterite)',
              maxWidth: '82ch',
            }}
          >
            <p className="me-body" style={{ maxWidth: 'none' }}>
              That is why river level is <em>gated</em>: a station only reaches the risk path when it
              is marked{' '}
              <code
                className="me-mono"
                style={{
                  fontSize: '0.9em',
                  padding: '0.15em 0.4em',
                  background: 'var(--surface-2)',
                  color: 'var(--ink)',
                }}
              >
                status == live
              </code>
              . Otherwise the briefing says the read is rainfall-only, out loud. The moat is not a
              model - it is the accumulated knowledge of which feed lies, and when.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
