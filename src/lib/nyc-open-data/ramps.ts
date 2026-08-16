import { AccessibilityEvidence, Coordinates, DataMode } from '@/types';

export interface NycRampsResponse {
  evidence: AccessibilityEvidence[];
  dataMode: DataMode;
}

const DEMO_NYC_RAMPS: AccessibilityEvidence[] = [
  { id: 'ramp-1', source: 'nyc_ramp', sourceType: 'official', sourceName: 'NYC DOT Pedestrian Ramp Locations', dataMode: 'demo', coordinate: [-73.9855, 40.7580], severity: 'low', category: 'Curb Ramp', description: 'Standard compliant curb ramp at 7th Ave & 42nd St' },
  { id: 'ramp-2', source: 'nyc_ramp', sourceType: 'official', sourceName: 'NYC DOT Pedestrian Ramp Locations', dataMode: 'demo', coordinate: [-73.9850, 40.7590], severity: 'low', category: 'Curb Ramp', description: 'Dual direction ADA ramp at Broadway & 43rd St' },
  { id: 'ramp-3', source: 'nyc_ramp', sourceType: 'official', sourceName: 'NYC DOT Pedestrian Ramp Locations', dataMode: 'demo', coordinate: [-73.9840, 40.7600], severity: 'low', category: 'Curb Ramp', description: 'Tactile paving ramp at 7th Ave & 44th St' },
  { id: 'ramp-4', source: 'nyc_ramp', sourceType: 'official', sourceName: 'NYC DOT Pedestrian Ramp Locations', dataMode: 'demo', coordinate: [-73.9860, 40.7570], severity: 'low', category: 'Curb Ramp', description: 'Corner ramp at 8th Ave & 42nd St' },
  { id: 'ramp-5', source: 'nyc_ramp', sourceType: 'official', sourceName: 'NYC DOT Pedestrian Ramp Locations', dataMode: 'demo', coordinate: [-73.9870, 40.7550], severity: 'low', category: 'Curb Ramp', description: 'Refuge island ramp at 8th Ave & 40th St' },
  { id: 'ramp-6', source: 'nyc_ramp', sourceType: 'official', sourceName: 'NYC DOT Pedestrian Ramp Locations', dataMode: 'demo', coordinate: [-73.9810, 40.7520], severity: 'low', category: 'Curb Ramp', description: 'Accessible curb ramp at 5th Ave & 40th St' },
  { id: 'ramp-7', source: 'nyc_ramp', sourceType: 'official', sourceName: 'NYC DOT Pedestrian Ramp Locations', dataMode: 'demo', coordinate: [-73.9800, 40.7530], severity: 'low', category: 'Curb Ramp', description: 'Accessible ramp at Madison Ave & 41st St' }
];

export async function fetchNycPedestrianRamps(bounds?: [Coordinates, Coordinates]): Promise<NycRampsResponse> {
  const isDemoEnabled = process.env.ENABLE_DEMO_DATA === 'true';

  try {
    const appToken = process.env.NYC_OPEN_DATA_APP_TOKEN;
    const datasetId = 'ufzp-rrqu'; // Official NYC Pedestrian Ramp Locations dataset

    let whereClause = '';
    if (bounds) {
      const [[west, south], [east, north]] = bounds;
      whereClause = `&$where=within_box(the_geom, ${north}, ${west}, ${south}, ${east})`;
    }

    const endpoint = `https://data.cityofnewyork.us/resource/${datasetId}.json?$limit=100${whereClause}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (appToken) headers['X-App-Token'] = appToken;

    const response = await fetch(endpoint, {
      headers,
      signal: controller.signal,
      next: { revalidate: 3600 }
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const evidence: AccessibilityEvidence[] = data.map((item: any, idx: number) => {
          const lat = parseFloat(item.lat || item.latitude || (item.the_geom?.coordinates?.[1]) || '0');
          const lng = parseFloat(item.long || item.longitude || (item.the_geom?.coordinates?.[0]) || '0');
          return {
            id: item.ramp_id || `ramp-${idx}`,
            source: 'nyc_ramp' as const,
            sourceType: 'official' as const,
            sourceName: 'NYC DOT Pedestrian Ramp Locations',
            dataMode: 'live' as const,
            coordinate: [lng, lat] as Coordinates,
            severity: 'low' as const,
            category: 'Curb Ramp',
            description: item.ramp_type ? `Pedestrian Ramp (${item.ramp_type})` : 'NYC Pedestrian Ramp'
          };
        }).filter((e) => e.coordinate[0] !== 0 && e.coordinate[1] !== 0);

        if (evidence.length > 0) {
          return { evidence, dataMode: 'live' };
        }
      }
    }
  } catch (error) {
    console.warn('NYC Pedestrian Ramps API query failed or timed out.');
  }

  // If live data unavailable, return demo fixtures ONLY if explicitly enabled
  if (isDemoEnabled) {
    return { evidence: DEMO_NYC_RAMPS, dataMode: 'demo' };
  }

  return { evidence: [], dataMode: 'degraded' };
}
