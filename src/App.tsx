import { useEffect } from 'react'
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

export default function App() {
  const { expenses, settings, dailyInsight, setDailyInsight, setSettingsOpen } =
    useExpenseStore()

  const today = new Date()
  const todayExpenses = getExpensesForDay(expenses, today)
  const dailyTotal = getDailyTotal(expenses, today)
  const monthlyTotal = getMonthlyTotal(expenses, today)
  const monthlyBudget = getMonthlyBudget(settings.dailyBudget, today)

  // Refresh daily insight once per calendar day
  useEffect(() => {
    const key = todayKey()
    if (!dailyInsight || dailyInsight.generatedOn !== key) {
      const text = generateDailyInsight(expenses, settings.dailyBudget, settings.currency)
      setDailyInsight({ text, generatedOn: key })
    }
  }, [expenses, settings.dailyBudget, settings.currency, dailyInsight, setDailyInsight])

  const realityCheckText = generateRealityCheck(expenses, settings.dailyBudget, settings.currency)
  const insightText = dailyInsight?.text ?? generateDailyInsight(expenses, settings.dailyBudget, settings.currency)

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
          <InsightCard text={insightText} />
          <RealityCheck text={realityCheckText} />
        </div>

        {/* Divider + Today's log */}
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
