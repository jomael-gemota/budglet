export interface Expense {
  id: string
  amount: number
  label: string
  timestamp: number
}

export type Language = 'en' | 'tl' | 'ceb'

export interface BudgetSettings {
  dailyBudget: number
  currency: string
  apiKey: string
  aiEnabled: boolean
  language: Language
}

export interface DailyInsight {
  text: string
  generatedOn: string
}

export interface RealityCheckResult {
  status: string
  tip: string
}
