// Reconciliation Service
// Sammelt Provider- und Bank-Abgleich Daten für Reports

import { supabase } from '@/shared/lib/supabase/client'
import type { BusinessSettings } from '@/shared/types/businessSettings'
import {
  createSwissDateForDay,
  formatDateForDisplay,
  getLastDayOfMonth,
} from '@/shared/utils/dateUtils'

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface ProviderMatch {
  sale: {
    receiptNumber: string
    amount: number
    date: string
    paymentMethod: string
    saleId: string
  }
  provider: {
    provider: 'twint' | 'sumup'
    netAmount: number
    settlementDate: string
    fees: number
  }
  confidence: number
}

export interface UnmatchedSale {
  receiptNumber: string
  amount: number
  date: string
  paymentMethod: string
  reason: string
}

export interface ProviderReport {
  id: string
  provider: string
  net_amount: number
  settlement_date: string
  fees: number
  status: string
}

export interface TransactionMatch {
  bank_transaction_id: string
  matched_type: string
  matched_id: string
  matched_amount: number
  match_confidence: number
  matched_at: string
  match_type: string
  notes: string | null
}

export interface BankMatch {
  bankTransaction: {
    amount: number
    date: string
    description: string
    bankTransactionId: string
  }
  matchedItems: {
    type: string
    description: string
    amount: number
    itemId: string
    settlementDate?: string
  }[]
  confidence: number
}

export interface UnmatchedBankTransaction {
  amount: number
  date: string
  description: string
  bankTransactionId: string
  suggestions?: string[]
}

export interface CashMovement {
  amount: number
  type: 'cash_in' | 'cash_out'
  date: string
  description: string
  receiptNumber?: string
  referenceType?: string
}

export interface ReconciliationData {
  period: {
    month: string
    year: string
    startDate: string
    endDate: string
  }
  businessSettings: BusinessSettings | null

  providerReconciliation: {
    summary: {
      totalSales: number
      matchedSales: number
      unmatchedSales: number
      matchingRate: number
    }
    matches: ProviderMatch[]
    unmatchedSales: UnmatchedSale[]
  }

  bankReconciliation: {
    summary: {
      totalBankTransactions: number
      matchedTransactions: number
      unmatchedTransactions: number
      matchingRate: number
    }
    matches: BankMatch[]
    unmatchedBankTransactions: UnmatchedBankTransaction[]
  }

  cashMovements: CashMovement[]
}

// =====================================================
// SERVICE FUNCTIONS
// =====================================================

export async function getReconciliationData(
  yearMonth: string // Format: "2024-11"
): Promise<ReconciliationData> {
  const [year, month] = yearMonth.split('-')
  const startDate = `${yearMonth}-01`

  // Calculate end date using Swiss timezone utilities
  const monthDate = createSwissDateForDay(parseInt(year, 10), parseInt(month, 10), 1)
  const lastDayOfMonth = getLastDayOfMonth(monthDate)
  const endDate = `${yearMonth}-${lastDayOfMonth.getDate().toString().padStart(2, '0')}`

  // Parallel data loading
  const [businessSettings, providerReconciliation, bankReconciliation, cashMovements] =
    await Promise.all([
      getBusinessSettings(),
      getProviderReconciliationData(startDate, endDate),
      getBankReconciliationData(startDate, endDate),
      getCashMovementsData(startDate, endDate),
    ])

  return {
    period: {
      month,
      year,
      startDate,
      endDate,
    },
    businessSettings,
    providerReconciliation,
    bankReconciliation,
    cashMovements,
  }
}

// =====================================================
// PROVIDER RECONCILIATION
// =====================================================

