import { z } from 'zod';
import { apiBlob, apiRequest } from '@/lib/api/client';
import {
  AlertsSchema,
  BriefingSchema,
  RiskExplainSchema,
  RiskMapSchema,
  RiskSchema,
  ShadowRiskMapSchema,
} from '@/lib/api/schemas';
import { extractListPayload } from '@/lib/api/payload';
import type { ActionType, Outcome } from '@/lib/ops/workflow';

const Obj = z.record(z.string(), z.unknown());
const List = z.preprocess(extractListPayload, z.array(Obj));

export const OpsMeSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    org: z
      .object({
        id: z.number().optional(),
        name: z.string(),
        slug: z.string().optional(),
        on_duty: z.string().nullable().optional(),
        pilot_enabled: z.boolean().optional(),
      })
      .passthrough(),
    jurisdiction: z.array(z.string()).optional().default([]),
    pilot_jurisdiction: z.array(z.string()).optional().default([]),
  })
  .passthrough();

export type OpsMe = z.infer<typeof OpsMeSchema>;

const ops = { auth: true as const, cache: 'no-store' as const };

/** Authenticated Flood Ops calls. MCC keeps using `api.*` without `auth`. */
export const opsApi = {
  me: (signal?: AbortSignal) => apiRequest('/me', OpsMeSchema, { ...ops, signal }),

  alerts: (limit = 100, signal?: AbortSignal) =>
    apiRequest(`/alerts?limit=${limit}&active_only=false`, AlertsSchema, { ...ops, signal }),

  alert: (id: string, signal?: AbortSignal) =>
    apiRequest(`/alerts/${encodeURIComponent(id)}`, Obj, { ...ops, signal }),

  acknowledge: (id: string, signal?: AbortSignal) =>
    apiRequest(`/alerts/${encodeURIComponent(id)}/acknowledge`, Obj, {
      ...ops,
      method: 'POST',
      body: {},
      signal,
    }),

  addAction: (id: string, type: ActionType, note: string | null, signal?: AbortSignal) =>
    apiRequest(`/alerts/${encodeURIComponent(id)}/actions`, Obj, {
      ...ops,
      method: 'POST',
      body: { type, note: note || null },
      signal,
    }),

  actions: (id: string, signal?: AbortSignal) =>
    apiRequest(`/alerts/${encodeURIComponent(id)}/actions`, List, { ...ops, signal }),

  close: (id: string, outcome: Outcome, signal?: AbortSignal) =>
    apiRequest(`/alerts/${encodeURIComponent(id)}/close`, Obj, {
      ...ops,
      method: 'POST',
      body: { outcome },
      signal,
    }),

  record: (limit = 50, signal?: AbortSignal) =>
    apiRequest(`/record?limit=${limit}`, List, { ...ops, signal }),

  briefing: (signal?: AbortSignal) => apiRequest('/briefing/odisha', BriefingSchema, { ...ops, signal }),

  briefingPdf: (signal?: AbortSignal) =>
    apiBlob('/briefing/odisha.pdf', { ...ops, accept: 'application/pdf', signal }),

  riskMap: (signal?: AbortSignal) => apiRequest('/risk/map', RiskMapSchema, { ...ops, signal }),

  /** Public scoring feed. Shown in Ops as SHADOW; never used to issue alerts. */
  shadowMap: (signal?: AbortSignal) =>
    apiRequest('/risk/shadow/map', ShadowRiskMapSchema, { cache: 'no-store', signal }),

  risk: (location: string, signal?: AbortSignal) =>
    apiRequest(`/risk?location=${encodeURIComponent(location)}`, RiskSchema, { ...ops, signal }),

  riskExplain: (location: string, signal?: AbortSignal) =>
    apiRequest(`/risk/explain/${encodeURIComponent(location)}`, RiskExplainSchema, { ...ops, signal }),

  org: (signal?: AbortSignal) => apiRequest('/org', Obj, { ...ops, signal }),

  notify: (id: string, signal?: AbortSignal) =>
    apiRequest(`/alerts/${encodeURIComponent(id)}/notify`, Obj, {
      ...ops,
      method: 'POST',
      body: {},
      signal,
    }),

  weakPoints: (location?: string, signal?: AbortSignal) =>
    apiRequest(
      location ? `/weak-points?location=${encodeURIComponent(location)}` : '/weak-points',
      List,
      { ...ops, signal },
    ),

  addWeakPoint: (
    body: {
      location: string;
      river: string;
      site: string;
      kind?: string;
      block?: string | null;
      watch_gauge?: string | null;
      watch_ratio?: number | null;
      last_breach_dates?: string[];
      note?: string | null;
      source?: string | null;
    },
    signal?: AbortSignal,
  ) => apiRequest('/weak-points', Obj, { ...ops, method: 'POST', body, signal }),

  deactivateWeakPoint: (id: string | number, signal?: AbortSignal) =>
    apiRequest(`/weak-points/${encodeURIComponent(String(id))}`, Obj, {
      ...ops,
      method: 'DELETE',
      signal,
    }),

  externalFeeds: (location?: string, signal?: AbortSignal) =>
    apiRequest(
      location ? `/feeds/external?location=${encodeURIComponent(location)}` : '/feeds/external',
      Obj,
      { ...ops, signal },
    ),
};
