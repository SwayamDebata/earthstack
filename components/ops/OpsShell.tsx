'use client';

import { createContext, useCallback, useContext, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { asRole, type Role } from '@/lib/ops/workflow';
import { opsApi, type OpsMe } from '@/lib/ops/api';
import { clearOpsSession, getAccessToken, loginOps } from '@/lib/ops/session';
import { StatusLabel } from '@/components/ops/Bits';

export type OpsUser = {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  org_name: string;
  org_slug: string;
  jurisdiction: string[];
  pilot_jurisdiction: string[];
  pilot_enabled: boolean;
  on_duty: string | null;
};

const UserCtx = createContext<OpsUser | null>(null);
export const useOpsUser = (): OpsUser => {
  const v = useContext(UserCtx);
  if (!v) throw new Error('useOpsUser requires a signed-in session');
  return v;
};

const ThemeCtx = createContext({ dark: false, toggle: () => {} });
export const useOpsTheme = () => useContext(ThemeCtx);

const THEME_KEY = 'modelearth:ops:theme';

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(THEME_KEY);
    } catch {
      /* private mode */
    }
    setDark(saved === 'dark');
    return () => undefined;
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { dark, toggle };
}

function userFromMe(me: OpsMe): OpsUser {
  return {
    id: me.id,
    full_name: me.name,
    email: me.email,
    role: asRole(me.role),
    org_name: me.org.name,
    org_slug: String(me.org.slug ?? ''),
    jurisdiction: me.jurisdiction ?? [],
    pilot_jurisdiction: me.pilot_jurisdiction ?? [],
    pilot_enabled: Boolean(me.org.pilot_enabled),
    on_duty: me.org.on_duty ?? null,
  };
}

const NAV = [
  { href: '/ops', label: 'Alerts', exact: true },
  { href: '/ops/briefing', label: 'Briefing' },
  { href: '/ops/record', label: 'Record' },
  { href: '/ops/map', label: 'Map' },
];

function LoginGate({ onSignedIn }: { onSignedIn: (user: OpsUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await loginOps(email, password);
      const me = await opsApi.me();
      onSignedIn(userFromMe(me));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ops-login">
      <div>
        <p className="ops-h2" style={{ margin: 0 }}>
          ModelEarth Flood Ops
        </p>
        <h1 className="ops-h1" style={{ marginTop: 6 }}>
          Sign in to your office
        </h1>
        <p className="ops-lede">Alerts, briefing and the record for your district only.</p>
      </div>
      <form onSubmit={submit} className="ops-stack" style={{ gap: 12, marginTop: 24 }}>
        <label className="ops-lede">
          Email
          <input
            className="ops-input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ marginTop: 6, display: 'block' }}
          />
        </label>
        <label className="ops-lede">
          Password
          <input
            className="ops-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ marginTop: 6, display: 'block' }}
          />
        </label>
        {error ? <p className="ops-warn">{error}</p> : null}
        <button type="submit" className="ops-btn ops-btn-solid" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function OpsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/ops';
  const { dark, toggle } = useTheme();
  const [user, setUser] = useState<OpsUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      if (!getAccessToken()) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const me = await opsApi.me();
        if (!cancelled) setUser(userFromMe(me));
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    void boot();
    const onOut = () => setUser(null);
    window.addEventListener('modelearth:ops:unauthorized', onOut);
    return () => {
      cancelled = true;
      window.removeEventListener('modelearth:ops:unauthorized', onOut);
    };
  }, []);

  const signOut = () => {
    clearOpsSession();
    setUser(null);
  };

  const onMap = pathname === '/ops/map';

  return (
    <ThemeCtx.Provider value={{ dark, toggle }}>
      <div className={`ops-root ${dark ? 'ops-dark' : ''} ${onMap && user ? 'ops-on-map' : ''}`}>
        {!ready ? (
          <main className="ops-main">
            <p className="ops-lede">Opening Flood Ops…</p>
          </main>
        ) : !user ? (
          <LoginGate onSignedIn={setUser} />
        ) : (
          <UserCtx.Provider value={user}>
            <header className="ops-top ops-no-print">
              <div className="ops-top-inner">
                <Link href="/ops" className="ops-brand">
                  <div className="ops-brand-desk">{user.org_name}</div>
                  <div className="ops-brand-sub" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    {user.pilot_jurisdiction.length > 0 ? (
                      <>
                        <StatusLabel kind="PILOT" />
                        <span>advisory</span>
                        <span aria-hidden>·</span>
                      </>
                    ) : null}
                    <span>
                      {user.full_name} · {user.role}
                      {user.jurisdiction.length === 1 ? ` · ${user.jurisdiction[0]}` : ''}
                    </span>
                  </div>
                </Link>
                <nav className="ops-nav">
                  {NAV.map((n) => {
                    const active = n.exact
                      ? pathname === '/ops' || pathname.startsWith('/ops/alerts')
                      : pathname.startsWith(n.href);
                    return (
                      <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined}>
                        {n.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="ops-top-tools">
                  <button type="button" className="ops-iconbtn" onClick={toggle} aria-pressed={dark}>
                    {dark ? 'Light' : 'Dark'}
                  </button>
                  <button type="button" className="ops-iconbtn" onClick={signOut}>
                    Sign out
                  </button>
                </div>
              </div>
              <nav className="ops-tabs">
                {NAV.map((n) => {
                  const active = n.exact
                    ? pathname === '/ops' || pathname.startsWith('/ops/alerts')
                    : pathname.startsWith(n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className="ops-tab"
                      aria-current={active ? 'page' : undefined}
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
            </header>

            <main className="ops-main">{children}</main>

            {onMap ? null : (
              <footer className="ops-foot ops-no-print">
                Advisory only. Does not override IMD, CWC or OSDMA. Scores are the rule engine; the
                machine-learning model runs in shadow and never changes a number shown here.
              </footer>
            )}
          </UserCtx.Provider>
        )}
      </div>
    </ThemeCtx.Provider>
  );
}
