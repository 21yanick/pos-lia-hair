"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ArrowDownRight, Plus, Download, Search, Calendar, Wallet, Loader2 } from "lucide-react"
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

  // Daten beim ersten Laden abrufen
  useEffect(() => {
    const fetchData = async () => {
      await loadEntries()
      await updateSummary()
    }
    fetchData()
  }, [])

  // Kassenbestand und laufenden Saldo berechnen
  useEffect(() => {
    const calculateRunningBalances = async () => {
      // Aktuellen Kassenbestand abrufen (wenn Kasse geöffnet ist)
      const { success, balance } = await calculateCurrentBalance()
      
      if (success && balance) {
        // Für jede Transaktion den laufenden Saldo berechnen
        let runningBalance = balance
        const balances: Record<string, number> = {}
        
        // Wir gehen die Einträge in umgekehrter Reihenfolge durch (älteste zuerst)
        // Sie wurden nach created_at absteigend sortiert, daher umkehren
        const sortedEntries = [...entries].reverse()
        
        // Für jeden Eintrag: Eingang erhöht den Saldo, Ausgang verringert ihn
        sortedEntries.forEach(entry => {
          if (entry.type === 'expense') {
            runningBalance += entry.amount  // Rückwärts: Ausgabe wird hinzugefügt
          } else {
            runningBalance -= entry.amount  // Rückwärts: Einnahme wird abgezogen
          }
          balances[entry.id] = runningBalance
        })
        
        // Wir kehren die berechneten Salden um, damit der neueste Eintrag den aktuellsten Saldo hat
        setRunningBalances(balances)
      }
    }
    
    if (entries.length > 0) {
      calculateRunningBalances()
    }
  }, [entries, calculateCurrentBalance])

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
      await updateSummary()
      
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kassenbuch</h1>
          <p className="text-gray-500">Übersicht aller Bargeldbewegungen</p>
        </div>

        <div className="flex items-center gap-2">
          <Button className="flex items-center gap-2" onClick={() => setIsEntryDialogOpen(true)}>
            <Plus size={16} />
            Eintrag
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Heutiger Eingang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="mr-2 text-green-500" size={20} />
              <span className="text-2xl font-bold">CHF {summary.dailyIncome.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Heutiger Ausgang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDownRight className="mr-2 text-red-500" size={20} />
              <span className="text-2xl font-bold">CHF {summary.dailyExpense.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Monatlicher Eingang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="mr-2 text-green-500" size={20} />
              <span className="text-2xl font-bold">CHF {summary.monthlyIncome.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Monatlicher Ausgang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDownRight className="mr-2 text-red-500" size={20} />
              <span className="text-2xl font-bold">CHF {summary.monthlyExpense.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Suche nach Beschreibung..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
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

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Daten werden geladen...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Zeit</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry: CashRegisterEntry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{formatTime(entry.created_at)}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {entry.type === "income" ? (
                          <Wallet className="mr-2 text-green-500" size={16} />
                        ) : (
                          <ArrowDownRight className="mr-2 text-red-500" size={16} />
                        )}
                        <span>{entry.type === "income" ? "Einnahme" : "Ausgabe"}</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${entry.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {entry.type === "income" ? "+" : "-"} CHF {entry.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {runningBalances[entry.id] !== undefined 
                        ? `CHF ${runningBalances[entry.id].toFixed(2)}` 
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && entries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Keine Einträge gefunden.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Eintrag hinzufügen</DialogTitle>
            <DialogDescription>Fügen Sie eine neue Bargeld-Bewegung zum Kassenbuch hinzu.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="entry-type">Typ</Label>
              <Select value={entryType} onValueChange={(value) => setEntryType(value as "income" | "expense")}>
                <SelectTrigger id="entry-type">
                  <SelectValue placeholder="Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Einnahme</SelectItem>
                  <SelectItem value="expense">Ausgabe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-amount">Betrag (CHF)</Label>
              <Input
                id="entry-amount"
                type="number"
                step="0.05"
                min="0"
                placeholder="0.00"
                value={entryAmount}
                onChange={(e) => setEntryAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-description">Beschreibung</Label>
              <Textarea
                id="entry-description"
                placeholder="Beschreibung der Bargeld-Bewegung..."
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
              disabled={loading || !entryAmount || Number.parseFloat(entryAmount) <= 0 || !entryDescription}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                "Eintrag hinzufügen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

