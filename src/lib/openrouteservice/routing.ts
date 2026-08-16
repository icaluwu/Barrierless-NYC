import { Coordinates, DataMode, MobilityProfile, RouteCandidate } from '@/types';

export interface RouteCandidatesResponse {
  routes: RouteCandidate[];
  dataMode: DataMode;
}

export async function fetchRouteCandidates(
  origin: Coordinates,
  destination: Coordinates,
  profile: MobilityProfile
): Promise<RouteCandidatesResponse> {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;

  // Select ORS profile based on mobility requirements
  const orsProfile = profile === 'wheelchair' ? 'wheelchair' : 'foot-walking';

  if (apiKey) {
    try {
      const url = `https://api.openrouteservice.org/v2/directions/${orsProfile}/geojson`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [origin, destination],
          alternative_routes: { target_count: 2 }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json.features && Array.isArray(json.features) && json.features.length > 0) {
          const routes = json.features.map((feat: any, idx: number) => {
            const props = feat.properties || {};
            const summary = props.summary || {};
            return {
              id: `ors-route-${idx + 1}`,
              name: idx === 0 ? 'Primary Accessible Route' : `Alternative Pedestrian Corridor ${idx}`,
              distanceMeters: Math.round(summary.distance || 850),
              durationMinutes: Math.round((summary.duration || 600) / 60),
              geometry: feat.geometry
            };
          });
          return { routes, dataMode: 'live' };
        }
      }
    } catch (e) {
      console.warn('OpenRouteService request failed, defaulting to system fallback routes.');
    }
  }

  // Fallback NYC route candidate generator
  const routes = generateDeterministicNycCandidates(origin, destination);
  return {
    routes,
    dataMode: process.env.ENABLE_DEMO_DATA === 'true' ? 'demo' : 'degraded'
  };
}

function generateDeterministicNycCandidates(origin: Coordinates, destination: Coordinates): RouteCandidate[] {
  const [ox, oy] = origin;
  const [dx, dy] = destination;

  // Interpolate intermediate waypoints for smooth LineString routes
  const coordsA: Coordinates[] = [
    [ox, oy],
    [ox, oy + (dy - oy) * 0.4],
    [ox + (dx - ox) * 0.6, oy + (dy - oy) * 0.4],
    [dx, dy]
  ];

  const coordsB: Coordinates[] = [
    [ox, oy],
    [ox + (dx - ox) * 0.3, oy],
    [ox + (dx - ox) * 0.3, dy],
    [dx, dy]
  ];

  const coordsC: Coordinates[] = [
    [ox, oy],
    [ox - 0.002, oy + (dy - oy) * 0.5],
    [dx - 0.001, dy],
    [dx, dy]
  ];

  const directDist = Math.round(Math.hypot(dx - ox, dy - oy) * 111000);
  const distA = Math.max(350, directDist);
  const distB = Math.round(distA * 1.15);
  const distC = Math.round(distA * 1.28);

  return [
    {
      id: 'route-a',
      name: 'Route A — Direct Pedestrian Corridor',
      distanceMeters: distA,
      durationMinutes: Math.ceil(distA / 75),
      geometry: { type: 'LineString', coordinates: coordsA }
    },
    {
      id: 'route-b',
      name: 'Route B — Avenue Promenade Bypass',
      distanceMeters: distB,
      durationMinutes: Math.ceil(distB / 75),
      geometry: { type: 'LineString', coordinates: coordsB }
    },
    {
      id: 'route-c',
      name: 'Route C — Secondary Street Option',
      distanceMeters: distC,
      durationMinutes: Math.ceil(distC / 75),
      geometry: { type: 'LineString', coordinates: coordsC }
    }
  ];
}
