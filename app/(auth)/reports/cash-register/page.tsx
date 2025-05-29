"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ArrowDownRight, Download, Search, Calendar, Loader2, RefreshCw, ArrowUpRight, ReceiptIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/lib/hooks/core/useToast"
import { useDailySummaries } from "@/lib/hooks/business/useDailySummaries"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { formatDateForAPI, getTodaySwiss } from "@/lib/utils/dateUtils"

export default function CashRegisterPage() {
  // Hooks
  const { toast } = useToast()
  const { 
    loading, 
    error, 
    getCurrentCashBalance,
    getCashMovementsForMonth
  } = useDailySummaries()

  // State für Cash Register Page
  const [entries, setEntries] = useState<CashEntry[]>([])
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentMonth, setCurrentMonth] = useState<Date>(getTodaySwiss())
  const [summary, setSummary] = useState({
    monthlyIncome: 0,
    monthlyExpense: 0
  })

  // Aktueller Monat für API (Start und Ende) - useMemo für stabile Referenzen
  const monthStart = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), [currentMonth])
  const monthEnd = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), [currentMonth])
  const monthFormatted = useMemo(() => format(currentMonth, "yyyy-MM", { locale: de }), [currentMonth])
  
  
  // Type für Cash Register Entries (basierend auf cash_movements)
  type CashEntry = {
    id: string
    type: 'cash_in' | 'cash_out'
    amount: number
    description: string
    date: string
    created_at: string | null
  }

  // Daten laden für den aktuellen Monat
  useEffect(() => {
    const fetchData = async () => {
      setBalanceLoading(true)
      try {
        // Cash movements und Balance für den aktuellen Monat laden
        const [movementsResult, balanceResult] = await Promise.all([
          getCashMovementsForMonth(monthStart, monthEnd),
          getCurrentCashBalance()
        ])
        
        // Cash movements zu CashEntry konvertieren
        const allEntries: CashEntry[] = []
        if (movementsResult.success) {
          console.log(`🏦 Kassenbuch Debug für ${monthStart.toISOString().split('T')[0]} bis ${monthEnd.toISOString().split('T')[0]}:`, movementsResult.movements.length, 'Bewegungen gefunden')
          movementsResult.movements.forEach(movement => {
            if (movement.created_at) {
              console.log(`  - ${movement.type}: CHF ${movement.amount} - ${movement.description} (${movement.created_at})`)
              allEntries.push({
                id: movement.id,
                type: movement.type,
                amount: movement.amount,
                description: movement.description,
                date: movement.created_at.split('T')[0],
                created_at: movement.created_at
              })
            }
          })
        } else {
          console.error('🏦 Kassenbuch Fehler:', movementsResult.error)
        }
        
        // Entries nach Datum sortieren (älteste zuerst für korrekte Saldo-Berechnung)
        allEntries.sort((a, b) => new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime())
        
        setEntries(allEntries)
        
        // Zusammenfassung berechnen
        const income = allEntries.filter(e => e.type === 'cash_in').reduce((sum, e) => sum + e.amount, 0)
        const expense = allEntries.filter(e => e.type === 'cash_out').reduce((sum, e) => sum + e.amount, 0)
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
        title: "Keine Daten",
        description: "Es gibt keine Daten zum Exportieren.",
        variant: "destructive",
      })
      return
    }

    // CSV-Header
    const headers = ['Datum', 'Typ', 'Beschreibung', 'Betrag (CHF)']
    
    // CSV-Daten erstellen
    const csvData = entries.map(entry => [
      entry.date,
      entry.type === 'cash_in' ? 'Einnahme' : 'Ausgabe',
      entry.description,
      entry.amount.toFixed(2)
    ])

    // CSV-String erstellen
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')

    // Download auslösen
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `kassenbuch_${monthFormatted}.csv`
    link.click()

    toast({
      title: "Export erfolgreich",
      description: `Kassenbuch für ${format(currentMonth, "MMMM yyyy", { locale: de })} wurde exportiert.`,
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
      return format(new Date(dateString), "dd.MM.yyyy", { locale: de })
    } catch (e) {
      return dateString
    }
  }
  
  const formatTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return "--:--"
    try {
      return format(new Date(dateTimeString), "HH:mm", { locale: de })
    } catch (e) {
      return "--:--"
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
  const isCurrentMonth = currentMonth.getMonth() === getTodaySwiss().getMonth() && 
                         currentMonth.getFullYear() === getTodaySwiss().getFullYear()

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
            <RefreshCw size={16} className={balanceLoading ? "animate-spin" : ""} />
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
            <CardTitle className="text-lg font-medium text-foreground">Aktueller Kassenbestand</CardTitle>
            <CardDescription>
              Bargeld-Bestand (automatisch berechnet)
            </CardDescription>
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
              <RefreshCw size={12} className={`mr-1 ${balanceLoading ? "animate-spin" : ""}`} />
              Aktualisieren
            </Button>
          </CardFooter>
        </Card>

        {/* Daily Summary Cards */}
        <Card className="col-span-1 md:col-span-2 shadow-md border-0">
          <div className="h-2 w-full bg-primary"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-foreground">Monatsüberblick</CardTitle>
            <CardDescription>Bargeld-Bewegungen für {format(currentMonth, "MMMM yyyy", { locale: de })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                <ArrowUpRight size={24} className="text-success mb-1" />
                <span className="text-sm text-muted-foreground">Einnahmen</span>
                <span className="text-xl font-bold text-success">
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
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Suche nach Beschreibung..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Month Navigation */}
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft size={16} />
                </Button>
                
                <div className="text-sm font-medium bg-primary/10 px-3 py-2 rounded border border-primary/20 text-primary min-w-[120px] text-center">
                  {format(currentMonth, "MMMM yyyy", { locale: de })}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToNextMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
              
              {/* Jump to current month button */}
              {!isCurrentMonth && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToCurrentMonth}
                  className="text-xs"
                >
                  Aktueller Monat
                </Button>
              )}
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
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-muted-foreground font-medium">Datum</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Zeit</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Beschreibung</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Typ</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium">Betrag</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium">Laufender Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Einträge werden nach Erstellungsdatum absteigend angezeigt (neueste zuerst) */}
                  {(() => {
                    const filteredEntries = entries.filter(entry => searchTerm === "" || entry.description.toLowerCase().includes(searchTerm.toLowerCase()))
                    
                    // Für laufenden Saldo: Startpunkt berechnen
                    // (Aktueller Saldo minus alle Bewegungen dieses Monats)
                    const monthlyChange = filteredEntries.reduce((sum, entry) => {
                      return sum + (entry.type === 'cash_in' ? entry.amount : -entry.amount)
                    }, 0)
                    const startBalance = (currentBalance || 0) - monthlyChange
                    
                    // Entries in chronologischer Reihenfolge für Saldo-Berechnung
                    const chronologicalEntries = [...filteredEntries].sort((a, b) => 
                      new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime()
                    )
                    
                    // Für Anzeige: neueste zuerst
                    const displayEntries = [...filteredEntries].sort((a, b) => 
                      new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
                    )
                    
                    return displayEntries.map((entry: any, displayIndex: number) => {
                      // Finde Index in chronologischer Liste für Saldo-Berechnung
                      const chronoIndex = chronologicalEntries.findIndex(e => e.id === entry.id)
                      
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
                          <TableCell className="text-foreground">{formatDate(entry.date)}</TableCell>
                          <TableCell className="text-foreground">{formatTime(entry.created_at)}</TableCell>
                          <TableCell className="text-foreground font-medium">{entry.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {entry.type === "cash_in" ? (
                                <div className="flex items-center bg-success/10 px-2 py-1 rounded-full text-sm">
                                  <ArrowUpRight className="mr-1 text-success" size={14} />
                                  <span className="text-success">Einnahme</span>
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
                            className={`text-right font-medium ${entry.type === "cash_in" ? "text-success" : "text-destructive"}`}
                          >
                            {entry.type === "cash_in" ? "+" : "-"} CHF {entry.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground">
                            CHF {runningBalance.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  })()}

                  {!loading && entries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center space-y-2">
                          <ReceiptIcon size={32} className="text-muted-foreground" />
                          <span>Keine Einträge gefunden.</span>
                          <span className="text-sm text-muted-foreground">Verwenden Sie POS und Ausgaben für neue Einträge</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}