async function getProviderReconciliationData(startDate: string, endDate: string) {
  try {
    // Get matched sales - simplified query without nested select
    const { data: matchedSales, error: matchedError } = await supabase
      .from('sales')
      .select('id, receipt_number, total_amount, created_at, payment_method, provider_report_id')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .in('payment_method', ['twint', 'sumup'])
      .not('provider_report_id', 'is', null)

    if (matchedError) {
      // console.error('Error fetching matched sales:', matchedError)
      return {
        summary: { totalSales: 0, matchedSales: 0, unmatchedSales: 0, matchingRate: 0 },
        matches: [],
        unmatchedSales: [],
      }
    }

    // Get provider reports separately
    const providerReportIds = (matchedSales || [])
      .filter((sale) => sale.provider_report_id)
      .map((sale) => sale.provider_report_id)

    let providerReports: ProviderReport[] = []
    if (providerReportIds.length > 0) {
      const { data: reports, error: reportsError } = await supabase
        .from('provider_reports')
        .select('id, provider, net_amount, settlement_date, fees, status')
        .in('id', providerReportIds)

      if (reportsError) {
        // console.error('Error fetching provider reports:', reportsError)
      } else {
        providerReports = reports || []
      }
    }

    // Get unmatched sales (no provider report linked)
    const { data: unmatchedSales, error: unmatchedError } = await supabase
      .from('sales')
      .select('id, receipt_number, total_amount, created_at, payment_method')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .in('payment_method', ['twint', 'sumup'])
      .is('provider_report_id', null)

    if (unmatchedError) {
      // console.error('Error fetching unmatched sales:', unmatchedError)
      // Continue with empty array instead of throwing
    }

    // Join sales with their provider reports
    const matches: ProviderMatch[] = []

    for (const sale of matchedSales || []) {
      const providerReport = providerReports.find((pr) => pr.id === sale.provider_report_id)

      // Only include sales with valid matched provider reports
      if (providerReport && providerReport.status === 'matched') {
        matches.push({
          sale: {
            receiptNumber: sale.receipt_number || sale.id,
            amount: sale.total_amount,
            date: formatDateForDisplay(sale.created_at),
            paymentMethod: sale.payment_method,
            saleId: sale.id,
          },
          provider: {
            provider: providerReport.provider as 'twint' | 'sumup',
            netAmount: providerReport.net_amount,
            settlementDate: providerReport.settlement_date
              ? formatDateForDisplay(providerReport.settlement_date)
              : 'Pending',
            fees: providerReport.fees,
          },
          confidence: 100, // Matched items have 100% confidence
        })
      }
    }

    // Process unmatched sales with Swiss timezone formatting
    const unmatchedSalesProcessed: UnmatchedSale[] = (unmatchedSales || []).map((sale) => ({
      receiptNumber: sale.receipt_number || sale.id,
      amount: sale.total_amount,
      date: formatDateForDisplay(sale.created_at),
      paymentMethod: sale.payment_method,
      reason: 'Kein Provider-Settlement gefunden',
    }))

    const totalSales = matches.length + (unmatchedSales?.length || 0)
    const matchedCount = matches.length

    return {
      summary: {
        totalSales,
        matchedSales: matchedCount,
        unmatchedSales: unmatchedSales?.length || 0,
        matchingRate: totalSales > 0 ? Math.round((matchedCount / totalSales) * 100) : 0,
      },
      matches,
      unmatchedSales: unmatchedSalesProcessed,
    }
  } catch (error) {
    console.error('Error in getProviderReconciliationData:', error)
    // Return empty data structure on error
    return {
      summary: {
        totalSales: 0,
        matchedSales: 0,
        unmatchedSales: 0,
        matchingRate: 0,
      },
      matches: [],
      unmatchedSales: [],
    }
  }
}

// =====================================================
// BANK RECONCILIATION
// =====================================================

