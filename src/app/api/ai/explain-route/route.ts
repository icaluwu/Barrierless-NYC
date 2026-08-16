import { NextRequest, NextResponse } from 'next/server';
import { RouteExplanationRequestSchema } from '@/lib/security/schemas';
import { explainRouteWithGemini } from '@/lib/gemini/client';
import { checkRateLimit } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = checkRateLimit(`ai-explain-${ip}`, 20, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many explanation requests. Please wait a minute.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = RouteExplanationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid explanation payload', details: parsed.error.format() }, { status: 400 });
    }

    const explanation = await explainRouteWithGemini(parsed.data);
    return NextResponse.json(explanation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate route explanation' }, { status: 500 });
  }
}
