import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Expense, BudgetSettings, DailyInsight, RealityCheckResult } from '../types/expense'

interface ExpenseStore {
  expenses: Expense[]
  settings: BudgetSettings
  dailyInsight: DailyInsight | null
  realityCheck: RealityCheckResult | null
  insightLoading: boolean
  realityCheckLoading: boolean
  settingsOpen: boolean
  historyOpen: boolean
  loggedIn: boolean

  addExpense: (expense: Expense) => void
  deleteExpense: (id: string) => void
  updateSettings: (settings: Partial<BudgetSettings>) => void
  setDailyInsight: (insight: DailyInsight) => void
  setRealityCheck: (result: RealityCheckResult) => void
  setInsightLoading: (loading: boolean) => void
  setRealityCheckLoading: (loading: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setHistoryOpen: (open: boolean) => void
  login: () => void
  logout: () => void
}

const DEFAULT_SETTINGS: BudgetSettings = {
  name: '',
  dailyBudget: 500,
  currency: '₱',
  apiKey: '',
  aiEnabled: true,
  language: 'en',
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],
      settings: DEFAULT_SETTINGS,
      dailyInsight: null,
      realityCheck: null,
      insightLoading: false,
      realityCheckLoading: false,
      settingsOpen: false,
      historyOpen: false,
      loggedIn: false,

      addExpense: (expense) =>
        set((state) => ({
          expenses: [expense, ...state.expenses],
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      setDailyInsight: (insight) => set({ dailyInsight: insight }),

      setRealityCheck: (result) => set({ realityCheck: result }),

      setInsightLoading: (loading) => set({ insightLoading: loading }),

      setRealityCheckLoading: (loading) => set({ realityCheckLoading: loading }),

      setSettingsOpen: (open) => set({ settingsOpen: open }),

      setHistoryOpen: (open) => set({ historyOpen: open }),

      // Marks the session as active — called when the user enters their name
      // or taps "Back in" on the welcome-back screen.
      login: () => set({ loggedIn: true }),

      // Ends the session without touching any data. The onboarding screen
      // re-appears; if a name already exists the user gets a "Back in" prompt.
      logout: () => set({ loggedIn: false, settingsOpen: false }),
    }),
    {
      name: 'budglet-storage',
      version: 1,
      // Persist all user data and last-computed cards so nothing flashes on reload.
      partialize: (state) => ({
        expenses: state.expenses,
        settings: state.settings,
        dailyInsight: state.dailyInsight,
        realityCheck: state.realityCheck,
        loggedIn: state.loggedIn,
      }),
      // Deep-merge settings so that any new fields added in future app updates
      // keep their defaults instead of being silently dropped by a shallow merge.
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<ExpenseStore>
        return {
          ...currentState,
          ...persisted,
          settings: {
            ...currentState.settings,   // defaults — guarantees every field exists
            ...(persisted.settings ?? {}), // stored values win
          },
        }
      },
    }
  )
)
