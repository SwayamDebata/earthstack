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

/** Historical similarity event. Present in both briefing districts and risk-explain. */
export const SimilarEventSchema = z
  .object({
    event_id: z.string().nullable().optional(),
    source: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    river_name: z.string().nullable().optional(),
    peak_water_level: z.number().nullable().optional(),
    severity: z.string().nullable().optional(),
    flood_type: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    similarity_pct: z.number().nullable().optional(),
    replay_url: z.string().nullable().optional(),
  })
  .passthrough();

/** GET /briefing/odisha — state-wide situation for the War Room landing. */
const BriefingDistrictSchema = z
  .object({
    location: z.string(),
    severity: z.string().optional(),
    risk_score: z.number().nullable().optional(),
    confidence: z.number().nullable().optional(),
    trend: z.string().nullable().optional(),
    top_reason: z.string().nullable().optional(),
    top_action: z.string().nullable().optional(),
    primary_driver: z.string().nullable().optional(),
    similar_event: SimilarEventSchema.nullable().optional(),
  })
  .passthrough();

const BriefingTopRiskSchema = z
  .object({
    location: z.string(),
    severity: z.string().optional(),
    confidence: z.number().nullable().optional(),
  })
  .passthrough();

export const BriefingSchema = z
  .object({
    ok: z.boolean().optional(),
    generated_at: z.string().optional(),
    region: z.string().optional(),
    summary: z.string().optional(),
    counts: z.record(z.string(), z.number()).optional().default({}),
    attention_count: z.number().optional().default(0),
    districts: z.array(BriefingDistrictSchema).optional().default([]),
    top_risks: z.array(BriefingTopRiskSchema).optional().default([]),
    top_actions: z.array(z.string()).optional().default([]),
    errors: z.array(z.unknown()).optional().default([]),
    disclaimer: z.string().optional(),
  })
  .passthrough();

/** GET /risk/explain/{location} — SHAP-style evidence for a single district. */
const WhyFactorSchema = z
  .object({
    factor: z.string(),
    contribution_pct: z.number().nullable().optional(),
    value: z.number().nullable().optional(),
    unit: z.string().nullable().optional(),
  })
  .passthrough();

export const RiskExplainSchema = z
  .object({
    ok: z.boolean().optional(),
    location: z.string().optional(),
    timestamp: z.string().optional(),
    headline: z.string().optional(),
    risk_level: z.string().optional(),
    severity: z.string().optional(),
    risk_score: z.number().nullable().optional(),
    confidence: z.number().nullable().optional(),
    confidence_factors: z.array(z.string()).optional().default([]),
    trend: z.string().nullable().optional(),
    time_to_peak: z.string().nullable().optional(),
    why: z.array(WhyFactorSchema).optional().default([]),
    reasons: z.array(z.string()).optional().default([]),
    suggested_actions: z.array(z.string()).optional().default([]),
    similar_event: SimilarEventSchema.nullable().optional(),
    hybrid_mode: z.string().nullable().optional(),
    evidence: z.record(z.string(), z.unknown()).optional().default({}),
  })
  .passthrough();

/** GET /floodbench/summary — offline, reproducible credibility benchmark. */
const FloodBenchEventSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    date: z.string().optional(),
    city: z.string().optional(),
    hazard_type: z.string().optional(),
    gauged: z.boolean().optional(),
    river: z.string().nullable().optional(),
    in_arena: z.boolean().optional(),
    citation: z.string().optional(),
    coverage: z.record(z.string(), z.string()).optional().default({}),
    note: z.string().optional(),
  })
  .passthrough();

const FloodBenchCoverageScoreSchema = z
  .object({
    events: z.number().optional(),
    covered_full: z.number().optional(),
    covered_partial: z.number().optional(),
    not_covered: z.number().optional(),
    coverage_score_pct: z.number().optional(),
  })
  .passthrough();

const FloodBenchScoreGroupSchema = z.record(z.string(), FloodBenchCoverageScoreSchema);

const FloodBenchMlSchema = z
  .object({
    model: z.string().optional(),
    label_source: z.string().optional(),
    leave_one_region_out_mean_recall: z.number().optional(),
    event_holdout: z
      .object({
        recall: z.number().optional(),
        precision: z.number().optional(),
        f1: z.number().optional(),
        roc_auc: z.number().optional(),
      })
      .passthrough()
      .optional(),
    operational_holdout: z
      .object({
        n_negatives: z.number().optional(),
        false_positive_rate: z.number().optional(),
        decision_threshold: z.number().optional(),
      })
      .passthrough()
      .optional(),
    calibration: z
      .object({
        mean_predicted_when_no_flood: z.number().optional(),
        mean_predicted_when_flood: z.number().optional(),
        interpretation: z.string().optional(),
      })
      .passthrough()
      .optional(),
    label: z.string().optional(),
  })
  .passthrough();

const FloodBenchRuleSchema = z
  .object({
    engine: z.string().optional(),
    'recall_at_T-24h': z.number().optional(),
    'recall_at_T-48h': z.number().optional(),
    note: z.string().optional(),
    label: z.string().optional(),
  })
  .passthrough();

