'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { useCashMovements } from './useCashMovements'

// Typen für Ausgaben (ersetzt SupplierInvoices)
export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Omit<Database['public']['Tables']['expenses']['Insert'], 'id' | 'created_at'>
export type ExpenseUpdate = Partial<Omit<Database['public']['Tables']['expenses']['Update'], 'id' | 'created_at'>> & { id: string }

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

export function useExpenses() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null)
  const { createExpenseCashMovement, reverseCashMovement } = useCashMovements()

  // Ausgabe erstellen (mit Pflicht-Beleg-Upload)
  const createExpense = async (data: ExpenseInsert, receiptFile: File) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }
      const userId = userData.user.id

      // Ausgabe erstellen
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          ...data,
          user_id: userId,
        })
        .select()
        .single()

      if (expenseError) {
        console.error('Fehler beim Erstellen der Ausgabe:', expenseError)
        throw expenseError
      }

      // Bargeld-Bewegung erstellen, wenn es eine Barzahlung ist
      if (data.payment_method === 'cash') {
        try {
          await createExpenseCashMovement(
            expense.id, 
            data.amount, 
            EXPENSE_CATEGORIES[data.category], 
            data.description
          )
        } catch (cashError) {
          console.error('Fehler beim Erstellen der Bargeld-Bewegung:', cashError)
          // Hier keine Exception werfen, da die Ausgabe selbst erfolgreich war
        }
      }

      // Upload des Belegs (PFLICHT)
      const uploadResult = await uploadExpenseReceipt(expense.id, receiptFile)
      
      if (!uploadResult.success) {
        // Expense wieder löschen wenn Upload fehlschlägt
        await supabase.from('expenses').delete().eq('id', expense.id)
        throw new Error(uploadResult.error || 'Beleg-Upload fehlgeschlagen')
      }

      // Lokale Liste aktualisieren
      setExpenses(prev => [expense, ...prev])
      setCurrentExpense(expense)

      return { success: true, expense, document: uploadResult.document }
    } catch (err: any) {
      console.error('Fehler beim Erstellen der Ausgabe:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Ausgaben laden
  const loadExpenses = async (limit?: number) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('expenses')
        .select('*')
        .order('payment_date', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Fehler beim Laden der Ausgaben:', error)
        throw error
      }

      setExpenses(data || [])
      return { success: true, expenses: data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Ausgaben:', err)
      setError(err.message || 'Fehler beim Laden der Daten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Ausgaben für einen bestimmten Zeitraum laden
  const loadExpensesByDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate)
        .order('payment_date', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Ausgaben:', error)
        throw error
      }

      setExpenses(data || [])
      return { success: true, expenses: data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Ausgaben:', err)
      setError(err.message || 'Fehler beim Laden der Daten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Ausgaben für aktuellen Monat laden
  const loadCurrentMonthExpenses = async () => {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    
    return await loadExpensesByDateRange(startDate, endDate)
  }

  // Ausgabe aktualisieren
  const updateExpense = async (id: string, updates: Partial<ExpenseUpdate>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Lokale Liste aktualisieren
      setExpenses(prev => prev.map(expense => expense.id === id ? data : expense))
      
      if (currentExpense?.id === id) {
        setCurrentExpense(data)
      }

      return { success: true, expense: data }
    } catch (err: any) {
      console.error('Fehler beim Aktualisieren der Ausgabe:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Ausgabe löschen
  const deleteExpense = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      // Erst die Ausgabe aus der Datenbank abrufen für die Bargeld-Bewegung
      const { data: expense, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      // Ausgabe löschen
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      // Wenn es eine Barzahlung war, Cash Movement rückgängig machen
      if (expense.payment_method === 'cash') {
        try {
          await reverseCashMovement(expense.id, 'expense')
        } catch (cashError) {
          console.error('Fehler beim Rückgängigmachen der Bargeld-Bewegung:', cashError)
          // Hier keine Exception werfen, da das Löschen selbst erfolgreich war
        }
      }

      // Lokale Liste aktualisieren
      setExpenses(prev => prev.filter(expense => expense.id !== id))
      
      if (currentExpense?.id === id) {
        setCurrentExpense(null)
      }

      return { success: true }
    } catch (err: any) {
      console.error('Fehler beim Löschen der Ausgabe:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Ausgaben nach Kategorie gruppieren
  const getExpensesByCategory = () => {
    const grouped: Record<ExpenseCategory, Expense[]> = {
      rent: [],
      supplies: [],
      salary: [],
      utilities: [],
      insurance: [],
      other: []
    }

    expenses.forEach(expense => {
      const category = expense.category as ExpenseCategory
      if (grouped[category]) {
        grouped[category].push(expense)
      }
    })

    return grouped
  }

  // Ausgaben-Statistiken berechnen
  const calculateExpenseStats = () => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalCash = expenses
      .filter(expense => expense.payment_method === 'cash')
      .reduce((sum, expense) => sum + expense.amount, 0)
    const totalBank = expenses
      .filter(expense => expense.payment_method === 'bank')
      .reduce((sum, expense) => sum + expense.amount, 0)

    const byCategory: Record<ExpenseCategory, number> = {
      rent: 0,
      supplies: 0,
      salary: 0,
      utilities: 0,
      insurance: 0,
      other: 0
    }

    expenses.forEach(expense => {
      const category = expense.category as ExpenseCategory
      if (byCategory[category] !== undefined) {
        byCategory[category] += expense.amount
      }
    })

    return {
      totalAmount,
      totalCash,
      totalBank,
      count: expenses.length,
      byCategory
    }
  }

  // Belege für eine Ausgabe verwalten
  const uploadExpenseReceipt = async (expenseId: string, file: File) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }
      const userId = userData.user.id

      // Datei zu Supabase Storage hochladen
      const fileName = `${expenseId}-${Date.now()}-${file.name}`
      const filePath = `documents/expense-receipts/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Dokument-Eintrag in der Datenbank erstellen
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert({
          type: 'expense_receipt',
          reference_id: expenseId,
          file_path: filePath,
          payment_method: null, // Ausgaben-Belege haben keine spezifische Zahlungsmethode
          document_date: new Date().toISOString().split('T')[0],
          user_id: userId
        })
        .select()
        .single()

      if (documentError) {
        throw documentError
      }

      return { success: true, document }
    } catch (err: any) {
      console.error('Fehler beim Hochladen des Belegs:', err)
      setError(err.message || 'Fehler beim Hochladen')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // REMOVED: Fake expense receipt generation
  // Real expense receipts should be uploaded by users, not generated by system

  return {
    loading,
    error,
    expenses,
    currentExpense,
    createExpense,
    loadExpenses,
    loadExpensesByDateRange,
    loadCurrentMonthExpenses,
    updateExpense,
    deleteExpense,
    getExpensesByCategory,
    calculateExpenseStats,
    uploadExpenseReceipt,
    // createExpenseDocument, // REMOVED: Use uploadExpenseReceipt instead
    EXPENSE_CATEGORIES
  }
}