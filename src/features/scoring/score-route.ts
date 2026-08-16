import { AccessibilityEvidence, MobilityProfile, ScoreBreakdown } from '@/types';
import { BAIE_WEIGHTS, getScoreLabel } from './weights';

export function calculateBarrierlessScore(
  distanceMeters: number,
  profile: MobilityProfile,
  evidenceList: AccessibilityEvidence[]
): { score: number; scoreLabel: string; breakdown: ScoreBreakdown } {
  // Count evidence items by type
  const ramps = evidenceList.filter((e) => e.source === 'nyc_ramp');
  const construction = evidenceList.filter((e) => e.source === 'nyc_construction');
  const complaints = evidenceList.filter((e) => e.source === 'nyc_311');
  const communityBarriers = evidenceList.filter((e) => e.source === 'community');

  // 1. Ramp coverage score (30 pts max)
  // Higher density of verified curb ramps per 500m gives higher score
  const distanceKm = Math.max(distanceMeters / 1000, 0.1);
  const rampDensity = ramps.length / distanceKm;
  const rampCoverageScore = Math.min(Math.round((rampDensity / 6) * BAIE_WEIGHTS.RAMP_COVERAGE), BAIE_WEIGHTS.RAMP_COVERAGE);

  // 2. Construction penalty (25 pts max penalty)
  const highSevConstruction = construction.filter((c) => c.severity === 'high').length;
  const modSevConstruction = construction.filter((c) => c.severity === 'moderate').length;
  const constructionPenalty = Math.min(
    highSevConstruction * 12 + modSevConstruction * 6,
    BAIE_WEIGHTS.CONSTRUCTION_PENALTY
  );

  // 3. 311 complaint penalty (20 pts max penalty)
  const highSevComplaints = complaints.filter((c) => c.severity === 'high').length;
  const complaintPenalty = Math.min(
    highSevComplaints * 8 + (complaints.length - highSevComplaints) * 4,
    BAIE_WEIGHTS.COMPLAINT_PENALTY
  );

  // 4. Community report penalty (15 pts max penalty)
  const highSevBarriers = communityBarriers.filter((b) => b.severity === 'high').length;
  const communityReportPenalty = Math.min(
    highSevBarriers * 10 + (communityBarriers.length - highSevBarriers) * 5,
    BAIE_WEIGHTS.COMMUNITY_BARRIER_PENALTY
  );

  // 5. Profile suitability bonus (10 pts max)
  // Wheelchair profile requires step-free / ramp evidence most strictly
  let profileBonus = 10;
  if (profile === 'wheelchair' && ramps.length === 0) {
    profileBonus = 2;
  } else if (profile === 'stroller' && construction.length > 2) {
    profileBonus = 4;
  }

  // Calculate total 0-100 score
  const rawScore = 50 + rampCoverageScore + profileBonus - constructionPenalty - complaintPenalty - communityReportPenalty;
  const totalScore = Math.max(10, Math.min(100, rawScore));
  const scoreLabel = getScoreLabel(totalScore);

  const breakdown: ScoreBreakdown = {
    rampCoverageScore,
    constructionPenalty,
    complaintPenalty,
    communityReportPenalty,
    profileSuitabilityBonus: profileBonus,
    totalScore,
    evidenceCounts: {
      ramps: ramps.length,
      construction: construction.length,
      complaints: complaints.length,
      communityBarriers: communityBarriers.length,
    },
  };

  return {
    score: totalScore,
    scoreLabel,
    breakdown,
  };
}
