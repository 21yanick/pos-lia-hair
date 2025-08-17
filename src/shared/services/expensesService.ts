/**
 * Expenses Service Functions
 *
 * Pure business logic functions for expense operations
 * Extracted from useExpenses hook for React Query migration
 *
 * Features:
 * - Multi-tenant security (organization-scoped)
 * - Comprehensive error handling
 * - CRUD operations for expenses
 * - Receipt/document management
 * - Cash movement integration
 * - Category analysis and statistics
 * - Type safety with Database types
 * - Optimized for React Query caching
 */

'use client'

import { supabase } from '@/shared/lib/supabase/client'
import {
  formatDateForAPI,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getTodaySwissString,
} from '@/shared/utils/dateUtils'
import type { Database } from '@/types/database'

// ========================================
// Utility Functions
// ========================================

/**
 * Sanitizes filename for storage compatibility
 * Removes/replaces characters that are not URL-safe
 */
function sanitizeFileName(fileName: string): string {
  return (
    fileName
      // Replace umlauts
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/Ä/g, 'Ae')
      .replace(/Ö/g, 'Oe')
      .replace(/Ü/g, 'Ue')
      .replace(/ß/g, 'ss')
      // Replace spaces and special chars with underscores
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      // Remove multiple consecutive underscores
      .replace(/_+/g, '_')
      // Remove leading/trailing underscores
      .replace(/^_|_$/g, '')
  )
}

// ========================================
// Types
// ========================================

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Omit<
  Database['public']['Tables']['expenses']['Insert'],
  'id' | 'created_at'
>
export type ExpenseUpdate = Partial<
  Omit<Database['public']['Tables']['expenses']['Update'], 'id' | 'created_at'>
> & { id: string }

// Enhanced type with supplier relation
export type ExpenseWithSupplier = Expense & {
  supplier?: {
    id: string
    name: string
    category: string | null
    contact_email: string | null
    contact_phone: string | null
    website: string | null
    is_active: boolean
  } | null
}

export type ExpenseCategory = 'rent' | 'supplies' | 'salary' | 'utilities' | 'insurance' | 'other'

export type ExpenseQueryResult =
  | {
      success: true
      data: ExpenseWithSupplier[]
    }
  | {
      success: false
      error: string
    }

export type ExpenseMutationResult =
  | {
      success: true
      data: Expense
      document?: any // Document from receipt upload
    }
  | {
      success: false
      error: string
    }

export type ExpenseDeleteResult =
  | {
      success: true
    }
  | {
      success: false
      error: string
    }

export type DocumentUploadResult =
  | {
      success: true
      document: any
    }
  | {
      success: false
      error: string
    }

export type ExpenseStats = {
  totalAmount: number
  totalCash: number
  totalBank: number
  count: number
  byCategory: Record<ExpenseCategory, number>
}

// ========================================
// Validation & Security
// ========================================

function validateOrganizationId(organizationId: string): string {
  if (!organizationId || organizationId.trim() === '') {
    throw new Error('Organization ID ist erforderlich')
  }
  return organizationId.trim()
}

function validateExpenseData(data: ExpenseInsert): void {
  if (!data.amount || data.amount <= 0) {
    throw new Error('Betrag muss größer als 0 sein')
  }
  if (!data.description?.trim()) {
    throw new Error('Beschreibung ist erforderlich')
  }
  if (!data.category) {
    throw new Error('Kategorie ist erforderlich')
  }
  if (!data.payment_method) {
    throw new Error('Zahlungsmethode ist erforderlich')
  }
  if (!data.payment_date) {
    throw new Error('Zahlungsdatum ist erforderlich')
  }
}

// ========================================
// Core CRUD Operations
// ========================================

/**
 * Get all expenses for an organization
 */
