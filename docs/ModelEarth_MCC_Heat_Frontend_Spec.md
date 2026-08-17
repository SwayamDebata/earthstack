# MCC Heat Frontend Spec

**Contract for the frontend repo.** Backend heat engine is live on production (shadow). This document is what MCC ships next.

Status: Backend live 2026-08-17. Frontend not started.
API: `https://api.modelearth.in`
MCC: `https://modelearth.in`
Related: `docs/ModelEarth_Heat_Engine_Spec.md` (engine), D014 / D016 / D017 / D018.

This is a 3-5 day frontend sprint, not a redesign of MCC.

---

## 0. What is already true (do not re-litigate)

- Heat scores are live. 11 locations scored twice daily. Product surfaces serve **5 cities only**.
- Mode is **shadow**. There is no `active` value in v1. The UI must say SHADOW on every heat surface.
- August scores are LOW (0.03-0.12). That is correct (monsoon, not heat season). Do not fake HIGH for the demo.
- Titlagarh, Bolangir, Jharsuguda, Ahmedabad, Delhi, Dhaka are HeatBench-only. `GET /heat/Titlagarh` returns 404. Never put them on the map, the city picker, or the War Room.
- No heat WhatsApp. No public heat alerts. No death numbers on the UI.
- Flood MCC stays as it is. Heat is an additive tile + city panel, same visual language as flood.

---

## 1. Goal of this sprint

A visitor on modelearth.in can see, in under 10 seconds:

1. Heat is a second hazard, running in shadow.
2. Five Odisha cities have a live heat score.
3. Why that score (Tmax departure, heat index, warm night).
4. It does not replace IMD.

That is the demo. That is also the OSDMA screenshot.

---

## 2. Surfaces (this sprint only)

| Surface | Where | Reads | Required |
|---------|-------|-------|----------|
| Heat strip on main map | Next to / under the flood city chips | `GET /heat/map` | Yes |
| City heat panel | Click a city, new "Heat" tab next to flood Evidence Mode | `GET /heat/{city}` | Yes |
| SHADOW badge | Every heat surface, always visible | `mode` field | Yes |
| War Room heat row | `/dashboard/ops` briefing, one line per city | `GET /heat/map` | Nice if cheap; not blocking |
| HeatBench / shadow report page | Internal ops | `GET /heat/shadow/report` | No (later) |
| Reference-location UI | Titlagarh etc. | none | **Forbidden** |

### Out of this sprint

- New MCC product split (flood ops vs heat ops vs industry packs). That is the next workstream after this tile ships. See Section 8.
- Heat alerts, toast, WhatsApp, email.
- Charts of 30-year ERA5.
- ML probability bars.
- KrishiOS heat card.

---

## 3. API contract (copy these shapes)

Base: `https://api.modelearth.in`
No auth on these GETs (same as `/risk/map`).
Poll every **10 minutes** (heat pipeline is twice daily; 10 min matches flood map polling and picks up a manual `POST /heat/run`).

### 3.1 `GET /heat/map`

Five cities only. Use this for chips, map markers, War Room rollup.

```json
{
  "mode": "shadow",
  "cities": [
    {
      "region": "Bhubaneswar",
      "district": "Bhubaneswar",
      "severity": "LOW",
      "heat_score": 0.0885,
      "confidence": 0.68,
      "mode": "shadow",
      "engine_version": "heat_v1",
      "lat": 20.2333,
      "lng": 85.8333,
      "tmax_c": 32.1,
      "heat_index_c": 38.4,
      "timestamp": "2026-08-17T10:45:00"
    }
  ]
}
```

Frontend rules:

- `heat_score` may be `null` if a city has not scored yet. Show "awaiting data", not 0.
- `severity` is `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`. Same color tokens as flood.
- Ignore any city not in the five. Backend will not send them; still do not hardcode Titlagarh.

### 3.2 `GET /heat/{city}`

City panel. `{city}` is one of: Bhubaneswar, Cuttack, Puri, Sambalpur, Rourkela (case-insensitive).

Success:

