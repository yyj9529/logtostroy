export const MONTHLY_LLM_BUDGET = 10 // USD
export const MAX_MONTHLY_TOKENS = 3_000_000

export const TOKEN_PRICING = {
  'gpt-4o-mini': {
    inputPer1M: 0.15, // USD per 1M input tokens
    outputPer1M: 0.6, // USD per 1M output tokens
  },
} as const

export interface UsageEntry {
  timestamp: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  costUsd: number
}

export interface MonthlyUsage {
  month: string // "2026-02"
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCostUsd: number
  requestCount: number
  entries: UsageEntry[]
}

export interface BudgetStatus {
  month: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCostUsd: number
  requestCount: number
  budgetLimitUsd: number
  budgetRemainingUsd: number
  maxMonthlyTokens: number
  tokensRemaining: number
  isExceeded: boolean
  resetsAt: string // ISO date of first day of next month
}
