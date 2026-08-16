# Barrierless NYC — MVP Target

## Mission

Deliver a reliable, visually distinctive, accessibility-first hackathon MVP that demonstrates one core claim:

> **The shortest route is not always the most usable route.**

The app must prove that Barrierless can compare multiple pedestrian routes using mobility needs and real accessibility evidence, then explain the trade-off clearly.

## P0 — Must Work

### Product foundation

- [ ] Next.js 16 App Router project boots successfully
- [ ] TypeScript strict mode enabled
- [ ] Tailwind CSS v4 configured
- [ ] shadcn/ui configured
- [ ] responsive global layout implemented
- [ ] user-provided logo integrated from `public/brand/`
- [ ] metadata, favicon, Open Graph metadata, robots, sitemap, and 404 state added

### Landing page

- [ ] blue civic-futurist design implemented
- [ ] hero proposition clearly explains the problem
- [ ] primary CTA routes to `/navigate`
- [ ] secondary CTA routes to `/report`
- [ ] one optimized Spline scene or static fallback used in hero
- [ ] hero remains fully usable if Spline fails
- [ ] reduced-motion behavior verified

### Navigation

- [ ] mobility profile selector works
- [ ] origin input works
- [ ] destination input works
- [ ] location search/geocoding works
- [ ] route provider returns multiple candidates where available
- [ ] candidate routes render in MapLibre
- [ ] selected route state is clear
- [ ] duration and distance displayed
- [ ] mobile map/bottom-sheet layout works

### NYC data

- [ ] pedestrian ramp data adapter implemented
- [ ] active construction data adapter implemented
- [ ] relevant 311 data adapter implemented
- [ ] provider responses normalized to internal types
- [ ] partial-data failures shown without breaking routing

### BAIE scoring

- [ ] scoring weights centrally defined
- [ ] scoring deterministic and testable
- [ ] at least 3 major evidence categories influence score
- [ ] route receives a 0–100 comparative suitability score
- [ ] score breakdown is visible
- [ ] route ranking works
- [ ] best-scoring route visually identified
- [ ] trade-off vs fastest route displayed
- [ ] suitability disclaimer displayed

### Reliability

- [ ] no secret-bearing upstream API is called directly from browser
- [ ] loading states exist
- [ ] empty states exist
- [ ] upstream error states exist
- [ ] lint passes
- [ ] typecheck passes
- [ ] production build passes

## P1 — Winning Layer

### AI route explanation

- [ ] server-only Gemini adapter implemented
- [ ] AI receives only structured deterministic route evidence
- [ ] structured response validated with Zod
- [ ] concise explanation rendered as `AI-assisted explanation`
- [ ] AI failure does not affect core score/routing

### AI barrier scanner

- [ ] user can select/take an image
- [ ] image size and MIME validated
- [ ] user can select/confirm report location
- [ ] Gemini returns structured barrier analysis
- [ ] model output validated with Zod
- [ ] result shows barrier type, severity, observations, affected profiles, and certainty band
- [ ] explicit user confirmation required before persistence
- [ ] no fabricated numeric confidence score

### Community reporting

- [ ] confirmed report stored in Supabase
- [ ] RLS enabled
- [ ] image stored using safe generated path
- [ ] active community reports visible on map
- [ ] source visually distinguished from official NYC data
- [ ] temporary report expiry supported
- [ ] duplicate confirmation abuse reduced where practical

### Product explanation

- [ ] `/about` implemented
- [ ] `/methodology` implemented
- [ ] data sources and limitations documented in-app
- [ ] AI role clearly explained
- [ ] privacy page implemented

## P2 — Only After P0 + P1

- [ ] shareable route URL
- [ ] route permalink
- [ ] community confirmation button
- [ ] report resolved/expired UX
- [ ] PWA manifest/installability
- [ ] previous-route offline fallback
- [ ] lightweight analytics without sensitive location history

Do not implement P2 while P0 or P1 has known broken acceptance criteria.

## Explicitly Out of Scope

- login/register/forgot-password flows
- OAuth
- payments
- subscriptions
- chatbots
- generic AI assistant
- RAG/vector database
- blockchain/Web3
- turn-by-turn GPS navigation
- custom ML training
- custom routing algorithms
- native apps
- social feeds
- large admin dashboards

## Demo Acceptance Scenario

A successful demo should be able to show:

1. Open Barrierless NYC landing page.
2. Select `Wheelchair`.
3. Choose two NYC locations.
4. Render at least two candidate routes.
5. Show that the fastest route does not necessarily receive the highest Barrierless Score.
6. Inspect score evidence such as ramp coverage, construction, complaints, or community barriers.
7. Select the higher-suitability route.
8. Generate an AI-assisted explanation based only on that evidence.
9. Open barrier reporting.
10. Upload a sample real-world obstruction image.
11. Show structured AI analysis.
12. Confirm the report.
13. Show the confirmed community barrier on the map.

## Performance Targets

Treat these as goals, not excuses to damage functionality:

- meaningful landing content renders before Spline runtime
- no Spline-caused layout shift
- `/navigate` does not load Spline
- avoid unnecessary initial JavaScript
- map remains usable on typical modern mobile devices
- avoid blocking page render on NYC Open Data requests

## Accessibility Targets

- keyboard access to core controls
- visible focus states
- semantic labels and headings
- route ranking understandable without color
- touch-friendly controls
- reduced-motion respected
- no keyboard trap in map/Spline integrations
- core workflow usable at narrow mobile widths

## Security Release Gate

Before final demo deployment, verify the checklist in `SECURITY.md`.

Any known secret exposure, unrestricted privileged Supabase mutation, arbitrary upload execution, or critical build/security issue blocks release.

## Definition of Hackathon Complete

Barrierless NYC is hackathon-complete when the end-to-end demo scenario works reliably, P0 is complete, the core P1 differentiators work, and the user can understand why the recommended route is different without needing an engineer to explain the implementation.