async function getBankReconciliationData(startDate: string, endDate: string) {
  try {
    // Get all bank transactions in the period first
    const { data: allBankTransactions, error: allBankError } = await supabase
      .from('bank_transactions')
      .select('id, amount, transaction_date, description, status')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false })

    if (allBankError) {
      // console.error('Error fetching all bank transactions:', allBankError)
      return {
        summary: {
          totalBankTransactions: 0,
          matchedTransactions: 0,
          unmatchedTransactions: 0,
          matchingRate: 0,
        },
        matches: [],
        unmatchedBankTransactions: [],
      }
    }

    // Get transaction matches for all bank transactions in this period
    const bankTransactionIds = (allBankTransactions || []).map((tx) => tx.id)
    let bankMatches: TransactionMatch[] = []

    if (bankTransactionIds.length > 0) {
      // Get all transaction matches first
      const { data: matchesData, error: bankMatchError } = await supabase
        .from('transaction_matches')
        .select(
          'bank_transaction_id, matched_type, matched_id, matched_amount, match_confidence, matched_at, match_type, notes'
        )
        .in('bank_transaction_id', bankTransactionIds)

      if (bankMatchError) {
        // console.error('Error fetching bank matches:', bankMatchError)
        // Continue with empty matches instead of failing
      } else {
        bankMatches = matchesData || []
      }

      // Get detailed data for all match types in parallel
      const providerMatchIds = bankMatches
        .filter((m) => m.matched_type === 'provider_batch')
        .map((m) => m.matched_id)
      const expenseMatchIds = bankMatches
        .filter((m) => m.matched_type === 'expense')
        .map((m) => m.matched_id)
      const ownerTxMatchIds = bankMatches
        .filter((m) => m.matched_type === 'owner_transaction')
        .map((m) => m.matched_id)

      const [providerReports, expenses, ownerTransactions] = await Promise.all([
        // Load provider reports with all relevant fields
        providerMatchIds.length > 0
          ? supabase
              .from('provider_reports')
              .select('id, settlement_date, provider, gross_amount, net_amount, fees')
              .in('id', providerMatchIds)
              .then((result) => result.data || [])
          : Promise.resolve([]),

        // Load expenses with all relevant fields
        expenseMatchIds.length > 0
          ? supabase
              .from('expenses')
              .select('id, description, category, payment_date')
              .in('id', expenseMatchIds)
              .then((result) => result.data || [])
          : Promise.resolve([]),

        // Load owner transactions with all relevant fields
        ownerTxMatchIds.length > 0
          ? supabase
              .from('owner_transactions')
              .select('id, description, transaction_type')
              .in('id', ownerTxMatchIds)
              .then((result) => result.data || [])
          : Promise.resolve([]),
      ])

      // Add detailed data to matches
      bankMatches = bankMatches.map((match) => {
        switch (match.matched_type) {
          case 'provider_batch': {
            const providerData = providerReports.find((pr) => pr.id === match.matched_id)
            return { ...match, detailedData: providerData }
          }
          case 'expense': {
            const expenseData = expenses.find((ex) => ex.id === match.matched_id)
            return { ...match, detailedData: expenseData }
          }
          case 'owner_transaction': {
            const ownerTxData = ownerTransactions.find((ot) => ot.id === match.matched_id)
            return { ...match, detailedData: ownerTxData }
          }
          default:
            return match
        }
      })
    }

    // Separate matched and unmatched bank transactions
    const matchedBankTransactionIds = new Set(bankMatches.map((m) => m.bank_transaction_id))
    const matchedBankTransactions = (allBankTransactions || []).filter(
      (tx) => matchedBankTransactionIds.has(tx.id) || tx.status === 'matched'
    )
    const unmatchedBankTransactions = (allBankTransactions || []).filter(
      (tx) => !matchedBankTransactionIds.has(tx.id) && tx.status !== 'matched'
    )

    // Already have unmatched transactions from above

    // Group bank matches by bank transaction (improved logic)
    const matchesGrouped = bankMatches.reduce(
      (acc, match) => {
        const bankTxId = match.bank_transaction_id
        const bankTx = matchedBankTransactions.find((bt) => bt.id === bankTxId)

        if (!acc[bankTxId] && bankTx) {
          acc[bankTxId] = {
            bankTransaction: {
              amount: bankTx.amount,
              date: formatDateForDisplay(bankTx.transaction_date),
              description: bankTx.description,
              bankTransactionId: bankTxId,
            },
            matchedItems: [],
            confidence: match.match_confidence || 0,
          }
        }

        if (acc[bankTxId]) {
          acc[bankTxId].matchedItems.push({
            type: match.matched_type,
            description: getMatchedItemDescription(
              match.matched_type,
              match.matched_amount,
              match.detailedData,
              match
            ),
            amount: match.matched_amount,
            itemId: match.matched_id,
            settlementDate: match.detailedData?.settlement_date
              ? formatDateForDisplay(match.detailedData.settlement_date)
              : undefined,
          })
        }

        return acc
      },
      {} as Record<string, BankMatch>
    )

    const matches: BankMatch[] = Object.values(matchesGrouped)

    // Process unmatched bank transactions with Swiss timezone formatting
    const unmatchedBankTransactionsProcessed: UnmatchedBankTransaction[] =
      unmatchedBankTransactions.map((tx) => ({
        amount: tx.amount,
        date: formatDateForDisplay(tx.transaction_date),
        description: tx.description,
        bankTransactionId: tx.id,
        suggestions: generateSuggestions(tx), // Add intelligent suggestions
      }))

    const totalBankTx = (allBankTransactions || []).length
    const matchedCount = matches.length

    return {
      summary: {
        totalBankTransactions: totalBankTx,
        matchedTransactions: matchedCount,
        unmatchedTransactions: unmatchedBankTransactionsProcessed.length,
        matchingRate: totalBankTx > 0 ? Math.round((matchedCount / totalBankTx) * 100) : 0,
      },
      matches,
      unmatchedBankTransactions: unmatchedBankTransactionsProcessed,
    }
  } catch (error) {
    console.error('Error in getBankReconciliationData:', error)
    return {
      summary: {
        totalBankTransactions: 0,
        matchedTransactions: 0,
        unmatchedTransactions: 0,
        matchingRate: 0,
      },
      matches: [],
      unmatchedBankTransactions: [],
    }
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getBusinessSettings(): Promise<BusinessSettings | null> {
  try {
    const { getBusinessSettings } = await import('./businessSettingsService')
    return await getBusinessSettings()
  } catch (error) {
    console.error('Error loading business settings:', error)
    return null
  }
}

function getMatchedItemDescription(
  type: string,
  amount: number,
  detailedData: unknown,
  matchData: unknown
): string {
  switch (type) {
    case 'sale':
      return `Verkauf (${amount.toFixed(2)} CHF)`

    case 'provider_batch':
      if (detailedData) {
        const provider = detailedData.provider?.toUpperCase() || 'Provider'
        const netAmount = detailedData.net_amount?.toFixed(2) || amount.toFixed(2)
        const fees = detailedData.fees?.toFixed(2) || '0.00'
        const settlementDate = detailedData.settlement_date
          ? formatDateForDisplay(detailedData.settlement_date)
          : 'Datum unbekannt'
        return `${provider} Settlement (${netAmount} CHF netto, Gebühren: ${fees} CHF) - ${settlementDate}`
      }
      return `Anbieter-Abrechnung (${amount.toFixed(2)} CHF)`

    case 'expense':
      if (detailedData) {
        const description = detailedData.description || 'Ausgabe'
        const category = detailedData.category ? getCategoryDisplayName(detailedData.category) : ''
        const paymentDate = detailedData.payment_date
          ? formatDateForDisplay(detailedData.payment_date)
          : ''
        const categoryPart = category ? ` (Kategorie: ${category})` : ''
        const datePart = paymentDate ? ` - ${paymentDate}` : ''
        return `Ausgabe: ${description}${categoryPart}${datePart}`
      }
      return `Ausgabe (${amount.toFixed(2)} CHF)`

    case 'owner_transaction':
      if (detailedData) {
        const description = detailedData.description || 'Owner-Transaktion'
        const txType = detailedData.transaction_type
        const typeLabel =
          txType === 'withdrawal'
            ? 'Privatentnahme'
            : txType === 'deposit'
              ? 'Kapitaleinlage'
              : 'Owner-Transaktion'
        const matchTypeLabel =
          matchData?.match_type === 'automatic' ? ' - Automatisch abgeglichen' : ''
        return `${typeLabel}: ${description}${matchTypeLabel}`
      }
      return `Owner-Transaktion (${amount.toFixed(2)} CHF)`

    case 'cash_movement':
      return `Bargeldbewegung (${amount.toFixed(2)} CHF)`

    default:
      return `${type} (${amount.toFixed(2)} CHF)`
  }
}

function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    rent: 'Miete',
    utilities: 'Nebenkosten',
    supplies: 'Material',
    equipment: 'Ausstattung',
    marketing: 'Marketing',
    insurance: 'Versicherung',
    professional_services: 'Beratung',
    travel: 'Reisen',
    meals: 'Bewirtung',
    other: 'Sonstiges',
  }
  return categoryMap[category] || category
}

