import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { useExpenseStore } from './store/useExpenseStore'
import { ExpenseInput } from './components/ExpenseInput'
import { TotalCard } from './components/TotalCard'
import { ExpenseList } from './components/ExpenseList'
import { InsightCard } from './components/InsightCard'
import { RealityCheck } from './components/RealityCheck'
import { SettingsSheet } from './components/SettingsSheet'
import {
  getDailyTotal,
  getMonthlyTotal,
  getMonthlyBudget,
  getExpensesForDay,
} from './utils/calculations'
import { generateDailyInsight, generateRealityCheck, todayKey } from './utils/insights'
import {
  fetchGptText,
  fetchGptRealityCheck,
  buildInsightPrompt,
  buildRealityCheckPrompt,
} from './utils/openai'

export default function App() {
  const {
    expenses,
    settings,
    dailyInsight,
    realityCheck,
    insightLoading,
    realityCheckLoading,
    setDailyInsight,
    setRealityCheck,
    setInsightLoading,
    setRealityCheckLoading,
    setSettingsOpen,
  } = useExpenseStore()

  const today = new Date()
  const todayExpenses = getExpensesForDay(expenses, today)
  const dailyTotal = getDailyTotal(expenses, today)
  const monthlyTotal = getMonthlyTotal(expenses, today)
  const monthlyBudget = getMonthlyBudget(settings.dailyBudget, today)

  // ── Daily Insight ───────────────────────────────────────────────────────────
  const insightDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerInsight = (force = false) => {
    const key = todayKey()
    const ctx = {
      expenses,
      dailyBudget: settings.dailyBudget,
      currency: settings.currency,
      language: settings.language,
    }

    if (settings.apiKey) {
      // GPT mode: once per day, but re-run if forced or if no real data was cached yet
      const alreadyCached =
        !force && dailyInsight?.generatedOn === key && expenses.length > 0
      if (alreadyCached) return

      if (insightDebounceRef.current) clearTimeout(insightDebounceRef.current)
      setInsightLoading(true)
      insightDebounceRef.current = setTimeout(() => {
        fetchGptText(buildInsightPrompt(ctx), settings.apiKey)
          .then((text) => setDailyInsight({ text, generatedOn: key }))
          .catch(() =>
            setDailyInsight({
              text: generateDailyInsight(expenses, settings.dailyBudget, settings.currency, settings.language),
              generatedOn: key,
            })
          )
          .finally(() => setInsightLoading(false))
      }, 600)
    } else {
      // Rule-based: always live, no API cost
      setDailyInsight({
        text: generateDailyInsight(expenses, settings.dailyBudget, settings.currency, settings.language),
        generatedOn: key,
      })
    }
  }

  useEffect(() => {
    triggerInsight()
    return () => {
      if (insightDebounceRef.current) clearTimeout(insightDebounceRef.current)
    }
  // Re-run whenever expenses or settings change so the insight stays current.
  // For GPT mode the alreadyCached guard prevents redundant API calls.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, settings.dailyBudget, settings.currency, settings.apiKey, settings.language])

  // ── Reality Check (debounced, re-runs on every expense change) ──────────────
  const realityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (realityDebounceRef.current) clearTimeout(realityDebounceRef.current)

    const ctx = {
      expenses,
      dailyBudget: settings.dailyBudget,
      currency: settings.currency,
      language: settings.language,
    }

    if (settings.apiKey) {
      setRealityCheckLoading(true)
      realityDebounceRef.current = setTimeout(() => {
        fetchGptRealityCheck(buildRealityCheckPrompt(ctx), settings.apiKey)
          .then((result) => setRealityCheck(result))
          .catch(() =>
            setRealityCheck(
              generateRealityCheck(expenses, settings.dailyBudget, settings.currency, settings.language)
            )
          )
          .finally(() => setRealityCheckLoading(false))
      }, 1500)
    } else {
      setRealityCheckLoading(false)
      setRealityCheck(
        generateRealityCheck(expenses, settings.dailyBudget, settings.currency, settings.language)
      )
    }

    return () => {
      if (realityDebounceRef.current) clearTimeout(realityDebounceRef.current)
    }
  }, [expenses, settings.dailyBudget, settings.currency, settings.apiKey, settings.language]) // eslint-disable-line react-hooks/exhaustive-deps

  const insightText =
    dailyInsight?.text ??
    generateDailyInsight(expenses, settings.dailyBudget, settings.currency, settings.language)

  const realityResult =
    realityCheck ??
    generateRealityCheck(expenses, settings.dailyBudget, settings.currency, settings.language)

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-surface-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold text-lg font-mono">B</span>
          <span className="text-white font-semibold text-base tracking-tight">budglet</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-xs font-mono">
            {format(today, 'EEE, MMM d')}
          </span>
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-zinc-500 hover:text-white transition-colors p-1"
            aria-label="Open settings"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path
                d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col gap-5 px-4 py-5 max-w-lg mx-auto w-full">
        {/* Input */}
        <ExpenseInput />

        {/* Totals row */}
        <div className="flex gap-3">
          <TotalCard
            label="Today"
            spent={dailyTotal}
            budget={settings.dailyBudget}
            currency={settings.currency}
          />
          <TotalCard
            label="This month"
            spent={monthlyTotal}
            budget={monthlyBudget}
            currency={settings.currency}
          />
        </div>

        {/* Insight + Reality Check */}
        <div className="flex flex-col gap-2.5">
          <InsightCard
            text={insightText}
            loading={insightLoading}
            onRefresh={settings.apiKey ? () => triggerInsight(true) : undefined}
          />
          <RealityCheck result={realityResult} loading={realityCheckLoading} />
        </div>

        {/* Today's log */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Today's log
            </h2>
            {todayExpenses.length > 0 && (
              <span className="text-xs text-zinc-600 font-mono">
                {todayExpenses.length} {todayExpenses.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>
          <ExpenseList expenses={todayExpenses} currency={settings.currency} />
        </div>
      </main>

      {/* Settings sheet */}
      <SettingsSheet />
    </div>
  )
}
