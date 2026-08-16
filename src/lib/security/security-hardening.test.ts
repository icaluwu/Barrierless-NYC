import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CreateReportSchema } from './schemas';
import { explainRouteWithGemini, analyzeBarrierImageWithGemini } from '../gemini/client';
import { saveCommunityReport } from '../../server/repositories/reports';

describe('Security & Production Hardening Policy Checks', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Server-side NYC Coordinate Bounds Validation', () => {
    it('accepts valid NYC coordinates (e.g. Times Square)', () => {
      const validPayload = {
        latitude: 40.7583,
        longitude: -73.9851,
        barrierType: 'Blocked Ramp',
        severity: 'high',
        description: 'Construction obstruction on curb ramp.',
      };

      const result = CreateReportSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects coordinates outside NYC (e.g., 0,0 or Los Angeles)', () => {
      const invalidNullIsland = {
        latitude: 0,
        longitude: 0,
        barrierType: 'Blocked Ramp',
        severity: 'high',
      };

      const invalidLA = {
        latitude: 34.0522,
        longitude: -118.2437,
        barrierType: 'Blocked Ramp',
        severity: 'high',
      };

      const resNull = CreateReportSchema.safeParse(invalidNullIsland);
      expect(resNull.success).toBe(false);
      if (!resNull.success) {
        expect(resNull.error.issues[0].message).toBe('Barrier reports must be located within New York City.');
      }

      const resLA = CreateReportSchema.safeParse(invalidLA);
      expect(resLA.success).toBe(false);
    });

    it('repository function throws error for non-NYC coordinates', async () => {
      await expect(
        saveCommunityReport({
          latitude: 0,
          longitude: 0,
          barrierType: 'Test Barrier',
          severity: 'high',
        })
      ).rejects.toThrow('Barrier reports must be located within New York City.');
    });
  });

  describe('Gemini AI Failure Policy', () => {
    it('returns deterministic evidence summary (labeled isAiGenerated: false) when GEMINI_API_KEY is missing', async () => {
      delete process.env.GEMINI_API_KEY;

      const explanation = await explainRouteWithGemini({
        profile: 'wheelchair',
        recommendedRouteName: 'Route A',
        recommendedScore: 85,
        evidenceCounts: { ramps: 4, construction: 0, complaints: 0, communityBarriers: 0 },
        timeDifferenceMinutes: 2,
      });

      expect(explanation.isAiGenerated).toBe(false);
      expect(explanation.summary).toContain('[Evidence Summary]');
    });

    it('returns null for image analysis when GEMINI_API_KEY is missing (never generates fake observations)', async () => {
      delete process.env.GEMINI_API_KEY;

      // Valid JPEG header buffer
      const dummyJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

      const result = await analyzeBarrierImageWithGemini(dummyJpegBuffer, 'image/jpeg');
      expect(result).toBeNull();
    });
  });

  describe('Supabase Database Write Failure Policy', () => {
    it('throws DATABASE_UNAVAILABLE when SUPABASE_SERVICE_ROLE_KEY is missing and ENABLE_DEMO_DATA=false', async () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.ENABLE_DEMO_DATA = 'false';

      await expect(
        saveCommunityReport({
          latitude: 40.7583,
          longitude: -73.9851,
          barrierType: 'Blocked Ramp',
          severity: 'high',
        })
      ).rejects.toThrow('DATABASE_UNAVAILABLE');
    });
  });
});
