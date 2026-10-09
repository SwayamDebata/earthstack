'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { opsApi } from '@/lib/ops/api';
import { severity as sev, normalizeSeverity, severityRank } from '@/lib/ops/severity';
import { dateOnly, timeOnly, ago, plainReason } from '@/lib/ops/language';
import { riverSourceLabel } from '@/lib/api/risk-status';
import { useOpsUser } from '@/components/ops/OpsShell';
import { SeverityChip, StatusLabel, Loading, Unreachable } from '@/components/ops/Bits';

type RiverState = {
  state?: string;
  label?: string;
  ratio?: number | null;
  trend?: string | null;
};

type District = {
  location: string;
  severity?: string;
  risk_score?: number | null;
  trend?: string | null;
  top_reason?: string | null;
  top_action?: string | null;
  river_state?: RiverState;
  river_site?: string;
  river_source?: string;
};

type WeakOnWatch = {
  site?: string;
  river?: string;
  block?: string | null;
  flag?: string | null;
  watch_gauge?: string | null;
  gauge_ratio_now?: number | null;
  kind?: string;
  last_breach_dates?: string[];
  source?: string | null;
};

function trendOf(t: string | null | undefined): { glyph: string; word: string } | null {
  const v = String(t ?? '').trim().toLowerCase();
  if (v === 'rising') return { glyph: '↑', word: 'Rising' };
  if (v === 'falling') return { glyph: '↓', word: 'Falling' };
  if (v === 'steady' || v === 'stable' || v === 'flat') return { glyph: '→', word: 'Steady' };
  return null;
}

function verdict(needing: number, total: number): string {
  if (total === 0) return 'No locations are being monitored right now.';
  if (needing === 0) return 'No location needs action today.';
  if (needing === 1) return '1 location needs attention today.';
  return `${needing} locations need attention today.`;
}

function riverStateLine(d: District): string | null {
  const label = d.river_state?.label?.trim();
  if (!label) return null;
  if (d.river_state?.state === 'unknown') return label;
  const site = d.river_site?.trim();
  const src = riverSourceLabel(d.river_source);
  const rest = [site, src].filter(Boolean).join(', ');
  return rest ? `${label} - ${rest}` : label;
}

function riverStateColor(state?: string): string | undefined {
  if (state === 'still_flooding') return 'var(--imd-red)';
  if (state === 'receding' || state === 'rising_to_danger' || state === 'near_danger') {
    return 'var(--imd-orange)';
  }
  if (state === 'unknown') return 'var(--ops-muted)';
  return undefined;
}

function deriveRiverNote(districts: District[]): string {
  const withRiver = districts.filter((d) => d.river_state && d.river_state.state !== 'unknown');
  if (withRiver.length === 0) {
    return 'No river gauge is reporting live for these locations today, so every score above is from rainfall alone.';
  }
  const names = withRiver.map((d) => d.location).join(', ');
  const rainOnly = districts.length - withRiver.length;
  const rainBit =
    rainOnly === 0
      ? ''
      : ` ${rainOnly} location${rainOnly === 1 ? '' : 's'} have no usable gauge and are rainfall-only.`;
  return `River readings from the Odisha DoWR daily bulletin (12:00 IST) are in the score for ${withRiver.length} of ${districts.length} locations: ${names}.${rainBit}`;
}

function weakLine(w: WeakOnWatch): string {
  const bits = [w.site, w.river, w.block, w.flag].filter(Boolean);
  if (typeof w.gauge_ratio_now === 'number' && Number.isFinite(w.gauge_ratio_now) && w.watch_gauge) {
    bits.push(`${Math.round(w.gauge_ratio_now * 100)}% of danger at ${w.watch_gauge}`);
  }
  if (w.kind === 'breach_history' && Array.isArray(w.last_breach_dates) && w.last_breach_dates.length) {
    bits.push(`breached ${w.last_breach_dates.join(', ')}`);
  }
  return bits.join(' · ');
}

