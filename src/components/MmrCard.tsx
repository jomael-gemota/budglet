import { TIERS, getTier, getTierIndex, getTierProgress } from '../utils/mmr'

interface MmrCardProps {
  mmr: number
  delta: number | null
  hasHistory: boolean
}

export function MmrCard({ mmr, delta, hasHistory }: MmrCardProps) {
  const currentTier = getTier(mmr)
  const currentTierIdx = getTierIndex(mmr)
  const tierProgress = getTierProgress(mmr)
  const nextTier = currentTierIdx < TIERS.length - 1 ? TIERS[currentTierIdx + 1] : null
  const mmrToNext = nextTier ? nextTier.min - mmr : null

  return (
    <div className="bg-surface-raised border border-surface-border rounded-xl px-4 py-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.28)]">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Budget Rank
        </p>
        {hasHistory && (
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full border ${currentTier.bgColor} ${currentTier.textColor} ${currentTier.borderColor}`}>
            {mmr.toLocaleString()} MMR
          </span>
        )}
      </div>

      {!hasHistory ? (
        /* ── No data yet ── */
        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
          Log at least one full day to earn your rank.
        </p>
      ) : (
        <>
          {/* ── Rank name + delta ── */}
          <div className="flex items-baseline justify-between mb-3">
            <span className={`text-xl font-bold ${currentTier.textColor}`}>
              {currentTier.name}
            </span>
            {delta !== null && (
              <span
                className={`text-xs font-semibold tabular-nums ${
                  delta >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} yesterday
              </span>
            )}
          </div>

          {/* ── Progress bar within current tier ── */}
          {tierProgress !== null && nextTier ? (
            <div className="mb-4">
              <div className="w-full h-1.5 bg-surface-border rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${currentTier.barColor}`}
                  style={{ width: `${Math.max(2, Math.round(tierProgress * 100))}%` }}
                />
              </div>
              <p className="text-xs text-zinc-600">
                {mmrToNext?.toLocaleString()} MMR to{' '}
                <span className={nextTier.textColor}>{nextTier.name}</span>
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <div className="w-full h-1.5 bg-surface-border rounded-full overflow-hidden mb-1.5">
                <div className={`h-full rounded-full ${currentTier.barColor}`} style={{ width: '100%' }} />
              </div>
              <p className={`text-xs ${currentTier.dimTextColor}`}>Maximum rank achieved.</p>
            </div>
          )}
        </>
      )}

      {/* ── Tier Ladder (always visible) ── */}
      <div className="border-t border-surface-border pt-3">
        <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Tier Ladder</p>
        <div className="flex flex-col gap-0.5">
          {[...TIERS].reverse().map((tier, revIdx) => {
            const tierIdx = TIERS.length - 1 - revIdx
            const isCurrent = hasHistory && tierIdx === currentTierIdx
            const isAchieved = hasHistory && tierIdx < currentTierIdx

            return (
              <div
                key={tier.name}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                  isCurrent ? `${tier.bgColor} border ${tier.borderColor}` : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Dot indicator */}
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isCurrent || isAchieved ? tier.dotColor : 'bg-zinc-700'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isCurrent
                        ? tier.textColor
                        : isAchieved
                        ? 'text-zinc-400'
                        : 'text-zinc-600'
                    }`}
                  >
                    {tier.name}
                  </span>
                  {isCurrent && (
                    <span className={`text-xs ${tier.dimTextColor} leading-none`}>← you</span>
                  )}
                </div>

                {/* MMR range */}
                <span className="text-xs font-mono text-zinc-600 tabular-nums">
                  {tier.max === Infinity
                    ? `${tier.min.toLocaleString()}+`
                    : `${tier.min.toLocaleString()}–${tier.max.toLocaleString()}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
