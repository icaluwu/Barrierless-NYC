import { BarrierReport } from '@/types';
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/supabase/client';

// Memory repository fallback for local testing & offline demo scenarios
const MEMORY_REPORTS: BarrierReport[] = [
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

export async function fetchActiveCommunityReports(): Promise<BarrierReport[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    try {
      const { data, error } = await admin
        .from('barrier_reports')
        .select('*')
        .eq('status', 'active');
      if (!error && data) {
        return data.map((r: any) => ({
          id: r.id,
          latitude: r.latitude,
          longitude: r.longitude,
          barrierType: r.barrier_type,
          severity: r.severity,
          description: r.description,
          imagePath: r.image_path,
          aiObservations: r.ai_observations,
          status: r.status,
          createdAt: r.created_at,
          expiresAt: r.expires_at
        }));
      }
    } catch (e) {
      // Fallback to memory reports
    }
  }
  return MEMORY_REPORTS;
}

export async function saveCommunityReport(report: Omit<BarrierReport, 'id' | 'createdAt' | 'status'>): Promise<BarrierReport> {
  const newReport: BarrierReport = {
    ...report,
    id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const admin = getSupabaseAdmin();
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
      }
    } catch (e) {
      // Fallback to memory persistence
    }
  }

  MEMORY_REPORTS.unshift(newReport);
  return newReport;
}