function asText(args: {
  org: string;
  date: string;
  time: string;
  head: string;
  districts: District[];
  riverNote: string;
  weak: WeakOnWatch[];
  pilotNote: string | null;
  pilotPlaces: string[];
}): string {
  const lines: string[] = [];
  lines.push(`FLOOD BRIEFING - ${args.date}`);
  lines.push(`${args.org} | Issued ${args.time}`);
  if (args.pilotPlaces.length) lines.push(`PILOT · advisory · ${args.pilotPlaces.join(', ')}`);
  lines.push('');
  lines.push(args.head.toUpperCase());
  lines.push('');
  for (const d of args.districts) {
    const s = sev(d.severity);
    const stage = s.imd === 'Unrated' ? 'Not scored' : `${s.imd} - ${s.action}`;
    lines.push(`${d.location}: ${stage}`);
    const river = riverStateLine(d);
    if (river) lines.push(`  River: ${river}`);
    if (d.top_reason) lines.push(`  Why: ${plainReason(d.top_reason)}`);
    if (d.top_action) lines.push(`  Do: ${d.top_action}`);
  }
  lines.push('');
  if (args.riverNote) lines.push(args.riverNote);
  if (args.weak.length) {
    lines.push('');
    lines.push('Weak points on watch');
    for (const w of args.weak) {
      lines.push(`  ${weakLine(w)}`);
      if (w.source) lines.push(`    ${w.source}`);
    }
  }
  if (args.pilotNote) {
    lines.push('');
    lines.push(args.pilotNote);
  }
  lines.push('');
  lines.push('Advisory only. Does not override IMD, CWC or OSDMA.');
  lines.push('Prepared by ModelEarth.');
  return lines.join('\n');
}

