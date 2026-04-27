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

/** Prefixes a name naturally: "Jomael, you're over budget." */
function withName(text: string, name: string): string {
  if (!name.trim()) return text
  const n = name.trim()
  return `${n}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`
}

export function generateDailyInsight(
  expenses: Expense[],
  dailyBudget: number,
  currency: string,
  language: Language = 'en',
  name = '',
): string {
  const t = insightT(language)
  const today = getDailyTotal(expenses)
  const avg7 = getAverageDailySpend(expenses, 7)
  const lastWeekSameDay = getSameWeekdayLastWeekTotal(expenses)
  const streak = getUnderBudgetStreak(expenses, dailyBudget)

  const say = (text: string) => withName(text, name)

  if (today === 0 && expenses.length === 0) {
    return say(t.noData())
  }

  if (streak >= 3) return say(t.streak(streak))
  if (streak === 2) return say(t.streak2())

  if (lastWeekSameDay > 0 && today > 0) {
    const diff = today - lastWeekSameDay
    const pct = Math.abs(Math.round((diff / lastWeekSameDay) * 100))
    const day = translateDay(format(new Date(), 'EEEE'), language)

    if (pct >= 20) {
      return say(diff > 0 ? t.moreVsLastWeek(pct, day) : t.lessVsLastWeek(pct, day))
    }
  }

  if (avg7 > 0 && today > 0) {
    const diff = today - avg7
    const pct = Math.abs(Math.round((diff / avg7) * 100))

    if (pct >= 15) {
      return say(diff > 0
        ? t.aboveAvg(pct, formatCurrency(avg7, currency))
        : t.belowAvg(pct))
    }
  }

  // Behavioral fallback — biggest item or expense count (never budget-remaining)
  const todayExpenses = getExpensesForDay(expenses, new Date())
  if (todayExpenses.length > 0) {
    const biggest = todayExpenses.reduce((max, e) => (e.amount > max.amount ? e : max))
    if (biggest.label) {
      return say(t.biggestItem(biggest.label, formatCurrency(biggest.amount, currency)))
    }
    return say(t.multiExpense(todayExpenses.length, formatCurrency(today, currency)))
  }

  return say(t.noSpendingToday())
}

export function generateRealityCheck(
  expenses: Expense[],
  dailyBudget: number,
  currency: string,
  language: Language = 'en',
  name = '',
): RealityCheckResult {
  const t = realityCheckT(language)
  const status = (text: string) => withName(text, name)
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

  // Severity: how far over the daily budget (ratio, e.g. 0.5 = 50% over)
  const overDailyRatio = dailyBudget > 0 ? (todayTotal - dailyBudget) / dailyBudget : 0
  const severe = overDailyRatio > 0.5

  // ── Over daily AND monthly ────────────────────────────────────────────────
  if (overDaily && overMonthly) {
    const dailyOverage = todayTotal - dailyBudget
    const monthlyOverage = monthlyTotal - monthlyBudget
    const catchUpPerDay = daysLeft > 0 ? Math.ceil(monthlyOverage / daysLeft) : 0
    const underPerDay = formatCurrency(Math.max(0, dailyBudget - catchUpPerDay), currency)
    return {
      status: status(severe
        ? t.statusOverBothSevere(
            formatCurrency(dailyOverage, currency),
            formatCurrency(monthlyOverage, currency),
          )
        : t.statusOverBoth(
            formatCurrency(dailyOverage, currency),
            formatCurrency(monthlyOverage, currency),
          )
      ),
      tip: daysLeft > 0
        ? (severe ? t.tipRecoverEmergency(underPerDay, daysLeft) : t.tipRecoverByMonthEnd(underPerDay, daysLeft))
        : (severe ? t.tipLastDayBothSevere() : t.tipLastDayBoth()),
    }
  }

  // ── Over daily only ───────────────────────────────────────────────────────
  if (overDaily) {
    const overage = todayTotal - dailyBudget
    const overPct = Math.round(overDailyRatio * 100)
    const biggest = todayExpenses.length > 0
      ? todayExpenses.reduce((max, e) => (e.amount > max.amount ? e : max))
      : null
    return {
      status: status(severe
        ? t.statusOverDailySevere(formatCurrency(overage, currency), overPct)
        : t.statusOverDaily(formatCurrency(overage, currency))
      ),
      tip: severe
        ? t.tipShutItDown()
        : biggest
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
      status: status(t.statusProjectionOver(formatCurrency(projectedOverage, currency))),
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
        status: status(t.statusApproaching(formatCurrency(remaining, currency))),
        tip: t.tipPauseNow(),
      }
    }
  }

  // ── On track — projected surplus ─────────────────────────────────────────
  if (projection > 0 && monthlyBudget > 0) {
    const surplus = monthlyBudget - projection
    return {
      status: status(t.statusOnTrack(formatCurrency(surplus, currency))),
      tip: t.tipSaveSurplus(),
    }
  }

  // ── Biggest expense context ───────────────────────────────────────────────
  if (todayExpenses.length > 0) {
    const biggest = todayExpenses.reduce((max, e) => (e.amount > max.amount ? e : max))
    return {
      status: status(t.statusBiggest(biggest.label || '—', formatCurrency(biggest.amount, currency))),
      tip: t.tipRecurring(),
    }
  }

  // ── No spending yet ───────────────────────────────────────────────────────
  if (dailyBudget > 0) {
    return {
      status: status(t.statusNoSpending(formatCurrency(dailyBudget, currency))),
      tip: t.tipPlanFixed(),
    }
  }

  return {
    status: status(t.statusFallback()),
    tip: t.tipSetBudget(),
  }
}

export function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
