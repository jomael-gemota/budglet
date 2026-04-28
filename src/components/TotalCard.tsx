import { BudgetBar } from './BudgetBar'
import { formatCurrency } from '../utils/calculations'

interface TotalCardProps {
  label: string
  spent: number
  budget: number
  currency: string
  /** Today card: true when there are expenses and daily total is under budget */
  greenDay?: boolean
  /** Monthly card: true when pace is comfortably under budget */
  onTrack?: boolean
}

export function TotalCard({ label, spent, budget, currency, greenDay = false, onTrack = false }: TotalCardProps) {
  const over = budget > 0 && spent > budget
  const remaining = budget > 0 ? budget - spent : null

  return (
    <div
      className={`flex-1 bg-surface-raised border rounded-xl p-4 flex flex-col gap-2.5 min-w-0 transition-all duration-500 ${
        greenDay
          ? 'border-emerald-500/40 shadow-[0_0_0_1px_rgba(52,211,153,0.12),0_0_18px_rgba(52,211,153,0.08)]'
          : 'border-surface-border shadow-[0_0_0_1px_rgba(242,201,76,0.06)]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
        {over && (
          <span className="text-xs font-semibold text-red-300 bg-red-500/15 px-1.5 py-0.5 rounded">
            over
          </span>
        )}
        {greenDay && !over && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/12 px-1.5 py-0.5 rounded flex items-center gap-0.5">
            ✓ good
          </span>
        )}
        {onTrack && !over && !greenDay && (
          <span className="text-xs font-semibold text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            on track
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-2xl font-bold font-mono tracking-tight ${
            over ? 'text-red-400' : greenDay ? 'text-emerald-300' : 'text-white'
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
              : onTrack && remaining !== null
              ? `saving ~${formatCurrency(remaining, currency)}`
              : remaining !== null
              ? `${formatCurrency(remaining, currency)} left`
              : ''}
          </p>
        </>
      )}
    </div>
  )
}
