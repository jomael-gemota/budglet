import { MmrCard } from './MmrCard'

interface RankSheetProps {
  open: boolean
  onClose: () => void
  mmr: number
  delta: number | null
  hasHistory: boolean
}

export function RankSheet({ open, onClose, mmr, delta, hasHistory }: RankSheetProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="
          fixed inset-x-0 bottom-0 z-50
          bg-[#141210] border-t border-surface-border
          rounded-t-2xl
          flex flex-col
          max-h-[92dvh]
          max-w-lg mx-auto
          animate-slide-up
        "
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="text-[#f6deb0] font-semibold text-base">Budget Rank</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors text-lg"
            aria-label="Close rank sheet"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <MmrCard mmr={mmr} delta={delta} hasHistory={hasHistory} />

          {/* Formula footnote */}
          <p className="text-xs text-zinc-600 text-center mt-4 px-2 leading-relaxed">
            MMR is based on completed days only. Under budget earns up to +40 pts,
            over budget loses up to −82. Days with no entries are skipped.
          </p>
        </div>
      </div>
    </>
  )
}
