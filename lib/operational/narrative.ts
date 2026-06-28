/**
 * Derive operational narratives from live API payloads.
 * No hardcoded risk scores - only transforms validated upstream fields.
 */

export type RiskPayload = Record<string, unknown>;

export type OperationalSituation = {
  headline: string;
  severityLabel: string;
  escalationWindow: string;
  confidenceLabel: string;
  region: string;
};

export type OperationalDriver = {
  label: string;
  detail: string;
};

export type OperationalAction = {
  priority: 'immediate' | 'prepare' | 'monitor';
  text: string;
};

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function raw(risk: RiskPayload): Record<string, unknown> {
  const r = risk.raw_data;
  return r && typeof r === 'object' ? (r as Record<string, unknown>) : {};
}

export function riskSeverityLabel(risk: RiskPayload): string {
  const level = String(risk.risk_level ?? risk.severity ?? 'unknown');
  return level.toUpperCase();
}

export function confidenceLabel(risk: RiskPayload): string {
  const c = num(risk.confidence);
  if (c === null) return 'Unknown';
  if (c >= 0.8) return 'High';
  if (c >= 0.55) return 'Moderate';
  return 'Low';
}

export function buildSituation(risk: RiskPayload, region: string): OperationalSituation {
  const severity = riskSeverityLabel(risk);
  const confidence = confidenceLabel(risk);
  const timeToPeak = String(risk.time_to_peak ?? risk.time_to_impact ?? 'n/a');
  const trend = String(risk.trend ?? 'n/a');

  const headline =
    severity.includes('HIGH') || severity.includes('CRITICAL')
      ? `${severity} RISK - ${region} Region`
      : severity.includes('MEDIUM') || severity.includes('WARNING')
        ? `ELEVATED CONDITIONS - ${region}`
        : `STABLE CONDITIONS - ${region}`;

  const escalationWindow =
    timeToPeak !== 'n/a'
      ? `Expected escalation window: ${timeToPeak}${trend !== 'n/a' ? ` · Trend ${trend}` : ''}`
      : trend !== 'n/a'
        ? `Trend: ${trend}`
        : 'Escalation timing unavailable from upstream';

  return {
    headline,
    severityLabel: severity,
    escalationWindow,
    confidenceLabel: confidence,
    region,
  };
}

export function buildDrivers(risk: RiskPayload): OperationalDriver[] {
  const drivers: OperationalDriver[] = [];
  const r = raw(risk);

  const rain24 = num(r.rainfall_forecast_24h ?? risk.rain_forecast_24h);
  const p95 = num(r.historical_p95_rain);
  const rainSeverity = String(risk.rain_severity ?? '').toUpperCase();

  if (rain24 !== null && p95 !== null && rain24 >= p95 * 0.85) {
    drivers.push({
      label: 'Forecast rainfall near historical extreme',
      detail: `24h forecast ${rain24.toFixed(1)} mm vs p95 baseline ${p95.toFixed(1)} mm`,
    });
  } else if (rainSeverity === 'HIGH' || rainSeverity === 'CRITICAL') {
    drivers.push({
      label: 'Rainfall severity elevated',
      detail: `Rain severity flagged ${rainSeverity} by upstream model`,
    });
  } else if (rain24 !== null) {
    drivers.push({
      label: 'Forecast rainfall signal',
      detail: `24h forecast ${rain24.toFixed(1)} mm`,
    });
  }

  const riverLevel = num(r.river_level);
  const floodThreshold = num(r.flood_threshold);
  if (riverLevel !== null && floodThreshold !== null && floodThreshold > 0) {
    const ratio = riverLevel / floodThreshold;
    if (ratio >= 0.9) {
      drivers.push({
        label: 'River level approaching danger threshold',
        detail: `${riverLevel.toFixed(1)} m vs threshold ${floodThreshold.toFixed(1)} m (${Math.round(ratio * 100)}%)`,
      });
    } else if (ratio >= 0.75) {
      drivers.push({
        label: 'River level rising relative to threshold',
        detail: `${riverLevel.toFixed(1)} m · ${Math.round(ratio * 100)}% of flood threshold`,
      });
    }
  }

  const alertRatio = num((r.ml_features as Record<string, unknown> | undefined)?.rainfall_alert_ratio);
  if (alertRatio !== null && alertRatio >= 0.4) {
    drivers.push({
      label: 'Rainfall alert ratio elevated',
      detail: `Feature ratio ${alertRatio.toFixed(2)} vs operational baseline`,
    });
  }

  const ruleScore = num(risk.rule_score ?? risk.final_score);
  const mlScore = num(risk.ml_score);
  const hybrid = String(risk.hybrid_mode ?? '');
  if (ruleScore !== null) {
    drivers.push({
      label: 'Rule engine assessment',
      detail: `Rule score ${ruleScore.toFixed(2)}${mlScore !== null && mlScore > 0 ? ` · ML ${mlScore.toFixed(2)}` : ''}${hybrid ? ` · ${hybrid} mode` : ''}`,
    });
  }

  if (drivers.length === 0) {
    drivers.push({
      label: 'Limited driver telemetry',
      detail: 'Upstream risk payload did not expose detailed drivers for this region',
    });
  }

  return drivers;
}

export function buildRecommendedActions(
  risk: RiskPayload,
  region: string,
  activeAlerts: number,
): OperationalAction[] {
  const severity = riskSeverityLabel(risk).toLowerCase();
  const actions: OperationalAction[] = [];

  if (severity.includes('high') || severity.includes('critical')) {
    actions.push(
      { priority: 'immediate', text: `Alert low-lying wards in ${region}` },
      { priority: 'immediate', text: 'Prepare evacuation teams and assembly points' },
      { priority: 'prepare', text: 'Monitor embankments and river gauges hourly' },
      { priority: 'prepare', text: 'Activate district communication channels' },
    );
  } else if (severity.includes('medium') || severity.includes('warning')) {
    actions.push(
      { priority: 'prepare', text: `Increase patrol coverage in ${region} flood-prone zones` },
      { priority: 'prepare', text: 'Pre-position response kits at ward coordination centers' },
      { priority: 'monitor', text: 'Review forecast updates every 6 hours' },
      { priority: 'monitor', text: 'Stand by district alert contacts for escalation' },
    );
  } else {
    actions.push(
      { priority: 'monitor', text: `Continue routine monitoring for ${region}` },
      { priority: 'monitor', text: 'Validate river and rainfall sensors are reporting' },
    );
  }

  if (activeAlerts > 0) {
    actions.unshift({
      priority: 'immediate',
      text: `Review ${activeAlerts} open incident${activeAlerts === 1 ? '' : 's'} in alert coordination`,
    });
  }

  return actions;
}

export function historicalEvidenceLine(risk: RiskPayload): string | null {
  const floods = num(raw(risk).historical_floods);
  if (floods !== null && floods > 50) {
    return `Region has ${floods} recorded historical flood events in training corpus - review Historical Replay for pattern match`;
  }
  return 'Open Historical Replay to compare with verified historical flood events';
}
