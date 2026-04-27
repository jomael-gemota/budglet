interface RealityCheckProps {
  text: string
}

export function RealityCheck({ text }: RealityCheckProps) {
  return (
    <div className="bg-surface-raised border border-amber-500/20 rounded-xl px-4 py-3.5 flex items-start gap-3">
      <span className="text-amber-400 text-base shrink-0 mt-0.5" aria-hidden>!</span>
      <div>
        <p className="text-xs font-semibold text-amber-500/70 uppercase tracking-wider mb-1">
          Reality Check
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
