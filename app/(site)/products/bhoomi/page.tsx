'use client';

import Image from 'next/image';
import HeroScene, { SceneHead, DiagramPanel } from '@/components/site/HeroScene';
import { Chip, Reveal, SectionHead } from '@/components/site/primitives';

const STATS: { v: string; k: string }[] = [
  { v: '84', k: 'days the Brahmani and Baitarani feed was stalled when we first ingested it' },
  { v: '5', k: 'sensors reading the same value for months: Akhuapada, Champua, Pamposh, Nimapara, Seorinarayan' },
  { v: '0', k: 'Bhoomi units deployed in the field today' },
];

const GATES = [
  {
    id: 'Gate 01',
    t: 'Co-located season',
    b: 'A full monsoon beside a working CWC gauge, logging both, before anyone trusts the new one.',
  },
  {
    id: 'Gate 02',
    t: 'The same QC it applies to others',
    b: 'Physical range, stuck-sensor detection, staleness and datum. Our device fails these the same way theirs does.',
  },
  {
    id: 'Gate 03',
    t: 'Shadow scoring',
    b: 'Scored and logged with a shadow badge, unable to alter any user-facing score, for a full season.',
  },
  {
    id: 'Gate 04',
    t: 'A recorded decision',
    b: "A new entry in the decision log with a reason. Not a config flag, and not a founder's good mood.",
  },
];

export default function BhoomiPage() {
  return (
    <>
      <HeroScene
        scene="bhoomi"
        dots={{ mode: 'rain', water: '#294048', accent: '#7FB08A', max: 900 }}
        scrim="6,8,10"
        note="Ingest-only JSONB, not fused into live flood risk. Recorded decisions D013 and D022."
      >
        <SceneHead
          eyebrow="Product 04"
          kind={'dev'}
          title="Bhoomi G1"
          lede="A field node for the reaches nobody gauges. Designed, specified, and deliberately not on the risk path."
        />
      </HeroScene>


      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(2rem, 5vw, 4.5rem)', alignItems: 'start' }}>
            <Reveal>
              <h2 className="me-display me-d2" style={{ maxWidth: '17ch', marginBottom: '1.5rem' }}>
                Zero of twelve gauges were decision-grade on day one.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="me-body" style={{ marginBottom: '1.1rem' }}>
                That is not a complaint about CWC. Running a national gauge network is hard. It is the
                observation that started this device: the reaches we most need to watch are the ones
                nobody instruments, and the instruments that do exist fail quietly.
              </p>
              <p className="me-body">
                If the public network cannot tell us whether a river is rising at Bhubaneswar, where
                there is no CWC station at all, then either we accept a rainfall-only read forever or
                we put something in the ground.
              </p>
            </Reveal>
          </div>

          <Reveal delay={110}>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
              {STATS.map((s) => (
                <div key={s.v}>
                  <p className="me-num" style={{ fontSize: 'clamp(1.9rem, 3vw, 2.5rem)', color: 'var(--laterite)' }}>{s.v}</p>
                  <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)' }}>{s.k}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- held to our own standard ---- */}
      <section className="me-band" style={{ background: 'var(--bg-2)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="01" label="Where the data goes, and where it does not" /></Reveal>
          <Reveal>
            {/* The figure, the heading and the lede share one wrapper so the
                float starts at the top of the heading. In separate Reveal
                blocks it could only begin beside the paragraph, which left it
                stranded low against a tall headline. */}
            <div className="me-float-wrap">
              <figure className="me-figure-right">
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 10',
                    overflow: 'hidden',
                    border: '1px solid var(--line)',
                    background: '#1a1210',
                  }}
                >
                  <Image
                    src="/bhoomi-g1-dev.jpg"
                    alt="Bhoomi G1 development prototype"
                    fill
                    sizes="(max-width: 760px) 100vw, 330px"
                    style={{ objectFit: 'cover', objectPosition: 'center 42%' }}
                    priority={false}
                  />
                </div>
              </figure>
              <h2 className="me-display me-d2" style={{ maxWidth: '20ch', marginBottom: '1.25rem' }}>
                Our own hardware gets held to the standard we applied to CWC.
              </h2>
              <p className="me-lede" style={{ marginBottom: '1.25rem' }}>
                We spent months learning that an unvalidated gauge is worse than no gauge, because it
                fails silently and looks like data. Wiring our own prototype straight into the risk
                path would be exactly the failure we designed the shadow discipline to prevent, and the
                fastest way to lose a district&rsquo;s trust permanently.
              </p>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div style={{ margin: 'clamp(1.5rem, 3vw, 2.25rem) 0' }}>
              <DiagramPanel scene="bhoomiSpec" label="What is actually specified" note="Design and BOM" />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              <DiagramPanel
                scene="bhoomiDataPath"
                maxWidth={900}
              />
            </div>
            <p className="me-body">
              So Bhoomi writes to an ingest store and stops. Not a softer standard because we built
              it. The failure mode we care about is not power budget. It is never being installed at
              all, because installation needed a truck and a permit.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- four gates ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="02" label="Four gates before a reading counts" /></Reveal>
          <Reveal delay={80}>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {GATES.map((g) => (
                <div key={g.id}>
                  <p className="me-mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--laterite)', marginBottom: 12 }}>
                    {g.id}
                  </p>
                  <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 500, lineHeight: 1.35, color: 'var(--ink)' }}>{g.t}</p>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)' }}>{g.b}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="me-panel" style={{ marginTop: 'clamp(2.5rem, 5vw, 3.5rem)', borderLeft: '2px solid var(--laterite)' }}>
              <div style={{ marginBottom: 16 }}><Chip kind="dev" /></div>
              <h3 className="me-display me-d3" style={{ marginBottom: 16 }}>
                Said plainly: there is no Bhoomi network.
              </h3>
              <p className="me-body" style={{ maxWidth: 'none', marginBottom: '1rem' }}>
                Bhoomi G1 is a design and a bill of materials with a working ingest endpoint behind
                it. Zero units are deployed. The sensor card inside KrishiOS is in demo mode.
              </p>
              <p className="me-body" style={{ maxWidth: 'none' }}>
                There is exactly one hardware product, Bhoomi G1, and no second device. If you see
                another name attached to ModelEarth hardware, it does not exist. When units go in the
                ground, this page will say how many and where. Until then it says zero.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}