function generateSuggestions(transaction: { amount: number; description?: string }): string[] {
  const suggestions: string[] = []
  const amount = Math.abs(transaction.amount)
  const description = transaction.description?.toLowerCase() || ''

  // Analyze transaction patterns for suggestions
  if (description.includes('twint') || description.includes('payment')) {
    suggestions.push('Möglicherweise TWINT-Settlement')
  }

  if (description.includes('sumup') || description.includes('card')) {
    suggestions.push('Möglicherweise SumUp-Settlement')
  }

  if (
    description.includes('bar') ||
    description.includes('cash') ||
    description.includes('einzahlung')
  ) {
    suggestions.push('Möglicherweise Bargeld-Einzahlung')
  }

  if (
    description.includes('owner') ||
    description.includes('darlehen') ||
    description.includes('privat')
  ) {
    suggestions.push('Möglicherweise Owner-Transaktion')
  }

  if (amount > 1000) {
    suggestions.push('Großer Betrag - prüfen Sie Owner-Transaktionen')
  }

  if (suggestions.length === 0) {
    suggestions.push('Manuelle Zuordnung erforderlich')
  }

  return suggestions.slice(0, 2) // Limit to 2 suggestions
}

// =====================================================
// CASH MOVEMENTS - BATCH LOADING SYSTEM
// =====================================================

