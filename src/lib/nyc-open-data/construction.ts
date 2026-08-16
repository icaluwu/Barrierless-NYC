import { AccessibilityEvidence, Coordinates, DataMode } from '@/types';

export interface NycConstructionResponse {
  evidence: AccessibilityEvidence[];
  dataMode: DataMode;
}

const DEMO_CONSTRUCTION: AccessibilityEvidence[] = [
  { id: 'const-1', source: 'nyc_construction', sourceType: 'official', sourceName: 'NYC DOT Street Construction Permits', dataMode: 'demo', coordinate: [-73.9848, 40.7585], severity: 'high', category: 'Street Permit Excavation', description: 'DOT Utility Trenching on 7th Ave between 42nd and 43rd St. Sidewalk width restricted.' },
  { id: 'const-2', source: 'nyc_construction', sourceType: 'official', sourceName: 'NYC DOT Street Construction Permits', dataMode: 'demo', coordinate: [-73.9820, 40.7540], severity: 'moderate', category: 'Scaffolding / Sidewalk Shed', description: 'Building facade maintenance shed on 5th Ave.' }
];

export async function fetchNycConstructionPermits(bounds?: [Coordinates, Coordinates]): Promise<NycConstructionResponse> {
  const isDemoEnabled = process.env.ENABLE_DEMO_DATA === 'true';

  try {
    const appToken = process.env.NYC_OPEN_DATA_APP_TOKEN;
    const datasetId = 'tqtj-sjs8'; // Official Street Construction Permits dataset

    let whereClause = '';
    if (bounds) {
      const [[west, south], [east, north]] = bounds;
      whereClause = `&$where=within_box(the_geom, ${north}, ${west}, ${south}, ${east})`;
    }

    const endpoint = `https://data.cityofnewyork.us/resource/${datasetId}.json?$limit=50${whereClause}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (appToken) headers['X-App-Token'] = appToken;

    const response = await fetch(endpoint, {
      headers,
      signal: controller.signal,
      next: { revalidate: 1800 }
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const evidence: AccessibilityEvidence[] = data.map((item: any, idx: number) => {
          const lat = parseFloat(item.latitude || (item.the_geom?.coordinates?.[1]) || '0');
          const lng = parseFloat(item.longitude || (item.the_geom?.coordinates?.[0]) || '0');
          const isExcavation = (item.work_option || item.purpose || '').toUpperCase().includes('EXCAVAT');

          return {
            id: item.permit_no || `const-${idx}`,
            source: 'nyc_construction' as const,
            sourceType: 'official' as const,
            sourceName: 'NYC DOT Street Construction Permits',
            dataMode: 'live' as const,
            coordinate: [lng, lat] as Coordinates,
            severity: isExcavation ? ('high' as const) : ('moderate' as const),
            category: 'Street Construction Permit',
            description: item.purpose || item.work_option || 'Active Street Construction Permit'
          };
        }).filter((e) => e.coordinate[0] !== 0 && e.coordinate[1] !== 0);

        if (evidence.length > 0) {
          return { evidence, dataMode: 'live' };
        }
      }
    }
  } catch (error) {
    console.warn('NYC Construction Permits API query failed or timed out.');
  }

  if (isDemoEnabled) {
    return { evidence: DEMO_CONSTRUCTION, dataMode: 'demo' };
  }

  return { evidence: [], dataMode: 'degraded' };
}
