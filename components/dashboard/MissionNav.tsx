'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Map as MapIcon,
  Activity,
  AlertTriangle,
  CloudRain,
  Brain,
  Film,
  Settings,
  Radio,
  Satellite,
  Shield,
  History,
  Lock,
} from 'lucide-react';
import { useMission } from '@/components/dashboard/MissionContext';

const analyticsItems = [
  { href: '/dashboard', label: 'Theatre', icon: MapIcon, match: 'exact' as const },
  { href: '/dashboard/risk', label: 'Risk', icon: Activity },
  { href: '/dashboard/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/dashboard/rainfall', label: 'Rainfall', icon: CloudRain },
  { href: '/dashboard/forecast', label: 'Forecast', icon: Satellite },
  { href: '/dashboard/ml', label: 'ML', icon: Brain },
  { href: '/dashboard/replay', label: 'Replay', icon: Film },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;

const operationalItems = [
  { href: '/dashboard/ops', label: 'Command', icon: Shield, match: 'exact' as const },
  { href: '/dashboard/ops/replay', label: 'Replay', icon: History },
] as const;

const operationalPilotItems = [
  ...operationalItems,
  { href: '/dashboard/alerts', label: 'Alerts', icon: AlertTriangle },
] as const;

export default function MissionNav() {
  const pathname = usePathname();
  const { missionProfile, hasPilotAccess, openPilotRequest, uiMode } = useMission();
  const std = uiMode === 'standard';

  const items =
    missionProfile === 'operational'
      ? hasPilotAccess
        ? operationalPilotItems
        : operationalItems
      : analyticsItems;

  const isActive = (href: string, match?: 'exact') => {
    if (match === 'exact') return pathname === href;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const onNavClick = (href: string, e: React.MouseEvent) => {
    if (hasPilotAccess) return;
    if (href === '/dashboard/alerts') {
      e.preventDefault();
      openPilotRequest('Alert coordination and WhatsApp dispatch require district pilot access.');
    }
  };

  return (
    <nav
      className={
        std
          ? 'mission-nav flex h-full w-full flex-col items-center gap-1 border-r border-slate-200 bg-slate-50 py-3'
          : 'mission-nav flex h-full w-full flex-col items-center gap-1 border-r border-cyan-400/15 bg-[#04080f] py-3'
      }
    >
      <Link
        href="/"
        title="ModelEarth"
        className={
          std
            ? 'mb-2 flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-blue-600 transition hover:bg-slate-100'
            : 'mb-2 flex h-9 w-9 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 transition hover:border-cyan-300/60'
        }
      >
        <Radio size={16} strokeWidth={1.6} />
      </Link>
      <div className={`my-1 h-px w-8 ${std ? 'bg-slate-200' : 'bg-cyan-400/15'}`} />
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, 'match' in item ? item.match : undefined);
        const locked = !hasPilotAccess && item.href === '/dashboard/alerts';
        const activeClass = std
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : missionProfile === 'operational'
            ? 'border-emerald-400/45 bg-emerald-500/10 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.18)]'
            : 'border-cyan-400/45 bg-cyan-500/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)]';
        const idleClass = std
          ? 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-blue-700'
          : 'border-transparent text-slate-500 hover:border-cyan-400/25 hover:bg-white/5 hover:text-cyan-200';
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => onNavClick(item.href, e)}
            title={locked ? `${item.label} (pilot required)` : item.label}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-md border transition ${
              active ? activeClass : idleClass
            }`}
          >
            {locked ? <Lock size={14} /> : <Icon size={16} strokeWidth={1.5} />}
            {active ? (
              <span
                className={`absolute -right-px top-2 h-6 w-0.5 rounded-l-sm ${
                  std ? 'bg-blue-600' : missionProfile === 'operational' ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}
              />
            ) : null}
            {!std ? (
              <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-sm border border-cyan-400/25 bg-slate-950 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
                {item.label}
              </span>
            ) : null}
          </Link>
        );
      })}
      {!hasPilotAccess ? (
        <button
          type="button"
          onClick={() => openPilotRequest()}
          className={
            std
              ? 'mt-2 flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-white'
              : 'mt-2 flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-emerald-400/30 text-emerald-400/80 hover:bg-emerald-500/10'
          }
          title="Request district pilot"
        >
          <Lock size={14} />
        </button>
      ) : null}
    </nav>
  );
}