export const FloodBenchSummarySchema = z
  .object({
    ok: z.boolean().optional(),
    generated_at: z.string().optional(),
    name: z.string().optional(),
    arena: z.string().optional(),
    disclaimer: z.string().optional(),
    contenders: z.record(z.string(), z.string()).optional().default({}),
    headline_numbers: z.array(z.string()).optional().default([]),
    coverage: z
      .object({
        methodology: z.string().optional(),
        systems: z.record(z.string(), z.string()).optional().default({}),
        per_event: z.array(FloodBenchEventSchema).optional().default([]),
        all_events: FloodBenchScoreGroupSchema.optional().default({}),
        modelearth_arena_only: FloodBenchScoreGroupSchema.optional().default({}),
        urban_pluvial_only: FloodBenchScoreGroupSchema.optional().default({}),
        arena_definition: z.string().optional(),
      })
      .passthrough()
      .optional(),
    detection: z
      .object({
        ModelEarth_ML_v2: FloodBenchMlSchema.optional(),
        ModelEarth_rule_v2_2: FloodBenchRuleSchema.optional(),
        baselines: z.record(z.string(), z.unknown()).optional().default({}),
        cross_vendor_note: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

/** GET /monsoon/scorecard — live-season shadow/advisory track record. */
const MonsoonCityDetectionSchema = z
  .object({
    events: z.number().optional(),
    alerted_medium: z.number().optional(),
    alerted_high: z.number().optional(),
    recall_medium: z.number().optional(),
    recall_high: z.number().optional(),
  })
  .passthrough();

const MonsoonDetectionSchema = z
  .object({
    total_events: z.number().optional(),
    alerted_medium: z.number().optional(),
    alerted_high: z.number().optional(),
    recall_medium: z.number().optional(),
    recall_high: z.number().optional(),
    by_city: z.record(z.string(), MonsoonCityDetectionSchema).optional().default({}),
    label: z.string().optional(),
  })
  .passthrough();

const MonsoonShadowMlSchema = z
  .object({
    events_with_ml_score: z.number().optional(),
    ml_elevated_count: z.number().optional(),
    agreement_with_rule_pct: z.number().optional(),
    note: z.string().optional(),
  })
  .passthrough();

const MonsoonCityTrustSchema = z
  .object({
    consecutive_clean_days: z.number().optional(),
    target_days: z.number().optional(),
    meets_target: z.boolean().optional(),
  })
  .passthrough();

const MonsoonFalseHighDaySchema = z
  .object({
    day: z.string().optional(),
    location: z.string().optional(),
    max_rule: z.number().optional(),
    max_ml: z.number().optional(),
    max_past_rain_mm: z.number().optional(),
  })
  .passthrough();

const MonsoonDryDaySchema = z
  .object({
    target_days: z.number().optional(),
    trust_gate_passed: z.boolean().optional(),
    min_consecutive_clean_days: z.number().optional(),
    false_high_days: z.array(MonsoonFalseHighDaySchema).optional().default([]),
    per_city: z.record(z.string(), MonsoonCityTrustSchema).optional().default({}),
    notes: z.string().optional(),
  })
  .passthrough();

const MonsoonEventSchema = z
  .object({
    event_id: z.string(),
    region: z.string().optional(),
    date: z.string().optional(),
    peak_rule_score: z.number().nullable().optional(),
    severity: z.string().optional(),
    alerted: z.boolean().optional(),
    alerted_high: z.boolean().optional(),
    peak_ml_score: z.number().nullable().optional(),
    ml_elevated: z.boolean().nullable().optional(),
    past_rain_mm: z.number().nullable().optional(),
    forecast_rain_mm: z.number().nullable().optional(),
    imd_rain_mm: z.number().nullable().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
  })
  .passthrough();

export const MonsoonScorecardSchema = z
  .object({
    ok: z.boolean().optional(),
    generated_at: z.string().optional(),
    season_start: z.string().optional(),
    mode: z.string().optional(),
    disclaimer: z.string().optional(),
    headline_numbers: z.array(z.string()).optional().default([]),
    detection: MonsoonDetectionSchema.optional(),
    shadow_ml: MonsoonShadowMlSchema.optional(),
    dry_day_discipline: MonsoonDryDaySchema.optional(),
    events: z.array(MonsoonEventSchema).optional().default([]),
  })
  .passthrough();

export type MonsoonScorecard = z.infer<typeof MonsoonScorecardSchema>;
export type MonsoonEvent = z.infer<typeof MonsoonEventSchema>;
export type MonsoonCityDetection = z.infer<typeof MonsoonCityDetectionSchema>;
export type MonsoonCityTrust = z.infer<typeof MonsoonCityTrustSchema>;
export type MonsoonFalseHighDay = z.infer<typeof MonsoonFalseHighDaySchema>;

export type FloodBenchSummary = z.infer<typeof FloodBenchSummarySchema>;
export type FloodBenchEvent = z.infer<typeof FloodBenchEventSchema>;
export type FloodBenchCoverageScore = z.infer<typeof FloodBenchCoverageScoreSchema>;
export type FloodBenchBaseline = {
  recall?: number | string;
  false_positive_rate?: number | string;
  why?: string;
};

export type SimilarEvent = z.infer<typeof SimilarEventSchema>;
export type Briefing = z.infer<typeof BriefingSchema>;
export type BriefingDistrict = z.infer<typeof BriefingDistrictSchema>;
export type BriefingTopRisk = z.infer<typeof BriefingTopRiskSchema>;
export type RiskExplain = z.infer<typeof RiskExplainSchema>;
export type WhyFactor = z.infer<typeof WhyFactorSchema>;

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
