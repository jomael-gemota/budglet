import { useState, useRef, useEffect } from 'react'
import { useExpenseStore } from '../store/useExpenseStore'

export function OnboardingOverlay() {
  const { settings, loggedIn, login, updateSettings } = useExpenseStore()
  const [name, setName] = useState('')
  const [changingName, setChangingName] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the name input when it becomes visible
  useEffect(() => {
    if (!loggedIn && (!settings.name || changingName)) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [loggedIn, settings.name, changingName])

  // Hide the overlay once the user is logged in
  if (loggedIn) return null

  // ── Returning user ────────────────────────────────────────────────────────
  // Name is already saved — show a welcome-back screen.
  if (settings.name && !changingName) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center px-6 animate-fade-in">
        <div className="w-full max-w-sm flex flex-col items-center gap-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-accent/30 shadow-[0_0_40px_rgba(242,201,76,0.22)]">
              <img src="/budglet-logo.png" alt="Budglet logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-[#f6deb0] font-semibold text-lg tracking-tight">budglet</span>
            <p className="text-zinc-500 text-xs text-center leading-relaxed max-w-[220px]">
              Brutally simple budgeting. Tells you the truth about your spending.
            </p>
          </div>

          {/* Welcome back */}
          <div className="w-full flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-zinc-500 text-sm">Welcome back,</p>
              <h1 className="text-white font-bold text-2xl mt-0.5">{settings.name}</h1>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={login}
                className="
                  w-full py-3.5 rounded-xl font-semibold text-sm
                  bg-accent text-black
                  hover:bg-accent-dark transition-colors
                  shadow-[0_0_20px_rgba(242,201,76,0.25)]
                "
              >
                Back in →
              </button>
              <button
                type="button"
                onClick={() => setChangingName(true)}
                className="w-full py-2.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Not you? Switch user
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── New user / switch user ────────────────────────────────────────────────
  // No name yet, or user chose "Not you? Switch user".
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    updateSettings({ name: trimmed })
    login()
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-accent/30 shadow-[0_0_40px_rgba(242,201,76,0.22)]">
            <img src="/budglet-logo.png" alt="Budglet logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-[#f6deb0] font-semibold text-lg tracking-tight">budglet</span>
          <p className="text-zinc-500 text-xs text-center leading-relaxed max-w-[220px]">
            Brutally simple budgeting. Tells you the truth about your spending.
          </p>
        </div>

        {/* Name prompt */}
        <div className="w-full flex flex-col gap-4">
          <div className="text-center">
            <h1 className="text-white font-semibold text-xl">What should we call you?</h1>
            <p className="text-zinc-600 text-sm mt-1">
              We'll use your name to make insights feel personal.
            </p>
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
                shadow-[0_0_20px_rgba(242,201,76,0.2)]
              "
            >
              Let's go →
            </button>
          </form>

          {/* Let them go back if they accidentally hit "Not you?" */}
          {changingName && (
            <button
              type="button"
              onClick={() => { setChangingName(false); setName('') }}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors text-center"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
