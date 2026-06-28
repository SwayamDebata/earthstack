'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Waves,
  X,
} from 'lucide-react';
import type { ReplayHistoricalDemo, ReplayHistoricalFrame } from '@/lib/api/schemas';
import { useSound } from '@/components/audio/SoundProvider';
import SoundToggle from '@/components/audio/SoundToggle';

function fmtDate(iso?: string) {
  if (!iso) return 'n/a';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function OperationalProofModal({ open, onClose }: Props) {
  const { enabled, playReplayTick, playReplayAlert, startAmbient } = useSound();
  const [data, setData] = useState<ReplayHistoricalDemo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frameIdx, setFrameIdx] = useState(0);
  const prevFrameRef = useRef(-1);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFrameIdx(0);
    prevFrameRef.current = -1;

    fetch('/api/proxy/replay/historical/demo')
      .then(async (res) => {
        if (!res.ok) throw new Error('Replay proof unavailable');
        return res.json() as Promise<ReplayHistoricalDemo>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load proof');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const frames = useMemo(() => data?.frames ?? [], [data]);
  const event = data?.event;
  const firstAlert = data?.first_alert_hours_before ?? null;
  const current = frames[frameIdx];

  useEffect(() => {
    if (!open || frames.length <= 1) return;
    const id = window.setInterval(() => {
      setFrameIdx((i) => (i + 1) % frames.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, [open, frames.length]);

  const triggeredCount = frames.filter((f) => f.triggered).length;

  useEffect(() => {
    if (!open) {
      prevFrameRef.current = -1;
      return;
    }
    if (!enabled || loading || frames.length === 0) return;
    startAmbient();
  }, [open, enabled, loading, frames.length, startAmbient]);

  useEffect(() => {
    if (!open || !enabled || loading || !current) return;
    const prev = prevFrameRef.current;
    prevFrameRef.current = frameIdx;
    if (prev < 0 || prev === frameIdx) return;
    if (current.triggered) playReplayAlert();
    else playReplayTick();
  }, [open, enabled, loading, frameIdx, current, playReplayTick, playReplayAlert]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020408]/92 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 flex max-h-[min(92vh,820px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#071018] via-[#060b14] to-[#04080f] shadow-[0_0_120px_rgba(16,185,129,0.12)]"
          >
            <span className="hud-bracket hud-bracket-tl" />
            <span className="hud-bracket hud-bracket-br" />

            <header className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4 md:px-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-300/80">
                  Operational proof · verified historical replay
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">
                  We would have warned before the flood
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <SoundToggle compact />
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20">
                  <Loader2 className="animate-spin text-emerald-300" size={28} />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Loading verified flood replay…
                  </p>
                </div>
              ) : error ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-red-300">{error}</p>
                  <Link
                    href="/dashboard/ops/replay?tour=1"
                    onClick={onClose}
                    className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cyan-300"
                  >
                    Open full replay tour <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
                  <div className="border-b border-white/8 p-5 md:p-6 lg:border-b-0 lg:border-r">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-100">
                      <CheckCircle2 size={12} />
                      Live API · verified historical events
                    </div>

                    {event ? (
                      <div className="space-y-3">
                        <h3 className="text-2xl font-semibold text-white">
                          {event.region ?? 'Region'}
                          <span className="text-slate-500"> · </span>
                          <span className="text-cyan-200">{event.river_name ?? 'River basin'}</span>
                        </h3>
                        <p className="text-sm text-slate-400">
                          {event.description ?? 'Verified severe flood event'} · {fmtDate(event.start_timestamp)}
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <Stat label="Peak water" value={`${event.peak_water_level?.toFixed(1) ?? 'n/a'} m`} />
                          <Stat label="Severity" value={event.severity ?? 'n/a'} />
                          <Stat
                            label="First alert"
                            value={firstAlert !== null ? `T-${firstAlert}h` : 'n/a'}
                            highlight
                          />
                          <Stat label="Frames scored" value={`${triggeredCount}/${frames.length} triggered`} />
                        </div>
                      </div>
                    ) : null}

                    <p className="mt-6 text-sm leading-relaxed text-slate-300">
                      This is not a marketing animation. ModelEarth replays verified flood onset against the rule engine
                      timeline, showing when districts would have received operational warning.
                    </p>

                    <ul className="mt-4 space-y-2 text-sm text-slate-400">
                      <li className="flex gap-2">
                        <span className="text-emerald-400">1.</span> Observe rainfall and river signals before onset
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-400">2.</span> Score risk with hybrid rule + ML infrastructure
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-400">3.</span> Prove alert timing with historical evidence
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col bg-black/25 p-5 md:p-6">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Lead-time playback
                    </p>

                    {current ? (
                      <FrameCard
                        frame={current}
                        firstAlert={firstAlert}
                        frameIdx={frameIdx}
                      />
                    ) : null}

                    <div className="mt-4 flex gap-1">
                      {frames.map((f, i) => (
                        <button
                          key={`${f.hours_before_event}-${i}`}
                          type="button"
                          onClick={() => setFrameIdx(i)}
                          className={`h-1.5 flex-1 rounded-full transition ${
                            i === frameIdx
                              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                              : f.triggered
                                ? 'bg-emerald-600/50'
                                : 'bg-white/10'
                          }`}
                          aria-label={`Frame T-${f.hours_before_event}h`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-5 py-4 md:px-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                ModelEarth · rule engine v2 simulation
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/ops/replay?tour=1"
                  onClick={onClose}
                  className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-emerald-100 transition hover:bg-emerald-500/20"
                >
                  Full replay tour
                </Link>
                <Link
                  href="/dashboard/ops"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white"
                >
                  Command center <ArrowRight size={12} />
                </Link>
              </div>
            </footer>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function FrameCard({
  frame,
  firstAlert,
  frameIdx,
}: {
  frame: ReplayHistoricalFrame;
  firstAlert: number | null;
  frameIdx: number;
}) {
  return (
    <motion.div
      key={`${frame.hours_before_event}-${frameIdx}`}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 rounded-lg border border-emerald-400/20 bg-emerald-950/20 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
            frame.hours_before_event === 0
              ? 'border-red-400/40 bg-red-500/10 text-red-200'
              : 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
          }`}
        >
          <Clock size={11} />
          {frame.hours_before_event === 0 ? 'Flood onset' : `T - ${frame.hours_before_event}h`}
        </span>
        {frame.triggered ? (
          <span className="inline-flex items-center gap-1 rounded-sm border border-emerald-400/35 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-200">
            <AlertTriangle size={11} />
            Would have alerted
          </span>
        ) : null}
        {firstAlert !== null && frame.hours_before_event === firstAlert ? (
          <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-300">★ First alert</span>
        ) : null}
      </div>

      {frame.narrative ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{frame.narrative}</p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <MiniMetric
          icon={Waves}
          label="Water"
          value={frame.water_level_m !== undefined ? `${frame.water_level_m.toFixed(1)} m` : 'n/a'}
        />
        <MiniMetric
          label="Rule score"
          value={frame.rule_score !== undefined ? frame.rule_score.toFixed(3) : 'n/a'}
        />
        <MiniMetric label="Risk" value={frame.risk_level ?? 'n/a'} />
        <MiniMetric
          icon={MapPin}
          label="Threshold"
          value={frame.flood_threshold_m !== undefined ? `${frame.flood_threshold_m.toFixed(1)} m` : 'n/a'}
        />
      </div>
    </motion.div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        highlight ? 'border-emerald-400/25 bg-emerald-500/10' : 'border-white/8 bg-black/30'
      }`}
    >
      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${highlight ? 'text-emerald-100' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function MiniMetric({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Waves;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-sm border border-white/5 bg-slate-950/50 px-2 py-1.5">
      <p className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-slate-500">
        {Icon ? <Icon size={10} /> : null}
        {label}
      </p>
      <p className="mt-0.5 font-mono text-xs text-cyan-100">{value}</p>
    </div>
  );
}
