'use client';

import { useEffect, useRef, useState } from 'react';
import { KeyRound, Loader2, Shield, X } from 'lucide-react';
import {
  grantPilotAccess,
  savePilotRequest,
  verifyUnlockCode,
  type PilotRequestPayload,
} from '@/lib/access/pilot';
import { useSoundOptional } from '@/components/audio/SoundProvider';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  onGranted?: () => void;
  reason?: string;
};

type Panel = 'request' | 'unlock';

export default function PilotRequestModal({
  open,
  onClose,
  onSubmitted,
  onGranted,
  reason,
}: Props) {
  const sound = useSoundOptional();
  const uiMode = useDashboardUiMode();
  const std = uiMode === 'standard';
  const unlockInputRef = useRef<HTMLInputElement>(null);
  const [panel, setPanel] = useState<Panel>('request');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [useCase, setUseCase] = useState('');
  const [unlockCode, setUnlockCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'granted'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setStatus('idle');
      setError('');
      setPanel('request');
    }
  }, [open]);

  useEffect(() => {
    if (open && panel === 'unlock') {
      unlockInputRef.current?.focus();
    }
  }, [open, panel]);

  if (!open) return null;

  const tryUnlock = () => {
    setError('');
    if (!unlockCode.trim()) {
      setError('Enter your pilot unlock code.');
      return;
    }
    if (!verifyUnlockCode(unlockCode)) {
      setError('Invalid pilot unlock code. Contact ModelEarth if you were approved.');
      return;
    }
    grantPilotAccess();
    setStatus('granted');
    sound?.playUiConfirm();
    onGranted?.();
  };

  const submitRequest = async () => {
    setError('');
    if (!name.trim() || !organization.trim() || !email.trim()) {
      setError('Name, organization, and email are required.');
      return;
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    setStatus('submitting');
    const payload: Omit<PilotRequestPayload, 'submittedAt'> = {
      name: name.trim(),
      organization: organization.trim(),
      email: email.trim(),
      region: region.trim() || 'Unspecified',
      useCase: useCase.trim() || 'District operational pilot',
    };

    try {
      const res = await fetch('/api/pilot-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { detail?: string };
        setError(data.detail ?? 'Could not send request. Try again or email us directly.');
        setStatus('idle');
        return;
      }
    } catch {
      setError('Network error. Check your connection and try again.');
      setStatus('idle');
      return;
    }

    savePilotRequest(payload);
    setStatus('submitted');
    sound?.playUiConfirm();
    onSubmitted?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={
          std
            ? 'pilot-modal relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl'
            : 'pilot-modal relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-emerald-400/25 bg-[#060b18] shadow-[0_0_60px_rgba(16,185,129,0.12)]'
        }
      >
        {!std ? (
          <>
            <span className="hud-bracket hud-bracket-tl" />
            <span className="hud-bracket hud-bracket-br" />
          </>
        ) : null}

        <div
          className={
            std
              ? 'flex items-start justify-between border-b border-slate-200 px-5 py-4'
              : 'flex items-start justify-between border-b border-white/10 px-5 py-4'
          }
        >
          <div className="flex items-center gap-2">
            <Shield size={18} className={std ? 'text-blue-600' : 'text-emerald-300'} />
            <div>
              <p
                className={
                  std
                    ? 'text-xs font-semibold uppercase tracking-wide text-slate-500'
                    : 'font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/80'
                }
              >
                District pilot access
              </p>
              <h2 className={`text-lg font-semibold ${std ? 'text-slate-900' : 'text-white'}`}>
                {panel === 'unlock' ? 'Enter pilot unlock code' : 'Request operational briefing'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-white/10 p-1 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {reason ? (
            <p
              className={
                std
                  ? 'rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900'
                  : 'rounded-sm border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-sm text-amber-100/90'
              }
            >
              {reason}
            </p>
          ) : null}

          {status === 'submitted' ? (
            <div className="space-y-3 py-4 text-center">
              <p className="text-emerald-200">Request received. Our team will reach out for a district pilot briefing.</p>
              <p className="text-sm text-slate-400">
                You can continue exploring the live command preview and historical replay.
              </p>
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-sm border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-emerald-100"
                >
                  Continue preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setPanel('unlock');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:border-cyan-400/35 hover:text-white"
                >
                  <KeyRound size={12} />
                  I have an unlock code
                </button>
              </div>
            </div>
          ) : status === 'granted' ? (
            <div className="space-y-3 py-4 text-center">
              <p className="text-emerald-200">Pilot access unlocked. Full analytics and alert coordination enabled.</p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-emerald-100"
              >
                Enter full command
              </button>
            </div>
          ) : (
            <>
              <div
                className={
                  std
                    ? 'flex gap-2 rounded-md border border-slate-200 bg-slate-50 p-1'
                    : 'flex gap-2 rounded-sm border border-white/10 bg-black/30 p-1'
                }
              >
                <button
                  type="button"
                  onClick={() => setPanel('request')}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    panel === 'request'
                      ? std
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-500/15 text-emerald-100'
                      : std
                        ? 'text-slate-500 hover:text-slate-800'
                        : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Request briefing
                </button>
                <button
                  type="button"
                  onClick={() => setPanel('unlock')}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    panel === 'unlock'
                      ? std
                        ? 'bg-slate-700 text-white'
                        : 'bg-cyan-500/15 text-cyan-100'
                      : std
                        ? 'text-slate-500 hover:text-slate-800'
                        : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Unlock code
                </button>
              </div>

              {panel === 'unlock' ? (
                <div className="space-y-3 rounded-md border border-cyan-400/25 bg-cyan-500/5 p-4">
                  <p className={`text-sm ${std ? 'text-slate-600' : 'text-slate-300'}`}>
                    Already approved? Paste the code we sent you after your pilot briefing.
                  </p>
                  <label className="block">
                    <span
                      className={
                        std
                          ? 'mb-1 block text-xs font-medium text-slate-600'
                          : 'mb-1 block font-mono text-[9px] uppercase tracking-widest text-cyan-300/80'
                      }
                    >
                      Pilot unlock code
                    </span>
                    <input
                      ref={unlockInputRef}
                      value={unlockCode}
                      onChange={(e) => setUnlockCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') tryUnlock();
                      }}
                      className="input-hud w-full"
                      placeholder="e.g. ME-PILOT-7K9M2X"
                      autoComplete="off"
                    />
                  </label>
                  {error ? <p className="text-sm text-red-300">{error}</p> : null}
                  <button
                    type="button"
                    onClick={tryUnlock}
                    className={
                      std
                        ? 'flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'
                        : 'flex w-full items-center justify-center gap-2 rounded-sm border border-cyan-400/40 bg-cyan-500/15 py-2.5 font-mono text-[10px] uppercase tracking-widest text-cyan-100 hover:bg-cyan-500/25'
                    }
                  >
                    <KeyRound size={14} />
                    Unlock pilot access
                  </button>
                </div>
              ) : (
                <>
                  <p className={`text-sm ${std ? 'text-slate-600' : 'text-slate-400'}`}>
                    Request a district briefing. Preview mode stays open for live ops and historical replay.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500">Name</span>
                      <input value={name} onChange={(e) => setName(e.target.value)} className="input-hud w-full" />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500">
                        Organization
                      </span>
                      <input
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="input-hud w-full"
                        placeholder="District administration / NGO / agency"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500">Email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-hud w-full"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500">Region</span>
                      <input
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="input-hud w-full"
                        placeholder="Cuttack, Puri, …"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500">
                        Use case
                      </span>
                      <textarea
                        value={useCase}
                        onChange={(e) => setUseCase(e.target.value)}
                        rows={2}
                        className="input-hud w-full resize-none"
                        placeholder="Flood season coordination, district pilot, investor briefing…"
                      />
                    </label>
                  </div>
                  {error ? <p className="text-sm text-red-300">{error}</p> : null}
                  <button
                    type="button"
                    disabled={status === 'submitting'}
                    onClick={() => void submitRequest()}
                    className={
                      std
                        ? 'flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50'
                        : 'flex w-full items-center justify-center gap-2 rounded-sm border border-emerald-400/40 bg-emerald-500/15 py-2.5 font-mono text-[10px] uppercase tracking-widest text-emerald-100 hover:bg-emerald-500/25 disabled:opacity-50'
                    }
                  >
                    {status === 'submitting' ? <Loader2 size={14} className="animate-spin" /> : null}
                    Submit pilot request
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
