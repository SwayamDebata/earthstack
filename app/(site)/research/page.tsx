'use client';

import PageHero from '@/components/site/PageHero';
import Evidence from '@/components/site/Evidence';
import AuditScene from '@/components/site/AuditScene';
import { SceneBanner, DiagramPanel } from '@/components/site/HeroScene';
import MotionScene from '@/components/site/MotionScene';
import { CallToAction } from '@/components/site/Closing';
import { Caption, Chip, Reveal, SectionHead } from '@/components/site/primitives';

const FEED: [string, string][] = [
  ['Brahmani and Baitarani feed, stalled since 3 June', '84 days'],
  ['Sensors flatlined: Akhuapada, Champua, Pamposh, Nimapara, Seorinarayan', '5 stuck'],
  ['Out-of-range at Kishan Nagar, including a spike to 1133 m and minus 834 m at Jenapur', '34.6%'],
  ['Real but stale: Sambalpur, Hirakud, Basantpur, Khairmal', '38–79 h'],
  ['Decision-grade on day one', '0 of 12'],
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

export default function ResearchPage() {
  return (
    <>
      <PageHero
        eyebrow="Research and evidence"
        title="Everything we know, including what broke."
        lede="A district cannot audit what it cannot see. Every figure here carries a label saying what kind of number it is, and the failures are given the same weight as the wins."
      />

      <SceneBanner
        scene="research"
        dots={{ mode: 'scatter', accent: '#E0A05A', base: '#3A3D2F', max: 1500 }}
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
              <DiagramPanel
                scene="researchCurves"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- fixing it: real river telemetry ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="02" label="Fixing it: real river telemetry" /></Reveal>
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
                  <span className="me-mono" style={{ fontSize: 13, color: 'var(--laterite)' }}>{v}</span>
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
          <Reveal><SectionHead index="03" label="What the engine is built from" /></Reveal>
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
              <DiagramPanel
                scene="researchGates"
              />
            </div>
            <Caption>Derived risk product; no raw data resale. Advisory only.</Caption>
          </Reveal>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
