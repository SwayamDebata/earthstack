'use client';

import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import { SceneFigure, SceneBanner, DiagramPanel } from '@/components/site/HeroScene';
import Thesis from '@/components/site/Thesis';
import DataSparse from '@/components/site/DataSparse';
import DecisionEngine from '@/components/site/DecisionEngine';
import Evidence from '@/components/site/Evidence';
import AuditScene from '@/components/site/AuditScene';
import MotionScene from '@/components/site/MotionScene';
import { Caption, Chip, Reveal, SectionHead } from '@/components/site/primitives';

/* The "84 days" and "5 stuck" rows, and a "0 of 12" row, used to live here too.
   They are the detail behind the headline numbers in the data-sparse section
   above, so only the rows that add something new are kept. */
const FEED: [string, string][] = [
  ['Out-of-range at Kishan Nagar, including a spike to 1133 m and minus 834 m at Jenapur', '34.6%'],
  ['Sensors flatlined: Akhuapada, Champua, Pamposh, Nimapara, Seorinarayan', '5 stuck'],
  ['Brahmani and Baitarani feed, stalled since 3 June', '84 days'],
  ['Real but stale: Sambalpur, Hirakud, Basantpur, Khairmal', '38–79 h'],
];

const SOURCES = [
  ['INDOFLOODS', '653 labelled historical flood events. Kuntla & Saharia, BAMS 2025.'],
  ['IFI', 'India Flood Inventory. Saharia et al.'],
  ['ERA5', "1991–2020 climatology. Each location's own wet-day p95, and the heat baseline."],
  ['IMD', 'Daily gridded rainfall and Odisha district normals.'],
  ['Odisha AWS', 'State automatic weather stations, ingested twice daily.'],
  ['CWC / NWDP', 'Hourly river telemetry, 46 gauges, open-licensed.'],
  ['DoWR Odisha', 'Daily flood bulletin: 28 gauges with danger, warning and historic high, plus reservoir gates and discharge.'],
  ['NRSC · OpenWeather', 'Satellite baselines and live forecast. Derived risk product; no raw data resale.'],
];

const LANES = [
  {
    when: 'Now · live',
    kind: 'live' as const,
    title: 'Flood, five cities',
    body: 'Mature the alerting set. North Odisha scored in shadow. Close the recession gap with river gauges on the risk path.',
    href: '/products/flood',
  },
  {
    when: 'Next · shadow',
    kind: 'shadow' as const,
    title: 'Heat, same engine',
    body: 'Eleven locations scored against ERA5 normals, five surfaced. Stays in shadow until it has an audit a buyer can check.',
    href: '/products/heat',
  },
  {
    when: 'Discovery',
    kind: 'open' as const,
    title: 'One industry vertical',
    body: 'Mining first, and discovery before any build. Ten to fifteen conversations decide whether there is pull, before a line of product code.',
    href: null,
  },
];

