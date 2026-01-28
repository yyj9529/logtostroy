// Simple API test script
// Run with: node test-api.js

const testCases = [
  {
    name: 'Empty rawLog - should return 400',
    data: {
      rawLog: '',
      outcome: 'Test outcome',
      tonePreset: 'linkedin',
      outputLanguage: 'ko',
    },
    expectedStatus: 400,
  },
  {
    name: 'rawLog exceeds 2000 characters - should return 400',
    data: {
      rawLog: 'a'.repeat(2001),
      outcome: 'Test outcome',
      tonePreset: 'linkedin',
      outputLanguage: 'ko',
    },
    expectedStatus: 400,
  },
  {
    name: 'Empty outcome - should return 400',
    data: {
      rawLog: 'Some log data',
      outcome: '',
      tonePreset: 'linkedin',
      outputLanguage: 'ko',
    },
    expectedStatus: 400,
  },
  {
    name: 'Valid input - should return 200',
    data: {
      rawLog: 'Valid log data here',
      outcome: 'Successfully completed the task',
      tonePreset: 'linkedin',
      outputLanguage: 'ko',
    },
    expectedStatus: 200,
  },
]

async function runTests() {
  console.log('Starting API tests...\n')

  for (const testCase of testCases) {
    try {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      })

      const data = await response.json()

      const passed = response.status === testCase.expectedStatus
      const status = passed ? '✓ PASS' : '✗ FAIL'

      console.log(`${status}: ${testCase.name}`)
      console.log(`  Expected status: ${testCase.expectedStatus}`)
      console.log(`  Actual status: ${response.status}`)
      if (!passed || response.status !== 200) {
        console.log(`  Response:`, JSON.stringify(data, null, 2))
      }
      console.log('')
    } catch (error) {
      console.log(`✗ ERROR: ${testCase.name}`)
      console.log(`  Error: ${error.message}`)
      console.log('')
    }
  }
}

runTests().catch(console.error)
