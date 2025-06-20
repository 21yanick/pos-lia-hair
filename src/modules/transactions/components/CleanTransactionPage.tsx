'use client'

import React, { useState, useEffect } from 'react'

// Simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { 
  Search, 
  Filter, 
  FileText, 
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Info
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { useUnifiedTransactions } from '../hooks/useUnifiedTransactions'
import { 
  type TransactionSearchQuery, 
  type QuickFilterPreset,
  type UnifiedTransaction,
  type PdfStatus 
} from '../types/unifiedTransactions'
import { formatCurrency } from '@/shared/utils'
import { formatDateForDisplay, formatTimeForDisplay } from '@/shared/utils/dateUtils'
import { DateRangePicker } from './DateRangePicker'
import { BulkOperationsPanel } from './BulkOperationsPanel'
import { usePdfActions } from '../hooks/usePdfActions'

// Multi-Filter State Interface
interface ActiveFilters {
  dateFilter: QuickFilterPreset | null
  typeFilters: QuickFilterPreset[]
  statusFilters: QuickFilterPreset[]
}

// Quick Filter Buttons Component - Simplified & Theme Compliant
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
    if (dateRange) {
      onDateRangeChange(undefined)
    }
  }

  const handleTypeFilterClick = (preset: QuickFilterPreset) => {
    const newTypeFilters = activeFilters.typeFilters.includes(preset)
      ? activeFilters.typeFilters.filter(f => f !== preset)
      : [...activeFilters.typeFilters, preset]
    
    onFiltersChange({
      ...activeFilters,
      typeFilters: newTypeFilters
    })
  }

  const handleStatusFilterClick = (preset: QuickFilterPreset) => {
    const newStatusFilters = activeFilters.statusFilters.includes(preset)
      ? activeFilters.statusFilters.filter(f => f !== preset)
      : [...activeFilters.statusFilters, preset]
    
    onFiltersChange({
      ...activeFilters,
      statusFilters: newStatusFilters
    })
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

// Transaction Type Badge Component - Theme Compliant
const TransactionTypeBadge = ({ typeCode }: { typeCode: string }) => {
  const getBadgeVariant = (code: string) => {
    switch (code) {
      case 'VK': return 'default'     // Verkäufe
      case 'AG': return 'destructive' // Ausgaben
      case 'CM': return 'secondary'   // Cash Movements
      case 'BT': return 'outline'     // Bank Transactions
      default: return 'outline'
    }
  }

  return (
    <Badge variant={getBadgeVariant(typeCode)} className="font-mono text-xs">
      {typeCode}
    </Badge>
  )
}

// Transaction Status Icon Component - Clean separation
const TransactionStatusIcon = ({ transaction }: { transaction: UnifiedTransaction }) => {
  const getTransactionStatus = () => {
    const { status, transaction_type } = transaction
    
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
          tooltip: transaction_type === 'sale' ? 'Verkauf abgeschlossen' :
                  transaction_type === 'expense' ? 'Ausgabe bezahlt' :
                  transaction_type === 'cash_movement' ? 'Kassenbewegung abgeschlossen' :
                  'Abgeschlossen'
        }
      case 'cancelled':
        return {
          icon: <XCircle className="w-4 h-4 text-red-500" />,
          tooltip: 'Storniert'
        }
      case 'refunded':
        return {
          icon: <XCircle className="w-4 h-4 text-orange-500" />,
          tooltip: 'Rückerstattung'
        }
      case 'matched':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
          tooltip: 'Bank-Transaktion verarbeitet'
        }
      case 'unmatched':
        return {
          icon: <Clock className="w-4 h-4 text-amber-500" />,
          tooltip: 'Bank-Transaktion ausstehend'
        }
      default:
        return {
          icon: <Clock className="w-4 h-4 text-muted-foreground" />,
          tooltip: `Status: ${status}`
        }
    }
  }
  
  const statusConfig = getTransactionStatus()
  
  return (
    <div title={statusConfig.tooltip} className="flex justify-center">
      {statusConfig.icon}
    </div>
  )
}

