# ModelEarth Frontend - Project Summary

**Product:** ModelEarth (formerly EarthStack)  
**Site:** https://www.modelearth.in  
**API:** https://api.modelearth.in  
**Repository:** `earthstack` (Next.js monorepo, frontend-focused)

This document summarizes everything delivered on the **frontend** so far: marketing site, dual-mode mission control (operational + analytics), API integration, historical replay, alert notifications, and supporting infrastructure.

**Related docs:** `docs/operational-intelligence-mode.md` (CTO SOP alignment), `docs/mission-control-integration.md` (proxy, env, endpoints).

---

## 1. Product positioning

| Area | Status |
|------|--------|
| Rebrand to **ModelEarth** | Done (metadata, hero, footer, dashboard chrome, Bhoomi G1 copy) |
| Favicon / brand mark | `/public/modelearth-favicon.svg` via `BrandMark` component |
| Homepage | Static marketing experience (no live API on landing - by design) |
| **Dual-mode dashboard** | **Operational Intelligence** (default) + **Analytics & Telemetry** (existing dense UI) |
| Analytics dashboard | Unchanged views at `/dashboard/*` (Overview, Risk, ML, Replay console, etc.) |
| Hardware teaser | **Bhoomi G1** prototype section (software → physical world narrative) |

---

## 2. Technology stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript** (strict, Zod-validated API responses) |
| Styling | **Tailwind CSS 3** + custom HUD utilities in `app/globals.css` |
| Data fetching | **TanStack React Query v5** (caching, polling, mutations) |
| Validation | **Zod** runtime schemas for all API payloads |
| Maps | **Mapbox GL JS** (GeoJSON circle + symbol layers for risk theatre) |
| Charts | **Recharts** (rainfall, forecast, ML timelines, risk comparison) |
| 3D / motion | **Three.js**, **@react-three/fiber**, **@react-three/drei**, **Framer Motion** |
| Icons | **Lucide React** |
| Fonts | **Space Grotesk** (UI), **JetBrains Mono** (telemetry / HUD) |

---

