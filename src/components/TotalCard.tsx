import { BudgetBar } from './BudgetBar'
import { formatCurrency } from '../utils/calculations'

interface TotalCardProps {
  label: string
  spent: number
  budget: number
  currency: string
}

export function TotalCard({ label, spent, budget, currency }: TotalCardProps) {
  const over = budget > 0 && spent > budget
  const remaining = budget > 0 ? budget - spent : null

  return (
    <div className="flex-1 bg-surface-raised rounded-xl p-4 flex flex-col gap-2.5 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
        {over && (
          <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
            over
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-2xl font-bold font-mono tracking-tight ${
            over ? 'text-red-400' : 'text-white'
          }`}
        >
          {formatCurrency(spent, currency)}
        </span>
        {budget > 0 && (
          <span className="text-sm text-zinc-600 font-mono">
            / {formatCurrency(budget, currency)}
          </span>
        )}
      </div>

      {budget > 0 && (
        <>
          <BudgetBar spent={spent} budget={budget} />
          <p className="text-xs text-zinc-600">
            {over
              ? `${formatCurrency(Math.abs(spent - budget), currency)} over`
              : remaining !== null
              ? `${formatCurrency(remaining, currency)} left`
              : ''}
          </p>
        </>
      )}
    </div>
  )
}
