import { point, lineString, pointToLineDistance } from '@turf/turf';
import { AccessibilityEvidence, RouteCandidate } from '@/types';

/**
 * Filters evidence items that lie within a spatial corridor threshold (in meters)
 * from a candidate route geometry LineString.
 *
 * @param routeGeometry - GeoJSON LineString geometry of the route
 * @param evidenceItems - Array of normalized evidence items
 * @param thresholdMeters - Max distance threshold in meters (default: 30m)
 */
export function getEvidenceNearRoute(
  routeGeometry: RouteCandidate['geometry'],
  evidenceItems: AccessibilityEvidence[],
  thresholdMeters = 30
): AccessibilityEvidence[] {
  if (!routeGeometry || !routeGeometry.coordinates || routeGeometry.coordinates.length < 2) {
    return [];
  }

  try {
    const routeLine = lineString(routeGeometry.coordinates);

    return evidenceItems.filter((item) => {
      if (!item.coordinate || item.coordinate.length < 2) return false;
      const [lng, lat] = item.coordinate;
      if (isNaN(lng) || isNaN(lat)) return false;

      const itemPoint = point([lng, lat]);
      // Calculate distance in meters
      const distanceMeters = pointToLineDistance(itemPoint, routeLine, { units: 'meters' });

      // Attach exact distance to evidence item for UI provenance display
      item.distanceFromRouteMeters = Math.round(distanceMeters);

      return distanceMeters <= thresholdMeters;
    });
  } catch (error) {
    console.error('Error computing Turf.js spatial corridor evidence:', error);
    return [];
  }
}
