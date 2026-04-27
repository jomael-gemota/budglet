import { useState, useRef, useEffect } from 'react'
import { useExpenseStore } from '../store/useExpenseStore'

export function OnboardingOverlay() {
  const { settings, updateSettings } = useExpenseStore()
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!settings.name) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [settings.name])

  if (settings.name) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    updateSettings({ name: trimmed })
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-surface-border flex items-center justify-center">
            <span className="text-accent font-bold text-2xl font-mono">B</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">budglet</span>
          <p className="text-zinc-500 text-xs text-center leading-relaxed max-w-[220px]">
            Brutally simple budgeting. Tells you the truth about your spending.
          </p>
        </div>

        {/* Name prompt */}
        <div className="w-full flex flex-col gap-4">
          <div className="text-center">
            <h1 className="text-white font-semibold text-xl">What should we call you?</h1>
            <p className="text-zinc-600 text-sm mt-1">We'll use your name to make insights feel personal.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              maxLength={32}
              autoComplete="off"
              autoCorrect="off"
              className="
                w-full bg-surface-raised border border-surface-border
                rounded-xl px-4 py-3.5 text-white text-base
                placeholder-zinc-600 outline-none caret-accent
                focus:border-accent/60 transition-colors text-center
              "
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="
                w-full py-3.5 rounded-xl font-semibold text-sm
                bg-accent text-black
                hover:bg-accent-dark transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed
              "
            >
              Let's go →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
