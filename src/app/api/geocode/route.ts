import { NextRequest, NextResponse } from 'next/server';
import { GeocodeRequestSchema } from '@/lib/security/schemas';

const PRESET_NYC_LOCATIONS = [
  { name: 'Times Square (7th Ave & 42nd St)', coordinates: [-73.9855, 40.7580] as [number, number] },
  { name: 'Penn Station (8th Ave & 31st St)', coordinates: [-73.9935, 40.7505] as [number, number] },
  { name: 'Grand Central Terminal (42nd St & Park Ave)', coordinates: [-73.9772, 40.7527] as [number, number] },
  { name: 'Washington Square Park', coordinates: [-73.9973, 40.7308] as [number, number] },
  { name: 'Brooklyn Bridge Plaza', coordinates: [-73.9969, 40.7061] as [number, number] },
  { name: 'Bryant Park (6th Ave & 42nd St)', coordinates: [-73.9832, 40.7536] as [number, number] },
  { name: 'Columbus Circle (59th St & Broadway)', coordinates: [-73.9819, 40.7681] as [number, number] }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GeocodeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid search query' }, { status: 400 });
    }

    const queryLower = parsed.data.query.toLowerCase();
    const matches = PRESET_NYC_LOCATIONS.filter((loc) =>
      loc.name.toLowerCase().includes(queryLower)
    );

    if (matches.length > 0) {
      return NextResponse.json({ results: matches });
    }

    return NextResponse.json({ results: PRESET_NYC_LOCATIONS.slice(0, 4) });
  } catch (error) {
    return NextResponse.json({ error: 'Geocoding request failed' }, { status: 500 });
  }
}