export async function getExpenses(
  organizationId: string,
  limit?: number
): Promise<ExpenseQueryResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)

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
      .eq('organization_id', validOrgId)
      .order('payment_date', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      // console.error('Error loading expenses:', error)
      throw new Error(`Fehler beim Laden der Ausgaben: ${error.message}`)
    }

    // Transform data to include supplier relation
    const expensesWithSupplier = (data || []).map((expense) => ({
      ...expense,
      supplier: expense.suppliers || null,
    }))

    return {
      success: true,
      data: expensesWithSupplier,
    }
  } catch (err: any) {
    console.error('Error in getExpenses:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Laden der Ausgaben',
    }
  }
}

/**
 * Get expenses by date range
 */
export async function getExpensesByDateRange(
  organizationId: string,
  startDate: string,
  endDate: string
): Promise<ExpenseQueryResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)

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
      .eq('organization_id', validOrgId)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: false })

    if (error) {
      // console.error('Error loading expenses by date range:', error)
      throw new Error(`Fehler beim Laden der Ausgaben: ${error.message}`)
    }

    // Transform data to include supplier relation
    const expensesWithSupplier = (data || []).map((expense) => ({
      ...expense,
      supplier: expense.suppliers || null,
    }))

    return {
      success: true,
      data: expensesWithSupplier,
    }
  } catch (err: any) {
    console.error('Error in getExpensesByDateRange:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Laden der Ausgaben',
    }
  }
}

/**
 * Get current month expenses
 */
export async function getCurrentMonthExpenses(organizationId: string): Promise<ExpenseQueryResult> {
  const now = new Date()
  const startDate = formatDateForAPI(getFirstDayOfMonth(now))
  const endDate = formatDateForAPI(getLastDayOfMonth(now))

  return await getExpensesByDateRange(organizationId, startDate, endDate)
}

/**
 * Create a new expense
 */
export async function createExpense(
  data: ExpenseInsert,
  organizationId: string,
  receiptFile?: File
): Promise<ExpenseMutationResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)
    validateExpenseData(data)

    // Create expense with organization security
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        ...data,
        organization_id: validOrgId,
      })
      .select()
      .single()

    if (expenseError) {
      // console.error('Error creating expense:', expenseError)
      throw new Error(`Fehler beim Erstellen der Ausgabe: ${expenseError.message}`)
    }

    // Handle receipt upload if provided
    let uploadResult = null
    if (receiptFile) {
      const documentUpload = await uploadExpenseReceipt(expense.id, receiptFile, organizationId)

      if (!documentUpload.success) {
        // Delete expense if upload fails
        await supabase.from('expenses').delete().eq('id', expense.id)
        throw new Error(documentUpload.error || 'Beleg-Upload fehlgeschlagen')
      }

      uploadResult = documentUpload.document
    }

    return {
      success: true,
      data: expense,
      document: uploadResult,
    }
  } catch (err: any) {
    console.error('Error in createExpense:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Erstellen der Ausgabe',
    }
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  updates: ExpenseUpdate,
  organizationId: string
): Promise<ExpenseMutationResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)

    if (!updates.id) {
      throw new Error('Expense ID ist erforderlich')
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', updates.id)
      .eq('organization_id', validOrgId) // 🔒 Security: only own expenses
      .select()
      .single()

    if (error) {
      // console.error('Error updating expense:', error)
      throw new Error(`Fehler beim Aktualisieren der Ausgabe: ${error.message}`)
    }

    return {
      success: true,
      data,
    }
  } catch (err: any) {
    console.error('Error in updateExpense:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Aktualisieren der Ausgabe',
    }
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(
  expenseId: string,
  organizationId: string
): Promise<ExpenseDeleteResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)

    if (!expenseId) {
      throw new Error('Expense ID ist erforderlich')
    }

    // First get the expense for security check
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .eq('organization_id', validOrgId) // 🔒 Security: only own expenses
      .single()

    if (fetchError) {
      // console.error('Error fetching expense for deletion:', fetchError)
      throw new Error(`Ausgabe nicht gefunden: ${fetchError.message}`)
    }

    // Delete the expense
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('organization_id', validOrgId) // 🔒 Security: only own expenses

    if (deleteError) {
      // console.error('Error deleting expense:', deleteError)
      throw new Error(`Fehler beim Löschen der Ausgabe: ${deleteError.message}`)
    }

    return {
      success: true,
    }
  } catch (err: any) {
    console.error('Error in deleteExpense:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Löschen der Ausgabe',
    }
  }
}

