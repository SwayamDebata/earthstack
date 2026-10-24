'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { opsApi } from '@/lib/ops/api';
import { isRiverWatch, toOpsAlerts, type OpsAlert } from '@/lib/ops/alerts';
import { severity as sev, severityRank, needsAttention, normalizeSeverity } from '@/lib/ops/severity';
import { ago, elapsed, minutesSince, needAttentionLine } from '@/lib/ops/language';
import { includeShadowPlaces, placeStatusKind, placesFromMaps } from '@/lib/ops/places';
import { CAN, STATE_LABELS } from '@/lib/ops/workflow';
import { useOpsUser } from '@/components/ops/OpsShell';
import { SeverityChip, StatusLabel, Empty, Loading, Unreachable } from '@/components/ops/Bits';

type Filter = 'needs_attention' | 'all' | 'closed';

const WINDOWS = [
  { key: '24h', label: 'Last 24 hours', hours: 24 },
  { key: '7d', label: 'Last 7 days', hours: 24 * 7 },
  { key: '30d', label: 'Last 30 days', hours: 24 * 30 },
  { key: 'all', label: 'Everything', hours: Number.POSITIVE_INFINITY },
] as const;
type WindowKey = (typeof WINDOWS)[number]['key'];

const LOUD_AFTER_MINUTES = 30;

function canShout(sevValue: unknown): boolean {
  const k = normalizeSeverity(sevValue);
  return k === 'CRITICAL' || k === 'HIGH';
}

function Row({
  alert,
  canAck,
  onAck,
  selected,
  busy,
  riverWatch,
}: {
  alert: OpsAlert;
  canAck: boolean;
  onAck: (id: string) => void;
  selected: boolean;
  busy: boolean;
  riverWatch: boolean;
}) {
  const s = sev(alert.severity);
  const untouched = alert.ops_status === 'new';
  const overdue =
    untouched && canShout(alert.severity) && minutesSince(alert.issued_at) > LOUD_AFTER_MINUTES;

  return (
    <li className={`ops-row ops-row-${s.key} ${overdue ? 'ops-row-loud' : ''} ${selected ? 'ops-item-focus' : ''}`}>
      <div className="ops-item">
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <Link href={`/ops/alerts/${encodeURIComponent(alert.id)}`} className="ops-item-name">
              {alert.region}
            </Link>
            {alert.tier === 'pilot' ? <StatusLabel kind="PILOT" /> : null}
            <SeverityChip value={alert.severity} size="sm" riverWatch={riverWatch} />
          </div>
          <p className="ops-item-meta">
            {untouched ? (
              <span style={overdue ? { fontWeight: 650, color: 'var(--imd-red)' } : undefined}>
                Not yet acknowledged
              </span>
            ) : (
              STATE_LABELS[alert.ops_status]
            )}
            {' · '}
            {ago(alert.issued_at)}
          </p>
        </div>

        <div className={`ops-elapsed ${overdue ? 'ops-elapsed-loud' : ''}`}>
          <strong>{elapsed(alert.issued_at)}</strong>
          <span>since alert</span>
        </div>

        <div className="ops-item-actions">
          {canAck && untouched ? (
            <button
              type="button"
              className="ops-btn ops-btn-solid"
              disabled={busy}
              onClick={() => onAck(alert.id)}
            >
              Acknowledge
            </button>
          ) : null}
          <Link href={`/ops/alerts/${encodeURIComponent(alert.id)}`} className="ops-btn">
            Open
          </Link>
        </div>
      </div>
    </li>
  );
}

