import { format } from 'date-fns'
import type { Expense, RealityCheckResult, Language } from '../types/expense'
import { GPT_LANGUAGE_INSTRUCTION } from './i18n'
import {
  getDailyTotal,
  getMonthlyTotal,
  getMonthlyBudget,
  getMonthlyProjection,
  getAverageDailySpend,
  getSameWeekdayLastWeekTotal,
  getUnderBudgetStreak,
  getBiggestExpenseToday,
  getExpensesForDay,
  formatCurrency,
} from './calculations'

const INSIGHT_SYSTEM_PROMPT =
  'You are a behavioral spending analyst inside a minimalist budgeting app called Budglet. ' +
  'Your job is to surface a pattern or observation about the user\'s spending behavior — comparing today to their history (averages, streaks, weekday patterns, biggest items). ' +
  'Reply with exactly one short, direct sentence. No emojis. No generic advice. Be specific with the numbers provided. ' +
  'If the user\'s name is provided, address them by name naturally at the start of the sentence. ' +
  'IMPORTANT: Do NOT mention budget remaining, daily limits, or whether they will hit their budget — a separate "Reality Check" card handles that.'

const REALITY_CHECK_SYSTEM_PROMPT =
  'You are an expert financial coach inside a minimalist budgeting app called Budglet. ' +
  'Be direct, numbers-specific, and actionable — like a coach who respects the user\'s intelligence. No emojis. No generic platitudes. ' +
  'If the user\'s name is provided, address them by name in the status sentence. ' +
  'Always respond with a valid JSON object in this exact shape: {"status":"<one blunt sentence about the current situation>","tip":"<one concrete, specific action the user can take right now to recover or stay on track>"}'

async function callGpt(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  jsonMode = false,
  maxTokens = 120,
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  })

  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`)

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>
  }

  const text = data.choices[0]?.message.content?.trim()
  if (!text) throw new Error('Empty response from OpenAI')
  return text
}

export async function fetchGptText(userPrompt: string, apiKey: string): Promise<string> {
  return callGpt(INSIGHT_SYSTEM_PROMPT, userPrompt, apiKey, false, 80)
}

export async function fetchGptRealityCheck(
  userPrompt: string,
  apiKey: string,
): Promise<RealityCheckResult> {
  const raw = await callGpt(REALITY_CHECK_SYSTEM_PROMPT, userPrompt, apiKey, true, 160)
  const parsed = JSON.parse(raw) as { status?: string; tip?: string }
  if (!parsed.status || !parsed.tip) throw new Error('Malformed reality check response')
  return { status: parsed.status.trim(), tip: parsed.tip.trim() }
}

export interface InsightContext {
  expenses: Expense[]
  dailyBudget: number
  currency: string
  language: Language
  name: string
}

export function buildInsightPrompt(ctx: InsightContext): string {
  const { expenses, dailyBudget, currency, language, name } = ctx
  const now = new Date()

  const todayTotal = getDailyTotal(expenses, now)
  const avg7 = getAverageDailySpend(expenses, 7)
  const lastWeekSameDay = getSameWeekdayLastWeekTotal(expenses)
  const streak = getUnderBudgetStreak(expenses, dailyBudget)
  const todayExpenses = getExpensesForDay(expenses, now)

  const lines: string[] = [
    name ? `User's name: ${name}` : '',
    `Date: ${format(now, 'EEEE, MMMM d')}`,
    `Daily budget: ${formatCurrency(dailyBudget, currency)}`,
    `Today's total so far: ${formatCurrency(todayTotal, currency)}`,
    todayExpenses.length > 0
      ? `Today's expenses: ${todayExpenses.map((e) => `${e.label || 'unlabeled'} (${formatCurrency(e.amount, currency)})`).join(', ')}`
      : `No expenses logged today.`,
    avg7 > 0 ? `7-day average daily spend: ${formatCurrency(avg7, currency)}` : '',
    lastWeekSameDay > 0
      ? `Same weekday last week: ${formatCurrency(lastWeekSameDay, currency)}`
      : '',
    streak > 0 ? `Under-budget streak: ${streak} day(s)` : '',
  ].filter(Boolean)

  const langInstruction = GPT_LANGUAGE_INSTRUCTION[language]
  return (
    lines.join('\n') +
    '\n\nGenerate a single behavioral observation about this user\'s spending pattern today — compare to their history or highlight the biggest item. Do NOT mention how much budget is left or whether they will hit their budget limit.' +
    (langInstruction ? `\n${langInstruction}` : '')
  )
}

export interface RealityCheckContext {
  expenses: Expense[]
  dailyBudget: number
  currency: string
  language: Language
  name: string
}

export function buildRealityCheckPrompt(ctx: RealityCheckContext): string {
  const { expenses, dailyBudget, currency, language, name } = ctx
  const now = new Date()

  const todayTotal = getDailyTotal(expenses, now)
  const monthlyTotal = getMonthlyTotal(expenses, now)
  const monthlyBudget = getMonthlyBudget(dailyBudget, now)
  const projection = getMonthlyProjection(expenses, now)
  const biggest = getBiggestExpenseToday(expenses, now)
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const overDaily = dailyBudget > 0 && todayTotal > dailyBudget

  const lines: string[] = [
    name ? `User's name: ${name}` : '',
    `Time: ${format(now, 'h:mm a')}`,
    `Daily budget: ${formatCurrency(dailyBudget, currency)}`,
    `Today's total: ${formatCurrency(todayTotal, currency)}${overDaily ? ` (${formatCurrency(todayTotal - dailyBudget, currency)} over budget)` : ''}`,
    `Monthly budget: ${formatCurrency(monthlyBudget, currency)}`,
    `Monthly total so far: ${formatCurrency(monthlyTotal, currency)} (day ${dayOfMonth} of ${daysInMonth})`,
    projection > 0 ? `Monthly projection at current pace: ${formatCurrency(projection, currency)}` : '',
    biggest ? `Biggest expense today: "${biggest.label || 'unlabeled'}" at ${formatCurrency(biggest.amount, currency)}` : '',
  ].filter(Boolean)

  const langInstruction = GPT_LANGUAGE_INSTRUCTION[language]
  return (
    lines.join('\n') +
    '\n\nAssess the user\'s financial situation and respond with a JSON object containing:\n' +
    '- "status": one blunt sentence stating exactly where they stand right now\n' +
    '- "tip": one specific, actionable coaching instruction to recover or stay on track (use the exact numbers from the data above)' +
    (langInstruction ? `\n${langInstruction}` : '')
  )
}
