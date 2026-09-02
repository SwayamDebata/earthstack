'use client';

import { Caption, Chip, Reveal, SectionHead, type ChipKind } from './primitives';

/* Where the 143 "validated positives" actually came from, after the relabel. */
const BASINS: { name: string; n: number; note: string }[] = [
  { name: 'Baitarani', n: 79, note: 'Anandapur, 86.8 km from Cuttack' },
  { name: 'Rushikulya', n: 34, note: 'Purushottampur, 104.6 km, in Ganjam' },
  { name: 'Brahmani', n: 29, note: 'Jenapur, 49.4 km' },
  { name: 'Mahanadi', n: 1, note: 'Naraj - one event, out of 143' },
];

const SURVIVED: [string, string][] = [
  ['94.4%', 'north Odisha onsets, 102 of 108'],
  ['95.1%', 'across all 143 events'],
  ['97.5%', 'Baitarani'],
  ['86.2%', 'Brahmani'],
];

const OPEN: { title: string; body: string; kind: ChipKind }[] = [
  {
    title: 'The trust gate is not passed',
    body: 'Fourteen consecutive dry days with zero false HIGH. Minimum streak is currently zero, blocked on Sambalpur and Rourkela. And the gate as written tests only dry days - the one case the engine never fails. It needs rewriting.',
    kind: 'open',
  },
  {
    title: 'Precision is unmeasurable until rivers land',
    body: 'We cannot separate "the engine over-fires" from "the flood record is incomplete" without river level as a feature or a label. Real telemetry is now in production, so this becomes answerable this season.',
    kind: 'open',
  },
  {
    title: 'The ML model has never driven an alert',
    body: 'XGBoost v2 runs on every cycle and is logged. Offline it reads 91% leave-one-region-out and 96% event holdout. It stays in shadow until monsoon validation - offline metrics are not permission to go live.',
    kind: 'shadow',
  },
  {
    title: 'Heat has a dataset, not a model',
    body: 'About 82k leakage-audited rows under ml/heatwave/, of which roughly 23.7k are forecast-backed. No model has been trained. HeatBench v0 exists; the IMD grid cross-check sits at roughly 62% within 1.5 degrees of ERA5.',
    kind: 'shadow',
  },
];

const LEGEND: { kind: ChipKind; meaning: string }[] = [
  { kind: 'live', meaning: 'In production, driving user-facing alerts.' },
  { kind: 'backtest', meaning: 'Measured on history. Never quoted as live accuracy.' },
  { kind: 'shadow', meaning: 'Computed and published, structurally unable to alert.' },
  { kind: 'miss', meaning: 'The engine was wrong, and here is the write-up.' },
  { kind: 'open', meaning: 'A known gap we have not closed.' },
];

