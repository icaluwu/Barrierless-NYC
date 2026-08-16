import { describe, it, expect } from 'vitest';
import { calculateBarrierlessScore } from './score-route';
import { getEvidenceNearRoute } from '../../lib/geospatial/route-evidence';
import { AccessibilityEvidence, RouteCandidate } from '../../types';

describe('calculateBarrierlessScore (BAIE Scoring Engine)', () => {
  it('returns a high score when route has abundant ramp evidence and no obstacles', () => {
    const evidence: AccessibilityEvidence[] = [
      { id: '1', source: 'nyc_ramp', coordinate: [-73.985, 40.758], severity: 'low', category: 'Pedestrian Ramp', description: 'ADA Ramp' },
      { id: '2', source: 'nyc_ramp', coordinate: [-73.986, 40.759], severity: 'low', category: 'Pedestrian Ramp', description: 'ADA Ramp' },
      { id: '3', source: 'nyc_ramp', coordinate: [-73.987, 40.760], severity: 'low', category: 'Pedestrian Ramp', description: 'ADA Ramp' },
    ];

    const result = calculateBarrierlessScore(500, 'wheelchair', evidence);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.breakdown.constructionPenalty).toBe(0);
    expect(result.breakdown.communityReportPenalty).toBe(0);
  });

  it('penalizes severe active construction and community barriers', () => {
    const evidence: AccessibilityEvidence[] = [
      { id: 'c1', source: 'nyc_construction', coordinate: [-73.985, 40.758], severity: 'high', category: 'Street Permit', description: 'Major Excavation' },
      { id: 'b1', source: 'community', coordinate: [-73.986, 40.759], severity: 'high', category: 'Blocked Ramp', description: 'Debris on Ramp' },
    ];

    const result = calculateBarrierlessScore(500, 'wheelchair', evidence);
    expect(result.score).toBeLessThan(70);
    expect(result.breakdown.constructionPenalty).toBeGreaterThan(0);
    expect(result.breakdown.communityReportPenalty).toBeGreaterThan(0);
  });

  it('clamps total score between 10 and 100', () => {
    const resultClean = calculateBarrierlessScore(100, 'wheelchair', []);
    expect(resultClean.score).toBeGreaterThanOrEqual(10);
    expect(resultClean.score).toBeLessThanOrEqual(100);
  });

  it('calculates Turf.js spatial corridor matching within 30 meters', () => {
    const routeGeometry: RouteCandidate['geometry'] = {
      type: 'LineString',
      coordinates: [
        [-73.9855, 40.7580],
        [-73.9855, 40.7600]
      ]
    };

    const evidenceList: AccessibilityEvidence[] = [
      // 10 meters away from route line
      { id: 'near-1', source: 'nyc_ramp', coordinate: [-73.9854, 40.7590], severity: 'low', category: 'Ramp', description: 'Near Ramp' },
      // 500 meters away from route line
      { id: 'far-1', source: 'nyc_ramp', coordinate: [-73.9700, 40.7590], severity: 'low', category: 'Ramp', description: 'Far Ramp' },
    ];

    const matched = getEvidenceNearRoute(routeGeometry, evidenceList, 30);
    expect(matched.length).toBe(1);
    expect(matched[0].id).toBe('near-1');
    expect(matched[0].distanceFromRouteMeters).toBeDefined();
    expect(matched[0].distanceFromRouteMeters).toBeLessThan(30);
  });

  it('ranks candidate routes dynamically without hardcoded winners', () => {
    const routeA: RouteCandidate = {
      id: 'route-a',
      name: 'Route A',
      distanceMeters: 500,
      durationMinutes: 7,
      geometry: { type: 'LineString', coordinates: [[-73.9855, 40.7580], [-73.9855, 40.7600]] }
    };
    const routeB: RouteCandidate = {
      id: 'route-b',
      name: 'Route B',
      distanceMeters: 500,
      durationMinutes: 7,
      geometry: { type: 'LineString', coordinates: [[-73.9800, 40.7580], [-73.9800, 40.7600]] }
    };

    // Give routeA a severe obstacle
    const evidenceA: AccessibilityEvidence[] = [
      { id: 'e1', source: 'nyc_construction', coordinate: [-73.9855, 40.7590], severity: 'high', category: 'Construction', description: 'Blocked' }
    ];
    // Give routeB a clean ramp
    const evidenceB: AccessibilityEvidence[] = [
      { id: 'e2', source: 'nyc_ramp', coordinate: [-73.9800, 40.7590], severity: 'low', category: 'Ramp', description: 'Clean Ramp' }
    ];

    const scoreA = calculateBarrierlessScore(routeA.distanceMeters, 'wheelchair', evidenceA).score;
    const scoreB = calculateBarrierlessScore(routeB.distanceMeters, 'wheelchair', evidenceB).score;

    expect(scoreB).toBeGreaterThan(scoreA);
  });
});
