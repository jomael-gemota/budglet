interface InsightCardProps {
  text: string
}

export function InsightCard({ text }: InsightCardProps) {
  return (
    <div className="bg-surface-raised border border-surface-border rounded-xl px-4 py-3.5 flex items-start gap-3">
      <span className="text-accent text-base shrink-0 mt-0.5" aria-hidden>◆</span>
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
          Today's Insight
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
