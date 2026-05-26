# ModelEarth Frontend — Project Summary

**Product:** ModelEarth (formerly EarthStack)  
**Site:** https://www.modelearth.in  
**API:** https://api.modelearth.in  
**Repository:** `earthstack` (Next.js monorepo, frontend-focused)

This document summarizes everything delivered on the **frontend** so far: marketing site, mission-control dashboard, API integration, alert notifications, and supporting infrastructure.

---

## 1. Product positioning

| Area | Status |
|------|--------|
| Rebrand to **ModelEarth** | Done (metadata, hero, footer, dashboard chrome, Bhoomi G1 copy) |
| Favicon / brand mark | `/public/modelearth-favicon.svg` via `BrandMark` component |
| Homepage | Static marketing experience (no live API on landing — by design) |
| Dashboard | Fully API-driven mission control for Odisha pilot regions |
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
| Maps | **Mapbox GL JS** (risk geospatial theatre) |
| Charts | **Recharts** (rainfall, forecast, ML timelines, risk comparison) |
| 3D / motion | **Three.js**, **@react-three/fiber**, **@react-three/drei**, **Framer Motion** |
| Icons | **Lucide React** |
| Fonts | **Space Grotesk** (UI), **JetBrains Mono** (telemetry / HUD) |

---

## 3. High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│  ┌──────────────┐    ┌────────────────────────────────────────┐ │
│  │  / (landing) │    │  /dashboard/*                           │ │
│  │  Static UX   │    │  MissionShell + per-route views           │ │
│  └──────────────┘    │  React Query → /api/proxy/*               │ │
│                      └──────────────────┬─────────────────────────┘ │
└─────────────────────────────────────────┼───────────────────────────┘
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
- Em dashes removed site-wide per brand guidelines

---

## 5. Mission Control Dashboard (`/dashboard`)

NASA / ISRO–style **dense operations UI**: dark HUD, corner brackets, status LEDs, monospace telemetry, bottom ticker.

### Shared chrome (`MissionShell` + `app/dashboard/layout.tsx`)

- Top command strip: health, latency, link status, high-risk zones, active alerts
- UTC clock + mission elapsed timer (`MissionClock`, persisted in `localStorage`)
- Left icon rail (`MissionNav`) with **real Next.js routes** (not visual-only tabs)
- Bottom **live ticker** (`LiveTicker`) fed from health, alerts, risk map
- **Degraded mode** banner when core endpoints fail
- Shared state: `MissionContext` (selected region, active-only alerts filter, latency)

### Dashboard routes

| Route | View | Purpose |
|-------|------|---------|
| `/dashboard` | `OverviewView` | Full cockpit: map, KPIs, risk, rainfall, forecast, incidents, ML, replay deck |
| `/dashboard/risk` | `RiskView` | Multi-region risk matrix, bar chart, `/risk/map` table |
| `/dashboard/alerts` | `AlertsView` | Incident table, filters, **contacts**, **Send Alert** |
| `/dashboard/rainfall` | `RainfallView` | Per-region oscilloscope + rollup vs baseline |
| `/dashboard/forecast` | `ForecastView` | Multi-region forecast overlay + focus waveform |
| `/dashboard/ml` | `MlView` | Inference timeline, divergence flags, debug risk panel |
| `/dashboard/replay` | `ReplayView` | Per-region replay matrix, dispatch log, replay-all |
| `/dashboard/settings` | `SettingsView` | Preferences, env diagnostics, **alert delivery**, **test WhatsApp** |
| `/dashboard/climate` | redirect | → `/dashboard/rainfall` |
| `/dashboard/predict` | redirect | → `/dashboard/forecast` |

### Pilot regions (config-driven)

`Bhubaneswar`, `Cuttack`, `Puri`, `Sambalpur`, `Rourkela` — used in region chips, multi-region queries, and contact location scopes.

### Reusable dashboard primitives

- `HudFrame`, `StatusLed`, `KpiRibbon`, `RiskMapPanel`, `RegionChips`
- `Atoms`: `ScoreBar`, `Telemetry`, `ErrorBlock`, `EmptyBlock`, `PageTitle`, `Legend`
- `useStagger` — staggers initial multi-region fetches to avoid DB spikes

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
| GET | `/risk?location=` | Overview, risk view, ML debug |
| GET | `/risk/map` | Map panel, shell, risk view |
| GET | `/alerts` | Alerts view, overview incident stream, shell |
| GET | `/rainfall/stats`, `/rainfall/{location}` | Rainfall views |
| GET | `/forecast/{location}` | Forecast views |
| GET | `/replay/{location}` | Replay view, overview deck |
| POST | `/replay/run?location=` | Replay dispatch |
| GET | `/ml/inference/logs` | ML view, overview |
| GET | `/debug/risk?location=` | ML view internals panel |
| GET | `/alert-contacts` | Alerts contacts panel |
| POST | `/alert-contacts` | Register contact (with `channel`) |
| POST | `/alerts/{id}/notify` | **Send Alert** button |
| GET | `/alerts/delivery/info` | Settings delivery panel |
| POST | `/alerts/delivery/test-whatsapp` | Settings test form |

### Data integrity rules

- **No fake production metrics** on dashboard widgets
- Loading, empty, error, and retry states per widget (`ErrorBlock`, `EmptyBlock`, skeletons where applicable)
- Widget-scoped failures (one endpoint down ≠ whole page crash)
- `AppErrorBoundary` at app root

---

## 7. Alert notifications (WhatsApp)

End-to-end UI for the alert delivery API.

### User flows

1. **Register contacts** — Alerts page → Register Contact form  
   - Fields: name, phone (E.164), **channel** (`whatsapp` \| `telegram`), role, locations, enabled  
   - `POST /alert-contacts`

2. **Send alert** — When OPEN alerts exist in **Incident Table**  
   - Right column **Notify** (compact) or overview **Incident Stream**  
   - `POST /alerts/{alert_id}/notify` with `provider: twilio_whatsapp`  
   - Notifies all contacts matching alert region (or optional `contact_ids`)

3. **Test without alert** — Settings → Test WhatsApp  
   - `POST /alerts/delivery/test-whatsapp`

4. **Delivery config** — Settings → Alert Delivery  
   - `GET /alerts/delivery/info`

### Components

- `SendAlertButton.tsx` — mutation, success/error feedback, cache invalidation
- `AlertContactsPanel.tsx` — list + registration form
- `AlertDeliverySettings.tsx` — provider info + test form

### Alert table columns

Message, region, severity, risk score, status, delivery status, time, **Notify** action.

---

## 8. Geospatial theatre (`RiskMapPanel`)

- Mapbox dark basemap (requires `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`)
- Risk markers from `/risk/map` with severity styling
- Radar sweep, crosshair, coordinate readout, severity legend
- `flyTo` active mission region
- Basemap remains visible when API returns no points (overlay message instead of blank card)

---

## 9. Performance & polling strategy

Tuned to reduce load on a DB-backed API:

| Mechanism | Detail |
|-----------|--------|
| Slower intervals | Health/alerts ~60s, risk ~90s, map ~120s, rainfall ~180s, forecast ~300s |
| `withJitter()` | ±25% on each poll tick to desynchronize requests |
| `useStagger()` | Multi-region pages enable queries 250–400ms apart on mount |
| React Query defaults | No refetch on focus/mount/reconnect; 60s stale time; background polling off |
| Settings cache keys | Reuses `['health']`, `['alerts']`, etc. — avoids duplicate diagnostics fetches |

See `lib/config.ts` → `POLLING_INTERVALS`, `withJitter`.

---

## 10. Design system (mission control)

### Visual language

- Background: `#03070f` / `#050816`
- Accents: cyan (`#22d3ee`), emerald (Bhoomi G1), amber (warnings), red (critical)
- HUD corner brackets (`.hud-bracket-*`), grid overlays, scanline/radar animations
- Status semantics: nominal, warning, critical, info, idle (`StatusLed`)

### CSS utilities (`app/globals.css`)

- Marquee keyframes, landing grain, HUD grid/scanlines, radar sweep, LED pulse
- `.input-hud` for forms
- Bhoomi G1: float, scan, particle drift animations
- `prefers-reduced-motion` respected where added

---

## 11. Environment & security

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox (client) — **never commit** real tokens |
| `API_BASE_URL` | Server proxy target (recommended for prod) |
| `NEXT_PUBLIC_API_BASE_URL` | Fallback public base |
| `API_UPSTREAM_TIMEOUT_MS` | Proxy timeout (default 45s) |

Documented in `env.example` and `docs/mission-control-integration.md`.

Git history was cleaned after accidental token commit; tokens must live only in `.env.local` / hosting env.

---

## 12. Project structure (frontend-relevant)

```
app/
  layout.tsx              # Root layout, fonts, metadata, providers
  page.tsx                # Marketing homepage
  providers.tsx           # Error boundary + React Query
  api/proxy/[...path]/    # API proxy (GET + POST with body)
  dashboard/
    layout.tsx            # MissionProvider + MissionShell
    page.tsx              # Overview
    alerts|risk|rainfall|forecast|ml|replay|settings/page.tsx

components/
  landing/                # Marketing sections + HoloEarth + Bhoomi G1
  dashboard/              # Shell, views, map, alerts, atoms
  providers/              # AppProviders
  system/                 # AppErrorBoundary, DataState, StatusBadge
  marketing/              # MarketingLive (optional API marketing module)
  ui/                     # CursorSpotlight, Skeleton

lib/
  api/                    # client, endpoints, schemas, alerts helpers
  config.ts               # regions, polling, mapbox, API base
  query/query-client.ts   # React Query defaults

public/
  modelearth-favicon.svg
  bhoomi-g1.html          # Three.js hardware prototype (iframe embed)

docs/
  mission-control-integration.md
  frontend-project-summary.md   # this file
```

---

## 13. Legacy / out of scope (still in repo)

These exist from earlier iterations and are **not** the primary product surface today:

- Older dashboard components (`Sidebar`, `AlertCenter`, `CommandMode/*`, mock API routes under `app/api/mock/*`)
- `components/marketing/MarketingLive.tsx` — API-driven marketing module (not mounted on `/`)
- Root `earthstack-3d.html` — source for Bhoomi G1; production embed is `public/bhoomi-g1.html`

---

## 14. How to run locally

```bash
npm install
cp env.example .env.local
# Set NEXT_PUBLIC_MAPBOX_TOKEN=pk....
# Optional: API_BASE_URL=https://api.modelearth.in

npm run dev
# http://localhost:3000          → marketing
# http://localhost:3000/dashboard → mission control
```

```bash
npm run build
npm run start
```

---

## 15. Acceptance checklist (frontend)

| Criterion | Status |
|-----------|--------|
| Dashboard metrics from live API only | Yes |
| Per-widget error/empty/loading states | Yes |
| Partial API failure isolation | Yes |
| CORS-safe local dev via proxy | Yes |
| POST mutations work through proxy | Yes |
| Multi-page dashboard navigation | Yes |
| Mapbox risk map with env token | Yes |
| Alert contacts + notify + test WhatsApp UI | Yes |
| Premium marketing site + Bhoomi G1 section | Yes |
| ModelEarth branding | Yes |
| DB-friendly polling + stagger | Yes |
| TypeScript + Zod validation | Yes |
| No secrets in source control | Yes (use env) |

---

## 16. Suggested next steps (frontend)

- Surface **Send Alert** more prominently when incident table is empty (onboarding banner)
- Optional: provider picker on notify (`twilio_whatsapp` \| `telegram` \| `simulation`)
- Contact picker modal to pass `contact_ids` instead of notify-all
- E2E tests for proxy POST + alert flows
- Update `docs/mission-control-integration.md` polling table to match current `POLLING_INTERVALS`
- Lighthouse / a11y pass on dashboard tables and forms

---

*Last updated: May 2026 — reflects work through mission-control multi-route dashboard, Bhoomi G1 landing section, alert notification integration, and API load optimizations.*
