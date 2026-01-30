import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FIELD_LIMITS } from '@/lib/types/form'
import { generateContent } from '@/lib/services/openai'
import { GenerateRequest } from '@/lib/types/api'
import { checkRateLimit } from '@/lib/middleware/rateLimiter'

const generateRequestSchema = z.object({
  rawLog: z
    .string()
    .min(1, 'Raw log cannot be empty')
    .max(
      FIELD_LIMITS.rawLog,
      `Raw log cannot exceed ${FIELD_LIMITS.rawLog} characters`
    ),
  outcome: z
    .string()
    .min(1, 'One sentence result is required')
    .max(
      FIELD_LIMITS.outcome,
      `Outcome cannot exceed ${FIELD_LIMITS.outcome} characters`
    ),
  tonePreset: z.enum(['linkedin', 'x']),
  outputLanguage: z.enum(['ko', 'en', 'both']),
  evidenceBefore: z
    .string()
    .max(
      FIELD_LIMITS.evidenceBefore,
      `Evidence before cannot exceed ${FIELD_LIMITS.evidenceBefore} characters`
    )
    .optional(),
  evidenceAfter: z
    .string()
    .max(
      FIELD_LIMITS.evidenceAfter,
      `Evidence after cannot exceed ${FIELD_LIMITS.evidenceAfter} characters`
    )
    .optional(),
  humanInsight: z
    .string()
    .max(
      FIELD_LIMITS.humanInsight,
      `Human insight cannot exceed ${FIELD_LIMITS.humanInsight} characters`
    )
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await request.json()

    // Validate input
    const validationResult = generateRequestSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: errors,
        },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data as GenerateRequest

    // Generate content using OpenAI
    const result = await generateContent(validatedData)

    // Log token usage for budget tracking
    console.log('[Token Usage]', {
      timestamp: new Date().toISOString(),
      tokenUsage: result.tokenUsage,
      tonePreset: validatedData.tonePreset,
      outputLanguage: validatedData.outputLanguage,
    })

    // Transform response to match OutputDisplay expected format
    const response = {
      ...result,
      output: {
        linkedin: {
          ko: result.linkedin?.ko,
          en: result.linkedin?.en,
        },
        x: {
          ko: result.x?.ko,
          en: result.x?.en,
        },
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      )
    }

    // Handle OpenAI API errors
    if (error instanceof Error) {
      console.error('Error in generate endpoint:', {
        message: error.message,
        stack: error.stack,
      })

      // Check for specific OpenAI errors
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          {
            error: 'Request timeout',
            message: 'The OpenAI API request timed out. Please try again.',
          },
          { status: 504 }
        )
      }

      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'OpenAI API rate limit exceeded. Please try again later.',
          },
          { status: 429 }
        )
      }

      if (error.message.includes('API key')) {
        return NextResponse.json(
          {
            error: 'Configuration error',
            message: 'OpenAI API key is missing or invalid.',
          },
          { status: 500 }
        )
      }
    }

    console.error('Error in generate endpoint:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred during content generation.',
      },
      { status: 500 }
    )
  }
}
