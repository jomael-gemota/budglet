import { useState, useRef, useEffect } from 'react'
import { nanoid } from '../utils/nanoid'
import { parseExpense } from '../utils/parseExpense'
import { useExpenseStore } from '../store/useExpenseStore'

export function ExpenseInput() {
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)
  const [flash, setFlash] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const addExpense = useExpenseStore((s) => s.addExpense)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = parseExpense(value)

    if (!result) {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    addExpense({
      id: nanoid(),
      amount: result.amount,
      label: result.label,
      timestamp: Date.now(),
    })

    setValue('')
    setFlash(true)
    setTimeout(() => setFlash(false), 300)
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`
          relative flex items-center gap-2
          rounded-xl border px-4 py-3.5
          transition-all duration-150
          ${flash ? 'border-accent bg-accent/10 shadow-[0_0_24px_rgba(242,201,76,0.16)]' : 'border-surface-border bg-surface-raised'}
          ${shake ? 'animate-[shake_0.4s_ease]' : ''}
          focus-within:border-accent/60 focus-within:shadow-[0_0_0_1px_rgba(242,201,76,0.3)]
        `}
      >
        <span className="text-accent font-mono text-lg select-none">+</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="35 coffee   or   12.50 lunch"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className="
            flex-1 bg-transparent text-white placeholder-zinc-600
            text-base font-mono outline-none
            caret-accent
          "
        />
        {value && (
          <button
            type="submit"
            className="
              text-xs font-semibold px-2.5 py-1 rounded-lg
              bg-accent text-black
              hover:bg-accent-dark transition-colors
              select-none
            "
          >
            Add
          </button>
        )}
      </div>
      <p className="mt-1.5 text-xs text-zinc-500 px-1">
        Format: <span className="text-zinc-500 font-mono">amount label</span> — e.g.{' '}
        <span className="text-zinc-400 font-mono">85 grab</span>
      </p>
    </form>
  )
}
