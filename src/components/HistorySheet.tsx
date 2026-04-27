import { useState, useEffect } from 'react'
import { format, subDays, addDays, isToday, startOfDay } from 'date-fns'
import { useExpenseStore } from '../store/useExpenseStore'
import { ExpenseList } from './ExpenseList'
import { BudgetBar } from './BudgetBar'
import { getExpensesForDay, getDailyTotal, formatCurrency } from '../utils/calculations'

export function HistorySheet() {
  const { expenses, settings, historyOpen, setHistoryOpen } = useExpenseStore()
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Reset to today whenever the sheet opens
  useEffect(() => {
    if (historyOpen) setSelectedDate(new Date())
  }, [historyOpen])

  if (!historyOpen) return null

  const dayExpenses = getExpensesForDay(expenses, selectedDate)
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
  const dayTotal = getDailyTotal(expenses, selectedDate)
  const isCurrentDay = isToday(selectedDate)

  // Disable prev when no expenses exist before the start of selectedDate
  const hasPrev = expenses.some(
    (e) => e.timestamp < startOfDay(selectedDate).getTime()
  )
  const hasNext = !isCurrentDay

  const over = settings.dailyBudget > 0 && dayTotal > settings.dailyBudget

  // Group date label
  const dateLabel = isCurrentDay
    ? 'Today'
    : format(selectedDate, 'EEE, MMM d, yyyy')

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
        onClick={() => setHistoryOpen(false)}
      />

      {/* Sheet — tall, scrollable */}
      <div
        className="
          fixed inset-x-0 bottom-0 z-50
          bg-[#111111] border-t border-surface-border
          rounded-t-2xl
          flex flex-col
          max-h-[92dvh]
          max-w-lg mx-auto
          animate-slide-up
        "
      >
        {/* Fixed header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-surface-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-base">Expense Log</h2>
            <button
              onClick={() => setHistoryOpen(false)}
              className="text-zinc-500 hover:text-white transition-colors text-lg"
              aria-label="Close history"
            >
              ✕
            </button>
          </div>

          {/* Date navigator */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setSelectedDate((d) => subDays(d, 1))}
              disabled={!hasPrev}
              className="
                w-8 h-8 flex items-center justify-center rounded-lg
                text-zinc-400 hover:text-white hover:bg-surface-raised
                disabled:opacity-25 disabled:cursor-not-allowed
                transition-colors text-base
              "
              aria-label="Previous day"
            >
              ‹
            </button>

            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-semibold">{dateLabel}</span>
              {!isCurrentDay && (
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="
                    text-xs text-accent border border-accent/30
                    px-2 py-0.5 rounded-md
                    hover:bg-accent/10 transition-colors
                  "
                >
                  Today
                </button>
              )}
            </div>

            <button
              onClick={() => setSelectedDate((d) => addDays(d, 1))}
              disabled={!hasNext}
              className="
                w-8 h-8 flex items-center justify-center rounded-lg
                text-zinc-400 hover:text-white hover:bg-surface-raised
                disabled:opacity-25 disabled:cursor-not-allowed
                transition-colors text-base
              "
              aria-label="Next day"
            >
              ›
            </button>
          </div>

          {/* Daily total summary */}
          {dayTotal > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span
                  className={`text-xl font-bold font-mono ${over ? 'text-red-400' : 'text-white'}`}
                >
                  {formatCurrency(dayTotal, settings.currency)}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {settings.dailyBudget > 0 && (
                    over
                      ? `${formatCurrency(dayTotal - settings.dailyBudget, settings.currency)} over`
                      : `${formatCurrency(settings.dailyBudget - dayTotal, settings.currency)} left`
                  )}
                </span>
              </div>
              {settings.dailyBudget > 0 && (
                <BudgetBar spent={dayTotal} budget={settings.dailyBudget} />
              )}
            </div>
          )}
        </div>

        {/* Scrollable expense list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              {dayExpenses.length > 0
                ? `${dayExpenses.length} ${dayExpenses.length === 1 ? 'entry' : 'entries'}`
                : ''}
            </span>
          </div>
          <ExpenseList
            expenses={dayExpenses}
            currency={settings.currency}
            emptyMessage="No expenses on this day."
            emptySubMessage=""
          />
        </div>
      </div>
    </>
  )
}
