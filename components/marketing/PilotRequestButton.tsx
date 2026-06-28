'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import PilotRequestModal from '@/components/dashboard/PilotRequestModal';

type Props = {
  className?: string;
  variant?: 'outline' | 'ghost';
};

export default function PilotRequestButton({ className = '', variant = 'outline' }: Props) {
  const [open, setOpen] = useState(false);

  const base =
    variant === 'outline'
      ? 'inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/5 px-8 py-3.5 text-sm font-medium text-emerald-100 transition hover:border-emerald-400/55 hover:bg-emerald-500/10'
      : 'inline-flex items-center gap-2 text-sm font-medium text-emerald-300 transition hover:text-emerald-100';

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${base} ${className}`}>
        <Shield size={16} />
        Request district pilot
      </button>
      <PilotRequestModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
