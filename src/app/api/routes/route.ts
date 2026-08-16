import { NextRequest, NextResponse } from 'next/server';
import { RouteRequestSchema } from '@/lib/security/schemas';
import { fetchRouteCandidates } from '@/lib/openrouteservice/routing';
import { fetchNycPedestrianRamps } from '@/lib/nyc-open-data/ramps';
import { fetchNycConstructionPermits } from '@/lib/nyc-open-data/construction';
import { fetchNyc311Complaints } from '@/lib/nyc-open-data/complaints311';
import { fetchActiveCommunityReports } from '@/server/repositories/reports';
import { calculateBarrierlessScore } from '@/features/scoring/score-route';
import { getEvidenceNearRoute } from '@/lib/geospatial/route-evidence';
import { AccessibilityEvidence, Coordinates, RouteCandidate, SystemDataStatus } from '@/types';
import { checkRateLimit } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limiting check
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = checkRateLimit(`routes-${ip}`, 30, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many route calculation requests. Please wait a moment.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = RouteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid route parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { origin, destination, profile } = parsed.data;

    // Calculate bounding box for geographically scoped NYC Open Data queries (+0.01 degree padding ~1km)
    const minLng = Math.min(origin[0], destination[0]) - 0.01;
    const maxLng = Math.max(origin[0], destination[0]) + 0.01;
    const minLat = Math.min(origin[1], destination[1]) - 0.01;
    const maxLat = Math.max(origin[1], destination[1]) + 0.01;
    const bounds: [Coordinates, Coordinates] = [[minLng, minLat], [maxLng, maxLat]];

    // 1. Retrieve route candidates and fetch signals concurrently
    const [
      routingRes,
      rampsRes,
      constructionRes,
      complaintsRes,
      communityRes
    ] = await Promise.all([
      fetchRouteCandidates(origin, destination, profile),
      fetchNycPedestrianRamps(bounds),
      fetchNycConstructionPermits(bounds),
      fetchNyc311Complaints(bounds),
      fetchActiveCommunityReports()
    ]);

    const candidates = routingRes.routes;

    // Map community reports to normalized evidence shape with provenance
    const communityEvidence: AccessibilityEvidence[] = communityRes.reports.map((r) => ({
      id: r.id,
      source: 'community',
      sourceType: 'community',
      sourceName: 'User Barrier Report',
      dataMode: communityRes.dataMode,
      coordinate: [r.longitude, r.latitude],
      severity: r.severity,
      category: r.barrierType,
      description: r.description || r.barrierType,
      observedAt: r.createdAt
    }));

    const allEvidence = [
      ...rampsRes.evidence,
      ...constructionRes.evidence,
      ...complaintsRes.evidence,
      ...communityEvidence
    ];

    // Data status report for UI transparency
    const dataStatus: SystemDataStatus = {
      routing: routingRes.dataMode,
      ramps: rampsRes.dataMode,
      construction: constructionRes.dataMode,
      complaints311: complaintsRes.dataMode,
      communityReports: communityRes.dataMode
    };

    // 2. Compute BAIE score for each route candidate deterministically using Turf.js spatial corridor distance
    const scoredCandidates: RouteCandidate[] = candidates.map((route) => {
      // Use Turf.js pointToLineDistance to match evidence within a 30m corridor of the route
      const routeEvidence = getEvidenceNearRoute(route.geometry, allEvidence, 30);

      const { score, scoreLabel, breakdown } = calculateBarrierlessScore(
        route.distanceMeters,
        profile,
        routeEvidence
      );

      return {
        ...route,
        score,
        scoreLabel,
        scoreBreakdown: breakdown,
        evidence: routeEvidence,
        isRecommended: false
      };
    });

    // 3. Rank candidates purely by Barrierless Score (highest score wins, no artificial bias)
    scoredCandidates.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Flag top scoring candidate as recommended
    if (scoredCandidates.length > 0) {
      scoredCandidates[0].isRecommended = true;
    }

    return NextResponse.json({
      profile,
      origin,
      destination,
      routes: scoredCandidates,
      totalEvidenceCount: allEvidence.length,
      dataStatus
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process routing request' }, { status: 500 });
  }
}
