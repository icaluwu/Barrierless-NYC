import { AccessibilityEvidence, Coordinates } from '@/types';

const MOCK_311_COMPLAINTS: AccessibilityEvidence[] = [
  { id: '311-1', source: 'nyc_311', coordinate: [-73.9852, 40.7582], severity: 'high', category: 'Sidewalk Condition', description: 'Broken curb ramp & uneven concrete causing wheelchair obstruction' },
  { id: '311-2', source: 'nyc_311', coordinate: [-73.9865, 40.7565], severity: 'moderate', category: 'Street Light Outage', description: 'Dark crosswalk signal at 8th Ave & 41st St' }
];

export async function fetchNyc311Complaints(bounds?: [Coordinates, Coordinates]): Promise<AccessibilityEvidence[]> {
  try {
    const appToken = process.env.NYC_OPEN_DATA_APP_TOKEN;
    if (!appToken) {
      return MOCK_311_COMPLAINTS;
    }
    const endpoint = `https://data.cityofnewyork.us/resource/erm2-nwe9.json?complaint_type=Sidewalk Condition&$limit=30`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(endpoint, {
      headers: { 'X-App-Token': appToken },
      signal: controller.signal,
      next: { revalidate: 1800 }
    });
    clearTimeout(timeout);

    if (!response.ok) return MOCK_311_COMPLAINTS;
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return MOCK_311_COMPLAINTS;

    return data.map((item: any, idx: number) => ({
      id: item.unique_key || `311-${idx}`,
      source: 'nyc_311',
      coordinate: [parseFloat(item.longitude || '-73.9852'), parseFloat(item.latitude || '40.7582')],
      severity: 'moderate',
      category: item.complaint_type || '311 Sidewalk Signal',
      description: item.descriptor || '311 Sidewalk Condition Complaint'
    }));
  } catch (error) {
    return MOCK_311_COMPLAINTS;
  }
}
