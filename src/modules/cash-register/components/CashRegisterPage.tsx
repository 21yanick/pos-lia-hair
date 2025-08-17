'use client'

import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  ReceiptIcon,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { useCashBalance } from '@/shared/hooks/business/useCashBalance'
import { useToast } from '@/shared/hooks/core/useToast'
import { formatDateForAPI, getTodaySwiss } from '@/shared/utils/dateUtils'

export default function CashRegisterPage() {
  // Hooks
  const { toast } = useToast()
  const { loading, error, getCurrentCashBalance, getCashMovementsForMonth } = useCashBalance()

  // State für Cash Register Page
  const [entries, setEntries] = useState<CashEntry[]>([])
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentMonth, setCurrentMonth] = useState<Date>(getTodaySwiss())
  const [typeFilter, setTypeFilter] = useState<'all' | 'cash_in' | 'cash_out'>('all')
  const [summary, setSummary] = useState({
    monthlyIncome: 0,
    monthlyExpense: 0,
  })

  // Aktueller Monat für API (Start und Ende) - useMemo für stabile Referenzen
  const monthStart = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    [currentMonth]
  )
  const monthEnd = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
    [currentMonth]
  )
  const monthFormatted = useMemo(
    () => format(currentMonth, 'yyyy-MM', { locale: de }),
    [currentMonth]
  )

  // Type für Cash Register Entries (erweitert mit sales data)
  type CashEntry = {
    id: string
    type: 'cash_in' | 'cash_out'
    amount: number
    description: string
    date: string
    created_at: string | null
    movement_number: string | null
    reference_type: string | null
    reference_id: string | null
    sale_receipt_number?: string | null
    sale_customer_name?: string | null
  }

  // Daten laden für den aktuellen Monat
  useEffect(() => {
    const fetchData = async () => {
      setBalanceLoading(true)
      try {
        // Cash movements und Balance für den aktuellen Monat laden
        const [movementsResult, balanceResult] = await Promise.all([
          getCashMovementsForMonth(monthStart, monthEnd),
          getCurrentCashBalance(),
        ])

        // Cash movements zu CashEntry konvertieren
        const allEntries: CashEntry[] = []
        if (movementsResult.success) {
          movementsResult.movements.forEach((movement: any) => {
            if (movement.created_at) {
              allEntries.push({
                id: movement.id,
                type: movement.type,
                amount: movement.amount,
                description: movement.description,
                date: movement.created_at.split('T')[0],
                created_at: movement.created_at,
                movement_number: movement.movement_number,
                reference_type: movement.reference_type,
                reference_id: movement.reference_id,
                sale_receipt_number: movement.sale_receipt_number,
                sale_customer_name: movement.sale_customer_name,
              })
            }
          })
        } else {
          // console.error('🏦 Kassenbuch Fehler:', movementsResult.error)
        }

        // Entries nach Datum sortieren (älteste zuerst für korrekte Saldo-Berechnung)
        allEntries.sort(
          (a, b) =>
            new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime()
        )

        setEntries(allEntries)

        // Zusammenfassung berechnen
        const income = allEntries
          .filter((e) => e.type === 'cash_in')
          .reduce((sum, e) => sum + e.amount, 0)
        const expense = allEntries
          .filter((e) => e.type === 'cash_out')
          .reduce((sum, e) => sum + e.amount, 0)
        setSummary({ monthlyIncome: income, monthlyExpense: expense })

        // Kassenbestand setzen
        if (balanceResult.success) {
          setCurrentBalance(balanceResult.balance)
        }
      } catch (err) {
        console.error('Fehler beim Laden der Daten:', err)
      } finally {
        setBalanceLoading(false)
      }
    }
    fetchData()
  }, [monthStart, monthEnd])

  // CSV Export-Funktion
  const handleExport = () => {
    if (entries.length === 0) {
      toast({
        title: 'Keine Daten',
        description: 'Es gibt keine Daten zum Exportieren.',
        variant: 'destructive',
      })
      return
    }

    // CSV-Header
    const headers = ['Datum', 'Typ', 'Beschreibung', 'Betrag (CHF)']

    // CSV-Daten erstellen
    const csvData = entries.map((entry) => [
      entry.date,
      entry.type === 'cash_in' ? 'Einnahme' : 'Ausgabe',
      entry.description,
      entry.amount.toFixed(2),
    ])

    // CSV-String erstellen
    const csvContent = [headers.join(','), ...csvData.map((row) => row.join(','))].join('\n')

    // Download auslösen
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `kassenbuch_${monthFormatted}.csv`
    link.click()

    toast({
      title: 'Export erfolgreich',
      description: `Kassenbuch für ${format(currentMonth, 'MMMM yyyy', { locale: de })} wurde exportiert.`,
    })
  }

  // Daten aktualisieren
  const refreshData = async () => {
    setBalanceLoading(true)
    try {
      const balanceResult = await getCurrentCashBalance()
      if (balanceResult.success) {
        setCurrentBalance(balanceResult.balance)
      }
    } finally {
      setBalanceLoading(false)
    }
  }

  // Hilfsfunktionen für Formatierung
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: de })
    } catch (e) {
      return dateString
    }
  }

  const formatTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return '--:--'
    try {
      return format(new Date(dateTimeString), 'HH:mm', { locale: de })
    } catch (e) {
      return '--:--'
    }
  }

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToCurrentMonth = () => {
    setCurrentMonth(getTodaySwiss())
  }

  // Check if current month is selected
  const isCurrentMonth =
    currentMonth.getMonth() === getTodaySwiss().getMonth() &&
    currentMonth.getFullYear() === getTodaySwiss().getFullYear()

  // Helper functions for better display
  const getDisplayNumber = (entry: CashEntry) => {
    if (entry.reference_type === 'sale' && entry.sale_receipt_number) {
      return entry.sale_receipt_number // VK2025000038
    }
    return entry.movement_number || entry.id.substring(0, 8) // CM2025000010 or fallback
  }

  const getDisplayDescription = (entry: CashEntry) => {
    if (entry.reference_type === 'sale' && entry.sale_receipt_number) {
      return 'Barverkauf (POS)'
    }
    return entry.description
  }

  const getDescriptionBadge = (entry: CashEntry) => {
    if (entry.reference_type === 'sale') return 'POS-Verkauf'
    if (entry.reference_type === 'expense') return 'Ausgabe'
    if (entry.reference_type === 'owner_transaction') return 'Owner'
    if (entry.reference_type === 'adjustment') return 'Korrektur'
    return 'Sonstige'
  }

  // Filtering logic
  const getFilteredEntries = () => {
    let filtered = entries

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.type === typeFilter)
    }

    // Search filter (improved)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          // Search in VK number
          (entry.sale_receipt_number &&
            entry.sale_receipt_number.toLowerCase().includes(searchLower)) ||
          // Search in CM number
          (entry.movement_number && entry.movement_number.toLowerCase().includes(searchLower)) ||
          // Search in description
          entry.description
            .toLowerCase()
            .includes(searchLower) ||
          // Search in customer name
          (entry.sale_customer_name && entry.sale_customer_name.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kassenbuch</h1>
          <p className="text-muted-foreground">Übersicht aller Bargeldbewegungen</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={refreshData}
            disabled={balanceLoading}
          >
            <RefreshCw size={16} className={balanceLoading ? 'animate-spin' : ''} />
            Aktualisieren
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExport}
            disabled={entries.length === 0}
          >
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Current Balance and Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Main Balance Card */}
        <Card className="col-span-1 md:col-span-1 shadow-md border-0 overflow-hidden">
          <div className="h-2 w-full bg-primary"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-foreground">
              Aktueller Kassenbestand
            </CardTitle>
            <CardDescription>Bargeld-Bestand (automatisch berechnet)</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {balanceLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="mr-2 animate-spin text-primary" size={24} />
                <span className="text-xl font-medium text-muted-foreground">Wird berechnet...</span>
              </div>
            ) : currentBalance !== null ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">
                  CHF {currentBalance.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground italic">
                Kassenbestand nicht verfügbar
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 pb-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={refreshData}
              disabled={balanceLoading}
            >
              <RefreshCw size={12} className={`mr-1 ${balanceLoading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </Button>
          </CardFooter>
        </Card>

        {/* Daily Summary Cards */}
        <Card className="col-span-1 md:col-span-2 shadow-md border-0">
          <div className="h-2 w-full bg-primary"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-foreground">Monatsüberblick</CardTitle>
            <CardDescription>
              Bargeld-Bewegungen für {format(currentMonth, 'MMMM yyyy', { locale: de })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                <ArrowUpRight size={24} className="text-chart-3 mb-1" />
                <span className="text-sm text-muted-foreground">Einnahmen</span>
                <span className="text-xl font-bold text-chart-3">
                  CHF {summary.monthlyIncome.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                <ArrowDownRight size={24} className="text-destructive mb-1" />
                <span className="text-sm text-muted-foreground">Ausgaben</span>
                <span className="text-xl font-bold text-destructive">
                  CHF {summary.monthlyExpense.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Card */}
      <Card className="shadow-md border-0 overflow-hidden mb-6">
        <div className="h-2 w-full bg-muted"></div>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Search Field - Full Width */}
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                placeholder="VK2025000038, CM2025000010 oder Beschreibung..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters - Responsive Layout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Type Filter */}
              <div className="flex items-center gap-1 justify-center sm:justify-start">
                <Button
                  variant={typeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('all')}
                  className="text-xs"
                >
                  Alle
                </Button>
                <Button
                  variant={typeFilter === 'cash_in' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('cash_in')}
                  className="text-xs"
                >
                  Einnahmen
                </Button>
                <Button
                  variant={typeFilter === 'cash_out' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('cash_out')}
                  className="text-xs"
                >
                  Ausgaben
                </Button>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft size={16} />
                </Button>

                <div className="text-sm font-medium bg-primary/10 px-3 py-2 rounded border border-primary/20 text-primary min-w-[120px] text-center">
                  {format(currentMonth, 'MMMM yyyy', { locale: de })}
                </div>

                <Button variant="outline" size="sm" onClick={goToNextMonth} className="h-8 w-8 p-0">
                  <ChevronRight size={16} />
                </Button>

                {/* Jump to current month button */}
                {!isCurrentMonth && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToCurrentMonth}
                    className="text-xs ml-2"
                  >
                    Heute
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table Card */}
      <Card className="shadow-md border-0 overflow-hidden">
        <div className="h-2 w-full bg-secondary"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-foreground">Kassenbucheinträge</CardTitle>
          <CardDescription>Chronologische Auflistung aller Bargeldbewegungen</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-muted-foreground">Daten werden geladen...</span>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-muted-foreground font-medium">Datum</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Zeit</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Beleg-Nr.</TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Beschreibung
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">Kategorie</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Typ</TableHead>
                      <TableHead className="text-right text-muted-foreground font-medium">
                        Betrag
                      </TableHead>
                      <TableHead className="text-right text-muted-foreground font-medium">
                        Laufender Saldo
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Einträge werden nach Erstellungsdatum absteigend angezeigt (neueste zuerst) */}
                    {(() => {
                      const filteredEntries = getFilteredEntries()

                      // Für laufenden Saldo: Startpunkt berechnen
                      // (Aktueller Saldo minus alle Bewegungen dieses Monats)
                      const monthlyChange = filteredEntries.reduce((sum, entry) => {
                        return sum + (entry.type === 'cash_in' ? entry.amount : -entry.amount)
                      }, 0)
                      const startBalance = (currentBalance || 0) - monthlyChange

                      // Entries in chronologischer Reihenfolge für Saldo-Berechnung
                      const chronologicalEntries = [...filteredEntries].sort(
                        (a, b) =>
                          new Date(a.created_at || a.date).getTime() -
                          new Date(b.created_at || b.date).getTime()
                      )

                      // Für Anzeige: neueste zuerst
                      const displayEntries = [...filteredEntries].sort(
                        (a, b) =>
                          new Date(b.created_at || b.date).getTime() -
                          new Date(a.created_at || a.date).getTime()
                      )

                      return displayEntries.map((entry: any, displayIndex: number) => {
                        // Finde Index in chronologischer Liste für Saldo-Berechnung
                        const chronoIndex = chronologicalEntries.findIndex((e) => e.id === entry.id)

                        // Berechne laufenden Saldo bis zu diesem Punkt
                        let runningBalance = startBalance
                        for (let i = 0; i <= chronoIndex; i++) {
                          const e = chronologicalEntries[i]
                          runningBalance += e.type === 'cash_in' ? e.amount : -e.amount
                        }

                        return (
                          <TableRow
                            key={entry.id}
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="text-foreground">
                              {formatDate(entry.date)}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {formatTime(entry.created_at)}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              <span
                                className={`font-semibold ${
                                  entry.reference_type === 'sale'
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {getDisplayNumber(entry)}
                              </span>
                            </TableCell>
                            <TableCell className="text-foreground font-medium">
                              {getDisplayDescription(entry)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={entry.reference_type === 'sale' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {getDescriptionBadge(entry)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {entry.type === 'cash_in' ? (
                                  <div className="flex items-center bg-chart-3/10 px-2 py-1 rounded-full text-sm">
                                    <ArrowUpRight className="mr-1 text-chart-3" size={14} />
                                    <span className="text-chart-3">Einnahme</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center bg-destructive/10 px-2 py-1 rounded-full text-sm">
                                    <ArrowDownRight className="mr-1 text-destructive" size={14} />
                                    <span className="text-destructive">Ausgabe</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium ${entry.type === 'cash_in' ? 'text-chart-3' : 'text-destructive'}`}
                            >
                              {entry.type === 'cash_in' ? '+' : '-'} CHF {entry.amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-foreground">
                              CHF {runningBalance.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    })()}

                    {!loading && getFilteredEntries().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center space-y-2">
                            <ReceiptIcon size={32} className="text-muted-foreground" />
                            <span>
                              {entries.length === 0
                                ? 'Keine Kassenbewegungen für diesen Monat gefunden.'
                                : 'Keine Einträge entsprechen den aktuellen Filtern.'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {entries.length === 0
                                ? 'Verwenden Sie POS und Ausgaben für neue Einträge'
                                : 'Versuchen Sie andere Suchbegriffe oder Filter'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {(() => {
                  const filteredEntries = getFilteredEntries()

                  if (!loading && filteredEntries.length === 0) {
                    return (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center space-y-2">
                          <ReceiptIcon size={32} className="text-muted-foreground" />
                          <span>
                            {entries.length === 0
                              ? 'Keine Kassenbewegungen für diesen Monat gefunden.'
                              : 'Keine Einträge entsprechen den aktuellen Filtern.'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {entries.length === 0
                              ? 'Verwenden Sie POS und Ausgaben für neue Einträge'
                              : 'Versuchen Sie andere Suchbegriffe oder Filter'}
                          </span>
                        </div>
                      </div>
                    )
                  }

                  // Für laufenden Saldo: Startpunkt berechnen
                  const monthlyChange = filteredEntries.reduce((sum, entry) => {
                    return sum + (entry.type === 'cash_in' ? entry.amount : -entry.amount)
                  }, 0)
                  const startBalance = (currentBalance || 0) - monthlyChange

                  // Entries in chronologischer Reihenfolge für Saldo-Berechnung
                  const chronologicalEntries = [...filteredEntries].sort(
                    (a, b) =>
                      new Date(a.created_at || a.date).getTime() -
                      new Date(b.created_at || b.date).getTime()
                  )

                  // Für Anzeige: neueste zuerst
                  const displayEntries = [...filteredEntries].sort(
                    (a, b) =>
                      new Date(b.created_at || b.date).getTime() -
                      new Date(a.created_at || a.date).getTime()
                  )

                  return displayEntries.map((entry: any, displayIndex: number) => {
                    // Finde Index in chronologischer Liste für Saldo-Berechnung
                    const chronoIndex = chronologicalEntries.findIndex((e) => e.id === entry.id)

                    // Berechne laufenden Saldo bis zu diesem Punkt
                    let runningBalance = startBalance
                    for (let i = 0; i <= chronoIndex; i++) {
                      const e = chronologicalEntries[i]
                      runningBalance += e.type === 'cash_in' ? e.amount : -e.amount
                    }

                    return (
                      <div key={entry.id} className="border border-border rounded-lg p-4 space-y-3">
                        {/* Header Row */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-semibold text-primary">
                                {getDisplayNumber(entry)}
                              </span>
                              <Badge
                                variant={entry.reference_type === 'sale' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {getDescriptionBadge(entry)}
                              </Badge>
                            </div>
                            <h3 className="font-medium text-sm leading-tight mb-1">
                              {getDisplayDescription(entry)}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatDate(entry.date)}</span>
                              <span>•</span>
                              <span>{formatTime(entry.created_at)}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div
                              className={`font-bold text-lg ${entry.type === 'cash_in' ? 'text-chart-3' : 'text-destructive'}`}
                            >
                              {entry.type === 'cash_in' ? '+' : '-'} CHF {entry.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Saldo: CHF {runningBalance.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Type Badge Row */}
                        <div className="flex items-center pt-2 border-t border-border">
                          {entry.type === 'cash_in' ? (
                            <div className="flex items-center bg-chart-3/10 px-3 py-1 rounded-full text-sm">
                              <ArrowUpRight className="mr-1 text-chart-3" size={14} />
                              <span className="text-chart-3 font-medium">Einnahme</span>
                            </div>
                          ) : (
                            <div className="flex items-center bg-destructive/10 px-3 py-1 rounded-full text-sm">
                              <ArrowDownRight className="mr-1 text-destructive" size={14} />
                              <span className="text-destructive font-medium">Ausgabe</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
