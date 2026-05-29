# Operational Intelligence Mode

Aligned with **ModelEarth CTO Frontend Strategy SOP v2** (dual-context platform).

## Modes

| Mode | Route home | Purpose |
|------|------------|---------|
| **Operational Intelligence** (default) | `/dashboard/ops` | Decision support for authorities, demos, pilots |
| **Analytics & Telemetry** | `/dashboard` | Existing mission-control telemetry (unchanged views) |

Switch via **Mission Profile** in the top command strip. Profile is persisted in `localStorage` (`modelearth:mission-profile`).

## Operational information hierarchy

1. **Situation** - `SituationSummaryCard` (risk API: level, confidence, time to peak)
2. **Impact** - operational map theatre (`RiskMapPanel` + `/risk/map`)
3. **Action** - `ActionRecommendations` (derived from severity + open alerts)
4. **Evidence** - `ExplainabilityPanel` (drivers from `raw_data` / scores)
5. **Escalation** - headline escalation window from `time_to_peak` + trend
6. **Coordination** - `LiveIncidentFeed` + link to full `/dashboard/alerts`

Narratives are built in `lib/operational/narrative.ts` from live API fields only.

## Routes

| Path | Component |
|------|-----------|
| `/dashboard/ops` | `OpsCommandView` - Active Incident Command Center |
| `/dashboard/ops/replay` | `OpsReplayView` - historical replay hero (`HistoricalReplayPanel`) |

Analytics routes (`/dashboard`, `/dashboard/ml`, `/dashboard/replay`, etc.) are **not modified**.

## SOP sprint mapping

| Sprint | Status |
|--------|--------|
| Sprint 1 - Decision layer + explainability + hierarchy | **In progress** (ops command center) |
| Sprint 2 - Replay-first UX + incident focus | **Partial** (dedicated ops replay route) |
| Sprint 3 - Operational narratives + audit trails | Planned |
| Sprint 4 - Role-based UX + mobile layer | Planned |

## Recommended demo flow (from SOP §20)

1. Open **Operational Intelligence** → Command Center
2. Walk situation → actions → map → incidents
3. Open **Historical Replay** (`/dashboard/ops/replay`)
4. Switch profile to **Analytics & Telemetry** → show ML / telemetry depth
