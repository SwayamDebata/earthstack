'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BrandLockup, THEMES, useTheme, type Theme } from './primitives';

const TOP = [
  { href: '/', label: 'Home' },
  { href: '/thesis', label: 'Thesis' },
  { href: '/products/flood', label: 'Products', match: '/products' },
  { href: '/research', label: 'Research' },
  { href: '/story', label: 'Story' },
  { href: '/journey', label: 'Journey' },
  { href: '/about', label: 'About' },
];

const PRODUCTS = [
  { href: '/products/flood', label: 'Flood Ops' },
  { href: '/products/heat', label: 'Heat Ops' },
  { href: '/products/krishi', label: 'KrishiOS' },
  { href: '/products/bhoomi', label: 'Bhoomi G1' },
];

/* The swatch in each button is the actual page colour of that theme, so the
   control explains itself without a label. */
const SWATCH: Record<Theme, { bg: string; ring: string; title: string }> = {
  paper: { bg: '#f2f0e4', ring: '#c6c1a8', title: 'Paper, warm light' },
  white: { bg: '#ffffff', ring: '#d3d0c6', title: 'White, clean light' },
  void: { bg: '#0a0b08', ring: '#3a3d2f', title: 'Void, dark' },
};

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        border: '1px solid var(--line)',
        borderRadius: 999,
      }}
    >
      {THEMES.map((t) => {
        const on = theme === t;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={on}
            title={SWATCH[t].title}
            onClick={() => setTheme(t)}
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              cursor: 'pointer',
              background: SWATCH[t].bg,
              border: `1px solid ${on ? 'var(--laterite)' : SWATCH[t].ring}`,
              boxShadow: on ? '0 0 0 2px var(--bg), 0 0 0 3px var(--laterite)' : 'none',
              padding: 0,
              transition: 'box-shadow .18s ease, border-color .18s ease',
            }}
          >
            <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>
              {SWATCH[t].title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function SiteNav() {
  const pathname = usePathname() || '/';
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);

  const onProducts = pathname.startsWith('/products');
  // Only the home page opens on the dark flythrough; every other page starts
  // on the page background, so the bar is solid from the first pixel.
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // The home hero is a night reach, and its colours do not follow the theme,
  // so the bar over it takes fixed bone rather than a theme token.
  const overHero = isHome && !lifted;
  const solid = !overHero;
  const HERO_INK = '#ede9de';

  return (
    <header
      className={overHero ? 'me-on-dark' : undefined}
      style={{
        position: 'fixed',
        insetInline: 0,
        top: 0,
        zIndex: 60,
        borderBottom: `1px solid ${solid ? 'var(--line)' : 'transparent'}`,
        background: solid ? 'color-mix(in srgb, var(--bg) 90%, transparent)' : 'transparent',
        backdropFilter: solid ? 'blur(14px) saturate(1.2)' : 'none',
        transition: 'background .3s ease, border-color .3s ease',
        color: overHero ? HERO_INK : 'var(--ink)',
      }}
    >
      <nav
        className="me-wrap"
        style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'inherit', textDecoration: 'none', flex: '0 0 auto' }}
          aria-label="ModelEarth home"
        >
          <BrandLockup markSize={28} wordHeight={24} />
        </Link>

        <ul className="me-nav-links" style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: 2 }}>
          {TOP.map((l) => {
            const active = l.match ? pathname.startsWith(l.match) : pathname === l.href;
            return (
              <li key={l.label}>
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    display: 'block',
                    padding: '7px 12px',
                    borderRadius: 999,
                    fontSize: 13.5,
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: active ? (overHero ? '#0a0b08' : 'var(--bg)') : 'inherit',
                    background: active ? (overHero ? HERO_INK : 'var(--ink)') : 'transparent',
                    opacity: active ? 1 : 0.72,
                    transition: 'opacity .18s ease, background .18s ease',
                  }}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
          <div className="me-theme-switch">
            <ThemeSwitch />
          </div>
          <Link
            href="/dashboard"
            className="me-mcc"
            title="Mission Control: the live operational dashboard"
          >
            <span className="me-mcc-dot" aria-hidden="true" />
            Mission Control
          </Link>
          <Link
            href="/about#contact"
            className="me-btn me-btn-primary me-nav-cta"
            style={
              overHero
                ? { fontSize: 13.5, padding: '0.6em 1.15em', background: HERO_INK, color: '#0a0b08' }
                : { fontSize: 13.5, padding: '0.6em 1.15em' }
            }
          >
            Request a pilot
          </Link>
          <button
            type="button"
            className="me-nav-burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{
              display: 'none',
              width: 34,
              height: 34,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid currentColor',
              borderRadius: 999,
              color: 'inherit',
              cursor: 'pointer',
              opacity: 0.7,
            }}
          >
            <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true">
              {open ? (
                <path d="M1 1l12 8M13 1L1 9" stroke="currentColor" strokeWidth="1.4" />
              ) : (
                <path d="M0 1h14M0 5h14M0 9h14" stroke="currentColor" strokeWidth="1.4" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* products subbar, only while inside a product surface */}
      {onProducts && (
        <div
          className="me-subbar"
          style={{
            borderTop: '1px solid var(--line)',
            background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
            color: 'var(--ink)',
          }}
        >
          <div
            className="me-wrap"
            style={{ height: 42, display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}
          >
            <span className="me-label" style={{ flex: '0 0 auto' }}>
              Products
            </span>
            <div style={{ display: 'flex', gap: 4, flex: '1 1 auto' }}>
              {PRODUCTS.map((p) => {
                const active = pathname === p.href;
                return (
                  <Link
                    key={p.href}
                    href={p.href}
                    aria-current={active ? 'page' : undefined}
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                      letterSpacing: '0.04em',
                      padding: '6px 11px',
                      borderRadius: 4,
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      color: active ? 'var(--ink)' : 'var(--muted)',
                      background: active ? 'color-mix(in srgb, var(--laterite) 16%, transparent)' : 'transparent',
                      boxShadow: active ? 'inset 0 -2px 0 var(--laterite)' : 'none',
                    }}
                  >
                    {p.label}
                  </Link>
                );
              })}
            </div>
            <span className="me-label me-subbar-note" style={{ flex: '0 0 auto' }}>
              4 surfaces · 2 live · 1 shadow · 1 in development
            </span>
          </div>
        </div>
      )}

      {open && (
        <div
          className="me-nav-drawer"
          style={{
            borderTop: '1px solid var(--line)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            padding: '0.75rem clamp(1.25rem, 4vw, 4.5rem) 1.25rem',
            maxHeight: '70svh',
            overflowY: 'auto',
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {TOP.filter((l) => l.label !== 'Products').map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  style={{
                    display: 'block',
                    padding: '0.7rem 0',
                    borderBottom: '1px solid var(--line)',
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    fontSize: 15,
                  }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 0',
              borderBottom: '1px solid var(--line)',
              color: 'var(--ink)',
              textDecoration: 'none',
              fontSize: 15,
            }}
          >
            <span className="me-mcc-dot" aria-hidden="true" />
            Mission Control
          </Link>
          <p className="me-label" style={{ margin: '1.1rem 0 0.5rem' }}>
            Products
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {PRODUCTS.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  style={{
                    display: 'block',
                    padding: '0.6rem 0',
                    borderBottom: '1px solid var(--line)',
                    color: 'var(--muted)',
                    textDecoration: 'none',
                    fontSize: 14.5,
                    fontFamily: 'var(--mono)',
                  }}
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1.1rem' }}>
            <ThemeSwitch />
          </div>
        </div>
      )}
    </header>
  );
}
