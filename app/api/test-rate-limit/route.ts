import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/middleware/rateLimiter'
import { getClientIp } from '@/lib/utils/ip'

/**
 * Test endpoint for rate limiting
 * This endpoint only checks rate limiting without calling external APIs
 */
export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const ip = getClientIp(request)

  return NextResponse.json(
    {
      message: 'Request allowed',
      ip: ip,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const ip = getClientIp(request)

  return NextResponse.json(
    {
      message: 'Request allowed',
      ip: ip,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
