'use client';

import { Reveal, SectionHead } from './primitives';
import { SceneFigure } from './HeroScene';

export default function Thesis() {
  return (
    <section id="thesis" className="me-band" style={{ background: 'var(--bg-2)' }}>
      <div className="me-wrap">
        <Reveal>
          <SectionHead index="01" label="The empty quadrant" />
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(2rem, 5vw, 4.5rem)',
            alignItems: 'start',
          }}
        >
          <Reveal>
            <h2 className="me-display me-d2" style={{ marginBottom: '1.5rem', maxWidth: '14ch' }}>
              Nobody is building here.
            </h2>
          </Reveal>

          <Reveal delay={90}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p className="me-body">
                That is the whole company. Tomorrow.io, Jupiter Intelligence, 7Analytics and Vassar
                Labs all win on assets we do not have and are not trying to acquire. We do not
                compete with them on their ground - we operate in the quadrant they skip: real-time
                decisions, made where the inputs are thin.
              </p>
              <p className="me-body">
                The quadrant is empty for a reason. It is unglamorous, and you cannot enter it from a
                desk in another country.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div style={{ marginTop: '4rem' }}>
            <SceneFigure
              scene="deltaQuadrant"
              maxWidth={760}
              caption="Positioning schematic. Placement is our own reading of public product scope, not a benchmark."
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
