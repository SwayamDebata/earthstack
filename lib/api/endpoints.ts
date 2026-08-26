import { apiRequest } from '@/lib/api/client';
import type { CreateAlertContactPayload, NotifyAlertPayload, TestWhatsAppPayload } from '@/lib/api/alerts';
import {
  AlertContactSchema,
  AlertContactsSchema,
  AlertDeliveryInfoSchema,
  AlertNotifySchema,
  AlertsSchema,
  BriefingSchema,
  FeaturesLatestSchema,
  FloodBenchSummarySchema,
  ForecastSchema,
  HealthSchema,
  HeatDecisionSchema,
  HeatMapSchema,
  HeatGridSchema,
  MonsoonScorecardSchema,
  RiskExplainSchema,
  MlBacktestSummarySchema,
  MlInferenceLogsSchema,
  RainfallLocationSchema,
  RainfallStatsSchema,
  ReplayHistoricalDemoSchema,
  ReplayHistoricalEventsSchema,
  ReplayRunSchema,
  ReplaySchema,
  RiskMapSchema,
  RiskSchema,
  ShadowRiskMapSchema,
  ShadowRiversSchema,
  RiversLatestSchema,
  WeatherLatestSchema,
} from '@/lib/api/schemas';

export const api = {
  health: (signal?: AbortSignal) => apiRequest('/health', HealthSchema, { signal, cache: 'no-store' }),
  weatherLatest: (signal?: AbortSignal) => apiRequest('/weather/latest', WeatherLatestSchema, { signal }),
  riversLatest: (signal?: AbortSignal) => apiRequest('/rivers/latest', RiversLatestSchema, { signal }),
  featuresLatest: (signal?: AbortSignal) => apiRequest('/features/latest', FeaturesLatestSchema, { signal }),
  risk: (location: string, signal?: AbortSignal) => apiRequest(`/risk?location=${encodeURIComponent(location)}`, RiskSchema, { signal }),
  debugRisk: (location: string, signal?: AbortSignal) => apiRequest(`/debug/risk?location=${encodeURIComponent(location)}`, RiskSchema, { signal }),
  riskMap: (signal?: AbortSignal) => apiRequest('/risk/map', RiskMapSchema, { signal }),
  shadowRiskMap: (signal?: AbortSignal) =>
    apiRequest('/risk/shadow/map', ShadowRiskMapSchema, { signal, cache: 'no-store' }),
  shadowRivers: (bulletinDate?: string, signal?: AbortSignal) =>
    apiRequest(
      `/risk/shadow/rivers${bulletinDate ? `?bulletin_date=${encodeURIComponent(bulletinDate)}` : ''}`,
      ShadowRiversSchema,
      { signal, cache: 'no-store' },
    ),
  briefing: (signal?: AbortSignal) => apiRequest('/briefing/odisha', BriefingSchema, { signal, cache: 'no-store' }),
  riskExplain: (location: string, signal?: AbortSignal) =>
    apiRequest(`/risk/explain/${encodeURIComponent(location)}`, RiskExplainSchema, { signal }),
  floodbenchSummary: (signal?: AbortSignal) =>
    apiRequest('/floodbench/summary', FloodBenchSummarySchema, { signal }),
  monsoonScorecard: (seasonStart?: string, signal?: AbortSignal) =>
    apiRequest(
      `/monsoon/scorecard${seasonStart ? `?season_start=${encodeURIComponent(seasonStart)}` : ''}`,
      MonsoonScorecardSchema,
      { signal, cache: 'no-store' },
    ),
  heatMap: (signal?: AbortSignal) => apiRequest('/heat/map', HeatMapSchema, { signal, cache: 'no-store' }),
  heatGrid: async (signal?: AbortSignal) => {
    // Prefer Next BFF (upstream /heat/grid with Open-Meteo fallback) so the field
    // works before the VM route is deployed.
    const response = await fetch('/api/heat-grid', { signal, cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Heat grid unavailable (${response.status})`);
    }
    const json = await response.json();
    return HeatGridSchema.parse(json);
  },
  heatCity: (location: string, signal?: AbortSignal) =>
    apiRequest(`/heat/${encodeURIComponent(location)}`, HeatDecisionSchema, { signal, cache: 'no-store' }),
  alerts: (activeOnly = true, limit = 20, signal?: AbortSignal) =>
    apiRequest(`/alerts?limit=${limit}&active_only=${activeOnly}`, AlertsSchema, { signal }),
  alertContacts: (signal?: AbortSignal) => apiRequest('/alert-contacts', AlertContactsSchema, { signal }),
  createAlertContact: (payload: CreateAlertContactPayload, signal?: AbortSignal) =>
    apiRequest('/alert-contacts', AlertContactSchema, { signal, method: 'POST', body: payload }),
  notifyAlert: (
    alertId: number | string,
    payload: NotifyAlertPayload = { provider: 'twilio_whatsapp' },
    signal?: AbortSignal,
  ) =>
    apiRequest(`/alerts/${encodeURIComponent(String(alertId))}/notify`, AlertNotifySchema, {
      signal,
      method: 'POST',
      body: payload,
    }),
  alertDeliveryInfo: (signal?: AbortSignal) =>
    apiRequest('/alerts/delivery/info', AlertDeliveryInfoSchema, { signal }),
  testWhatsAppDelivery: (payload: TestWhatsAppPayload, signal?: AbortSignal) =>
    apiRequest('/alerts/delivery/test-whatsapp', AlertDeliveryInfoSchema, {
      signal,
      method: 'POST',
      body: payload,
    }),
  replay: (location: string, signal?: AbortSignal) => apiRequest(`/replay/${encodeURIComponent(location)}`, ReplaySchema, { signal }),
  replayRun: (location: string, signal?: AbortSignal) =>
    apiRequest(`/replay/run?location=${encodeURIComponent(location)}`, ReplayRunSchema, {
      signal,
      method: 'POST',
    }),
  replayHistoricalDemo: (
    selection?: { eventId?: string; source?: string } | string,
    signal?: AbortSignal,
  ) => {
    const params = new URLSearchParams();
    if (typeof selection === 'string') {
      if (selection) params.set('event_id', selection);
    } else if (selection) {
      if (selection.eventId) params.set('event_id', selection.eventId);
      if (selection.source) params.set('source', selection.source);
    }
    const qs = params.toString();
    return apiRequest(
      `/replay/historical/demo${qs ? `?${qs}` : ''}`,
      ReplayHistoricalDemoSchema,
      { signal },
    );
  },
  replayHistoricalEvents: (signal?: AbortSignal) =>
    apiRequest('/replay/historical/events', ReplayHistoricalEventsSchema, { signal }),
  rainfallStats: (signal?: AbortSignal) => apiRequest('/rainfall/stats', RainfallStatsSchema, { signal }),
  rainfallLocation: (location: string, signal?: AbortSignal) =>
    apiRequest(`/rainfall/${encodeURIComponent(location)}`, RainfallLocationSchema, { signal }),
  forecast: (location: string, signal?: AbortSignal) => apiRequest(`/forecast/${encodeURIComponent(location)}`, ForecastSchema, { signal }),
  mlInferenceLogs: (location?: string, limit = 25, signal?: AbortSignal) => {
    const params = new URLSearchParams({ limit: `${limit}` });
    if (location) params.set('location', location);
    return apiRequest(`/ml/inference/logs?${params.toString()}`, MlInferenceLogsSchema, { signal });
  },
  mlBacktestSummary: (signal?: AbortSignal) =>
    apiRequest('/ml/backtest/summary', MlBacktestSummarySchema, { signal }),
};
