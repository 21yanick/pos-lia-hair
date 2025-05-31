"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { AlertTriangle } from "lucide-react"
import type { CashCountData, DailySummaryStatus } from "../utils/dailyTypes"

export type { CashCountData }

interface CashCountDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  expectedCash: number
  currentStatus: DailySummaryStatus
  onConfirm: (data: CashCountData) => void
  isSubmitting?: boolean
}

export function CashCountDialog({
  isOpen,
  onOpenChange,
  expectedCash,
  currentStatus,
  onConfirm,
  isSubmitting = false
}: CashCountDialogProps) {
  const [actualCash, setActualCash] = useState("")
  const [notes, setNotes] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  const isUpdate = currentStatus === "closed"
  const actualCashNum = Number.parseFloat(actualCash) || 0
  const difference = actualCashNum - expectedCash

  const handleSubmit = () => {
    if (!actualCash || isNaN(actualCashNum)) return

    const data: CashCountData = {
      expectedCash,
      actualCash: actualCashNum,
      difference,
      notes: notes.trim()
    }

    if (difference === 0) {
      // Kein Unterschied - direkt bestätigen
      onConfirm(data)
    } else {
      // Unterschied vorhanden - Bestätigung anzeigen
      setShowConfirmation(true)
    }
  }

  const handleConfirm = () => {
    const data: CashCountData = {
      expectedCash,
      actualCash: actualCashNum,
      difference,
      notes: notes.trim()
    }
    onConfirm(data)
    setShowConfirmation(false)
  }

  const handleCancel = () => {
    setActualCash("")
    setNotes("")
    setShowConfirmation(false)
    onOpenChange(false)
  }

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tagesabschluss bestätigen</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded">
                <div className="flex justify-between mb-2">
                  <span>Erwarteter Bargeldbestand:</span>
                  <span className="font-medium">CHF {expectedCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tatsächlicher Bargeldbestand:</span>
                  <span className="font-medium">CHF {actualCashNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Differenz:</span>
                  <span
                    className={`font-medium ${
                      difference === 0 
                        ? "text-success" 
                        : difference > 0 
                        ? "text-primary" 
                        : "text-destructive"
                    }`}
                  >
                    CHF {difference.toFixed(2)}
                  </span>
                </div>
              </div>

              {difference !== 0 && (
                <div
                  className={`flex items-start p-3 rounded ${
                    difference > 0 
                      ? "bg-primary/10 text-primary" 
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <AlertTriangle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    {difference > 0
                      ? "Es ist mehr Bargeld in der Kasse als erwartet. Bitte überprüfen Sie die Transaktionen."
                      : "Es fehlt Bargeld in der Kasse. Bitte überprüfen Sie die Transaktionen."}
                  </div>
                </div>
              )}

              {notes && (
                <div className="space-y-2">
                  <Label>Notizen:</Label>
                  <div className="p-3 bg-muted/50 rounded text-sm">{notes}</div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Zurück
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              Tagesabschluss bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Tagesabschluss aktualisieren" : "Tagesabschluss durchführen"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate 
              ? "Aktualisieren Sie den Tagesabschluss mit neuen Verkäufen und aktuellem Bargeldbestand."
              : "Bitte zählen Sie den aktuellen Bargeldbestand und geben Sie den Betrag ein."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="expected-cash">Erwarteter Bargeldbestand</Label>
            <Input 
              id="expected-cash" 
              value={`CHF ${expectedCash.toFixed(2)}`} 
              disabled 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actual-cash">Tatsächlicher Bargeldbestand (CHF)</Label>
            <Input
              id="actual-cash"
              type="number"
              step="0.05"
              min="0"
              placeholder="0.00"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Zusätzliche Informationen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!actualCash || isNaN(actualCashNum) || isSubmitting}
          >
            {isUpdate ? "Aktualisieren" : "Tagesabschluss durchführen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}