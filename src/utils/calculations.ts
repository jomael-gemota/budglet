import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  subDays,
  format,
  isSameDay,
} from 'date-fns'
import type { Expense } from '../types/expense'

export function getExpensesForDay(expenses: Expense[], date: Date): Expense[] {
  const start = startOfDay(date).getTime()
  const end = endOfDay(date).getTime()
  return expenses.filter((e) => e.timestamp >= start && e.timestamp <= end)
}

export function getExpensesForMonth(expenses: Expense[], date: Date): Expense[] {
  const start = startOfMonth(date).getTime()
  const end = endOfMonth(date).getTime()
  return expenses.filter((e) => e.timestamp >= start && e.timestamp <= end)
}

export function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((acc, e) => acc + e.amount, 0)
}

export function getDailyTotal(expenses: Expense[], date: Date = new Date()): number {
  return sumExpenses(getExpensesForDay(expenses, date))
}

export function getMonthlyTotal(expenses: Expense[], date: Date = new Date()): number {
  return sumExpenses(getExpensesForMonth(expenses, date))
}

export function getMonthlyBudget(dailyBudget: number, date: Date = new Date()): number {
  return dailyBudget * getDaysInMonth(date)
}

/** Average daily spend over the past N days (excluding today). */
export function getAverageDailySpend(expenses: Expense[], days: number = 7): number {
  const today = new Date()
  let total = 0
  let activeDays = 0

  for (let i = 1; i <= days; i++) {
    const day = subDays(today, i)
    const dayTotal = getDailyTotal(expenses, day)
    if (dayTotal > 0) {
      total += dayTotal
      activeDays++
    }
  }

  return activeDays > 0 ? total / activeDays : 0
}

/** Project end-of-month spend based on current month's daily average. */
export function getMonthlyProjection(expenses: Expense[], date: Date = new Date()): number {
  const daysInMonth = getDaysInMonth(date)
  const dayOfMonth = date.getDate()

  if (dayOfMonth === 0) return 0

  const monthlyTotal = getMonthlyTotal(expenses, date)
  const dailyAvg = monthlyTotal / dayOfMonth
  return dailyAvg * daysInMonth
}

/** Find the biggest single expense label for a given day. */
export function getBiggestExpenseToday(
  expenses: Expense[],
  date: Date = new Date()
): Expense | null {
  const today = getExpensesForDay(expenses, date)
  if (today.length === 0) return null
  return today.reduce((max, e) => (e.amount > max.amount ? e : max))
}

/** Time (formatted) at which the daily budget was first exceeded. */
export function getBudgetExceededTime(
  expenses: Expense[],
  dailyBudget: number,
  date: Date = new Date()
): string | null {
  if (dailyBudget <= 0) return null

  const todayExpenses = getExpensesForDay(expenses, date)
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)

  let running = 0
  for (const e of todayExpenses) {
    running += e.amount
    if (running >= dailyBudget) {
      return format(new Date(e.timestamp), 'h:mm a')
    }
  }
  return null
}

/** Under-budget streak: how many consecutive days including today were under budget. */
export function getUnderBudgetStreak(
  expenses: Expense[],
  dailyBudget: number
): number {
  if (dailyBudget <= 0) return 0

  let streak = 0
  const today = new Date()

  for (let i = 0; i <= 30; i++) {
    const day = subDays(today, i)
    const dayExpenses = getExpensesForDay(expenses, day)

    // Skip days with no recorded expenses unless it's before the first expense ever
    if (dayExpenses.length === 0) {
      const hasAnyExpenseBefore = expenses.some(
        (e) => e.timestamp < startOfDay(day).getTime()
      )
      if (hasAnyExpenseBefore) break
      continue
    }

    const total = sumExpenses(dayExpenses)
    if (total < dailyBudget) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/** Same weekday last week's total. */
export function getSameWeekdayLastWeekTotal(expenses: Expense[]): number {
  const lastWeekSameDay = subDays(new Date(), 7)
  return getDailyTotal(expenses, lastWeekSameDay)
}

export function formatCurrency(amount: number, currency: string): string {
  return `${currency}${amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

export function isTodayDate(timestamp: number): boolean {
  return isSameDay(new Date(timestamp), new Date())
}
