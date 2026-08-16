import { NextRequest, NextResponse } from 'next/server';
import { CreateReportSchema } from '@/lib/security/schemas';
import { fetchActiveCommunityReports, saveCommunityReport } from '@/server/repositories/reports';

export async function GET() {
  try {
    const reports = await fetchActiveCommunityReports();
    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch community barrier reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid report data', details: parsed.error.format() }, { status: 400 });
    }

    const saved = await saveCommunityReport(parsed.data);
    return NextResponse.json({ success: true, report: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save community report' }, { status: 500 });
  }
}
