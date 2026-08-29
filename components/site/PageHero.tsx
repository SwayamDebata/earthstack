'use client';

import type { ReactNode } from 'react';
import { Chip, Reveal, type ChipKind } from './primitives';

/* Masthead for every page except home, which opens on the flythrough instead. */
export default function PageHero({
  eyebrow,
  kind,
  kindText,
  title,
  lede,
  note,
  aside,
}: {
  eyebrow: string;
  kind?: ChipKind;
  kindText?: string;
  title: string;
  lede: string;
  note?: string;
  aside?: ReactNode;
}) {
  return (
    <header
      style={{
        background: 'var(--bg)',
        paddingTop: 'clamp(7rem, 12vw, 10rem)',
        paddingBottom: 'clamp(2.5rem, 5vw, 4rem)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div className="me-wrap">
        <Reveal>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}
          >
            <span className="me-eyebrow">{eyebrow}</span>
            {kind && <Chip kind={kind}>{kindText}</Chip>}
          </div>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: aside ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
            gap: 'clamp(2rem, 5vw, 4.5rem)',
            alignItems: 'end',
          }}
        >
          <Reveal delay={60}>
            <h1 className="me-display me-d1" style={{ maxWidth: '15ch', marginBottom: '1.5rem' }}>
              {title}
            </h1>
            <p className="me-lede">{lede}</p>
            {note && (
              <p className="me-label" style={{ marginTop: '1.5rem', lineHeight: 1.8, maxWidth: '80ch' }}>
                {note}
              </p>
            )}
          </Reveal>
          {aside && <Reveal delay={120}>{aside}</Reveal>}
        </div>
      </div>
    </header>
  );
}
