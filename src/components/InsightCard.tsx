interface InsightCardProps {
  text: string
  loading?: boolean
  onRefresh?: () => void
}

export function InsightCard({ text, loading = false, onRefresh }: InsightCardProps) {
  return (
    <div className="bg-surface-raised border border-surface-border rounded-xl px-4 py-3.5 flex items-start gap-3">
      <span className="text-accent text-base shrink-0 mt-0.5" aria-hidden>◆</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Today's Insight
          </p>
          {onRefresh && !loading && (
            <button
              onClick={onRefresh}
              className="text-zinc-600 hover:text-accent transition-colors text-xs"
              aria-label="Refresh insight"
              title="Refresh insight"
            >
              ↻
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex flex-col gap-1.5 py-0.5">
            <div className="h-3 bg-zinc-700/60 rounded animate-pulse w-4/5" />
            <div className="h-3 bg-zinc-700/40 rounded animate-pulse w-2/5" />
          </div>
        ) : (
          <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
        )}
      </div>
    </div>
  )
}