export default function ResearchPage() {
  return (
    <>
      <PageHero
        eyebrow="Research"
        title="The models are good. The map is not."
        lede="Global flood platforms are excellent where the data is thick: dense gauge networks, LIDAR terrain, decades of insurance claims. Most of the people who drown live where none of that exists. That is the whole company."
      />

      <section className="me-band" style={{ background: 'var(--bg)', paddingBottom: 0 }}>
        <div className="me-wrap">
          <Reveal>
            <SceneFigure
              scene="deltaSplit"
              maxWidth={1320}
            />
          </Reveal>
        </div>
      </section>


      <Thesis />
      <DataSparse />
      <DecisionEngine />

      {/* ---- one engine, many hazards ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="04" label="One engine, many hazards" />
          </Reveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'clamp(2rem, 5vw, 4.5rem)',
              alignItems: 'start',
              marginBottom: '3rem',
            }}
          >
            <Reveal>
              <h2 className="me-display me-d2" style={{ maxWidth: '16ch' }}>
                The hazard changes. The shape does not.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="me-lede">
                Flood is the wedge because it is the most expensive and the most tractable.
                Underneath, the engine is hazard-agnostic: a baseline, an observation, a rule, a
                decision. Heat already runs on it, in shadow, with no way to alert.
              </p>
            </Reveal>
          </div>

          <Reveal delay={110}>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {LANES.map((l) => (
                <div key={l.title}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span className="me-label">{l.when}</span>
                    <Chip kind={l.kind} />
                  </div>
                  <h3 className="me-h" style={{ fontSize: 18, marginBottom: 10 }}>
                    {l.href ? (
                      <Link href={l.href} className="me-link" style={{ borderBottom: 'none' }}>
                        {l.title}
                      </Link>
                    ) : (
                      l.title
                    )}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.62, color: 'var(--muted)' }}>
                    {l.body}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={125}>
            <div style={{ marginTop: 'clamp(2rem, 4vw, 3rem)' }}>
              <DiagramPanel
                scene="thesisHazards"
              />
            </div>
          </Reveal>

          <Reveal delay={140}>
            <p className="me-label" style={{ marginTop: '1.5rem', lineHeight: 1.8, maxWidth: '84ch' }}>
              Not in the next ninety days: cyclone, drought, ports, extra industries, or a sixth
              alerting city. Deliberately.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p className="me-body" style={{ marginTop: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
              That is the argument.{' '}
              <a href="#evidence" className="me-link">
                Everything below is the evidence for it
              </a>
              , including the parts that went against us.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ the evidence half ═══════════════ */}

      <section
        id="evidence"
        className="me-band"
        style={{ background: 'var(--bg-2)', paddingBottom: 0 }}
      >
        <div className="me-wrap">
          <Reveal>
            <p className="me-eyebrow" style={{ marginBottom: '2rem' }}>
              The evidence
            </p>
          </Reveal>
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '17ch', marginBottom: '1.25rem' }}>
              Everything we know, including what broke.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede">
              A district cannot audit what it cannot see. Every figure here carries a label saying
              what kind of number it is, and the failures are given the same weight as the wins.
            </p>
          </Reveal>
        </div>
      </section>

      <SceneBanner
        scene="research"
        dots={{ mode: 'scatter', base: '#3A3D2F', max: 1500 }}
      />

      <AuditScene />

      <Evidence />

      <section className="me-band" style={{ background: 'var(--bg)', paddingTop: 0 }}>
        <div className="me-wrap">
          <Reveal>
            <MotionScene
              scene="leadtime"
              duration={14}
              label="Rainfall, river stage, and what the engine said"
              note="Backtest · forecast replayed as issued"
            />
          </Reveal>

          <Reveal delay={90}>
            <div style={{ marginTop: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              <DiagramPanel scene="researchCurves" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- fixing it: real river telemetry ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="06" label="Fixing it: real river telemetry" /></Reveal>
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '19ch', marginBottom: '1.25rem' }}>
              We deleted the constants and went to the source.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede" style={{ marginBottom: '2.5rem' }}>
              The engine used to carry hardcoded river levels. They are gone. CWC hourly telemetry now
              arrives from the NWDP open API (46 gauges across Mahanadi, Brahmani and Baitarani), and
              the daily DoWR flood bulletin is parsed for 28 more.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <p className="me-label" style={{ marginBottom: 14 }}>What the feed actually looked like</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid var(--line)' }}>
              {FEED.map(([k, v]) => (
                <li key={k} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem 1.5rem', alignItems: 'baseline', padding: '0.9rem 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 14.5, color: 'var(--text)' }}>{k}</span>
                  <span className="me-mono" style={{ fontSize: 13, color: 'var(--accent)' }}>{v}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={130}>
            <p className="me-body" style={{ marginTop: '1.75rem' }}>
              So the ingest ships with a QC layer it turned out to need badly: physical-range filter,
              stuck-sensor detection over a 500-reading window, and a datum check that strips a
              published danger level when it does not share the station&rsquo;s datum. A level counts
              toward a score only when the gauge is genuinely live.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(1.5rem, 3vw, 2.5rem)', marginTop: 'clamp(2rem, 4vw, 3rem)' }}>
              <div className="me-panel">
                <div style={{ marginBottom: 14 }}><Chip kind="backtest" /></div>
                <h3 className="me-h" style={{ fontSize: 17, marginBottom: 12 }}>And it would have worked</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.62, color: 'var(--text)' }}>
                  10 of 12 location-days in the 19–21 August recession window that rainfall scored LOW
                  would have been rescued by the river hold. On 19 August, Akhuapada was literally
                  above its danger level, 18.45 m against 18.33, while the rainfall engine said 0.20
                  LOW.
                </p>
              </div>
              <div className="me-panel">
                <div style={{ marginBottom: 14 }}><Chip kind="live" /></div>
                <h3 className="me-h" style={{ fontSize: 17, marginBottom: 12 }}>Live in production</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.62, color: 'var(--text)' }}>
                  Sambalpur now reads 181.68 m from Jamadarpali. Cuttack 131.22 from Kishan Nagar,
                  Puri 3.22 from Nimapara, Rourkela 171.4 from Pamposh, all correctly marked
                  unavailable and contributing nothing. Bhubaneswar has no CWC station at all, so it
                  now shows no river level rather than a frozen constant.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- what the engine is built from ---- */}
      <section className="me-band" style={{ background: 'var(--bg-2)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="07" label="What the engine is built from" /></Reveal>
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '20ch', marginBottom: '1.25rem' }}>
              Public and academic data, named, and filtered before it counts.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede" style={{ marginBottom: '2.5rem' }}>
              Nothing reaches a score straight from a feed. Every reading passes four gates, and a
              station that fails any of them contributes nothing rather than contributing noise.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {SOURCES.map(([n, d]) => (
                <div key={n}>
                  <p className="me-mono" style={{ fontSize: 12, letterSpacing: '0.08em', color: 'var(--ink)', marginBottom: 10, fontWeight: 500 }}>{n}</p>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--muted)' }}>{d}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              <DiagramPanel scene="researchGates" />
            </div>
            <Caption>Derived risk product; no raw data resale. Advisory only.</Caption>
          </Reveal>
        </div>
      </section>

      {/* ---- the closer, now that both halves have been made ---- */}
      <section className="me-band" style={{ background: 'var(--bg)', paddingTop: 0 }}>
        <div className="me-wrap">
          <Reveal>
            <div className="me-panel" style={{ borderLeft: '2px solid var(--accent)' }}>
              <p className="me-label" style={{ marginBottom: 14 }}>
                The honest position, August 2026
              </p>
              <h3 className="me-display me-d3" style={{ marginBottom: 14 }}>
                Every claim above is labelled. If we cannot label it, we do not make it.
              </h3>
              <p className="me-body" style={{ maxWidth: 'none' }}>
                The flood engine alerts on five cities. The ML runs in shadow and cannot alter a
                user-facing score. Heat has no live mode in the code, not a switch we are choosing
                not to flip. There is no signed MoU and no paying customer.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}
