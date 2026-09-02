'use client';

import { BrandLockup, Reveal } from './primitives';

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
    body: 'Pre-seed, 75 lakh rupees. The deck is fifteen slides and every claim on it has an evidence table entry.',
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
            style={{ color: 'var(--accent)', marginBottom: 22 }}
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
              href="mailto:swayam@modelearth.in?subject=Replay%20request"
              className="me-btn"
              style={{
                border: '1px solid color-mix(in srgb, var(--inverse-ink) 34%, transparent)',
                color: 'var(--inverse-ink)',
              }}
            >
              Request a replay
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
              Flood early warning and operational command for districts, built where the data is
              thin.
            </p>
          </div>

          <div>
            <p className="me-label" style={{ marginBottom: 14 }}>
              Direct
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
              {[
                ['swayam@modelearth.in', 'mailto:swayam@modelearth.in'],
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
                ['Mission Control', '/dashboard'],
                ['Flood Ops', '/products/flood'],
                ['Heat Ops', '/products/heat'],
                ['Evidence', '/research#evidence'],
                ['Blog', '/blog'],
                ['Journey', '/journey'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="me-link" style={{ fontSize: 13.5 }}>
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