// Interfaces for batch loading polymorphic references
interface ReferencedEntity {
  id: string
  displayName: string
  entityType: 'sale' | 'expense' | 'owner_transaction' | 'provider_batch'
  // Provider-specific data
  provider?: 'twint' | 'sumup'
  settlementDate?: string
  grossAmount?: number
  netAmount?: number
  fees?: number
  // Expense-specific data
  category?: string
  paymentDate?: string
  // Owner transaction-specific data
  transactionType?: 'withdrawal' | 'deposit'
  // Match metadata
  matchType?: 'automatic' | 'manual' | 'suggested'
  matchedAt?: string
  notes?: string
}

interface ReferenceGroups {
  sales: string[]
  expenses: string[]
  owner_transactions: string[]
}

interface BatchLoadedReferences {
  sales: Map<string, ReferencedEntity>
  expenses: Map<string, ReferencedEntity>
  owner_transactions: Map<string, ReferencedEntity>
}

interface RawCashMovement {
  amount: number
  type: string
  description: string
  created_at: string
  reference_type: string | null
  reference_id: string | null
}

// Batch Loading Helper Functions

function groupReferencesByType(movements: RawCashMovement[]): ReferenceGroups {
  const groups: ReferenceGroups = {
    sales: [],
    expenses: [],
    owner_transactions: [],
  }

  for (const movement of movements) {
    if (!movement.reference_id || !movement.reference_type) continue

    switch (movement.reference_type) {
      case 'sale':
        groups.sales.push(movement.reference_id)
        break
      case 'expense':
        groups.expenses.push(movement.reference_id)
        break
      case 'owner_transaction':
        groups.owner_transactions.push(movement.reference_id)
        break
      // 'adjustment' entries typically have no reference_id
    }
  }

  return groups
}

async function batchLoadSalesReferences(
  salesIds: string[]
): Promise<Map<string, ReferencedEntity>> {
  if (salesIds.length === 0) return new Map()

  const { data: sales } = await supabase
    .from('sales')
    .select('id, receipt_number')
    .in('id', salesIds)

  const salesMap = new Map<string, ReferencedEntity>()
  for (const sale of sales || []) {
    salesMap.set(sale.id, {
      id: sale.id,
      displayName: sale.receipt_number || sale.id,
    })
  }

  return salesMap
}