export default function AlertInbox() {
  const user = useOpsUser();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>('needs_attention');
  const [windowKey, setWindowKey] = useState<WindowKey>('7d');
  const [cursor, setCursor] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [ackError, setAckError] = useState<string | null>(null);

  const alertsQ = useQuery({
    queryKey: ['ops-alerts'],
    queryFn: () => opsApi.alerts(100),
    refetchInterval: 120_000,
  });
  const riskQ = useQuery({
    queryKey: ['ops-risk-map'],
    queryFn: () => opsApi.riskMap(),
    refetchInterval: 120_000,
  });
  const includeShadow = includeShadowPlaces(user.role, user.pilot_jurisdiction);
  const shadowQ = useQuery({
    queryKey: ['ops-shadow-map'],
    queryFn: () => opsApi.shadowMap(),
    refetchInterval: 300_000,
    enabled: includeShadow,
  });
  const briefingQ = useQuery({
    queryKey: ['ops-briefing'],
    queryFn: () => opsApi.briefing(),
    refetchInterval: 300_000,
  });

  const alerts = useMemo(() => toOpsAlerts(alertsQ.data), [alertsQ.data]);
  const places = useMemo(
    () =>
      placesFromMaps(riskQ.data, shadowQ.data, user.jurisdiction, {
        role: user.role,
        pilotJurisdiction: user.pilot_jurisdiction,
      }),
    [riskQ.data, shadowQ.data, user.jurisdiction, user.role, user.pilot_jurisdiction],
  );
  const riverStateByPlace = useMemo(() => {
    const m = new Map<string, string>();
    const districts = (briefingQ.data?.districts ?? []) as {
      location?: string;
      river_state?: { state?: string };
    }[];
    for (const d of districts) {
      if (d.location && d.river_state?.state) m.set(d.location.toLowerCase(), d.river_state.state);
    }
    return m;
  }, [briefingQ.data]);
  const flooding = useMemo(() => {
    const set = new Set<string>();
    for (const [name, state] of riverStateByPlace) {
      if (state === 'still_flooding') set.add(name);
    }
    return set;
  }, [riverStateByPlace]);
  const signalByPlace = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of places) {
      if (p.signal_source) m.set(p.region.toLowerCase(), p.signal_source);
    }
    return m;
  }, [places]);

  const windowHours = WINDOWS.find((w) => w.key === windowKey)?.hours ?? 168;
  const inWindow = useMemo(
    () => alerts.filter((a) => minutesSince(a.issued_at) / 60 <= windowHours),
    [alerts, windowHours],
  );
  const olderUntouched = useMemo(
    () =>
      alerts.filter((a) => minutesSince(a.issued_at) / 60 > windowHours && a.ops_status === 'new')
        .length,
    [alerts, windowHours],
  );

  const shown = useMemo(() => {
    const filtered =
      filter === 'closed'
        ? inWindow.filter((a) => a.ops_status === 'closed')
        : filter === 'needs_attention'
          ? inWindow.filter((a) => a.ops_status !== 'closed')
          : inWindow;
    return filtered.slice().sort((a, b) => {
      const untouchedX = a.ops_status === 'new' ? 0 : 1;
      const untouchedY = b.ops_status === 'new' ? 0 : 1;
      if (untouchedX !== untouchedY) return untouchedX - untouchedY;
      const r = severityRank(a.severity) - severityRank(b.severity);
      if (r !== 0) return r;
      const fx = flooding.has(a.region.toLowerCase()) ? 0 : 1;
      const fy = flooding.has(b.region.toLowerCase()) ? 0 : 1;
      if (fx !== fy) return fx - fy;
      return a.issued_at.localeCompare(b.issued_at);
    });
  }, [inWindow, filter, flooding]);

  const needing = inWindow.filter(
    (a) => a.ops_status === 'new' && needsAttention(a.severity),
  ).length;

  const canAck = CAN[user.role].acknowledge;
  const above = places.filter((p) => needsAttention(p.severity)).length;
  const onPilot = places.filter((p) => p.tier === 'pilot').length;
  const shadowPlaces = places.some((p) => p.tier === 'shadow');

  const watchFor = (alert: OpsAlert) => {
    const key = alert.region.toLowerCase();
    return isRiverWatch({
      ...alert,
      signal_source: alert.signal_source ?? signalByPlace.get(key) ?? null,
      river_state: riverStateByPlace.get(key) ?? null,
    });
  };

  const ack = async (id: string) => {
    setAckError(null);
    setBusyId(id);
    try {
      await opsApi.acknowledge(id);
      await qc.invalidateQueries({ queryKey: ['ops-alerts'] });
    } catch (err) {
      setAckError(err instanceof Error ? err.message : 'Could not acknowledge.');
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => Math.min(shown.length - 1, c + 1));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (e.key === 'Enter' && shown[cursor]) {
        window.location.href = `/ops/alerts/${encodeURIComponent(shown[cursor].id)}`;
      } else if ((e.key === 'a' || e.key === 'A') && shown[cursor] && canAck) {
        const row = shown[cursor];
        if (row.ops_status === 'new') void ack(row.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shown, cursor, canAck]);

  const bulkIds = shown.filter((a) => a.ops_status === 'new' && canAck).map((a) => a.id);

  return (
    <div className="ops-stack">
      <div>
        <h1 className="ops-h1">
          {alertsQ.isLoading
            ? 'Checking alerts'
            : alertsQ.isError
              ? 'Could not load alerts'
              : needAttentionLine(needing)}
        </h1>
        <p className="ops-lede">
          {places.length === 1
            ? `${places[0].region} · ${above ? 'above alert level' : 'no warning'}`
            : `${places.length} locations monitored${
                above ? `, ${above} above alert level` : ', none above alert level'
              }`}
          {onPilot ? ` · ${onPilot} on pilot tier` : ''}
          {shadowPlaces ? ' · north Odisha in shadow' : ''}
          {alertsQ.isSuccess ? ` · Updated ${ago(alertsQ.dataUpdatedAt)}` : ''}
        </p>
        <p className="ops-k">j / k move · enter open · a acknowledge</p>
      </div>

      {places.length > 0 ? (
        <div>
          <h2 className="ops-h2">Now</h2>
          <div className="ops-now">
            {places.map((p) => {
              const kind = placeStatusKind(p);
              return (
              <Link key={p.region} href={`/ops/places/${encodeURIComponent(p.region)}`}>
                <div className="ops-now-name">{p.region}</div>
                <div className="ops-now-stage">
                  <SeverityChip
                    value={p.severity}
                    size="sm"
                    riverWatch={isRiverWatch({
                      tier: p.tier,
                      severity: p.severity,
                      signal_source: p.signal_source,
                      river_state: riverStateByPlace.get(p.region.toLowerCase()) ?? null,
                    })}
                  />
                  {kind ? <StatusLabel kind={kind} /> : null}
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="ops-panel">
        <div className="ops-toolbar">
          {(
            [
              ['needs_attention', 'Needs attention'],
              ['all', 'All'],
              ['closed', 'Closed'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="ops-tab"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
          <select
            className="ops-select"
            style={{ width: 'auto', marginLeft: 'auto' }}
            value={windowKey}
            onChange={(e) => setWindowKey(e.target.value as WindowKey)}
            aria-label="Time window"
          >
            {WINDOWS.map((w) => (
              <option key={w.key} value={w.key}>
                {w.label}
              </option>
            ))}
          </select>
        </div>

        {olderUntouched > 0 ? (
          <div className="ops-note" style={{ border: 0, borderBottom: '1px solid var(--ops-line)' }}>
            {olderUntouched} older alert{olderUntouched === 1 ? '' : 's'} never acknowledged.{' '}
            <button type="button" className="ops-tab" onClick={() => setWindowKey('all')}>
              Show everything
            </button>
          </div>
        ) : null}

        {ackError ? <p className="ops-warn" style={{ margin: 0 }}>{ackError}</p> : null}

        {alertsQ.isLoading ? (
          <Loading label="Loading alerts" />
        ) : alertsQ.isError ? (
          <Unreachable lastGood={alertsQ.dataUpdatedAt || null} onRetry={() => void alertsQ.refetch()} />
        ) : shown.length === 0 ? (
          <Empty
            title={filter === 'closed' ? 'No closed alerts yet.' : 'No alerts need attention.'}
            lastChecked={alertsQ.dataUpdatedAt}
          />
        ) : (
          <ul className="ops-list">
            {shown.map((a, i) => (
              <Row
                key={a.id}
                alert={a}
                canAck={canAck}
                selected={i === cursor}
                busy={busyId === a.id}
                riverWatch={watchFor(a)}
                onAck={(id) => void ack(id)}
              />
            ))}
          </ul>
        )}

        {bulkIds.length > 1 ? (
          <div style={{ padding: 12, borderTop: '1px solid var(--ops-line)' }}>
            <button
              type="button"
              className="ops-btn"
              disabled={Boolean(busyId)}
              onClick={() => void Promise.all(bulkIds.map((id) => ack(id)))}
            >
              Acknowledge all {bulkIds.length} on this list
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
