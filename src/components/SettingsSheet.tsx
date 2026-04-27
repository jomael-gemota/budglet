import { useState, useEffect } from 'react'
import { useExpenseStore } from '../store/useExpenseStore'
import type { Language } from '../types/expense'
import { LANGUAGE_NAMES } from '../utils/i18n'

export function SettingsSheet() {
  const { settings, settingsOpen, updateSettings, setSettingsOpen } = useExpenseStore()
  const [budget, setBudget] = useState(String(settings.dailyBudget))
  const [currency, setCurrency] = useState(settings.currency)
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [aiEnabled, setAiEnabled] = useState(settings.aiEnabled)
  const [language, setLanguage] = useState<Language>(settings.language)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (settingsOpen) {
      setBudget(String(settings.dailyBudget))
      setCurrency(settings.currency)
      setApiKey(settings.apiKey)
      setAiEnabled(settings.aiEnabled)
      setLanguage(settings.language)
      setShowKey(false)
    }
  }, [settingsOpen, settings.dailyBudget, settings.currency, settings.apiKey, settings.aiEnabled, settings.language])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(budget)
    if (!isNaN(parsed) && parsed > 0) {
      updateSettings({
        dailyBudget: parsed,
        currency: currency.trim() || '₱',
        apiKey: apiKey.trim(),
        aiEnabled,
        language,
      })
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
          {/* Daily Budget */}
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

          {/* Currency Symbol */}
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

          {/* Language */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Language
            </label>
            <div className="flex gap-2">
              {(Object.entries(LANGUAGE_NAMES) as [Language, string][]).map(([code, name]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`
                    flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border
                    ${language === code
                      ? 'bg-accent text-black border-accent'
                      : 'bg-surface-raised text-zinc-400 border-surface-border hover:border-zinc-600'}
                  `}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* OpenAI API Key */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                OpenAI API Key
              </label>
              {/* AI toggle */}
              <button
                type="button"
                onClick={() => setAiEnabled((v) => !v)}
                className="flex items-center gap-1.5 group"
                aria-label={aiEnabled ? 'Disable AI' : 'Enable AI'}
              >
                <span className={`text-xs font-medium transition-colors ${aiEnabled ? 'text-accent' : 'text-zinc-600'}`}>
                  {aiEnabled ? 'On' : 'Off'}
                </span>
                <div
                  className={`
                    relative w-9 h-5 rounded-full transition-colors duration-200
                    ${aiEnabled ? 'bg-accent' : 'bg-zinc-700'}
                  `}
                >
                  <span
                    className={`
                      absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white
                      shadow-sm transition-transform duration-200
                      ${aiEnabled ? 'translate-x-4' : 'translate-x-0'}
                    `}
                  />
                </div>
              </button>
            </div>

            <div className={`transition-opacity duration-200 ${aiEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="flex items-center gap-2 bg-surface-raised border border-surface-border rounded-xl px-4 py-3 focus-within:border-accent/60 transition-colors">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={!aiEnabled}
                  className="flex-1 bg-transparent text-white font-mono text-xs outline-none caret-accent tracking-wider disabled:cursor-not-allowed"
                  placeholder="sk-..."
                  autoComplete="off"
                  spellCheck={false}
                />
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="text-zinc-600 hover:text-zinc-400 transition-colors text-xs shrink-0"
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? 'hide' : 'show'}
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-600 px-1 mt-1.5">
                {apiKey
                  ? 'GPT-powered insights are active.'
                  : 'Optional. Enables GPT-powered insights and reality checks.'}{' '}
                <span className="text-zinc-700">Stored locally on your device only.</span>
              </p>
            </div>
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
