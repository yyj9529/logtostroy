import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GenerateRequest } from '@/lib/types/api'

// Mock env
vi.mock('@/lib/env', () => ({
  env: {
    OPENAI_API_KEY: 'test-key',
    RATE_LIMIT_REDIS_URL: undefined,
    MONTHLY_BUDGET_LIMIT: '10',
  },
}))

// Mock codeBlockExtractor
vi.mock('@/lib/services/codeBlockExtractor', () => ({
  extractCodeBlocks: vi.fn(() => []),
}))

// Mock OpenAI
const mockCreate = vi.fn()
vi.mock('openai', () => ({
  default: class {
    chat = {
      completions: {
        create: mockCreate,
      },
    }
  },
}))

// Import after mocks are set up
const { generateContent } = await import('@/lib/services/openai')

describe('generateContent - LOG-32: Suppress numeric/performance claims', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockReset()
  })

  describe('Evidence missing warnings', () => {
    it('sets evidenceMissing flag when no evidence provided', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'Test content' } }],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request: GenerateRequest = {
        rawLog: 'Fixed a bug',
        outcome: 'Bug is fixed',
        tonePreset: 'linkedin',
        outputLanguage: 'ko',
      }

      const result = await generateContent(request)

      expect(result.evidenceMissing).toBe(true)
    })

    it('does not set evidenceMissing flag when evidence provided', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'Test content' } }],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request: GenerateRequest = {
        rawLog: 'Fixed a bug',
        outcome: 'Bug is fixed',
        tonePreset: 'linkedin',
        outputLanguage: 'ko',
        evidenceBefore: 'Error rate: 10%',
        evidenceAfter: 'Error rate: 1%',
      }

      const result = await generateContent(request)

      expect(result.evidenceMissing).toBe(false)
    })
  })

  describe('Numeric claims detection', () => {
    it('detects percentage claims without evidence', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          { message: { content: 'Improved performance by 50%' } },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request: GenerateRequest = {
        rawLog: 'Fixed a bug',
        outcome: 'Bug is fixed',
        tonePreset: 'linkedin',
        outputLanguage: 'ko',
      }

      const result = await generateContent(request)

      expect(result.warnings).toBeDefined()
      expect(result.warnings).toContain(
        'numeric_claims_without_evidence: numeric claims detected but no evidence provided'
      )
    })

    it('detects multiplier claims (3x, 2배) without evidence', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          { message: { content: 'Made it 3x faster' } },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request: GenerateRequest = {
        rawLog: 'Optimized code',
        outcome: 'Code is optimized',
        tonePreset: 'x',
        outputLanguage: 'en',
      }

      const result = await generateContent(request)

      expect(result.warnings).toContain(
        'numeric_claims_without_evidence: numeric claims detected but no evidence provided'
      )
    })

    it('detects Korean numeric claims (2배) without evidence', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          { message: { content: '성능이 2배 향상되었습니다' } },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request: GenerateRequest = {
        rawLog: '버그 수정',
        outcome: '버그가 수정됨',
        tonePreset: 'linkedin',
        outputLanguage: 'ko',
      }

      const result = await generateContent(request)

      expect(result.warnings).toContain(
        'numeric_claims_without_evidence: numeric claims detected but no evidence provided'
      )
    })

    it('does not warn about numeric claims when evidence provided', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          { message: { content: 'Improved performance by 50%' } },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request: GenerateRequest = {
        rawLog: 'Optimized code',
        outcome: 'Code is optimized',
        tonePreset: 'linkedin',
        outputLanguage: 'ko',
        evidenceBefore: 'Load time: 2s',
        evidenceAfter: 'Load time: 1s',
      }

      const result = await generateContent(request)

      // When evidence is provided, warnings should be undefined or not contain the error
      if (result.warnings) {
        expect(result.warnings).not.toContain(
          'numeric_claims_without_evidence: numeric claims detected but no evidence provided'
        )
      } else {
        expect(result.warnings).toBeUndefined()
      }
    })
  })

  describe('Performance claims detection', () => {
    it('detects "significantly faster" without evidence', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          { message: { content: 'Made it significantly faster' } },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request: GenerateRequest = {
        rawLog: 'Optimized code',
        outcome: 'Code is optimized',
        tonePreset: 'x',
        outputLanguage: 'en',
      }

      const result = await generateContent(request)

      expect(result.warnings).toContain(
        'performance_claims_without_evidence: performance claims detected but no evidence provided'
      )
    })

    it('detects "much better" without evidence', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          { message: { content: 'The new approach is much better' } },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request: GenerateRequest = {
        rawLog: 'Refactored code',
        outcome: 'Code is refactored',
        tonePreset: 'linkedin',
        outputLanguage: 'en',
      }

      const result = await generateContent(request)

      expect(result.warnings).toContain(
        'performance_claims_without_evidence: performance claims detected but no evidence provided'
      )
    })

    it('detects Korean performance claims (훨씬 빠른) without evidence', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          { message: { content: '훨씬 빠른 성능을 제공합니다' } },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request: GenerateRequest = {
        rawLog: '코드 최적화',
        outcome: '코드가 최적화됨',
        tonePreset: 'linkedin',
        outputLanguage: 'ko',
      }

      const result = await generateContent(request)

      expect(result.warnings).toContain(
        'performance_claims_without_evidence: performance claims detected but no evidence provided'
      )
    })

    it('does not warn about performance claims when evidence provided', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          { message: { content: 'Made it significantly faster' } },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request: GenerateRequest = {
        rawLog: 'Optimized code',
        outcome: 'Code is optimized',
        tonePreset: 'linkedin',
        outputLanguage: 'en',
        evidenceBefore: 'Response time: 500ms',
        evidenceAfter: 'Response time: 100ms',
      }

      const result = await generateContent(request)

      // When evidence is provided, warnings should be undefined or not contain the error
      if (result.warnings) {
        expect(result.warnings).not.toContain(
          'performance_claims_without_evidence: performance claims detected but no evidence provided'
        )
      } else {
        expect(result.warnings).toBeUndefined()
      }
    })
  })

  describe('Trust-over-polish principle', () => {
    it('allows content without claims when no evidence', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content:
                'Refactored the authentication module to improve code maintainability',
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request: GenerateRequest = {
        rawLog: 'Refactored auth module',
        outcome: 'Code is cleaner',
        tonePreset: 'linkedin',
        outputLanguage: 'en',
      }

      const result = await generateContent(request)

      // Should not have any warnings for qualitative descriptions
      expect(result.warnings).toBeUndefined()
    })
  })
})
