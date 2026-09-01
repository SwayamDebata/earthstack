'use client';

import StoryVideo from './StoryVideo';
import { Chip, Reveal, SectionHead } from './primitives';

const BEATS: {
  n: string;
  when: string;
  title: string;
  body: string;
  readout: [string, string][];
  score: string;
  band: 'low' | 'medium' | 'high';
}[] = [
  {
    n: '01',
    when: 'May',
    title: 'The river sits low',
    body: 'The bank is exposed, the gauge reads under a metre. The engine still runs every thirty minutes and still writes a score, because the only way a HIGH means anything is to have watched all the days it stayed LOW.',
    readout: [
      ['Rain', '4 mm'],
      ['River', '0.9 m'],
    ],
    score: '0.06',
    band: 'low',
  },
  {
    n: '02',
    when: '18 August',
    title: '104 mm falls in a day',
    body: 'Heavy, but heavy is normal here in August, and that is the whole problem. So the number is not compared to a national threshold. It is compared to this location’s own wet-day p95, worked out from thirty years of records: 2.1 times a normal heavy day.',
    readout: [
      ['Rain', '104 mm · 2.1× p95'],
      ['Source', 'IMD + AWS + OW'],
    ],
    score: '0.41',
    band: 'medium',
  },
  {
    n: '03',
    when: '19 August',
    title: 'The gauge goes above danger',
    body: '18.45 metres against a danger level of 18.33. The rule stops decaying the previous days’ rainfall, because during an active flood the water has not gone anywhere. If that gauge were stale, stuck, or published against a different datum, the level would be shown but would count for nothing.',
    readout: [
      ['River', '18.45 m / DL 18.33'],
      ['Gauge', 'live'],
    ],
    score: '0.72',
    band: 'high',
  },
  {
    n: '04',
    when: '03:14',
    title: 'Someone has to wake a town',
    body: 'A score on its own is not a decision. What lands on the officer’s screen is the score, the three reasons behind it, the closest event in the historical record, and one suggested action, small enough to read at three, complete enough to defend at nine.',
    readout: [
      ['Onsets caught', '6 / 6 @ 48 h'],
      ['Lead', '~2 days of road'],
    ],
    score: 'n/a',
    band: 'high',
  },
];

const BAND_COLOR = {
  low: 'var(--water)',
  medium: '#b8791f',
  high: 'var(--accent)',
} as const;

export default function MonsoonNight() {
  return (
    <>
      {/* the footage sits framed in the page, at the size of a plate in a report */}
      <section className="me-band" style={{ background: 'var(--bg)', paddingBottom: 0 }}>
        <div className="me-wrap">
          <Reveal>
            <div style={{ maxWidth: 880, marginInline: 'auto' }}>
              <StoryVideo
                src720="/videos/monsoon-night-720.mp4"
                src1080="/videos/monsoon-night-1080.mp4"
                poster="/posters/monsoon-night.jpg"
                label="Monsoon night · Mahanadi"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="01" label="Four beats, one August" />
          </Reveal>

          <ol style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid var(--line)' }}>
            {BEATS.map((b) => (
              <Reveal as="li" key={b.n}>
                <article
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.25rem clamp(2rem, 5vw, 4rem)',
                    padding: 'clamp(1.75rem, 3.5vw, 2.75rem) 0',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <div>
                    <p className="me-eyebrow" style={{ marginBottom: 14 }}>
                      {b.n} · {b.when}
                    </p>
                    <h3 className="me-display me-d3">{b.title}</h3>
                  </div>

                  <div>
                    <p style={{ margin: '0 0 1.5rem', fontSize: 15, lineHeight: 1.68, color: 'var(--text)' }}>
                      {b.body}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.25rem 2rem',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--line)',
                      }}
                    >
                      <dl style={{ margin: 0, display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {b.readout.map(([k, v]) => (
                          <div key={k}>
                            <dt className="me-label" style={{ marginBottom: 5 }}>
                              {k}
                            </dt>
                            <dd className="me-mono" style={{ margin: 0, fontSize: 13.5, color: 'var(--ink)' }}>
                              {v}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      {b.score !== 'n/a' && (
                        <div style={{ textAlign: 'right' }}>
                          <p className="me-label" style={{ margin: '0 0 4px' }}>
                            Score
                          </p>
                          <p className="me-num" style={{ margin: 0, fontSize: 24, color: BAND_COLOR[b.band] }}>
                            {b.score}
                            <span className="me-mono" style={{ fontSize: 11, marginLeft: 8, letterSpacing: '0.14em' }}>
                              {b.band.toUpperCase()}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </ol>

          {/* the part that didn't work */}
          <Reveal>
            <div
              className="me-panel"
              style={{ marginTop: 'clamp(2.5rem, 5vw, 3.5rem)', borderLeft: '2px solid var(--accent)' }}
            >
              <div style={{ marginBottom: 16 }}>
                <Chip kind="miss" />
              </div>
              <h3 className="me-display me-d3" style={{ marginBottom: 16 }}>
                And the part that didn’t work: once the water was already there, we went quiet.
              </h3>
              <p className="me-body" style={{ maxWidth: 'none', marginBottom: '1rem' }}>
                Through the recession that followed, fourteen of eighteen location-days scored LOW
                while 13.44 lakh people were still displaced, because the engine reads rainfall, and
                the rain had stopped. Warning and flood state are not the same problem, and we had
                been treating them as one.
              </p>
              <p className="me-body" style={{ maxWidth: 'none' }}>
                That is why river gauges are now on the risk path, and why this sits at the end of the
                story instead of in a footnote. Ten of the twelve location-days we missed in that
                window would have been caught by the fix.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
