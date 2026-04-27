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

  addExpense: (expense: Expense) => void
  deleteExpense: (id: string) => void
  updateSettings: (settings: Partial<BudgetSettings>) => void
  setDailyInsight: (insight: DailyInsight) => void
  setRealityCheck: (result: RealityCheckResult) => void
  setInsightLoading: (loading: boolean) => void
  setRealityCheckLoading: (loading: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setHistoryOpen: (open: boolean) => void
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],
      settings: {
        name: '',
        dailyBudget: 500,
        currency: '₱',
        apiKey: '',
        aiEnabled: true,
        language: 'en',
      },
      dailyInsight: null,
      realityCheck: null,
      insightLoading: false,
      realityCheckLoading: false,
      settingsOpen: false,
      historyOpen: false,

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
    }),
    {
      name: 'budglet-storage',
      partialize: (state) => ({
        expenses: state.expenses,
        settings: state.settings,
        dailyInsight: state.dailyInsight,
      }),
    }
  )
)
