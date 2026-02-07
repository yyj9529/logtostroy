import type { FeedbackMessage } from '@/lib/types/feedback'

/**
 * Generate a unique ID for feedback messages
 */
function generateId(): string {
  return `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a tone violation feedback message
 */
export function createToneViolationMessage(
  warnings: string[]
): FeedbackMessage {
  return {
    id: generateId(),
    type: 'tone_violation',
    severity: 'warning',
    title: 'Tone Violation Detected',
    message:
      'The following hype words were detected and neutralized in your content:',
    details: warnings,
    dismissable: true,
  }
}

/**
 * Create an evidence missing feedback message
 */
export function createEvidenceMissingMessage(): FeedbackMessage {
  return {
    id: generateId(),
    type: 'evidence_missing',
    severity: 'info',
    title: 'No Evidence Provided',
    message:
      'You did not provide evidence (before/after metrics). The generated content avoids numeric claims to maintain accuracy.',
    dismissable: true,
  }
}

/**
 * Create a rate limit exceeded feedback message
 */
export function createRateLimitMessage(retryAfter?: number): FeedbackMessage {
  return {
    id: generateId(),
    type: 'rate_limit',
    severity: 'error',
    title: 'Rate Limit Exceeded',
    message:
      'Too many requests from this IP address. Maximum 3 requests per hour allowed.',
    retryAfter,
    dismissable: false,
  }
}

/**
 * Create a budget exceeded feedback message
 */
export function createBudgetExceededMessage(budgetStatus?: {
  limitUsd: number
  spentUsd: number
  resetsAt: string
}): FeedbackMessage {
  return {
    id: generateId(),
    type: 'budget_exceeded',
    severity: 'error',
    title: 'Monthly Budget Exceeded',
    message: 'The monthly LLM budget has been reached. Generation is disabled until the budget resets.',
    budgetStatus,
    dismissable: false,
  }
}

/**
 * Create a validation error feedback message
 */
export function createValidationErrorMessage(message: string): FeedbackMessage {
  return {
    id: generateId(),
    type: 'validation_error',
    severity: 'error',
    title: 'Validation Error',
    message,
    dismissable: true,
  }
}

/**
 * Create a generic API error feedback message
 */
export function createApiErrorMessage(message: string): FeedbackMessage {
  return {
    id: generateId(),
    type: 'api_error',
    severity: 'error',
    title: 'Error',
    message,
    dismissable: true,
  }
}

/**
 * Parse API error response and create appropriate feedback message
 */
export function parseApiError(errorData: {
  error?: string
  message?: string
  retryAfter?: number
  budgetStatus?: {
    limitUsd: number
    spentUsd: number
    resetsAt: string
  }
}): FeedbackMessage {
  const errorType = errorData.error?.toLowerCase() || ''

  if (errorType.includes('rate limit')) {
    return createRateLimitMessage(errorData.retryAfter)
  }

  if (errorType.includes('budget')) {
    return createBudgetExceededMessage(errorData.budgetStatus)
  }

  if (errorType.includes('validation')) {
    return createValidationErrorMessage(
      errorData.message || 'Validation failed'
    )
  }

  return createApiErrorMessage(
    errorData.message || 'An error occurred while generating content'
  )
}
