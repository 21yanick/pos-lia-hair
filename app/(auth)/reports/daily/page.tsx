"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Wallet, CreditCard, Download, FileText, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function DailyReportPage() {
  // State for the close register dialog
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [actualCashAmount, setActualCashAmount] = useState("")
  const [closeNotes, setCloseNotes] = useState("")
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)
  const [discrepancy, setDiscrepancy] = useState(0)

  // Mock data
  const [reportStatus, setReportStatus] = useState("draft") // or 'closed'
  const today = new Date().toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const transactions = [
    { id: "1", time: "14:25", amount: 85.0, method: "cash", status: "completed" },
    { id: "2", time: "13:10", amount: 120.0, method: "twint", status: "completed" },
    { id: "3", time: "11:45", amount: 65.5, method: "sumup", status: "completed" },
    { id: "4", time: "10:30", amount: 95.0, method: "cash", status: "completed" },
    { id: "5", time: "09:15", amount: 45.0, method: "twint", status: "completed" },
  ]

  const summary = {
    cash: 180.0,
    twint: 165.0,
    sumup: 65.5,
    total: 410.5,
    startingCash: 200.0,
    endingCash: 380.0,
  }

  const handleCloseRegister = () => {
    const actualCash = Number.parseFloat(actualCashAmount)
    if (isNaN(actualCash)) return

    const calculatedDiscrepancy = actualCash - summary.endingCash
    setDiscrepancy(calculatedDiscrepancy)

    // Close the dialog and open confirmation
    setIsCloseDialogOpen(false)
    setIsConfirmationDialogOpen(true)
  }

  const confirmCloseRegister = () => {
    // Here would be the API call to close the register
    setReportStatus("closed")
    setIsConfirmationDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tagesabschluss</h1>
          <p className="text-gray-500">{today}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={reportStatus === "closed" ? "default" : "outline"}>
            {reportStatus === "closed" ? "Abgeschlossen" : "Entwurf"}
          </Badge>

          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            PDF
          </Button>

          {reportStatus !== "closed" && (
            <Button className="flex items-center gap-2" onClick={() => setIsCloseDialogOpen(true)}>
              <FileText size={16} />
              Abschließen
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaktionen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zeit</TableHead>
                    <TableHead>Zahlungsart</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.time}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {transaction.method === "cash" && <Wallet size={16} className="mr-2 text-green-500" />}
                          {transaction.method === "twint" && <Wallet size={16} className="mr-2 text-purple-500" />}
                          {transaction.method === "sumup" && <CreditCard size={16} className="mr-2 text-blue-500" />}
                          <span>
                            {transaction.method === "cash" && "Bar"}
                            {transaction.method === "twint" && "Twint"}
                            {transaction.method === "sumup" && "SumUp"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                          Abgeschlossen
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">CHF {transaction.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}

                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        Keine Transaktionen für diesen Tag.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Zusammenfassung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Bar:</span>
                  <span>CHF {summary.cash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Twint:</span>
                  <span>CHF {summary.twint.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SumUp:</span>
                  <span>CHF {summary.sumup.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Gesamtumsatz:</span>
                  <span>CHF {summary.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Anfangsbestand:</span>
                  <span>CHF {summary.startingCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">+ Bareinnahmen:</span>
                  <span>CHF {summary.cash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Endbestand:</span>
                  <span>CHF {summary.endingCash.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Close Register Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tagesabschluss durchführen</DialogTitle>
            <DialogDescription>
              Bitte zählen Sie den aktuellen Bargeldbestand und geben Sie den Betrag ein.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expected-cash">Erwarteter Bargeldbestand</Label>
              <Input id="expected-cash" value={summary.endingCash.toFixed(2)} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual-cash">Tatsächlicher Bargeldbestand (CHF)</Label>
              <Input
                id="actual-cash"
                type="number"
                step="0.05"
                min="0"
                placeholder="0.00"
                value={actualCashAmount}
                onChange={(e) => setActualCashAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="close-notes">Notizen (optional)</Label>
              <Textarea
                id="close-notes"
                placeholder="Zusätzliche Informationen..."
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCloseRegister}>Tagesabschluss durchführen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tagesabschluss bestätigen</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <div className="flex justify-between mb-2">
                  <span>Erwarteter Bargeldbestand:</span>
                  <span className="font-medium">CHF {summary.endingCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tatsächlicher Bargeldbestand:</span>
                  <span className="font-medium">CHF {Number.parseFloat(actualCashAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Differenz:</span>
                  <span
                    className={`font-medium ${discrepancy === 0 ? "text-green-600" : discrepancy > 0 ? "text-blue-600" : "text-red-600"}`}
                  >
                    CHF {discrepancy.toFixed(2)}
                  </span>
                </div>
              </div>

              {discrepancy !== 0 && (
                <div
                  className={`flex items-start p-3 rounded ${discrepancy > 0 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}
                >
                  <AlertTriangle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    {discrepancy > 0
                      ? "Es ist mehr Bargeld in der Kasse als erwartet. Bitte überprüfen Sie die Transaktionen."
                      : "Es fehlt Bargeld in der Kasse. Bitte überprüfen Sie die Transaktionen."}
                  </div>
                </div>
              )}

              {closeNotes && (
                <div className="space-y-2">
                  <Label>Notizen:</Label>
                  <div className="p-3 bg-gray-50 rounded text-sm">{closeNotes}</div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmationDialogOpen(false)}>
              Zurück
            </Button>
            <Button onClick={confirmCloseRegister}>Tagesabschluss bestätigen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

