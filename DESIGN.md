# Barrierless NYC — Design System

## Direction

Visual concept: **Blue Civic Futurism** — a calm, trustworthy, accessibility-first interface with a polished Spline-inspired spatial feel. Avoid cyberpunk neon overload, generic SaaS card walls, or decorative 3D that competes with usability.

The interface should feel like:

- civic infrastructure + modern mobility;
- transparent data visualization;
- calm spatial depth;
- premium but practical;
- accessible before ornamental.

## Brand

The logo is user-provided. Do not regenerate or materially redesign it. Place final assets under `public/brand/`.

## Palette

Suggested design tokens:

```css
--background: #F7FBFF;
--surface: #FFFFFF;
--surface-muted: #EFF7FF;
--ink: #071A2F;
--ink-muted: #4C637A;
--primary: #0867E8;
--primary-hover: #0556C8;
--primary-soft: #DCEEFF;
--cyan: #24B9F3;
--navy: #072B52;
--border: #CFE1F1;
--success: #16835D;
--warning: #A96500;
--danger: #BE3942;
```

Use semantic tokens rather than hard-coding status colors throughout components.

Dark sections may use deep navy/blue gradients, but the primary application surfaces should remain highly legible.

## Typography

Prefer a clean variable sans-serif available through `next/font`, e.g. Geist/Inter-class typography. Keep typography restrained.

- Display: bold, tight tracking, large but not oversized.
- Body: 16px minimum for important product content.
- Labels: never rely on tiny uppercase text alone.
- Numeric scores: tabular numbers where appropriate.

## Layout

### Landing

- max-width content container around 1200–1280px;
- hero uses asymmetrical two-column layout on desktop;
- text/CTA remains DOM content and must not be inside the Spline canvas;
- mobile stacks text before visual;
- avoid more than 5–6 major homepage sections.

### Navigate

Desktop:

- left route/planning rail ~360–420px;
- remaining viewport is map;
- route results are compact and scannable;
- selected route expands progressively rather than opening a dashboard-like page.

Mobile:

- map uses most of viewport;
- origin/destination controls at top;
- route results and details use accessible bottom sheet/drawer patterns;
- preserve map context while reviewing routes.

## Spline Hero Concept

Use **one** Spline scene on the landing page.

Concept: an abstract isometric NYC street intersection / mobility network made of translucent blue geometry, ramps, curb transitions, route ribbons, and pulsing accessibility nodes.

Preferred visual elements:

- low-poly city blocks;
- soft blue glass-like or matte materials;
- one highlighted accessible path;
- small spatial nodes representing ramps/verified access points;
- gentle orbit/parallax responding to pointer movement;
- subtle route pulse rather than continuous chaotic animation.

Do not:

- render recognizable copyrighted characters;
- use photorealistic humans;
- add excessive particles;
- use more than a few lights;
- add expensive post-processing unless performance remains excellent;
- make the scene required to understand or use the product.

### Performance Contract

- lazy-load Spline below/after critical hero DOM content;
- reserve aspect ratio to avoid CLS;
- render a static gradient/SVG fallback immediately;
- hide/simplify animation for `prefers-reduced-motion`;
- dynamically import client-only Spline runtime if required;
- do not load the scene on `/navigate` or `/report` for MVP;
- if scene materially degrades Lighthouse or mobile usability, ship the fallback instead.

## Shape Language

- rounded corners: moderate, usually 12–20px; avoid making every element a pill;
- borders: subtle blue-gray;
- shadows: soft, low-opacity, used to communicate elevation rather than decoration;
- glass effects: sparingly; content contrast must remain robust;
- route lines and map indicators: crisp, not glowy.

## Iconography

Use Lucide icons consistently. Pair icons with text where meaning could be ambiguous.

Suggested mappings:

- wheelchair profile: Accessibility/Wheelchair-compatible icon if available;
- reports: TriangleAlert / MapPin;
- route evidence: Route, Construction, CircleCheck, Clock, Ruler;
- official NYC data: Landmark/Database;
- community report: Users/MessageSquareWarning.

Never use emoji as primary UI icons.

## Core Components

### MobilityProfileSelector

Four clear selectable controls:

- Wheelchair
- Reduced Mobility
- Stroller
- Mobility Aid

Selected state must be visible with border/background/icon/text changes, not color alone.

### RouteCard

Must show:

- route name/letter;
- Barrierless Score;
- duration;
- distance;
- recommendation status if applicable;
- one-line evidence summary;
- trade-off vs fastest route.

### AccessibilityScore

Display numeric score and semantic label. Include an info affordance describing limitations.

Avoid gauge-chart theatrics. Prefer a clean ring/bar plus textual explanation.

### EvidenceList

Each evidence item includes:

- signal type;
- positive/negative/neutral status;
- source provenance;
- freshness/date where relevant.

### BarrierMarker

Marker appearance must encode source and severity with icon/shape plus color.

### AIExplanation

Label as `AI-assisted explanation` and provide source/evidence context. AI output should look subordinate to deterministic route facts.

## Motion

Motion should communicate spatial relationships and state changes.

Allowed:

- map route transition;
- route card selection transition;
- drawer/sheet movement;
- subtle hero 3D parallax;
- short loading/status transitions.

Avoid:

- scroll-jacking;
- forced smooth scrolling;
- large entrance animations on every element;
- looping text animation;
- excessive glow/pulse effects.

Honor `prefers-reduced-motion` everywhere.

## Accessibility

Target strong WCAG 2.2 AA behavior for core workflows.

- keyboard-visible focus ring;
- logical heading order;
- form labels always present;
- adequate contrast;
- minimum 44x44px primary touch targets where practical;
- map interactions have non-map equivalents where core information is involved;
- status messages announced appropriately;
- no hover-only information;
- route ranking must remain understandable without color;
- Spline canvas is decorative and should not trap keyboard focus.

## Empty/Error States

Design them as first-class states.

Examples:

- no route available;
- routing provider unavailable;
- NYC data partially unavailable;
- AI explanation unavailable;
- image analysis failure;
- location permission denied;
- no nearby evidence found.

The app should explain what still works when one upstream system fails.