// ========================================
// Document/Receipt Management
// ========================================

/**
 * Upload expense receipt
 */
export async function uploadExpenseReceipt(
  expenseId: string,
  file: File,
  organizationId: string
): Promise<DocumentUploadResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)

    // Get current user
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
    }
    const userId = userData.user.id

    // Upload file to Supabase Storage with sanitized filename
    const sanitizedFileName = sanitizeFileName(file.name)
    const fileName = `${expenseId}-${Date.now()}-${sanitizedFileName}`
    const filePath = `${validOrgId}/expense-receipts/${fileName}`

    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)

    if (uploadError) {
      // console.error('Error uploading file:', uploadError)
      throw new Error(`Fehler beim Hochladen: ${uploadError.message}`)
    }

    // Create document record in database
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        type: 'expense_receipt',
        reference_id: expenseId,
        file_path: filePath,
        payment_method: null, // Expense receipts don't have specific payment method
        document_date: getTodaySwissString(),
        user_id: userId,
        organization_id: validOrgId, // 🔒 Security: Organization-scoped
      })
      .select()
      .single()

    if (documentError) {
      // console.error('Error creating document record:', documentError)
      throw new Error(`Fehler beim Erstellen des Dokument-Eintrags: ${documentError.message}`)
    }

    return {
      success: true,
      document,
    }
  } catch (err: any) {
    console.error('Error in uploadExpenseReceipt:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Hochladen des Belegs',
    }
  }
}

/**
 * Replace existing expense receipt
 */
