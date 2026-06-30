'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, UserPlus } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { parseApiErrorMessage, type AlertContactChannel } from '@/lib/api/alerts';
import { LOCATIONS } from '@/lib/config';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import { EmptyBlock, ErrorBlock } from '@/components/dashboard/Atoms';
import { toArray } from '@/components/dashboard/util';
import { useMission } from '@/components/dashboard/MissionContext';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import { btnSecondary, fieldLabel, listRow, listRowMeta, listRowPrimary, severityBadge } from '@/lib/ui/standard-surface';

const emptyForm: {
  name: string;
  phone_e164: string;
  channel: AlertContactChannel;
  role: string;
  locations: string[];
  enabled: boolean;
} = {
  name: '',
  phone_e164: '',
  channel: 'whatsapp',
  role: 'admin',
  locations: [],
  enabled: true,
};

export default function AlertContactsPanel() {
  const queryClient = useQueryClient();
  const { hasPilotAccess, openPilotRequest } = useMission();
  const mode = useDashboardUiMode();
  const std = mode === 'standard';
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const contactsQ = useQuery({
    queryKey: ['alert-contacts'],
    queryFn: () => api.alertContacts(),
    staleTime: 60_000,
  });

  const contacts = toArray<Record<string, unknown>>(contactsQ.data);

  const createMutation = useMutation({
    mutationFn: () =>
      api.createAlertContact({
        name: form.name.trim(),
        phone_e164: form.phone_e164.trim(),
        channel: form.channel,
        role: form.role.trim() || 'admin',
        locations: form.locations.map((l) => l.toLowerCase()),
        enabled: form.enabled,
      }),
    onSuccess: () => {
      setForm(emptyForm);
      setFormError('');
      void queryClient.invalidateQueries({ queryKey: ['alert-contacts'] });
    },
    onError: (err) => setFormError(parseApiErrorMessage(err)),
  });

  const toggleLocation = (loc: string) => {
    setForm((prev) => {
      const key = loc.toLowerCase();
      const has = prev.locations.map((l) => l.toLowerCase()).includes(key);
      return {
        ...prev,
        locations: has ? prev.locations.filter((l) => l.toLowerCase() !== key) : [...prev.locations, key],
      };
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!form.phone_e164.trim().startsWith('+')) {
      setFormError('Phone must be E.164 format (e.g. +917978159148)');
      return;
    }
    if (form.phone_e164.trim().length < 11) {
      setFormError('Phone looks too short - include country code (e.g. +91 for India)');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <HudFrame
        label="ALERT CONTACTS"
        subtitle="GET /alert-contacts"
        status={contactsQ.isError ? 'critical' : 'info'}
        statusText={contactsQ.isLoading ? 'SYNC' : `${contacts.length}`}
      >
        {contactsQ.isError ? (
          <ErrorBlock onRetry={() => void contactsQ.refetch()} message="alert-contacts endpoint failed" />
        ) : contacts.length === 0 ? (
          <EmptyBlock message="no contacts registered · add one to enable Send Alert" />
        ) : (
          <div className="max-h-64 space-y-1 overflow-auto pr-1 font-mono text-[11px]">
            {contacts.map((c, idx) => {
              const enabled = c.enabled !== false;
              const locs = Array.isArray(c.locations) ? (c.locations as string[]) : [];
              return (
                <div key={String(c.id ?? idx)} className={`grid grid-cols-[18px_1fr_auto] items-center gap-2 ${listRow(mode)}`}>
                  <StatusLed tone={enabled ? 'nominal' : 'idle'} size={6} pulse={!std} />
                  <div className="min-w-0">
                    <p className={listRowPrimary(mode)}>{String(c.name ?? 'n/a')}</p>
                    <p className={listRowMeta(mode)}>
                      {String(c.phone_e164 ?? 'n/a')} · {String(c.channel ?? 'n/a')} · {String(c.role ?? 'n/a')}
                    </p>
                    <p className={listRowMeta(mode)}>{locs.length === 0 ? 'all regions' : locs.join(', ')}</p>
                  </div>
                  <span className={severityBadge(enabled ? 'nominal' : 'idle', mode)}>{enabled ? 'on' : 'off'}</span>
                </div>
              );
            })}
          </div>
        )}
        <button
          type="button"
          onClick={() => void contactsQ.refetch()}
          className={btnSecondary(mode)}
        >
          <RefreshCw size={10} /> Refresh contacts
        </button>
      </HudFrame>

      <HudFrame label="REGISTER CONTACT" subtitle="POST /alert-contacts · one-time setup" status="info" statusText="READY">
        {!hasPilotAccess ? (
          <div className="rounded-sm border border-emerald-400/25 bg-emerald-500/5 p-4 text-center">
            <p className="text-sm text-slate-300">Contact registration is available with district pilot access.</p>
            <button
              type="button"
              onClick={() => openPilotRequest()}
              className="mt-3 rounded-sm border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-100"
            >
              Request pilot access
            </button>
          </div>
        ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <Field mode={mode} label="NAME">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="District Officer"
              className="input-hud w-full"
            />
          </Field>
          <Field mode={mode} label="PHONE (E.164)">
            <input
              value={form.phone_e164}
              onChange={(e) => setForm((f) => ({ ...f, phone_e164: e.target.value }))}
              placeholder="+917978159148"
              className="input-hud w-full"
            />
          </Field>
          <Field mode={mode} label="CHANNEL">
            <select
              value={form.channel}
              onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value as AlertContactChannel }))}
              className="input-hud w-full uppercase tracking-widest"
            >
              <option value="whatsapp" className="bg-slate-950">WhatsApp</option>
              <option value="telegram" className="bg-slate-950">Telegram</option>
            </select>
          </Field>
          <Field mode={mode} label="ROLE">
            <input
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="admin"
              className="input-hud w-full"
            />
          </Field>
          <div>
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">
              LOCATIONS (empty = all regions)
            </p>
            <div className="flex flex-wrap gap-1">
              {LOCATIONS.map((loc) => {
                const on = form.locations.map((l) => l.toLowerCase()).includes(loc.toLowerCase());
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => toggleLocation(loc)}
                    className={`rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wide transition ${
                      on
                        ? std
                          ? 'bg-blue-600 text-white'
                          : 'bg-cyan-500/20 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.45)]'
                        : std
                          ? 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                          : 'border border-cyan-400/15 bg-black/40 text-slate-400 hover:text-cyan-200'
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-300">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              className="h-3 w-3 accent-cyan-400"
            />
            Enabled
          </label>
          {formError ? (
            <p className="font-mono text-[10px] uppercase tracking-widest text-red-300">{formError}</p>
          ) : null}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className={std ? 'mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50' : 'flex items-center gap-1.5 rounded-sm border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50'}
          >
            {createMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <UserPlus size={11} />}
            Register contact
          </button>
        </form>
        )}
      </HudFrame>
    </div>
  );
}

function Field({ label, children, mode }: { label: string; children: React.ReactNode; mode?: import('@/lib/access/ui-mode').UiMode }) {
  const m = mode ?? 'command';
  return (
    <label className="block">
      <span className={`mb-1 block ${fieldLabel(m)}`}>{label}</span>
      {children}
    </label>
  );
}
