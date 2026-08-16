# Barrierless NYC — Security Requirements

## Security Objective

Ship a hackathon MVP with a small, reviewable attack surface and no knowingly exposed critical secrets or privileged write paths.

## Trust Boundaries

Treat all of the following as untrusted:

- browser input;
- coordinates supplied by clients;
- uploaded files;
- community report text;
- AI model output;
- third-party API responses;
- URL/search parameters;
- headers and cookies;
- anonymous session identifiers.

Validate at every server boundary.

## Secrets

Never expose these to the client:

- `GEMINI_API_KEY`
- `OPENROUTESERVICE_API_KEY`
- `NYC_OPEN_DATA_APP_TOKEN` if configured as private
- `SUPABASE_SERVICE_ROLE_KEY`

Only variables explicitly intended for the browser may use `NEXT_PUBLIC_`.

Do not commit `.env`, `.env.local`, production credentials, tokens, private URLs, or service-account material.

## Input Validation

Use Zod schemas for every route-handler input and AI output.

Validate:

- coordinate ranges;
- enum values;
- string lengths;
- pagination limits;
- route request bounds;
- date windows;
- report status values;
- image metadata;
- JSON shape returned by AI.

Reject unknown/unexpected values where practical.

## Upload Security

Barrier photos are a high-risk input surface.

Requirements:

- accept only a minimal allow-list of image MIME types (e.g. JPEG/PNG/WebP if supported);
- enforce a conservative maximum file size;
- verify server-observed content type where feasible;
- generate storage paths server-side;
- do not trust original filenames;
- do not execute or render uploaded content as HTML/SVG;
- do not expose storage write credentials to the browser beyond narrowly scoped platform mechanisms;
- only persist the image after the user confirms the report;
- strip or avoid using unnecessary metadata where feasible;
- document retention/expiry behavior in privacy policy.

## Community Content

- render report descriptions as plain text;
- never use `dangerouslySetInnerHTML` for community or AI content;
- bound text length;
- reject obvious malformed payloads;
- provide a moderation/hide capability at repository/service level even if no full admin UI exists;
- rate-limit report creation and confirmation.

## AI Safety Boundary

AI output is data, not authority.

- validate all structured output;
- never permit AI to choose database authorization state;
- never permit AI to submit a report without explicit user confirmation;
- never let AI generate SQL or execute arbitrary tools from user text;
- do not interpolate raw AI content into HTML;
- do not treat AI certainty as measured probability;
- route explanation prompts must contain only evidence required for explanation.

Prompt injection embedded in an uploaded image or report text must not be interpreted as application instructions.

## Authorization

MVP should avoid authentication unless essential.

For Supabase:

- enable RLS on exposed tables;
- use narrowly scoped policies;
- keep privileged mutations behind server code;
- service-role key is server-only;
- anonymous public access should not allow arbitrary update/delete of other users' reports.

## Anonymous Confirmation

If anonymous confirmation is implemented:

- issue a random session identifier;
- hash it before storing where feasible;
- use a uniqueness constraint or equivalent to reduce duplicate confirmation abuse;
- do not fingerprint users beyond what the feature requires.

## Rate Limiting

Apply practical rate limits to:

- geocoding;
- route generation;
- AI barrier analysis;
- AI route explanation;
- report creation;
- report confirmation.

Return `429` with useful retry messaging. Do not rely solely on client throttling.

## SSRF / Outbound Requests

Do not build endpoints that accept arbitrary upstream URLs.

Third-party calls must target hard-coded/allow-listed provider origins. Never fetch a user-provided URL from the server for image analysis; upload bytes through the controlled upload workflow instead.

## Error Handling

- do not return stack traces in production;
- do not expose upstream authorization headers, request IDs containing sensitive data, or raw secret-bearing provider messages;
- map third-party failures to bounded internal error types;
- log enough for debugging without logging credentials or full user uploads.

## Security Headers

Configure an appropriate production policy including:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- frame embedding restrictions where compatible with Spline/application needs

CSP must explicitly account for MapLibre workers/assets, map tiles, Spline resources, Supabase assets, and required API connections. Keep origins minimal.

## Browser Permissions

Request geolocation only when the user explicitly invokes current-location functionality.

Camera/file input must be user initiated.

Do not request microphone, contacts, notifications, or other unrelated permissions.

## Dependency Security

- prefer maintained packages;
- minimize dependency count;
- do not add two libraries for the same job;
- inspect packages before adopting niche dependencies;
- keep lockfile committed;
- address known critical/high vulnerabilities where practical before release.

## Data Privacy

MVP should collect the minimum amount of data necessary.

Avoid requiring:

- real name;
- email;
- phone number;
- precise continuous location history.

A community report should contain only information needed to understand the barrier and its approximate location.

## Production Checklist

Before final deployment:

- [ ] no secrets in git history introduced by this project work
- [ ] `.env*` ignored except `.env.example`
- [ ] RLS enabled and tested
- [ ] upload MIME/size validation tested
- [ ] API request schemas enforced
- [ ] AI output schemas enforced
- [ ] rate limiting active on expensive/write endpoints
- [ ] production security headers present
- [ ] no unexpected `dangerouslySetInnerHTML`
- [ ] no arbitrary server-side URL fetch endpoint
- [ ] service-role key absent from client bundles
- [ ] error responses do not leak stack traces/secrets
- [ ] build/lint/typecheck/tests pass
- [ ] dependency audit reviewed for critical/high findings
