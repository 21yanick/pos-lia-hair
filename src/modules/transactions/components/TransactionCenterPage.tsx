'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { useUnifiedTransactions } from '../hooks/useUnifiedTransactions'
import { 
  type TransactionSearchQuery, 
  type QuickFilterPreset,
  type UnifiedTransaction,
  type PdfStatus 
} from '../types/unifiedTransactions'
import { formatCurrency } from '@/shared/utils/index'
import { formatDateForDisplay, formatTimeForDisplay } from '@/shared/utils/dateUtils'
import { DateRangePicker } from './DateRangePicker'
import { usePdfActions } from '../hooks/usePdfActions'

// Multi-Filter State Interface
interface ActiveFilters {
  dateFilter: QuickFilterPreset | null
  typeFilters: QuickFilterPreset[]
  statusFilters: QuickFilterPreset[]
}

// Quick Filter Buttons Component - Multi-Select Design
const QuickFilters = ({ 
  activeFilters,
  onFiltersChange,
  dateRange, 
  onDateRangeChange 
}: { 
  activeFilters: ActiveFilters
  onFiltersChange: (filters: ActiveFilters) => void
  dateRange?: DateRange
  onDateRangeChange: (dateRange: DateRange | undefined) => void
}) => {
  // Zeit-Filter (nur einer aktiv)
  const dateFilters = [
    { preset: 'today' as QuickFilterPreset, label: 'Heute' },
    { preset: 'this_week' as QuickFilterPreset, label: 'Diese Woche' },
    { preset: 'this_month' as QuickFilterPreset, label: 'Dieser Monat' },
  ]

  // Typ-Filter (kombinierbar)
  const typeFilters = [
    { preset: 'sales_only' as QuickFilterPreset, label: 'Verkäufe' },
    { preset: 'expenses_only' as QuickFilterPreset, label: 'Ausgaben' },
  ]

  // Status-Filter (kombinierbar)
  const statusFilters = [
    { preset: 'with_pdf' as QuickFilterPreset, label: 'Mit PDF' },
    { preset: 'without_pdf' as QuickFilterPreset, label: 'Ohne PDF' },
    { preset: 'unmatched_only' as QuickFilterPreset, label: 'Unabgeglichen' },
  ]

  const handleDateFilterClick = (preset: QuickFilterPreset) => {
    const newFilters = {
      ...activeFilters,
      dateFilter: activeFilters.dateFilter === preset ? null : preset
    }
    onFiltersChange(newFilters)
    // Reset custom date range when clicking preset
    if (dateRange) {
      onDateRangeChange(undefined)
    }
  }

  const handleTypeFilterClick = (preset: QuickFilterPreset) => {
    const newTypeFilters = activeFilters.typeFilters.includes(preset)
      ? activeFilters.typeFilters.filter(f => f !== preset)
      : [...activeFilters.typeFilters, preset]
    
    const newFilters = {
      ...activeFilters,
      typeFilters: newTypeFilters
    }
    onFiltersChange(newFilters)
  }

  const handleStatusFilterClick = (preset: QuickFilterPreset) => {
    const newStatusFilters = activeFilters.statusFilters.includes(preset)
      ? activeFilters.statusFilters.filter(f => f !== preset)
      : [...activeFilters.statusFilters, preset]
    
    const newFilters = {
      ...activeFilters,
      statusFilters: newStatusFilters
    }
    onFiltersChange(newFilters)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Zeit-Filter Gruppe */}
      <div className="flex flex-wrap gap-1">
        {dateFilters.map(({ preset, label }) => (
          <Button
            key={preset}
            variant={activeFilters.dateFilter === preset ? "default" : "outline"}
            size="sm"
            onClick={() => handleDateFilterClick(preset)}
            className="text-xs"
          >
            {label}
          </Button>
        ))}
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          placeholder="Zeitraum"
        />
      </div>
      
      {/* Trennlinie */}
      <div className="h-6 w-px bg-border" />
      
      {/* Typ-Filter Gruppe */}
      <div className="flex flex-wrap gap-1">
        {typeFilters.map(({ preset, label }) => (
          <Button
            key={preset}
            variant={activeFilters.typeFilters.includes(preset) ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeFilterClick(preset)}
            className="text-xs"
          >
            {label}
          </Button>
        ))}
      </div>
      
      {/* Trennlinie */}
      <div className="h-6 w-px bg-border" />
      
      {/* Status-Filter Gruppe */}
      <div className="flex flex-wrap gap-1">
        {statusFilters.map(({ preset, label }) => (
          <Button
            key={preset}
            variant={activeFilters.statusFilters.includes(preset) ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilterClick(preset)}
            className="text-xs"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}

// Transaction Type Badge Component
const TransactionTypeBadge = ({ typeCode }: { 
  typeCode: string
}) => {
  const getBadgeVariant = (code: string) => {
    switch (code) {
      case 'VK': return 'default'    // Verkäufe - Grün
      case 'AG': return 'destructive' // Ausgaben - Rot
      case 'CM': return 'secondary'   // Cash Movements - Orange
      case 'BT': return 'outline'     // Bank Transactions - Blau
      default: return 'outline'
    }
  }

  return (
    <Badge variant={getBadgeVariant(typeCode)} className="font-mono">
      {typeCode}
    </Badge>
  )
}

// PDF Status Icon Component mit echten PDF Actions
const PdfStatusIcon = ({ 
  transaction, 
  onPdfAction 
}: { 
  transaction: UnifiedTransaction
  onPdfAction?: (transaction: UnifiedTransaction) => Promise<void>
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const getPdfIconConfig = (status: PdfStatus, loading: boolean) => {
    if (loading) {
      return {
        icon: <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>,
        tooltip: 'PDF wird verarbeitet...',
        clickable: false
      }
    }

    switch (status) {
      case 'available':
        return {
          icon: <FileText className="w-4 h-4 text-green-600 cursor-pointer hover:scale-110 transition-transform" />,
          tooltip: 'PDF öffnen',
          clickable: true
        }
      case 'missing':
        return {
          icon: <AlertCircle className="w-4 h-4 text-yellow-500 cursor-pointer hover:scale-110 transition-transform" />,
          tooltip: 'PDF erstellen',
          clickable: true
        }
      case 'not_needed':
        return {
          icon: <span className="text-xs text-muted-foreground">–</span>,
          tooltip: 'Kein PDF nötig',
          clickable: false
        }
      case 'generating':
        return {
          icon: <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>,
          tooltip: 'PDF wird erstellt...',
          clickable: false
        }
      default:
        return {
          icon: <XCircle className="w-4 h-4 text-red-400" />,
          tooltip: 'Status unbekannt',
          clickable: false
        }
    }
  }

  const config = getPdfIconConfig(transaction.pdf_status, isLoading)
  
  const handleClick = async (e: React.MouseEvent) => {
    if (!config.clickable || isLoading) return
    
    e.stopPropagation()
    setIsLoading(true)
    
    try {
      if (onPdfAction) {
        await onPdfAction(transaction)
      }
    } catch (error) {
      console.error('PDF Action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div 
      className="flex justify-center" 
      title={config.tooltip}
      onClick={handleClick}
    >
      {config.icon}
    </div>
  )
}

// Main Transactions Table Component
const TransactionsTable = ({ 
  transactions, 
  onTransactionClick,
  onPdfAction 
}: { 
  transactions: UnifiedTransaction[]
  onTransactionClick: (transaction: UnifiedTransaction) => void
  onPdfAction?: (transaction: UnifiedTransaction) => Promise<void>
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Zeit</th>
              <th className="text-left p-3 font-medium">Typ</th>
              <th className="text-left p-3 font-medium">Beleg-Nr.</th>
              <th className="text-left p-3 font-medium">Beschreibung</th>
              <th className="text-right p-3 font-medium">Betrag</th>
              <th className="text-center p-3 font-medium">PDF</th>
              <th className="text-center p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr 
                key={tx.id} 
                className="border-t hover:bg-muted/25 cursor-pointer transition-colors"
                onClick={() => onTransactionClick(tx)}
              >
                <td className="p-3">
                  <div className="text-sm">
                    <div className="font-medium">{formatTimeForDisplay(tx.transaction_date)}</div>
                    <div className="text-muted-foreground">{formatDateForDisplay(tx.transaction_date)}</div>
                  </div>
                </td>
                <td className="p-3">
                  <TransactionTypeBadge 
                    typeCode={tx.type_code} 
                  />
                </td>
                <td className="p-3">
                  <span className="font-mono text-sm">{tx.receipt_number}</span>
                </td>
                <td className="p-3">
                  <div className="max-w-xs truncate text-sm">
                    {tx.description}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <span className={`font-medium ${
                    tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(tx.amount)}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <PdfStatusIcon 
                    transaction={tx} 
                    onPdfAction={onPdfAction}
                  />
                </td>
                <td className="p-3 text-center">
                  {tx.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                  ) : tx.status === 'cancelled' ? (
                    <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {transactions.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Keine Transaktionen gefunden</p>
          <p className="text-sm">Versuchen Sie andere Suchkriterien</p>
        </div>
      )}
    </div>
  )
}

// Stats Overview Component mit business-aware PDF Statistics
const StatsOverview = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">PDFs Verfügbar</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.pdfStats?.available || stats.withPdf}
              </p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">PDFs Fehlen</p>
              <p className="text-2xl font-bold text-yellow-500">
                {stats.pdfStats?.missing || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                von {stats.pdfStats?.totalRequired || stats.byType?.sale + stats.byType?.expense || 0} nötig
              </p>
            </div>
            <AlertCircle className="w-6 h-6 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gesamt</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <Banknote className="w-6 h-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Transaction Center Page
export default function TransactionCenterPage() {
  const {
    loading,
    error,
    transactions,
    stats,
    loadAllTransactions,
    loadTransactions,
    searchByReceiptNumber,
    searchByDescription,
    getQuickFilterQuery
  } = useUnifiedTransactions()

  const {
    loading: pdfLoading,
    error: pdfError,
    handlePdfAction
  } = usePdfActions()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    dateFilter: null,
    typeFilters: [],
    statusFilters: []
  })
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // Helper function to convert DateRange to search query
  const dateRangeToQuery = (range?: DateRange): Partial<TransactionSearchQuery> => {
    if (!range?.from) return {}
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    
    return {
      dateFrom: formatDate(range.from),
      dateTo: range.to ? formatDate(range.to) : formatDate(range.from)
    }
  }

  // Build combined query from all active filters
  const buildCombinedQuery = (): TransactionSearchQuery => {
    let query: TransactionSearchQuery = {}

    // Date filter (preset or custom range)
    if (activeFilters.dateFilter) {
      const dateQuery = getQuickFilterQuery(activeFilters.dateFilter)
      query = { ...query, ...dateQuery }
    } else if (dateRange?.from) {
      query = { ...query, ...dateRangeToQuery(dateRange) }
    }

    // Type filters
    if (activeFilters.typeFilters.length > 0) {
      const typeQueries = activeFilters.typeFilters.map(filter => getQuickFilterQuery(filter))
      // Combine transaction types
      const transactionTypes = typeQueries
        .map(q => q.transactionTypes)
        .filter((types): types is ('sale' | 'expense' | 'cash_movement' | 'bank_transaction')[] => Boolean(types))
        .flat()
      if (transactionTypes.length > 0) {
        query.transactionTypes = transactionTypes
      }
    }

    // Status filters 
    if (activeFilters.statusFilters.length > 0) {
      const statusQueries = activeFilters.statusFilters.map(filter => getQuickFilterQuery(filter))
      // Combine different status types
      statusQueries.forEach(statusQuery => {
        if (statusQuery.hasPdf !== undefined) {
          query.hasPdf = statusQuery.hasPdf
        }
        if (statusQuery.bankingStatuses) {
          query.bankingStatuses = [...(query.bankingStatuses || []), ...statusQuery.bankingStatuses]
        }
      })
    }

    return query
  }

  // Initial Load
  useEffect(() => {
    loadAllTransactions()
  }, [loadAllTransactions])

  // Apply filters when they change
  useEffect(() => {
    const hasActiveFilters = activeFilters.dateFilter || 
                           activeFilters.typeFilters.length > 0 || 
                           activeFilters.statusFilters.length > 0 || 
                           dateRange?.from

    if (hasActiveFilters) {
      const combinedQuery = buildCombinedQuery()
      loadTransactions(combinedQuery)
    } else {
      loadAllTransactions()
    }
  }, [activeFilters, dateRange, loadTransactions, loadAllTransactions])

  // Search Handler
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    // Reset filters when searching
    setActiveFilters({ dateFilter: null, typeFilters: [], statusFilters: [] })
    setDateRange(undefined)
    
    if (!query.trim()) {
      await loadAllTransactions()
      return
    }

    // Intelligente Suche: Receipt Number hat Priorität
    if (query.match(/^[A-Z]{2}\d{4}/)) {
      // Receipt Number Pattern (VK2025, AG2025, etc.)
      await searchByReceiptNumber(query)
    } else {
      // Description Search
      await searchByDescription(query)
    }
  }

  // Filter Change Handler
  const handleFiltersChange = (newFilters: ActiveFilters) => {
    setActiveFilters(newFilters)
    setSearchQuery('') // Reset search when filtering
  }

  // Date Range Handler
  const handleDateRangeChange = async (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange)
    setActiveFilters(prev => ({ ...prev, dateFilter: null })) // Reset date preset
    setSearchQuery('')
  }

  // Clear all filters
  const handleClearFilters = async () => {
    setSearchQuery('')
    setActiveFilters({ dateFilter: null, typeFilters: [], statusFilters: [] })
    setDateRange(undefined)
    await loadAllTransactions()
  }

  // Transaction Click Handler
  const handleTransactionClick = (transaction: UnifiedTransaction) => {
    console.log('Transaction Details:', transaction)
    // TODO: Open transaction details modal or navigate to details page
  }

  // PDF Action Handler mit Feedback
  const handlePdfActionWithFeedback = async (transaction: UnifiedTransaction) => {
    try {
      const result = await handlePdfAction(transaction)
      
      if (result.success) {
        // Erfolgreich - ggf. UI refresh
        if (transaction.pdf_status === 'missing') {
          // Nach PDF-Generierung neu laden
          await loadAllTransactions()
        }
      } else {
        // Fehler anzeigen
        console.error('PDF Action failed:', result.error)
        // TODO: Toast notification mit Fehler
      }
    } catch (error) {
      console.error('PDF Action error:', error)
      // TODO: Toast notification mit Fehler
    }
  }

  const hasActiveFilters = activeFilters.dateFilter || 
                          activeFilters.typeFilters.length > 0 || 
                          activeFilters.statusFilters.length > 0 ||
                          dateRange?.from ||
                          searchQuery

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Center</h1>
          <p className="text-muted-foreground">
            Übersicht und Verwaltung aller Transaktionen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Erweiterte Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="VK2025000076 oder Beschreibung suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery)
                  }
                }}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleSearch(searchQuery)}>
              Suchen
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                Zurücksetzen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters - Schlanke Version */}
      <Card>
        <CardContent className="p-4">
          <QuickFilters 
            activeFilters={activeFilters}
            onFiltersChange={handleFiltersChange}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </CardContent>
      </Card>

      {/* Error Display */}
      {(error || pdfError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>Fehler: {error || pdfError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {(loading || pdfLoading) && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
              <span>
                {loading && 'Transaktionen werden geladen...'}
                {pdfLoading && 'PDF wird verarbeitet...'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Transactions Table */}
      {!loading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alle Transaktionen</CardTitle>
                <CardDescription>
                  {stats.total} Transaktionen gefunden
                  {hasActiveFilters && ' (gefiltert)'}
                  {dateRange && ` • ${dateRange.from ? formatDateForDisplay(dateRange.from) : ''} ${dateRange.to && dateRange.to !== dateRange.from ? '- ' + formatDateForDisplay(dateRange.to) : ''}`}
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                Sortiert nach: Neueste zuerst
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TransactionsTable 
              transactions={transactions} 
              onTransactionClick={handleTransactionClick}
              onPdfAction={handlePdfActionWithFeedback}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}