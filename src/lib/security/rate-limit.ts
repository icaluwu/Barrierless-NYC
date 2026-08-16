/**
 * Lightweight in-memory rate limiter for public server API routes.
 * Limits requests per client IP within a sliding time window.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale IP records periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 60000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }, 300000);
}

export function checkRateLimit(
  identifier: string,
  maxRequests = 30,
  windowMs = 60000
): { success: boolean; limit: number; remaining: number; resetMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitMap.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(identifier, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = Math.max(0, oldestTimestamp + windowMs - now);
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetMs,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  };
}
