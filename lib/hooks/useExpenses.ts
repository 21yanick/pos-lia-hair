'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

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

  // Ausgabe erstellen
  const createExpense = async (data: ExpenseInsert) => {
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
        const { error: cashError } = await supabase
          .from('cash_movements')
          .insert({
            amount: data.amount,
            type: 'cash_out',
            description: `${EXPENSE_CATEGORIES[data.category]}: ${data.description}`,
            reference_type: 'expense',
            reference_id: expense.id,
            user_id: userId
          })

        if (cashError) {
          console.error('Fehler beim Erstellen der Bargeld-Bewegung:', cashError)
          // Hier keine Exception werfen, da die Ausgabe selbst erfolgreich war
        }
      }

      // Automatische Dokumenterstellung für Ausgabenbeleg
      try {
        await createExpenseDocument(expense, userId)
      } catch (docErr: any) {
        console.error('Fehler bei der automatischen Dokumenterstellung:', docErr)
        // Hier keine Exception werfen, da die Ausgabe selbst erfolgreich war
      }

      // Lokale Liste aktualisieren
      setExpenses(prev => [expense, ...prev])
      setCurrentExpense(expense)

      return { success: true, expense }
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

      // Wenn es eine Barzahlung war, die Bargeld-Bewegung stornieren
      if (expense.payment_method === 'cash') {
        // Benutzer-ID abrufen
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          const { error: cashError } = await supabase
            .from('cash_movements')
            .insert({
              amount: expense.amount,
              type: 'cash_in',
              description: `Stornierung: ${EXPENSE_CATEGORIES[expense.category as ExpenseCategory]}: ${expense.description}`,
              reference_type: 'expense',
              reference_id: expense.id,
              user_id: userData.user.id
            })

          if (cashError) {
            console.error('Fehler beim Stornieren der Bargeld-Bewegung:', cashError)
            // Hier keine Exception werfen, da das Löschen selbst erfolgreich war
          }
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

  // Automatische Dokumenterstellung für Ausgaben-Belege
  const createExpenseDocument = async (expense: Expense, userId: string) => {
    try {
      // PDF für Ausgaben-Beleg erstellen (einfache Version)
      const fileName = `ausgabe-${expense.id}.pdf`
      const filePath = `documents/expense_receipts/${fileName}`
      
      // Einfaches Text-PDF erstellen (ohne komplexe PDF-Generierung)
      const docContent = `
AUSGABEN-BELEG

Datum: ${expense.payment_date}
Kategorie: ${EXPENSE_CATEGORIES[expense.category as ExpenseCategory]}
Beschreibung: ${expense.description}
Betrag: CHF ${expense.amount.toFixed(2)}
Zahlungsart: ${expense.payment_method === 'cash' ? 'Bar' : 'Bank'}

Beleg-ID: ${expense.id}
Mitarbeiter: ${userId}
Erstellt: ${new Date().toLocaleString('de-CH')}
      `.trim()

      // Als einfache Text-Datei speichern (Fallback wenn PDF-Lib nicht verfügbar)
      const blob = new Blob([docContent], { type: 'text/plain' })
      const file = new File([blob], fileName.replace('.pdf', '.txt'), { type: 'text/plain' })
      
      // Datei zu Supabase Storage hochladen
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath.replace('.pdf', '.txt'), file, {
          cacheControl: '3600',
          upsert: false
        })
        
      if (uploadError) {
        console.error('Fehler beim Hochladen des Ausgaben-Belegs:', uploadError)
        throw uploadError
      }

      // Dokument-Eintrag in der Datenbank erstellen
      const { error: documentError } = await supabase
        .from('documents')
        .insert({
          type: 'expense_receipt',
          reference_id: expense.id,
          file_path: filePath.replace('.pdf', '.txt'),
          payment_method: expense.payment_method,
          document_date: expense.payment_date,
          user_id: userId
        })
      
      if (documentError) {
        console.error('Fehler beim Erstellen des Dokumenteneintrags:', documentError)
        throw documentError
      }

      console.log('Ausgaben-Beleg erfolgreich erstellt:', fileName)
      return filePath.replace('.pdf', '.txt')
    } catch (error) {
      console.error('Fehler bei der Dokument-Erstellung:', error)
      throw error
    }
  }

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
    createExpenseDocument,
    EXPENSE_CATEGORIES
  }
}