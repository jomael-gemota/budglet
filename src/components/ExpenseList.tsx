import { format } from 'date-fns'
import type { Expense } from '../types/expense'
import { formatCurrency } from '../utils/calculations'
import { useExpenseStore } from '../store/useExpenseStore'

interface ExpenseListProps {
  expenses: Expense[]
  currency: string
}

export function ExpenseList({ expenses, currency }: ExpenseListProps) {
  const deleteExpense = useExpenseStore((s) => s.deleteExpense)

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-600 text-sm">No expenses today.</p>
        <p className="text-zinc-700 text-xs mt-1">Add one above to get started.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {expenses.map((expense) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          currency={currency}
          onDelete={() => deleteExpense(expense.id)}
        />
      ))}
    </div>
  )
}

interface ExpenseRowProps {
  expense: Expense
  currency: string
  onDelete: () => void
}

function ExpenseRow({ expense, currency, onDelete }: ExpenseRowProps) {
  return (
    <div
      className="
        group flex items-center justify-between
        px-3 py-2.5 rounded-lg
        hover:bg-surface-raised
        transition-colors duration-100
        animate-slide-up
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-zinc-700 text-xs font-mono w-12 shrink-0">
          {format(new Date(expense.timestamp), 'HH:mm')}
        </span>
        <span className="text-zinc-300 text-sm truncate">
          {expense.label || <span className="text-zinc-600 italic">unlabeled</span>}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-white font-mono text-sm font-medium">
          {formatCurrency(expense.amount, currency)}
        </span>
        <button
          onClick={onDelete}
          className="
            opacity-0 group-hover:opacity-100
            text-zinc-600 hover:text-red-400
            transition-all duration-100
            text-xs px-1 py-0.5 rounded
          "
          aria-label="Delete expense"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
