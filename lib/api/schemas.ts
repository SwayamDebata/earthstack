import { z } from 'zod';
import { extractListPayload } from '@/lib/api/payload';

export const isoDateString = z.string().datetime().or(z.string());

const timestampUnion = z.union([z.string(), z.number(), z.date()]).optional();

const scoreRecord = z.record(z.string(), z.number().or(z.string()).optional());

/** Any JSON object from upstream (list rows, rainfall payload, etc.) */
const JsonObject = z.record(z.string(), z.unknown());

export const HealthSchema = z
  .object({
    status: z.union([z.string(), z.number(), z.boolean()]).optional(),
    service: z.union([z.string(), z.number()]).optional(),
    uptime: z.union([z.number(), z.string()]).optional(),
    version: z.union([z.string(), z.number()]).optional(),
    timestamp: timestampUnion,
  })
  .passthrough();

export const WeatherLatestSchema = z.record(z.string(), z.unknown());

export const RiversLatestSchema = z.record(z.string(), z.unknown());

export const FeaturesLatestSchema = z.record(z.string(), z.unknown());

export const RiskSchema = z
  .object({
    location: z.union([z.string(), z.number()]).optional(),
    risk_score: z.number().or(z.string()).optional(),
    rule_score: z.number().or(z.string()).optional(),
    ml_score: z.number().or(z.string()).optional(),
    final_score: z.number().or(z.string()).optional(),
    trend: z.union([z.string(), z.number()]).optional(),
    severity: z.union([z.string(), z.number()]).optional(),
    timestamp: timestampUnion,
    scores: scoreRecord.optional(),
  })
  .passthrough();

/** Accepts raw array or common API envelopes; each row is a loose object for field variance. */
export const RiskMapSchema = z.preprocess(
  (input) => extractListPayload(input),
  z.array(JsonObject),
);

export const AlertSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    title: z.string().optional(),
    message: z.string().optional(),
    description: z.string().optional(),
    severity: z.string().optional(),
    active: z.boolean().optional(),
    status: z.string().optional(),
    location: z.string().optional(),
    region: z.string().optional(),
    risk_score: z.number().or(z.string()).optional(),
    sent: z.boolean().optional(),
    delivery_status: z.string().optional(),
    send_attempts: z.number().or(z.string()).optional(),
    created_at: timestampUnion,
    updated_at: timestampUnion,
    timestamp: timestampUnion,
  })
  .passthrough();

export const AlertContactSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    name: z.string().optional(),
    phone_e164: z.string().optional(),
    channel: z.string().optional(),
    role: z.string().optional(),
    locations: z.array(z.string()).optional(),
    enabled: z.boolean().optional(),
  })
  .passthrough();

export const AlertContactsSchema = z.preprocess(
  (input) => extractListPayload(input),
  z.array(JsonObject),
);

export const AlertNotifySchema = z
  .object({
    ok: z.boolean().optional(),
    alert_id: z.union([z.string(), z.number()]).optional(),
    provider: z.string().optional(),
    region: z.string().optional(),
    sent: z.boolean().optional(),
    deliveries: z.array(JsonObject).optional(),
  })
  .passthrough();

export const AlertDeliveryInfoSchema = z.record(z.string(), z.unknown());

export const AlertsSchema = z.preprocess(
  (input) => extractListPayload(input),
  z.array(JsonObject),
);

export const ReplaySchema = z.record(z.string(), z.unknown());

export const ReplayRunSchema = z.record(z.string(), z.unknown());

const ReplayHistoricalEventInfoSchema = z
  .object({
    source: z.string().optional(),
    event_id: z.string(),
    region: z.string().optional(),
    state: z.string().optional(),
    river_name: z.string().optional(),
    start_timestamp: z.string().optional(),
    end_timestamp: z.string().optional(),
    peak_water_level: z.number().nullable().optional(),
    peak_discharge: z.number().nullable().optional(),
    severity: z.string().optional(),
    flood_type: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    gauge_id: z.string().nullable().optional(),
    has_precip_proxy: z.boolean().optional(),
  })
  .passthrough();

const ReplayHistoricalFrameSchema = z
  .object({
    hours_before_event: z.number(),
    simulated_at: z.string().optional(),
    rule_score: z.number().optional(),
    risk_level: z.string().optional(),
    triggered: z.boolean().optional(),
    next_24h_rain_mm: z.number().optional(),
    past_24h_rain_mm: z.number().optional(),
    water_level_m: z.number().optional(),
    flood_threshold_m: z.number().optional(),
    narrative: z.string().optional(),
  })
  .passthrough();

