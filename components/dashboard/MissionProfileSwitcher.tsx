'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Shield, LineChart, Lock } from 'lucide-react';
import { useMission, type MissionProfile } from '@/components/dashboard/MissionContext';
import { opsText } from '@/lib/ui/mode-copy';

const profiles: { id: MissionProfile; labelKey: 'profileOps' | 'profileAnalytics'; short: string; icon: typeof Shield; pilotOnly?: boolean }[] = [
  { id: 'operational', labelKey: 'profileOps', short: 'Ops', icon: Shield },
  { id: 'analytics', labelKey: 'profileAnalytics', short: 'Data', icon: LineChart, pilotOnly: true },
];

export default function MissionProfileSwitcher({ className = '' }: { className?: string }) {
  const { missionProfile, setMissionProfile, hasPilotAccess, openPilotRequest, uiMode } = useMission();
  const std = uiMode === 'standard';
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (profile: MissionProfile) => {
    if (profile === missionProfile) return;
    if (profile === 'analytics' && !hasPilotAccess) {
      openPilotRequest('Analytics telemetry and ML observability require district pilot access.');
      return;
    }
    setMissionProfile(profile);
    if (profile === 'operational') {
      if (!pathname.startsWith('/dashboard/ops')) {
        router.push('/dashboard/ops');
      }
    } else if (pathname.startsWith('/dashboard/ops')) {
      router.push('/dashboard');
    }
  };

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`} role="group" aria-label="Mission profile">
      <p className={std ? 'text-[10px] font-medium uppercase tracking-wide text-slate-500' : 'font-mono text-[9px] uppercase tracking-[0.28em] text-slate-500'}>
        {opsText(uiMode, 'profileLabel')}
      </p>
      <div
        className={
          std
            ? 'flex items-stretch rounded-md border border-slate-200 bg-white p-0.5 shadow-sm'
            : 'flex items-stretch rounded-md border border-cyan-400/25 bg-[#04080f] p-0.5 shadow-[0_0_24px_rgba(34,211,238,0.06)]'
        }
      >
        {profiles.map((p) => {
          const Icon = p.icon;
          const active = missionProfile === p.id;
          const locked = p.pilotOnly && !hasPilotAccess;
          const label = opsText(uiMode, p.labelKey);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => switchTo(p.id)}
              title={locked ? `${label} (pilot access required)` : label}
              className={`flex min-h-[34px] items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition ${
                active
                  ? std
                    ? 'bg-blue-600 text-white shadow-sm'
                    : p.id === 'operational'
                      ? 'bg-emerald-500/20 text-emerald-50 ring-1 ring-emerald-400/40'
                      : 'bg-cyan-500/20 text-cyan-50 ring-1 ring-cyan-400/40'
                  : locked
                    ? std
                      ? 'text-slate-400 hover:bg-slate-50'
                      : 'text-slate-600 hover:bg-white/5 hover:text-slate-400'
                    : std
                      ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {locked ? <Lock size={11} /> : <Icon size={13} strokeWidth={1.6} />}
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{p.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
