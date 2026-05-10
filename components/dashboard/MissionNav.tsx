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
} from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Theatre', icon: MapIcon },
  { href: '/dashboard/risk', label: 'Risk', icon: Activity },
  { href: '/dashboard/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/dashboard/rainfall', label: 'Rainfall', icon: CloudRain },
  { href: '/dashboard/forecast', label: 'Forecast', icon: Satellite },
  { href: '/dashboard/ml', label: 'ML', icon: Brain },
  { href: '/dashboard/replay', label: 'Replay', icon: Film },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;

export default function MissionNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex h-full w-full flex-col items-center gap-1 border-r border-cyan-400/15 bg-[#04080f] py-3">
      <Link
        href="/"
        title="ModelEarth"
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 transition hover:border-cyan-300/60"
      >
        <Radio size={16} strokeWidth={1.6} />
      </Link>
      <div className="my-1 h-px w-8 bg-cyan-400/15" />
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-md border transition ${
              active
                ? 'border-cyan-400/45 bg-cyan-500/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                : 'border-transparent text-slate-500 hover:border-cyan-400/25 hover:bg-white/5 hover:text-cyan-200'
            }`}
          >
            <Icon size={16} strokeWidth={1.5} />
            {active ? <span className="absolute -right-px top-2 h-6 w-0.5 rounded-l-sm bg-cyan-400" /> : null}
            <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-sm border border-cyan-400/25 bg-slate-950/95 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
