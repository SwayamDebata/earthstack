'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { opsApi } from '@/lib/ops/api';
import { severity as sev, normalizeSeverity, severityRank } from '@/lib/ops/severity';
import { dateOnly, timeOnly, ago, plainReason } from '@/lib/ops/language';
import { useOpsUser } from '@/components/ops/OpsShell';
import { SeverityChip, StatusLabel, Loading, Unreachable } from '@/components/ops/Bits';

type District = {
  location: string;
  severity?: string;
  risk_score?: number | null;
  trend?: string | null;
  top_reason?: string | null;
  top_action?: string | null;
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

function asText(args: {
  org: string;
  date: string;
  time: string;
  head: string;
  districts: District[];
  riverNote: string;
}): string {
  const lines: string[] = [];
  lines.push(`FLOOD BRIEFING — ${args.date}`);
  lines.push(`${args.org} | Issued ${args.time}`);
  lines.push('');
  lines.push(args.head.toUpperCase());
  lines.push('');
  for (const d of args.districts) {
    const s = sev(d.severity);
    const stage = s.imd === 'Unrated' ? 'Not scored' : `${s.imd} — ${s.action}`;
    lines.push(`${d.location}: ${stage}`);
    if (d.top_reason) lines.push(`  Why: ${plainReason(d.top_reason)}`);
    if (d.top_action) lines.push(`  Do: ${d.top_action}`);
  }
  lines.push('');
  if (args.riverNote) lines.push(args.riverNote);
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

  const districts = useMemo<District[]>(() => {
    const raw = (q.data?.districts ?? []) as District[];
    return raw
      .filter((d) => d.location && d.location.toLowerCase() !== 'odisha')
      .slice()
      .sort((a, b) => {
        const r = severityRank(a.severity) - severityRank(b.severity);
        if (r !== 0) return r;
        return (b.risk_score ?? 0) - (a.risk_score ?? 0);
      });
  }, [q.data]);

  const needing = districts.filter((d) => {
    const k = normalizeSeverity(d.severity);
    return k === 'CRITICAL' || k === 'HIGH' || k === 'MEDIUM';
  }).length;

  const issuedAt = q.data?.generated_at ?? q.dataUpdatedAt;
  const issuedBy = (q.data as { issued_by?: { org?: string; name?: string } } | undefined)?.issued_by;
  const orgName = issuedBy?.org || user.org_name;
  const head = verdict(needing, districts.length);
  const riverNote =
    'No river gauge is reporting live for these locations today, so every score above is from rainfall alone.';
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
        asText({ org: orgName, date: dateStr, time: timeStr, head, districts, riverNote }),
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
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <p className="ops-h2" style={{ margin: 0 }}>
              Flood briefing
            </p>
            <StatusLabel kind="LIVE" />
          </div>
          <p className="ops-h1" style={{ marginTop: 6 }}>
            {dateStr}
          </p>
          <p className="ops-lede">
            {orgName}
            {issuedBy?.name ? ` · ${issuedBy.name}` : ''}
            {' · '}Issued {timeStr}
            {issuedAt ? ` · ${ago(issuedAt)}` : ''}
          </p>
        </header>

        <h1 className="ops-h1" style={{ marginTop: 16, fontSize: 28 }}>
          {head}
        </h1>
        {q.data?.summary ? <p className="ops-lede">{q.data.summary}</p> : null}

        <h2 className="ops-h2" style={{ marginTop: 22 }}>
          Location by location
        </h2>
        <ul className="ops-list" style={{ border: '1px solid var(--ops-line)' }}>
          {districts.map((d) => {
            const s = sev(d.severity);
            const trend = trendOf(d.trend);
            return (
              <li key={d.location} className={`ops-row ops-row-${s.key}`} style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <strong>{d.location}</strong>
                  <SeverityChip value={d.severity} showAction />
                  {trend ? (
                    <span className="ops-lede">
                      {trend.glyph} {trend.word}
                    </span>
                  ) : null}
                </div>
                {d.top_reason ? <p style={{ margin: '8px 0 0' }}>{plainReason(d.top_reason)}</p> : null}
                {d.top_action ? <p style={{ margin: '4px 0 0', fontWeight: 550 }}>{d.top_action}</p> : null}
              </li>
            );
          })}
        </ul>

        <div className="ops-note" style={{ marginTop: 16 }}>
          <strong>What this briefing could not see</strong>
          <p style={{ margin: '6px 0 0' }}>{riverNote}</p>
        </div>

        <footer className="ops-lede" style={{ marginTop: 16, borderTop: '1px solid var(--ops-line)', paddingTop: 12 }}>
          Advisory only. Does not override IMD, CWC or OSDMA. Prepared by ModelEarth for {orgName}.
        </footer>
      </article>
    </div>
  );
}
