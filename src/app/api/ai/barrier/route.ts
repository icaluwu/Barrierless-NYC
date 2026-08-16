import { NextRequest, NextResponse } from 'next/server';
import { analyzeBarrierImageWithGemini } from '@/lib/gemini/client';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per SECURITY.md

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Invalid image type. Allowed: JPEG, PNG, WebP` }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB maximum limit' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await analyzeBarrierImageWithGemini(buffer, file.type);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze barrier image' }, { status: 500 });
  }
}
