'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Shield, LineChart } from 'lucide-react';
import { useMission, type MissionProfile } from '@/components/dashboard/MissionContext';

const profiles: { id: MissionProfile; label: string; short: string; icon: typeof Shield }[] = [
  { id: 'operational', label: 'Operational Intelligence', short: 'Operational', icon: Shield },
  { id: 'analytics', label: 'Analytics & Telemetry', short: 'Analytics', icon: LineChart },
];

/**
 * Mission profile control - separated from system telemetry in the shell header.
 */
export default function MissionProfileSwitcher({ className = '' }: { className?: string }) {
  const { missionProfile, setMissionProfile } = useMission();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (profile: MissionProfile) => {
    if (profile === missionProfile) return;
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
    <div
      className={`flex flex-col items-center gap-1 ${className}`}
      role="group"
      aria-label="Mission profile"
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-slate-500">
        Mission profile
      </p>
      <div className="flex items-stretch rounded-md border border-cyan-400/25 bg-[#04080f] p-0.5 shadow-[0_0_24px_rgba(34,211,238,0.06)]">
        {profiles.map((p) => {
          const Icon = p.icon;
          const active = missionProfile === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => switchTo(p.id)}
              title={p.label}
              className={`flex min-h-[34px] items-center gap-2 rounded-sm px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
                active
                  ? p.id === 'operational'
                    ? 'bg-emerald-500/20 text-emerald-50 ring-1 ring-emerald-400/40'
                    : 'bg-cyan-500/20 text-cyan-50 ring-1 ring-cyan-400/40'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon size={13} strokeWidth={1.6} />
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
