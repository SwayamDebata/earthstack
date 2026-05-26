'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Droplets,
  Pause,
  Play,
  RefreshCw,
  SkipBack,
  SkipForward,
  Waves,
} from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import type { ReplayHistoricalEventInfo, ReplayHistoricalFrame } from '@/lib/api/schemas';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import { ErrorBlock, EmptyBlock, Telemetry } from '@/components/dashboard/Atoms';

const FRAME_MS = 1500;

function fmtDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso?: string) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })} · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return iso;
  }
}

function severityTone(sev?: string): 'critical' | 'warning' | 'info' {
  const s = (sev ?? '').toLowerCase();
  if (s.includes('severe')) return 'critical';
  if (s.includes('flood')) return 'warning';
  return 'info';
}

function riskToColor(level?: string) {
  const l = (level ?? '').toLowerCase();
  if (l === 'high' || l === 'critical') return '#ef4444';
  if (l === 'medium' || l === 'warning') return '#f59e0b';
  if (l === 'low') return '#10b981';
  return '#22d3ee';
}

type EventSelection = { eventId: string; source?: string };

export default function HistoricalReplayPanel() {
  const [selection, setSelection] = useState<EventSelection | null>(null);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const demoQ = useQuery({
    queryKey: [
      'replay-historical-demo',
      selection?.eventId ?? 'default',
      selection?.source ?? '',
    ],
    queryFn: () =>
      api.replayHistoricalDemo(
        selection ? { eventId: selection.eventId, source: selection.source } : undefined,
      ),
    staleTime: 60 * 60_000,
    refetchInterval: false,
    refetchOnMount: false,
  });

  const eventsQ = useQuery({
    queryKey: ['replay-historical-events'],
    queryFn: () => api.replayHistoricalEvents(),
    staleTime: 60 * 60_000,
    refetchInterval: false,
    refetchOnMount: false,
  });

  const data = demoQ.data;
  const event = data?.event;
  const frames: ReplayHistoricalFrame[] = useMemo(() => data?.frames ?? [], [data]);
  const firstAlertHours = data?.first_alert_hours_before ?? null;
  const triggeredAny = frames.some((f) => f.triggered);

  // Reset index whenever frames change.
  useEffect(() => {
    setFrameIdx(0);
  }, [data]);

  // Auto-play.
  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    if (!playing || frames.length <= 1) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setFrameIdx((i) => (i + 1) % frames.length);
    }, FRAME_MS);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playing, frames.length]);

  const step = useCallback(
    (delta: number) => {
      if (frames.length === 0) return;
      setPlaying(false);
      setFrameIdx((i) => (i + delta + frames.length) % frames.length);
    },
    [frames.length],
  );

  const currentFrame = frames[frameIdx];
  const isRecommended = data?.is_recommended ?? data?.recommended ?? true;
  const recommendedEvent = data?.recommended_event;

  const eventsList = eventsQ.data?.events ?? [];
  const activeEventId = event?.event_id;

  const recallStatusText = playing ? 'PLAYING' : 'PAUSED';

  return (
    <HudFrame
      label="HISTORICAL REPLAY"
      subtitle="/replay/historical/demo · rule engine v2 simulation"
      status={demoQ.isError ? 'critical' : triggeredAny ? 'nominal' : 'info'}
      statusText={demoQ.isLoading ? 'SYNC' : recallStatusText}
      meta={[
        ...(event?.region ? [{ label: 'REGION', value: event.region.toUpperCase() }] : []),
        ...(frames.length > 0
          ? [{ label: 'FRAME', value: `${frameIdx + 1} / ${frames.length}` }]
          : []),
      ]}
    >
      {demoQ.isError ? (
        <ErrorBlock onRetry={() => void demoQ.refetch()} message="historical replay endpoint failed" />
      ) : demoQ.isLoading ? (
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-md border border-white/5 bg-slate-950/40" />
          <div className="h-40 animate-pulse rounded-md border border-white/5 bg-slate-950/40" />
        </div>
      ) : frames.length === 0 || !event ? (
        <EmptyBlock message="no historical replay frames available" />
      ) : (
        <div className="space-y-4">
          {/* EVENT HEADER */}
          <EventHeader
            event={event}
            firstAlertHours={firstAlertHours}
            onTogglePicker={() => setShowPicker((s) => !s)}
            pickerOpen={showPicker}
            hasPicker={eventsList.length > 0}
          />

          {/* RECOMMENDED-EVENT BANNER */}
          {!isRecommended && recommendedEvent ? (
            <RecommendedBanner
              currentDescription={event.description ?? `${event.region} · ${event.river_name}`}
              recommended={recommendedEvent}
              onUseRecommended={() => {
                setSelection({
                  eventId: recommendedEvent.event_id,
                  source: recommendedEvent.source,
                });
                setShowPicker(false);
              }}
            />
          ) : null}

          {/* EVENT PICKER */}
          {showPicker && eventsList.length > 0 ? (
            <EventPicker
              events={eventsList}
              activeEventId={activeEventId}
              selectedEventId={selection?.eventId ?? activeEventId}
              onSelect={(ev) => {
                setSelection({ eventId: ev.event_id, source: ev.source });
                setShowPicker(false);
              }}
              onResetDefault={() => {
                setSelection(null);
                setShowPicker(false);
              }}
            />
          ) : null}

          {/* FRAME DISPLAY */}
          {currentFrame ? <FrameDisplay frame={currentFrame} firstAlertHours={firstAlertHours} /> : null}

          {/* LEAD-TIME TIMELINE */}
          <LeadTimeTimeline
            frames={frames}
            currentIdx={frameIdx}
            firstAlertHours={firstAlertHours}
            onSelect={(i) => {
              setPlaying(false);
              setFrameIdx(i);
            }}
          />

          {/* TRANSPORT CONTROLS */}
          <div className="flex flex-wrap items-center gap-2 rounded-sm border border-white/5 bg-slate-950/40 px-3 py-2">
            <button
              type="button"
              onClick={() => step(-1)}
              className="flex items-center gap-1 rounded-sm border border-white/10 bg-black/40 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200"
            >
              <SkipBack size={11} /> Prev
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className={`flex items-center gap-1 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition ${
                playing
                  ? 'border-amber-400/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                  : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'
              }`}
            >
              {playing ? (
                <>
                  <Pause size={11} /> Pause
                </>
              ) : (
                <>
                  <Play size={11} /> Play
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="flex items-center gap-1 rounded-sm border border-white/10 bg-black/40 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200"
            >
              Next <SkipForward size={11} />
            </button>

            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              ·  {(FRAME_MS / 1000).toFixed(1)}s per frame
            </span>

            <button
              type="button"
              onClick={() => {
                setFrameIdx(0);
                setPlaying(true);
              }}
              className="ml-auto flex items-center gap-1 rounded-sm border border-white/10 bg-black/40 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200"
            >
              <RefreshCw size={10} /> Restart
            </button>
          </div>

          {data?.methodology &&
          typeof (data.methodology as Record<string, unknown>).note === 'string' ? (
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              ·  {String((data.methodology as Record<string, unknown>).note)}
            </p>
          ) : null}
        </div>
      )}
    </HudFrame>
  );
}

/* ───────────────────────── sub-components ───────────────────────── */

function EventHeader({
  event,
  firstAlertHours,
  onTogglePicker,
  pickerOpen,
  hasPicker,
}: {
  event: ReplayHistoricalEventInfo;
  firstAlertHours: number | null;
  onTogglePicker: () => void;
  pickerOpen: boolean;
  hasPicker: boolean;
}) {
  const sevTone = severityTone(event.severity);
  return (
    <div className="relative overflow-hidden rounded-md border border-emerald-400/20 bg-gradient-to-br from-emerald-950/30 via-slate-950/60 to-slate-950/80 p-4">
      <span className="hud-bracket hud-bracket-tl" />
      <span className="hud-bracket hud-bracket-br" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/70">
            Verified Flood Event · {event.source ?? 'INDOFLOODS'}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">
            {event.region ?? '—'}
            <span className="text-slate-400"> · </span>
            <span className="text-cyan-200">{event.river_name ?? '—'} River</span>
          </h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-400">
            {fmtDate(event.start_timestamp)}
            {event.end_timestamp && event.end_timestamp !== event.start_timestamp
              ? ` → ${fmtDate(event.end_timestamp)}`
              : ''}
            <span className="text-slate-600"> · </span>
            <span className="text-slate-500">{event.event_id}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
              sevTone === 'critical'
                ? 'bg-red-500/15 text-red-200 ring-1 ring-red-500/30'
                : sevTone === 'warning'
                  ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
                  : 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/30'
            }`}
          >
            {event.severity ?? 'Flood'}
          </span>
          {hasPicker ? (
            <button
              type="button"
              onClick={onTogglePicker}
              className="flex items-center gap-1 rounded-sm border border-white/10 bg-black/40 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200"
            >
              {pickerOpen ? 'Hide catalog' : 'Browse events'}
              <ChevronDown
                size={11}
                className={`transition-transform ${pickerOpen ? 'rotate-180' : ''}`}
              />
            </button>
          ) : null}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Telemetry
          label="PEAK WATER"
          value={event.peak_water_level !== null && event.peak_water_level !== undefined
            ? `${event.peak_water_level.toFixed(2)} m`
            : '—'}
        />
        <Telemetry
          label="PEAK DISCHARGE"
          value={event.peak_discharge !== null && event.peak_discharge !== undefined
            ? `${event.peak_discharge.toFixed(0)} m³/s`
            : '—'}
        />
        <Telemetry label="STATE" value={event.state ?? '—'} />
        <Telemetry label="GAUGE" value={event.gauge_id ?? '—'} />
      </div>

      {/* First-alert callout */}
      {firstAlertHours !== null && firstAlertHours !== undefined ? (
        <div className="mt-3 flex items-center gap-2 rounded-sm border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5">
          <AlertTriangle size={12} className="text-emerald-300" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-emerald-200">
            First Alert · T−{firstAlertHours}h before onset
          </p>
        </div>
      ) : null}
    </div>
  );
}

function FrameDisplay({
  frame,
  firstAlertHours,
}: {
  frame: ReplayHistoricalFrame;
  firstAlertHours: number | null;
}) {
  const hoursBefore = frame.hours_before_event;
  const triggered = Boolean(frame.triggered);
  const isFirstAlert = firstAlertHours !== null && hoursBefore === firstAlertHours;
  const riskColor = riskToColor(frame.risk_level);

  // Water level vs threshold (relative %, clamped 0..1.2)
  const wl = frame.water_level_m ?? 0;
  const thr = frame.flood_threshold_m ?? 0;
  const wlPct = thr > 0 ? Math.min(120, (wl / thr) * 100) : 0;

  const rule = frame.rule_score ?? 0;
  const rulePct = Math.min(100, Math.max(0, rule * 100));

  return (
    <div
      className={`relative overflow-hidden rounded-md border p-4 transition-colors ${
        triggered
          ? 'border-emerald-400/35 bg-gradient-to-br from-emerald-950/25 to-slate-950/80 shadow-[0_0_28px_rgba(16,185,129,0.08)]'
          : 'border-cyan-400/15 bg-[#060b18]/95'
      }`}
    >
      <span className="hud-bracket hud-bracket-tl" />
      <span className="hud-bracket hud-bracket-br" />

      {/* Lead-time pill row */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${
            hoursBefore === 0
              ? 'border-red-400/40 bg-red-500/10 text-red-200'
              : 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
          }`}
        >
          <Clock size={11} />
          {hoursBefore === 0 ? 'T = 0 · FLOOD ONSET' : `T − ${hoursBefore}h`}
        </span>
        {triggered ? (
          <span className="flex items-center gap-1.5 rounded-sm border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-200">
            <StatusLed tone="nominal" size={6} pulse />
            Triggered · would have alerted
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-sm border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-400">
            Not triggered
          </span>
        )}
        {isFirstAlert ? (
          <span className="rounded-sm border border-emerald-300/55 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-100">
            ★ First alert
          </span>
        ) : null}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-slate-500">
          {fmtDateTime(frame.simulated_at)}
        </span>
      </div>

      {/* Narrative */}
      {frame.narrative ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{frame.narrative}</p>
      ) : null}

      {/* Metrics grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Rule score */}
        <div className="rounded-sm border border-white/5 bg-slate-950/50 p-3">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Rule Score
            </span>
            <span className="font-mono text-base font-semibold tabular-nums" style={{ color: riskColor }}>
              {rule.toFixed(3)}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-sm bg-white/5">
            <div
              className="h-full rounded-sm transition-[width] duration-500"
              style={{
                width: `${rulePct}%`,
                background: `linear-gradient(90deg, ${riskColor}88, ${riskColor})`,
                boxShadow: `0 0 8px ${riskColor}66`,
              }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Risk level · <span style={{ color: riskColor }}>{frame.risk_level ?? '—'}</span>
          </p>
        </div>

        {/* Water level vs threshold */}
        <div className="rounded-sm border border-white/5 bg-slate-950/50 p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <Waves size={11} /> Water Level
            </span>
            <span className="font-mono text-xs tabular-nums text-cyan-100">
              {wl.toFixed(2)} m
              <span className="text-slate-600"> / </span>
              <span className="text-amber-200">{thr.toFixed(2)} m</span>
            </span>
          </div>
          <div className="relative mt-1.5 h-1.5 w-full overflow-hidden rounded-sm bg-white/5">
            <div
              className="h-full rounded-sm bg-cyan-400/70 transition-[width] duration-500"
              style={{ width: `${Math.min(100, wlPct)}%`, boxShadow: '0 0 8px rgba(34,211,238,0.4)' }}
            />
            <div
              className="absolute top-0 h-full w-px bg-amber-300"
              style={{ left: `${Math.min(100, (thr / Math.max(wl, thr || 1)) * 100)}%` }}
              title="Danger threshold"
            />
          </div>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Δ to danger · {(wl - thr).toFixed(2)} m
          </p>
        </div>

        {/* Rainfall */}
        <div className="rounded-sm border border-white/5 bg-slate-950/50 p-3 md:col-span-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <Droplets size={11} /> Rainfall · 24h windows
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <RainBar label="Past 24h" value={frame.past_24h_rain_mm ?? 0} max={250} />
            <RainBar label="Next 24h" value={frame.next_24h_rain_mm ?? 0} max={250} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RainBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = value >= 100 ? '#3b82f6' : value >= 50 ? '#22d3ee' : '#67e8f9';
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
        <span className="font-mono text-xs tabular-nums text-cyan-100">{value.toFixed(1)} mm</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-sm bg-white/5">
        <div
          className="h-full rounded-sm transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${color}55`,
          }}
        />
      </div>
    </div>
  );
}