```json
{
  "ok": true,
  "mode": "shadow",
  "location": "Bhubaneswar",
  "timestamp": "2026-08-17T10:45:00",
  "heat_score": 0.0885,
  "severity": "LOW",
  "confidence": 0.68,
  "confidence_factors": ["source_agreement_+0.10", "inside_band_+0.08"],
  "why": [
    {"id": "heat_index_risk", "label": "Heat index (temperature + humidity)", "value": 0.12},
    {"id": "tmax_departure_risk", "label": "Tmax departure from normal", "value": 0.04}
  ],
  "components": {
    "tmax_departure_risk": 0.04,
    "heat_index_risk": 0.12,
    "warm_night_risk": 0.0,
    "persistence_multiplier": 1.0,
    "tmax_departure_c": 0.8,
    "qualifying_day": false,
    "consecutive_qualifying_days": 0
  },
  "features": {
    "tmax_c": 32.1,
    "tmin_c": 25.4,
    "rh_midday_pct": 82,
    "heat_index_c": 38.4,
    "tmax_normal_c": 32.4,
    "baseline_source": "era5_1991_2020",
    "tmax_source": "open_meteo_forecast",
    "city_class": "coastal"
  },
  "similar_event": null,
  "suggested_actions": [
    "This is a ModelEarth shadow advisory. It does not replace IMD heat warnings.",
    "Routine monitoring. Hydration messaging if Tmax is rising."
  ],
  "engine_version": "heat_v1",
  "advisory": true
}
```

Frontend rules:

- If `ok` is false, show "Heat score unavailable" plus `error`. Do not crash the flood tab.
- `why[]` is the Evidence Mode list. Sort is already backend-side (highest driver first). Render as bars 0-1.
- `similar_event` is null until we label 2024 days. Hide the block when null. Do not show "no similar event" as an error.
- `suggested_actions` is advisory copy. Render as a list. Prefix the panel with the SHADOW badge so the first action line is not the only disclaimer.
- `confidence` is evidence quality (0.50-0.97), not a probability of a heatwave. Label it **"Evidence quality"**, never "chance of heatwave".
- `features.baseline_source` should read `era5_1991_2020`. If it does not, still render; do not block UI.

### 3.3 404 on reference cities

`GET /heat/Titlagarh` (and Bolangir, Jharsuguda, Ahmedabad, Delhi, Dhaka) returns:

```json
{"detail": "Reference location is HeatBench-only and not on product surfaces"}
```

Do not call these from MCC.

### 3.4 Do not call from MCC this sprint

| Endpoint | Why |
|----------|-----|
| `POST /heat/run` | Ops only. Triggers Open-Meteo pull. |
| `POST /heat/events` | Labeling, not product. |
| `GET /heat/shadow/report` | HeatBench, later ops page. |

---

## 4. UI spec

### 4.1 Visual language

Reuse flood tokens. Do not invent a second design system.

| Severity | Token (same as flood) | Heat meaning |
|----------|----------------------|--------------|
| LOW | muted / green-gray | Normal for season |
| MEDIUM | yellow | Hot Day / IMD yellow territory |
| HIGH | orange | Heat Alert |
| CRITICAL | red | Extreme heat |

**SHADOW badge**

- Text: `SHADOW`
- Placement: top-right of every heat panel, and on the map heat strip header.
- Color: neutral outline, not green (green reads as "safe/live").
- Tooltip: "Advisory only. Does not replace IMD heat warnings. Not used for alerts."

**Always-visible disclaimer** (one line under the badge):

`Advisory. Does not replace IMD.`

### 4.2 Main map: heat strip

Above or beside the existing 5 city flood chips, add a compact row:

```
HEAT  SHADOW
Bhubaneswar  LOW  0.09    Cuttack  LOW  0.08    Puri  LOW  0.09
Sambalpur    LOW  0.04    Rourkela LOW  0.03
```

- Clicking a city opens the city panel on the Heat tab.
- Optional: small map dots using `lat`/`lng` from `/heat/map`, same coordinates as flood, a second hue (amber) so flood vs heat is distinguishable.
- If all five are LOW, that is the correct August state. Do not hide the strip when everything is LOW. The point of shadow season is that the tile exists on quiet days.

### 4.3 City panel: Heat tab

Tabs on city click: `Flood` (existing) | `Heat` (new).

Heat tab layout, top to bottom:

1. Header: city name, SHADOW badge, severity chip, score (2 decimals).
2. Now line: `Tmax {tmax_c} C` · `Feels like {heat_index_c} C` · `vs normal {tmax_normal_c} C` · `RH {rh_midday_pct}%`.
3. Why: three bars from `why[]` (empty drivers omitted by backend).
4. Persistence: `{consecutive_qualifying_days}` qualifying days. Hide if 0.
5. Evidence quality: `{confidence}` as a 0-1 bar, caption "Evidence quality, not probability".
6. Suggested actions list.
7. Similar event card, only if `similar_event` is non-null.
8. Footer: `Updated {timestamp}` · `engine heat_v1` · `baseline era5_1991_2020`.

