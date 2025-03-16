"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownRight, Plus, Download, Search, Calendar, Wallet, Loader2, RefreshCcw, PlusCircle, MinusCircle, BanknoteIcon, ArrowUpRight, CoinsIcon, ReceiptIcon } from "lucide-react"
import { useToast } from "@/lib/hooks/useToast"
import { useCashRegister, CashRegisterEntry } from "@/lib/hooks/useCashRegister"
import { useRegisterStatus } from "@/lib/hooks/useRegisterStatus"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export default function CashRegisterPage() {
  // Hooks
  const { toast } = useToast()
  const { 
    loading, 
    error, 
    entries, 
    summary,
    loadEntries, 
    createEntry, 
    updateSummary,
    searchEntries 
  } = useCashRegister()
  const { calculateCurrentBalance, currentRegisterStatus } = useRegisterStatus()

  // State für laufenden Saldo
  const [runningBalances, setRunningBalances] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState("")
  
  // State for the new entry dialog
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false)
  const [entryType, setEntryType] = useState<"income" | "expense">("income")
  const [entryAmount, setEntryAmount] = useState("")
  const [entryDescription, setEntryDescription] = useState("")

  // State für aktuellen Kassenbestand
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  
  // Daten beim ersten Laden abrufen
  useEffect(() => {
    const fetchData = async () => {
      setBalanceLoading(true)
      try {
        await loadEntries()
        await updateSummary()
        
        // Aktuellen Kassenbestand berechnen
        const { success, balance } = await calculateCurrentBalance()
        if (success && balance !== undefined) {
          setCurrentBalance(balance)
        }
      } finally {
        setBalanceLoading(false)
      }
    }
    fetchData()
  }, [])

  // Kassenbestand und laufenden Saldo berechnen
  useEffect(() => {
    const calculateRunningBalances = async () => {
      // Aktuellen Kassenbestand abrufen (wenn Kasse geöffnet ist)
      const { success, balance } = await calculateCurrentBalance()
      
      if (success && balance !== undefined) {
        // Aktuellen Kassenbestand setzen
        setCurrentBalance(balance)
        
        if (entries.length > 0) {
          // Startbetrag aus dem Register-Status abrufen
          let startingAmount = 0
          if (currentRegisterStatus) {
            startingAmount = currentRegisterStatus.starting_amount
          }
          
          // Laufende Salden chronologisch berechnen (von alt nach neu)
          // Sortiere die Einträge chronologisch (älteste zuerst)
          const sortedEntries = [...entries].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          
          let runningBalance = startingAmount
          const balances: Record<string, number> = {}
          
          // Berechne den laufenden Saldo für jeden Eintrag
          sortedEntries.forEach(entry => {
            // Einnahmen erhöhen den Saldo, Ausgaben verringern ihn
            if (entry.type === 'income') {
              runningBalance += entry.amount
            } else if (entry.type === 'expense') {
              runningBalance -= entry.amount
            }
            balances[entry.id] = runningBalance
          })
          
          // Zum Schluss sollte der laufende Saldo dem aktuellen Kassenbestand entsprechen
          // Dadurch vermeiden wir Diskrepanzen zwischen den beiden Anzeigen
          setRunningBalances(balances)
          
          // Loggen zur Fehlerbehebung
          console.log("Startbetrag:", startingAmount)
          console.log("Aktueller Kassenbestand:", balance)
          console.log("Letzter berechneter Saldo:", 
            Object.values(balances)[Object.values(balances).length - 1])
        }
      }
    }
    
    if (entries.length > 0) {
      calculateRunningBalances()
    } else if (entries.length === 0) {
      // Wenn keine Einträge vorhanden sind, aktualisiere nur den Kassenbestand
      const updateBalance = async () => {
        const { success, balance } = await calculateCurrentBalance()
        if (success && balance !== undefined) {
          setCurrentBalance(balance)
        }
      }
      updateBalance()
    }
  }, [entries, calculateCurrentBalance, currentRegisterStatus])

  // Suche durchführen
  const handleSearch = useCallback(async () => {
    if (searchTerm.trim()) {
      await searchEntries(searchTerm)
    } else {
      await loadEntries()
    }
  }, [searchTerm, searchEntries, loadEntries])

  // Suche bei Enter-Taste ausführen
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Daten aktualisieren (Balance, Einträge und Zusammenfassung)
  const refreshData = async () => {
    setBalanceLoading(true)
    try {
      await loadEntries()
      await updateSummary()
      
      // Aktuellen Kassenbestand berechnen
      const { success, balance } = await calculateCurrentBalance()
      if (success && balance !== undefined) {
        setCurrentBalance(balance)
      }
    } finally {
      setBalanceLoading(false)
    }
  }
  
  // Neuen Eintrag hinzufügen
  const handleAddEntry = async () => {
    const amount = Number.parseFloat(entryAmount)
    if (isNaN(amount) || amount <= 0 || !entryDescription) return

    // Heutiges Datum im Format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0]

    const result = await createEntry({
      date: today,
      type: entryType,
      amount: amount,
      description: entryDescription,
      daily_report_id: null, // Wird später beim Tagesabschluss gesetzt
    })

    if (result.success) {
      toast({
        title: "Eintrag erstellt",
        description: `${entryType === 'income' ? 'Einnahme' : 'Ausgabe'} über CHF ${amount.toFixed(2)} erfolgreich gespeichert.`,
      })
      
      // Daten aktualisieren
      await refreshData()
      
      // Formular zurücksetzen und Dialog schließen
      setEntryType("income")
      setEntryAmount("")
      setEntryDescription("")
      setIsEntryDialogOpen(false)
    } else {
      toast({
        title: "Fehler",
        description: result.error || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      })
    }
  }

  // Datum formatieren
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return format(date, 'dd.MM.yyyy', { locale: de })
    } catch (e) {
      return dateStr
    }
  }

  // Zeit aus timestamp extrahieren
  const formatTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)
      return format(date, 'HH:mm', { locale: de })
    } catch (e) {
      return "00:00"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kassenbuch</h1>
          <p className="text-gray-500">Übersicht aller Bargeldbewegungen</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white" 
            onClick={() => setIsEntryDialogOpen(true)}
          >
            <PlusCircle size={16} />
            Neuer Eintrag
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={refreshData}
            disabled={balanceLoading}
          >
            <RefreshCcw size={16} className={balanceLoading ? "animate-spin" : ""} />
            Aktualisieren
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Current Balance and Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Main Balance Card */}
        <Card className="col-span-1 md:col-span-1 shadow-md border-0 overflow-hidden">
          <div className={`h-2 w-full ${currentRegisterStatus?.status === 'open' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Aktueller Kassenbestand</CardTitle>
            <CardDescription>
              {currentRegisterStatus?.status === 'open' 
                ? `Kasse geöffnet seit ${format(new Date(currentRegisterStatus.opened_at), 'HH:mm', { locale: de })} Uhr`
                : "Kasse ist aktuell geschlossen"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {balanceLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="mr-2 animate-spin text-primary" size={24} />
                <span className="text-xl font-medium text-gray-600">Wird berechnet...</span>
              </div>
            ) : currentBalance !== null ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  CHF {currentBalance.toFixed(2)}
                </div>
                {currentRegisterStatus?.starting_amount && (
                  <div className="text-sm text-gray-500">
                    Startbetrag: CHF {currentRegisterStatus.starting_amount.toFixed(2)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 italic">
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
              <RefreshCcw size={12} className={`mr-1 ${balanceLoading ? "animate-spin" : ""}`} />
              Aktualisieren
            </Button>
          </CardFooter>
        </Card>

        {/* Daily Summary Cards */}
        <Card className="col-span-1 md:col-span-2 shadow-md border-0">
          <div className="h-2 w-full bg-blue-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Heutiger Überblick</CardTitle>
            <CardDescription>Bargeld-Bewegungen für den heutigen Tag</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50">
                <ArrowUpRight size={24} className="text-green-500 mb-1" />
                <span className="text-sm text-gray-500">Einnahmen</span>
                <span className="text-xl font-bold text-green-600">
                  CHF {summary.dailyIncome.toFixed(2)}
                </span>
              </div>
              
              <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50">
                <ArrowDownRight size={24} className="text-red-500 mb-1" />
                <span className="text-sm text-gray-500">Ausgaben</span>
                <span className="text-xl font-bold text-red-600">
                  CHF {summary.dailyExpense.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Search and Filter Card */}
      <Card className="shadow-md border-0 overflow-hidden mb-6">
        <div className="h-2 w-full bg-gray-300"></div>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Suche nach Beschreibung..." 
                className="pl-10 w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSearch}
              >
                <Search size={16} />
                Suchen
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar size={16} />
                Datumsfilter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table Card */}
      <Card className="shadow-md border-0 overflow-hidden">
        <div className="h-2 w-full bg-indigo-500"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-700">Kassenbucheinträge</CardTitle>
          <CardDescription>Chronologische Auflistung aller Bargeldbewegungen</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-gray-500">Daten werden geladen...</span>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-gray-600 font-medium">Datum</TableHead>
                    <TableHead className="text-gray-600 font-medium">Zeit</TableHead>
                    <TableHead className="text-gray-600 font-medium">Beschreibung</TableHead>
                    <TableHead className="text-gray-600 font-medium">Typ</TableHead>
                    <TableHead className="text-right text-gray-600 font-medium">Betrag</TableHead>
                    <TableHead className="text-right text-gray-600 font-medium">Laufender Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Einträge werden nach Erstellungsdatum absteigend angezeigt (neueste zuerst) */}
                  {entries.map((entry: CashRegisterEntry) => (
                    <TableRow 
                      key={entry.id} 
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="text-gray-700">{formatDate(entry.date)}</TableCell>
                      <TableCell className="text-gray-700">{formatTime(entry.created_at)}</TableCell>
                      <TableCell className="text-gray-700 font-medium">{entry.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {entry.type === "income" ? (
                            <div className="flex items-center bg-green-100 px-2 py-1 rounded-full text-sm">
                              <ArrowUpRight className="mr-1 text-green-600" size={14} />
                              <span className="text-green-800">Einnahme</span>
                            </div>
                          ) : (
                            <div className="flex items-center bg-red-100 px-2 py-1 rounded-full text-sm">
                              <ArrowDownRight className="mr-1 text-red-600" size={14} />
                              <span className="text-red-800">Ausgabe</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${entry.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {entry.type === "income" ? "+" : "-"} CHF {entry.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-800">
                        {runningBalances[entry.id] !== undefined 
                          ? `CHF ${runningBalances[entry.id].toFixed(2)}` 
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}

                  {!loading && entries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center space-y-2">
                          <ReceiptIcon size={32} className="text-gray-300" />
                          <span>Keine Einträge gefunden.</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setIsEntryDialogOpen(true)}
                          >
                            <Plus size={14} className="mr-1" />
                            Eintrag hinzufügen
                          </Button>
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

      {/* Add Entry Dialog */}
      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Neuen Eintrag hinzufügen</DialogTitle>
            <DialogDescription className="text-gray-600">
              Erfassen Sie eine neue Bargeld-Bewegung im Kassenbuch
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="entry-type" className="font-medium text-gray-700">Typ der Bewegung</Label>
                <div className="flex gap-1 text-sm text-gray-500">
                  <span className="text-green-600">Einnahme</span> | 
                  <span className="text-red-600">Ausgabe</span>
                </div>
              </div>
              <Select value={entryType} onValueChange={(value) => setEntryType(value as "income" | "expense")}>
                <SelectTrigger id="entry-type" className={`border-2 ${entryType === "income" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
                  <SelectValue placeholder="Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income" className="text-green-600 font-medium">
                    <div className="flex items-center">
                      <ArrowUpRight className="mr-2 text-green-600" size={16} />
                      Einnahme
                    </div>
                  </SelectItem>
                  <SelectItem value="expense" className="text-red-600 font-medium">
                    <div className="flex items-center">
                      <ArrowDownRight className="mr-2 text-red-600" size={16} />
                      Ausgabe
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="entry-amount" className="font-medium text-gray-700">Betrag (CHF)</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">CHF</span>
                <Input
                  id="entry-amount"
                  type="number"
                  step="0.05"
                  min="0"
                  placeholder="0.00"
                  className="pl-12 text-right font-medium text-lg"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="entry-description" className="font-medium text-gray-700">Beschreibung</Label>
              <Textarea
                id="entry-description"
                placeholder="Geben Sie eine kurze Beschreibung der Bargeld-Bewegung ein..."
                className="min-h-[100px] resize-none"
                value={entryDescription}
                onChange={(e) => setEntryDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleAddEntry}
              className={entryType === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              disabled={loading || !entryAmount || Number.parseFloat(entryAmount) <= 0 || !entryDescription}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  {entryType === "income" ? (
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="mr-2 h-4 w-4" />
                  )}
                  {entryType === "income" ? "Einnahme" : "Ausgabe"} speichern
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

