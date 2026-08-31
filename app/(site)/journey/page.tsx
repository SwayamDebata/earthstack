'use client';

import PageHero from '@/components/site/PageHero';
import AmbientScore from '@/components/site/AmbientScore';
import ValleyHero from '@/components/site/ValleyHero';
import JourneyStory from '@/components/site/JourneyStory';
import RisingWater from '@/components/site/RisingWater';
import MonsoonNight from '@/components/site/MonsoonNight';
import DotField from '@/components/site/DotField';
import { CallToAction } from '@/components/site/Closing';
import { Chip, Reveal, SectionHead } from '@/components/site/primitives';
import { Num } from '@/components/site/scroll';

type Chapter = {
  when: string;
  title: string;
  paras: string[];
  chip?: 'backtest' | 'miss' | 'live';
  chipText?: string;
};

/* The 1999 chapter and the "rivers decide the year" paragraph used to open
   this list. Both are now told by the JourneyStory scene above, so the written
   chapters pick up where the scene leaves off instead of restating it. */
const CHAPTERS: Chapter[] = [
  {
    when: 'Growing up',
    title: 'Where the rivers decide the year.',
    paras: [
      'What nobody has is the one thing that would change the night itself, which is knowing whether this rain is the one.',
    ],
  },
  {
    when: 'The decision',
    title: "An engineer's version of doing something about it.",
    paras: [
      'The honest reason this exists is small and unheroic: it is the one problem where the skills were already in hand. Ingestion, a rule engine, an API, a dashboard. Not a moral awakening, just the recognition that the gap was distribution and distribution is software.',
      'So it began as evenings and weekends against public data, with no plan for it to be a company.',
    ],
  },
  {
    when: 'The first honest score',
    title: 'Zero of twelve gauges were telling the truth.',
    paras: [
      'The first real lesson was not a modelling lesson. It was that the public river network, on the day we started ingesting it, had a feed stalled 84 days, five sensors reading the same number for months, and one station reporting minus 834 metres.',
      'Everything the company is now was decided in that week. Not a bigger model. A discipline about which feed lies and when.',
    ],
  },
  {
    when: 'The number we gave up',
    title: 'We retired our best headline on purpose.',
    paras: [
      'Our labeller had been snapping flood events to the nearest city within 120 km. In Odisha that crosses whole basins, and it meant our 99.3% was measured on the wrong rivers. One of 143 validated positives was actually Mahanadi.',
      'We could have quietly fixed it. Instead we published the audit, the replacement number, and the precision problem it exposed underneath. If there is a single thing that separates this from every other deck in the category, it is that week.',
    ],
    chip: 'backtest',
    chipText: 'Published anyway',
  },
  {
    when: 'August 2026',
    title: 'Five cities, one person, no capital.',
    paras: [
      'The engine scores Bhubaneswar, Cuttack, Puri, Sambalpur and Rourkela every thirty minutes. The ML runs beside it in shadow and has never moved a user-facing score. There is no signed MoU and no paying customer.',
      'That is the whole position, stated the way we would want it stated back to us.',
    ],
    chip: 'live',
  },
];

const NOT_YET: [string, string][] = [
  ['Cities alerting in production', '5'],
  ['Districts running a full monsoon on it', '0'],
  ['Farmers enrolled through a programme', '0'],
  ['Paying customers', '0'],
  ['People building it', '1'],
];

