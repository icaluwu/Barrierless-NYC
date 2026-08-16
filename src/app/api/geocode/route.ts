import { NextRequest, NextResponse } from 'next/server';
import { GeocodeRequestSchema } from '@/lib/security/schemas';
import { checkRateLimit } from '@/lib/security/rate-limit';

const PRESET_NYC_LOCATIONS = [
  { label: 'Times Square (7th Ave & 42nd St)', coordinates: [-73.9855, 40.7580] as [number, number] },
  { label: 'Penn Station (8th Ave & 31st St)', coordinates: [-73.9935, 40.7505] as [number, number] },
  { label: 'Grand Central Terminal (42nd St & Park Ave)', coordinates: [-73.9772, 40.7527] as [number, number] },
  { label: 'Bryant Park (6th Ave & 42nd St)', coordinates: [-73.9832, 40.7536] as [number, number] },
  { label: 'Washington Square Park', coordinates: [-73.9973, 40.7308] as [number, number] },
  { label: 'Columbus Circle (59th St & Broadway)', coordinates: [-73.9819, 40.7681] as [number, number] },
];

export async function POST(req: NextRequest) {
  // 1. Rate limiting check
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = checkRateLimit(`geocode-${ip}`, 40, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many geocoding requests. Please wait a moment.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = GeocodeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid search query' }, { status: 400 });
    }

    const query = parsed.data.query.trim();
    if (!query) {
      return NextResponse.json({ results: PRESET_NYC_LOCATIONS });
    }

    const queryLower = query.toLowerCase();

    // Check presets first
    const presetMatches = PRESET_NYC_LOCATIONS.filter((loc) =>
      loc.label.toLowerCase().includes(queryLower)
    );

    // 2. Try OpenRouteService Geocoding if API key present
    const orsApiKey = process.env.OPENROUTESERVICE_API_KEY;
    if (orsApiKey) {
      try {
        const orsUrl = new URL('https://api.openrouteservice.org/geocode/search');
        orsUrl.searchParams.append('api_key', orsApiKey);
        orsUrl.searchParams.append('text', query.includes('NYC') || query.includes('New York') ? query : `${query}, New York, NY`);
        orsUrl.searchParams.append('boundary.rect.min_lon', '-74.26');
        orsUrl.searchParams.append('boundary.rect.min_lat', '40.49');
        orsUrl.searchParams.append('boundary.rect.max_lon', '-73.70');
        orsUrl.searchParams.append('boundary.rect.max_lat', '40.92');
        orsUrl.searchParams.append('size', '5');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(orsUrl.toString(), { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const orsResults = data.features.map((f: any) => ({
              label: f.properties.label || f.properties.name,
              coordinates: f.geometry.coordinates as [number, number],
            }));
            const combined = [...presetMatches, ...orsResults];
            const unique = Array.from(new Map(combined.map((item) => [item.label, item])).values());
            return NextResponse.json({ results: unique.slice(0, 6) });
          }
        }
      } catch (e) {
        // Fallthrough to Nominatim
      }
    }

    // 3. Try Nominatim (OpenStreetMap) free geocoder as fallback
    try {
      const nomUrl = new URL('https://nominatim.openstreetmap.org/search');
      nomUrl.searchParams.append('format', 'json');
      nomUrl.searchParams.append('countrycodes', 'us');
      nomUrl.searchParams.append('viewbox', '-74.26,40.92,-73.70,40.49');
      nomUrl.searchParams.append('bounded', '1');
      nomUrl.searchParams.append('limit', '5');
      nomUrl.searchParams.append('q', query.includes('NYC') || query.includes('New York') ? query : `${query}, New York, NY`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(nomUrl.toString(), {
        headers: { 'User-Agent': 'BarrierlessNYC-Hackathon/1.0' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const nomResults = data.map((item: any) => ({
            label: item.display_name.split(',').slice(0, 3).join(','),
            coordinates: [parseFloat(item.lon), parseFloat(item.lat)] as [number, number],
          }));
          const combined = [...presetMatches, ...nomResults];
          const unique = Array.from(new Map(combined.map((item) => [item.label, item])).values());
          return NextResponse.json({ results: unique.slice(0, 6) });
        }
      }
    } catch (e) {
      // Fallthrough to presets
    }

    // Default return presets if external geocoding yields no results
    return NextResponse.json({ results: presetMatches.length > 0 ? presetMatches : PRESET_NYC_LOCATIONS });
  } catch (error) {
    return NextResponse.json({ error: 'Geocoding request failed' }, { status: 500 });
  }
}
