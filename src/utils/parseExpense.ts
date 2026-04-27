export interface ParseResult {
  amount: number
  label: string
}

/**
 * Parses a single-line expense input.
 *
 * Supported formats:
 *   "35 coffee"         → { amount: 35, label: "coffee" }
 *   "12.50 bus ride"    → { amount: 12.50, label: "bus ride" }
 *   "coffee 35"         → { amount: 35, label: "coffee" }  (amount at end)
 *   "35"                → { amount: 35, label: "" }
 *
 * Returns null if no valid number is found.
 */
export function parseExpense(raw: string): ParseResult | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Try amount at the start: "35 coffee"
  const startMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/)
  if (startMatch) {
    const amount = parseFloat(startMatch[1]!.replace(',', '.'))
    const label = (startMatch[2] ?? '').trim()
    if (!isNaN(amount) && amount > 0) {
      return { amount, label }
    }
  }

  // Try amount at the end: "coffee 35"
  const endMatch = trimmed.match(/^(.*?)\s+(\d+(?:[.,]\d+)?)$/)
  if (endMatch) {
    const amount = parseFloat(endMatch[2]!.replace(',', '.'))
    const label = (endMatch[1] ?? '').trim()
    if (!isNaN(amount) && amount > 0) {
      return { amount, label }
    }
  }

  return null
}
