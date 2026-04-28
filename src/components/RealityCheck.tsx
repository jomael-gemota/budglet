import type { RealityCheckResult } from '../types/expense'

interface RealityCheckProps {
  result: RealityCheckResult
  loading?: boolean
}

export function RealityCheck({ result, loading = false }: RealityCheckProps) {
  return (
    <div className="bg-surface-raised border border-accent/30 rounded-xl px-4 py-3.5 flex items-start gap-3 shadow-[0_12px_28px_rgba(0,0,0,0.32)]">
      <span className="text-accent text-base shrink-0 mt-0.5" aria-hidden>!</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-accent/80 uppercase tracking-wider mb-2">
          Reality Check
        </p>
        {loading ? (
          <div className="flex flex-col gap-2 py-0.5">
            <div className="h-3 bg-amber-900/40 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-amber-900/25 rounded animate-pulse w-1/2" />
            <div className="h-px bg-surface-border my-1" />
            <div className="h-3 bg-zinc-700/40 rounded animate-pulse w-4/5" />
            <div className="h-3 bg-zinc-700/25 rounded animate-pulse w-3/5" />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <p className="text-sm text-zinc-200 leading-relaxed font-medium">
              {result.status}
            </p>
            <div className="flex items-start gap-2 pt-0.5 border-t border-surface-border">
              <span className="text-accent text-xs shrink-0 mt-0.5 font-bold">→</span>
              <p className="text-xs text-zinc-400 leading-relaxed">{result.tip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
