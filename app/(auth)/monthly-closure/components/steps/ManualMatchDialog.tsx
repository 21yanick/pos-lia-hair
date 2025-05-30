"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search, 
  Check, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  CreditCard,
  Receipt,
  AlertTriangle
} from "lucide-react"
import { formatDateForDisplay } from "@/lib/utils/dateUtils"

interface BankEntry {
  id: string
  date: string
  amount: number
  direction: 'credit' | 'debit'
  description: string
  provider?: string
}

interface PossibleMatch {
  id: string
  type: 'sale' | 'expense' | 'batch'
  date: string
  amount: number
  description: string
  confidence: number
  data: any
}

interface ManualMatchDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  bankEntry: BankEntry | null
  possibleMatches: PossibleMatch[]
  onCreateMatch: (bankEntryId: string, matchData: any, notes: string) => void
  onMarkAsUnmatched: (bankEntryId: string, reason: string, notes: string) => void
}

export function ManualMatchDialog({
  isOpen,
  onOpenChange,
  bankEntry,
  possibleMatches,
  onCreateMatch,
  onMarkAsUnmatched
}: ManualMatchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMatch, setSelectedMatch] = useState<PossibleMatch | null>(null)
  const [notes, setNotes] = useState("")
  const [unmatchedReason, setUnmatchedReason] = useState("")

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
      setSelectedMatch(null)
      setNotes("")
      setUnmatchedReason("")
    }
  }, [isOpen])

  if (!bankEntry) return null

  // Filter possible matches based on search
  const filteredMatches = possibleMatches.filter(match =>
    match.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.amount.toString().includes(searchTerm) ||
    match.date.includes(searchTerm)
  )

  const handleCreateMatch = () => {
    if (selectedMatch && bankEntry) {
      onCreateMatch(bankEntry.id, selectedMatch, notes)
      onOpenChange(false)
    }
  }

  const handleMarkUnmatched = () => {
    if (bankEntry && unmatchedReason) {
      onMarkAsUnmatched(bankEntry.id, unmatchedReason, notes)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            Manual Bank Match
          </DialogTitle>
          <DialogDescription>
            Ordnen Sie den Bank-Eintrag manuell einer Transaktion zu oder markieren Sie ihn als unmatched
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bank Entry Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {bankEntry.direction === 'credit' ? (
                    <TrendingUp className="text-green-600" size={16} />
                  ) : (
                    <TrendingDown className="text-red-600" size={16} />
                  )}
                  Bank-Eintrag
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Betrag:</span>
                  <span className="font-medium">CHF {bankEntry.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Datum:</span>
                  <span>{formatDateForDisplay(bankEntry.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Richtung:</span>
                  <Badge variant={bankEntry.direction === 'credit' ? 'default' : 'destructive'}>
                    {bankEntry.direction === 'credit' ? 'Eingang' : 'Ausgang'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Beschreibung:</span>
                  <p className="text-sm mt-1 p-2 bg-muted/50 rounded">{bankEntry.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notizen</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optionale Notizen zur manuellen Zuordnung..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Possible Matches */}
          <div className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Transaktionen durchsuchen</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nach Betrag, Datum oder Beschreibung suchen..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Matches List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Mögliche Matches ({filteredMatches.length})</span>
                  {selectedMatch && (
                    <Badge variant="default">Match ausgewählt</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {filteredMatches.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => setSelectedMatch(match)}
                        className={`
                          p-3 rounded border cursor-pointer transition-all
                          ${selectedMatch?.id === match.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {match.type === 'sale' ? (
                                <Receipt size={14} />
                              ) : (
                                <CreditCard size={14} />
                              )}
                              <span className="text-sm font-medium">{match.description}</span>
                              <Badge variant="outline" className="text-xs">
                                {match.confidence}% Match
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <Calendar size={12} className="inline mr-1" />
                              {formatDateForDisplay(match.date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">CHF {match.amount.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              Diff: CHF {Math.abs(match.amount - bankEntry.amount).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredMatches.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        <AlertTriangle size={24} className="mx-auto mb-2" />
                        <p>Keine passenden Transaktionen gefunden</p>
                        <p className="text-xs">Versuchen Sie andere Suchbegriffe</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Mark as Unmatched */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <X size={16} />
                  Als Unmatched markieren
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={unmatchedReason} onValueChange={setUnmatchedReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Grund auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_match">Keine passende Transaktion gefunden</SelectItem>
                    <SelectItem value="different_period">Andere Abrechnungsperiode</SelectItem>
                    <SelectItem value="external_transaction">Externe Transaktion</SelectItem>
                    <SelectItem value="bank_fee">Bankgebühr</SelectItem>
                    <SelectItem value="correction">Buchungskorrektur</SelectItem>
                    <SelectItem value="other">Anderer Grund</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleMarkUnmatched}
              disabled={!unmatchedReason}
            >
              <X size={16} className="mr-2" />
              Als Unmatched markieren
            </Button>
            
            <Button
              onClick={handleCreateMatch}
              disabled={!selectedMatch}
            >
              <Check size={16} className="mr-2" />
              Match erstellen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}