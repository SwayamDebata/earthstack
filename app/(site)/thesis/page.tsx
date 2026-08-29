'use client';

import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import { SceneFigure, DiagramPanel } from '@/components/site/HeroScene';
import Thesis from '@/components/site/Thesis';
import DataSparse from '@/components/site/DataSparse';
import DecisionEngine from '@/components/site/DecisionEngine';
import { CallToAction } from '@/components/site/Closing';
import { Chip, Reveal, SectionHead } from '@/components/site/primitives';

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

export default function ThesisPage() {
  return (
    <>
      <PageHero
        eyebrow="Thesis"
        title="The models are good. The map is not."
        lede="Global flood platforms are excellent where the data is thick: dense gauge networks, LIDAR terrain, decades of insurance claims. Most of the people who drown live where none of that exists. That is the whole company."
      />

      <section className="me-band" style={{ background: 'var(--bg)', paddingBottom: 0 }}>
        <div className="me-wrap">
          <Reveal>
            <SceneFigure
              scene="deltaSplit"
              maxWidth={1320}
              caption="Illustrative schematic. Not a survey of any specific basin."
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
            <div
              className="me-panel"
              style={{ marginTop: 'clamp(2.5rem, 5vw, 3.5rem)', borderLeft: '2px solid var(--laterite)' }}
            >
              <p className="me-label" style={{ marginBottom: 14 }}>
                The honest position, August 2026
              </p>
              <h3 className="me-display me-d3" style={{ marginBottom: 14 }}>
                The trust gate is not passed. We say so on every page.
              </h3>
              <p className="me-body" style={{ maxWidth: 'none' }}>
                The flood engine alerts on five cities. The ML runs in shadow and cannot alter a
                user-facing score. Heat has no live mode in the code, not a switch we are choosing
                not to flip. There is no signed MoU and no paying customer. Every claim on this page
                is labelled; if we cannot label it, we do not make it.{' '}
                <Link href="/research" className="me-link">
                  Read the evidence before you believe the thesis
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
