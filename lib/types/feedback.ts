export type FeedbackSeverity = 'error' | 'warning' | 'info'

export type FeedbackType =
  | 'tone_violation'
  | 'evidence_missing'
  | 'rate_limit'
  | 'budget_exceeded'
  | 'validation_error'
  | 'api_error'

export interface FeedbackMessage {
  id: string
  type: FeedbackType
  severity: FeedbackSeverity
  title: string
  message: string
  details?: string[]
  dismissable: boolean
  retryAfter?: number // For rate limit (seconds)
  budgetStatus?: {
    limitUsd: number
    spentUsd: number
    resetsAt: string
  }
}

export interface FeedbackMessageProps {
  message: FeedbackMessage
  onDismiss?: (id: string) => void
}
