// Sliding window in-memory rate limiter
const rateLimitMap = new Map<string, number[]>();

// Periodically clean up expired records to avoid memory leaks
if (typeof global !== 'undefined') {
  const intervalId = 'rateLimitCleaner';
  if (!(global as any)[intervalId]) {
    (global as any)[intervalId] = setInterval(() => {
      const now = Date.now();
      rateLimitMap.forEach((timestamps, key) => {
        // Keep timestamps from the last 10 minutes (600,000 ms) max
        const validTimestamps = timestamps.filter((t: number) => now - t < 600000);
        if (validTimestamps.length === 0) {
          rateLimitMap.delete(key);
        } else {
          rateLimitMap.set(key, validTimestamps);
        }
      });
    }, 60000); // run cleaner every minute
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Seconds until limit resets
}

/**
 * Validates request counts against a sliding window rate limit.
 * @param key Unique identifier (e.g. `ip:route`)
 * @param limit Maximum allowed requests within the window
 * @param windowMs Window duration in milliseconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = rateLimitMap.get(key) || [];
  
  // Filter out timestamps older than the window
  const activeTimestamps = timestamps.filter((t: number) => t > windowStart);

  if (activeTimestamps.length >= limit) {
    const oldestActive = activeTimestamps[0];
    const resetTimeMs = oldestActive + windowMs;
    const resetSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetSeconds
    };
  }

  activeTimestamps.push(now);
  rateLimitMap.set(key, activeTimestamps);

  return {
    success: true,
    limit,
    remaining: limit - activeTimestamps.length,
    reset: Math.max(1, Math.ceil(windowMs / 1000))
  };
}
