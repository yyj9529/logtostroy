import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/utils/ip'

interface RateLimitEntry {
  timestamps: number[]
}

// In-memory store for rate limiting
// Key: IP address, Value: array of request timestamps
const rateLimitStore = new Map<string, RateLimitEntry>()

// Rate limit configuration
const RATE_LIMIT = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
} as const

/**
 * Clean up old timestamps outside the current time window
 */
function cleanupOldTimestamps(timestamps: number[], now: number): number[] {
  return timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT.windowMs)
}

/**
 * Calculate when the next request will be allowed
 */
function calculateRetryAfter(timestamps: number[]): number {
  if (timestamps.length === 0) return 0

  const oldestTimestamp = timestamps[0]
  const now = Date.now()
  const timeSinceOldest = now - oldestTimestamp
  const remainingTime = RATE_LIMIT.windowMs - timeSinceOldest

  // Return seconds (HTTP Retry-After expects seconds)
  return Math.ceil(remainingTime / 1000)
}

/**
 * Check if request should be rate limited
 * Returns null if allowed, or NextResponse with 429 if rate limited
 */
export function checkRateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIp(request)
  const now = Date.now()

  // Get or create entry for this IP
  let entry = rateLimitStore.get(ip)
  if (!entry) {
    entry = { timestamps: [] }
    rateLimitStore.set(ip, entry)
  }

  // Clean up old timestamps
  entry.timestamps = cleanupOldTimestamps(entry.timestamps, now)

  // Check if rate limit exceeded
  if (entry.timestamps.length >= RATE_LIMIT.maxRequests) {
    const retryAfter = calculateRetryAfter(entry.timestamps)

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests from this IP address. Maximum ${RATE_LIMIT.maxRequests} requests per hour allowed.`,
        retryAfter: retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(
            entry.timestamps[0] + RATE_LIMIT.windowMs
          ).toISOString(),
        },
      }
    )
  }

  // Add current timestamp
  entry.timestamps.push(now)

  // No rate limit hit
  return null
}

/**
 * Cleanup old entries from the store periodically
 * Call this from a background job or cron
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()

  for (const [ip, entry] of rateLimitStore.entries()) {
    entry.timestamps = cleanupOldTimestamps(entry.timestamps, now)

    // Remove entry if no recent requests
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(ip)
    }
  }
}

/**
 * Get current rate limit info for an IP (useful for testing/debugging)
 */
export function getRateLimitInfo(ip: string): {
  requestCount: number
  remaining: number
  oldestTimestamp: number | null
} {
  const entry = rateLimitStore.get(ip)
  if (!entry || entry.timestamps.length === 0) {
    return {
      requestCount: 0,
      remaining: RATE_LIMIT.maxRequests,
      oldestTimestamp: null,
    }
  }

  const now = Date.now()
  const validTimestamps = cleanupOldTimestamps(entry.timestamps, now)

  return {
    requestCount: validTimestamps.length,
    remaining: Math.max(0, RATE_LIMIT.maxRequests - validTimestamps.length),
    oldestTimestamp: validTimestamps[0] || null,
  }
}
