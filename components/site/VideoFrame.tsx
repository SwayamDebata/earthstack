'use client';

import { useEffect, useRef } from 'react';
import { Chip, type ChipKind } from './primitives';

/* A contained, framed video. Deliberately not full-bleed: footage sits inside
   a section the way a plate sits in a report, with its own label and caption. */

export default function VideoFrame({
  src720,
  src1080,
  poster,
  label,
  note,
  caption,
  kind,
  ratio = '16 / 9',
}: {
  src720: string;
  src1080?: string;
  poster: string;
  label: string;
  note?: string;
  caption?: string;
  kind?: ChipKind;
  ratio?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Only decode while it is actually on screen.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <figure className="me-media">
      <div className="me-media-inner" style={{ aspectRatio: ratio }}>
        <video ref={ref} poster={poster} muted loop playsInline preload="none">
          {src1080 && <source src={src1080} media="(min-width: 900px)" type="video/mp4" />}
          <source src={src720} type="video/mp4" />
        </video>
      </div>
      <div className="me-media-bar">
        <span className="me-label">{label}</span>
        {kind ? <Chip kind={kind} /> : note ? <span className="me-label">{note}</span> : null}
      </div>
      {caption && (
        <figcaption
          className="me-label"
          style={{ letterSpacing: '0.1em', lineHeight: 1.7, padding: '0 0.25rem 0.25rem' }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
