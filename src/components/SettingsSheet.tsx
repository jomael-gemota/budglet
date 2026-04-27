import { useState, useEffect } from 'react'
import { useExpenseStore } from '../store/useExpenseStore'

export function SettingsSheet() {
  const { settings, settingsOpen, updateSettings, setSettingsOpen } = useExpenseStore()
  const [budget, setBudget] = useState(String(settings.dailyBudget))
  const [currency, setCurrency] = useState(settings.currency)

  useEffect(() => {
    if (settingsOpen) {
      setBudget(String(settings.dailyBudget))
      setCurrency(settings.currency)
    }
  }, [settingsOpen, settings.dailyBudget, settings.currency])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(budget)
    if (!isNaN(parsed) && parsed > 0) {
      updateSettings({ dailyBudget: parsed, currency: currency.trim() || '₱' })
    }
    setSettingsOpen(false)
  }

  if (!settingsOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
        onClick={() => setSettingsOpen(false)}
      />

      {/* Sheet */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-50
          bg-[#161616] border-t border-surface-border
          rounded-t-2xl px-5 py-6
          animate-slide-up
          max-w-lg mx-auto
        "
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-base">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="text-zinc-500 hover:text-white transition-colors text-lg"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Daily Budget
            </label>
            <div className="flex items-center gap-2 bg-surface-raised border border-surface-border rounded-xl px-4 py-3 focus-within:border-accent/60 transition-colors">
              <span className="text-zinc-500 font-mono text-sm">{currency}</span>
              <input
                type="number"
                min="1"
                step="any"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="flex-1 bg-transparent text-white font-mono text-sm outline-none caret-accent"
                placeholder="500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Currency Symbol
            </label>
            <input
              type="text"
              maxLength={3}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="
                bg-surface-raised border border-surface-border rounded-xl px-4 py-3
                text-white font-mono text-sm outline-none caret-accent
                focus:border-accent/60 transition-colors
              "
              placeholder="₱"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="flex-1 py-3 rounded-xl border border-surface-border text-zinc-400 text-sm font-medium hover:border-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-accent text-black text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
