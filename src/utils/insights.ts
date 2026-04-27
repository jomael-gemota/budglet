import { format } from 'date-fns'
import type { Expense, RealityCheckResult, Language } from '../types/expense'
import {
  getDailyTotal,
  getMonthlyTotal,
  getMonthlyBudget,
  getMonthlyProjection,
  getExpensesForDay,
  getAverageDailySpend,
  getSameWeekdayLastWeekTotal,
  getUnderBudgetStreak,
  formatCurrency,
} from './calculations'
import { insightT, realityCheckT, translateDay } from './i18n'

export function generateDailyInsight(
  expenses: Expense[],
  dailyBudget: number,
  currency: string,
  language: Language = 'en',
): string {
  const t = insightT(language)
  const today = getDailyTotal(expenses)
  const avg7 = getAverageDailySpend(expenses, 7)
  const lastWeekSameDay = getSameWeekdayLastWeekTotal(expenses)
  const streak = getUnderBudgetStreak(expenses, dailyBudget)

  if (today === 0 && expenses.length === 0) {
    return t.noData()
  }

  if (streak >= 3) return t.streak(streak)
  if (streak === 2) return t.streak2()

  if (lastWeekSameDay > 0 && today > 0) {
    const diff = today - lastWeekSameDay
    const pct = Math.abs(Math.round((diff / lastWeekSameDay) * 100))
    const day = translateDay(format(new Date(), 'EEEE'), language)

    if (pct >= 20) {
      return diff > 0
        ? t.moreVsLastWeek(pct, day)
        : t.lessVsLastWeek(pct, day)
    }
  }

  if (avg7 > 0 && today > 0) {
    const diff = today - avg7
    const pct = Math.abs(Math.round((diff / avg7) * 100))

    if (pct >= 15) {
      return diff > 0
        ? t.aboveAvg(pct, formatCurrency(avg7, currency))
        : t.belowAvg(pct)
    }
  }

  // Behavioral fallback — biggest item or expense count (never budget-remaining)
  const todayExpenses = getExpensesForDay(expenses, new Date())
  if (todayExpenses.length > 0) {
    const biggest = todayExpenses.reduce((max, e) => (e.amount > max.amount ? e : max))
    if (biggest.label) {
      return t.biggestItem(biggest.label, formatCurrency(biggest.amount, currency))
    }
    return t.multiExpense(todayExpenses.length, formatCurrency(today, currency))
  }

  return t.noSpendingToday()
}

export function generateRealityCheck(
  expenses: Expense[],
  dailyBudget: number,
  currency: string,
  language: Language = 'en',
): RealityCheckResult {
  const t = realityCheckT(language)
  const now = new Date()
  const todayTotal = getDailyTotal(expenses, now)
  const monthlyTotal = getMonthlyTotal(expenses, now)
  const monthlyBudget = getMonthlyBudget(dailyBudget, now)
  const projection = getMonthlyProjection(expenses, now)
  const todayExpenses = getExpensesForDay(expenses, now)
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = daysInMonth - dayOfMonth

  const overDaily = dailyBudget > 0 && todayTotal > dailyBudget
  const overMonthly = monthlyBudget > 0 && monthlyTotal > monthlyBudget

  // ── Over daily AND monthly ────────────────────────────────────────────────
  if (overDaily && overMonthly) {
    const dailyOverage = todayTotal - dailyBudget
    const monthlyOverage = monthlyTotal - monthlyBudget
    const catchUpPerDay = daysLeft > 0 ? Math.ceil(monthlyOverage / daysLeft) : 0
    return {
      status: t.statusOverBoth(
        formatCurrency(dailyOverage, currency),
        formatCurrency(monthlyOverage, currency),
      ),
      tip: daysLeft > 0
        ? t.tipRecoverByMonthEnd(
            formatCurrency(Math.max(0, dailyBudget - catchUpPerDay), currency),
            daysLeft,
          )
        : t.tipLastDayBoth(),
    }
  }

  // ── Over daily only ───────────────────────────────────────────────────────
  if (overDaily) {
    const overage = todayTotal - dailyBudget
    const biggest = todayExpenses.length > 0
      ? todayExpenses.reduce((max, e) => (e.amount > max.amount ? e : max))
      : null
    return {
      status: t.statusOverDaily(formatCurrency(overage, currency)),
      tip: biggest
        ? t.tipSkipBiggest(biggest.label || '—', formatCurrency(biggest.amount, currency))
        : t.tipSpendNothing(formatCurrency(overage, currency)),
    }
  }

  // ── Monthly projection over budget ────────────────────────────────────────
  if (projection > 0 && monthlyBudget > 0 && projection > monthlyBudget) {
    const projectedOverage = projection - monthlyBudget
    const targetDailySpend = daysLeft > 0
      ? Math.floor((monthlyBudget - monthlyTotal) / daysLeft)
      : 0
    return {
      status: t.statusProjectionOver(formatCurrency(projectedOverage, currency)),
      tip: daysLeft > 0
        ? t.tipCapDaily(formatCurrency(targetDailySpend, currency), daysLeft)
        : t.tipFinalDay(),
    }
  }

  // ── Approaching daily limit (>80% used) ───────────────────────────────────
  if (dailyBudget > 0 && todayTotal > 0) {
    const remaining = dailyBudget - todayTotal
    if (todayTotal / dailyBudget >= 0.8) {
      return {
        status: t.statusApproaching(formatCurrency(remaining, currency)),
        tip: t.tipPauseNow(),
      }
    }
  }

  // ── On track — projected surplus ─────────────────────────────────────────
  if (projection > 0 && monthlyBudget > 0) {
    const surplus = monthlyBudget - projection
    return {
      status: t.statusOnTrack(formatCurrency(surplus, currency)),
      tip: t.tipSaveSurplus(),
    }
  }

  // ── Biggest expense context ───────────────────────────────────────────────
  if (todayExpenses.length > 0) {
    const biggest = todayExpenses.reduce((max, e) => (e.amount > max.amount ? e : max))
    return {
      status: t.statusBiggest(biggest.label || '—', formatCurrency(biggest.amount, currency)),
      tip: t.tipRecurring(),
    }
  }

  // ── No spending yet ───────────────────────────────────────────────────────
  if (dailyBudget > 0) {
    return {
      status: t.statusNoSpending(formatCurrency(dailyBudget, currency)),
      tip: t.tipPlanFixed(),
    }
  }

  return {
    status: t.statusFallback(),
    tip: t.tipSetBudget(),
  }
}

export function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