export default function Briefing() {
  const user = useOpsUser();
  const [copied, setCopied] = useState(false);

  const [pdfBusy, setPdfBusy] = useState(false);

  const q = useQuery({
    queryKey: ['ops-briefing'],
    queryFn: () => opsApi.briefing(),
    refetchInterval: 300_000,
  });

  const payload = q.data as
    | {
        districts?: District[];
        generated_at?: string;
        issued_by?: { org?: string; name?: string };
        summary?: string;
        pilot_note?: string;
        pilot_jurisdiction?: string[];
        weak_points_on_watch?: WeakOnWatch[];
      }
    | undefined;

  const districts = useMemo<District[]>(() => {
    const raw = (payload?.districts ?? []) as District[];
    return raw
      .filter((d) => d.location && d.location.toLowerCase() !== 'odisha')
      .slice()
      .sort((a, b) => {
        const fa = a.river_state?.state === 'still_flooding' ? 0 : 1;
        const fb = b.river_state?.state === 'still_flooding' ? 0 : 1;
        if (fa !== fb) return fa - fb;
        const r = severityRank(a.severity) - severityRank(b.severity);
        if (r !== 0) return r;
        return (b.risk_score ?? 0) - (a.risk_score ?? 0);
      });
  }, [payload]);

  const weak = Array.isArray(payload?.weak_points_on_watch) ? payload.weak_points_on_watch : [];
  const pilotPlaces = Array.isArray(payload?.pilot_jurisdiction)
    ? payload.pilot_jurisdiction
    : user.pilot_jurisdiction;
  const pilotNote = typeof payload?.pilot_note === 'string' && payload.pilot_note.trim()
    ? payload.pilot_note.trim()
    : null;

  const needing = districts.filter((d) => {
    const k = normalizeSeverity(d.severity);
    return k === 'CRITICAL' || k === 'HIGH' || k === 'MEDIUM';
  }).length;

  const issuedAt = payload?.generated_at ?? q.dataUpdatedAt;
  const issuedBy = payload?.issued_by;
  const orgName = issuedBy?.org || user.org_name;
  const head = verdict(needing, districts.length);
  const riverNote = deriveRiverNote(districts);
  const dateStr = dateOnly(issuedAt);
  const timeStr = timeOnly(issuedAt);

  const savePdf = async () => {
    setPdfBusy(true);
    try {
      const blob = await opsApi.briefingPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flood-briefing-${dateStr.replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        asText({
          org: orgName,
          date: dateStr,
          time: timeStr,
          head,
          districts,
          riverNote,
          weak,
          pilotNote,
          pilotPlaces,
        }),
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked */
    }
  };

  if (q.isLoading) return <Loading label="Preparing today's briefing" />;
  if (q.isError)
    return <Unreachable lastGood={q.dataUpdatedAt || null} onRetry={() => void q.refetch()} />;

  return (
    <div className="ops-stack">
      <div className="ops-no-print ops-btn-row">
        <button type="button" className="ops-btn ops-btn-solid" onClick={() => void savePdf()} disabled={pdfBusy}>
          {pdfBusy ? 'Preparing PDF…' : 'Save office PDF'}
        </button>
        <button type="button" className="ops-btn" onClick={() => window.print()}>
          Print
        </button>
        <button type="button" className="ops-btn" onClick={copy}>
          {copied ? 'Copied' : 'Copy as text'}
        </button>
      </div>

      <article className="ops-panel ops-sheet">
        <header style={{ borderBottom: '1px solid var(--ops-line)', paddingBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <p className="ops-h2" style={{ margin: 0 }}>
              Flood briefing
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {pilotPlaces.length > 0 ? <StatusLabel kind="PILOT" /> : <StatusLabel kind="LIVE" />}
            </div>
          </div>
          <p className="ops-h1" style={{ marginTop: 6 }}>
            {dateStr}
          </p>
          <p className="ops-lede">
            {orgName}
            {issuedBy?.name ? ` · ${issuedBy.name}` : ''}
            {' · '}Issued {timeStr}
            {issuedAt ? ` · ${ago(issuedAt)}` : ''}
            {pilotPlaces.length ? ` · ${pilotPlaces.join(', ')}` : ''}
          </p>
        </header>

        <h1 className="ops-h1" style={{ marginTop: 16, fontSize: 28 }}>
          {head}
        </h1>
        {payload?.summary ? <p className="ops-lede">{payload.summary}</p> : null}

        <h2 className="ops-h2" style={{ marginTop: 22 }}>
          Location by location
        </h2>
        <ul className="ops-list" style={{ border: '1px solid var(--ops-line)' }}>
          {districts.map((d) => {
            const s = sev(d.severity);
            const trend = trendOf(d.trend);
            const flooding = d.river_state?.state === 'still_flooding';
            const river = riverStateLine(d);
            return (
              <li
                key={d.location}
                className={`ops-row ops-row-${s.key}${flooding ? ' ops-row-still-flooding' : ''}`}
                style={{ padding: '12px 14px' }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <strong>{d.location}</strong>
                  <SeverityChip value={d.severity} showAction />
                  {trend ? (
                    <span className="ops-lede">
                      {trend.glyph} {trend.word}
                    </span>
                  ) : null}
                </div>
                {river ? (
                  <p
                    style={{
                      margin: '8px 0 0',
                      color: riverStateColor(d.river_state?.state),
                      fontWeight: flooding ? 650 : 400,
                    }}
                  >
                    {river}
                  </p>
                ) : null}
                {d.top_reason ? <p style={{ margin: '8px 0 0' }}>{plainReason(d.top_reason)}</p> : null}
                {d.top_action ? <p style={{ margin: '4px 0 0', fontWeight: 550 }}>{d.top_action}</p> : null}
              </li>
            );
          })}
        </ul>

        {weak.length > 0 ? (
          <div style={{ marginTop: 22 }}>
            <h2 className="ops-h2">Weak points on watch</h2>
            <ul className="ops-list" style={{ border: '1px solid var(--ops-line)', marginTop: 8 }}>
              {weak.map((w, i) => (
                <li key={`${w.site ?? 'wp'}-${i}`} style={{ padding: '12px 14px' }}>
                  <p style={{ margin: 0, fontWeight: 550 }}>{weakLine(w)}</p>
                  {w.source ? <p className="ops-lede" style={{ margin: '4px 0 0' }}>{w.source}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="ops-note" style={{ marginTop: 16 }}>
          <strong>What this briefing could not see</strong>
          <p style={{ margin: '6px 0 0' }}>{riverNote}</p>
        </div>

        {pilotNote ? <p className="ops-lede" style={{ marginTop: 16 }}>{pilotNote}</p> : null}

        <footer className="ops-lede" style={{ marginTop: 16, borderTop: '1px solid var(--ops-line)', paddingTop: 12 }}>
          Advisory only. Does not override IMD, CWC or OSDMA. Prepared by ModelEarth for {orgName}.
        </footer>
      </article>
    </div>
  );
}
