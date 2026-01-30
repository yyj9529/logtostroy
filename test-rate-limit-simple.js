/**
 * Simple test script for rate limiting
 * Uses the test endpoint that doesn't require OpenAI API key
 */

const API_URL = 'http://localhost:3000/api/test-rate-limit'

async function makeRequest(requestNumber) {
  console.log(`\n--- Request #${requestNumber} ---`)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    console.log('Status:', response.status)
    console.log('Rate Limit Headers:')
    const rateLimitLimit = response.headers.get('X-RateLimit-Limit')
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
    const rateLimitReset = response.headers.get('X-RateLimit-Reset')
    const retryAfter = response.headers.get('Retry-After')

    if (rateLimitLimit) console.log('  X-RateLimit-Limit:', rateLimitLimit)
    if (rateLimitRemaining)
      console.log('  X-RateLimit-Remaining:', rateLimitRemaining)
    if (rateLimitReset) console.log('  X-RateLimit-Reset:', rateLimitReset)
    if (retryAfter) console.log('  Retry-After:', retryAfter, 'seconds')

    if (response.status === 429) {
      console.log('\n✅ RATE LIMITED (Expected after 3 requests)')
      console.log('Response:', JSON.stringify(data, null, 2))
      return { success: true, rateLimited: true, retryAfter: data.retryAfter }
    } else if (response.status === 200) {
      console.log('\n✅ SUCCESS')
      console.log('Response:', JSON.stringify(data, null, 2))
      return { success: true, rateLimited: false }
    } else {
      console.log('\n❌ UNEXPECTED STATUS')
      console.log('Response:', JSON.stringify(data, null, 2))
      return { success: false, status: response.status }
    }
  } catch (error) {
    console.log('\n❌ REQUEST FAILED')
    console.error('Error:', error.message)
    return { success: false, error: error.message }
  }
}

async function testRateLimit() {
  console.log('='.repeat(70))
  console.log('Testing IP-based Rate Limiting (3 requests/hour/IP)')
  console.log('='.repeat(70))

  const results = []

  // Make 5 requests to verify rate limiting
  for (let i = 1; i <= 5; i++) {
    const result = await makeRequest(i)
    results.push(result)

    // Small delay between requests
    if (i < 5) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('Test Summary')
  console.log('='.repeat(70))

  const successfulRequests = results.filter(
    (r) => r.success && !r.rateLimited
  ).length
  const rateLimitedRequests = results.filter((r) => r.rateLimited).length
  const failedRequests = results.filter((r) => !r.success).length

  console.log(`Total requests: ${results.length}`)
  console.log(`✅ Successful requests: ${successfulRequests}`)
  console.log(`🚫 Rate limited requests: ${rateLimitedRequests}`)
  console.log(`❌ Failed requests: ${failedRequests}`)

  // Verify expected behavior
  console.log('\n' + '='.repeat(70))
  if (successfulRequests === 3 && rateLimitedRequests === 2) {
    console.log('✅ TEST PASSED: Rate limiting working correctly!')
    console.log('   - First 3 requests allowed (HTTP 200)')
    console.log('   - Request 4 and 5 blocked (HTTP 429)')
  } else {
    console.log('❌ TEST FAILED: Unexpected behavior')
    console.log(
      `   Expected: 3 successful, 2 rate limited`
    )
    console.log(
      `   Got: ${successfulRequests} successful, ${rateLimitedRequests} rate limited`
    )
  }

  // Display retry-after time from the rate limited request
  const rateLimitedResult = results.find((r) => r.rateLimited)
  if (rateLimitedResult?.retryAfter) {
    console.log(`\n📍 Retry after: ${rateLimitedResult.retryAfter} seconds`)
    const minutes = Math.round(rateLimitedResult.retryAfter / 60)
    console.log(`   (approximately ${minutes} minute${minutes !== 1 ? 's' : ''})`)
  }
  console.log('='.repeat(70))
}

// Run the test
console.log('Starting rate limit test...')
console.log('Make sure the dev server is running: pnpm dev\n')

testRateLimit().catch(console.error)