## 3. High-level architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Browser                                                                  │
│  ┌──────────────┐    ┌─────────────────────────────────────────────────┐ │
│  │  / (landing) │    │  /dashboard/*                                    │ │
│  │  Static UX   │    │  MissionShell + MissionProfile (ops | analytics) │ │
│  └──────────────┘    │  ├─ /dashboard/ops*     Operational Intelligence │ │
│                      │  └─ /dashboard, /risk…  Analytics & Telemetry    │ │
│                      │  React Query → /api/proxy/*                        │ │
│                      └──────────────────┬──────────────────────────────────┘ │
└─────────────────────────────────────────┼────────────────────────────────────┘
                                          │
                              ┌───────────▼───────────┐
                              │  Next.js API Route    │
                              │  app/api/proxy/[...]  │
                              │  (forwards GET/POST)  │
                              └───────────┬───────────┘
                                          │
                              ┌───────────▼───────────┐
                              │  api.modelearth.in      │
                              └─────────────────────────┘
```

**Why a proxy?** Browsers cannot call the production API directly from `localhost` (CORS). All client-side requests use `/api/proxy/...`; the server forwards to `API_BASE_URL`.

**POST body forwarding:** Proxy passes JSON bodies for contact registration, alert notify, replay run, and WhatsApp test endpoints.

---

## 4. Marketing site (`/`)

The homepage is intentionally **layout-first** with rich visuals and **no hardcoded live metrics** (dashboard owns live data).

### Sections (top → bottom)

| Section | Component | Highlights |
|---------|-----------|------------|
| Hero | `HeroSection` | 3D `HoloEarth`, scroll parallax, ModelEarth nav, video modal |
| Marquee | `MarqueeStrip` | Infinite ticker strip |
| Data tunnel | `Landing3DTunnel` | CSS 3D scroll tunnel (performance-gated) |
| Orbital deck | `LandingOrbitalDeck` | CSS 3D card deck |
| **Bhoomi G1** | `LandingBhoomiG1` | Hardware teaser; embeds `/public/bhoomi-g1.html` (Three.js device) |
| Bento | `BentoFeatures` | Feature grid |
| Hologram | `LandingHologramShowcase` | Scroll-driven HUD cards |
| Signal path | `LandingSignalPath` | Observe → reason → act (centered connector) |
| Platform | `PlatformCards` | Product pillars |
| Pinned reveal | `LandingPinnedReveal` | Sticky scroll stages + telemetry grid (lag-optimized) |
| Spec matrix | `LandingSpecMatrix` | Capability table |
| Laptop demo | `LaptopDemo` | Product demo frame |
| Horizon CTA | `LandingHorizonCTA` | Link to `/dashboard` |
| Footer | `PremiumFooter` | Brand + links |

### UX / performance work completed

- Removed Lenis smooth-scroll (conflicted with Framer Motion; caused scroll lag)
- Reduced `backdrop-blur` usage across landing components
- `HoloEarth`: conditional WebGL via `useInView`, lower geometry counts
- `LandingPinnedReveal`: single scroll listener + CSS transitions (fixed blank boxes + jank)
- `CursorSpotlight`: simplified to one glow (RAF-coalesced mouse)
- Typography: Space Grotesk + JetBrains Mono (futuristic, product-aligned)
- No em dashes in UI copy (empty values use `n/a`)

---

## 5. Mission Control Dashboard

Two **mission profiles** (CTO SOP v2), switched from the header center strip. Profile persists in `localStorage` (`modelearth:mission-profile`).

| Profile | Default | Nav focus | UX goal |
|---------|---------|-----------|---------|
| **Operational Intelligence** | Yes | Command, Replay evidence, Alerts | Clarity, actions, trust, explainability |
| **Analytics & Telemetry** | No | Theatre, Risk, ML, Rainfall, etc. | Dense NASA / ISRO-style telemetry |

### Shared chrome (`MissionShell` + `app/dashboard/layout.tsx`)

**Header layout (3 zones):**

| Left | Center | Right |
|------|--------|-------|
| Brand + `MissionClock` | **`MissionProfileSwitcher`** | System telemetry only (HEALTH, LAT, LINK, ZONES, ALERTS) |

- Bottom **live ticker** (`LiveTicker`) fed from health, alerts, risk map
- **Degraded mode** banner when core endpoints fail
- Shared state: `MissionContext` (region, active-only alerts, latency, **mission profile**)
- Left rail (`MissionNav`) items change by profile (operational vs analytics)

### Operational Intelligence routes (new)

| Route | View | Purpose |
|-------|------|---------|
| `/dashboard/ops` | `OpsCommandView` | Incident command: situation, actions, evidence, map, incidents |
| `/dashboard/ops/replay` | `OpsReplayView` | Historical replay hero (`HistoricalReplayPanel`) |

**Information hierarchy on command center:**

1. Situation (`SituationSummaryCard`) - risk level, confidence, escalation window  
2. Action (`ActionRecommendations`) - derived from severity + open alerts  
3. Evidence (`ExplainabilityPanel`) - drivers from `raw_data` / scores  
4. Impact - `RiskMapPanel` map theatre  
5. Coordination - `LiveIncidentFeed` + link to full alerts  

Narratives built in `lib/operational/narrative.ts` from live API fields only.

Visiting `/dashboard` with profile **Operational** redirects to `/dashboard/ops`. **Analytics views are not modified**; switching to Analytics opens the existing telemetry stack.

### Analytics & Telemetry routes (unchanged)

| Route | View | Purpose |
|-------|------|---------|
| `/dashboard` | `OverviewView` | Full cockpit: map, KPIs, risk, rainfall, forecast, incidents, ML, replay deck |
| `/dashboard/risk` | `RiskView` | Multi-region risk matrix, bar chart, `/risk/map` table |
| `/dashboard/alerts` | `AlertsView` | Incident table, filters, contacts, Send Alert |
| `/dashboard/rainfall` | `RainfallView` | Per-region oscilloscope + rollup vs baseline |
| `/dashboard/forecast` | `ForecastView` | Multi-region forecast overlay + focus waveform |
| `/dashboard/ml` | `MlView` | **Backtest card**, inference timeline, divergence, debug risk |
| `/dashboard/replay` | `ReplayView` | Per-region replay matrix, dispatch log, **+ historical replay panel** |
| `/dashboard/settings` | `SettingsView` | Preferences, diagnostics, alert delivery, test WhatsApp |
| `/dashboard/climate` | redirect | → `/dashboard/rainfall` |
| `/dashboard/predict` | redirect | → `/dashboard/forecast` |

### Pilot regions (config-driven)

`Bhubaneswar`, `Cuttack`, `Puri`, `Sambalpur`, `Rourkela` - used in region chips, multi-region queries, and contact location scopes.

### Reusable dashboard primitives

- `HudFrame`, `StatusLed`, `KpiRibbon`, `RiskMapPanel`, `RegionChips`
- `MissionProfileSwitcher`, operational widgets under `components/dashboard/operational/`
- `Atoms`: `ScoreBar`, `Telemetry`, `ErrorBlock`, `EmptyBlock`, `PageTitle`, `Legend`
- `useStagger` - staggers initial multi-region fetches to avoid DB spikes

### Recommended demo flow (investor / government)

1. Open **Operational Intelligence** → `/dashboard/ops`  
2. Walk situation → actions → map → incidents  
3. Open **Historical Replay** → `/dashboard/ops/replay`  
4. Switch profile to **Analytics & Telemetry** → ML / risk / telemetry depth  

---

## 6. API integration

### Typed client (`lib/api/`)

| Module | Role |
|--------|------|
| `client.ts` | `apiRequest`, `ApiError`, POST JSON bodies, latency events, proxy error parsing |
| `endpoints.ts` | Domain-grouped API functions |
| `schemas.ts` | Zod schemas (flexible list envelopes via `extractListPayload`) |
| `payload.ts` | `formatScalar`, list normalization |
| `coerce.ts` | `extractNumericSeries` for charts |
| `alerts.ts` | Alert field helpers, notify/contact types, error formatting |

### Integrated endpoints

| Method | Endpoint | Used in |
|--------|----------|---------|
| GET | `/health` | Shell, overview, settings diagnostics |
| GET | `/weather/latest`, `/rivers/latest`, `/features/latest` | Available in SDK (extensible) |
| GET | `/risk?location=` | Overview, ops command, risk view, ML debug |
| GET | `/risk/map` | Map panel, shell, risk view |
| GET | `/alerts` | Alerts view, overview, ops feed, shell |
| GET | `/rainfall/stats`, `/rainfall/{location}` | Rainfall views |
| GET | `/forecast/{location}` | Forecast views |
| GET | `/replay/{location}` | Replay view, overview deck |
| POST | `/replay/run?location=` | Replay dispatch |
| GET | `/replay/historical/demo` | Historical replay (optional `event_id`, `source`) |
| GET | `/replay/historical/events` | Event catalog picker |
| GET | `/ml/inference/logs` | ML view, overview |
| GET | `/ml/backtest/summary` | ML backtest card |
| GET | `/debug/risk?location=` | ML view internals panel |
| GET | `/alert-contacts` | Alerts contacts panel |
| POST | `/alert-contacts` | Register contact (with `channel`) |
| POST | `/alerts/{id}/notify` | Send Alert button |
| GET | `/alerts/delivery/info` | Settings delivery panel |
| POST | `/alerts/delivery/test-whatsapp` | Settings test form |

### Data integrity rules

- **No fake production metrics** on dashboard widgets
- Loading, empty, error, and retry states per widget (`ErrorBlock`, `EmptyBlock`, skeletons where applicable)
- Widget-scoped failures (one endpoint down ≠ whole page crash)
- `AppErrorBoundary` at app root

---

## 7. Historical replay (hero capability)

Verified IndoFloods events with rule-engine simulation frames (T-72h → flood onset).

### API behavior

- **Default:** `GET /replay/historical/demo`  
- **User pick:** `GET /replay/historical/demo?event_id=…&source=indofloods`  
- **Catalog:** `GET /replay/historical/events`  
- Response includes `is_recommended`, `recommended_event`, `first_alert_hours_before`, `frames[]`

### UI (`HistoricalReplayPanel`)

- Auto-play frames every **1.5s** (play / pause / scrub / slider)
- Event header: region, river, dates, peak water, severity, first-alert callout
- Per-frame: rule score, water vs threshold, rainfall bars, triggered state
- Lead-time timeline with first-alert marker
- Event picker + banner when `is_recommended === false` (switch to recommended CTA)

**Surfaces:**

- `/dashboard/replay` (analytics console, below region matrix)  
- `/dashboard/ops/replay` (operational pitch-focused page)  

---

## 8. ML backtest card

`BacktestCard` on `/dashboard/ml` from `GET /ml/backtest/summary`:

- 24h / 48h lead-time recall (hero stat)
- Headline, per-city breakdown, flood events coverage
- Collapsible caveats  
- Long cache, no polling (offline report)

---

## 9. Alert notifications (WhatsApp)

End-to-end UI for the alert delivery API.

### User flows

1. **Register contacts** - Alerts page → Register Contact form  
   - Fields: name, phone (E.164), **channel** (`whatsapp` | `telegram`), role, locations, enabled  
   - `POST /alert-contacts`

2. **Send alert** - When OPEN alerts exist in Incident Table or ops Live Incident Feed  
   - `POST /alerts/{alert_id}/notify` with `provider: twilio_whatsapp`

3. **Test without alert** - Settings → Test WhatsApp  
   - `POST /alerts/delivery/test-whatsapp`

4. **Delivery config** - Settings → Alert Delivery  
   - `GET /alerts/delivery/info`

### Components

- `SendAlertButton.tsx`, `AlertContactsPanel.tsx`, `AlertDeliverySettings.tsx`

---

## 10. Geospatial theatre (`RiskMapPanel`)

- Mapbox dark basemap (`NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`)
- **GeoJSON layers** (`risk-circles`, `risk-labels`) - markers stay geo-anchored at all zoom levels
- Deduplicated districts (API may return `bhubaneswar` + `Bhubaneswar` once)
- Skips non-city rows (e.g. `odisha` state aggregate)
- Severity-colored circles, click popups, active region ring
- Radar sweep, crosshair, coordinate readout, severity legend
- `flyTo` active mission region

---

## 11. Performance & polling strategy

Tuned to reduce load on a DB-backed API:

| Mechanism | Detail |
|-----------|--------|
| Slower intervals | Health/alerts ~60s, risk ~90s, map ~120s, rainfall ~180s, forecast ~300s |
| `withJitter()` | ±25% on each poll tick to desynchronize requests |
| `useStagger()` | Multi-region pages enable queries 250-400ms apart on mount |
| React Query defaults | No refetch on focus/mount/reconnect; 60s stale time; background polling off |
| Historical replay | 60 min stale time, no refetch interval |
| Settings cache keys | Reuses `['health']`, `['alerts']`, etc. - avoids duplicate diagnostics fetches |

See `lib/config.ts` → `POLLING_INTERVALS`, `withJitter`.

---

## 12. Design system (mission control)

### Visual language

- Background: `#03070f` / `#050816`
- Accents: cyan (analytics), emerald (operational / Bhoomi G1), amber (warnings), red (critical)
- HUD corner brackets, grid overlays, scanline/radar animations
- Status semantics: nominal, warning, critical, info, idle (`StatusLed`)

### CSS utilities (`app/globals.css`)

- Marquee keyframes, landing grain, HUD grid/scanlines, radar sweep, LED pulse
- `.input-hud` for forms
- Bhoomi G1: float, scan, particle drift animations
- `prefers-reduced-motion` respected where added

---

## 13. Environment & security

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox (client) - **never commit** real tokens |
| `API_BASE_URL` | Server proxy target (recommended for prod) |
| `NEXT_PUBLIC_API_BASE_URL` | Fallback public base |
| `API_UPSTREAM_TIMEOUT_MS` | Proxy timeout (default 45s) |

Documented in `env.example` and `docs/mission-control-integration.md`.

---

## 14. Project structure (frontend-relevant)

```
app/
  layout.tsx              # Root layout, fonts, metadata, providers
  page.tsx                # Marketing homepage
  providers.tsx           # Error boundary + React Query
  api/proxy/[...path]/    # API proxy (GET + POST with body)
  dashboard/
    layout.tsx            # MissionProvider + MissionShell
    page.tsx              # Overview (analytics) or redirect to /ops
    ops/
      page.tsx            # OpsCommandView
      replay/page.tsx     # OpsReplayView
    alerts|risk|rainfall|forecast|ml|replay|settings/page.tsx

components/
  landing/                # Marketing sections + HoloEarth + Bhoomi G1
  dashboard/
    operational/          # Situation, actions, explainability, incident feed
    replay/               # HistoricalReplayPanel
    ml/                   # BacktestCard
    alerts/               # Send alert, contacts, delivery settings
    views/                # Per-route views (Overview, Ops*, Risk, …)
    MissionShell, MissionNav, MissionProfileSwitcher, …
  providers/, system/, ui/

lib/
  api/                    # client, endpoints, schemas, alerts helpers
  operational/narrative.ts  # API-driven ops copy
  config.ts, query/query-client.ts

public/
  modelearth-favicon.svg
  bhoomi-g1.html

docs/
  frontend-project-summary.md      # this file
  operational-intelligence-mode.md
  mission-control-integration.md
```

---

## 15. Legacy / out of scope (still in repo)

- Older dashboard components (`Sidebar`, `AlertCenter`, `CommandMode/*`, mock API routes under `app/api/mock/*`)
- `components/marketing/MarketingLive.tsx` - not mounted on `/`
- Root `earthstack-3d.html` - source for Bhoomi G1; production embed is `public/bhoomi-g1.html`

---

## 16. How to run locally

```bash
npm install
cp env.example .env.local
# Set NEXT_PUBLIC_MAPBOX_TOKEN=pk....
# Optional: API_BASE_URL=https://api.modelearth.in

npm run dev
# http://localhost:3000           → marketing
# http://localhost:3000/dashboard/ops → operational command (default profile)
# http://localhost:3000/dashboard     → analytics theatre (after profile switch)
```

```bash
npm run build
npm run start
```

---

## 17. Acceptance checklist (frontend)

| Criterion | Status |
|-----------|--------|
| Dashboard metrics from live API only | Yes |
| Dual-mode: Operational + Analytics | Yes |
| Analytics views unchanged in behavior | Yes |
| Historical replay with event picker | Yes |
| ML backtest summary card | Yes |
| Per-widget error/empty/loading states | Yes |
| Partial API failure isolation | Yes |
| CORS-safe local dev via proxy | Yes |
| POST mutations work through proxy | Yes |
| Mapbox markers stable on zoom | Yes |
| Alert contacts + notify + test WhatsApp UI | Yes |
| Premium marketing site + Bhoomi G1 section | Yes |
| ModelEarth branding | Yes |
| DB-friendly polling + stagger | Yes |
| TypeScript + Zod validation | Yes |
| No secrets in source control | Yes (use env) |

---

## 18. Suggested next steps (aligned with CTO SOP)

| Sprint | Frontend focus |
|--------|----------------|
| Sprint 2 | Escalation timeline widget on ops command; replay-first layout polish |
| Sprint 3 | Operational audit trail / narrative export |
| Sprint 4 | Role-based views; mobile ops layer (alerts, escalation, contacts) |
| Ongoing | Notify provider picker; contact picker modal; E2E tests for proxy POST + alerts |

---

*Last updated: May 2026 - reflects dual-mode operational intelligence, historical replay, ML backtest, mission profile header, GeoJSON map markers, alert notifications, and API load optimizations.*
