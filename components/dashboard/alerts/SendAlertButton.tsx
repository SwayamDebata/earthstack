'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Loader2, Lock } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { parseApiErrorMessage, type NotifyProvider } from '@/lib/api/alerts';
import { useMission } from '@/components/dashboard/MissionContext';

type Props = {
  alertId: number;
  provider?: NotifyProvider;
  contactIds?: number[];
  compact?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function SendAlertButton({
  alertId,
  provider = 'twilio_whatsapp',
  contactIds,
  compact = false,
  disabled = false,
  className = '',
}: Props) {
  const queryClient = useQueryClient();
  const { hasPilotAccess, openPilotRequest } = useMission();
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useMutation({
    mutationFn: () => {
      const body: { provider: NotifyProvider; contact_ids?: number[] } = { provider };
      if (contactIds?.length) body.contact_ids = contactIds;
      return api.notifyAlert(alertId, body);
    },
    onSuccess: () => {
      setFeedback('success');
      setErrorMsg('');
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setTimeout(() => setFeedback('idle'), 2500);
    },
    onError: (err) => {
      setFeedback('error');
      setErrorMsg(parseApiErrorMessage(err));
      setTimeout(() => setFeedback('idle'), 4000);
    },
  });

  const isPending = mutation.isPending;
  const isSuccess = feedback === 'success';
  const isError = feedback === 'error';

  if (!hasPilotAccess) {
    return (
      <button
        type="button"
        onClick={() => openPilotRequest('Alert dispatch requires district pilot access.')}
        className={`inline-flex items-center gap-1 rounded-sm border border-emerald-400/30 bg-emerald-500/5 font-mono uppercase tracking-widest text-emerald-200/90 transition hover:bg-emerald-500/10 ${
          compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'
        } ${className}`}
      >
        <Lock size={compact ? 10 : 11} />
        {compact ? 'Pilot' : 'Pilot access'}
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-end gap-0.5 ${className}`}>
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={() => mutation.mutate()}
        title={isError ? errorMsg : 'Send WhatsApp alert to matching contacts'}
        className={`inline-flex items-center gap-1 rounded-sm border font-mono uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-40 ${
          compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'
        } ${
          isSuccess
            ? 'border-emerald-400/45 bg-emerald-500/15 text-emerald-200'
            : isError
              ? 'border-red-400/45 bg-red-500/15 text-red-200'
              : 'border-amber-400/40 bg-amber-500/10 text-amber-100 hover:border-amber-300/55 hover:bg-amber-500/20'
        }`}
      >
        {isPending ? (
          <Loader2 size={compact ? 10 : 11} className="animate-spin" />
        ) : isSuccess ? (
          <Check size={compact ? 10 : 11} />
        ) : (
          <Bell size={compact ? 10 : 11} />
        )}
        {isPending ? 'Sending…' : isSuccess ? 'Sent' : isError ? 'Failed' : compact ? 'Notify' : 'Send Alert'}
      </button>
      {isError && errorMsg && !compact ? (
        <span className="max-w-[180px] truncate text-right font-mono text-[9px] text-red-300/90">{errorMsg}</span>
      ) : null}
    </div>
  );
}
