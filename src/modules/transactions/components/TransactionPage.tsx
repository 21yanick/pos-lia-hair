'use client'

import React, { useState, useMemo } from 'react'
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
import { useTransactionsQuery, useInvalidateTransactions } from '../hooks/useTransactionsQuery'
import { usePdfActions } from '../hooks/usePdfActions'
import { useDebounce } from '../hooks/useDebounce'
import { 
  type TransactionSearchQuery, 
  type QuickFilterPreset,
  type UnifiedTransaction
} from '../types/unifiedTransactions'
import { formatCurrency } from '@/shared/utils'
import { formatDateForDisplay, formatTimeForDisplay } from '@/shared/utils/dateUtils'
import { DateRangePicker } from './DateRangePicker'
import { toast } from 'sonner'

// Filter State
interface ActiveFilters {
  dateFilter: QuickFilterPreset | null
  typeFilters: QuickFilterPreset[]
  statusFilters: QuickFilterPreset[]
}

// Quick Filters Component
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
  const dateFilters = [
    { preset: 'today' as QuickFilterPreset, label: 'Heute' },
    { preset: 'this_week' as QuickFilterPreset, label: 'Woche' },
    { preset: 'this_month' as QuickFilterPreset, label: 'Monat' },
  ]

  const typeFilters = [
    { preset: 'sales_only' as QuickFilterPreset, label: 'Verkäufe' },
    { preset: 'expenses_only' as QuickFilterPreset, label: 'Ausgaben' },
  ]

  const statusFilters = [
    { preset: 'with_pdf' as QuickFilterPreset, label: 'Mit PDF' },
    { preset: 'without_pdf' as QuickFilterPreset, label: 'Ohne PDF' },
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
    <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
      {/* Date Filters */}
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
      
      {/* Type Filters */}
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
      
      {/* Status Filters */}
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

// Transaction Type Badge
const TransactionTypeBadge = ({ typeCode }: { typeCode: string }) => {
  const getBadgeVariant = (code: string) => {
    switch (code) {
      case 'VK': return 'default'
      case 'AG': return 'destructive'
      case 'CM': return 'secondary'
      case 'BT': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <Badge variant={getBadgeVariant(typeCode)} className="font-mono text-xs">
      {typeCode}
    </Badge>
  )
}

// PDF Status Icon
const PdfStatusIcon = ({ 
  transaction, 
  onPdfAction 
}: { 
  transaction: UnifiedTransaction
  onPdfAction?: (transaction: UnifiedTransaction) => void
}) => {
  const getPdfIconConfig = (status: string) => {
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

  const iconConfig = getPdfIconConfig(transaction.pdf_status || 'missing')

  const handleClick = () => {
    if (iconConfig.clickable && onPdfAction) {
      onPdfAction(transaction)
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

// Helper functions
const getTypeCode = (transactionType: string): string => {
  switch (transactionType) {
    case 'sale': return 'VK'
    case 'expense': return 'AG'
    case 'cash_movement': return 'CM'
    case 'bank_transaction': return 'BT'
    default: return '??'
  }
}

const getQuickFilterQuery = (preset: QuickFilterPreset): Partial<TransactionSearchQuery> => {
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
    case 'with_pdf':
      return { hasPdf: true }
    case 'without_pdf':
      return { hasPdf: false }
    case 'sales_only':
      return { transactionTypes: ['sale'] }
    case 'expenses_only':
      return { transactionTypes: ['expense'] }
    default:
      return {}
  }
}

// Main Component
export default function TransactionPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    dateFilter: null,
    typeFilters: [],
    statusFilters: []
  })
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Build query
  const query = useMemo<TransactionSearchQuery>(() => {
    let q: TransactionSearchQuery = {}
    
    // Search
    if (debouncedSearchQuery.trim()) {
      const trimmed = debouncedSearchQuery.trim()
      if (trimmed.match(/^(VK|AG|CM|BT)/i) || trimmed.match(/^\d+$/)) {
        q.receiptNumber = trimmed
      } else {
        q.description = trimmed
      }
    }
    
    // Date filter
    if (activeFilters.dateFilter) {
      Object.assign(q, getQuickFilterQuery(activeFilters.dateFilter))
    }
    
    // Date range
    if (dateRange?.from && dateRange?.to) {
      q.dateFrom = dateRange.from.toISOString().split('T')[0]
      q.dateTo = dateRange.to.toISOString().split('T')[0]
    }
    
    // Type filters
    if (activeFilters.typeFilters.length > 0) {
      for (const preset of activeFilters.typeFilters) {
        Object.assign(q, getQuickFilterQuery(preset))
      }
    }
    
    // Status filters
    if (activeFilters.statusFilters.length > 0) {
      for (const preset of activeFilters.statusFilters) {
        Object.assign(q, getQuickFilterQuery(preset))
      }
    }
    
    return q
  }, [debouncedSearchQuery, activeFilters, dateRange])

  // React Query
  const { data: transactions = [], isLoading, error, refetch } = useTransactionsQuery(query)
  const { invalidateAll } = useInvalidateTransactions()
  const pdfActions = usePdfActions()

  // Stats
  const stats = useMemo(() => {
    const s = {
      total: transactions.length,
      byType: { sale: 0, expense: 0 },
      withPdf: 0,
      withoutPdf: 0,
      totalAmount: 0
    }

    transactions.forEach(tx => {
      if (tx.transaction_type === 'sale') s.byType.sale++
      else if (tx.transaction_type === 'expense') s.byType.expense++
      
      if (tx.has_pdf) s.withPdf++
      else s.withoutPdf++
      
      s.totalAmount += tx.amount || 0
    })

    return s
  }, [transactions])

  // Handlers
  const handlePdfAction = async (transaction: UnifiedTransaction) => {
    await pdfActions.handlePdfAction(transaction)
  }

  const handleClearAllFilters = () => {
    setSearchQuery('')
    setActiveFilters({
      dateFilter: null,
      typeFilters: [],
      statusFilters: []
    })
    setDateRange(undefined)
  }

  const hasActiveFilters = searchQuery || 
    activeFilters.dateFilter || 
    activeFilters.typeFilters.length > 0 || 
    activeFilters.statusFilters.length > 0 ||
    dateRange

  // Render
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaktionen</h1>
          <p className="text-muted-foreground">Übersicht und Verwaltung</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          
          {selectedTransactions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const selected = transactions.filter(tx => selectedTransactions.includes(tx.id))
                await pdfActions.downloadMultiplePdfs(selected)
                setSelectedTransactions([])
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              PDFs ({selectedTransactions.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausgaben</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType.expense}</div>
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
              von {stats.withPdf + stats.withoutPdf}
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
                placeholder="Suchen..."
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
              >
                Filter löschen
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

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaktionen</CardTitle>
          {transactions.length > 0 && (
            <CardDescription>
              {transactions.length} Einträge
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-destructive">
              Fehler beim Laden der Transaktionen
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {hasActiveFilters ? 'Keine Transaktionen gefunden' : 'Noch keine Transaktionen vorhanden'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <Checkbox
                        checked={selectedTransactions.length === transactions.length}
                        onCheckedChange={(checked) => 
                          setSelectedTransactions(checked ? transactions.map(tx => tx.id) : [])
                        }
                      />
                    </th>
                    <th className="text-left p-3">Typ</th>
                    <th className="text-left p-3">Beleg Nr.</th>
                    <th className="text-left p-3">Datum</th>
                    <th className="text-left p-3">Beschreibung</th>
                    <th className="text-right p-3">Betrag</th>
                    <th className="text-center p-3">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedTransactions.includes(transaction.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTransactions([...selectedTransactions, transaction.id])
                            } else {
                              setSelectedTransactions(selectedTransactions.filter(id => id !== transaction.id))
                            }
                          }}
                        />
                      </td>
                      <td className="p-3">
                        <TransactionTypeBadge typeCode={getTypeCode(transaction.transaction_type)} />
                      </td>
                      <td className="p-3 font-mono text-sm">
                        {transaction.receipt_number || '—'}
                      </td>
                      <td className="p-3 text-sm">
                        {formatDateForDisplay(transaction.transaction_date)}
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {transaction.description || 'Keine Beschreibung'}
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium">
                        <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="p-3">
                        <PdfStatusIcon
                          transaction={transaction}
                          onPdfAction={handlePdfAction}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}