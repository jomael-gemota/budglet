import { format } from 'date-fns'
import type { Expense } from '../types/expense'
import {
  getDailyTotal,
  getAverageDailySpend,
  getSameWeekdayLastWeekTotal,
  getUnderBudgetStreak,
  formatCurrency,
} from './calculations'

export function generateDailyInsight(
  expenses: Expense[],
  dailyBudget: number,
  currency: string
): string {
  const today = getDailyTotal(expenses)
  const avg7 = getAverageDailySpend(expenses, 7)
  const lastWeekSameDay = getSameWeekdayLastWeekTotal(expenses)
  const streak = getUnderBudgetStreak(expenses, dailyBudget)

  // No data yet
  if (today === 0 && expenses.length === 0) {
    return "No spending recorded yet. Add your first expense above."
  }

  // Streak insight (highest priority when meaningful)
  if (streak >= 3) {
    return `${streak} days in a row under budget. Keep it going.`
  }

  if (streak === 2) {
    return `2 days under budget in a row. Tomorrow makes it a streak.`
  }

  // Compare vs same weekday last week
  if (lastWeekSameDay > 0 && today > 0) {
    const diff = today - lastWeekSameDay
    const pct = Math.abs(Math.round((diff / lastWeekSameDay) * 100))

    if (pct >= 20) {
      if (diff > 0) {
        return `You're spending ${pct}% more than last ${format(new Date(), 'EEEE')}.`
      } else {
        return `You're spending ${pct}% less than last ${format(new Date(), 'EEEE')}. Nice.`
      }
    }
  }

  // Compare vs 7-day average
  if (avg7 > 0 && today > 0) {
    const diff = today - avg7
    const pct = Math.abs(Math.round((diff / avg7) * 100))

    if (pct >= 15) {
      if (diff > 0) {
        return `Today is ${pct}% above your 7-day average (${formatCurrency(avg7, currency)}/day).`
      } else {
        return `Today is ${pct}% below your 7-day average. Light day.`
      }
    }
  }

  // Budget-based insight
  if (dailyBudget > 0 && today > 0) {
    const remaining = dailyBudget - today
    if (remaining < 0) {
      return `You're ${formatCurrency(Math.abs(remaining), currency)} over today's budget.`
    }
    if (remaining < dailyBudget * 0.2) {
      return `Only ${formatCurrency(remaining, currency)} left in today's budget.`
    }
    if (today < dailyBudget * 0.3) {
      return `You've only spent ${formatCurrency(today, currency)} today. Solid restraint.`
    }
  }

  // Fallback: neutral summary
  if (today > 0) {
    return `You've logged ${formatCurrency(today, currency)} today.`
  }

  return "No spending today. Either you're frugal or forgot to log."
}

export function generateRealityCheck(
  expenses: Expense[],
  dailyBudget: number,
  currency: string
): string {
  const today = getDailyTotal(expenses)
  const now = new Date()

  // Over budget: show time it happened
  if (dailyBudget > 0 && today > dailyBudget) {
    const overage = today - dailyBudget
    return `You're ${formatCurrency(overage, currency)} over today's budget.`
  }

  // Monthly projection
  const dayOfMonth = now.getDate()
  if (dayOfMonth >= 3) {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthExpenses = expenses.filter((e) => e.timestamp >= monthStart.getTime())
    const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0)

    if (monthTotal > 0) {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const projected = Math.round((monthTotal / dayOfMonth) * daysInMonth)
      return `At this pace, you'll spend ${formatCurrency(projected, currency)} this month.`
    }
  }

  // Biggest expense today
  const todayExpenses = expenses.filter((e) => {
    const d = new Date(e.timestamp)
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    )
  })

  if (todayExpenses.length > 0) {
    const biggest = todayExpenses.reduce((max, e) => (e.amount > max.amount ? e : max))
    if (biggest.label) {
      return `Biggest expense today: "${biggest.label}" at ${formatCurrency(biggest.amount, currency)}.`
    }
    return `Single biggest expense today: ${formatCurrency(biggest.amount, currency)}.`
  }

  // Nothing spent yet today
  if (today === 0 && dailyBudget > 0) {
    return `Full ${formatCurrency(dailyBudget, currency)} budget still available today.`
  }

  return "Start logging to see your reality check."
}

export function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
