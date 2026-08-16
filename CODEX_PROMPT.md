# Barrierless NYC — Codex VibeCoding Prompt

Use the following as the primary implementation prompt in Codex.

---

You are building **Barrierless NYC**, an English-language accessibility-first web application for New York City.

Repository: `icaluwu/Barrierless-NYC`

Primary domain: `barierless.icaluwu.site`

The project is intended for a hackathon MVP and must prioritize demo reliability, accessibility, performance, security, and design quality over feature count.

## Mandatory first step

Before writing code, read the repository documentation in this exact order:

1. `AGENTS.md`
2. `PRODUCT.md`
3. `DESIGN.md`
4. `ARCHITECTURE.md`
5. `SECURITY.md`
6. `TARGET.md`
7. `SKILLS.md`
8. `README.md`

Then inspect the current repository tree and identify the next incomplete P0 vertical slice from `TARGET.md`.

Do not ask me to restate requirements already documented in the repository.

## Use official OpenAI Codex web-app skills

When available, use the current official OpenAI `Build Web Apps` plugin skills relevant to the phase:

- `frontend-app-builder`
- `frontend-testing-debugging`
- `react-best-practices`
- `shadcn-best-practices`
- `supabase-best-practices`

Do not use Stripe/payment-related skills because payments are out of scope.

The old `openai/skills` repository is deprecated; prefer the current OpenAI plugin/skill ecosystem.

## Product behavior

The core claim is:

> The shortest route isn't always the route you can use.

The application must let a user:

1. choose a mobility profile;
2. enter origin and destination;
3. retrieve multiple pedestrian-route candidates;
4. enrich routes with official NYC accessibility/infrastructure evidence;
5. compute a deterministic Barrierless Score;
6. compare time/distance/accessibility trade-offs;
7. see a recommended higher-suitability route;
8. request an AI-assisted explanation grounded only in deterministic evidence;
9. upload a photo of a barrier;
10. receive structured multimodal AI analysis;
11. explicitly confirm before a community report is persisted.

## Stack

Use:

- Next.js 16 App Router
- React
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui
- Lucide icons
- MapLibre GL JS
- OpenFreeMap-compatible style
- Turf.js
- openrouteservice
- NYC Open Data / Socrata
- Gemini via a server-only adapter
- Supabase PostgreSQL + Storage
- Zod
- Vercel

## Design

Follow `DESIGN.md` exactly.

Visual identity: **Blue Civic Futurism**.

The design should feel modern, calm, spatial, premium, and civic-tech oriented. It should not look like generic AI SaaS, cyberpunk neon overload, or a dashboard made of dozens of cards.

The user will provide the logo. Do not create or redesign the logo.

Use **Spline only as a landing-page visual layer**:

- one hero scene maximum;
- abstract low-poly NYC/accessibility network;
- blue/cyan palette;
- lazy-load it;
- include a static fallback;
- respect `prefers-reduced-motion`;
- do not load Spline on `/navigate` or `/report`;
- never make CTA interaction depend on the 3D scene.

If the Spline integration materially harms mobile performance or accessibility, keep the fallback and simplify/remove the runtime scene.

## Architecture rule: deterministic core, generative explanation

This is non-negotiable.

AI must not generate routes and must not calculate the Barrierless Score.

Routing and accessibility scoring must be ordinary deterministic application logic that can be unit tested.

AI is allowed only for:

1. concise route explanations based on already-computed structured evidence;
2. multimodal barrier-image analysis with strict structured output.

Validate AI outputs with Zod before use.

Never fabricate precise model confidence percentages.

## Accessibility

This product serves people with mobility needs, so accessibility quality is part of the product, not a later polish step.

Core requirements:

- keyboard-operable controls;
- visible focus states;
- semantic HTML;
- strong contrast;
- no color-only status communication;
- touch-friendly mobile controls;
- meaningful labels for map controls;
- `prefers-reduced-motion` support;
- no keyboard trap in map or Spline;
- error/loading/empty/success states;
- core route information available outside map-only visuals.

## Security

Follow `SECURITY.md`.

At minimum:

- server-only API secrets;
- Zod validation at trust boundaries;
- rate limiting on expensive/write endpoints;
- safe image MIME/size validation;
- Supabase RLS;
- generated storage paths;
- no `dangerouslySetInnerHTML` for AI/community content;
- no arbitrary server-side URL fetching;
- no stack trace or secret leakage;
- production security headers;
- no service-role key in the browser bundle.

## Scope

Do not add:

- login/register;
- OAuth;
- forgot password;
- payment/subscription;
- chatbots;
- generic AI assistant;
- vector databases/RAG;
- blockchain;
- gamification;
- social feeds;
- native apps;
- custom ML training;
- custom routing engine;
- large admin dashboard.

Do not implement P2 while any P0/P1 blocker remains.

## Working style

Implement in small vertical slices.

For each slice:

1. inspect relevant existing code;
2. implement the smallest coherent solution;
3. add/adjust tests;
4. verify loading/error/empty states;
5. verify accessibility implications;
6. run relevant checks;
7. update documentation if architecture or behavior changed.

Avoid broad rewrites and unnecessary dependencies.

## Verification

Before declaring a meaningful phase complete, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Use browser testing for UI changes. Verify mobile and desktop. Check the browser console. Test reduced motion. Test the Spline-failure fallback. Test third-party API failure states.

## Final implementation priority

Prioritize in this order:

1. project bootstrap + design system;
2. landing shell + static hero fallback;
3. map shell + mobility selector + geocoding;
4. candidate routing;
5. NYC data adapters;
6. deterministic BAIE scoring + tests;
7. route comparison UI;
8. AI route explanation;
9. barrier scanner;
10. Supabase persistence + RLS;
11. community map layer;
12. Spline enhancement;
13. final accessibility/security/performance pass.

Start by reading the docs and implementing only the first incomplete P0 vertical slice. Do not expand scope.
