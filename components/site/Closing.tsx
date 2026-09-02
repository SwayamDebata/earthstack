'use client';

import { BrandLockup, Reveal } from './primitives';
import { FOUNDER_EMAIL, PILOT_EMAIL, SOCIAL } from './contact';
import { REPLAY_TOUR, SURFACES } from './surfaces';

const WAYS: { title: string; body: string }[] = [
  {
    title: 'District pilot',
    body: 'One district, one monsoon, and a standing invitation to tell us every time we were wrong.',
  },
  {
    title: 'Replay request',
    body: 'Name an event your district remembers. We run the unmodified engine on the forecast exactly as it was issued that week.',
  },
  {
    title: 'Investors',
    body: 'We are raising a pre-seed. The engine already runs in production. What it lacks is reach, so the raise buys an ML engineer and a partnerships lead.',
  },
];

const SOURCES =
  'INDOFLOODS (Kuntla & Saharia, BAMS 2025) · IFI (Saharia et al.) · NRSC · IMD · CWC / NWDP · DoWR Odisha · ERA5 · OpenWeather';

export function CallToAction() {
  return (
    <section
      id="contact"
      className="me-band"
      style={{
        background: 'var(--inverse-bg)',
        color: 'var(--inverse-ink)',
        position: 'relative',
      }}
    >
      <div className="me-wrap">
        <Reveal>
          <p
            className="me-eyebrow"
            style={{ color: 'var(--laterite)', marginBottom: 22 }}
          >
            The only metric that matters: one family, one more day
          </p>
          <h2
            className="me-display me-d1"
            style={{ color: 'var(--inverse-ink)', maxWidth: '15ch', marginBottom: 24 }}
          >
            Name a flood. We will fly it and replay it.
          </h2>
          <p
            className="me-lede"
            style={{
              color: 'color-mix(in srgb, var(--inverse-ink) 76%, transparent)',
              maxWidth: '52ch',
              marginBottom: 36,
            }}
          >
            Pick an event your district remembers. We run the unmodified engine on the forecast as it
            was issued that week, over the ground it actually happened on, and you see exactly when
            it would have fired, or that it would not have.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: '4rem' }}>
            <a
              href="mailto:swayam@modelearth.in?subject=District%20pilot%20request"
              className="me-btn"
              style={{ background: 'var(--inverse-ink)', color: 'var(--inverse-bg)' }}
            >
              Request a district pilot
            </a>
            <a
              href={REPLAY_TOUR}
              className="me-btn"
              style={{
                border: '1px solid color-mix(in srgb, var(--inverse-ink) 34%, transparent)',
                color: 'var(--inverse-ink)',
              }}
            >
              Rewind a real flood
            </a>
          </div>
        </Reveal>

        <Reveal delay={110}>
          <div
            style={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              background: 'color-mix(in srgb, var(--inverse-ink) 16%, transparent)',
              border: '1px solid color-mix(in srgb, var(--inverse-ink) 16%, transparent)',
            }}
          >
            {WAYS.map((w) => (
              <div
                key={w.title}
                style={{ background: 'var(--inverse-bg)', padding: 'clamp(1.25rem, 2.4vw, 1.9rem)' }}
              >
                <p
                  style={{
                    margin: '0 0 10px',
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--inverse-ink)',
                  }}
                >
                  {w.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.62,
                    color: 'color-mix(in srgb, var(--inverse-ink) 64%, transparent)',
                  }}
                >
                  {w.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--line)',
        paddingBlock: 'clamp(3rem, 6vw, 4.5rem)',
      }}
    >
      <div className="me-wrap">
        <div
          style={{
            display: 'grid',
            // five columns now. At a 48px gap they need 5*170 + 4*48 = 1042 of
            // the 1096px grid, so 170 is the largest minimum that keeps them on
            // one row instead of orphaning the last column under the blurb.
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 'clamp(2rem, 4vw, 3.5rem)',
            alignItems: 'start',
            marginBottom: 'clamp(2.5rem, 5vw, 3.5rem)',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                marginBottom: 14,
                color: 'var(--ink)',
              }}
            >
              <BrandLockup markSize={22} />
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--muted)' }}>
              A planetary-scale climate resilience intelligence layer, built where the data is
              thin. One engine, several surfaces: flood is what runs in production today, with
              heat, crops and field sensing behind it.
            </p>
          </div>

          <div>
            <p className="me-label" style={{ marginBottom: 14 }}>
              Direct
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
              {[
                [FOUNDER_EMAIL, `mailto:${FOUNDER_EMAIL}`],
                [PILOT_EMAIL, `mailto:${PILOT_EMAIL}`],
                ['modelearth.in', 'https://modelearth.in'],
                ['api.modelearth.in', 'https://api.modelearth.in'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="me-link me-mono" style={{ fontSize: 13 }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="me-label" style={{ marginBottom: 14 }}>
              Product
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
              {[
                ['Flood Ops', '/products/flood'],
                ['Heat Ops', '/products/heat'],
                ['KrishiOS', '/products/krishi'],
                ['Bhoomi G1', '/products/bhoomi'],
                ['Evidence', '/research#evidence'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="me-link" style={{ fontSize: 13.5 }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="me-label" style={{ marginBottom: 14 }}>
              Live surfaces
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
              {SURFACES.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="me-link" style={{ fontSize: 13.5 }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="me-label" style={{ marginBottom: 14 }}>
              Follow
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
              {SOCIAL.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="me-link"
                    style={{ fontSize: 13.5 }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="me-rule" />

        <p
          className="me-label"
          style={{
            marginTop: '1.75rem',
            lineHeight: 1.85,
            letterSpacing: '0.08em',
            textTransform: 'none',
            maxWidth: '100ch',
          }}
        >
          Data: {SOURCES}. Derived risk product; no raw data resale. Advisory only. Does not override
          IMD, CWC or OSDMA warnings.
        </p>

        <p
          className="me-label"
          style={{ marginTop: '1.25rem', letterSpacing: '0.14em' }}
        >
          © 2026 ModelEarth · modelearth.in
        </p>
      </div>
    </footer>
  );
}
