'use client';

import { useQuery } from '@tanstack/react-query';
import { opsApi } from '@/lib/ops/api';
import { riverFeedCaption } from '@/lib/api/risk-status';
import { Loading } from '@/components/ops/Bits';

const CARDS: { key: 'cwc_telemetry' | 'dowr_bulletin' | 'google_flood_hub'; title: string }[] = [
  { key: 'cwc_telemetry', title: 'CWC' },
  { key: 'dowr_bulletin', title: 'DoWR' },
  { key: 'google_flood_hub', title: 'Flood Hub' },
];

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}
function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function locRow(feed: Record<string, unknown> | undefined, location: string): Record<string, unknown> | null {
  const by = feed?.by_location;
  if (!by || typeof by !== 'object') return null;
  const map = by as Record<string, Record<string, unknown>>;
  const hit = map[location] ?? map[location.toLowerCase()] ?? Object.values(map)[0];
  return hit && typeof hit === 'object' ? hit : null;
}

export default function ExternalFeeds({ location }: { location: string }) {
  const q = useQuery({
    queryKey: ['ops-feeds', location],
    queryFn: () => opsApi.externalFeeds(location),
  });

  if (q.isLoading) return <Loading label="Loading other feeds" />;
  if (q.isError || !q.data) {
    return <p className="ops-lede">Could not load what others are publishing for {location}.</p>;
  }

  const data = q.data as Record<string, unknown>;
  const feeds = (data.feeds ?? {}) as Record<string, Record<string, unknown>>;
  const note = str(data.note);

  return (
    <div className="ops-stack" style={{ gap: 12 }}>
      {note ? <p className="ops-lede" style={{ margin: 0 }}>{note}</p> : null}
      {CARDS.map((c) => {
        const feed = feeds[c.key];
        const status = str(feed?.status);
        const muted = status === 'not_configured' || status === 'misconfigured' || status === 'error';
        const row = locRow(feed, location);
        const level = num(row?.level_m);
        const danger = num(row?.danger_m);
        const station = str(row?.station) ?? str(row?.site);
        const ratio = num(row?.ratio);
        const feedStatus = str(row?.status) ?? status;
        const caption = feedStatus ? riverFeedCaption(feedStatus, str(row?.observed_at) ?? str(row?.bulletin_date)) : null;
        return (
          <div
            key={c.key}
            className="ops-note"
            style={{ margin: 0, opacity: muted ? 0.65 : 1 }}
          >
            <p style={{ margin: 0, fontWeight: 650 }}>
              {c.title}
              {str(feed?.owner) ? ` · ${str(feed?.owner)}` : ''}
            </p>
            <p className="ops-lede" style={{ margin: '4px 0 0' }}>
              {str(feed?.cadence) ?? ''}
            </p>
            {str(feed?.note) ? <p className="ops-lede" style={{ margin: '4px 0 0' }}>{str(feed?.note)}</p> : null}
            {row && !muted ? (
              <p style={{ margin: '6px 0 0' }}>
                {station ? `${station}: ` : ''}
                {level !== null ? `${level.toFixed(2)} m` : 'no level'}
                {danger !== null ? ` / ${danger.toFixed(2)} m danger` : ''}
                {ratio !== null ? ` · ${Math.round(ratio * 100)}% of danger` : ''}
                {caption ? ` · ${caption}` : ''}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
