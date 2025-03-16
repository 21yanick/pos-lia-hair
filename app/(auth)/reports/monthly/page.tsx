"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Download, FileText, TrendingUp, TrendingDown, CheckCircle } from "lucide-react"

export default function MonthlyReportPage() {
  // State for the close month dialog
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [closeNotes, setCloseNotes] = useState("")
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)

  // Mock data
  const [reportStatus, setReportStatus] = useState("draft") // or 'closed'
  const currentMonth = new Date().toLocaleDateString("de-CH", { month: "long", year: "numeric" })

  const summary = {
    total: 12450.5,
    previousMonth: 11200.0,
    transactions: 185,
    avgDaily: 415.0,
    services: 9850.5,
    products: 2600.0,
    cash: 4500.5,
    twint: 5200.0,
    sumup: 2750.0,
  }

  const percentChange = ((summary.total - summary.previousMonth) / summary.previousMonth) * 100

  const dailyData = [
    { day: "01.03.2023", total: 380.5 },
    { day: "02.03.2023", total: 425.0 },
    { day: "03.03.2023", total: 510.5 },
    { day: "04.03.2023", total: 620.0 },
    { day: "05.03.2023", total: 350.0 },
    // More days would be here
  ]

  const topServices = [
    { name: "Damen Haarschnitt", count: 45, total: 2925.0 },
    { name: "Färben", count: 32, total: 2720.0 },
    { name: "Herren Haarschnitt", count: 38, total: 1710.0 },
    { name: "Strähnen", count: 15, total: 1425.0 },
    { name: "Kinder Haarschnitt", count: 25, total: 875.0 },
  ]

  const handleCloseMonth = () => {
    // Close the dialog and open confirmation
    setIsCloseDialogOpen(false)
    setIsConfirmationDialogOpen(true)
  }

  const confirmCloseMonth = () => {
    // Here would be the API call to close the month
    setReportStatus("closed")
    setIsConfirmationDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Monatsabschluss</h1>
          <p className="text-gray-500">{currentMonth}</p>
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue="march">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Monat auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="january">Januar 2023</SelectItem>
              <SelectItem value="february">Februar 2023</SelectItem>
              <SelectItem value="march">März 2023</SelectItem>
            </SelectContent>
          </Select>

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Monatsumsatz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold mr-2">CHF {summary.total.toFixed(2)}</span>
              <div className={`flex items-center ${percentChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {percentChange >= 0 ? (
                  <TrendingUp size={16} className="mr-1" />
                ) : (
                  <TrendingDown size={16} className="mr-1" />
                )}
                <span>{Math.abs(percentChange).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">vs. Vormonat (CHF {summary.previousMonth.toFixed(2)})</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Transaktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold">{summary.transactions}</span>
            </div>
            <p className="text-sm text-gray-500">Ø {(summary.transactions / 30).toFixed(1)} pro Tag</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Durchschnittlicher Tagesumsatz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold">CHF {summary.avgDaily.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tagesübersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed rounded-md">
                <p className="text-gray-500">Hier würde ein Diagramm mit den täglichen Umsätzen angezeigt werden.</p>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-2">
                {dailyData.map((day, index) => (
                  <div key={index} className="text-center p-2 border rounded-md">
                    <div className="text-xs text-gray-500">{day.day.split(".")[0]}</div>
                    <div className="font-medium">{day.total.toFixed(0)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Umsatzverteilung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Dienstleistungen</span>
                  <span className="text-sm font-medium">{((summary.services / summary.total) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(summary.services / summary.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm mt-1">CHF {summary.services.toFixed(2)}</div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Produkte</span>
                  <span className="text-sm font-medium">{((summary.products / summary.total) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(summary.products / summary.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm mt-1">CHF {summary.products.toFixed(2)}</div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Zahlungsarten</h4>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bar:</span>
                    <span>CHF {summary.cash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Twint:</span>
                    <span>CHF {summary.twint.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>SumUp:</span>
                    <span>CHF {summary.sumup.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Dienstleistungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topServices.map((service, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.count}x</div>
                    </div>
                    <div className="font-medium">CHF {service.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Close Month Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monatsabschluss durchführen</DialogTitle>
            <DialogDescription>
              Möchten Sie den Monatsabschluss für {currentMonth} durchführen? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="flex justify-between mb-2">
                <span>Gesamtumsatz:</span>
                <span className="font-medium">CHF {summary.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Dienstleistungen:</span>
                <span className="font-medium">CHF {summary.services.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Produkte:</span>
                <span className="font-medium">CHF {summary.products.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="close-notes">Notizen (optional)</Label>
              <Textarea
                id="close-notes"
                placeholder="Zusätzliche Informationen zum Monatsabschluss..."
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCloseMonth}>Monatsabschluss durchführen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-center">
              <CheckCircle className="text-green-500 mr-2" size={24} />
              Monatsabschluss bestätigen
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <p className="text-center">
                Sind Sie sicher, dass Sie den Monatsabschluss für {currentMonth} durchführen möchten? Nach dem Abschluss
                können keine Änderungen mehr vorgenommen werden.
              </p>

              <div className="p-4 bg-gray-50 rounded">
                <div className="flex justify-between mb-2">
                  <span>Gesamtumsatz:</span>
                  <span className="font-medium">CHF {summary.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Anzahl Transaktionen:</span>
                  <span className="font-medium">{summary.transactions}</span>
                </div>
              </div>

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
            <Button onClick={confirmCloseMonth}>Monatsabschluss bestätigen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

