// Shared Expense Types
import type { Database } from '@/types/supabase'
import type { Supplier } from './suppliers'

// Core expense types (re-exported from database)
export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Omit<Database['public']['Tables']['expenses']['Insert'], 'id' | 'created_at'>
export type ExpenseUpdate = Partial<Omit<Database['public']['Tables']['expenses']['Update'], 'id' | 'created_at'>> & { id: string }

// Enhanced expense with supplier data
export interface ExpenseWithSupplier extends Expense {
  supplier?: Supplier | null
}

// Kategorien für bessere UI-Darstellung
export const EXPENSE_CATEGORIES = {
  rent: 'Miete',
  supplies: 'Einkauf/Material',
  salary: 'Lohn',
  utilities: 'Nebenkosten',
  insurance: 'Versicherung',
  other: 'Sonstiges'
} as const

export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES