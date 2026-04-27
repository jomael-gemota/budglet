export interface Expense {
  id: string
  amount: number
  label: string
  timestamp: number
}

export interface BudgetSettings {
  dailyBudget: number
  currency: string
  apiKey: string
}

export interface DailyInsight {
  text: string
  generatedOn: string
}

export interface RealityCheckResult {
  status: string
  tip: string
}
