// Transaction Export Service
// Adaptiert bestehende Export Utilities für UnifiedTransaction Format

import Papa from 'papaparse'
import { formatDateForDisplay, formatTimeForDisplay } from '@/shared/utils/dateUtils'
import { formatCurrency } from '@/shared/utils/index'
import type { UnifiedTransaction } from '../types/unifiedTransactions'

// =================================
// CSV Export für Transactions
// =================================

export interface TransactionCsvRow {
  datum: string
  zeit: string
  typ: string
  belegnummer: string
  beschreibung: string
  betrag: string
  zahlungsart: string
  status: string
  pdf_status: string
}

/**
 * Export UnifiedTransactions als CSV
 * @param transactions Array von UnifiedTransaction
 * @param filename Optional filename
 */
export function exportTransactionsToCSV(
  transactions: UnifiedTransaction[],
  filename?: string
): void {
  if (transactions.length === 0) {
    throw new Error('Keine Transaktionen zum Exportieren vorhanden')
  }

  // CSV Header (Deutsch für Business Users)
  const headers: (keyof TransactionCsvRow)[] = [
    'datum',
    'zeit',
    'typ',
    'belegnummer',
    'beschreibung',
    'betrag',
    'zahlungsart',
    'status',
    'pdf_status',
  ]

  // Transactions zu CSV Rows konvertieren
  const csvRows: TransactionCsvRow[] = transactions.map((tx) => ({
    datum: formatDateForDisplay(tx.transaction_date),
    zeit: formatTimeForDisplay(tx.transaction_date),
    typ: getTypeDisplayName(tx.transaction_type, tx.type_code),
    belegnummer: tx.receipt_number || '',
    beschreibung: tx.description || '',
    betrag: formatCurrency(tx.amount),
    zahlungsart: getPaymentMethodDisplayName(tx.payment_method),
    status: getStatusDisplayName(tx.status),
    pdf_status: getPdfStatusDisplayName(tx.pdf_status),
  }))

  // CSV generieren mit Papa Parse
  const csvContent = Papa.unparse(
    {
      fields: headers,
      data: csvRows,
    },
    {
      delimiter: ';', // Deutsch/Schweiz Standard
      header: true,
      quotes: true,
    }
  )

  // CSV-Datei herunterladen
  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || generateCsvFilename(transactions)
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Export mit erweiterten Metadaten
 */
export function exportTransactionsToCSVWithMetadata(
  transactions: UnifiedTransaction[],
  metadata: {
    exportTitle?: string
    dateRange?: { from: string; to: string }
    filters?: string[]
    exportedBy?: string
  },
  filename?: string
): void {
  // Metadata Header erstellen
  const metadataRows: string[][] = []

  if (metadata.exportTitle) {
    metadataRows.push([metadata.exportTitle])
    metadataRows.push([])
  }

  metadataRows.push(['Exportiert am:', new Date().toLocaleDateString('de-CH')])

  if (metadata.exportedBy) {
    metadataRows.push(['Exportiert von:', metadata.exportedBy])
  }

  if (metadata.dateRange) {
    metadataRows.push(['Zeitraum:', `${metadata.dateRange.from} bis ${metadata.dateRange.to}`])
  }

  if (metadata.filters && metadata.filters.length > 0) {
    metadataRows.push(['Filter:', metadata.filters.join(', ')])
  }

  metadataRows.push(['Anzahl Transaktionen:', transactions.length.toString()])

  // Statistics
  const stats = calculateExportStats(transactions)
  metadataRows.push(['Gesamtbetrag:', formatCurrency(stats.totalAmount)])
  metadataRows.push(['Verkäufe:', stats.salesCount.toString()])
  metadataRows.push(['Ausgaben:', stats.expensesCount.toString()])
  metadataRows.push(['Mit PDF:', stats.withPdfCount.toString()])
  metadataRows.push([]) // Leerzeile vor Daten

  // Transaction Headers
  const headers: (keyof TransactionCsvRow)[] = [
    'datum',
    'zeit',
    'typ',
    'belegnummer',
    'beschreibung',
    'betrag',
    'zahlungsart',
    'status',
    'pdf_status',
  ]

  // Transaction Data
  const csvRows: TransactionCsvRow[] = transactions.map((tx) => ({
    datum: formatDateForDisplay(tx.transaction_date),
    zeit: formatTimeForDisplay(tx.transaction_date),
    typ: getTypeDisplayName(tx.transaction_type, tx.type_code),
    belegnummer: tx.receipt_number || '',
    beschreibung: tx.description || '',
    betrag: formatCurrency(tx.amount),
    zahlungsart: getPaymentMethodDisplayName(tx.payment_method),
    status: getStatusDisplayName(tx.status),
    pdf_status: getPdfStatusDisplayName(tx.pdf_status),
  }))

  // Alle Rows kombinieren
  const allRows = [...metadataRows, headers, ...csvRows.map((row) => Object.values(row))]

  // CSV generieren
  const csvContent = Papa.unparse(allRows, {
    delimiter: ';',
    quotes: true,
  })

  // Download
  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || generateCsvFilename(transactions, 'detailliert')
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// =================================
// Helper Functions
// =================================

function getTypeDisplayName(type: string, typeCode: string): string {
  switch (type) {
    case 'sale':
      return `Verkauf (${typeCode})`
    case 'expense':
      return `Ausgabe (${typeCode})`
    case 'cash_movement':
      return `Kassenbewegung (${typeCode})`
    case 'bank_transaction':
      return `Bank-Transaktion (${typeCode})`
    default:
      return `${type} (${typeCode})`
  }
}

function getPaymentMethodDisplayName(method: string): string {
  switch (method) {
    case 'cash':
      return 'Bargeld'
    case 'twint':
      return 'TWINT'
    case 'sumup':
      return 'SumUp'
    case 'bank':
      return 'Bank'
    default:
      return method
  }
}

function getStatusDisplayName(status: string): string {
  switch (status) {
    case 'completed':
      return 'Abgeschlossen'
    case 'cancelled':
      return 'Storniert'
    case 'refunded':
      return 'Rückerstattet'
    case 'unmatched':
      return 'Unabgeglichen'
    case 'matched':
      return 'Abgeglichen'
    default:
      return status
  }
}

function getPdfStatusDisplayName(pdfStatus: string): string {
  switch (pdfStatus) {
    case 'available':
      return 'Verfügbar'
    case 'missing':
      return 'Fehlt'
    case 'not_needed':
      return 'Nicht nötig'
    case 'generating':
      return 'Wird erstellt'
    default:
      return pdfStatus
  }
}

function generateCsvFilename(transactions: UnifiedTransaction[], suffix?: string): string {
  const date = new Date().toISOString().split('T')[0]
  const count = transactions.length
  const suffixPart = suffix ? `_${suffix}` : ''

  return `transaktionen_${count}_${date}${suffixPart}.csv`
}

function calculateExportStats(transactions: UnifiedTransaction[]) {
  return {
    totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
    salesCount: transactions.filter((tx) => tx.transaction_type === 'sale').length,
    expensesCount: transactions.filter((tx) => tx.transaction_type === 'expense').length,
    withPdfCount: transactions.filter((tx) => tx.pdf_status === 'available').length,
  }
}

// =================================
// Excel Export (Future Enhancement)
// =================================

/**
 * Export als Excel-Format (für future implementation)
 * Würde SheetJS oder ähnliche Library benötigen
 */
export function exportTransactionsToExcel(
  transactions: UnifiedTransaction[],
  filename?: string
): void {
  // TODO: Implement Excel export with formatting
  // Für jetzt: Fallback zu CSV
  // console.warn('Excel Export noch nicht implementiert, verwende CSV Export')
  exportTransactionsToCSV(transactions, filename?.replace('.xlsx', '.csv'))
}
