'use client';

import type { ReactNode } from 'react';
import { severity as sev } from '@/lib/ops/severity';
import { ago } from '@/lib/ops/language';

export function SeverityChip({
  value,
  showAction = false,
  size = 'md',
  riverWatch = false,
}: {
  value: unknown;
  showAction?: boolean;
  size?: 'sm' | 'md';
  riverWatch?: boolean;
}) {
  const s = sev(value);
  if (riverWatch) {
    return (
      <span className={`ops-chip ops-chip-MEDIUM ${size === 'sm' ? 'ops-chip-sm' : ''}`}>
        <span aria-hidden>●</span>
        RIVER WATCH
        {showAction ? ' · Watch the gauge' : ''}
        <span className="sr-only"> Watch the gauge.</span>
      </span>
    );
  }
  return (
    <span className={`ops-chip ops-chip-${s.key} ${size === 'sm' ? 'ops-chip-sm' : ''}`}>
      <span aria-hidden>{s.glyph}</span>
      {s.imd === 'Unrated' ? 'Not scored' : s.imd}
      {showAction && s.imd !== 'Unrated' ? ` · ${s.action}` : ''}
      <span className="sr-only">
        {' '}
        {s.action}.
      </span>
    </span>
  );
}

export function StatusLabel({
  kind,
}: {
  kind: 'LIVE' | 'BACKTEST' | 'SHADOW' | 'IN DEVELOPMENT' | 'PILOT';
}) {
  return <span className={`ops-status ops-status-${kind}`}>{kind}</span>;
}

export function Empty({ title, lastChecked }: { title: string; lastChecked?: string | number | Date | null }) {
  return (
    <div className="ops-empty">
      <p>{title}</p>
      {lastChecked !== undefined ? <p className="ops-lede">Last checked {ago(lastChecked)}.</p> : null}
    </div>
  );
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="ops-load" role="status">
      <span className="sr-only">{label}</span>
      <div className="ops-skel" />
      <div className="ops-skel" />
      <div className="ops-skel" />
    </div>
  );
}

export function Unreachable({
  lastGood,
  onRetry,
}: {
  lastGood?: string | number | Date | null;
  onRetry: () => void;
}) {
  return (
    <div className="ops-warn" style={{ margin: 12 }}>
      <p style={{ fontWeight: 650, margin: 0 }}>Cannot reach ModelEarth right now.</p>
      <p style={{ margin: '6px 0 0' }}>
        {lastGood
          ? `Nothing shown rather than stale numbers. Last good data was ${ago(lastGood)}.`
          : 'No data has loaded yet on this device.'}
      </p>
      <button type="button" className="ops-btn" style={{ marginTop: 10 }} onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span className="ops-h2" style={{ marginBottom: 6, display: 'block' }}>
        {label}
      </span>
      {children}
    </label>
  );
}
