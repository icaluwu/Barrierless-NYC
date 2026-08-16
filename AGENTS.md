# Barrierless NYC — Codex Agent Contract

This repository is intended to be built primarily with Codex. This file is the highest-priority repository-local engineering contract for implementation work.

## 1. Read Order

Before making meaningful changes, read these files in order:

1. `AGENTS.md`
2. `PRODUCT.md`
3. `DESIGN.md`
4. `ARCHITECTURE.md`
5. `SECURITY.md`
6. `TARGET.md`
7. `SKILLS.md`
8. `README.md`

If implementation and documentation disagree, stop expanding scope. Prefer the smaller, safer MVP behavior and update the relevant documentation in the same change.

## 2. Product Goal

Build **Barrierless NYC**, an English-language accessibility-first web application that helps people compare pedestrian routes based on mobility needs rather than distance alone.

The product must combine:

- accessible pedestrian routing;
- official NYC Open Data signals;
- deterministic accessibility scoring;
- community barrier reports;
- AI-assisted image analysis and route explanation;
- an accessible, responsive, high-quality map experience.

Primary domain: `barierless.icaluwu.site`.

Repository: `icaluwu/Barrierless-NYC`.

## 3. MVP Scope Discipline

The core demo must work end-to-end before optional features are added:

1. Select a mobility profile.
2. Enter origin and destination.
3. Fetch candidate routes.
4. Overlay relevant NYC accessibility/infrastructure data.
5. Compute deterministic Barrierless Scores.
6. Rank routes and show the recommended route.
7. Explain the recommendation using evidence-backed AI text.
8. Allow a user to upload a barrier photo.
9. Analyze the photo with multimodal AI.
10. Require explicit user confirmation before storing a community report.

Do not add the following unless all P0 and P1 acceptance criteria in `TARGET.md` are complete:

- authentication or account profiles;
- social login;
- payments;
- blockchain;
- chatbots;
- generic AI assistant features;
- RAG/vector databases;
- gamification;
- native mobile apps;
- admin dashboards beyond a minimal internal moderation mechanism if truly required;
- custom routing engines;
- custom ML training.

## 4. Technology Contract

Use this stack unless there is a concrete blocking incompatibility:

- Next.js 16 App Router
- React
- TypeScript with strict mode
- Tailwind CSS v4
- shadcn/ui
- Lucide icons
- MapLibre GL JS
- OpenFreeMap-compatible map style
- Turf.js for bounded client/server geospatial utilities
- openrouteservice for routing/geocoding where appropriate
- NYC Open Data / Socrata APIs
- Gemini multimodal model via a server-only adapter
- Supabase PostgreSQL
- Supabase Storage for confirmed report images
- Zod at all external trust boundaries
- Vercel for deployment
- Spline only as a lightweight landing-page visual layer

Do not replace deterministic routing/scoring with LLM decisions.

## 5. Architecture Principles

- **Deterministic core, generative explanation.** Route generation and Barrierless Score calculations must be deterministic and testable. AI may explain evidence; it must not invent route facts.
- **Server-side secrets.** Gemini, openrouteservice, NYC app token, and Supabase service-role secrets must never reach client bundles.
- **Progressive enhancement.** The app must remain usable if the Spline scene fails, WebGL is unavailable, animations are disabled, or AI explanation fails.
- **Evidence provenance.** UI must distinguish official NYC data from community reports and AI-assisted observations.
- **No false safety claims.** Never label a route as guaranteed safe or fully accessible. Use terms such as “higher accessibility suitability based on available data.”
- **Fail usefully.** API failures must have a user-facing recovery path, not a blank panel or infinite spinner.

## 6. Frontend Quality Bar

The interface must feel deliberately designed, not AI-generated boilerplate.

Required:

- responsive from 320px mobile through large desktop;
- keyboard-operable navigation and controls;
- visible focus states;
- semantic HTML;
- WCAG-conscious contrast;
- no information communicated by color alone;
- touch targets suitable for mobile;
- map controls with text/accessible labels;
- reduced-motion support;
- loading, empty, error, and success states;
- skeletons only where useful;
- no layout shift caused by the Spline hero;
- no unnecessary dashboard-card grids.

Use the design tokens and composition rules in `DESIGN.md`.

## 7. Spline Rules

Spline is a **visual storytelling layer**, not a dependency for core functionality.

