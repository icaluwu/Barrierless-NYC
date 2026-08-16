import { AccessibilityEvidence, Coordinates, DataMode } from '@/types';

export interface Nyc311Response {
  evidence: AccessibilityEvidence[];
  dataMode: DataMode;
}

const DEMO_311_COMPLAINTS: AccessibilityEvidence[] = [
  { id: '311-1', source: 'nyc_311', sourceType: 'official', sourceName: 'NYC 311 Service Requests', dataMode: 'demo', coordinate: [-73.9852, 40.7582], severity: 'high', category: 'Sidewalk Condition', description: 'Broken curb ramp & uneven concrete causing wheelchair obstruction' },
  { id: '311-2', source: 'nyc_311', sourceType: 'official', sourceName: 'NYC 311 Service Requests', dataMode: 'demo', coordinate: [-73.9865, 40.7565], severity: 'moderate', category: 'Pedestrian Ramp Obstruction', description: 'Dark crosswalk signal & damaged sidewalk radius at 8th Ave & 41st St' }
];

export async function fetchNyc311Complaints(bounds?: [Coordinates, Coordinates]): Promise<Nyc311Response> {
  const isDemoEnabled = process.env.ENABLE_DEMO_DATA === 'true';

  try {
    const appToken = process.env.NYC_OPEN_DATA_APP_TOKEN;
    const datasetId = 'erm2-nwe9'; // Official 311 Service Requests dataset

    // SoQL query for accessibility-relevant complaint types
    let whereClause = `$where=complaint_type in('Sidewalk Condition', 'Pedestrian Ramp', 'Curb Complaint', 'Street Condition')`;
    if (bounds) {
      const [[west, south], [east, north]] = bounds;
      whereClause += ` AND within_box(location_1, ${north}, ${west}, ${south}, ${east})`;
    }

    const endpoint = `https://data.cityofnewyork.us/resource/${datasetId}.json?${whereClause}&$limit=50&$order=created_date DESC`;
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
          const lat = parseFloat(item.latitude || item.location_1?.latitude || '0');
          const lng = parseFloat(item.longitude || item.location_1?.longitude || '0');
          const descriptor = (item.descriptor || item.complaint_type || '').toLowerCase();
          const isHighSeverity = descriptor.includes('ramp') || descriptor.includes('hazard') || descriptor.includes('collapsed');

          return {
            id: item.unique_key || `311-${idx}`,
            source: 'nyc_311' as const,
            sourceType: 'official' as const,
            sourceName: 'NYC 311 Service Requests',
            dataMode: 'live' as const,
            coordinate: [lng, lat] as Coordinates,
            severity: isHighSeverity ? ('high' as const) : ('moderate' as const),
            category: item.complaint_type || '311 Sidewalk Complaint',
            description: item.descriptor ? `311: ${item.descriptor}` : '311 Sidewalk Condition Complaint'
          };
        }).filter((e) => e.coordinate[0] !== 0 && e.coordinate[1] !== 0);

        if (evidence.length > 0) {
          return { evidence, dataMode: 'live' };
        }
      }
    }
  } catch (error) {
    console.warn('NYC 311 Service Requests API query failed or timed out.');
  }

  if (isDemoEnabled) {
    return { evidence: DEMO_311_COMPLAINTS, dataMode: 'demo' };
  }

  return { evidence: [], dataMode: 'degraded' };
}
