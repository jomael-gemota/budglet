interface BudgetBarProps {
  spent: number
  budget: number
}

export function BudgetBar({ spent, budget }: BudgetBarProps) {
  if (budget <= 0) return null

  const pct = Math.min((spent / budget) * 100, 100)
  const over = spent > budget

  let barColor = 'bg-accent'
  if (pct >= 90) barColor = 'bg-red-500'
  else if (pct >= 70) barColor = 'bg-amber-400'

  return (
    <div className="relative w-full h-1 bg-surface-border rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor} ${over ? 'animate-pulse' : ''}`}
        style={{ width: `${pct}%` }}
      />
      {/* Milestone ticks at 50% and 75% */}
      <div className="absolute w-0.5 bg-white/35 rounded-full" style={{ left: '50%', top: '-2px', bottom: '-2px' }} />
      <div className="absolute w-0.5 bg-white/25 rounded-full" style={{ left: '75%', top: '-1px', bottom: '-1px' }} />
    </div>
  )
}
