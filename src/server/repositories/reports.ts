import { BarrierReport, DataMode } from '@/types';
import { getSupabaseAdminClient, getSupabasePublicClient } from '@/lib/supabase/client';
import { NYC_BOUNDS } from '@/lib/security/schemas';

export interface FetchReportsResponse {
  reports: BarrierReport[];
  dataMode: DataMode;
}

const DEMO_REPORTS: BarrierReport[] = [
  {
    id: 'report-demo-1',
    latitude: 40.7583,
    longitude: -73.9851,
    barrierType: 'Blocked Curb Ramp',
    severity: 'high',
    description: 'Construction material dump blocking tactile curb ramp transition.',
    aiObservations: ['Construction material dumping on ramp radius.', 'Wheelchair pass-through width < 24 inches.'],
    affectedProfiles: ['wheelchair', 'stroller'],
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'report-demo-2',
    latitude: 40.7562,
    longitude: -73.9870,
    barrierType: 'Damaged Sidewalk Pavement',
    severity: 'moderate',
    description: 'Deep pavement crack and vertical displacement exceeding 1.5 inches.',
    aiObservations: ['Concrete displacement hazard.', 'Wheelchair tip hazard.'],
    affectedProfiles: ['wheelchair', 'mobility_aid'],
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

export async function fetchActiveCommunityReports(): Promise<FetchReportsResponse> {
  const isDemoEnabled = process.env.ENABLE_DEMO_DATA === 'true';
  const supabase = getSupabasePublicClient() || getSupabaseAdminClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('barrier_reports')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const reports: BarrierReport[] = data.map((r: any) => ({
          id: r.id,
          latitude: parseFloat(r.latitude),
          longitude: parseFloat(r.longitude),
          barrierType: r.barrier_type,
          severity: r.severity,
          description: r.description,
          imagePath: r.image_path,
          aiObservations: r.ai_observations,
          status: r.status,
          createdAt: r.created_at,
          expiresAt: r.expires_at
        }));
        return { reports, dataMode: 'live' };
      }
    } catch (e) {
      console.warn('Supabase community reports fetch error.');
    }
  }

  if (isDemoEnabled) {
    return { reports: DEMO_REPORTS, dataMode: 'demo' };
  }

  return { reports: [], dataMode: 'degraded' };
}

export async function saveCommunityReport(
  report: Omit<BarrierReport, 'id' | 'createdAt' | 'status'>
): Promise<BarrierReport> {
  const isDemoEnabled = process.env.ENABLE_DEMO_DATA === 'true';

  // Server-side NYC geographic bounds validation
  if (
    isNaN(report.latitude) ||
    isNaN(report.longitude) ||
    report.latitude < NYC_BOUNDS.minLat ||
    report.latitude > NYC_BOUNDS.maxLat ||
    report.longitude < NYC_BOUNDS.minLng ||
    report.longitude > NYC_BOUNDS.maxLng
  ) {
    throw new Error('Barrier reports must be located within New York City.');
  }

  const newReport: BarrierReport = {
    ...report,
    barrierType: (report.barrierType || 'Sidewalk Obstruction').slice(0, 100),
    description: (report.description || '').slice(0, 1000),
    id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  // Strictly require server-side admin client for write path (no fallback to public anon key)
  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      const { data, error } = await admin.from('barrier_reports').insert({
        id: newReport.id,
        latitude: newReport.latitude,
        longitude: newReport.longitude,
        barrier_type: newReport.barrierType,
        severity: newReport.severity,
        description: newReport.description,
        image_path: newReport.imagePath,
        ai_observations: newReport.aiObservations,
        status: newReport.status,
        created_at: newReport.createdAt
      }).select().single();

      if (!error && data) {
        return newReport;
      } else if (error) {
        console.error('Supabase report insert error:', error.message);
      }
    } catch (e) {
      console.error('Supabase persistence exception:', e);
    }
  }

  // Production failure policy: do NOT pretend memory persistence succeeded
  if (!isDemoEnabled) {
    throw new Error('DATABASE_UNAVAILABLE');
  }

  DEMO_REPORTS.unshift(newReport);
  return newReport;
}
