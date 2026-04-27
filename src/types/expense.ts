export interface Expense {
  id: string
  amount: number
  label: string
  timestamp: number
}

export interface BudgetSettings {
  dailyBudget: number
  currency: string
}

export interface DailyInsight {
  text: string
  generatedOn: string
}
