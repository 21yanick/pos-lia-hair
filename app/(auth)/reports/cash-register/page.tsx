"use client"

import { useState } from "react"
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
import { ArrowDownRight, Plus, Download, Search, Calendar, Wallet } from "lucide-react"

export default function CashRegisterPage() {
  // State for the new entry dialog
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false)
  const [entryType, setEntryType] = useState<"income" | "expense">("income")
  const [entryAmount, setEntryAmount] = useState("")
  const [entryDescription, setEntryDescription] = useState("")

  // Mock data
  const [entries, setEntries] = useState([
    {
      id: "1",
      date: "15.03.2023",
      time: "14:30",
      description: "Bareinnahme aus Verkauf",
      type: "income",
      amount: 85.0,
      balance: 1285.0,
    },
    {
      id: "2",
      date: "15.03.2023",
      time: "12:15",
      description: "Einkauf Handtücher",
      type: "expense",
      amount: 45.0,
      balance: 1200.0,
    },
    {
      id: "3",
      date: "14.03.2023",
      time: "16:45",
      description: "Bareinnahme aus Verkauf",
      type: "income",
      amount: 120.0,
      balance: 1245.0,
    },
    {
      id: "4",
      date: "14.03.2023",
      time: "10:30",
      description: "Kaffeebestellung für Salon",
      type: "expense",
      amount: 35.0,
      balance: 1125.0,
    },
    {
      id: "5",
      date: "13.03.2023",
      time: "15:20",
      description: "Bareinnahme aus Verkauf",
      type: "income",
      amount: 95.0,
      balance: 1160.0,
    },
  ])

  const summary = {
    todayIn: 450.0,
    todayOut: 120.0,
    monthIn: 3250.0,
    monthOut: 850.0,
  }

  const handleAddEntry = () => {
    const amount = Number.parseFloat(entryAmount)
    if (isNaN(amount) || amount <= 0 || !entryDescription) return

    // Calculate new balance
    const lastBalance = entries.length > 0 ? entries[0].balance : 0
    const newBalance = entryType === "income" ? lastBalance + amount : lastBalance - amount

    // Create new entry
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" }),
      time: new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }),
      description: entryDescription,
      type: entryType,
      amount: amount,
      balance: newBalance,
    }

    // Add to entries
    setEntries([newEntry, ...entries])

    // Reset form and close dialog
    setEntryType("income")
    setEntryAmount("")
    setEntryDescription("")
    setIsEntryDialogOpen(false)
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
              <span className="text-2xl font-bold">CHF {summary.todayIn.toFixed(2)}</span>
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
              <span className="text-2xl font-bold">CHF {summary.todayOut.toFixed(2)}</span>
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
              <span className="text-2xl font-bold">CHF {summary.monthIn.toFixed(2)}</span>
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
              <span className="text-2xl font-bold">CHF {summary.monthOut.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input placeholder="Suche nach Beschreibung..." className="pl-10" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar size={16} />
            Datumsfilter
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
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
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.time}</TableCell>
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
                  <TableCell className="text-right font-medium">CHF {entry.balance.toFixed(2)}</TableCell>
                </TableRow>
              ))}

              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Keine Einträge gefunden.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
              disabled={!entryAmount || Number.parseFloat(entryAmount) <= 0 || !entryDescription}
            >
              Eintrag hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

