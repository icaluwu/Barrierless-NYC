# Barrierless NYC — Product Specification

## Vision

**Barrierless NYC helps people choose routes around New York City based on how they move, not merely how fast they can arrive.**

The product combines accessible-routing candidates, official NYC infrastructure signals, community barrier reports, and AI-assisted explanations into one evidence-backed navigation experience.

## Product Identity

- Product name: **Barrierless NYC**
- Language: **English only for MVP**
- Primary domain: `barierless.icaluwu.site`
- Repository: `icaluwu/Barrierless-NYC`
- Tagline: **Navigate New York by accessibility, not just distance.**

## Core Problem

Conventional routing systems optimize primarily for distance and travel time. For wheelchair users, people using mobility aids, seniors, and caregivers with strollers, a geometrically valid walking route can still contain material barriers such as missing/blocked curb ramps, active construction, difficult crossings, or temporary obstructions.

Barrierless NYC turns fragmented accessibility evidence into an understandable route comparison.

## Target Users

### Primary

- wheelchair users;
- people using walkers, canes, or other mobility aids;
- people with reduced mobility;
- parents/caregivers using strollers.

### Secondary

- caregivers and companions;
- accessibility advocates;
- NYC visitors planning mobility-conscious trips;
- residents reporting local pedestrian barriers.

## Product Principles

1. **Accessibility before novelty.** If a visual effect competes with usability, usability wins.
2. **Evidence before AI prose.** AI explains known evidence; it does not invent conditions.
3. **Comparative suitability, not safety guarantees.** The product does not certify routes as safe or fully accessible.
4. **Official and community data are visibly distinct.** Provenance must be understandable.
5. **No account required for the core experience.** The MVP should be immediately usable.
6. **Route choice remains user-controlled.** Recommended does not mean mandatory.

## Core User Journey

### Journey A — Find an accessibility-conscious route

1. User opens `/navigate`.
2. User selects a mobility profile.
3. User enters origin and destination.
4. App resolves coordinates and retrieves multiple route candidates.
5. Barrierless Intelligence Engine intersects routes with available accessibility/infrastructure signals.
6. Each route receives a deterministic Barrierless Score.
7. App ranks routes and clearly presents trade-offs (time, distance, accessibility evidence).
8. User can inspect evidence and ask for a concise AI explanation of why the route ranks higher.
9. User chooses the route they prefer.

### Journey B — Report a real-world barrier

1. User opens `/report` or starts a report from the map.
2. User supplies a photo and approximate location.
3. AI analyzes only visible evidence into a strict structured result.
4. User sees the proposed category, severity band, observations, and affected mobility profiles.
5. User edits/confirms details.
6. Only after explicit confirmation is the report stored.
7. Confirmed report appears on the map as community-sourced data.

## Mobility Profiles

### Wheelchair

Prioritize:

- step-free routing;
- curb/pedestrian ramp availability;
- construction avoidance;
- incline/difficulty where routing data supports it;
- confirmed obstructions.

### Reduced Mobility

Prioritize:

- reasonable distance;
- lower difficulty;
- fewer problematic crossings;
- construction/obstruction avoidance.

### Stroller

Prioritize:

- curb ramps;
- step-free path;
- sidewalk continuity;
- construction and physical obstruction avoidance.

### Mobility Aid

Prioritize:

- sidewalk continuity;
- curb ramps;
- manageable crossings;
- reduced obstruction risk.

## Barrierless Accessibility Intelligence Engine (BAIE)

BAIE is the product's core differentiator.

It does **not** create routes. It evaluates route candidates produced by a routing engine and ranks them according to mobility-profile-specific evidence.

### Initial evidence families

- pedestrian-ramp coverage/proximity;
- construction conflicts;
- relevant recent 311 complaints;
- confirmed community barrier reports;
- route difficulty indicators available from the routing provider.

### Output

For every candidate route:

- Barrierless Score (0–100);
- label such as `Challenging`, `Moderate`, `More Accessible`, `Highest Suitability`;
- travel time;
- distance;
- evidence counts/summary;
- trade-offs against the fastest route;
- provenance of evidence;
- optional AI explanation generated exclusively from structured evidence.

