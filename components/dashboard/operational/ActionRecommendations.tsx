'use client';

import { CheckCircle2, CircleAlert, Eye } from 'lucide-react';
import type { OperationalAction } from '@/lib/operational/narrative';
import { useMission } from '@/components/dashboard/MissionContext';
import { opsText } from '@/lib/ui/mode-copy';

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
  const { uiMode } = useMission();
  const std = uiMode === 'standard';

  return (
    <section
      className={
        std
          ? 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm'
          : 'rounded-md border border-emerald-400/20 bg-emerald-950/20 p-4'
      }
    >
      <p
        className={
          std
            ? 'text-xs font-semibold uppercase tracking-wide text-slate-500'
            : 'font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200'
        }
      >
        {opsText(uiMode, 'actionLabel')}
      </p>
      <ul className="mt-3 space-y-2">
        {actions.map((action) => {
          const meta = priorityMeta[action.priority];
          const Icon = meta.icon;
          return (
            <li
              key={action.text}
              className={`flex items-start gap-2.5 rounded-md border px-3 py-2 ${
                std
                  ? action.priority === 'immediate'
                    ? 'border-red-200 bg-red-50'
                    : action.priority === 'prepare'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-slate-200 bg-slate-50'
                  : `bg-black/30 ${meta.border}`
              }`}
            >
              <Icon
                size={14}
                className={`mt-0.5 shrink-0 ${std ? 'text-slate-600' : meta.text}`}
                strokeWidth={1.8}
              />
              <p className={`text-sm leading-snug ${std ? 'text-slate-800' : 'text-slate-200'}`}>
                <span
                  className={`mr-1.5 text-[10px] font-semibold uppercase tracking-wide ${
                    std ? 'text-slate-500' : meta.text
                  }`}
                >
                  {meta.label}:
                </span>
                {action.text}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
