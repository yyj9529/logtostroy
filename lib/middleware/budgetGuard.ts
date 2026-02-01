import { NextResponse } from 'next/server'
import { getBudgetStatus } from '@/lib/services/budgetTracker'

/**
 * Check if the monthly budget has been exceeded.
 * Returns null if within budget, or a 429 NextResponse if exceeded.
 */
export function checkBudget(): NextResponse | null {
  const status = getBudgetStatus()

  if (!status.isExceeded) {
    return null
  }

  return NextResponse.json(
    {
      error: 'Monthly budget exceeded',
      message: `The monthly LLM budget of $${status.budgetLimitUsd} has been reached. Current spending: $${status.estimatedCostUsd}. Budget resets on ${status.resetsAt}.`,
      budgetStatus: {
        limitUsd: status.budgetLimitUsd,
        spentUsd: status.estimatedCostUsd,
        resetsAt: status.resetsAt,
      },
    },
    {
      status: 429,
      headers: {
        'X-Budget-Remaining': status.budgetRemainingUsd.toString(),
        'X-Budget-Limit': status.budgetLimitUsd.toString(),
        'X-Budget-Reset': status.resetsAt,
      },
    }
  )
}
