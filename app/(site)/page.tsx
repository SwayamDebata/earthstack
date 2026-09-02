'use client';

import Link from 'next/link';
import HeroTerrain from '@/components/site/HeroTerrain';
import Ledger from '@/components/site/Ledger';
import VideoFrame from '@/components/site/VideoFrame';
import { CallToAction } from '@/components/site/Closing';
import { Chip, Reveal, SectionHead } from '@/components/site/primitives';

export default function HomePage() {
  return (
    <>
      <HeroTerrain />

      {/* ---- 01 · why a real basin changes the room ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="01" label="Why a real basin changes the room" />
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
              <VideoFrame
                src720="/videos/basin-hero-720.mp4"
                src1080="/videos/basin-hero-1080.mp4"
                poster="/posters/basin-hero.jpg"
                label="Mahanadi reach"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- 02 · what runs on that ground ---- */}
      <section className="me-band" style={{ background: 'var(--bg-2)', paddingBottom: 0 }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="02" label="What runs on that ground" />
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

      {/* ---- 03 · the position ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal>
            <SectionHead index="03" label="The position, August 2026" />
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
              <Link href="/research#evidence" className="me-link">
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
