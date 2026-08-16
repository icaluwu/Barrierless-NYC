import { z } from 'zod';

export const NYC_BOUNDS = {
  minLat: 40.49,
  maxLat: 40.92,
  minLng: -74.26,
  maxLng: -73.70,
};

export const CoordinatesSchema = z.tuple([
  z.number().min(-180).max(180), // longitude
  z.number().min(-90).max(90)    // latitude
]);

export const MobilityProfileSchema = z.enum([
  'wheelchair',
  'reduced_mobility',
  'stroller',
  'mobility_aid'
]);

export const RouteRequestSchema = z.object({
  origin: CoordinatesSchema,
  destination: CoordinatesSchema,
  profile: MobilityProfileSchema
});

export const GeocodeRequestSchema = z.object({
  query: z.string().min(2).max(200)
});

export const RouteExplanationRequestSchema = z.object({
  profile: MobilityProfileSchema,
  recommendedRouteName: z.string(),
  recommendedScore: z.number().min(0).max(100),
  alternativeRouteName: z.string().optional(),
  alternativeScore: z.number().min(0).max(100).optional(),
  evidenceCounts: z.object({
    ramps: z.number(),
    construction: z.number(),
    complaints: z.number(),
    communityBarriers: z.number()
  }),
  timeDifferenceMinutes: z.number()
});

export const AiRouteExplanationSchema = z.object({
  summary: z.string().min(10).max(500),
  reasons: z.array(z.string()).min(1).max(5),
  caveat: z.string().min(10).max(300)
});

export const AiBarrierAnalysisSchema = z.object({
  barrierType: z.string().min(3).max(100),
  severity: z.enum(['low', 'moderate', 'high']),
  observations: z.array(z.string().max(500)).min(1).max(5),
  affectedProfiles: z.array(MobilityProfileSchema),
  suggestedReportCategory: z.string().min(3).max(100),
  certainty: z.enum(['low', 'moderate', 'high']),
  requiresUserConfirmation: z.literal(true)
});

export const CreateReportSchema = z.object({
  latitude: z
    .number()
    .min(NYC_BOUNDS.minLat, { message: 'Barrier reports must be located within New York City.' })
    .max(NYC_BOUNDS.maxLat, { message: 'Barrier reports must be located within New York City.' }),
  longitude: z
    .number()
    .min(NYC_BOUNDS.minLng, { message: 'Barrier reports must be located within New York City.' })
    .max(NYC_BOUNDS.maxLng, { message: 'Barrier reports must be located within New York City.' }),
  barrierType: z.string().min(3).max(100),
  severity: z.enum(['low', 'moderate', 'high']),
  description: z.string().max(1000).optional(),
  imagePath: z.string().optional(),
  aiObservations: z.array(z.string().max(500)).max(5).optional(),
  affectedProfiles: z
    .array(MobilityProfileSchema)
    .optional()
    .transform((arr) => (arr ? Array.from(new Set(arr)) : undefined))
});
