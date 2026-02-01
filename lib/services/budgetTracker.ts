import fs from 'fs'
import path from 'path'
import {
  MONTHLY_LLM_BUDGET,
  MAX_MONTHLY_TOKENS,
  TOKEN_PRICING,
  MonthlyUsage,
  UsageEntry,
  BudgetStatus,
} from '@/lib/types/budget'

const DATA_DIR = path.join(process.cwd(), 'data')
const USAGE_FILE = path.join(DATA_DIR, 'token-usage.json')

function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function getNextMonthReset(): string {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth.toISOString()
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function createEmptyMonthlyUsage(month: string): MonthlyUsage {
  return {
    month,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    estimatedCostUsd: 0,
    requestCount: 0,
    entries: [],
  }
}

function readUsageData(): Record<string, MonthlyUsage> {
  ensureDataDir()
  if (!fs.existsSync(USAGE_FILE)) {
    return {}
  }
  try {
    const raw = fs.readFileSync(USAGE_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeUsageData(data: Record<string, MonthlyUsage>): void {
  ensureDataDir()
  fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export function calculateCost(
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = TOKEN_PRICING['gpt-4o-mini']
  const inputCost = (promptTokens / 1_000_000) * pricing.inputPer1M
  const outputCost = (completionTokens / 1_000_000) * pricing.outputPer1M
  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000
}

export function recordUsage(
  promptTokens: number,
  completionTokens: number,
  totalTokens: number
): void {
  const month = getCurrentMonth()
  const data = readUsageData()

  if (!data[month]) {
    data[month] = createEmptyMonthlyUsage(month)
  }

  const cost = calculateCost(promptTokens, completionTokens)
  const entry: UsageEntry = {
    timestamp: new Date().toISOString(),
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd: cost,
  }

  data[month].promptTokens += promptTokens
  data[month].completionTokens += completionTokens
  data[month].totalTokens += totalTokens
  data[month].estimatedCostUsd =
    Math.round((data[month].estimatedCostUsd + cost) * 1_000_000) / 1_000_000
  data[month].requestCount += 1
  data[month].entries.push(entry)

  writeUsageData(data)
}

export function getMonthlyUsage(month?: string): MonthlyUsage {
  const targetMonth = month || getCurrentMonth()
  const data = readUsageData()
  return data[targetMonth] || createEmptyMonthlyUsage(targetMonth)
}

export function isBudgetExceeded(): boolean {
  const usage = getMonthlyUsage()
  return (
    usage.estimatedCostUsd >= MONTHLY_LLM_BUDGET ||
    usage.totalTokens >= MAX_MONTHLY_TOKENS
  )
}

export function getBudgetStatus(): BudgetStatus {
  const usage = getMonthlyUsage()
  const exceeded =
    usage.estimatedCostUsd >= MONTHLY_LLM_BUDGET ||
    usage.totalTokens >= MAX_MONTHLY_TOKENS

  return {
    month: usage.month,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    estimatedCostUsd: usage.estimatedCostUsd,
    requestCount: usage.requestCount,
    budgetLimitUsd: MONTHLY_LLM_BUDGET,
    budgetRemainingUsd:
      Math.round(
        Math.max(0, MONTHLY_LLM_BUDGET - usage.estimatedCostUsd) * 1_000_000
      ) / 1_000_000,
    maxMonthlyTokens: MAX_MONTHLY_TOKENS,
    tokensRemaining: Math.max(0, MAX_MONTHLY_TOKENS - usage.totalTokens),
    isExceeded: exceeded,
    resetsAt: getNextMonthReset(),
  }
}

export function resetMonthlyUsage(month?: string): void {
  const targetMonth = month || getCurrentMonth()
  const data = readUsageData()
  data[targetMonth] = createEmptyMonthlyUsage(targetMonth)
  writeUsageData(data)
}
