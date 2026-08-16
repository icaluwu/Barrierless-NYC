import { AccessibilityEvidence, Coordinates } from '@/types';

// Mock NYC Open Data Pedestrian Ramp points around central NYC corridors
const MOCK_NYC_RAMPS: AccessibilityEvidence[] = [
  { id: 'ramp-1', source: 'nyc_ramp', coordinate: [-73.9855, 40.7580], severity: 'low', category: 'Curb Ramp', description: 'Standard compliant curb ramp at 7th Ave & 42nd St' },
  { id: 'ramp-2', source: 'nyc_ramp', coordinate: [-73.9850, 40.7590], severity: 'low', category: 'Curb Ramp', description: 'Dual direction ADA ramp at Broadway & 43rd St' },
  { id: 'ramp-3', source: 'nyc_ramp', coordinate: [-73.9840, 40.7600], severity: 'low', category: 'Curb Ramp', description: 'Tactile paving ramp at 7th Ave & 44th St' },
  { id: 'ramp-4', source: 'nyc_ramp', coordinate: [-73.9860, 40.7570], severity: 'low', category: 'Curb Ramp', description: 'Corner ramp at 8th Ave & 42nd St' },
  { id: 'ramp-5', source: 'nyc_ramp', coordinate: [-73.9870, 40.7550], severity: 'low', category: 'Curb Ramp', description: 'Refuge island ramp at 8th Ave & 40th St' },
  { id: 'ramp-6', source: 'nyc_ramp', coordinate: [-73.9810, 40.7520], severity: 'low', category: 'Curb Ramp', description: 'Accessible curb ramp at 5th Ave & 40th St' },
  { id: 'ramp-7', source: 'nyc_ramp', coordinate: [-73.9800, 40.7530], severity: 'low', category: 'Curb Ramp', description: 'Accessible ramp at Madison Ave & 41st St' }
];

export async function fetchNycPedestrianRamps(bounds?: [Coordinates, Coordinates]): Promise<AccessibilityEvidence[]> {
  try {
    const appToken = process.env.NYC_OPEN_DATA_APP_TOKEN;
    if (!appToken) {
      return MOCK_NYC_RAMPS;
    }
    // Socrata API query for NYC Pedestrian Ramps
    const endpoint = `https://data.cityofnewyork.us/resource/977d-x2m4.json?$limit=50`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(endpoint, {
      headers: { 'X-App-Token': appToken },
      signal: controller.signal,
      next: { revalidate: 3600 }
    });
    clearTimeout(timeout);

    if (!response.ok) return MOCK_NYC_RAMPS;
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return MOCK_NYC_RAMPS;

    return data.map((item: any, idx: number) => ({
      id: item.ramp_id || `ramp-${idx}`,
      source: 'nyc_ramp',
      coordinate: [parseFloat(item.long || '-73.985'), parseFloat(item.lat || '40.758')],
      severity: 'low',
      category: 'Curb Ramp',
      description: item.ramp_type || 'NYC Pedestrian Ramp'
    }));
  } catch (error) {
    return MOCK_NYC_RAMPS;
  }
}