// Banking Status Icon Component - Clean separation
const BankingStatusIcon = ({ transaction }: { transaction: UnifiedTransaction }) => {
  const getBankingStatus = () => {
    const { banking_status } = transaction
    
    if (!banking_status) {
      return {
        icon: <div className="w-4 h-4 text-muted-foreground">—</div>,
        tooltip: 'Kein Banking-Abgleich erforderlich'
      }
    }
    
    switch (banking_status) {
      case 'unmatched':
        return {
          icon: <Clock className="w-4 h-4 text-amber-500" />,
          tooltip: 'Banking-Abgleich ausstehend'
        }
      case 'provider_matched':
        return {
          icon: <AlertCircle className="w-4 h-4 text-blue-500" />,
          tooltip: 'Provider abgeglichen, Banking ausstehend'
        }
      case 'bank_matched':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
          tooltip: 'Bank abgeglichen'
        }
      case 'fully_matched':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
          tooltip: 'Vollständig abgeglichen'
        }
      case 'matched':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
          tooltip: 'Abgeglichen'
        }
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-muted-foreground" />,
          tooltip: `Banking Status: ${banking_status}`
        }
    }
  }
  
  const statusConfig = getBankingStatus()
  
  return (
    <div title={statusConfig.tooltip} className="flex justify-center">
      {statusConfig.icon}
    </div>
  )
}

// PDF Status Icon Component - Theme Compliant
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
        icon: <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>,
        tooltip: 'PDF wird verarbeitet...',
        clickable: false
      }
    }

    switch (status) {
      case 'available':
        return {
          icon: <FileText className="w-4 h-4 text-green-600 cursor-pointer hover:text-green-700" />,
          tooltip: 'PDF verfügbar - Klicken zum Öffnen',
          clickable: true
        }
      case 'missing':
        return {
          icon: <FileText className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-600" />,
          tooltip: 'PDF fehlt - Klicken zum Generieren',
          clickable: true
        }
      case 'generating':
        return {
          icon: <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>,
          tooltip: 'PDF wird generiert...',
          clickable: false
        }
      case 'not_needed':
        return {
          icon: <div className="w-4 h-4 text-muted-foreground">—</div>,
          tooltip: 'Kein PDF erforderlich',
          clickable: false
        }
      default:
        return {
          icon: <FileText className="w-4 h-4 text-muted-foreground" />,
          tooltip: 'PDF Status unbekannt',
          clickable: false
        }
    }
  }

  const iconConfig = getPdfIconConfig(transaction.pdf_status, isLoading)

  const handleClick = async () => {
    if (!iconConfig.clickable || !onPdfAction || isLoading) return

    try {
      setIsLoading(true)
      await onPdfAction(transaction)
    } catch (error) {
      console.error('PDF action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      title={iconConfig.tooltip} 
      onClick={handleClick}
      className="flex justify-center"
    >
      {iconConfig.icon}
    </div>
  )
}

// Payment Method Badge - Theme Compliant
const PaymentMethodBadge = ({ paymentMethod }: { paymentMethod: string | null }) => {
  if (!paymentMethod) return <span className="text-muted-foreground text-sm">—</span>
  
  const getPaymentMethodDisplay = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Bargeld',
      twint: 'TWINT',
      sumup: 'SumUp',
      card: 'Karte',
      bank: 'Bank'
    }
    return methods[method.toLowerCase()] || method
  }

  const getPaymentMethodVariant = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash': return 'secondary'
      case 'twint': return 'default'
      case 'sumup': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <Badge variant={getPaymentMethodVariant(paymentMethod)} className="text-xs">
      {getPaymentMethodDisplay(paymentMethod)}
    </Badge>
  )
}

// Get transaction type code for badge
const getTypeCode = (transactionType: string): string => {
  switch (transactionType) {
    case 'sale': return 'VK'
    case 'expense': return 'AG'  
    case 'cash_movement': return 'CM'
    case 'bank_transaction': return 'BT'
    default: return '??'
  }
}