export async function replaceExpenseReceipt(
  expenseId: string,
  newFile: File,
  organizationId: string
): Promise<DocumentUploadResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)

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
      .eq('organization_id', validOrgId) // 🔒 Security: Organization-scoped

    if (fetchError) {
      // console.error('Error fetching existing documents:', fetchError)
      throw new Error(`Fehler beim Laden vorhandener Dokumente: ${fetchError.message}`)
    }

    // Delete old documents from storage and database
    if (existingDocs && existingDocs.length > 0) {
      for (const doc of existingDocs) {
        if (doc.file_path) {
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([doc.file_path])

          if (storageError) {
            // console.warn('Warning: Could not delete old file:', storageError.message)
          }
        }

        const { error: deleteError } = await supabase.from('documents').delete().eq('id', doc.id)

        if (deleteError) {
          // console.warn('Warning: Could not delete old document record:', deleteError.message)
        }
      }
    }

    // Upload new file with sanitized filename
    const sanitizedFileName = sanitizeFileName(newFile.name)
    const fileName = `${expenseId}-${Date.now()}-${sanitizedFileName}`
    const filePath = `${validOrgId}/expense-receipts/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, newFile)

    if (uploadError) {
      // console.error('Error uploading replacement file:', uploadError)
      throw new Error(`Fehler beim Hochladen: ${uploadError.message}`)
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
        document_date: getTodaySwissString(),
        user_id: userId,
        organization_id: validOrgId, // 🔒 Security: Organization-scoped
      })
      .select()
      .single()

    if (documentError) {
      // console.error('Error creating new document record:', documentError)
      throw new Error(`Fehler beim Erstellen des neuen Dokument-Eintrags: ${documentError.message}`)
    }

    return {
      success: true,
      document,
    }
  } catch (err: any) {
    console.error('Error in replaceExpenseReceipt:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Ersetzen des Belegs',
    }
  }
}

/**
 * Generate placeholder receipt for physical receipts
 */
export async function generatePlaceholderReceipt(
  expenseId: string,
  organizationId: string,
  archiveLocation?: string
): Promise<DocumentUploadResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)

    // Get expense data (🔒 Security: Organization-scoped)
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .eq('organization_id', validOrgId) // 🔒 Security: Organization-scoped
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
    // Try both default and named import for better compatibility
    const PlaceholderReceiptPDFModule = await import(
      '@/shared/components/pdf/PlaceholderReceiptPDF'
    )
    const PlaceholderReceiptPDF =
      PlaceholderReceiptPDFModule.default || PlaceholderReceiptPDFModule.PlaceholderReceiptPDF
    const { pdf } = await import('@react-pdf/renderer')

    // Load Business Settings
    const { getBusinessSettings, resolveLogoUrl } = await import(
      '@/shared/services/businessSettingsService'
    )
    const businessSettings = await getBusinessSettings()

    // Resolve logo URL for PDF context (Development: localhost -> Docker internal URL)
    const resolvedBusinessSettings = businessSettings
      ? {
          ...businessSettings,
          logo_url: resolveLogoUrl(businessSettings.logo_url),
        }
      : null

    // Generate PDF
    const pdfComponent = React.createElement(PlaceholderReceiptPDF, {
      expense,
      archiveLocation: archiveLocation || 'Physisches Archiv',
      createdBy: userData.user.email || 'System',
      businessSettings: resolvedBusinessSettings,
    }) as any

    const blob = await pdf(pdfComponent).toBlob()
    const fileName = `placeholder-beleg-${expense.id}.pdf`
    const filePath = `${validOrgId}/expense_receipts/${fileName}`

    // Upload to Storage
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, blob, {
      contentType: 'application/pdf',
      upsert: true,
    })

    if (uploadError) {
      // console.error('Error uploading placeholder PDF:', uploadError)
      throw new Error(`Fehler beim Hochladen des PDFs: ${uploadError.message}`)
    }

    // Create document record using same structure as uploadExpenseReceipt (which works)
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        type: 'expense_receipt',
        reference_id: expenseId,
        file_path: filePath,
        payment_method: null, // Use null like in uploadExpenseReceipt
        document_date: getTodaySwissString(), // Use current date like in uploadExpenseReceipt
        user_id: userId,
        organization_id: validOrgId, // 🔒 Security: Organization-scoped
      })
      .select()
      .single()

    if (documentError) {
      // console.error('Error creating placeholder document record:', documentError)
      throw new Error(`Fehler beim Erstellen des Dokument-Eintrags: ${documentError.message}`)
    }

    return {
      success: true,
      document,
    }
  } catch (err: any) {
    console.error('Error in generatePlaceholderReceipt:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Erstellen des Platzhalter-Belegs',
    }
  }
}

// ========================================
// Analytics & Statistics
// ========================================

/**
 * Calculate expense statistics
 */
export function calculateExpenseStats(expenses: ExpenseWithSupplier[]): ExpenseStats {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalCash = expenses
    .filter((expense) => expense.payment_method === 'cash')
    .reduce((sum, expense) => sum + expense.amount, 0)
  const totalBank = expenses
    .filter((expense) => expense.payment_method === 'bank')
    .reduce((sum, expense) => sum + expense.amount, 0)

  const byCategory: Record<ExpenseCategory, number> = {
    rent: 0,
    supplies: 0,
    salary: 0,
    utilities: 0,
    insurance: 0,
    other: 0,
  }

  expenses.forEach((expense) => {
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
    byCategory,
  }
}

/**
 * Group expenses by category
 */
export function groupExpensesByCategory(
  expenses: ExpenseWithSupplier[]
): Record<ExpenseCategory, ExpenseWithSupplier[]> {
  const grouped: Record<ExpenseCategory, ExpenseWithSupplier[]> = {
    rent: [],
    supplies: [],
    salary: [],
    utilities: [],
    insurance: [],
    other: [],
  }

  expenses.forEach((expense) => {
    const category = expense.category as ExpenseCategory
    if (grouped[category]) {
      grouped[category].push(expense)
    }
  })

  return grouped
}

// ========================================
// Expense Categories
// ========================================

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, string> = {
  rent: 'Miete & Nebenkosten',
  supplies: 'Material & Zubehör',
  salary: 'Löhne & Gehälter',
  utilities: 'Strom, Wasser, Gas',
  insurance: 'Versicherungen',
  other: 'Sonstiges',
}
