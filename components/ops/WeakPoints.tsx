'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { opsApi } from '@/lib/ops/api';
import { CAN } from '@/lib/ops/workflow';
import { useOpsUser } from '@/components/ops/OpsShell';
import { Loading } from '@/components/ops/Bits';

const KINDS = [
  'habitation',
  'embankment',
  'breach_history',
  'low_bridge',
  'sluice',
  'other',
] as const;

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export default function WeakPoints({ location }: { location: string }) {
  const user = useOpsUser();
  const qc = useQueryClient();
  const canAdd = CAN[user.role].logAction;
  const canRemove = CAN[user.role].close;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [river, setRiver] = useState('');
  const [site, setSite] = useState('');
  const [kind, setKind] = useState<string>('habitation');
  const [block, setBlock] = useState('');
  const [watchGauge, setWatchGauge] = useState('');
  const [watchRatio, setWatchRatio] = useState('0.90');
  const [note, setNote] = useState('');
  const [source, setSource] = useState('');

  const q = useQuery({
    queryKey: ['ops-weak-points', location],
    queryFn: () => opsApi.weakPoints(location),
  });

  const rows = Array.isArray(q.data) ? (q.data as Record<string, unknown>[]) : [];

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ratio = Number(watchRatio);
      await opsApi.addWeakPoint({
        location,
        river: river.trim(),
        site: site.trim(),
        kind,
        block: block.trim() || null,
        watch_gauge: watchGauge.trim() || null,
        watch_ratio: Number.isFinite(ratio) ? ratio : null,
        note: note.trim() || null,
        source: source.trim() || null,
      });
      setRiver('');
      setSite('');
      setBlock('');
      setWatchGauge('');
      setNote('');
      setSource('');
      await qc.invalidateQueries({ queryKey: ['ops-weak-points', location] });
      await qc.invalidateQueries({ queryKey: ['ops-briefing'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add.');
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (id: unknown) => {
    setBusy(true);
    setError(null);
    try {
      await opsApi.deactivateWeakPoint(String(id));
      await qc.invalidateQueries({ queryKey: ['ops-weak-points', location] });
      await qc.invalidateQueries({ queryKey: ['ops-briefing'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove.');
    } finally {
      setBusy(false);
    }
  };

  if (q.isLoading) return <Loading label="Loading weak points" />;
  if (q.isError) return <p className="ops-lede">Could not load weak points for {location}.</p>;

  return (
    <div className="ops-stack" style={{ gap: 12 }}>
      {error ? <p className="ops-warn" style={{ margin: 0 }}>{error}</p> : null}
      {rows.length === 0 ? (
        <p className="ops-lede" style={{ margin: 0 }}>No weak points on file for {location}.</p>
      ) : (
        <ul className="ops-list" style={{ border: '1px solid var(--ops-line)' }}>
          {rows.map((r) => {
            const id = r.id;
            const shared = Boolean(r.shared);
            const title = [str(r.site), str(r.river), str(r.block)].filter(Boolean).join(' · ');
            return (
              <li key={String(id)} style={{ padding: '12px 14px' }}>
                <p style={{ margin: 0, fontWeight: 550 }}>
                  {title || 'Weak point'}
                  {shared ? ' · shared' : ''}
                </p>
                {str(r.note) ? <p style={{ margin: '4px 0 0' }}>{str(r.note)}</p> : null}
                {str(r.source) ? <p className="ops-lede" style={{ margin: '4px 0 0' }}>{str(r.source)}</p> : null}
                {canRemove && !shared ? (
                  <button
                    type="button"
                    className="ops-btn"
                    style={{ marginTop: 8 }}
                    disabled={busy}
                    onClick={() => void deactivate(id)}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {canAdd ? (
        <form onSubmit={add} className="ops-stack" style={{ gap: 8 }}>
          <p className="ops-h2" style={{ margin: 0 }}>Add a weak point</p>
          <input className="ops-input" placeholder="River" value={river} onChange={(e) => setRiver(e.target.value)} required />
          <input className="ops-input" placeholder="Site" value={site} onChange={(e) => setSite(e.target.value)} required />
          <select className="ops-select" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Kind">
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <input className="ops-input" placeholder="Block" value={block} onChange={(e) => setBlock(e.target.value)} />
          <input className="ops-input" placeholder="Watch gauge" value={watchGauge} onChange={(e) => setWatchGauge(e.target.value)} />
          <input className="ops-input" placeholder="Watch ratio" value={watchRatio} onChange={(e) => setWatchRatio(e.target.value)} />
          <input className="ops-input" placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          <input className="ops-input" placeholder="Source" value={source} onChange={(e) => setSource(e.target.value)} />
          <button type="submit" className="ops-btn ops-btn-solid" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </form>
      ) : null}
    </div>
  );
}