async function batchLoadExpensesReferences(
  expenseIds: string[]
): Promise<Map<string, ReferencedEntity>> {
  if (expenseIds.length === 0) return new Map()

  const { data: expenses } = await supabase
    .from('expenses')
    .select('id, description')
    .in('id', expenseIds)

  const expensesMap = new Map<string, ReferencedEntity>()
  for (const expense of expenses || []) {
    expensesMap.set(expense.id, {
      id: expense.id,
      displayName: expense.description || `Expense ${expense.id.slice(0, 8)}`,
    })
  }

  return expensesMap
}

async function batchLoadOwnerTransactionReferences(
  ownerTxIds: string[]
): Promise<Map<string, ReferencedEntity>> {
  if (ownerTxIds.length === 0) return new Map()

  const { data: ownerTransactions } = await supabase
    .from('owner_transactions')
    .select('id, description')
    .in('id', ownerTxIds)

  const ownerTxMap = new Map<string, ReferencedEntity>()
  for (const tx of ownerTransactions || []) {
    ownerTxMap.set(tx.id, {
      id: tx.id,
      displayName: tx.description || `Owner Tx ${tx.id.slice(0, 8)}`,
    })
  }

  return ownerTxMap
}

async function batchLoadAllReferences(groups: ReferenceGroups): Promise<BatchLoadedReferences> {
  // Load all reference types in parallel for maximum performance
  const [sales, expenses, owner_transactions] = await Promise.all([
    batchLoadSalesReferences(groups.sales),
    batchLoadExpensesReferences(groups.expenses),
    batchLoadOwnerTransactionReferences(groups.owner_transactions),
  ])

  return { sales, expenses, owner_transactions }
}

// Map singular reference_type to plural keys in BatchLoadedReferences
function getReferenceMapKey(referenceType: string): keyof BatchLoadedReferences | null {
  switch (referenceType) {
    case 'sale':
      return 'sales'
    case 'expense':
      return 'expenses'
    case 'owner_transaction':
      return 'owner_transactions'
    default:
      return null
  }
}

function mergeCashMovementsWithReferences(
  movements: RawCashMovement[],
  references: BatchLoadedReferences
): CashMovement[] {
  return movements.map((movement) => {
    let receiptNumber: string | undefined

    if (movement.reference_id && movement.reference_type) {
      const referenceMapKey = getReferenceMapKey(movement.reference_type)
      if (referenceMapKey) {
        const referenceMap = references[referenceMapKey]
        const referencedEntity = referenceMap?.get(movement.reference_id)
        receiptNumber = referencedEntity?.displayName
      }
    }

    return {
      amount: movement.amount,
      type: movement.type,
      date: formatDateForDisplay(movement.created_at),
      description: movement.description,
      receiptNumber,
      referenceType: movement.reference_type,
    }
  })
}

// Main function with structured batch loading
async function getCashMovementsData(startDate: string, endDate: string): Promise<CashMovement[]> {
  try {
    // Step 1: Load raw cash movements (single query)
    const { data: rawMovements, error } = await supabase
      .from('cash_movements')
      .select('amount, type, description, created_at, reference_type, reference_id')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)
      .order('created_at', { ascending: true })

    if (error) {
      // console.error('Error loading cash movements:', error)
      return []
    }

    if (!rawMovements || rawMovements.length === 0) {
      return []
    }

    // Step 2: Group reference IDs by type
    const referenceGroups = groupReferencesByType(rawMovements)

    // Step 3: Batch load all referenced entities in parallel
    const loadedReferences = await batchLoadAllReferences(referenceGroups)

    // Step 4: Merge movements with their references (in-memory join)
    return mergeCashMovementsWithReferences(rawMovements, loadedReferences)
  } catch (error) {
    console.error('Error in getCashMovementsData:', error)
    return []
  }
}
