# Barrierless NYC

**Navigate New York by accessibility, not just distance.**

Barrierless NYC is an accessibility-first web application that compares pedestrian routes using mobility needs, official NYC accessibility/infrastructure data, community reports, and AI-assisted explanations.

## Project Status

Hackathon MVP planning and implementation.

## Product Idea

Traditional routing often optimizes for speed or distance. Barrierless NYC evaluates multiple route candidates and estimates comparative accessibility suitability for profiles such as:

- Wheelchair
- Reduced Mobility
- Stroller
- Mobility Aid

The application uses a deterministic **Barrierless Accessibility Intelligence Engine (BAIE)** to score route candidates. AI is used only to explain evidence and analyze barrier photos; it does not generate routes or calculate scores.

## Core MVP Flow

1. Choose a mobility profile.
2. Enter origin and destination.
3. Retrieve candidate routes.
4. Enrich routes with NYC accessibility/infrastructure evidence.
5. Compute deterministic Barrierless Scores.
6. Compare time, distance, and accessibility trade-offs.
7. Read an AI-assisted explanation grounded in route evidence.
8. Report a barrier by uploading a photo.
9. Review structured AI analysis.
10. Confirm before publishing a community report.

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide
- MapLibre GL JS
- OpenFreeMap-compatible basemap
- Turf.js
- openrouteservice
- NYC Open Data / Socrata
- Gemini multimodal model
- Supabase PostgreSQL + Storage
- Zod
- Vercel
- Spline for one optional/lazy-loaded landing hero scene

## Design

Visual direction: **Blue Civic Futurism**.

Spline is used only as a non-critical visual storytelling layer. The core application remains fully functional without it.

The project logo is user-provided and should be placed under `public/brand/` during implementation.

## Documentation

Codex and contributors should read:

- [`AGENTS.md`](./AGENTS.md) — repository-local Codex contract
- [`PRODUCT.md`](./PRODUCT.md) — product requirements and user journeys
- [`DESIGN.md`](./DESIGN.md) — blue design system and Spline rules
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — technical architecture
- [`SECURITY.md`](./SECURITY.md) — security requirements
- [`TARGET.md`](./TARGET.md) — P0/P1/P2 acceptance criteria
- [`SKILLS.md`](./SKILLS.md) — Codex/OpenAI plugin skills workflow
- [`CODEX_PROMPT.md`](./CODEX_PROMPT.md) — ready-to-use implementation prompt

## Codex

The old `openai/skills` repository is deprecated. This project is designed around the current OpenAI Codex plugin/skill ecosystem, especially the official **Build Web Apps** plugin skills such as:

- `frontend-app-builder`
- `frontend-testing-debugging`
- `react-best-practices`
- `shadcn-best-practices`
- `supabase-best-practices`

See `SKILLS.md` for the recommended workflow.

## Domain

Planned deployment:

`barierless.icaluwu.site`

## Important Disclaimer

Barrierless Score is a comparative accessibility-suitability estimate based on available data. It is not a guarantee that a route is safe, obstacle-free, or fully accessible in real-world conditions.

## Development

The implementation bootstrap should create conventional scripts such as:

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

Use `CODEX_PROMPT.md` to begin the main VibeCoding implementation session.