function LeadTimeTimeline({
  frames,
  currentIdx,
  firstAlertHours,
  onSelect,
}: {
  frames: ReplayHistoricalFrame[];
  currentIdx: number;
  firstAlertHours: number | null;
  onSelect: (idx: number) => void;
}) {
  return (
    <div className="rounded-sm border border-white/5 bg-slate-950/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Lead-Time Timeline</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          {frames.length} frame{frames.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="relative pt-3">
        {/* baseline */}
        <div className="absolute left-2 right-2 top-[28px] h-px bg-white/10" />
        <div className="relative flex justify-between">
          {frames.map((f, i) => {
            const active = i === currentIdx;
            const isFirst = firstAlertHours !== null && f.hours_before_event === firstAlertHours;
            const tone = f.triggered ? 'nominal' : 'idle';
            return (
              <button
                key={`${f.hours_before_event}-${i}`}
                type="button"
                onClick={() => onSelect(i)}
                className={`group relative flex w-16 flex-col items-center transition ${
                  active ? '' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition ${
                    active
                      ? 'border-cyan-300 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                      : f.triggered
                        ? 'border-emerald-400/60 bg-emerald-500/30'
                        : 'border-white/15 bg-slate-900'
                  }`}
                >
                  <StatusLed tone={tone} size={4} pulse={active} />
                </span>
                <span
                  className={`mt-2 font-mono text-[10px] uppercase tracking-widest ${
                    active ? 'text-cyan-200' : 'text-slate-500 group-hover:text-cyan-200'
                  }`}
                >
                  {f.hours_before_event === 0 ? 'T = 0' : `T − ${f.hours_before_event}h`}
                </span>
                {isFirst ? (
                  <span className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-emerald-300">
                    ★ first
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={Math.max(0, frames.length - 1)}
        value={currentIdx}
        onChange={(e) => onSelect(Number(e.target.value))}
        aria-label="Replay frame slider"
        className="mt-4 h-1 w-full cursor-pointer appearance-none rounded-sm bg-white/10 accent-cyan-400"
      />
    </div>
  );
}

function RecommendedBanner({
  currentDescription,
  recommended,
  onUseRecommended,
}: {
  currentDescription: string;
  recommended: ReplayHistoricalEventInfo;
  onUseRecommended: () => void;
}) {
  const recDesc =
    recommended.description ?? `${recommended.region ?? '—'} · ${recommended.river_name ?? '—'}`;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-amber-400/30 bg-amber-500/5 px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-amber-200/90">
        Showing <span className="text-amber-100">{currentDescription}</span>
        <span className="text-amber-300/60"> · Recommended </span>
        <span className="text-amber-100">{recDesc}</span>
      </p>
      <button
        type="button"
        onClick={onUseRecommended}
        className="flex items-center gap-1 rounded-sm border border-amber-400/40 bg-amber-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-100 hover:bg-amber-500/15"
      >
        Switch to recommended
      </button>
    </div>
  );
}

function EventPicker({
  events,
  activeEventId,
  selectedEventId,
  onSelect,
  onResetDefault,
}: {
  events: ReplayHistoricalEventInfo[];
  activeEventId?: string;
  selectedEventId?: string;
  onSelect: (event: ReplayHistoricalEventInfo) => void;
  onResetDefault: () => void;
}) {
  return (
    <div className="rounded-sm border border-white/5 bg-slate-950/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Historical Catalog · {events.length} verified events
        </p>
        <button
          type="button"
          onClick={onResetDefault}
          className="flex items-center gap-1 rounded-sm border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200"
        >
          Use recommended demo
        </button>
      </div>

      <div className="max-h-56 space-y-1 overflow-auto pr-1">
        {events.map((ev) => {
          const tone = severityTone(ev.severity);
          const isActive = ev.event_id === activeEventId;
          const isSelected = ev.event_id === selectedEventId;
          return (
            <button
              key={ev.event_id}
              type="button"
              onClick={() => onSelect(ev)}
              className={`grid w-full grid-cols-[14px_1fr_auto_auto] items-center gap-2 rounded-sm border px-2 py-1.5 text-left font-mono text-[11px] transition ${
                isActive
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                  : isSelected
                    ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100'
                    : 'border-white/5 bg-slate-950/50 text-slate-300 hover:border-cyan-400/25 hover:bg-cyan-500/5'
              }`}
            >
              <StatusLed tone={tone} size={6} />
              <span className="truncate">
                <span className="text-cyan-200">{ev.region}</span>
                <span className="text-slate-600"> · </span>
                {ev.river_name}
                <span className="text-slate-600"> · </span>
                <span className="text-slate-500">{fmtDate(ev.start_timestamp)}</span>
              </span>
              <span
                className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${
                  tone === 'critical'
                    ? 'bg-red-500/15 text-red-200 ring-1 ring-red-500/30'
                    : tone === 'warning'
                      ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
                      : 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/30'
                }`}
              >
                {ev.severity ?? '—'}
              </span>
              <span className="shrink-0 text-slate-400 tabular-nums">
                {ev.peak_water_level !== null && ev.peak_water_level !== undefined
                  ? `${ev.peak_water_level.toFixed(1)} m`
                  : '—'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
