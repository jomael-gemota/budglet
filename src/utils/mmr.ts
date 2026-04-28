import { subDays, startOfDay } from 'date-fns'
import { getExpensesForDay, sumExpenses } from './calculations'
import type { Expense } from '../types/expense'

export interface Tier {
  name: string
  min: number
  max: number
  textColor: string
  bgColor: string
  barColor: string
  dotColor: string
  borderColor: string
  dimTextColor: string
}

export const TIERS: Tier[] = [
  {
    name: 'Gastos Mode',
    min: 0,    max: 399,
    textColor:    'text-red-400',
    bgColor:      'bg-red-500/10',
    barColor:     'bg-red-500',
    dotColor:     'bg-red-400',
    borderColor:  'border-red-400/25',
    dimTextColor: 'text-red-400/50',
  },
  {
    name: 'Tipid-Tipid Pa',
    min: 400,  max: 699,
    textColor:    'text-orange-400',
    bgColor:      'bg-orange-500/10',
    barColor:     'bg-orange-500',
    dotColor:     'bg-orange-400',
    borderColor:  'border-orange-400/25',
    dimTextColor: 'text-orange-400/50',
  },
  {
    name: 'Sinisikap',
    min: 700,  max: 999,
    textColor:    'text-yellow-400',
    bgColor:      'bg-yellow-500/10',
    barColor:     'bg-yellow-400',
    dotColor:     'bg-yellow-400',
    borderColor:  'border-yellow-400/25',
    dimTextColor: 'text-yellow-400/50',
  },
  {
    name: 'Maayos Na',
    min: 1000, max: 1299,
    textColor:    'text-lime-400',
    bgColor:      'bg-lime-500/10',
    barColor:     'bg-lime-500',
    dotColor:     'bg-lime-400',
    borderColor:  'border-lime-400/25',
    dimTextColor: 'text-lime-400/50',
  },
  {
    name: 'Ipon Warrior',
    min: 1300, max: 1599,
    textColor:    'text-cyan-400',
    bgColor:      'bg-cyan-500/10',
    barColor:     'bg-cyan-500',
    dotColor:     'bg-cyan-400',
    borderColor:  'border-cyan-400/25',
    dimTextColor: 'text-cyan-400/50',
  },
  {
    name: 'Kuripot God',
    min: 1600, max: Infinity,
    textColor:    'text-violet-400',
    bgColor:      'bg-violet-500/10',
    barColor:     'bg-violet-500',
    dotColor:     'bg-violet-400',
    borderColor:  'border-violet-400/25',
    dimTextColor: 'text-violet-400/50',
  },
]

export const STARTING_MMR = 0
const BASE_GAIN = 40
const BASE_LOSS = 55

export function getTier(mmr: number): Tier {
  return TIERS.find((t) => mmr >= t.min && mmr <= t.max) ?? TIERS[0]
}

export function getTierIndex(mmr: number): number {
  return TIERS.findIndex((t) => mmr >= t.min && mmr <= t.max)
}

/** Progress within the current tier as 0–1. Returns null for the max tier. */
export function getTierProgress(mmr: number): number | null {
  const tier = getTier(mmr)
  if (tier.max === Infinity) return null
  return (mmr - tier.min) / (tier.max + 1 - tier.min)
}

/**
 * Compute MMR from all fully completed days (yesterday and earlier).
 * Days with no logged expenses are skipped — no reward for absence.
 * Returns the final MMR and yesterday's point delta (null if no data).
 */
export function computeMmr(
  expenses: Expense[],
  dailyBudget: number,
  lookbackDays = 90
): { mmr: number; delta: number | null; hasHistory: boolean } {
  if (dailyBudget <= 0) return { mmr: STARTING_MMR, delta: null, hasHistory: false }

  const today = new Date()
  const todayStart = startOfDay(today).getTime()
  const hasHistory = expenses.some((e) => e.timestamp < todayStart)

  if (!hasHistory) return { mmr: STARTING_MMR, delta: null, hasHistory: false }

  let mmr = STARTING_MMR

  // Oldest → newest so MMR clamps to 0 correctly along the way
  for (let i = lookbackDays; i >= 1; i--) {
    const day = subDays(today, i)
    const dayExpenses = getExpensesForDay(expenses, day)
    if (dayExpenses.length === 0) continue

    const spent = sumExpenses(dayExpenses)
    const ratio = spent / dailyBudget

    if (ratio < 1) {
      mmr += Math.round(BASE_GAIN * (1 - ratio))
    } else {
      mmr -= Math.round(BASE_LOSS * Math.min(ratio - 1, 1.5))
    }

    mmr = Math.max(0, mmr)
  }

  // Yesterday's individual contribution for the delta indicator
  const yesterday = subDays(today, 1)
  const yExp = getExpensesForDay(expenses, yesterday)
  let delta: number | null = null

  if (yExp.length > 0) {
    const spent = sumExpenses(yExp)
    const ratio = spent / dailyBudget
    delta =
      ratio < 1
        ? Math.round(BASE_GAIN * (1 - ratio))
        : -Math.round(BASE_LOSS * Math.min(ratio - 1, 1.5))
  }

  return { mmr, delta, hasHistory: true }
}
