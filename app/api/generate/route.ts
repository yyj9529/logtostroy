import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FIELD_LIMITS } from '@/lib/types/form'

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

    const validatedData = validationResult.data

    // TODO: Implement actual generation logic with OpenAI
    // For now, return a placeholder response

    return NextResponse.json(
      {
        message: 'Generation endpoint is ready',
        data: validatedData,
      },
      { status: 200 }
    )
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

    console.error('Error in generate endpoint:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