// Main Clean Transaction Page Component
export default function CleanTransactionPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    dateFilter: null,
    typeFilters: [],
    statusFilters: []
  })
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // Debounced search for performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Hooks
  const {
    transactions,
    stats,
    loading,
    error,
    loadTransactions,
    getQuickFilterQuery,
    loadAllTransactions
  } = useUnifiedTransactions()
  
  const pdfActions = usePdfActions()

  // Load all transactions on mount
  useEffect(() => {
    loadAllTransactions()
  }, [loadAllTransactions])

  // Execute search/filter when query or filters change
  useEffect(() => {
    const executeQuery = async () => {
      // Build combined query from search, filters, and date range
      let query: TransactionSearchQuery = {}
      
      // Add search term - intelligent detection
      if (debouncedSearchQuery.trim()) {
        const trimmedQuery = debouncedSearchQuery.trim()
        
        // Check if it looks like a receipt number pattern
        if (trimmedQuery.match(/^(VK|AG|CM|BT)/i) || trimmedQuery.match(/^\d+$/)) {
          // Receipt number: starts with VK/AG/CM/BT OR contains only digits
          query.receiptNumber = trimmedQuery
        } else {
          // Otherwise search in description
          query.description = trimmedQuery
        }
      }
      
      // Add date filter
      if (activeFilters.dateFilter) {
        const dateQuery = getQuickFilterQuery(activeFilters.dateFilter)
        query = { ...query, ...dateQuery }
      }
      
      // Add date range
      if (dateRange?.from && dateRange?.to) {
        query.dateFrom = dateRange.from.toISOString().split('T')[0]
        query.dateTo = dateRange.to.toISOString().split('T')[0]
      }
      
      // Apply individual filters
      if (activeFilters.typeFilters.length > 0) {
        for (const preset of activeFilters.typeFilters) {
          const filterQuery = getQuickFilterQuery(preset)
          query = { ...query, ...filterQuery }
        }
      }
      
      if (activeFilters.statusFilters.length > 0) {
        for (const preset of activeFilters.statusFilters) {
          const filterQuery = getQuickFilterQuery(preset)
          query = { ...query, ...filterQuery }
        }
      }
      
      // Execute query
      await loadTransactions(query)
    }
    
    executeQuery()
  }, [debouncedSearchQuery, activeFilters, dateRange, loadTransactions, getQuickFilterQuery])

  // Multi-select handlers
  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const handleSelectAll = () => {
    setSelectedTransactions(transactions.map(tx => tx.id))
  }

  const handleClearSelection = () => {
    setSelectedTransactions([])
  }

  // Get selected transaction objects
  const getSelectedTransactionObjects = () => {
    return transactions.filter(tx => selectedTransactions.includes(tx.id))
  }

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchQuery('')
    setActiveFilters({
      dateFilter: null,
      typeFilters: [],
      statusFilters: []
    })
    setDateRange(undefined)
    loadAllTransactions()
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || 
    activeFilters.dateFilter || 
    activeFilters.typeFilters.length > 0 || 
    activeFilters.statusFilters.length > 0 ||
    dateRange

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
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadAllTransactions}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaktionen</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalAmount)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verkäufe</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType.sale}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.amountByType.sale)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mit PDF</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withPdf}</div>
            <p className="text-xs text-muted-foreground">
              von {stats.pdfStats.totalRequired} erforderlich
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unabgeglichen</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.unmatched}</div>
            <p className="text-xs text-muted-foreground">
              Banking ausstehend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Belegnummer (VK2025000082) oder Beschreibung (Haarschnitt)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllFilters}
                className="text-xs"
              >
                Alle Filter löschen
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <QuickFilters
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </CardContent>
      </Card>

      {/* Bulk Operations Panel */}
      {selectedTransactions.length > 0 && (
        <BulkOperationsPanel
          selectedTransactions={getSelectedTransactionObjects()}
          onClearSelection={handleClearSelection}
          onBulkComplete={() => {
            handleClearSelection()
            loadAllTransactions()
          }}
        />
      )}

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaktionen</span>
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
          </CardTitle>
          {transactions.length > 0 && (
            <CardDescription>
              Zeige {transactions.length} Transaktionen
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <div className="text-destructive">Fehler beim Laden der Transaktionen</div>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                {hasActiveFilters ? 'Keine Transaktionen gefunden' : 'Noch keine Transaktionen vorhanden'}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        <Checkbox
                          checked={selectedTransactions.length === transactions.length}
                          onCheckedChange={(checked) => 
                            checked ? handleSelectAll() : handleClearSelection()
                          }
                        />
                      </th>
                      <th className="text-left p-3">Typ</th>
                      <th className="text-left p-3">Beleg Nr.</th>
                      <th className="text-left p-3">Datum</th>
                      <th className="text-left p-3">Zeit</th>
                      <th className="text-left p-3">Beschreibung</th>
                      <th className="text-right p-3">Betrag</th>
                      <th className="text-left p-3">Zahlung</th>
                      <th className="text-right p-3">Gebühren</th>
                      <th className="text-center p-3">
                        <div className="flex items-center justify-center gap-1">
                          Transaktion
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground">
                                <Info className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3" align="center">
                              <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Transaktions-Status</h4>
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                                  <span>Abgeschlossen</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-3 h-3 text-red-500" />
                                  <span>Storniert</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-3 h-3 text-orange-500" />
                                  <span>Rückerstattung</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span>Ausstehend</span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </th>
                    <th className="text-center p-3">
                      <div className="flex items-center justify-center gap-1">
                        Banking
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground">
                              <Info className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-3" align="center">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Banking-Abgleich</h4>
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                                  <span>Vollständig abgeglichen</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-3 h-3 text-blue-500" />
                                  <span>Provider abgeglichen, Banking ausstehend</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span>Banking-Abgleich ausstehend</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 text-muted-foreground text-center">—</span>
                                  <span>Kein Abgleich erforderlich</span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </th>
                    <th className="text-center p-3">
                      <div className="flex items-center justify-center gap-1">
                        PDF
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground">
                              <Info className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3" align="center">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">PDF-Status</h4>
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3 h-3 text-green-600" />
                                  <span>PDF verfügbar (klickbar)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3 h-3 text-red-500" />
                                  <span>PDF fehlt (klicken zum Generieren)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 border border-blue-600 rounded-full animate-spin"></div>
                                  <span>PDF wird generiert...</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 text-muted-foreground text-center">—</span>
                                  <span>Kein PDF erforderlich</span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedTransactions.includes(transaction.id)}
                          onCheckedChange={() => handleTransactionSelect(transaction.id)}
                        />
                      </td>
                      <td className="p-3">
                        <TransactionTypeBadge typeCode={getTypeCode(transaction.transaction_type)} />
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-sm">
                          {transaction.receipt_number || '—'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {formatDateForDisplay(transaction.transaction_date)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-muted-foreground">
                          {formatTimeForDisplay(transaction.transaction_date)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium truncate">
                            {transaction.description || 'Keine Beschreibung'}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className={`font-medium ${
                          transaction.transaction_type === 'sale' || transaction.transaction_type === 'cash_movement' 
                            ? transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                            : 'text-red-600'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="p-3">
                        <PaymentMethodBadge paymentMethod={transaction.payment_method} />
                      </td>
                      <td className="p-3 text-right">
                        {transaction.payment_method && transaction.payment_method !== 'cash' && transaction.transaction_type === 'sale' ? (
                          <div className="text-sm">
                            {transaction.has_real_provider_fees && transaction.provider_fee ? (
                              // Echte Provider Fees
                              <div className="flex items-center gap-1 justify-end">
                                <span className="font-medium text-orange-600">
                                  -CHF {transaction.provider_fee.toFixed(2)}
                                </span>
                                <span className="text-xs text-green-600" title="Echte Gebühren">✓</span>
                              </div>
                            ) : (
                              // Geschätzte Provider Fees
                              <span className="text-amber-600" title="Geschätzte Gebühren">
                                ~CHF {(transaction.amount * (transaction.payment_method === 'twint' ? 0.016 : 0.0186)).toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <TransactionStatusIcon transaction={transaction} />
                      </td>
                      <td className="p-3">
                        <BankingStatusIcon transaction={transaction} />
                      </td>
                      <td className="p-3">
                        <PdfStatusIcon
                          transaction={transaction}
                          onPdfAction={async (tx) => {
                            await pdfActions.handlePdfAction(tx)
                            await loadAllTransactions() // UI nach PDF-Generierung aktualisieren
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border border-border rounded-lg p-4 space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={selectedTransactions.includes(transaction.id)}
                        onCheckedChange={() => handleTransactionSelect(transaction.id)}
                        className="mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <TransactionTypeBadge typeCode={getTypeCode(transaction.transaction_type)} />
                          {transaction.receipt_number && (
                            <span className="font-mono text-xs text-muted-foreground">
                              {transaction.receipt_number}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-sm leading-tight mb-1">
                          {transaction.description || 'Keine Beschreibung'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDateForDisplay(transaction.transaction_date)}</span>
                          <span>•</span>
                          <span>{formatTimeForDisplay(transaction.transaction_date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className={`font-bold text-lg ${
                        transaction.transaction_type === 'sale' || transaction.transaction_type === 'cash_movement' 
                          ? transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                      {transaction.payment_method && transaction.payment_method !== 'cash' && transaction.transaction_type === 'sale' && (
                        <div className="text-xs text-orange-600 mt-1">
                          Gebühr: {transaction.has_real_provider_fees && transaction.provider_fee ? (
                            `-CHF ${transaction.provider_fee.toFixed(2)}`
                          ) : (
                            `~CHF ${(transaction.amount * (transaction.payment_method === 'twint' ? 0.016 : 0.0186)).toFixed(2)}`
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-3">
                      <PaymentMethodBadge paymentMethod={transaction.payment_method} />
                      <div className="flex items-center gap-1">
                        <TransactionStatusIcon transaction={transaction} />
                        <BankingStatusIcon transaction={transaction} />
                        <PdfStatusIcon
                          transaction={transaction}
                          onPdfAction={async (tx) => {
                            await pdfActions.handlePdfAction(tx)
                            await loadAllTransactions()
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}