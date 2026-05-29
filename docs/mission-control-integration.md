# EarthStack Mission Control Integration

## Endpoint to Widget Mapping
- `/health` -> marketing hero system status, dashboard command bar health badge.
- `/weather/latest`, `/rivers/latest`, `/features/latest` -> marketing freshness timestamp seed.
- `/risk?location=<location>` -> live risk panel.
- `/risk/map` -> risk map summary + aggregated KPIs.
- `/alerts?limit=20&active_only=<bool>` -> alerts feed + active alerts KPI.
- `/rainfall/<location>` + `/rainfall/stats` -> rainfall intelligence chart.
- `/forecast/<location>` -> forecast panel.
- `/replay/<location>` + `POST /replay/run?location=<location>` -> replay panel.
- `/ml/inference/logs` -> ML observability panel (rule vs ml vs final).

## Polling Intervals
- Health/status: `15s`
- Alerts: `20s`
- Risk by location: `30s`
- Rainfall and rainfall stats: `45s`
- Forecast, risk map, ML logs: `60s`
- Replay history: on-demand/manual

## Failure Behavior
- Widget-scoped errors: each module renders loading, empty, or retry state in isolation.
- Partial failures: degraded banner when **core** endpoints fail: `/health`, `/risk`, `/risk/map` (empty `/alerts` is not a failure).
- **Local dev CORS:** browsers block `localhost` → `https://api.modelearth.in`. The app uses **`/api/proxy/*`** from the client so requests are same-origin; the proxy forwards to `API_BASE_URL` on the server.
- **Strict JSON validation:** responses are validated with Zod. List endpoints (`/risk/map`, `/alerts`, `/ml/inference/logs`) accept many envelope shapes via `extractListPayload` (e.g. `data`, `results`, `items`).
- Non-JSON or HTTP errors: surfaced as widget errors; response snippets are attached to `ApiError` for debugging.
- Rendering faults: top-level UI error boundary prevents full white-screen failure.

## Mapbox
- **Risk theater** uses Mapbox GL. Set `NEXT_PUBLIC_MAPBOX_TOKEN` in your env (`.env.local` for dev). Never hardcode tokens - GitHub push protection will block the commit.
- The basemap stays mounted even when `/risk/map` fails; API errors show as an overlay, not a blank card.

## Deployment / Env Setup
- Public env (optional): `NEXT_PUBLIC_API_BASE_URL=https://api.modelearth.in`
- **Server proxy** (recommended): `API_BASE_URL=https://api.modelearth.in` - used by `/api/proxy/*` on the Node server; overrides public URL when set.
- Optional: `API_UPSTREAM_TIMEOUT_MS` (default `45000`) for slow upstreams.
- If the browser shows **`502` on `/api/proxy/...`**, open the response body: it now includes `message`, `code` (e.g. `ENOTFOUND`, `ETIMEDOUT`), and `target` - meaning **Node could not complete `fetch` to the API** (not a CORS issue).
- Do not expose secrets in frontend env.
- Build: `npm run build`
- Start: `npm run start`
