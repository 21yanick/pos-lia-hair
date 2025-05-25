import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Download } from "lucide-react"
import type { MonthlyStatsData } from "./MonthlyStats"

interface MonthlyActionsProps {
  selectedMonth: string
  formattedMonthYear: string
  currentMonthlySummary: any
  stats: MonthlyStatsData
  onClose: (notes: string) => Promise<void>
  onExportPDF: () => void
  loading?: boolean
}

export function MonthlyActions({
  selectedMonth,
  formattedMonthYear,
  currentMonthlySummary,
  stats,
  onClose,
  onExportPDF,
  loading = false
}: MonthlyActionsProps) {
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [closeNotes, setCloseNotes] = useState("")

  const handleCloseMonth = async () => {
    console.log("🎯 MonthlyActions handleCloseMonth aufgerufen mit notes:", closeNotes)
    try {
      console.log("🎯 Rufe onClose auf...")
      await onClose(closeNotes)
      console.log("🎯 onClose erfolgreich, schließe Dialog")
      setIsCloseDialogOpen(false)
      setCloseNotes("")
    } catch (error) {
      console.error("🎯 Fehler in MonthlyActions handleCloseMonth:", error)
      // Error handling is done in parent component
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Status Badge */}
        <Badge variant={currentMonthlySummary?.status === "closed" ? "default" : "outline"}>
          {currentMonthlySummary?.status === "closed" ? "Abgeschlossen" : "Entwurf"}
        </Badge>

        {/* PDF Export Button */}
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          disabled={stats.salesTotal === 0 && stats.expensesTotal === 0}
          onClick={onExportPDF}
        >
          <Download size={16} />
          PDF
        </Button>

        {/* Monatsabschluss Button - nur wenn noch nicht abgeschlossen */}
        {currentMonthlySummary?.status !== "closed" && (
          <Button 
            className="flex items-center gap-2" 
            onClick={() => setIsCloseDialogOpen(true)}
            disabled={loading}
          >
            <FileText size={16} />
            Monatsabschluss durchführen
          </Button>
        )}
      </div>

      {/* Dialog für Monatsabschluss */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monatsabschluss durchführen</DialogTitle>
            <DialogDescription>
              Der Monatsabschluss für {formattedMonthYear} wird komplett durchgeführt: Summary erstellen, schließen, PDF generieren und in Dokumente speichern.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Zusammenfassung */}
            <div className="p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-3">Zusammenfassung</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-600">Gesamtumsatz:</span>
                  <span className="font-medium text-green-600">CHF {stats.salesTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>├── Bar:</span>
                  <span>CHF {stats.salesCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>├── TWINT:</span>
                  <span>CHF {stats.salesTwint.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>└── SumUp:</span>
                  <span>CHF {stats.salesSumup.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t pt-2">
                  <span className="text-red-600">Gesamtausgaben:</span>
                  <span className="font-medium text-red-600">CHF {stats.expensesTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>├── Bar:</span>
                  <span>CHF {stats.expensesCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>└── Bank:</span>
                  <span>CHF {stats.expensesBank.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Tage mit Umsatz:</span>
                  <span>{stats.transactionDays} von {stats.daysInMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ø Tagesumsatz:</span>
                  <span>CHF {stats.avgDailyRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notizen */}
            <div className="space-y-2">
              <Label htmlFor="close-notes">Notizen (optional)</Label>
              <Textarea
                id="close-notes"
                placeholder="Zusätzliche Informationen zum Monatsabschluss..."
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCloseDialogOpen(false)
                setCloseNotes("")
              }}
            >
              Abbrechen
            </Button>
            <Button onClick={handleCloseMonth} disabled={loading}>
              Monatsabschluss durchführen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}