import { format } from 'date-fns'
import type { Expense, RealityCheckResult } from '../types/expense'
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

  // Biggest single item today — behavioral observation, not budget framing
  const todayExpenses = getExpensesForDay(expenses, new Date())
  if (todayExpenses.length > 0) {
    const biggest = todayExpenses.reduce((max, e) => (e.amount > max.amount ? e : max))
    if (biggest.label) {
      return `Your biggest spend today is "${biggest.label}" at ${formatCurrency(biggest.amount, currency)}.`
    }
    return `You've made ${todayExpenses.length} expense${todayExpenses.length > 1 ? 's' : ''} today totalling ${formatCurrency(today, currency)}.`
  }

  return "No spending today. Either you're frugal or forgot to log."
}

export function generateRealityCheck(
  expenses: Expense[],
  dailyBudget: number,
  currency: string
): RealityCheckResult {
  const now = new Date()
  const todayTotal = getDailyTotal(expenses, now)
  const monthlyTotal = getMonthlyTotal(expenses, now)
  const monthlyBudget = getMonthlyBudget(dailyBudget, now)
  const projection = getMonthlyProjection(expenses, now)
  const todayExpenses = getExpensesForDay(expenses, now)
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = daysInMonth - dayOfMonth

  // ── Over daily AND monthly budget ────────────────────────────────────────
  const overDaily = dailyBudget > 0 && todayTotal > dailyBudget
  const overMonthly = monthlyBudget > 0 && monthlyTotal > monthlyBudget

  if (overDaily && overMonthly) {
    const dailyOverage = todayTotal - dailyBudget
    const monthlyOverage = monthlyTotal - monthlyBudget
    const catchUpPerDay = daysLeft > 0
      ? Math.ceil((monthlyOverage) / daysLeft)
      : 0
    return {
      status: `You're ${formatCurrency(dailyOverage, currency)} over today and ${formatCurrency(monthlyOverage, currency)} over your monthly budget.`,
      tip: daysLeft > 0
        ? `To recover by month-end, keep daily spending under ${formatCurrency(Math.max(0, dailyBudget - catchUpPerDay), currency)} for the next ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`
        : `Last day of the month — absorb the overage by skipping all non-essentials today.`,
    }
  }

  // ── Over daily budget only ────────────────────────────────────────────────
  if (overDaily) {
    const overage = todayTotal - dailyBudget
    const biggest = todayExpenses.length > 0
      ? todayExpenses.reduce((max, e) => (e.amount > max.amount ? e : max))
      : null
    return {
      status: `You're ${formatCurrency(overage, currency)} over today's budget.`,
      tip: biggest
        ? `Next time, consider skipping or halving "${biggest.label || 'your biggest item'}" (${formatCurrency(biggest.amount, currency)}) — that alone would keep you within budget.`
        : `Spend nothing more today and trim ${formatCurrency(overage, currency)} from tomorrow's budget to stay on track this week.`,
    }
  }

  // ── Monthly projection is over budget ─────────────────────────────────────
  if (projection > 0 && monthlyBudget > 0 && projection > monthlyBudget) {
    const projectedOverage = projection - monthlyBudget
    const targetDailySpend = daysLeft > 0
      ? Math.floor((monthlyBudget - monthlyTotal) / daysLeft)
      : 0
    return {
      status: `At this pace you'll overspend by ${formatCurrency(projectedOverage, currency)} this month.`,
      tip: daysLeft > 0
        ? `Cap your daily spend at ${formatCurrency(targetDailySpend, currency)} for the remaining ${daysLeft} day${daysLeft > 1 ? 's' : ''} to land exactly on budget.`
        : `Final day of the month — don't spend another cent.`,
    }
  }

  // ── Approaching daily limit ───────────────────────────────────────────────
  if (dailyBudget > 0 && todayTotal > 0) {
    const remaining = dailyBudget - todayTotal
    const pctUsed = todayTotal / dailyBudget

    if (pctUsed >= 0.8) {
      return {
        status: `Only ${formatCurrency(remaining, currency)} left in today's budget.`,
        tip: `Pause all non-essential spending now — one more average purchase will push you over.`,
      }
    }
  }

  // ── On track with projection ──────────────────────────────────────────────
  if (projection > 0 && monthlyBudget > 0) {
    const surplus = monthlyBudget - projection
    return {
      status: `You're projected to finish the month ${formatCurrency(surplus, currency)} under budget.`,
      tip: `Consider moving that surplus to savings before you find a reason to spend it.`,
    }
  }

  // ── Biggest expense context ───────────────────────────────────────────────
  if (todayExpenses.length > 0) {
    const biggest = todayExpenses.reduce((max, e) => (e.amount > max.amount ? e : max))
    return {
      status: `Biggest expense today: "${biggest.label || 'unlabeled'}" at ${formatCurrency(biggest.amount, currency)}.`,
      tip: `If this is a recurring item, log it as a fixed cost and plan the rest of your day around it.`,
    }
  }

  // ── No spending yet ───────────────────────────────────────────────────────
  if (dailyBudget > 0) {
    return {
      status: `Full ${formatCurrency(dailyBudget, currency)} budget still available today.`,
      tip: `Start by planning your known fixed expenses first, then allocate what's left for discretionary spending.`,
    }
  }

  return {
    status: `Start logging expenses to see your reality check.`,
    tip: `Set a daily budget in Settings so Budglet can track your progress against a goal.`,
  }
}

export function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
