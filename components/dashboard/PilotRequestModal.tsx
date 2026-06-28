'use client';

import { useState } from 'react';
import { Loader2, Shield, X } from 'lucide-react';
import {
  grantPilotAccess,
  savePilotRequest,
  verifyUnlockCode,
  type PilotRequestPayload,
} from '@/lib/access/pilot';
import { useSoundOptional } from '@/components/audio/SoundProvider';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  onGranted?: () => void;
  reason?: string;
};

export default function PilotRequestModal({
  open,
  onClose,
  onSubmitted,
  onGranted,
  reason,
}: Props) {
  const sound = useSoundOptional();
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [useCase, setUseCase] = useState('');
  const [unlockCode, setUnlockCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'granted'>('idle');
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async () => {
    setError('');
    if (!name.trim() || !organization.trim() || !email.trim()) {
      setError('Name, organization, and email are required.');
      return;
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    if (unlockCode.trim() && verifyUnlockCode(unlockCode)) {
      grantPilotAccess();
      setStatus('granted');
      sound?.playUiConfirm();
      onGranted?.();
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
      await fetch('/api/pilot-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      /* still persist locally */
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
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-emerald-400/25 bg-[#060b18] shadow-[0_0_60px_rgba(16,185,129,0.12)]">
        <span className="hud-bracket hud-bracket-tl" />
        <span className="hud-bracket hud-bracket-br" />

        <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-emerald-300" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/80">
                District pilot access
              </p>
              <h2 className="text-lg font-semibold text-white">Request operational briefing</h2>
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
            <p className="rounded-sm border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-sm text-amber-100/90">
              {reason}
            </p>
          ) : null}

          {status === 'submitted' ? (
            <div className="space-y-3 py-4 text-center">
              <p className="text-emerald-200">Request received. Our team will reach out for a district pilot briefing.</p>
              <p className="text-sm text-slate-400">
                You can continue exploring the live command preview and historical replay.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-emerald-100"
              >
                Continue preview
              </button>
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
              <p className="text-sm text-slate-400">
                Unlock alert coordination, analytics telemetry, and district configuration. Preview mode stays open for
                live ops and historical replay.
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
              <label className="block">
                <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  Pilot unlock code (optional, for approved partners)
                </span>
                <input
                  value={unlockCode}
                  onChange={(e) => setUnlockCode(e.target.value)}
                  className="input-hud w-full"
                  placeholder="Provided by ModelEarth team"
                />
              </label>
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
              <button
                type="button"
                disabled={status === 'submitting'}
                onClick={() => void submit()}
                className="flex w-full items-center justify-center gap-2 rounded-sm border border-emerald-400/40 bg-emerald-500/15 py-2.5 font-mono text-[10px] uppercase tracking-widest text-emerald-100 hover:bg-emerald-500/25 disabled:opacity-50"
              >
                {status === 'submitting' ? <Loader2 size={14} className="animate-spin" /> : null}
                Submit pilot request
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
