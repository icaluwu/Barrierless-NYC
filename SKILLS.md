# Barrierless NYC — Codex Skills Workflow

## Important Note

The previously referenced `openai/skills` repository is deprecated. Use the current OpenAI plugin/skill ecosystem instead, especially the `openai/plugins` repository and Codex plugin documentation.

For this project, the most relevant official OpenAI plugin is **Build Web Apps**.

## Recommended Official Skills

Use these skills when available in Codex:

### `frontend-app-builder`

Use for:

- implementing the landing page;
- building the map application shell;
- composing responsive UI;
- generating/assembling polished frontend flows;
- browser-oriented implementation work.

### `frontend-testing-debugging`

Use after meaningful UI or integration work for:

- browser testing;
- responsive verification;
- console/runtime error investigation;
- interaction debugging;
- regression checks.

### `react-best-practices`

Use whenever implementing or refactoring React/Next.js behavior, especially:

- component boundaries;
- client/server component choices;
- effects/state management;
- rendering performance;
- data-flow cleanup.

### `shadcn-best-practices`

Use for:

- forms;
- drawers/sheets;
- dialogs;
- buttons;
- inputs;
- accessible component composition;
- avoiding unnecessary custom reinvention of established UI primitives.

### `supabase-best-practices`

Use before implementing:

- database schema;
- RLS policies;
- storage;
- community report persistence;
- privileged server-side Supabase access.

Do **not** use `stripe-best-practices`; payments are intentionally out of scope.

## Security Guidance

When performing a security-focused pass, use the current official security guidance/plugin capabilities available in the active Codex environment. The old skills catalog included `security-best-practices`, but do not pin project instructions to a deprecated repository checkout.

Regardless of installed skills, `SECURITY.md` in this repository is mandatory.

## Skill Invocation Strategy

Do not invoke every skill for every task. Use only the skills relevant to the current implementation phase.

### Bootstrap

Recommended:

- `frontend-app-builder`
- `react-best-practices`
- `shadcn-best-practices`

Goal: establish project shell, design tokens, shared primitives, navigation, and landing structure.

### Map and route UX

Recommended:

- `frontend-app-builder`
- `react-best-practices`
- `frontend-testing-debugging`

Goal: MapLibre integration, route state, responsive planner rail/bottom sheet, error/loading states.

### Supabase/reporting

Recommended:

- `supabase-best-practices`
- `react-best-practices`
- `frontend-testing-debugging`

Goal: safe schema, RLS, storage, persistence, confirmation workflow.

### Final quality pass

Recommended:

- `frontend-testing-debugging`
- `react-best-practices`
- active official security review skill/plugin if available

Goal: accessibility, browser regression, security, performance, and build verification.

## Repository-Local Instructions Win

Skills provide implementation expertise. They do not override project scope.

Codex must always obey:

1. `AGENTS.md`
2. `PRODUCT.md`
3. `DESIGN.md`
4. `ARCHITECTURE.md`
5. `SECURITY.md`
6. `TARGET.md`

If a skill suggests additional product features, dependencies, patterns, or services that conflict with these documents, ignore the expansion and stay inside MVP scope.

## Spline Workflow

There is no requirement to make Spline an agent skill. Treat Spline as a normal visual integration.

Implementation contract:

1. Build critical hero content in HTML/CSS first.
2. Add a fixed-size/aspect-ratio visual container.
3. Implement an immediate static fallback.
4. Dynamically/lazily load the Spline runtime/scene.
5. Keep canvas decorative and out of core keyboard flow.
6. Respect `prefers-reduced-motion`.
7. Measure page behavior after integration.
8. Remove/simplify Spline if it materially harms the MVP.

## Required Codex Behavior

Before implementation:

- read `AGENTS.md` and linked project docs;
- inspect current repository state;
- avoid assuming scaffolding exists;
- establish a small implementation plan.

During implementation:

- work P0 before P1 and P1 before P2;
- keep deterministic domain logic separate from AI;
- keep third-party APIs behind adapters;
- test each meaningful vertical slice;
- avoid dependency bloat.

Before marking work complete:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Run browser/UI verification where applicable.

## Useful Codex Opening Instruction

When starting a new implementation session, tell Codex:

> Read `AGENTS.md` first, then follow its documented read order. Use the official OpenAI Build Web Apps plugin skills relevant to the current phase. Implement only the next incomplete P0/P1 vertical slice from `TARGET.md`; do not expand scope. Preserve the deterministic-core/generative-explanation architecture and the blue accessibility-first design system.
