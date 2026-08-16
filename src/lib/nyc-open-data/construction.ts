import { AccessibilityEvidence, Coordinates } from '@/types';

const MOCK_CONSTRUCTION: AccessibilityEvidence[] = [
  { id: 'const-1', source: 'nyc_construction', coordinate: [-73.9848, 40.7585], severity: 'high', category: 'Street Permit Excavation', description: 'DOT Utility Trenching on 7th Ave between 42nd and 43rd St. Sidewalk width restricted.' },
  { id: 'const-2', source: 'nyc_construction', coordinate: [-73.9820, 40.7540], severity: 'moderate', category: 'Scaffolding / Sidewalk Shed', description: 'Building facade maintenance shed on 5th Ave.' }
];

export async function fetchNycConstructionPermits(bounds?: [Coordinates, Coordinates]): Promise<AccessibilityEvidence[]> {
  try {
    const appToken = process.env.NYC_OPEN_DATA_APP_TOKEN;
    if (!appToken) {
      return MOCK_CONSTRUCTION;
    }
    const endpoint = `https://data.cityofnewyork.us/resource/94g7-24tr.json?$limit=30`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(endpoint, {
      headers: { 'X-App-Token': appToken },
      signal: controller.signal,
      next: { revalidate: 1800 }
    });
    clearTimeout(timeout);

    if (!response.ok) return MOCK_CONSTRUCTION;
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return MOCK_CONSTRUCTION;

    return data.map((item: any, idx: number) => ({
      id: item.permit_no || `const-${idx}`,
      source: 'nyc_construction',
      coordinate: [parseFloat(item.longitude || '-73.9848'), parseFloat(item.latitude || '40.7585')],
      severity: item.work_option?.includes('EXCAVATE') ? 'high' : 'moderate',
      category: 'Street Construction Permit',
      description: item.purpose || 'Active Street Construction Permit'
    }));
  } catch (error) {
    return MOCK_CONSTRUCTION;
  }
}
