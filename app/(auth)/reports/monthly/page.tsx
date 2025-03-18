"use client"

import { useState, useEffect, useRef } from "react"
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
import { Download, FileText, TrendingUp, TrendingDown, CheckCircle, Loader2 } from "lucide-react"
import { useMonthlyReports, type MonthlySummary, type DailyRevenue, type TopItem } from "@/lib/hooks/useMonthlyReports"
import { useToast } from "@/lib/hooks/useToast"

export default function MonthlyReportPage() {
  // Toast für Benachrichtigungen
  const { toast } = useToast()

  // Hooks - einmalige Instanziierung mit useRef
  const monthlyReportsHookRef = useRef(useMonthlyReports())
  const {
    loading,
    error,
    currentMonthlyReport,
    getMonthlyReportByDate,
    calculateMonthlySummary,
    getDailyRevenuesForMonth,
    getTopItemsForMonth,
    performMonthlyClose
  } = monthlyReportsHookRef.current

  // State für die Dialoge
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [closeNotes, setCloseNotes] = useState("")
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)
  
  // State für die Daten
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>(formatYearMonth(new Date()))
  const [summary, setSummary] = useState<MonthlySummary>({
    cashTotal: 0,
    twintTotal: 0,
    sumupTotal: 0,
    totalRevenue: 0,
    transactionCount: 0,
    servicesTotal: 0,
    productsTotal: 0,
    avgDailyRevenue: 0
  })
  const [dailyRevenues, setDailyRevenues] = useState<DailyRevenue[]>([])
  const [topServices, setTopServices] = useState<TopItem[]>([])

  // Aktuelle Auswahl in Jahr und Monat aufteilen
  const selectedYear = parseInt(selectedMonth.split('-')[0])
  const selectedMonthNum = parseInt(selectedMonth.split('-')[1])
  
  // Formatierter Monatsname für die Anzeige
  const formattedMonthYear = new Date(selectedYear, selectedMonthNum - 1, 1).toLocaleDateString("de-CH", { 
    month: "long", 
    year: "numeric"
  })

  // Hilfsfunktion zum Formatieren von Jahr-Monat
  function formatYearMonth(date: Date): string {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    return `${year}-${month.toString().padStart(2, '0')}`
  }

  // Prozentuale Änderung zum Vormonat berechnen
  const percentChange = summary.previousMonthRevenue 
    ? ((summary.totalRevenue - summary.previousMonthRevenue) / summary.previousMonthRevenue) * 100 
    : 0

  // Fehlerbehandlung
  useEffect(() => {
    if (error) {
      toast({
        title: "Fehler",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Daten laden, wenn sich der Monat ändert
  useEffect(() => {
    const loadMonthlyData = async () => {
      setIsLoadingData(true)
      
      try {
        console.log(`Lade Daten für ${selectedYear}-${selectedMonthNum}`)
        
        // 1. Monatsbericht abrufen (wenn vorhanden)
        const reportResult = await getMonthlyReportByDate(selectedYear, selectedMonthNum)
        console.log("Monatsbericht-Ergebnis:", reportResult)
        
        // 2. Monatliche Zusammenfassung berechnen
        const summaryResult = await calculateMonthlySummary(selectedYear, selectedMonthNum)
        console.log("Zusammenfassung-Ergebnis:", summaryResult)
        
        if (summaryResult.success) {
          setSummary(summaryResult.summary)
        }
        
        // 3. Tägliche Umsätze abrufen (für Diagramm)
        const revenuesResult = await getDailyRevenuesForMonth(selectedYear, selectedMonthNum)
        console.log("Tagesumsätze-Ergebnis:", revenuesResult)
        
        if (revenuesResult.success) {
          setDailyRevenues(revenuesResult.dailyRevenues)
        }
        
        // 4. Top-Dienstleistungen abrufen
        const topServicesResult = await getTopItemsForMonth(selectedYear, selectedMonthNum, 'service', 5)
        console.log("Top-Dienstleistungen-Ergebnis:", topServicesResult)
        
        if (topServicesResult.success) {
          setTopServices(topServicesResult.topItems)
        }
      } catch (err: any) {
        console.error('Fehler beim Laden der Monatsdaten:', err)
        toast({
          title: "Fehler",
          description: "Die Monatsdaten konnten nicht geladen werden: " + (err.message || "Unbekannter Fehler"),
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }
    
    loadMonthlyData()
  }, [selectedYear, selectedMonthNum])

  // Monatsabschluss vorbereiten
  const handleCloseMonth = () => {
    // Dialog schließen und Bestätigung öffnen
    setIsCloseDialogOpen(false)
    setIsConfirmationDialogOpen(true)
  }

  // Monatsabschluss durchführen
  const confirmCloseMonth = async () => {
    try {
      console.log(`Führe Monatsabschluss für ${selectedYear}-${selectedMonthNum} durch`)
      
      const result = await performMonthlyClose(selectedYear, selectedMonthNum, closeNotes || undefined)
      
      if (result.success) {
        toast({
          title: "Monatsabschluss erfolgreich",
          description: `Der Monatsabschluss für ${formattedMonthYear} wurde erfolgreich durchgeführt.`,
        })
        
        // Dialog schließen
        setIsConfirmationDialogOpen(false)
        
        // Daten neu laden
        const reportResult = await getMonthlyReportByDate(selectedYear, selectedMonthNum)
        console.log("Aktualisierter Monatsbericht:", reportResult)
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Der Monatsabschluss konnte nicht durchgeführt werden.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error('Fehler beim Monatsabschluss:', err)
      toast({
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      })
    }
  }

  // Monatswahl-Optionen erstellen (letzte 12 Monate)
  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const yearMonth = formatYearMonth(date)
      const label = date.toLocaleDateString("de-CH", { month: "long", year: "numeric" })
      options.push({ value: yearMonth, label })
    }
    
    return options
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Monatsabschluss</h1>
          <p className="text-gray-500">{formattedMonthYear}</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Monat auswählen" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant={currentMonthlyReport?.status === "closed" ? "default" : "outline"}>
            {currentMonthlyReport?.status === "closed" ? "Abgeschlossen" : "Entwurf"}
          </Badge>

          <Button variant="outline" className="flex items-center gap-2" disabled={!currentMonthlyReport}>
            <Download size={16} />
            PDF
          </Button>

          {currentMonthlyReport?.status !== "closed" && (
            <Button 
              className="flex items-center gap-2" 
              onClick={() => setIsCloseDialogOpen(true)}
              disabled={isLoadingData}
            >
              <FileText size={16} />
              Abschließen
            </Button>
          )}
        </div>
      </div>

      {isLoadingData ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={30} className="animate-spin mb-4" />
          <span>Daten werden geladen...</span>
          <p className="text-gray-500 mt-2">
            Monat: {formattedMonthYear}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Monatsumsatz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-2xl font-bold mr-2">CHF {(summary.servicesTotal + summary.productsTotal).toFixed(2)}</span>
                  {summary.previousMonthRevenue !== undefined && (
                    <div className={`flex items-center ${percentChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {percentChange >= 0 ? (
                        <TrendingUp size={16} className="mr-1" />
                      ) : (
                        <TrendingDown size={16} className="mr-1" />
                      )}
                      <span>{Math.abs(percentChange).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                {summary.previousMonthRevenue !== undefined && (
                  <p className="text-sm text-gray-500">vs. Vormonat (CHF {summary.previousMonthRevenue.toFixed(2)})</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Transaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-2xl font-bold">{summary.transactionCount}</span>
                </div>
                <p className="text-sm text-gray-500">
                  Ø {((summary.transactionCount / new Date(selectedYear, selectedMonthNum, 0).getDate()) || 0).toFixed(1)} pro Tag
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Durchschnittlicher Tagesumsatz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-2xl font-bold">CHF {summary.avgDailyRevenue.toFixed(2)}</span>
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
                  {dailyRevenues.length > 0 ? (
                    <>
                      <div className="h-64 flex items-center justify-center border border-dashed rounded-md">
                        <p className="text-gray-500">Hier würde ein Diagramm mit den täglichen Umsätzen angezeigt werden.</p>
                      </div>

                      <div className="mt-4 grid grid-cols-7 gap-2">
                        {dailyRevenues.slice(0, 7).map((day, index) => (
                          <div key={index} className="text-center p-2 border rounded-md">
                            <div className="text-xs text-gray-500">{day.day.split(".")[0]}</div>
                            <div className="font-medium">{day.total.toFixed(0)}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Keine Tagesberichte für diesen Monat verfügbar.</p>
                    </div>
                  )}
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
                      <span className="text-sm font-medium">
                        {(summary.servicesTotal + summary.productsTotal) > 0 
                          ? ((summary.servicesTotal / (summary.servicesTotal + summary.productsTotal)) * 100).toFixed(0) 
                          : "0"}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: (summary.servicesTotal + summary.productsTotal) > 0 
                            ? `${(summary.servicesTotal / (summary.servicesTotal + summary.productsTotal)) * 100}%` 
                            : "0%" 
                        }}
                      ></div>
                    </div>
                    <div className="text-right text-sm mt-1">CHF {summary.servicesTotal.toFixed(2)}</div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Produkte</span>
                      <span className="text-sm font-medium">
                        {(summary.servicesTotal + summary.productsTotal) > 0 
                          ? ((summary.productsTotal / (summary.servicesTotal + summary.productsTotal)) * 100).toFixed(0) 
                          : "0"}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ 
                          width: (summary.servicesTotal + summary.productsTotal) > 0 
                            ? `${(summary.productsTotal / (summary.servicesTotal + summary.productsTotal)) * 100}%` 
                            : "0%" 
                        }}
                      ></div>
                    </div>
                    <div className="text-right text-sm mt-1">CHF {summary.productsTotal.toFixed(2)}</div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Zahlungsarten</h4>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Bar:</span>
                        <span>CHF {summary.cashTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Twint:</span>
                        <span>CHF {summary.twintTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>SumUp:</span>
                        <span>CHF {summary.sumupTotal.toFixed(2)}</span>
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
                  {topServices.length > 0 ? (
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
                  ) : (
                    <p className="text-gray-500 py-4 text-center">Keine Dienstleistungen für diesen Monat verfügbar.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Close Month Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monatsabschluss durchführen</DialogTitle>
            <DialogDescription>
              Möchten Sie den Monatsabschluss für {formattedMonthYear} durchführen? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="flex justify-between mb-2">
                <span>Gesamtumsatz:</span>
                <span className="font-medium">CHF {summary.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Dienstleistungen:</span>
                <span className="font-medium">CHF {summary.servicesTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Produkte:</span>
                <span className="font-medium">CHF {summary.productsTotal.toFixed(2)}</span>
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
                Sind Sie sicher, dass Sie den Monatsabschluss für {formattedMonthYear} durchführen möchten? Nach dem Abschluss
                können keine Änderungen mehr vorgenommen werden.
              </p>

              <div className="p-4 bg-gray-50 rounded">
                <div className="flex justify-between mb-2">
                  <span>Gesamtumsatz:</span>
                  <span className="font-medium">CHF {summary.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Anzahl Transaktionen:</span>
                  <span className="font-medium">{summary.transactionCount}</span>
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

