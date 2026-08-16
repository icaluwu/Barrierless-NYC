import { NextRequest, NextResponse } from 'next/server';
import { CreateReportSchema } from '@/lib/security/schemas';
import { fetchActiveCommunityReports, saveCommunityReport } from '@/server/repositories/reports';
import { checkRateLimit } from '@/lib/security/rate-limit';

export async function GET() {
  try {
    const { reports, dataMode } = await fetchActiveCommunityReports();
    return NextResponse.json({ reports, dataMode });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch community barrier reports', dataMode: 'degraded' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = checkRateLimit(`report-submit-${ip}`, 10, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: 'RATE_LIMITED', message: 'Too many report submissions. Please wait a minute.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = CreateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'INVALID_INPUT', details: parsed.error.format() }, { status: 400 });
    }

    const saved = await saveCommunityReport(parsed.data);
    return NextResponse.json({ success: true, report: saved }, { status: 201 });
  } catch (error: any) {
    const isDbUnavailable = error?.message === 'DATABASE_UNAVAILABLE';
    return NextResponse.json(
      {
        success: false,
        error: isDbUnavailable ? 'DATABASE_UNAVAILABLE' : 'REPORT_SAVE_FAILED',
        message: isDbUnavailable
          ? 'Community report database is currently unavailable. Report was not saved.'
          : 'Failed to persist community barrier report.'
      },
      { status: isDbUnavailable ? 503 : 500 }
    );
  }
}
