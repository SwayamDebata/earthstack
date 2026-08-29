'use client';

import PageHero from '@/components/site/PageHero';
import { SceneBanner, DiagramPanel } from '@/components/site/HeroScene';
import About from '@/components/site/About';
import { CallToAction } from '@/components/site/Closing';
import { Reveal, SectionHead } from '@/components/site/primitives';

const AUDIENCES = [
  {
    t: 'The officer on watch',
    b: 'Needs a defensible decision at 3 a.m. and a paper trail at 9 a.m. Gets the War Room, Evidence Mode, and a replay they can run themselves.',
  },
  {
    t: "The family at the river's edge",
    b: 'Needs one sentence, in their language, on a phone that may be the only one in the house. Gets KrishiOS: voice-first, six languages, shareable on WhatsApp.',
  },
];

const DIRECT: [string, string][] = [
  ['swayam@modelearth.in', 'mailto:swayam@modelearth.in'],
  ['+91 79781 59148', 'tel:+917978159148'],
  ['modelearth.in', 'https://modelearth.in'],
  ['api.modelearth.in', 'https://api.modelearth.in'],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built where the rivers decide the year."
        lede="ModelEarth is one engineer in Odisha, building the warning system he wishes had existed. Everything on this site was written, deployed and audited by the same person."
      />

      <SceneBanner
        scene="about"
        dots={{ mode: 'flow', water: '#2E5F58', base: '#3A3D2F', max: 1600 }}
      />


      <About />

      <section className="me-band" style={{ background: 'var(--bg)', paddingTop: 0 }}>
        <div className="me-wrap" style={{ display: 'grid', gap: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
          <Reveal>
            <DiagramPanel
              scene="aboutChain"
            />
          </Reveal>
          <Reveal delay={80}>
            <DiagramPanel
              scene="aboutShipped"
              maxWidth={820}
            />
          </Reveal>
        </div>
      </section>

      {/* ---- who this is for ---- */}
      <section className="me-band" style={{ background: 'var(--bg-2)' }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="02" label="Who this is for" />
          </Reveal>
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '20ch', marginBottom: '1.25rem' }}>
              Two people, and they are not the same person.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede" style={{ marginBottom: '2.5rem' }}>
              A warning that arrives in time is the difference between a story and a statistic. But
              the warning has to reach two very different people, and pretending they need the same
              interface is how early-warning products fail.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {AUDIENCES.map((a) => (
                <div key={a.t}>
                  <h3 className="me-h" style={{ fontSize: 18, marginBottom: 10 }}>
                    {a.t}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.62, color: 'var(--muted)' }}>{a.b}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div style={{ marginTop: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
              <DiagramPanel
                scene="aboutTwoPeople"
              />
            </div>
          </Reveal>

          <Reveal delay={130}>
            <p className="me-body" style={{ marginTop: '1.75rem' }}>
              Every score, every alert, every replay points back to the home at the river&rsquo;s edge
              and the family that has nowhere higher to go.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- direct contact ---- */}
      <section id="contact-direct" className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="03" label="Direct" />
          </Reveal>
          <Reveal delay={70}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.75rem 2.5rem' }}>
              {DIRECT.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="me-link me-mono" style={{ fontSize: 14 }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
