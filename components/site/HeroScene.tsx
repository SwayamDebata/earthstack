'use client';

import type { ReactNode } from 'react';
import DotField from './DotField';
import { Chip, type ChipKind } from './primitives';
import { SCENES, SCENE_ASPECT, type SceneName } from './scenes';

/* The animated page head: hand-drawn scene art, a MEDots particle layer over
   it, a scrim so the type stays readable, and the page copy on top. Always
   dark, because the scenes are dusk and night, regardless of the active theme. */

type Dots = {
  mode: 'field' | 'rain' | 'heat' | 'ripple' | 'flow' | 'scatter';
  accent?: string;
  water?: string;
  base?: string;
  max?: number;
};


/* The scenes are stored without a preserveAspectRatio so each usage can choose:
   a hero fills its band (slice, art is background), a banner shows the whole
   drawing (meet, because the heading is inside the artwork). */
function fitted(svg: string, mode: 'slice' | 'meet') {
  return svg.replace('<svg ', `<svg preserveAspectRatio="xMidYMid ${mode}" `);
}

export default function HeroScene({
  scene,
  dots,
  scrim = '8,10,12',
  height = 'clamp(440px, 39vw, 600px)',
  children,
  note,
}: {
  scene: SceneName;
  /* krishi's hero carries no particle layer in the prototype */
  dots?: Dots;
  /* each scene has its own scrim tint, matched to its sky */
  scrim?: string;
  height?: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <section
      className="me-on-dark me-hero-scene"
      style={{ position: 'relative', minHeight: height, overflow: 'hidden', background: '#0A0B08' }}
    >
      {/* scene art */}
      <div
        className="me-scene-art"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: fitted(SCENES[scene], 'slice') }}
      />

      {/* particle layer */}
      {dots && (
        <div className="me-scene-dots" aria-hidden="true">
          <DotField
            mode={dots.mode}
            accent={dots.accent}
            water={dots.water}
            base={dots.base}
            max={dots.max}
            height="100%"
          />
        </div>
      )}

      {/* scrim: keeps the left-hand copy legible over the art */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, rgba(${scrim},.94) 0%, rgba(${scrim},.72) 38%, rgba(${scrim},0) 66%)`,
        }}
      />

      <div
        className="me-wrap"
        style={{
          position: 'relative',
          minHeight: height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: 'clamp(6rem, 10vw, 8rem)',
          paddingBottom: 'clamp(2.5rem, 5vw, 3.5rem)',
        }}
      >
        <div style={{ maxWidth: 620 }}>{children}</div>
      </div>

      {note && <p className="me-scene-note">{note}</p>}
    </section>
  );
}

/* The copy block that sits on the scene: eyebrow, status chip, title, lede. */
export function SceneHead({
  eyebrow,
  kind,
  kindText,
  title,
  lede,
}: {
  eyebrow: string;
  kind?: ChipKind;
  kindText?: string;
  title: string;
  lede: string;
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <span className="me-eyebrow" style={{ color: '#E0A05A' }}>
          {eyebrow}
        </span>
        {kind && <Chip kind={kind}>{kindText}</Chip>}
      </div>
      <h1
        className="me-display"
        style={{ color: '#EDE9DE', fontSize: 'clamp(2.5rem, 6vw, 4.6rem)', marginBottom: 20 }}
      >
        {title}
      </h1>
      <p className="me-lede" style={{ color: 'rgba(237,233,222,.8)', maxWidth: '52ch' }}>
        {lede}
      </p>
    </>
  );
}

/* A full-width scene banner used where the page opens on a diagram rather than
   a dusk scene: thesis, research, about. Particle layer optional. */
export function SceneBanner({
  scene,
  dots,
  note,
}: {
  scene: SceneName;
  dots?: Dots;
  note?: string;
}) {
  // Banners carry their own headings inside the artwork, so the figure takes
  // the scene's real aspect and the SVG is fitted, never cropped.
  return (
    <figure
      className="me-hero-scene me-on-dark me-scene-fit"
      style={{
        position: 'relative',
        margin: 0,
        aspectRatio: SCENE_ASPECT[scene],
        overflow: 'hidden',
        background: '#0A0B08',
      }}
    >
      <div className="me-scene-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: fitted(SCENES[scene], 'meet') }} />
      {dots && (
        <div className="me-scene-dots" aria-hidden="true">
          <DotField
            mode={dots.mode}
            accent={dots.accent}
            water={dots.water}
            base={dots.base}
            max={dots.max}
            height="100%"
          />
        </div>
      )}
      {note && (
        <figcaption
          className="me-label"
          style={{
            position: 'absolute',
            left: 'clamp(1.25rem, 4vw, 4.5rem)',
            bottom: 'clamp(0.75rem, 2vw, 1.25rem)',
            zIndex: 3,
            color: 'rgba(237,233,222,.5)',
            maxWidth: '70ch',
          }}
        >
          {note}
        </figcaption>
      )}
    </figure>
  );
}

/* A light-ground diagram from the Delta prototype. Those scenes are drawn with
   a hardcoded warm-paper palette, so like the MEMotion panels they keep their
   own background in every theme rather than half-matching it. */
export function SceneFigure({
  scene,
  caption,
  maxWidth = 1100,
}: {
  scene: SceneName;
  caption?: string;
  maxWidth?: number;
}) {
  return (
    <figure className="me-scene-figure" style={{ maxWidth, marginInline: 'auto' }}>
      <div
        className="me-scene-art"
        style={{ position: 'relative', aspectRatio: SCENE_ASPECT[scene] }}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: fitted(SCENES[scene], 'meet') }}
      />
      {caption && (
        <figcaption className="me-label" style={{ marginTop: '0.9rem', lineHeight: 1.7 }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* A body diagram from the prototype: the rule engine, the QC gates, the chain
   that broke in 1999. Drawn against the dark palette, so like the MEMotion
   panels the ground stays dark in every theme instead of half-matching it. */
export function DiagramPanel({
  scene,
  label,
  note,
  caption,
  maxWidth,
}: {
  scene: SceneName;
  label?: string;
  note?: string;
  caption?: string;
  maxWidth?: number;
}) {
  return (
    <figure className="me-diagram" style={maxWidth ? { maxWidth, marginInline: 'auto' } : undefined}>
      {(label || note) && (
        <div className="me-diagram-bar">
          {label && <span className="me-label">{label}</span>}
          {note && <span className="me-label me-diagram-note">{note}</span>}
        </div>
      )}
      <div
        className="me-scene-art"
        style={{ position: 'relative', aspectRatio: SCENE_ASPECT[scene] }}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: fitted(SCENES[scene], 'meet') }}
      />
      {caption && (
        <figcaption className="me-label me-diagram-cap">{caption}</figcaption>
      )}
    </figure>
  );
}
