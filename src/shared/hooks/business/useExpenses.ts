'use client'

import { useState } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import { useCashMovements } from '@/shared/hooks/core/useCashMovements'
import { useOrganization } from '@/shared/contexts/OrganizationContext'
import type { 
  Expense, 
  ExpenseWithSupplier,
  ExpenseInsert, 
  ExpenseUpdate, 
  ExpenseCategory 
} from '@/shared/types/expenses'
import { EXPENSE_CATEGORIES } from '@/shared/types/expenses'

// Re-export types and constants for modules
export type { ExpenseCategory }
export { EXPENSE_CATEGORIES }

export function useExpenses() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expenses, setExpenses] = useState<ExpenseWithSupplier[]>([])
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null)
  const { createExpenseCashMovement, reverseCashMovement } = useCashMovements()
  const { currentOrganization } = useOrganization()

  // Ausgabe erstellen (mit optionalem Beleg-Upload)
  const createExpense = async (data: ExpenseInsert, receiptFile?: File) => {
    try {
      setLoading(true)
      setError(null)

      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      // Ausgabe erstellen (Multi-Tenant)
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          ...data,
          organization_id: currentOrganization.id,
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

      // Upload des Belegs (optional)
      let uploadResult = null
      if (receiptFile) {
        uploadResult = await uploadExpenseReceipt(expense.id, receiptFile)
        
        if (!uploadResult.success) {
          // Expense wieder löschen wenn Upload fehlschlägt
          await supabase.from('expenses').delete().eq('id', expense.id)
          throw new Error(uploadResult.error || 'Beleg-Upload fehlgeschlagen')
        }
      }

      // Lokale Liste aktualisieren
      setExpenses(prev => [expense, ...prev])
      setCurrentExpense(expense)

      return { 
        success: true, 
        expense, 
        document: uploadResult?.document || null 
      }
    } catch (err: any) {
      console.error('Fehler beim Erstellen der Ausgabe:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Ausgaben laden (Multi-Tenant)
  const loadExpenses = async (limit?: number) => {
    try {
      setLoading(true)
      setError(null)

      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      let query = supabase
        .from('expenses')
        .select(`
          *,
          suppliers (
            id,
            name,
            category,
            contact_email,
            contact_phone,
            website,
            is_active
          )
        `)
        .eq('organization_id', currentOrganization.id) // 🔒 Multi-Tenant Security
        .order('payment_date', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Fehler beim Laden der Ausgaben:', error)
        throw error
      }

      // Transform data to include supplier relation
      const expensesWithSupplier = (data || []).map(expense => ({
        ...expense,
        supplier: expense.suppliers || null
      }))
      
      setExpenses(expensesWithSupplier)
      return { success: true, expenses: expensesWithSupplier }
    } catch (err: any) {
      console.error('Fehler beim Laden der Ausgaben:', err)
      setError(err.message || 'Fehler beim Laden der Daten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Ausgaben für einen bestimmten Zeitraum laden (Multi-Tenant)
  const loadExpensesByDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      setError(null)

      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          suppliers (
            id,
            name,
            category,
            contact_email,
            contact_phone,
            website,
            is_active
          )
        `)
        .eq('organization_id', currentOrganization.id) // 🔒 Multi-Tenant Security
        .gte('payment_date', startDate)
        .lte('payment_date', endDate)
        .order('payment_date', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Ausgaben:', error)
        throw error
      }

      // Transform data to include supplier relation
      const expensesWithSupplier = (data || []).map(expense => ({
        ...expense,
        supplier: expense.suppliers || null
      }))
      
      setExpenses(expensesWithSupplier)
      return { success: true, expenses: expensesWithSupplier }
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

  // Ausgabe aktualisieren (Multi-Tenant)
  const updateExpense = async (id: string, updates: Partial<ExpenseUpdate>) => {
    try {
      setLoading(true)
      setError(null)

      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', currentOrganization.id) // 🔒 Security: nur eigene Expenses
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

  // Ausgabe löschen (Multi-Tenant)
  const deleteExpense = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      // Erst die Ausgabe aus der Datenbank abrufen für die Bargeld-Bewegung
      const { data: expense, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .eq('organization_id', currentOrganization.id) // 🔒 Security: nur eigene Expenses
        .single()

      if (fetchError) {
        throw fetchError
      }

      // Ausgabe löschen (mit Organization Security)
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('organization_id', currentOrganization.id) // 🔒 Security: nur eigene Expenses

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

  // Replace existing expense receipt
  const replaceExpenseReceipt = async (expenseId: string, newFile: File) => {
    try {
      setLoading(true)
      setError(null)

      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }
      const userId = userData.user.id

      // Find existing documents for this expense
      const { data: existingDocs, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('type', 'expense_receipt')
        .eq('reference_id', expenseId)

      if (fetchError) {
        throw fetchError
      }

      // Delete old documents from storage and database
      if (existingDocs && existingDocs.length > 0) {
        for (const doc of existingDocs) {
          if (doc.file_path) {
            const { error: storageError } = await supabase.storage
              .from('documents')
              .remove([doc.file_path])
            
            if (storageError) {
              console.warn('Warnung: Alte Datei konnte nicht gelöscht werden:', storageError.message)
            }
          }

          const { error: deleteError } = await supabase
            .from('documents')
            .delete()
            .eq('id', doc.id)

          if (deleteError) {
            console.warn('Warnung: Alter Dokumenteintrag konnte nicht gelöscht werden:', deleteError.message)
          }
        }
      }

      // Upload new file
      const fileName = `${expenseId}-${Date.now()}-${newFile.name}`
      const filePath = `documents/expense-receipts/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, newFile)

      if (uploadError) {
        throw uploadError
      }

      // Create new document record
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert({
          type: 'expense_receipt',
          reference_type: 'expense',
          reference_id: expenseId,
          file_name: newFile.name,
          file_path: filePath,
          file_size: newFile.size,
          mime_type: newFile.type,
          payment_method: null,
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
      console.error('Fehler beim Ersetzen des Belegs:', err)
      setError(err.message || 'Fehler beim Ersetzen des Belegs')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Generate Placeholder Receipt for Physical Receipts
  const generatePlaceholderReceipt = async (expenseId: string, archiveLocation?: string) => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required (SECURITY FIX)
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      // Get expense data (🔒 SECURITY: Organization-scoped)
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
        .single()

      if (expenseError || !expense) {
        throw new Error('Ausgabe nicht gefunden')
      }

      // Get current user
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet')
      }
      const userId = userData.user.id

      // Import PDF libraries dynamically
      const React = await import('react')
      const { PlaceholderReceiptPDF } = await import('@/shared/components/pdf/PlaceholderReceiptPDF')
      const { pdf } = await import('@react-pdf/renderer')
      
      // Business Settings laden
      const { getBusinessSettings, resolveLogoUrl } = await import('@/shared/services/businessSettingsService')
      const businessSettings = await getBusinessSettings()
      
      // Logo URL für PDF-Kontext auflösen (Development: localhost -> Docker-interne URL)
      const resolvedBusinessSettings = businessSettings ? {
        ...businessSettings,
        logo_url: resolveLogoUrl(businessSettings.logo_url)
      } : null
      
      // Generate PDF
      const pdfComponent = React.createElement(PlaceholderReceiptPDF, { 
        expense, 
        archiveLocation: archiveLocation || 'Physisches Archiv',
        createdBy: userData.user.email || 'System',
        businessSettings: resolvedBusinessSettings
      }) as any
      
      const blob = await pdf(pdfComponent).toBlob()
      const fileName = `placeholder-beleg-${expense.id}.pdf`
      const filePath = `documents/expense_receipts/${fileName}`
      
      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, blob, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      // Create document record with archive location in notes
      const notesText = archiveLocation 
        ? `Physischer Beleg archiviert in: ${archiveLocation}`
        : 'Physischer Beleg archiviert'

      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert({
          type: 'expense_receipt',
          reference_type: 'expense',
          reference_id: expenseId,
          file_name: fileName,
          file_path: filePath,
          file_size: blob.size,
          mime_type: 'application/pdf',
          notes: notesText,
          payment_method: expense.payment_method,
          document_date: expense.payment_date,
          user_id: userId,
          organization_id: currentOrganization.id // 🔒 CRITICAL FIX: Organization security
        })
        .select()
        .single()

      if (documentError) {
        throw documentError
      }

      return { success: true, document }
    } catch (err: any) {
      console.error('Fehler beim Erstellen des Platzhalter-Belegs:', err)
      setError(err.message || 'Fehler beim Erstellen des Platzhalter-Belegs')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
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
    replaceExpenseReceipt,
    generatePlaceholderReceipt,
    EXPENSE_CATEGORIES
  }
}