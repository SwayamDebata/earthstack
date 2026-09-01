'use client';

import MotionScene from '@/components/site/MotionScene';
import Link from 'next/link';
import HeroScene, { SceneHead, DiagramPanel } from '@/components/site/HeroScene';
import { Caption, Chip, Reveal, SectionHead } from '@/components/site/primitives';

const STATS: { v: string; unit?: string; k: string; kind?: 'live' | 'backtest' }[] = [
  { v: '5', k: 'cities alerting: Bhubaneswar, Cuttack, Puri, Sambalpur, Rourkela', kind: 'live' },
  { v: '30', unit: 'min', k: 'scoring cycle, every day of the year, wet or dry', kind: 'live' },
  { v: 'v2.3', k: 'rule engine in production, with the active-flood hold' },
  { v: '48', unit: 'h', k: 'lead on all six onsets in the Aug 2026 replay', kind: 'backtest' },
];

const CITIES = [
  { n: 'Cuttack', band: 'HIGH', s: '0.71', note: 'Mahanadi lower · rising', tone: 'high' },
  { n: 'Bhubaneswar', band: 'MEDIUM', s: '0.48', note: 'Mahanadi lower · no CWC station', tone: 'med' },
  { n: 'Sambalpur', band: 'LOW', s: '0.22', note: 'Mahanadi upper · Jamadarpali 181.68 m', tone: 'low' },
  { n: 'Puri', band: 'LOW', s: '0.19', note: 'Coast · Nimapara unavailable', tone: 'low' },
  { n: 'Rourkela', band: 'LOW', s: '0.14', note: 'Brahmani · Pamposh unavailable', tone: 'low' },
];

const TONE = { high: 'var(--accent)', med: '#b8791f', low: 'var(--water)' } as const;

const TERMS: [string, string][] = [
  ['Rain 6 h', '78 mm'],
  ['p95 baseline', '41 mm'],
  ['Antecedent', '3 wet d'],
  ['Forecast 24 h', '46 mm'],
];

const LEAD: [string, string, boolean][] = [
  ['72 h', '1 / 6', false],
  ['48 h', '6 / 6', true],
  ['24 h', '4 / 6', false],
];

const NOTS = [
  ['It is not district-scale coverage.', 'It is five cities.'],
  ['It is not a live ML system.', 'The model is logged and cannot move a user-facing score.'],
  ['It is not validated against a passed trust gate.', 'The gate is open.'],
  ['It does not replace IMD, CWC or OSDMA.', 'It is advisory, and it says so on every screen.'],
];

