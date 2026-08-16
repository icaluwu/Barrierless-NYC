import { NextRequest, NextResponse } from 'next/server';
import { RouteExplanationRequestSchema } from '@/lib/security/schemas';
import { explainRouteWithGemini } from '@/lib/gemini/client';

export async function POST(req: NextRequest) {
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
