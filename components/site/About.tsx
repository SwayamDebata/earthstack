'use client';

import { Reveal, SectionHead } from './primitives';

const STANDING: [string, string][] = [
  ['Founders', '2'],
  ['Outside capital raised', 'None yet'],
  ['Paying customers', '0'],
  ['Signed MoUs', '0'],
  ['Cities alerting in production', '5'],
  ['Trust gate', 'Open'],
];

const RULES: { id: string; title: string; body: string }[] = [
  {
    id: 'D001',
    title: 'Five cities until the trust gate passes',
    body: 'Expanding the alert map is the easiest way to look bigger and the fastest way to page a district officer about a location we have never validated. New geography goes to shadow first, every time.',
  },
  {
    id: 'D002 · D005',
    title: 'Offline metrics are not permission to go live',
    body: 'The ML model has good numbers on held-out data. It has never driven an alert and will not until it survives a monsoon in shadow. A good score on history is a hypothesis.',
  },
  {
    id: 'D019',
    title: 'Shadow and live never share a screen',
    body: 'Flood Ops and Heat Ops are separate surfaces. A shadow location cannot alert by construction, and a test fails loudly if a refactor ever merges the two location lists.',
  },
  {
    id: 'D023 · D025',
    title: 'Publish the audit that costs you the number',
    body: 'We retired our own 99.3% headline the week we found it was mislabelled, and put the replacement - and the precision problem it exposed - on the public site. That is the whole culture in one move.',
  },
];

export default function About() {
  return (
    <section id="about" className="me-band" style={{ background: 'var(--bg)' }}>
      <div className="me-wrap">
        <Reveal>
          <SectionHead index="01" label="Why here" />
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
            <h2 className="me-display me-d2" style={{ maxWidth: '15ch', marginBottom: '1.5rem' }}>
              The technology already existed in 1999.
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p className="me-lede">
                A super cyclone crossed the Odisha coast in October 1999 and took thousands of lives
                before a single warning reached the last village. The models existed. The satellites
                were overhead. What was missing was the final step.
              </p>
              <p className="me-body">
                Twenty-seven years later the rivers still rise on a schedule everyone knows, and the
                last mile is still the hard part. Not the physics - the distribution. That last mile
                ends at a district officer at three in the morning, with half the data and all of the
                responsibility, deciding whether to wake a town. Everything we build is aimed at that
                one moment.
              </p>
            </div>
          </Reveal>
        </div>

        {/* ---- founder ---- */}
        <Reveal delay={110}>
          <figure
            style={{
              margin: 'clamp(3rem, 6vw, 4.5rem) 0 0',
              borderTop: '1px solid var(--line)',
              borderBottom: '1px solid var(--line)',
              paddingBlock: 'clamp(2rem, 4vw, 3rem)',
            }}
          >
            <blockquote style={{ margin: 0 }}>
              <p
                className="me-display"
                style={{
                  fontSize: 'clamp(1.5rem, 3.2vw, 2.5rem)',
                  lineHeight: 1.18,
                  maxWidth: '22ch',
                  marginBottom: '1.5rem',
                }}
              >
                “I grew up where the rivers decide the year. If we can buy one family one more day,
                the whole thing was worth building.”
              </p>
            </blockquote>
            <figcaption
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'clamp(1.25rem, 3vw, 2.5rem)',
                alignItems: 'start',
              }}
            >
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                  Swayam Debata
                </p>
                <p className="me-label" style={{ letterSpacing: '0.14em' }}>
                  Founder
                </p>
                <p style={{ margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.65, color: 'var(--muted)' }}>
                  Software engineer, born and raised in Odisha. Built the ingestion, the rule
                  engine, the ML pipeline, the API, the dashboard, the alerting and the deploy.
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                  Anil Kumar Moharana
                </p>
                <p className="me-label" style={{ letterSpacing: '0.14em' }}>
                  Co-founder
                </p>
              </div>
              {/* the company facts belong to both of them, so they sit below the names */}
              <p
                style={{
                  gridColumn: '1 / -1',
                  margin: 0,
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: 'var(--muted)',
                }}
              >
                No outside capital, raising a 75 lakh rupee pre-seed. Hiring next: one ML and data
                engineer, and one partnerships lead.
              </p>
            </figcaption>
          </figure>
        </Reveal>

        {/* ---- where things stand ---- */}
        <Reveal delay={130}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'clamp(2rem, 5vw, 4.5rem)',
              alignItems: 'start',
              marginTop: 'clamp(3rem, 6vw, 4.5rem)',
            }}
          >
            <div>
              <p className="me-label" style={{ marginBottom: 8 }}>
                Where things actually stand
              </p>
              <dl style={{ margin: 0 }}>
                {STANDING.map(([k, v]) => (
                  <div key={k} className="me-kv">
                    <dt style={{ fontSize: 14.5, color: 'var(--text)' }}>{k}</dt>
                    <dd className="me-mono" style={{ margin: 0, fontSize: 13, color: 'var(--ink)' }}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <p className="me-body" style={{ marginBottom: '1.25rem' }}>
                If you are an investor or a district and you were expecting a longer list, that is
                the point. The engine is real and the traction is early, and we would rather you
                learn both from us than from diligence.
              </p>
              <p className="me-body">
                Key-person risk is real here and we are not pretending otherwise. It is also why
                the discipline is written into the code as recorded decisions rather than kept in
                someone’s head: shadow cannot alert because a test fails if it ever could.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ---- four rules ---- */}
        <Reveal delay={150}>
          <div style={{ marginTop: 'clamp(3rem, 6vw, 4.5rem)' }}>
            <h3
              className="me-h"
              style={{ fontSize: 'clamp(1.15rem, 1.8vw, 1.45rem)', marginBottom: 8 }}
            >
              Four rules we do not bend.
            </h3>
            <p className="me-body" style={{ marginBottom: '1.75rem' }}>
              Written into the codebase as recorded decisions, not aspirations on a wall. Breaking
              one requires a new entry in the decision log, with a reason.
            </p>
            <div
              className="me-hairgrid"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
            >
              {RULES.map((r) => (
                <div key={r.id}>
                  <p
                    className="me-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      color: 'var(--laterite)',
                      marginBottom: 12,
                    }}
                  >
                    {r.id}
                  </p>
                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: 15,
                      fontWeight: 500,
                      lineHeight: 1.35,
                      color: 'var(--ink)',
                    }}
                  >
                    {r.title}
                  </p>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.62, color: 'var(--muted)' }}>
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
