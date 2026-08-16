import { describe, it, expect } from 'vitest';
import { calculateBarrierlessScore } from './score-route';
import { AccessibilityEvidence } from '@/types';

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
});
