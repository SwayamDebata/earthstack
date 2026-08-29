'use client';

import { Chip } from './primitives';
import { CountUp, ScrollStory } from './scroll';

/* The relabel audit, told as a pinned scene rather than a paragraph. Four
   beats: the number we published, the check, what the check found, and what we
   did about it. Every figure here is from the audit doc. */

const BASINS = [
  { name: 'Baitarani', n: 79, note: 'Anandapur, 86.8 km from Cuttack' },
  { name: 'Rushikulya', n: 34, note: 'Purushottampur, 104.6 km, in Ganjam' },
  { name: 'Brahmani', n: 29, note: 'Jenapur, 49.4 km' },
  { name: 'Mahanadi', n: 1, note: 'Naraj. The only one on the river we claimed.' },
];

function Beat({
  index,
  kicker,
  children,
}: {
  index: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: 940 }}>
      <p className="me-eyebrow" style={{ marginBottom: 18 }}>
        {index} · {kicker}
      </p>
      {children}
    </div>
  );
}

export default function AuditStory() {
  const beats = [
    <Beat key="1" index="01" kicker="What we published">
      <p className="me-display me-d2" style={{ marginBottom: 24, maxWidth: '18ch' }}>
        For months, our best number was{' '}
        <span style={{ color: 'var(--laterite)' }}>
          <CountUp to={99.3} decimals={1} suffix="%" />
        </span>
      </p>
      <p className="me-lede">
        Detection rate on 143 validated flood positives, drawn from the INDOFLOODS labelled event
        record. It led every deck and sat at the top of this site.
      </p>
    </Beat>,

    <Beat key="2" index="02" kicker="Then we checked the labels">
      <p className="me-display me-d2" style={{ marginBottom: 24, maxWidth: '20ch' }}>
        Our labeller snapped each gauge to the nearest pilot city within 120 km.
      </p>
      <p className="me-lede">
        In Odisha that radius crosses whole basins. So we went back and asked a duller question:
        for each of those 143 events, which river was it actually on?
      </p>
    </Beat>,

    <Beat key="3" index="03" kicker="What the check found">
      <p className="me-display me-d3" style={{ marginBottom: 28, maxWidth: '24ch' }}>
        Where our 143 validated positives actually came from
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxWidth: 620 }}>
        {BASINS.map((b) => {
          const isM = b.name === 'Mahanadi';
          return (
            <div key={b.name}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: isM ? 600 : 400,
                    color: isM ? 'var(--laterite)' : 'var(--ink)',
                  }}
                >
                  {b.name}
                </span>
                <span
                  className="me-num"
                  style={{ fontSize: 17, color: isM ? 'var(--laterite)' : 'var(--ink)' }}
                >
                  <CountUp to={b.n} />
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-2)' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max((b.n / 79) * 100, 1.2)}%`,
                    background: isM ? 'var(--laterite)' : 'var(--steel)',
                    transition: 'width 1.1s cubic-bezier(.22,1,.36,1)',
                  }}
                />
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 12.5, color: 'var(--muted)' }}>{b.note}</p>
            </div>
          );
        })}
      </div>
      <p className="me-lede" style={{ marginTop: 26 }}>
        One of 143 was Mahanadi. The engine had been scored on the wrong rivers.
      </p>
    </Beat>,

    <Beat key="4" index="04" kicker="What we did about it">
      <p className="me-display me-d2" style={{ marginBottom: 24, maxWidth: '20ch' }}>
        We retired the number and published the audit.
      </p>
      <p className="me-lede" style={{ marginBottom: 28 }}>
        The replacement, measured on correctly labelled events, is{' '}
        <strong style={{ color: 'var(--ink)' }}>
          <CountUp to={95.1} decimals={1} suffix="%" />
        </strong>{' '}
        across all 143, and{' '}
        <strong style={{ color: 'var(--ink)' }}>
          <CountUp to={94.4} decimals={1} suffix="%" />
        </strong>{' '}
        on north Odisha onsets. It was mislabelled, not fabricated, but it was wrong.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Chip kind="backtest" />
        <Chip kind="miss">Retired</Chip>
      </div>
    </Beat>,
  ];

  return <ScrollStory beats={beats} height="420vh" background="var(--bg-2)" />;
}
