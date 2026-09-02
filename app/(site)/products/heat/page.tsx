'use client';

import Link from 'next/link';

import DotField from '@/components/site/DotField';
import HeroScene, { SceneHead, DiagramPanel } from '@/components/site/HeroScene';
import { Caption, Chip, Reveal, SectionHead } from '@/components/site/primitives';

const STATS: { v: string; k: string }[] = [
  { v: '11', k: 'locations scored internally: five product cities, western Odisha references, and Ahmedabad, Delhi and Dhaka as portability tests' },
  { v: '5', k: 'surfaced in the product, the same five cities as flood' },
  { v: '0', k: 'alerts sent, ever, because there is no live mode in the v1 config' },
];

const TERMS = [
  ['Departure from local normal', 'the primary term'],
  ['Spell length: consecutive days above threshold', 'the third day fills wards'],
  ['Humidity, where we have it', 'heat index, not dry-bulb'],
];

const FIELD: { n: string; c: string; note: string }[] = [
  { n: 'Bhubaneswar · Cuttack · Puri · Sambalpur · Rourkela', c: '5', note: 'product cities, surfaced' },
  { n: 'Western Odisha references, Titlagarh among them', c: '3', note: 'validation only, 404 on product endpoints by design' },
  { n: 'Ahmedabad', c: '1', note: "the city with India's best-known Heat Action Plan" },
  { n: 'Delhi', c: '1', note: 'portability outside Odisha: dry, continental' },
  { n: 'Dhaka', c: '1', note: 'portability: humid delta, the D014 slot' },
];

export default function HeatPage() {
  return (
    <>
      <HeroScene
        scene="heat"
        dots={{ mode: 'heat', accent: '#F0C98A', max: 1600 }}
        scrim="10,7,3"
        note="Sample values. Advisory only. Does not replace IMD heat warnings."
      >
        <SceneHead
          eyebrow="Product 02"
          kind={'shadow'}
          title="Heat Ops"
          lede="Scored on the same engine as flood, on eleven locations, and structurally unable to send an alert."
        />
      </HeroScene>


      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(2rem, 5vw, 4.5rem)', alignItems: 'start' }}>
            <Reveal>
              <h2 className="me-display me-d2" style={{ maxWidth: '16ch', marginBottom: '1.5rem' }}>
                A flood takes a district. A heatwave takes a demographic.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="me-body" style={{ marginBottom: '1.1rem' }}>
                Heat kills quietly and unevenly: outdoor workers, the elderly, anyone without a fan.
                It leaves no waterline on a wall and no photograph, so it is chronically
                under-counted and chronically under-warned.
              </p>
              <p className="me-body">
                It is also the hazard where a thirty-year baseline matters most, because 42 degrees
                in Titlagarh is a Tuesday and 38 in Puri is an emergency.
              </p>
            </Reveal>
          </div>

          <Reveal delay={110}>
            <div style={{ margin: 'clamp(2rem, 4vw, 3rem) 0' }}>
              <DotField mode="heat" accent="#C4622F" height={200} />
            </div>
          </Reveal>

          <Reveal delay={130}>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {STATS.map((s) => (
                <div key={s.v}>
                  <p className="me-num" style={{ fontSize: 'clamp(1.9rem, 3vw, 2.5rem)' }}>{s.v}</p>
                  <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)' }}>{s.k}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 01 · the field, as scored ---- */}
      <section className="me-band" style={{ background: 'var(--bg-2)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="01" label="The field, as scored" /></Reveal>
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '19ch', marginBottom: '1.25rem' }}>
              The score is never an absolute temperature.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede" style={{ marginBottom: '2.5rem' }}>
              It is a departure from a thirty-year ERA5 climatology for that exact location, so a
              number that is ordinary in the west of the state is an emergency on the coast.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {TERMS.map(([t, sub]) => (
                <div key={t}>
                  <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 500, lineHeight: 1.4, color: 'var(--ink)' }}>{t}</p>
                  <p className="me-label">{sub}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'clamp(1.5rem, 3vw, 2.25rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(1.25rem, 2.5vw, 2rem)' }}>
              <DiagramPanel scene="heatField" label="The field, as scored" />
              <DiagramPanel
                scene="heatObserved"
              />
            </div>
            <Caption>
              Western Odisha reference. Shadow: scored, not alerted.
            </Caption>
          </Reveal>
        </div>
      </section>

      {/* ---- 02 · eleven scored, five shown ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="02" label="Eleven scored, five shown" /></Reveal>
          <Reveal>
            <p className="me-lede" style={{ marginBottom: '2.5rem' }}>
              Delhi and Dhaka test whether the engine travels outside Odisha at all, the portability
              question the whole thesis rests on. Western Odisha references calibrate the hot end.
              Product surfaces stay at five, the same five as flood.
            </p>
          </Reveal>

          <Reveal delay={90}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid var(--line)' }}>
              {FIELD.map((f) => (
                <li key={f.n} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '0.5rem 1.5rem', alignItems: 'baseline', padding: '1rem 0', borderBottom: '1px solid var(--line)' }}>
                  <span className="me-num" style={{ fontSize: 20, minWidth: '2ch' }}>{f.c}</span>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: 14.5, color: 'var(--ink)' }}>{f.n}</p>
                    <p className="me-label">{f.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <p className="me-label" style={{ marginTop: '1.5rem', lineHeight: 1.8, maxWidth: '84ch' }}>
              We never say ten heat cities are live. Five are shown, eleven are scored, and none of
              them alert. heat_engine_mode has no active in v1.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="me-panel" style={{ marginTop: 'clamp(2.5rem, 5vw, 3.5rem)', borderLeft: '2px solid var(--laterite)' }}>
              <div style={{ marginBottom: 16 }}><Chip kind="shadow" /></div>
              <h3 className="me-display me-d3" style={{ marginBottom: 16 }}>
                Said plainly: there is no heat model. There is a dataset.
              </h3>
              <p className="me-body" style={{ maxWidth: 'none', marginBottom: '1rem' }}>
                About 82,000 leakage-audited rows sit under{' '}
                <code className="me-mono" style={{ fontSize: '0.9em', padding: '0.15em 0.4em', background: 'var(--surface-2)', color: 'var(--ink)' }}>
                  ml/heatwave/
                </code>
                : ERA5 observed seasons back to 2012, 1991–2020 normals, and roughly 23,700
                forecast-backed rows. No model has been trained on them. HeatBench v0 exists; the IMD
                grid cross-check sits at roughly 62% within 1.5 degrees of ERA5.
              </p>
              <p className="me-body" style={{ maxWidth: 'none' }}>
                Heat stays where it is until there is a HeatBench a buyer can audit: false-alarm rate,
                lead time, and a comparison against a published record. Going live is a code change
                and a recorded decision, not a flag flip. The shadow surface is published anyway:
                the{' '}
                <Link href="/dashboard/heat" className="me-link">
                  heat field
                </Link>{' '}
                and the{' '}
                <Link href="/dashboard/shadow" className="me-link">
                  north Odisha basins
                </Link>{' '}
                are scored in the open, and neither one alerts.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}
