'use client';

import Link from 'next/link';
import HeroTerrain from '@/components/site/HeroTerrain';
import Ledger from '@/components/site/Ledger';
import VideoFrame from '@/components/site/VideoFrame';
import MotionScene from '@/components/site/MotionScene';
import { CallToAction } from '@/components/site/Closing';
import { Caption, Chip, Reveal, SectionHead } from '@/components/site/primitives';
import { Num } from '@/components/site/scroll';

const LAYERS = [
  {
    tag: 'Real',
    title: 'Horizontal geography',
    body: 'The bounding box, the five city coordinates and the three river courses are real positions. Cuttack sits at 20.4625°N, 85.8830°E in the scene because that is where Cuttack is.',
    accent: true,
  },
  {
    tag: 'Interpolated',
    title: 'Vertical relief',
    body: 'The surface is fitted to documented spot heights: Hirakud at 192 m, Sambalpur 135 m, Cuttack 36 m, Puri near sea level, with the valleys carved along the real courses. A plausible surface, not a survey.',
    accent: false,
  },
  {
    tag: 'One pull away',
    title: 'True elevation',
    body: 'NRSC CartoDEM or SRTM resampled onto this exact grid replaces the interpolated layer. Same renderer, same coordinates, one data file. Public data, no licence cost.',
    accent: false,
  },
];

const DENSITY: [string, string][] = [
  ['440 × 378 km', 'Study box'],
  ['43,616', 'Grid cells'],
  ['3', 'River courses traced'],
  ['0', 'External libraries loaded'],
];

export default function HomePage() {
  return (
    <>
      <HeroTerrain />

      {/* ---- 01 · what you just looked at ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="01" label="What you just looked at" />
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
              <h2 className="me-display me-d2" style={{ maxWidth: '17ch' }}>
                The hero is labelled like every other number on this site.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="me-lede">
                A terrain you cannot audit is decoration. So here is exactly which parts of that
                scene are measured, which are interpolated, and what it would take to make the rest
                real.
              </p>
            </Reveal>
          </div>

          <Reveal delay={110}>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {LAYERS.map((l) => (
                <div key={l.tag}>
                  <p
                    className="me-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: l.accent ? 'var(--laterite)' : 'var(--faint)',
                      marginBottom: 14,
                    }}
                  >
                    {l.tag}
                  </p>
                  <h3 className="me-h" style={{ fontSize: 17, marginBottom: 10 }}>
                    {l.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.62, color: 'var(--muted)' }}>
                    {l.body}
                  </p>
                </div>
              ))}
            </div>
            <Caption>
              Vertical exaggeration ×14 throughout, because 900 m of relief across 440 km is
              invisible at true scale. Stated here rather than hidden.
            </Caption>
          </Reveal>
        </div>
      </section>

      {/* ---- 02 · why a real basin changes the room ---- */}
      <section className="me-band" style={{ background: 'var(--bg-2)' }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="02" label="Why a real basin changes the room" />
          </Reveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'clamp(2rem, 5vw, 4.5rem)',
              alignItems: 'start',
            }}
          >
            <Reveal>
              <h2 className="me-display me-d2" style={{ maxWidth: '16ch', marginBottom: '1.5rem' }}>
                A generic valley is a screensaver. Your valley is evidence.
              </h2>
              <p className="me-body" style={{ marginBottom: '1.1rem' }}>
                Every flood platform demo opens with terrain. Almost all of it is invented, and
                everyone in the room knows it, so the visual carries no weight at all. It is treated
                as wallpaper and skipped.
              </p>
              <p className="me-body">
                The moment the terrain is the actual basin, the hero stops being decoration and
                starts doing the same job as the replay: it is a claim that can be checked. An
                officer can look at where we put Cuttack and tell us if we are wrong.
              </p>
            </Reveal>

            <Reveal delay={90}>
              {/* footage sits framed inside the section, not bled across it */}
              <VideoFrame
                src720="/videos/basin-hero-720.mp4"
                src1080="/videos/basin-hero-1080.mp4"
                poster="/posters/basin-hero.jpg"
                label="Mahanadi reach · pre-render"
                note="Vertical ×14"
                caption="The same reach the flythrough above renders live in WebGL, captured as footage for devices without it."
              />
            </Reveal>
          </div>

          <Reveal delay={130}>
            <div
              className="me-hairgrid"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', marginTop: 'clamp(2.5rem, 5vw, 4rem)' }}
            >
              {DENSITY.map(([v, k]) => (
                <div key={k}>
                  <p className="me-num" style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)' }}>
                    <Num value={v} />
                  </p>
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--muted)' }}>{k}</p>
                </div>
              ))}
            </div>
            <Caption>Measurement density, per scoring cycle. The whole company, in one count.</Caption>
          </Reveal>

          <Reveal delay={150}>
            <div style={{ marginTop: 'clamp(2rem, 4vw, 3rem)' }}>
              <MotionScene
                scene="density"
                duration={11}
                label="Measurement density, per scoring cycle"
                note="The whole company, in one count"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 03 · what runs on that ground ---- */}
      <section className="me-band" style={{ background: 'var(--bg)', paddingBottom: 0 }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="03" label="What runs on that ground" />
          </Reveal>
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '18ch', marginBottom: '1.25rem' }}>
              Five cities, every thirty minutes, wet or dry.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede" style={{ marginBottom: '1rem' }}>
              A rule engine an engineer wrote and a district can argue with. Rainfall against each
              location&rsquo;s own thirty-year threshold, yesterday&rsquo;s rain that stops decaying
              during an active flood, and a river term that only counts when the gauge is genuinely
              live.
            </p>
          </Reveal>
        </div>
      </section>

      <Ledger />

      {/* ---- 04 · the position ---- */}
      <section className="me-band" style={{ background: 'var(--bg-2)' }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="04" label="The position, August 2026" />
          </Reveal>
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '20ch', marginBottom: '1.5rem' }}>
              The trust gate is not passed, and the hero does not pretend otherwise.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede" style={{ marginBottom: '2.5rem' }}>
              The flood engine alerts on five cities. The ML model runs beside it in shadow and
              cannot alter a user-facing score. Heat has no live mode in the code at all. There is no
              signed MoU and no paying customer.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
              {(
                [
                  ['live', 'In production, driving user-facing alerts.'],
                  ['backtest', 'Measured on history. Never quoted as live accuracy.'],
                  ['shadow', 'Computed and published, structurally unable to alert.'],
                  ['miss', 'The engine was wrong, and here is the write-up.'],
                ] as const
              ).map(([k, meaning]) => (
                <div key={k}>
                  <div style={{ marginBottom: 12 }}>
                    <Chip kind={k} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--text)' }}>
                    {meaning}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={130}>
            <p className="me-body" style={{ marginTop: '2rem' }}>
              Every claim on this site carries one of those labels.{' '}
              <Link href="/research" className="me-link">
                Read the evidence
              </Link>{' '}
              before you believe the thesis, including the numbers that went against us.
            </p>
          </Reveal>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
