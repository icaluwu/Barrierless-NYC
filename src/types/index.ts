export type MobilityProfile = 'wheelchair' | 'reduced_mobility' | 'stroller' | 'mobility_aid';

export type Coordinates = [number, number]; // [longitude, latitude]

export type EvidenceSeverity = 'low' | 'moderate' | 'high';

export type EvidenceSource = 'nyc_ramp' | 'nyc_construction' | 'nyc_311' | 'community';

export interface AccessibilityEvidence {
  id: string;
  source: EvidenceSource;
  coordinate: Coordinates;
  severity: EvidenceSeverity;
  category: string;
  description: string;
  observedAt?: string;
}

export interface ScoreBreakdown {
  rampCoverageScore: number;
  constructionPenalty: number;
  complaintPenalty: number;
  communityReportPenalty: number;
  profileSuitabilityBonus: number;
  totalScore: number;
  evidenceCounts: {
    ramps: number;
    construction: number;
    complaints: number;
    communityBarriers: number;
  };
}

export interface RouteCandidate {
  id: string;
  name: string;
  distanceMeters: number;
  durationMinutes: number;
  geometry: {
    type: 'LineString';
    coordinates: Coordinates[];
  };
  score?: number;
  scoreLabel?: string;
  scoreBreakdown?: ScoreBreakdown;
  evidence?: AccessibilityEvidence[];
  isRecommended?: boolean;
}

export interface AiRouteExplanation {
  summary: string;
  reasons: string[];
  caveat: string;
}

export interface BarrierAnalysisResult {
  barrierType: string;
  severity: EvidenceSeverity;
  observations: string[];
  affectedProfiles: MobilityProfile[];
  suggestedReportCategory: string;
  certainty: 'low' | 'moderate' | 'high';
  requiresUserConfirmation: true;
}

export interface BarrierReport {
  id: string;
  latitude: number;
  longitude: number;
  barrierType: string;
  severity: EvidenceSeverity;
  description?: string;
  imagePath?: string;
  aiObservations?: string[];
  affectedProfiles?: MobilityProfile[];
  status: 'pending' | 'active' | 'resolved' | 'expired';
  createdAt: string;
  expiresAt?: string;
}