## Scoring Policy

The score is deterministic and versioned in application code.

Initial conceptual weighting:

- pedestrian ramp evidence: 30%;
- active construction conflicts: 25%;
- relevant recent 311 signals: 20%;
- confirmed community barriers: 15%;
- route difficulty/profile compatibility: 10%.

These weights are a starting point and may be tuned, but changes must be documented and covered by tests.

The UI must communicate:

> “Barrierless Score estimates comparative accessibility suitability from available data. Real-world conditions may differ.”

Never claim a route is guaranteed safe or accessible.

## Approved AI Features

### 1. Explain My Route

AI receives only structured application evidence, for example:

```json
{
  "recommendedRoute": "B",
  "score": 91,
  "additionalMinutes": 2,
  "rampEvidence": 11,
  "constructionConflicts": 0,
  "recentRelevantComplaints": 1,
  "communityBarriers": 0
}
```

AI returns a short, plain-English explanation of the trade-off.

### 2. Barrier Image Analyzer

AI analyzes an image into a constrained structure:

```json
{
  "barrierType": "blocked_curb_ramp",
  "severity": "high",
  "observations": ["The curb ramp appears partially blocked by construction material."],
  "affectedProfiles": ["wheelchair", "stroller"],
  "suggestedReportCategory": "pedestrian_ramp_obstruction",
  "certainty": "moderate",
  "requiresUserConfirmation": true
}
```

AI must not invent precise probabilities or submit reports automatically.

## Official Data Sources

Initial NYC Open Data targets:

- Pedestrian Ramp Locations;
- Street Construction Permits;
- 311 Service Requests (filtered to relevant pedestrian/accessibility complaint families).

Raw provider schemas must be normalized behind adapters before reaching UI logic.

## Community Reporting

Report lifecycle:

- `pending_confirmation` (client/local state only);
- `active`;
- `community_confirmed`;
- `resolved`;
- `expired`;
- `rejected`/`hidden` if moderation is later required.

Temporary reports should support an expiry time.

Map legend must visibly differentiate:

- official NYC data;
- community reports;
- AI-assisted observations (before confirmation).

## Information Architecture

### `/`

Marketing/storytelling landing page with one lightweight Spline scene, product proposition, short demo explanation, key evidence sources, and strong CTA.

### `/navigate`

Primary map application. Desktop uses an information rail plus large map. Mobile uses a full-screen map with accessible bottom sheets.

### `/report`

Barrier reporting workflow with camera/file upload, location selection, AI-assisted analysis, confirmation, and success state.

### `/about`

Mission, product limitations, methodology summary, data provenance, AI role, and hackathon context.

### `/methodology`

Detailed scoring method, data sources, limitations, freshness policy, and versioning.

### `/privacy`

Clear privacy statement, especially for uploaded images and anonymous session data.

## Homepage Narrative

Recommended hero copy direction:

**Eyebrow:** Accessibility-aware navigation for NYC

**Headline:**
`The shortest route isn't always the route you can use.`

**Supporting copy:**
`Barrierless compares walking routes using mobility needs, NYC accessibility data, community reports, and AI-assisted evidence.`

Primary CTA: `Find an accessible route`

Secondary CTA: `Report a barrier`

Do not overuse the word “AI” in headline-level marketing. The problem and outcome are more important than the technology.

## Non-Goals for MVP

- turn-by-turn live GPS navigation;
- emergency response;
- accessibility certification;
- comprehensive ADA compliance assessment;
- social network/community feed;
- user reputation system;
- full city-agency workflow integration;
- payment/subscription system;
- real-time citywide sensor network;
- native iOS/Android app.

## Success Criteria

A first-time judge should be able to understand within ~30 seconds:

1. what mobility problem Barrierless solves;
2. why fastest-route navigation is insufficient;
3. what data is used;
4. why the recommended route differs;
5. where AI adds value without replacing evidence.

A complete demo should be possible without creating an account.