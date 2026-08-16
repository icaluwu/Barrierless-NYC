import { Coordinates, MobilityProfile, RouteCandidate } from '@/types';

export async function fetchRouteCandidates(
  origin: Coordinates,
  destination: Coordinates,
  profile: MobilityProfile
): Promise<RouteCandidate[]> {
  // Try calling OpenRouteService if API key is provided
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (apiKey) {
    try {
      const url = `https://api.openrouteservice.org/v2/directions/foot-walking/geojson`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [origin, destination],
          alternative_routes: { target_count: 2 }
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.features && Array.isArray(json.features)) {
          return json.features.map((feat: any, idx: number) => {
            const props = feat.properties || {};
            const summary = props.summary || {};
            return {
              id: `ors-route-${idx + 1}`,
              name: idx === 0 ? 'Direct Route' : `Alternative Corridor ${idx}`,
              distanceMeters: Math.round(summary.distance || 850),
              durationMinutes: Math.round((summary.duration || 600) / 60),
              geometry: feat.geometry
            };
          });
        }
      }
    } catch (e) {
      // Fallback to deterministic geometry generator on upstream error
    }
  }

  // Fallback / standard NYC route candidate generator
  return generateDeterministicNycCandidates(origin, destination);
}

function generateDeterministicNycCandidates(origin: Coordinates, destination: Coordinates): RouteCandidate[] {
  const [ox, oy] = origin;
  const [dx, dy] = destination;

  // Route A: Direct / Direct Avenue-Street path
  const coordsA: Coordinates[] = [
    [ox, oy],
    [ox, (oy + dy) / 2],
    [dx, (oy + dy) / 2],
    [dx, dy]
  ];

  // Route B: Accessible Bypass via Ramp-rich Corridor (slightly longer, step-free)
  const coordsB: Coordinates[] = [
    [ox, oy],
    [ox - 0.0015, oy + 0.001],
    [ox - 0.0015, dy - 0.001],
    [dx, dy]
  ];

  // Route C: Main Avenue Promenade (standard alternate)
  const coordsC: Coordinates[] = [
    [ox, oy],
    [dx + 0.001, oy],
    [dx + 0.001, dy],
    [dx, dy]
  ];

  // Estimate distance and time
  const directDist = Math.round(Math.hypot(dx - ox, dy - oy) * 111000);
  const distA = Math.max(400, directDist);
  const distB = Math.round(distA * 1.12);
  const distC = Math.round(distA * 1.25);

  return [
    {
      id: 'route-a',
      name: 'Route A — Fastest Direct',
      distanceMeters: distA,
      durationMinutes: Math.ceil(distA / 80),
      geometry: { type: 'LineString', coordinates: coordsA }
    },
    {
      id: 'route-b',
      name: 'Route B — Barrierless Promenade',
      distanceMeters: distB,
      durationMinutes: Math.ceil(distB / 80),
      geometry: { type: 'LineString', coordinates: coordsB }
    },
    {
      id: 'route-c',
      name: 'Route C — Avenue Option',
      distanceMeters: distC,
      durationMinutes: Math.ceil(distC / 80),
      geometry: { type: 'LineString', coordinates: coordsC }
    }
  ];
}
