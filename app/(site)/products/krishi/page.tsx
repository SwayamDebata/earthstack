'use client';

import MotionScene from '@/components/site/MotionScene';
import HeroScene, { SceneHead, DiagramPanel } from '@/components/site/HeroScene';
import { CallToAction } from '@/components/site/Closing';
import { Caption, Chip, Reveal, SectionHead } from '@/components/site/primitives';

const OFFICER = [
  'Ranked cities, severity bands, rule_score to two decimals',
  'Evidence Mode with every term and its source',
  'Closest past event out of 653 labelled',
  'A replay they can rerun themselves',
  'Read on a desktop, at a desk, under pressure',
];

const HOUSEHOLD = [
  'One verdict, in the language spoken at home',
  'Read aloud, because reading is not assumed',
  'One thing a household can actually do about it',
  'Shareable into a WhatsApp group in one tap',
  'Read on a phone, in a field, in daylight',
];

const LANGS = [
  { native: 'ଓଡ଼ିଆ', name: 'Odia', mode: 'text + voice' },
  { native: 'हिन्दी', name: 'Hindi', mode: 'text + voice' },
  { native: 'বাংলা', name: 'Bengali', mode: 'text + voice' },
  { native: 'తెలుగు', name: 'Telugu', mode: 'text + voice' },
  { native: 'Sadri', name: 'Sadri', mode: 'voice only, by design' },
  { native: 'English', name: 'English', mode: 'admin and officer view' },
];

const STANDS: [string, string][] = [
  ['Live weather and risk from the production API', 'Yes'],
  ['Six-language delivery, voice included', 'Yes'],
  ['Agentic orchestration behind the advice', 'Yes'],
  ['Sensor card inside the app', 'Demo mode'],
  ['WhatsApp delivery', 'Twilio sandbox'],
  ['Farmers enrolled through a district programme', 'Not yet'],
];