Empty/error: keep the Flood tab usable. Heat tab shows a single sentence, not a spinner forever (timeout 8s).

### 4.4 War Room (optional this sprint)

If `/dashboard/ops` is a cheap add: one extra column or row `Heat` next to flood severity, from `/heat/map`. Same SHADOW label in the briefing header. Do not mix heat score into the flood `counts` object.

### 4.5 Copy rules

- Never say "we predict deaths".
- Never say "live accuracy" or "% correct".
- Never say "replaces IMD".
- OK to say "shadow heat decision layer for 5 Odisha cities".
- OK to say "scores use ERA5 1991-2020 normals + Open-Meteo forecast".

---

## 5. Frontend implementation plan (3-5 days)

### Day 1: API client + types

- Add `HeatMapResponse`, `HeatCity`, `HeatDecision` types from Section 3.
- Client functions: `fetchHeatMap()`, `fetchHeatCity(name)`.
- City allowlist: the same 5 names as flood. Reject anything else in the router (`/heat/titlagarh` should not exist as a page).

### Day 2: Map strip + SHADOW chrome

- Heat strip on the main map.
- Severity chips wired to `/heat/map`.
- Badge + disclaimer component, reused everywhere.

### Day 3: City Heat tab

- Evidence Mode layout (Section 4.3).
- Handle `ok: false` and 404 without breaking Flood.

### Day 4: Polish + War Room if cheap

- Loading / stale (timestamp older than 36h: show "stale" not a red error; pipeline is twice daily).
- Optional War Room row.
- QA checklist (Section 6).

### Day 5: Ship

- Deploy MCC. Screenshot for the pitch: map with HEAT SHADOW strip, all LOW, Bhubaneswar panel open.

No backend work is required for this sprint unless a field is missing. If you need a field, ask; do not scrape `/heat/shadow/report` into the public map.

---

## 6. QA checklist

- [ ] `/heat/map` renders exactly 5 cities.
- [ ] Opening Bhubaneswar Heat tab shows score, why bars, SHADOW, disclaimer.
- [ ] Titlagarh is not in the city switcher and has no MCC route.
- [ ] Flood tab still works with heat API down (mock a 500).
- [ ] All-LOW August state still shows the strip.
- [ ] Confidence labeled "Evidence quality".
- [ ] No WhatsApp / alert CTA on heat.
- [ ] Stale timestamp (>36h) shows stale, not crash.
- [ ] Mobile: strip wraps, panel scrolls, badge still visible.

---

## 7. Demo script (90 seconds)

1. Open modelearth.in. Point at HEAT SHADOW strip. "Second hazard, live, advisory."
2. Click Bhubaneswar. Heat tab. "Why is the same contract as flood: drivers, evidence quality, action."
3. Note LOW. "It is August. The engine is supposed to be quiet. Heat season is April-June. We do not paint HIGH for the screenshot."
4. "This does not replace IMD. When the trust gate passes, this panel is what OSDMA sees in the morning."

---

## 8. After this tile: MCC as a product line (queued, not this sprint)

Tomorrow.io and Vassar Labs do not sell one dashboard. They sell named products to named buyers. After the heat tile is live, MCC splits along those lines. Same engines, different SKUs.

| Product (working name) | Buyer | Engine | When |
|------------------------|-------|--------|------|
| MCC Flood Ops | City / OSDMA flood desk | rule v2.3 + Decision Engine | Already live |
| MCC Heat Ops | City / SRC heat desk | heat v1 shadow, then gated | This tile is the seed |
| MCC Industry (ports, mining) | Lane 3 ops | flood + heat feeds, later WBGT | Post seed |
| MCC Parametric | Insurers | verified exceedance, HeatBench | After HeatBench v0 |

Do not start this split in the heat-tile PR. Shipping two products before one heat tile is how this slips another month. D018 already queued the split as the workstream after heat is visible.

---

## 9. Guardrails

- 5 product cities. D001 still holds.
- Shadow badge is not optional and not dismissible.
- Frontend must not compute its own heat score. Display only.
- Frontend must not call Open-Meteo or IMD. Backend is the only source.
- If `HEAT_ENGINE_MODE=off` ever appears (`/heat/map` empty or scores null), show "Heat engine off", not zeros.

---

*Backend owner: this repo. Frontend owner: MCC repo. Questions on payload: `GET /heat/Bhubaneswar` on prod is the source of truth, not a mock.*
