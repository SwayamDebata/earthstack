'use client';

import { CheckCircle2, CircleAlert, Eye } from 'lucide-react';
import type { OperationalAction } from '@/lib/operational/narrative';

const priorityMeta = {
  immediate: {
    icon: CircleAlert,
    label: 'Immediate',
    text: 'text-red-200',
    border: 'border-red-400/30',
  },
  prepare: {
    icon: CheckCircle2,
    label: 'Prepare',
    text: 'text-amber-200',
    border: 'border-amber-400/30',
  },
  monitor: {
    icon: Eye,
    label: 'Monitor',
    text: 'text-cyan-200',
    border: 'border-cyan-400/30',
  },
} as const;

export default function ActionRecommendations({ actions }: { actions: OperationalAction[] }) {
  return (
    <section className="rounded-md border border-emerald-400/20 bg-emerald-950/20 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200">
        Action · What should be done?
      </p>
      <ul className="mt-3 space-y-2">
        {actions.map((action) => {
          const meta = priorityMeta[action.priority];
          const Icon = meta.icon;
          return (
            <li
              key={action.text}
              className={`flex items-start gap-2.5 rounded-sm border bg-black/30 px-3 py-2 ${meta.border}`}
            >
              <Icon size={14} className={`mt-0.5 shrink-0 ${meta.text}`} />
              <div>
                <span className={`font-mono text-[9px] uppercase tracking-widest ${meta.text}`}>
                  {meta.label}
                </span>
                <p className="text-sm text-slate-100">{action.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
