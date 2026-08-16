# Barrierless NYC — Technical Architecture

## Stack

- Next.js 16 App Router
- TypeScript (strict)
- Tailwind CSS v4
- shadcn/ui + Lucide
- MapLibre GL JS + OpenFreeMap-compatible style
- Turf.js
- openrouteservice
- NYC Open Data / Socrata
- Gemini multimodal model behind a server-only adapter
- Supabase PostgreSQL + Storage
- Zod
- Vercel

## System Boundaries

```text
Browser
  |
  v
Next.js UI
  |
  +--> Route handlers / server actions
          |
          +--> openrouteservice adapter
          +--> NYC Open Data adapters
          +--> BAIE scoring engine
          +--> Gemini adapter
          +--> Supabase repository layer
```

Client components should never call secret-bearing upstream APIs directly.

## Suggested Repository Structure

```text
src/
  app/
    page.tsx
    navigate/
    report/
    about/
    methodology/
    privacy/
    api/
      geocode/
      routes/
      routes/analyze/
      open-data/
      ai/
      reports/
  components/
    brand/
    landing/
    map/
    routing/
    reports/
    ui/
  features/
    routing/
    scoring/
    barriers/
    ai/
  lib/
    env/
    supabase/
    openrouteservice/
    nyc-open-data/
    gemini/
    geo/
    security/
  server/
    repositories/
    services/
  types/
  styles/
public/
  brand/
  fallback/
tests/
```

## External Adapters

All external providers must be wrapped so provider schemas do not leak into the UI.

Recommended contracts:

- `RoutingProvider`
- `GeocodingProvider`
- `NycRampDataSource`
- `NycConstructionDataSource`
- `Nyc311DataSource`
- `AiBarrierAnalyzer`
- `AiRouteExplainer`
- `BarrierReportRepository`

## Route Pipeline

```text
origin + destination + mobility profile
            |
            v
      resolve coordinates
            |
            v
 retrieve route candidates
            |
            v
 create route corridor/buffer
            |
            +--> pedestrian ramps
            +--> active construction
            +--> relevant 311 signals
            +--> community barriers
            |
            v
 normalize evidence
            |
            v
 deterministic BAIE scoring
            |
            v
 route ranking + trade-offs
            |
            v
 optional AI explanation
```

## BAIE Scoring

Keep score logic in a pure, deterministic module such as:

```text
src/features/scoring/
  weights.ts
  score-route.ts
  score-route.test.ts
  types.ts
```

Weights must be centrally versioned. Do not scatter scoring constants across components.

Return both total score and component contributions so the UI can explain the result.

## NYC Open Data Strategy

Use bounded geospatial/time filters whenever possible rather than downloading citywide datasets to the client.

Normalize records into repository-owned shapes such as:

```ts
type AccessibilityEvidence = {
  id: string;
  source: 'nyc_ramp' | 'nyc_construction' | 'nyc_311' | 'community';
  coordinate: [number, number];
  observedAt?: string;
  severity?: 'low' | 'moderate' | 'high';
  category: string;
};
```

Cache relatively stable official data carefully, while displaying freshness where relevant.

## AI Architecture

AI must be behind server-only functions.

### Route explanation

Input: structured route comparison facts.

Output schema:

```ts
type RouteExplanation = {
  summary: string;
  reasons: string[];
  caveat: string;
};
```

Do not pass raw user secrets or unnecessary personal information.

### Barrier analysis

Input: validated image + limited contextual metadata.

Output schema:

```ts
type BarrierAnalysis = {
  barrierType: string;
  severity: 'low' | 'moderate' | 'high';
  observations: string[];
  affectedProfiles: string[];
  suggestedReportCategory: string;
  certainty: 'low' | 'moderate' | 'high';
  requiresUserConfirmation: true;
};
```

Validate model output again with Zod before using it.

## Database

Suggested tables:

### `barrier_reports`

- `id uuid primary key`
- `latitude double precision`
- `longitude double precision`
- `barrier_type text`
- `severity text`
- `description text nullable`
- `image_path text nullable`
- `ai_observations jsonb nullable`
- `status text`
- `created_at timestamptz`
- `expires_at timestamptz nullable`

### `report_confirmations`

- `id uuid primary key`
- `report_id uuid references barrier_reports`
- `anonymous_session_hash text`
- `created_at timestamptz`

Add indexes appropriate for status/time and geospatial query strategy. If PostGIS is introduced, document why and keep the setup minimal.

## API Surface

Suggested route handlers:

```text
POST /api/geocode
POST /api/routes
POST /api/routes/analyze
GET  /api/open-data/ramps
GET  /api/open-data/construction
GET  /api/open-data/311
POST /api/ai/barrier
POST /api/ai/explain-route
GET  /api/reports
POST /api/reports
POST /api/reports/:id/confirm
```

Do not expose a generic AI endpoint.

## Environment Variables

```env
GEMINI_API_KEY=
OPENROUTESERVICE_API_KEY=
NYC_OPEN_DATA_APP_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Keep privileged values server-only. Provide `.env.example` with empty values only.

## Resilience

The product should degrade gracefully:

- Spline unavailable -> static hero fallback;
- AI unavailable -> deterministic route comparison still works;
- one NYC dataset unavailable -> show partial-data status and continue with remaining evidence;
- community API unavailable -> official data routing remains available;
- route provider unavailable -> show explicit retry/error state.

## Performance

- dynamically import MapLibre/Spline where appropriate;
- avoid shipping NYC datasets in initial JS;
- use server filtering;
- minimize client state;
- keep server components as default where interaction is not required;
- defer noncritical visual assets;
- avoid unnecessary dependencies and duplicate icon/component packages.