export default function FloodPage() {
  return (
    <>
      <HeroScene
        scene="flood"
        dots={{ mode: 'rain', water: '#4FA89C', max: 1500 }}
        scrim="8,10,12"
        note="Sample values throughout. Advisory only. Does not override IMD, CWC or OSDMA."
      >
        <SceneHead
          eyebrow="Product 01"
          kind={'live'}
          title="Flood Ops"
          lede="The War Room. Five Odisha cities scored every thirty minutes, with the reasoning attached to every number."
        />
      </HeroScene>


      <section style={{ background: 'var(--bg)', paddingBlock: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
        <div className="me-wrap">
          <Reveal>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))' }}>
              {STATS.map((s) => (
                <div key={s.k} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span className="me-num" style={{ fontSize: 'clamp(1.9rem, 3vw, 2.4rem)' }}>{s.v}</span>
                    {s.unit && <span className="me-mono" style={{ fontSize: 13, color: 'var(--muted)' }}>{s.unit}</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--muted)', flex: 1 }}>{s.k}</p>
                  {s.kind && <div><Chip kind={s.kind} /></div>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 01 · how a score is made ---- */}
      <section className="me-band" style={{ background: 'var(--bg-2)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="01" label="How a score is made" /></Reveal>
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '16ch', marginBottom: '1.25rem' }}>
              Four terms, and a gate.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede" style={{ marginBottom: '2.5rem' }}>
              Every term is a rule an engineer wrote and a district can argue with, which is the
              point, because an officer has to defend the call the next morning.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
              {TERMS.map(([k, v]) => (
                <div key={k}>
                  <p className="me-label" style={{ marginBottom: 10 }}>{k}</p>
                  <p className="me-num" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 1.9rem)' }}>{v}</p>
                </div>
              ))}
            </div>
            <Caption>One cycle, assembled term by term.</Caption>
          </Reveal>

          <Reveal delay={120}>
            <div style={{ marginTop: '2rem' }}>
              <MotionScene
                scene="score"
                duration={13}
                label="One cycle, assembled term by term"
              />
            </div>
          </Reveal>

          <Reveal delay={125}>
            <div style={{ marginTop: '2rem' }}>
              <DiagramPanel
                scene="floodRuleEngine"
              />
            </div>
          </Reveal>

          <Reveal delay={130}>
            <div className="me-panel" style={{ marginTop: '2rem', borderLeft: '2px solid var(--accent)', background: 'var(--bg)' }}>
              <p className="me-body" style={{ maxWidth: 'none' }}>
                And the gate: river level only reaches the risk path when the station is marked{' '}
                <code className="me-mono" style={{ fontSize: '0.9em', padding: '0.15em 0.4em', background: 'var(--surface-2)', color: 'var(--ink)' }}>
                  status == live
                </code>
                . Otherwise the briefing says the read is rainfall-only, out loud, and the score is
                capped accordingly.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 02 · the war room ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="02" label="The War Room" /></Reveal>
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '18ch', marginBottom: '1.25rem' }}>
              Built for 3 a.m., not for a screenshot.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede" style={{ marginBottom: '2.5rem' }}>
              Cities ranked by severity, evidence open by default, and one suggested action per city.
              Small enough to read at three, complete enough to defend at nine.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="me-panel" style={{ padding: 0, background: 'var(--surface)' }}>
              {/* chrome */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '0.9rem 1.1rem', borderBottom: '1px solid var(--line)' }}>
                <span className="me-label" style={{ color: 'var(--ink)' }}>Flood Ops · War Room</span>
                <span className="me-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>19 Aug 2026 · 04:12 IST</span>
                <span className="me-mono" style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>next cycle 00:18</span>
                <Chip kind="live" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: 'var(--line)' }}>
                {/* ranked list */}
                <div style={{ background: 'var(--surface)', padding: '1.1rem' }}>
                  <p className="me-label" style={{ marginBottom: 14 }}>Ranked by severity</p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {CITIES.map((c) => (
                      <li key={c.n} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--line)' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{c.n}</span>
                          <span className="me-mono" style={{ fontSize: 12.5, color: TONE[c.tone as keyof typeof TONE] }}>
                            {c.band} · {c.s}
                          </span>
                        </div>
                        <p className="me-mono" style={{ margin: '5px 0 0', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)' }}>
                          {c.note}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* evidence mode */}
                <div style={{ background: 'var(--surface)', padding: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                    <p className="me-label" style={{ margin: 0 }}>Evidence mode · Cuttack</p>
                    <span className="me-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>rule_score 0.71 · v2.3</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', marginBottom: '1.1rem' }}>
                    {TERMS.map(([k, v]) => (
                      <div key={k} style={{ background: 'var(--surface)', padding: '0.7rem 0.75rem' }}>
                        <p className="me-label" style={{ marginBottom: 5, fontSize: 9 }}>{k}</p>
                        <p className="me-num" style={{ fontSize: 17 }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    {[
                      ['River', 'Kishan Nagar 34.6% out of range · not counted · n/a'],
                      ['Closest past event', 'Nearest match in 653 labelled INDOFLOODS events, with what the following 48 hours did.'],
                      ['Suggested action', 'Pre-position at Naraj. Alert wards 4 to 9. Rainfall-only read, so treat river state as unknown.'],
                    ].map(([t, d]) => (
                      <div key={t}>
                        <dt className="me-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 5 }}>{t}</dt>
                        <dd style={{ margin: 0, fontSize: 13.5, lineHeight: 1.58, color: 'var(--text)' }}>{d}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>

            <p className="me-body" style={{ marginTop: '1.25rem' }}>
              The running surface is{' '}
              <Link href="/dashboard" className="me-link">
                Mission Control
              </Link>
              , which carries the same evidence view against live data.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- 03 · what it caught, and what it did not ---- */}
      <section className="me-band" style={{ background: 'var(--bg-2)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="03" label="What it caught, and what it did not" /></Reveal>

          <Reveal>
            <p className="me-label" style={{ marginBottom: 18 }}>
              Location onsets caught, by lead time · Aug 2026 north Odisha
            </p>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              {LEAD.map(([h, r, good]) => (
                <div key={h}>
                  <p className="me-label" style={{ marginBottom: 10 }}>{h}</p>
                  <p className="me-num" style={{ fontSize: 'clamp(1.8rem, 2.8vw, 2.3rem)', color: good ? 'var(--ink)' : 'var(--muted)' }}>
                    {r}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}><Chip kind="backtest" /></div>
            <Caption>
              At seventy-two hours the engine caught one of six, so seventy-two hours does not appear
              anywhere on this site.
            </Caption>
          </Reveal>

          <Reveal delay={110}>
            <div className="me-panel" style={{ marginTop: 'clamp(2.5rem, 5vw, 3.5rem)', background: 'var(--bg)', borderLeft: '2px solid var(--accent)' }}>
              <div style={{ marginBottom: 16 }}><Chip kind="miss" /></div>
              <h3 className="me-display me-d3" style={{ marginBottom: 16 }}>
                The recession failure: 14 of 18 location-days scored LOW while 13.44 lakh people were
                still displaced.
              </h3>
              <p className="me-body" style={{ maxWidth: 'none', marginBottom: '1rem' }}>
                The rain had stopped; the water had not. The engine scores rainfall, not flood state,
                and the active-flood hold we built for exactly this keys off river level, which made
                it dead code for ungauged locations.
              </p>
              <p className="me-body" style={{ maxWidth: 'none' }}>
                This is the single largest known gap in the system, and it is the reason real river
                telemetry is now in production.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 04 · where it alerts ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="04" label="Where it alerts, and where it only watches" /></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 5vw, 4.5rem)', alignItems: 'start' }}>
            <Reveal>
              <h2 className="me-display me-d2" style={{ maxWidth: '15ch', marginBottom: '1.25rem' }}>
                Five is a decision, not a limit.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="me-body" style={{ marginBottom: '1.1rem' }}>
                Expanding the alert map is the easiest way to look bigger and the fastest way to page
                a district officer about a location we have never validated. New geography goes to
                shadow first, every time.
              </p>
              <p className="me-body">
                Jajpur and Bhadrak are scored and logged with a shadow badge. They are not public
                alerts and they are not traction. The gate that opens them is the trust gate, and it
                is not passed.
              </p>
            </Reveal>
          </div>

          <Reveal delay={110}>
            <div style={{ marginTop: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
              <DiagramPanel
                scene="floodAlertMap"
                maxWidth={860}
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div style={{ marginTop: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
              <p className="me-label" style={{ marginBottom: 8 }}>D001 · recorded decision</p>
              <h3 className="me-h" style={{ fontSize: 'clamp(1.15rem, 1.8vw, 1.45rem)', marginBottom: 18 }}>
                What Flood Ops is not.
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid var(--line)' }}>
                {NOTS.map(([a, b]) => (
                  <li key={a} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem 2rem', padding: '1rem 0', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{a}</span>
                    <span style={{ fontSize: 14, color: 'var(--muted)' }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}
