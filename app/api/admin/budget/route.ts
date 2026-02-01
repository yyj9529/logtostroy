import { NextResponse } from 'next/server'
import {
  getBudgetStatus,
  resetMonthlyUsage,
} from '@/lib/services/budgetTracker'

export async function GET() {
  const status = getBudgetStatus()
  return NextResponse.json(status, { status: 200 })
}

export async function POST() {
  resetMonthlyUsage()
  const status = getBudgetStatus()
  return NextResponse.json(
    { message: 'Monthly usage has been reset', budgetStatus: status },
    { status: 200 }
  )
}
