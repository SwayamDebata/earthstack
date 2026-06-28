'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Shield, LineChart, Lock } from 'lucide-react';
import { useMission, type MissionProfile } from '@/components/dashboard/MissionContext';

const profiles: { id: MissionProfile; label: string; short: string; icon: typeof Shield; pilotOnly?: boolean }[] = [
  { id: 'operational', label: 'Operational Intelligence', short: 'Operational', icon: Shield },
  { id: 'analytics', label: 'Analytics & Telemetry', short: 'Analytics', icon: LineChart, pilotOnly: true },
];

export default function MissionProfileSwitcher({ className = '' }: { className?: string }) {
  const { missionProfile, setMissionProfile, hasPilotAccess, openPilotRequest } = useMission();
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
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-slate-500">Mission profile</p>
      <div className="flex items-stretch rounded-md border border-cyan-400/25 bg-[#04080f] p-0.5 shadow-[0_0_24px_rgba(34,211,238,0.06)]">
        {profiles.map((p) => {
          const Icon = p.icon;
          const active = missionProfile === p.id;
          const locked = p.pilotOnly && !hasPilotAccess;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => switchTo(p.id)}
              title={locked ? `${p.label} (pilot access required)` : p.label}
              className={`flex min-h-[34px] items-center gap-2 rounded-sm px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
                active
                  ? p.id === 'operational'
                    ? 'bg-emerald-500/20 text-emerald-50 ring-1 ring-emerald-400/40'
                    : 'bg-cyan-500/20 text-cyan-50 ring-1 ring-cyan-400/40'
                  : locked
                    ? 'text-slate-600 hover:bg-white/5 hover:text-slate-400'
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {locked ? <Lock size={11} /> : <Icon size={13} strokeWidth={1.6} />}
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
