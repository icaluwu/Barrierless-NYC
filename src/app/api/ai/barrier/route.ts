import { NextRequest, NextResponse } from 'next/server';
import { analyzeBarrierImageWithGemini } from '@/lib/gemini/client';
import { checkRateLimit } from '@/lib/security/rate-limit';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per SECURITY.md

export async function POST(req: NextRequest) {
  // Rate limiting check to protect AI quota
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = checkRateLimit(`ai-barrier-${ip}`, 15, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: 'RATE_LIMITED', message: 'Too many image analysis requests. Please wait a minute.' },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'INVALID_INPUT', message: 'No image file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT', message: 'Invalid image format. Allowed: JPEG, PNG, WebP.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT', message: 'File size exceeds 5MB limit.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await analyzeBarrierImageWithGemini(buffer, file.type);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'AI_ANALYSIS_UNAVAILABLE', message: 'Multimodal AI analysis service is temporarily unavailable.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'AI_ANALYSIS_UNAVAILABLE', message: error?.message || 'Failed to process barrier image' },
      { status: 500 }
    );
  }
}
