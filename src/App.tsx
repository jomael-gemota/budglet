import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { useExpenseStore } from './store/useExpenseStore'
import { ExpenseInput } from './components/ExpenseInput'
import { TotalCard } from './components/TotalCard'
import { ExpenseList } from './components/ExpenseList'
import { InsightCard } from './components/InsightCard'
import { RealityCheck } from './components/RealityCheck'
import { SettingsSheet } from './components/SettingsSheet'
import { HistorySheet } from './components/HistorySheet'
import { OnboardingOverlay } from './components/OnboardingOverlay'
import { RankSheet } from './components/RankSheet'
import {
  getDailyTotal,
  getMonthlyTotal,
  getMonthlyBudget,
  getExpensesForDay,
  getUnderBudgetStreak,
} from './utils/calculations'
import { computeMmr, getTier } from './utils/mmr'
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
    setHistoryOpen,
    logout,
  } = useExpenseStore()

  const today = new Date()
  const todayExpenses = getExpensesForDay(expenses, today)
  const dailyTotal = getDailyTotal(expenses, today)
  const monthlyTotal = getMonthlyTotal(expenses, today)
  const monthlyBudget = getMonthlyBudget(settings.dailyBudget, today)
  const streak = getUnderBudgetStreak(expenses, settings.dailyBudget)

  const isGreenDay =
    settings.dailyBudget > 0 &&
    todayExpenses.length > 0 &&
    dailyTotal < settings.dailyBudget

  const dayOfMonth = today.getDate()
  const isMonthlyOnTrack =
    settings.dailyBudget > 0 &&
    dayOfMonth > 1 &&
    monthlyTotal < settings.dailyBudget * dayOfMonth * 0.85

  const { mmr, delta, hasHistory } = computeMmr(expenses, settings.dailyBudget)
  const currentTier = getTier(mmr)
  const [rankOpen, setRankOpen] = useState(false)

  // ── Daily Insight ───────────────────────────────────────────────────────────
  const insightDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerInsight = (force = false) => {
    const key = todayKey()
    const ctx = {
      expenses,
      dailyBudget: settings.dailyBudget,
      currency: settings.currency,
      language: settings.language,
      name: settings.name,
    }

    if (settings.apiKey && settings.aiEnabled) {
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
              text: generateDailyInsight(expenses, settings.dailyBudget, settings.currency, settings.language, settings.name),
              generatedOn: key,
            })
          )
          .finally(() => setInsightLoading(false))
      }, 600)
    } else {
      // Rule-based: always live, no API cost
      setDailyInsight({
        text: generateDailyInsight(expenses, settings.dailyBudget, settings.currency, settings.language, settings.name),
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
  }, [expenses, settings.dailyBudget, settings.currency, settings.apiKey, settings.aiEnabled, settings.language])

  // ── Reality Check (debounced, re-runs on every expense change) ──────────────
  const realityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (realityDebounceRef.current) clearTimeout(realityDebounceRef.current)

    const ctx = {
      expenses,
      dailyBudget: settings.dailyBudget,
      currency: settings.currency,
      language: settings.language,
      name: settings.name,
    }

    if (settings.apiKey && settings.aiEnabled) {
      setRealityCheckLoading(true)
      realityDebounceRef.current = setTimeout(() => {
        fetchGptRealityCheck(buildRealityCheckPrompt(ctx), settings.apiKey)
          .then((result) => setRealityCheck(result))
          .catch(() =>
            setRealityCheck(
              generateRealityCheck(expenses, settings.dailyBudget, settings.currency, settings.language, settings.name)
            )
          )
          .finally(() => setRealityCheckLoading(false))
      }, 1500)
    } else {
      setRealityCheckLoading(false)
      setRealityCheck(
        generateRealityCheck(expenses, settings.dailyBudget, settings.currency, settings.language, settings.name)
      )
    }

    return () => {
      if (realityDebounceRef.current) clearTimeout(realityDebounceRef.current)
    }
  }, [expenses, settings.dailyBudget, settings.currency, settings.apiKey, settings.aiEnabled, settings.language]) // eslint-disable-line react-hooks/exhaustive-deps

  const insightText =
    dailyInsight?.text ??
    generateDailyInsight(expenses, settings.dailyBudget, settings.currency, settings.language, settings.name)

  const realityResult =
    realityCheck ??
    generateRealityCheck(expenses, settings.dailyBudget, settings.currency, settings.language, settings.name)

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/92 backdrop-blur-sm border-b border-surface-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-accent/35 shadow-[0_0_20px_rgba(242,201,76,0.18)]">
            <img src="/budglet-logo.png" alt="Budglet logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[#f6deb0] font-semibold text-base tracking-tight">budglet</span>
            {settings.name && (
              <span className="text-zinc-400 text-xs">
                Hey, {settings.name}
                {hasHistory && (
                  <>
                    {' '}·{' '}
                    <span className={`font-medium ${currentTier.textColor}`}>
                      {currentTier.name}
                    </span>
                    <span className="text-zinc-600 font-mono"> MMR: {mmr.toLocaleString()}</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <span
              className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20"
              title={`${streak}-day under-budget streak`}
            >
              🔥 {streak}
            </span>
          )}
          <span className="text-zinc-600 text-xs font-mono mr-1">
            {format(today, 'EEE, MMM d')}
          </span>
          {/* Budget Rank */}
          <button
            onClick={() => setRankOpen(true)}
            className="text-zinc-500 hover:text-accent transition-colors p-1"
            aria-label="View budget rank"
            title="Budget Rank"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 8H4l2 8h12l2-8h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 16l1 4m5-4-1 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M8 20h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>

          {/* History */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="text-zinc-500 hover:text-accent transition-colors p-1"
            aria-label="View expense history"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5 10h2M9 10h2M5 12.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {/* Settings — cogs icon */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-zinc-500 hover:text-accent transition-colors p-1"
            aria-label="Open settings"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
            aria-label="Logout"
            title="Logout"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
              <polyline
                points="16 17 21 12 16 7"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
              <line
                x1="21" y1="12" x2="9" y2="12"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
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
            greenDay={isGreenDay}
          />
          <TotalCard
            label="This month"
            spent={monthlyTotal}
            budget={monthlyBudget}
            currency={settings.currency}
            onTrack={isMonthlyOnTrack}
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

        {/* Android app download */}
        <div className="flex justify-center pb-2">
          <a
            href="/budglet.apk"
            download="budglet.apk"
            className="flex items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-400 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16l-5-5h3V4h4v7h3l-5 5Z" fill="currentColor"/>
              <path d="M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Download Android app
          </a>
        </div>
      </main>

      {/* Settings sheet */}
      <SettingsSheet />

      {/* History sheet */}
      <HistorySheet />

      {/* Rank sheet */}
      <RankSheet
        open={rankOpen}
        onClose={() => setRankOpen(false)}
        mmr={mmr}
        delta={delta}
        hasHistory={hasHistory}
      />

      {/* First-run onboarding */}
      <OnboardingOverlay />
    </div>
  )
}
