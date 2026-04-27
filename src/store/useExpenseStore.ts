import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Expense, BudgetSettings, DailyInsight } from '../types/expense'

interface ExpenseStore {
  expenses: Expense[]
  settings: BudgetSettings
  dailyInsight: DailyInsight | null
  settingsOpen: boolean

  addExpense: (expense: Expense) => void
  deleteExpense: (id: string) => void
  updateSettings: (settings: Partial<BudgetSettings>) => void
  setDailyInsight: (insight: DailyInsight) => void
  setSettingsOpen: (open: boolean) => void
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],
      settings: {
        dailyBudget: 500,
        currency: '₱',
      },
      dailyInsight: null,
      settingsOpen: false,

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

      setSettingsOpen: (open) => set({ settingsOpen: open }),
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
