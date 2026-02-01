import { NextResponse } from 'next/server'

interface MonthlyUsage {
  totalTokens: number
  yearMonth: string // e.g. "2026-02"
}

// In-memory store for monthly token usage
let monthlyUsage: MonthlyUsage = {
  totalTokens: 0,
  yearMonth: getCurrentYearMonth(),
}

// Budget configuration
const BUDGET_CONFIG = {
  maxMonthlyTokens: 3_000_000,
} as const

/**
 * Get current year-month string for tracking period
 */
function getCurrentYearMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Reset usage if we've entered a new month
 */
function resetIfNewMonth(): void {
  const currentYearMonth = getCurrentYearMonth()
  if (monthlyUsage.yearMonth !== currentYearMonth) {
    monthlyUsage = {
      totalTokens: 0,
      yearMonth: currentYearMonth,
    }
  }
}

/**
 * Check if the monthly budget ceiling has been reached.
 * Returns null if allowed, or NextResponse with 403 if budget exceeded.
 */
export function checkBudgetCeiling(): NextResponse | null {
  resetIfNewMonth()

  if (monthlyUsage.totalTokens >= BUDGET_CONFIG.maxMonthlyTokens) {
    return NextResponse.json(
      {
        error: 'Budget limit reached',
        message:
          'Monthly budget limit reached. Generation paused until next month.',
      },
      { status: 403 }
    )
  }

  return null
}

/**
 * Record token usage after a successful generation
 */
export function recordTokenUsage(totalTokens: number): void {
  resetIfNewMonth()
  monthlyUsage.totalTokens += totalTokens

  console.log('[Budget Guard]', {
    timestamp: new Date().toISOString(),
    yearMonth: monthlyUsage.yearMonth,
    requestTokens: totalTokens,
    totalUsed: monthlyUsage.totalTokens,
    remaining: Math.max(
      0,
      BUDGET_CONFIG.maxMonthlyTokens - monthlyUsage.totalTokens
    ),
    ceiling: BUDGET_CONFIG.maxMonthlyTokens,
  })
}

/**
 * Get current budget info (useful for testing/debugging)
 */
export function getBudgetInfo(): {
  totalUsed: number
  remaining: number
  ceiling: number
  yearMonth: string
} {
  resetIfNewMonth()
  return {
    totalUsed: monthlyUsage.totalTokens,
    remaining: Math.max(
      0,
      BUDGET_CONFIG.maxMonthlyTokens - monthlyUsage.totalTokens
    ),
    ceiling: BUDGET_CONFIG.maxMonthlyTokens,
    yearMonth: monthlyUsage.yearMonth,
  }
}
