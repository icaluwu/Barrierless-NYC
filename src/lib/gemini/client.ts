import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiBarrierAnalysisSchema, AiRouteExplanationSchema } from '../security/schemas';
import { AiRouteExplanation, BarrierAnalysisResult, MobilityProfile } from '@/types';

const GEMINI_MODEL_ID = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Validates uploaded image buffer for safety, mime type, size, and magic bytes.
 */
export function validateImageBuffer(
  buffer: Buffer,
  mimeType: string
): { isValid: boolean; error?: string } {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, error: 'Empty file uploaded' };
  }

  // Max 5MB file size limit
  if (buffer.length > 5 * 1024 * 1024) {
    return { isValid: false, error: 'File size exceeds 5MB limit' };
  }

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
    return { isValid: false, error: 'Unsupported file format. Please upload JPEG, PNG, or WebP.' };
  }

  // Magic bytes check for JPEG, PNG, WebP signatures
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

  if (!isJpeg && !isPng && !isWebp) {
    return { isValid: false, error: 'Corrupted image file signature.' };
  }

  return { isValid: true };
}

export async function explainRouteWithGemini(params: {
  profile: MobilityProfile;
  recommendedRouteName: string;
  recommendedScore: number;
  alternativeRouteName?: string;
  alternativeScore?: number;
  evidenceCounts: { ramps: number; construction: number; complaints: number; communityBarriers: number };
  timeDifferenceMinutes: number;
}): Promise<AiRouteExplanation> {
  const ai = getGeminiClient();

  const promptText = `
You are an accessibility AI assistant for Barrierless NYC. Explain concisely why ${params.recommendedRouteName} is recommended over alternatives for a user with mobility profile '${params.profile}'.
Structured route facts:
- Recommended Route: ${params.recommendedRouteName} (Barrierless Score: ${params.recommendedScore}/100)
- Alternative Route: ${params.alternativeRouteName || 'Direct Route'} (Barrierless Score: ${params.alternativeScore || 60}/100)
- Time difference: ${params.timeDifferenceMinutes} extra minutes
- Verified Pedestrian Ramps: ${params.evidenceCounts.ramps}
- Active Construction Permits: ${params.evidenceCounts.construction}
- 311 Sidewalk Complaints: ${params.evidenceCounts.complaints}
- Confirmed Community Barrier Reports: ${params.evidenceCounts.communityBarriers}

Return strictly a JSON object with:
{
  "summary": "1-2 sentence overview of why this route is better suited.",
  "reasons": ["Point 1 about ramps/construction", "Point 2 about time vs suitability"],
  "caveat": "Suitability estimate disclaimer based on available data."
}
`;

  if (ai) {
    try {
      const model = ai.getGenerativeModel({ model: GEMINI_MODEL_ID });
      const response = await model.generateContent(promptText);

      const text = response.response.text() || '';
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      const validated = AiRouteExplanationSchema.safeParse(parsed);
      if (validated.success) {
        return {
          ...validated.data,
          isAiGenerated: true
        };
      }
    } catch (err) {
      console.warn('Gemini route explanation model call failed:', err);
    }
  }

  // Explicit non-AI evidence summary fallback (clearly labeled)
  return {
    summary: `[Evidence Summary] ${params.recommendedRouteName} is scored higher (${params.recommendedScore}/100) for ${params.profile.replace('_', ' ')} suitability based on observed civic signals.`,
    reasons: [
      `Density of verified pedestrian curb ramps: ${params.evidenceCounts.ramps}.`,
      `Active construction permits: ${params.evidenceCounts.construction}, 311 issues: ${params.evidenceCounts.complaints}, community barriers: ${params.evidenceCounts.communityBarriers}.`,
      `Travel time difference: +${params.timeDifferenceMinutes} minute(s).`
    ],
    caveat: 'Deterministic score calculation based on available NYC Open Data evidence.',
    isAiGenerated: false
  };
}

export async function analyzeBarrierImageWithGemini(
  imageBuffer: Buffer,
  mimeType: string
): Promise<BarrierAnalysisResult | null> {
  const validation = validateImageBuffer(imageBuffer, mimeType);
  if (!validation.isValid) {
    throw new Error(validation.error || 'INVALID_IMAGE');
  }

  const ai = getGeminiClient();
  if (!ai) {
    return null; // Return null so handler returns AI_ANALYSIS_UNAVAILABLE error without fake observations
  }

  try {
    const base64Image = imageBuffer.toString('base64');
    const promptText = `
Analyze this uploaded photo of a sidewalk or street infrastructure for physical accessibility barriers.
Return strictly a JSON object matching this schema:
{
  "barrierType": "concise description e.g. blocked_curb_ramp, scaffolding_hazard, broken_pavement",
  "severity": "low" | "moderate" | "high",
  "observations": ["1-2 concise objective visual observations"],
  "affectedProfiles": ["wheelchair", "stroller"],
  "suggestedReportCategory": "category name",
  "certainty": "low" | "moderate" | "high",
  "requiresUserConfirmation": true
}
`;

    const model = ai.getGenerativeModel({ model: GEMINI_MODEL_ID });
    const response = await model.generateContent([
      promptText,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ]);

    const text = response.response.text() || '';
    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    const validated = AiBarrierAnalysisSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }
  } catch (err) {
    console.error('Gemini image analysis exception:', err);
  }

  // Never return fake observations when Gemini fails
  return null;
}