function BasinBars() {
  const max = Math.max(...BASINS.map((b) => b.n));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {BASINS.map((b) => {
        const isMahanadi = b.name === 'Mahanadi';
        return (
          <div key={b.name}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 7,
              }}
            >
              <span
                style={{
                  fontSize: 14.5,
                  fontWeight: isMahanadi ? 600 : 400,
                  color: isMahanadi ? 'var(--accent)' : 'var(--ink)',
                }}
              >
                {b.name}
              </span>
              <span
                className="me-num"
                style={{ fontSize: 16, color: isMahanadi ? 'var(--accent)' : 'var(--ink)' }}
              >
                {b.n}
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--surface-2)' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.max((b.n / max) * 100, 1.2)}%`,
                  background: isMahanadi ? 'var(--accent)' : 'var(--steel)',
                }}
              />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--muted)' }}>{b.note}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function Evidence() {
  return (
    <section id="evidence" className="me-band" style={{ background: 'var(--bg-2)' }}>
      <div className="me-wrap">
        <Reveal>
          <SectionHead index="05" label="The audit that cost us our best number" />
        </Reveal>

        {/* ---- the audit ---- */}
        <Reveal delay={100}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'clamp(1.5rem, 3vw, 2.5rem)',
              alignItems: 'stretch',
            }}
          >
            <div className="me-panel" style={{ background: 'var(--bg)' }}>
              <div style={{ marginBottom: 18 }}>
                <Chip kind="backtest" />
              </div>
              <h3 className="me-display me-d3" style={{ marginBottom: 14 }}>
                We audited our own 99.3% and it did not survive.
              </h3>
              <p className="me-body" style={{ fontSize: 15, maxWidth: 'none', marginBottom: 14 }}>
                Our event labeller snapped each INDOFLOODS gauge to the nearest pilot city within 120
                km. In Odisha that distance crosses whole basins. The number was{' '}
                <em>mislabelled, not fabricated</em> - but it was wrong, and we retired it from the
                site.
              </p>
              <p className="me-body" style={{ fontSize: 15, maxWidth: 'none' }}>
                We could have quietly fixed it. Instead we published the audit, the replacement
                number, and the precision problem it exposed underneath.
              </p>
            </div>

            <div className="me-panel" style={{ background: 'var(--bg)' }}>
              <p className="me-label" style={{ marginBottom: 18 }}>
                Where our 143 validated positives actually came from
              </p>
              <BasinBars />
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div
            className="me-hairgrid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              marginTop: 'clamp(1.5rem, 3vw, 2.5rem)',
            }}
          >
            {SURVIVED.map(([v, k]) => (
              <div key={k}>
                <p className="me-num" style={{ fontSize: 'clamp(1.7rem, 2.6vw, 2.2rem)' }}>
                  {v}
                </p>
                <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--muted)' }}>{k}</p>
              </div>
            ))}
          </div>
          <Caption>
            What survived the relabel. Rain-only, scored against each gauge’s own ERA5 p95, negatives
            sampled at the same gauge. No leaked river term.
          </Caption>
        </Reveal>

        {/* ---- the finding nobody publishes ---- */}
        <Reveal delay={140}>
          <div
            className="me-panel"
            style={{
              marginTop: 'clamp(3rem, 6vw, 4.5rem)',
              background: 'var(--bg)',
              borderLeft: '2px solid var(--accent)',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Chip kind="miss" />
            </div>
            <h3 className="me-display me-d3" style={{ marginBottom: 16 }}>
              The finding nobody publishes: our precision does not exist.
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'clamp(1.5rem, 3vw, 2.5rem)',
              }}
            >
              <p className="me-body" style={{ fontSize: 15, maxWidth: 'none' }}>
                The old “0% false positive rate” was measured on dry days - the one case a rainfall
                rule separates by construction. On heavy monsoon days at or above the gauge’s own
                p95 with no recorded flood, the engine fires on{' '}
                <strong style={{ color: 'var(--accent)' }}>every single one: 647 of 647</strong>.
                Sweeping 0.5 to 8 times p95, precision never exceeds 24.2% against a 20% base rate.
              </p>
              <p className="me-body" style={{ fontSize: 15, maxWidth: 'none' }}>
                And the reason is interesting. North Odisha flood days have a median of 1.94 times
                p95. Non-flood heavy days have <strong>2.03</strong> - the days without floods had{' '}
                <em>more</em> rain. Either rainfall genuinely cannot discriminate and we need river
                level as a feature, or the flood record is not exhaustive and we need river level as
                a label. Both answers point the same way.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ---- open problems ---- */}
        <Reveal delay={160}>
          <div style={{ marginTop: 'clamp(3rem, 6vw, 4.5rem)' }}>
            <h3 className="me-h" style={{ fontSize: 'clamp(1.15rem, 1.8vw, 1.45rem)', marginBottom: 20 }}>
              What we have not solved, as of August 2026
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid var(--line)' }}>
              {OPEN.map((o) => (
                <li
                  key={o.title}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    gap: '1rem 1.5rem',
                    alignItems: 'start',
                    padding: '1.35rem 0',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: '0 0 7px',
                        fontSize: 15.5,
                        fontWeight: 500,
                        color: 'var(--ink)',
                      }}
                    >
                      {o.title}
                    </p>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.62, color: 'var(--muted)' }}>
                      {o.body}
                    </p>
                  </div>
                  <Chip kind={o.kind} />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* ---- label legend ---- */}
        <Reveal delay={180}>
          <div style={{ marginTop: 'clamp(3rem, 6vw, 4.5rem)' }}>
            <p className="me-label" style={{ marginBottom: 18 }}>
              How to read every number on this site
            </p>
            <div
              className="me-hairgrid"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}
            >
              {LEGEND.map((l) => (
                <div key={l.kind}>
                  <div style={{ marginBottom: 12 }}>
                    <Chip kind={l.kind} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--text)' }}>
                    {l.meaning}
                  </p>
                </div>
              ))}
            </div>
            <Caption>
              If we cannot label it, we do not make the claim.
            </Caption>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