export default function JourneyPage() {
  return (
    <>
      {/* the valley, before any of the words */}
      <ValleyHero />

      <PageHero
        eyebrow="The journey"
        title="It did not start as a company."
        lede="It started with a river that everyone in the state can name, and a warning that has never quite arrived in time."
      />

      <section style={{ background: 'var(--bg)', paddingBlock: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
        <div className="me-wrap">
          <AmbientScore />
        </div>
      </section>

      <JourneyStory />

      {/* the river, as a particle bed under the chapters */}
      <div style={{ background: 'var(--bg)', position: 'relative' }}>
        <div className="me-wrap">
          <DotField mode="flow" water="#3E7F76" base="#4A4D3C" max={2200} height={180} />
        </div>
      </div>

      <section className="me-band" style={{ background: 'var(--bg)', paddingTop: 'clamp(2rem, 4vw, 3rem)' }}>
        <div className="me-wrap">
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid var(--line)' }}>
            {CHAPTERS.map((c) => (
              <li key={c.when}>
                <Reveal>
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
                        {c.when}
                      </p>
                      <h2 className="me-display me-d3" style={{ marginBottom: 14 }}>
                        {c.title}
                      </h2>
                      {c.chip && <Chip kind={c.chip}>{c.chipText}</Chip>}
                    </div>
                    <div>
                      {c.paras.map((p) => (
                        <p key={p.slice(0, 24)} className="me-body" style={{ marginBottom: '1rem', maxWidth: 'none' }}>
                          {p}
                        </p>
                      ))}
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- one night on that river, at full bleed ---- */}
      <RisingWater />

      {/* ---- and what the engine was doing through it ---- */}
      <section className="me-band" style={{ background: 'var(--bg)', paddingBottom: 0 }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="01" label="Explained simply" />
          </Reveal>
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '18ch', marginBottom: '1.25rem' }}>
              How a flood warning actually gets made.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede">
              Four moments in one August, on one stretch of the Mahanadi. No jargon, just what the
              engine sees, and when. Most of the year nothing happens, and that is what makes the
              one day legible.
            </p>
          </Reveal>
        </div>
      </section>

      <MonsoonNight />

      {/* ---- what it has not reached. The ripple bed moved here from the
              "one family, one more day" band, which the JourneyStory scene
              already closes on. ---- */}
      <section
        className="me-band"
        style={{ background: 'var(--bg-2)', position: 'relative', overflow: 'hidden' }}
      >
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, opacity: 0.42, pointerEvents: 'none' }}
        >
          <DotField mode="ripple" accent="#E0A05A" base="#4A4D3C" max={2400} height="100%" />
        </div>
        <div className="me-wrap" style={{ position: 'relative' }}>
          <Reveal>
            <SectionHead index="02" label="What the journey has not reached yet" />
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 5vw, 4.5rem)', alignItems: 'start' }}>
            <Reveal>
              <h2 className="me-display me-d2" style={{ maxWidth: '17ch', marginBottom: '1.25rem' }}>
                The honest end of the story is that it has not happened yet.
              </h2>
              <p className="me-body" style={{ marginBottom: '1rem' }}>
                No district has run a monsoon on this. No farmer has been enrolled through a
                programme. The trust gate that would let the model out of shadow is open, and the
                streak is currently zero.
              </p>
              <p className="me-body">
                A journey page that ended in triumph would be the easiest thing to write and the
                fastest way to lose the room.
              </p>
            </Reveal>

            <Reveal delay={90}>
              <dl style={{ margin: 0 }}>
                {NOT_YET.map(([k, v]) => (
                  <div key={k} className="me-kv">
                    <dt style={{ fontSize: 14.5, color: 'var(--text)' }}>{k}</dt>
                    <dd className="me-num" style={{ margin: 0, fontSize: 18 }}>
                      <Num value={v} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="me-panel" style={{ marginTop: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
              <p className="me-label" style={{ marginBottom: 12 }}>And then, eventually</p>
              <h3 className="me-display me-d3" style={{ marginBottom: 14 }}>
                Flood is one hazard in one state. The engine underneath does not know that.
              </h3>
              <p className="me-body" style={{ maxWidth: 'none', marginBottom: '1rem' }}>
                Heat already runs on it. Cyclone and drought would run on it. The same shape works
                anywhere the data is thin and somebody has to decide tonight, which is most of the
                places that flood.
              </p>
              <p className="me-body" style={{ maxWidth: 'none' }}>
                We are not building that yet, and we will not talk about it as though we are.
              </p>
              <p className="me-label" style={{ marginTop: '1.25rem', lineHeight: 1.8 }}>
                Not on the roadmap. Not in the next ninety days. Stated once, here, and nowhere else
                on this site.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
