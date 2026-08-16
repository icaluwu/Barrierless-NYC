export const BAIE_WEIGHTS = {
  RAMP_COVERAGE: 30,       // 30% max contribution
  CONSTRUCTION_PENALTY: 25,// 25% max deduction
  COMPLAINT_PENALTY: 20,   // 20% max deduction
  COMMUNITY_BARRIER_PENALTY: 15, // 15% max deduction
  PROFILE_SUITABILITY: 10  // 10% max contribution
} as const;

export const SCORE_LABELS = {
  HIGHEST_SUITABILITY: 'Highest Accessibility Suitability',
  MORE_ACCESSIBLE: 'More Accessible',
  MODERATE: 'Moderate Accessibility',
  CHALLENGING: 'Challenging'
} as const;

export function getScoreLabel(score: number): string {
  if (score >= 85) return SCORE_LABELS.HIGHEST_SUITABILITY;
  if (score >= 70) return SCORE_LABELS.MORE_ACCESSIBLE;
  if (score >= 50) return SCORE_LABELS.MODERATE;
  return SCORE_LABELS.CHALLENGING;
}