export default function KrishiPage() {
  return (
    <>
      <HeroScene
        scene="krishi"
        scrim="8,11,6"
        note="Screens are design mockups with sample values. WhatsApp runs on a Twilio sandbox. Advisory only."
      >
        <SceneHead
          eyebrow="Product 03"
          kind={'live'}
          kindText='Live MVP'
          title="KrishiOS"
          lede="The same engine, spoken aloud. Voice-first risk for farmers, in six languages, on the phone they already have."
        />
      </HeroScene>


      {/* ---- officer vs household ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '18ch', marginBottom: '1.25rem' }}>
              The officer needs a dossier. The farmer needs a sentence.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede" style={{ marginBottom: '2.5rem' }}>
              Same engine underneath. Completely different surface, because pretending both audiences
              need the same interface is how early-warning products fail.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              {[
                { t: 'Flood Ops · the officer', rows: OFFICER, accent: false },
                { t: 'KrishiOS · the household', rows: HOUSEHOLD, accent: true },
              ].map((col) => (
                <div key={col.t} className="me-panel" style={{ background: col.accent ? 'var(--surface)' : 'transparent', borderStyle: col.accent ? 'solid' : 'dashed' }}>
                  <p className="me-label" style={{ marginBottom: '1.25rem', color: col.accent ? 'var(--laterite)' : 'var(--faint)' }}>
                    {col.t}
                  </p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {col.rows.map((r) => (
                      <li key={r} style={{ padding: '0.7rem 0', borderBottom: '1px solid var(--line)', fontSize: 14.5, lineHeight: 1.5, color: 'var(--text)' }}>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Caption>Never a number on its own. A number without an action is just anxiety.</Caption>
          </Reveal>

          <Reveal delay={130}>
            <div style={{ marginTop: '2rem' }}>
              <MotionScene
                scene="sentence"
                duration={12}
                label="The same score, spoken two ways"
                note="Sample values · Odia shown"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 01 · in the hand ---- */}
      <section className="me-band" style={{ background: 'var(--bg-2)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="01" label="What it looks like in the hand" /></Reveal>

          <Reveal delay={80}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              {/* today's advice */}
              <div className="me-panel" style={{ background: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 18 }}>
                  <span className="me-label">KrishiOS</span>
                  <span className="me-label" style={{ color: 'var(--laterite)' }}>Odia</span>
                </div>
                <p className="me-label" style={{ marginBottom: 10 }}>01 · today&rsquo;s verdict</p>
                <p style={{ margin: '0 0 8px', fontSize: 20, lineHeight: 1.5, color: 'var(--ink)' }}>
                  ଆଜି ବିପଦ କମ୍‌। ଧାନ କାଟିବା ନିରାପଦ।
                </p>
                <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--muted)' }}>
                  Low risk today. Safe to harvest.
                </p>
                <span className="me-label" style={{ color: 'var(--laterite)' }}>▶ Tap to hear</span>
              </div>

              {/* flood shield */}
              <div className="me-panel" style={{ background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                  <span className="me-label">02 · flood shield</span>
                  <span className="me-mono" style={{ fontSize: 12, color: 'var(--laterite)', fontWeight: 500 }}>HIGH · 48 hours</span>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 18, lineHeight: 1.5, color: 'var(--ink)' }}>
                  ଦୁଇ ଦିନ ଭିତରେ ପାଣି ବଢ଼ିପାରେ।
                </p>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--muted)' }}>
                  Water may rise within two days.
                </p>
                <p className="me-label" style={{ marginBottom: 10 }}>What to do</p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {['Move stored grain above waist height', 'Move livestock to the road embankment', 'Charge the phone tonight'].map((a) => (
                    <li key={a} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--line)', fontSize: 14, color: 'var(--text)' }}>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* shared onward */}
              <div className="me-panel" style={{ background: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 18 }}>
                  <span className="me-label">03 · shared onward</span>
                  <span className="me-label">WhatsApp · sandbox</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { who: 'ModelEarth', t: 'ଆଜି ରାତିରେ ପାଣି ବଢ଼ିବ। ସାବଧାନ ରୁହନ୍ତୁ।', me: true },
                    { who: '', t: 'ଧନ୍ୟବାଦ। ଗାଈ ନେଇଗଲି।', me: false },
                    { who: '', t: 'ଆମ ଗାଁରେ ମଧ୍ୟ ପାଣି।', me: false },
                  ].map((m, i) => (
                    <div key={i} style={{ alignSelf: m.me ? 'flex-start' : 'flex-end', maxWidth: '90%', background: m.me ? 'color-mix(in srgb, var(--laterite) 12%, transparent)' : 'var(--surface-2)', padding: '0.6rem 0.8rem', fontSize: 14, lineHeight: 1.5, color: 'var(--ink)' }}>
                      {m.who && <span className="me-label" style={{ display: 'block', marginBottom: 4 }}>{m.who}</span>}
                      {m.t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Caption>
              Screens are design mockups with sample values. Odia shown. WhatsApp delivery runs on a
              Twilio sandbox and reaches nobody until a recipient joins it.
            </Caption>
          </Reveal>
        </div>
      </section>

      {/* ---- 02 · localised first ---- */}
      <section className="me-band" style={{ background: 'var(--bg)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="02" label="Localised first, not Odia only" /></Reveal>
          <Reveal>
            <h2 className="me-display me-d2" style={{ maxWidth: '20ch', marginBottom: '1.25rem' }}>
              Six languages, because a warning in the wrong one is not a warning.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="me-lede" style={{ marginBottom: '2.5rem' }}>
              Odia is the anchor, not the ceiling. Migrant labour, tribal belts and cross-border
              basins mean a single-language product would miss the households most exposed and least
              served. Sadri is voice-only on purpose. Text would not reach the people who speak it.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="me-hairgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              {LANGS.map((l) => (
                <div key={l.name}>
                  <p style={{ margin: '0 0 8px', fontSize: 22, color: 'var(--ink)' }}>{l.native}</p>
                  <p className="me-label">{l.name} · {l.mode}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="me-band" style={{ background: 'var(--bg)', paddingTop: 0 }}>
        <div className="me-wrap">
          <Reveal>
            <DiagramPanel
              scene="krishiTwoMouths"
            />
          </Reveal>
        </div>
      </section>

      {/* ---- 03 · where it stands ---- */}
      <section className="me-band" style={{ background: 'var(--bg-2)' }}>
        <div className="me-wrap">
          <Reveal><SectionHead index="03" label="Where KrishiOS actually stands" /></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 5vw, 4.5rem)', alignItems: 'start' }}>
            <Reveal>
              <dl style={{ margin: 0 }}>
                {STANDS.map(([k, v]) => (
                  <div key={k} className="me-kv">
                    <dt style={{ fontSize: 14.5, color: 'var(--text)' }}>{k}</dt>
                    <dd className="me-mono" style={{ margin: 0, fontSize: 12.5, color: v === 'Yes' ? 'var(--green)' : v === 'Not yet' ? 'var(--laterite)' : 'var(--muted)' }}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={90}>
              <div style={{ marginBottom: 16 }}><Chip kind="live">Live MVP</Chip></div>
              <h3 className="me-display me-d3" style={{ marginBottom: 16 }}>
                A live MVP, not a deployed network.
              </h3>
              <p className="me-body" style={{ marginBottom: '1.1rem' }}>
                The app works and the engine behind it is the production one. What does not exist yet
                is distribution: no district programme has enrolled farmers, and WhatsApp will not
                reach anyone until a recipient joins the sandbox.
              </p>
              <p className="me-body">
                That is a partnerships problem, not an engineering one, and it is why the first
                pre-seed hire after an ML engineer is a partnerships lead.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
