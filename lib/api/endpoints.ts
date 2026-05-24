import { apiRequest } from '@/lib/api/client';
import type { CreateAlertContactPayload, NotifyAlertPayload, TestWhatsAppPayload } from '@/lib/api/alerts';
import {
  AlertContactSchema,
  AlertContactsSchema,
  AlertDeliveryInfoSchema,
  AlertNotifySchema,
  AlertsSchema,
  FeaturesLatestSchema,
  ForecastSchema,
  HealthSchema,
  MlInferenceLogsSchema,
  RainfallLocationSchema,
  RainfallStatsSchema,
  ReplayRunSchema,
  ReplaySchema,
  RiskMapSchema,
  RiskSchema,
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
  rainfallStats: (signal?: AbortSignal) => apiRequest('/rainfall/stats', RainfallStatsSchema, { signal }),
  rainfallLocation: (location: string, signal?: AbortSignal) =>
    apiRequest(`/rainfall/${encodeURIComponent(location)}`, RainfallLocationSchema, { signal }),
  forecast: (location: string, signal?: AbortSignal) => apiRequest(`/forecast/${encodeURIComponent(location)}`, ForecastSchema, { signal }),
  mlInferenceLogs: (location?: string, limit = 25, signal?: AbortSignal) => {
    const params = new URLSearchParams({ limit: `${limit}` });
    if (location) params.set('location', location);
    return apiRequest(`/ml/inference/logs?${params.toString()}`, MlInferenceLogsSchema, { signal });
  },
};
