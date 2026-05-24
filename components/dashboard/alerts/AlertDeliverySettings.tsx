'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { parseApiErrorMessage } from '@/lib/api/alerts';
import { useMission } from '@/components/dashboard/MissionContext';
import HudFrame from '@/components/dashboard/HudFrame';
import { ErrorBlock, Telemetry } from '@/components/dashboard/Atoms';
import { formatScalar } from '@/lib/api/payload';

export default function AlertDeliverySettings() {
  const { location } = useMission();
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('Heavy rainfall expected in low-lying areas.');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const infoQ = useQuery({
    queryKey: ['alert-delivery-info'],
    queryFn: () => api.alertDeliveryInfo(),
    staleTime: 120_000,
  });

  const testMutation = useMutation({
    mutationFn: () =>
      api.testWhatsAppDelivery({
        phone_e164: phone.trim(),
        region: location,
        severity: 'HIGH',
        risk_score: 78,
        details: details.trim(),
      }),
    onSuccess: (data) => {
      setTestError(null);
      setTestResult(JSON.stringify(data, null, 2));
    },
    onError: (err) => {
      setTestResult(null);
      setTestError(parseApiErrorMessage(err));
    },
  });

  const info = infoQ.data as Record<string, unknown> | undefined;
  const provider = formatScalar(info?.provider ?? info?.active_provider ?? '—');
  const configured = info?.configured ?? info?.whatsapp_configured;

  return (
    <div className="space-y-3">
      <HudFrame
        label="ALERT DELIVERY"
        subtitle="GET /alerts/delivery/info"
        status={infoQ.isError ? 'critical' : 'info'}
        statusText={infoQ.isLoading ? 'SYNC' : 'LIVE'}
      >
        {infoQ.isError ? (
          <ErrorBlock onRetry={() => void infoQ.refetch()} message="delivery info endpoint failed" />
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Telemetry label="ACTIVE PROVIDER" value={provider} />
            <Telemetry
              label="WHATSAPP CONFIG"
              value={configured === undefined ? 'unknown' : configured ? 'configured' : 'not configured'}
              tone={configured === false ? 'warning' : configured ? 'nominal' : undefined}
            />
            {info
              ? Object.entries(info)
                  .slice(0, 4)
                  .filter(([k]) => !['provider', 'active_provider', 'configured', 'whatsapp_configured'].includes(k))
                  .map(([k, v]) => (
                    <Telemetry key={k} label={k} value={formatScalar(v)} />
                  ))
              : null}
          </div>
        )}
      </HudFrame>

      <HudFrame label="TEST WHATSAPP" subtitle="POST /alerts/delivery/test-whatsapp · dev only" status="warning" statusText="DEV">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500">PHONE (E.164)</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+917978159148"
              className="input-hud w-full"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500">DETAILS</span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              className="input-hud w-full resize-none"
            />
          </label>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
            Uses mission region: {location} · severity HIGH · risk 78
          </p>
          <button
            type="button"
            disabled={testMutation.isPending || !phone.trim().startsWith('+')}
            onClick={() => testMutation.mutate()}
            className="flex items-center gap-1.5 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {testMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <MessageCircle size={11} />}
            Send test message
          </button>
          {testError ? (
            <p className="rounded-sm border border-red-500/30 bg-red-500/5 px-2 py-1.5 font-mono text-[10px] text-red-200">{testError}</p>
          ) : null}
          {testResult ? (
            <pre className="max-h-40 overflow-auto rounded-sm border border-white/5 bg-black/50 p-2 font-mono text-[10px] text-emerald-200/90">
              {testResult}
            </pre>
          ) : null}
        </div>
      </HudFrame>
    </div>
  );
}
