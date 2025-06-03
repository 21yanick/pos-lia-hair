'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import type { 
  UnifiedTransaction, 
  TransactionSearchQuery, 
  TransactionSort, 
  TransactionStats,
  UnifiedTransactionsResponse,
  QuickFilterPreset,
  PdfStatus,
  PdfRequirement
} from '../types/unifiedTransactions'

export function useUnifiedTransactions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([])
  const [stats, setStats] = useState<TransactionStats>({
    total: 0,
    byType: { sale: 0, expense: 0, cash_movement: 0, bank_transaction: 0 },
    byStatus: { completed: 0, cancelled: 0, unmatched: 0, matched: 0 },
    pdfStats: {
      available: 0,
      missing: 0,
      notNeeded: 0,
      generating: 0,
      totalRequired: 0
    },
    withPdf: 0,
    withoutPdf: 0,
    totalAmount: 0,
    amountByType: { sale: 0, expense: 0, cash_movement: 0, bank_transaction: 0 }
  })

  // Quick Filter Presets zu SearchQuery konvertieren
  const getQuickFilterQuery = useCallback((preset: QuickFilterPreset): Partial<TransactionSearchQuery> => {
    const today = new Date().toISOString().split('T')[0]
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    
    switch (preset) {
      case 'today':
        return { dateFrom: today, dateTo: today }
      case 'this_week':
        return { 
          dateFrom: thisWeekStart.toISOString().split('T')[0], 
          dateTo: today 
        }
      case 'this_month':
        return { 
          dateFrom: thisMonthStart.toISOString().split('T')[0], 
          dateTo: today 
        }
      case 'last_month':
        const lastMonth = new Date()
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        return {
          dateFrom: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString().split('T')[0],
          dateTo: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString().split('T')[0]
        }
      case 'with_pdf':
        return { hasPdf: true }
      case 'without_pdf':
        return { hasPdf: false }
      case 'sales_only':
        return { transactionTypes: ['sale'] }
      case 'expenses_only':
        return { transactionTypes: ['expense'] }
      case 'cash_only':
        return { paymentMethods: ['cash'] }
      case 'unmatched_only':
        return { bankingStatuses: ['unmatched'] }
      default:
        return {}
    }
  }, [])

  // Hauptfunktion: Transactions laden mit Search/Filter
  const loadTransactions = useCallback(async (
    query: TransactionSearchQuery = {},
    sort: TransactionSort = { field: 'transaction_date', direction: 'desc' }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      setError(null)

      // Base Query auf unified_transactions_view
      let dbQuery = supabase
        .from('unified_transactions_view')
        .select('*')

      // Receipt Number Search (höchste Priorität)
      if (query.receiptNumber) {
        const searchTerm = query.receiptNumber.trim().toLowerCase()
        dbQuery = dbQuery.ilike('receipt_number_lower', `%${searchTerm}%`)
      }

      // Description Search
      if (query.description) {
        const searchTerm = query.description.trim().toLowerCase()
        dbQuery = dbQuery.ilike('description_lower', `%${searchTerm}%`)
      }

      // Amount Filters
      if (query.exactAmount !== undefined) {
        dbQuery = dbQuery.eq('amount', query.exactAmount)
      } else {
        if (query.amountFrom !== undefined) {
          dbQuery = dbQuery.gte('amount', query.amountFrom)
        }
        if (query.amountTo !== undefined) {
          dbQuery = dbQuery.lte('amount', query.amountTo)
        }
      }

      // Date Range
      if (query.dateFrom) {
        dbQuery = dbQuery.gte('date_only', query.dateFrom)
      }
      if (query.dateTo) {
        dbQuery = dbQuery.lte('date_only', query.dateTo)
      }

      // Transaction Type Filter
      if (query.transactionTypes && query.transactionTypes.length > 0) {
        dbQuery = dbQuery.in('transaction_type', query.transactionTypes)
      }

      // Type Code Filter
      if (query.typeCodes && query.typeCodes.length > 0) {
        dbQuery = dbQuery.in('type_code', query.typeCodes)
      }

      // Payment Method Filter
      if (query.paymentMethods && query.paymentMethods.length > 0) {
        dbQuery = dbQuery.in('payment_method', query.paymentMethods)
      }

      // Status Filter
      if (query.statuses && query.statuses.length > 0) {
        dbQuery = dbQuery.in('status', query.statuses)
      }

      // Banking Status Filter
      if (query.bankingStatuses && query.bankingStatuses.length > 0) {
        dbQuery = dbQuery.in('banking_status', query.bankingStatuses)
      }

      // PDF Status Filter
      if (query.hasPdf !== undefined) {
        dbQuery = dbQuery.eq('has_pdf', query.hasPdf)
      }

      // Sorting
      const sortColumn = sort.field === 'receipt_number' ? 'receipt_number' : sort.field
      dbQuery = dbQuery.order(sortColumn, { ascending: sort.direction === 'asc' })

      // Pagination
      if (query.limit) {
        dbQuery = dbQuery.limit(query.limit)
        if (query.offset) {
          dbQuery = dbQuery.range(query.offset, query.offset + query.limit - 1)
        }
      }

      const { data, error: dbError } = await dbQuery

      if (dbError) {
        console.error('❌ Fehler beim Laden der Transactions:', dbError)
        throw dbError
      }

      const transactionData = (data || []).map(tx => {
        // Business-aware PDF Status berechnen
        const pdfInfo = calculatePdfStatus(tx)
        return {
          ...tx,
          pdf_status: pdfInfo.status,
          pdf_requirement: pdfInfo.requirement
        }
      })
      setTransactions(transactionData)

      // Statistiken berechnen
      const calculatedStats = calculateStats(transactionData)
      setStats(calculatedStats)

      return { success: true }

    } catch (err: any) {
      const errorMessage = err.message || 'Fehler beim Laden der Transaktionen'
      console.error('❌ useUnifiedTransactions Error:', err)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Business Logic: PDF Status berechnen
  const calculatePdfStatus = useCallback((tx: any): { status: PdfStatus, requirement: PdfRequirement } => {
    // Cash Movements und Bank Transactions brauchen keine PDFs
    if (tx.transaction_type === 'cash_movement' || tx.transaction_type === 'bank_transaction') {
      return {
        status: 'not_needed',
        requirement: 'not_applicable'
      }
    }

    // Sales und Expenses brauchen PDFs
    if (tx.transaction_type === 'sale' || tx.transaction_type === 'expense') {
      if (tx.has_pdf || tx.document_id) {
        return {
          status: 'available',
          requirement: 'required'
        }
      } else {
        return {
          status: 'missing',
          requirement: 'required'
        }
      }
    }

    // Fallback
    return {
      status: 'not_needed',
      requirement: 'optional'
    }
  }, [])

  // Statistiken berechnen mit business-aware PDF Logic
  const calculateStats = useCallback((transactionData: UnifiedTransaction[]): TransactionStats => {
    const stats: TransactionStats = {
      total: transactionData.length,
      byType: { sale: 0, expense: 0, cash_movement: 0, bank_transaction: 0 },
      byStatus: { completed: 0, cancelled: 0, unmatched: 0, matched: 0 },
      pdfStats: {
        available: 0,
        missing: 0,
        notNeeded: 0,
        generating: 0,
        totalRequired: 0
      },
      withPdf: 0,
      withoutPdf: 0,
      totalAmount: 0,
      amountByType: { sale: 0, expense: 0, cash_movement: 0, bank_transaction: 0 }
    }

    transactionData.forEach(tx => {
      // Type Count
      stats.byType[tx.transaction_type]++

      // Status Count (vereinfacht)
      if (tx.status === 'completed') stats.byStatus.completed++
      else if (tx.status === 'cancelled') stats.byStatus.cancelled++
      else if (tx.banking_status === 'unmatched') stats.byStatus.unmatched++
      else if (tx.banking_status === 'matched' || tx.banking_status === 'fully_matched') stats.byStatus.matched++

      // Business-aware PDF Statistics
      if (tx.pdf_status === 'available') stats.pdfStats.available++
      else if (tx.pdf_status === 'missing') stats.pdfStats.missing++
      else if (tx.pdf_status === 'not_needed') stats.pdfStats.notNeeded++
      else if (tx.pdf_status === 'generating') stats.pdfStats.generating++

      if (tx.pdf_requirement === 'required') stats.pdfStats.totalRequired++

      // Legacy PDF Count (für Kompatibilität)
      if (tx.has_pdf) stats.withPdf++
      else stats.withoutPdf++

      // Amount Totals
      stats.totalAmount += tx.amount
      stats.amountByType[tx.transaction_type] += tx.amount
    })

    return stats
  }, [])

  // Quick Filter anwenden (gibt Query zurück für Kombination)
  const applyQuickFilter = useCallback(async (preset: QuickFilterPreset) => {
    const filterQuery = getQuickFilterQuery(preset)
    return await loadTransactions(filterQuery)
  }, [getQuickFilterQuery, loadTransactions])

  // Get Quick Filter Query (ohne direkt zu laden)
  const getQuickFilterQueryOnly = useCallback((preset: QuickFilterPreset) => {
    return getQuickFilterQuery(preset)
  }, [getQuickFilterQuery])

  // Search by Receipt Number (schnellste Suche)
  const searchByReceiptNumber = useCallback(async (receiptNumber: string) => {
    return await loadTransactions({ receiptNumber })
  }, [loadTransactions])

  // Search by Description
  const searchByDescription = useCallback(async (description: string) => {
    return await loadTransactions({ description })
  }, [loadTransactions])

  // Search by Amount
  const searchByAmount = useCallback(async (exactAmount?: number, amountFrom?: number, amountTo?: number) => {
    return await loadTransactions({ exactAmount, amountFrom, amountTo })
  }, [loadTransactions])

  // Alle Transactions zurücksetzen (ohne Filter)
  const loadAllTransactions = useCallback(async () => {
    return await loadTransactions({})
  }, [loadTransactions])

  // Transaction Details laden (einzelne)
  const getTransactionDetails = useCallback(async (transactionId: string, transactionType: string) => {
    try {
      setLoading(true)
      
      // Je nach Type aus der entsprechenden Tabelle laden
      let tableName = ''
      switch (transactionType) {
        case 'sale': tableName = 'sales'; break
        case 'expense': tableName = 'expenses'; break
        case 'cash_movement': tableName = 'cash_movements'; break
        case 'bank_transaction': tableName = 'bank_transactions'; break
        default: throw new Error(`Unbekannter Transaction Type: ${transactionType}`)
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', transactionId)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (err: any) {
      console.error('❌ Fehler beim Laden der Transaction Details:', err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    // State
    loading,
    error,
    transactions,
    stats,

    // Main Functions
    loadTransactions,
    loadAllTransactions,
    
    // Search Functions
    searchByReceiptNumber,
    searchByDescription,
    searchByAmount,
    
    // Filter Functions
    applyQuickFilter,
    getQuickFilterQuery,
    getQuickFilterQueryOnly,
    
    // Utils
    getTransactionDetails,
    calculateStats,
    calculatePdfStatus
  }
}