export const ReplayHistoricalDemoSchema = z
  .object({
    ok: z.boolean().optional(),
    event: ReplayHistoricalEventInfoSchema.optional(),
    methodology: z.record(z.string(), z.unknown()).optional(),
    lead_hours: z.array(z.number()).optional(),
    first_alert_hours_before: z.number().nullable().optional(),
    frames: z.array(ReplayHistoricalFrameSchema).optional(),
    demo: z.boolean().optional(),
    selection_mode: z.string().optional(),
    requested_event_id: z.string().nullable().optional(),
    requested_source: z.string().nullable().optional(),
    recommended_event: ReplayHistoricalEventInfoSchema.optional(),
    is_recommended: z.boolean().optional(),
    /** Legacy: pre-2026-05-26 backend used `recommended: boolean` */
    recommended: z.boolean().optional(),
  })
  .passthrough();

export const ReplayHistoricalEventsSchema = z
  .object({
    events: z.array(ReplayHistoricalEventInfoSchema),
    default_region: z.string().optional(),
  })
  .passthrough();

export const RainfallStatsSchema = z.record(z.string(), z.unknown());

export const RainfallLocationSchema = z.record(z.string(), z.unknown());

export const ForecastSchema = z.record(z.string(), z.unknown());

export const MlInferenceLogSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    location: z.string().optional(),
    rule_score: z.number().or(z.string()).optional(),
    ml_score: z.number().or(z.string()).optional(),
    final_score: z.number().or(z.string()).optional(),
    shadow_mode: z.boolean().optional(),
    timestamp: timestampUnion,
  })
  .passthrough();

export const MlInferenceLogsSchema = z.preprocess(
  (input) => extractListPayload(input),
  z.array(JsonObject),
);

const BacktestByCity = z.record(
  z.string(),
  z
    .object({
      scored: z.number().optional(),
      triggered: z.number().optional(),
      recall: z.number().nullable().optional(),
    })
    .passthrough(),
);

const BacktestLeadTime = z
  .object({
    lead_hours: z.number().optional(),
    scored_events: z.number().optional(),
    skipped_events: z.number().optional(),
    triggered_medium_plus: z.number().optional(),
    recall: z.number().optional(),
    recall_pct: z.number().optional(),
    alert_threshold: z.number().optional(),
    by_city: BacktestByCity.optional(),
  })
  .passthrough();

export const MlBacktestSummarySchema = z
  .object({
    available: z.boolean().optional(),
    generated_at: z.string().optional(),
    headline: z.string().optional(),
    pilot_cities: z.array(z.string()).optional(),
    total_pilot_events: z.number().optional(),
    methodology: z.record(z.string(), z.unknown()).optional(),
    lead_time_24h: BacktestLeadTime.optional(),
    lead_time_48h: BacktestLeadTime.optional(),
    caveats: z.array(z.string()).optional(),
    flood_events_coverage: z
      .object({
        available: z.boolean().optional(),
        total_events: z.number().optional(),
        odisha_events: z.number().optional(),
        pilot_city_mapped: z.number().optional(),
        by_source: z.record(z.string(), z.number()).optional(),
        pilot_city_counts: z.record(z.string(), z.number()).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type Health = z.infer<typeof HealthSchema>;
export type WeatherLatest = z.infer<typeof WeatherLatestSchema>;
export type RiversLatest = z.infer<typeof RiversLatestSchema>;
export type FeaturesLatest = z.infer<typeof FeaturesLatestSchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type RiskMap = z.infer<typeof RiskMapSchema>;
export type Alert = z.infer<typeof AlertSchema>;
export type AlertContact = z.infer<typeof AlertContactSchema>;
export type AlertContacts = z.infer<typeof AlertContactsSchema>;
export type AlertNotify = z.infer<typeof AlertNotifySchema>;
export type AlertDeliveryInfo = z.infer<typeof AlertDeliveryInfoSchema>;
export type Alerts = z.infer<typeof AlertsSchema>;
export type Replay = z.infer<typeof ReplaySchema>;
export type ReplayRun = z.infer<typeof ReplayRunSchema>;
export type ReplayHistoricalDemo = z.infer<typeof ReplayHistoricalDemoSchema>;
export type ReplayHistoricalEvents = z.infer<typeof ReplayHistoricalEventsSchema>;
export type ReplayHistoricalEventInfo = z.infer<typeof ReplayHistoricalEventInfoSchema>;
export type ReplayHistoricalFrame = z.infer<typeof ReplayHistoricalFrameSchema>;
export type RainfallStats = z.infer<typeof RainfallStatsSchema>;
export type RainfallLocation = z.infer<typeof RainfallLocationSchema>;
export type Forecast = z.infer<typeof ForecastSchema>;
export type MlInferenceLogs = z.infer<typeof MlInferenceLogsSchema>;
export type MlBacktestSummary = z.infer<typeof MlBacktestSummarySchema>;
