import { NextRequest } from 'next/server'

/**
 * Extract client IP address from Next.js request
 * Handles various proxy headers and fallbacks
 */
export function getClientIp(request: NextRequest): string {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    const ip = forwarded.split(',')[0].trim()
    if (ip) return ip
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp

  // Fallback to a default for development/testing
  return '127.0.0.1'
}