- Use at most one Spline scene on the landing page for MVP.
- Do not embed Spline on `/navigate` or `/report` unless a later performance budget explicitly allows it.
- Lazy-load the scene after critical content.
- Provide a static CSS/SVG fallback.
- Disable or simplify animation for `prefers-reduced-motion`.
- Keep the scene blue/cyan, abstract, civic-tech, accessibility-oriented, and low-poly.
- Avoid heavy textures, excessive lights, and stacked post-processing effects.
- Never block CTA interaction behind the 3D canvas.
- Logo is user-provided; do not regenerate or redesign it. Expect a final asset under `public/brand/`.

## 8. AI Rules

AI has two approved MVP responsibilities:

### Route explanation

Input only structured route evidence already computed by the application. Output concise explanations of why one route ranks higher.

### Barrier image analysis

Analyze an uploaded image into a strict structured schema such as:

- barrier type;
- severity band;
- visual observations;
- affected mobility profiles;
- suggested reporting category;
- uncertainty band;
- `requiresUserConfirmation: true`.

Never fabricate numeric confidence values. Use qualitative uncertainty such as low/moderate/high certainty if needed.

Never submit or persist an AI-generated community report without explicit user confirmation.

## 9. Accessibility Scoring Rules

The Barrierless Score must be calculated in ordinary application code from documented inputs. Keep weights centrally defined and versioned.

Initial signal families:

- pedestrian-ramp coverage;
- active construction conflicts;
- relevant recent 311 complaints;
- confirmed community barriers;
- route difficulty/mobility-profile constraints.

The score is a comparative suitability metric, not a certification of accessibility.

Every score detail view must expose enough signal-level evidence for a user or judge to understand the recommendation.

## 10. Data Rules

Prefer official NYC Open Data sources for infrastructure evidence. Do not scrape pages when an API/dataset exists.

Normalize external data behind repository-owned adapters. UI components should not depend directly on raw Socrata/openrouteservice/Gemini response shapes.

Use short bounded timeouts and explicit fallback behavior for third-party services.

Cache only where correctness allows it. Do not make stale community barriers appear current without displaying age/status.

## 11. Database Rules

For community reporting:

- enable Row Level Security;
- keep service-role use server-only;
- validate every insert server-side;
- do not trust client-provided severity, AI output, coordinates, timestamps, or moderation state without validation;
- store only required personal data; MVP should not require identity;
- set expiry/review behavior for temporary barriers;
- prevent duplicate confirmations from the same anonymous session where feasible.

## 12. Security Rules

Read `SECURITY.md` before adding any endpoint, upload path, third-party integration, HTML rendering, or privileged Supabase operation.

At minimum:

- validate request bodies with Zod;
- constrain image size and accepted MIME types;
- sanitize/escape untrusted content by default;
- enforce rate limits on AI, route, geocode, and report endpoints;
- never use `dangerouslySetInnerHTML` for AI/community content;
- configure appropriate security headers;
- avoid exposing stack traces or secret-bearing upstream errors;
- keep `.env*` out of git except `.env.example`.

## 13. Testing and Verification

Do not call a feature complete merely because it compiles.

For meaningful changes, run the applicable checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

If scripts do not yet exist, create reasonable equivalents during bootstrap.

For UI work, verify at minimum:

- mobile viewport;
- desktop viewport;
- keyboard navigation;
- reduced motion;
- empty/error/loading states;
- browser console has no unexpected errors;
- core CTA remains available when Spline fails to load.

For route/scoring logic, write unit tests for deterministic score behavior and edge cases.

## 14. Change Discipline

- Prefer small coherent changes over broad rewrites.
- Do not silently change product requirements.
- Keep API contracts typed.
- Delete dead scaffolding instead of leaving duplicate approaches.
- Document material architectural decisions.
- Do not add a dependency if a small existing utility or platform API solves the same problem.
- Do not optimize for cleverness; optimize for demo reliability, accessibility, security, and maintainability.

## 15. Definition of Done

A task is done when:

- implementation meets the relevant acceptance criteria;
- TypeScript is clean;
- lint/build/tests pass where applicable;
- accessibility and failure states were considered;
- secrets remain server-only;
- documentation is updated if behavior or architecture changed;
- no critical or high-confidence security regression was knowingly introduced.
