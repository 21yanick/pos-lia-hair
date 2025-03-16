"use client"

import React, { useState, useEffect, useRef } from "react"
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
import { Wallet, CreditCard, Download, FileText, AlertTriangle, Loader2, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useDailyReports } from "@/lib/hooks/useDailyReports"
import { useToast } from "@/lib/hooks/useToast"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export default function DailyReportPage() {
  // Hooks - einmalige Instanziierung mit useRef
  const dailyReportsHookRef = React.useRef(useDailyReports());
  const { 
    loading, 
    error, 
    dailyReports, 
    currentDailyReport, 
    createDailyReport, 
    getDailyReportByDate, 
    calculateDailySummary, 
    getTransactionsForDate,
    closeDailyReport
  } = dailyReportsHookRef.current
  const { toast } = useToast()

  // State für die UI
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [actualCashAmount, setActualCashAmount] = useState("")
  const [closeNotes, setCloseNotes] = useState("")
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)
  const [discrepancy, setDiscrepancy] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [summary, setSummary] = useState({
    cash: 0,
    twint: 0,
    sumup: 0,
    total: 0,
    startingCash: 0,
    endingCash: 0,
  })

  // State für die Datumsauswahl
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Formatiertes Datum für die Anzeige und API-Anfragen
  const formattedDate = format(selectedDate, 'dd.MM.yyyy')
  const apiDateFormat = format(selectedDate, 'yyyy-MM-dd')
  
  console.log("Aktuelles Datum für API-Anfragen:", apiDateFormat)

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

  // Daten laden, wenn sich das Datum ändert
  useEffect(() => {
    const loadReportData = async () => {
      console.log("Lade Berichtsdaten für Datum:", apiDateFormat);
      setIsLoadingData(true)
      
      try {
        // 1. Tagesbericht für das ausgewählte Datum abrufen
        console.log("Rufe Tagesbericht ab...");
        const reportResult = await getDailyReportByDate(apiDateFormat)
        console.log("Tagesbericht Ergebnis:", reportResult);
        
        // 2. Transaktionen für das ausgewählte Datum abrufen
        console.log("Rufe Transaktionen ab...");
        const transactionsResult = await getTransactionsForDate(apiDateFormat)
        console.log("Transaktionen Ergebnis:", transactionsResult);
        
        // Transaktionen verarbeiten
        let formattedTransactions: any[] = [];
        if (transactionsResult.transactions && Array.isArray(transactionsResult.transactions)) {
          formattedTransactions = transactionsResult.transactions.map(t => ({
            id: t.id,
            time: new Date(t.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            amount: t.total_amount,
            method: t.payment_method,
            status: t.status
          }));
        }
        
        console.log("Formatierte Transaktionen:", formattedTransactions);
        setTransactions(formattedTransactions)
        
        // 3. Zusammenfassung der Tagessummen berechnen
        // Hier zuerst die Standardwerte festlegen
        let cashTotal = 0;
        let twintTotal = 0;
        let sumupTotal = 0;
        let totalRevenue = 0;
        let startingCash = 0;
        let endingCash = 0;
        
        // Wenn ein Bericht existiert, die Daten von dort nehmen
        if (reportResult.success && reportResult.report) {
          console.log("Verwende Daten aus existierendem Bericht");
          const report = reportResult.report;
          cashTotal = report.cash_total || 0;
          twintTotal = report.twint_total || 0;
          sumupTotal = report.sumup_total || 0;
          totalRevenue = (report.cash_total || 0) + (report.twint_total || 0) + (report.sumup_total || 0);
          startingCash = report.starting_cash || 0;
          endingCash = report.ending_cash || 0;
        } 
        // Sonst die Daten aus der Zusammenfassung holen
        else {
          console.log("Berechne Zusammenfassung aus Transaktionen");
          const summaryResult = await calculateDailySummary(apiDateFormat);
          console.log("Zusammenfassung Ergebnis:", summaryResult);
          
          if (summaryResult.summary) {
            cashTotal = summaryResult.summary.cashTotal || 0;
            twintTotal = summaryResult.summary.twintTotal || 0;
            sumupTotal = summaryResult.summary.sumupTotal || 0;
            totalRevenue = summaryResult.summary.totalRevenue || 0;
            // Anfangs- und Endbestand auf 0 belassen
          }
        }
        
        // Zusammenfassung aktualisieren
        const summaryData = {
          cash: cashTotal,
          twint: twintTotal,
          sumup: sumupTotal,
          total: totalRevenue,
          startingCash: startingCash,
          endingCash: endingCash,
        };
        
        console.log("Aktualisiere Zusammenfassung:", summaryData);
        setSummary(summaryData);
      } catch (err: any) {
        console.error('Fehler beim Laden der Berichtsdaten:', err);
        const errorMessage = err?.message || "Ein unbekannter Fehler ist aufgetreten";
        console.log("Fehler-Details:", {
          message: errorMessage,
          stack: err?.stack,
          date: apiDateFormat
        });
        
        toast({
          title: "Fehler",
          description: "Die Berichtsdaten konnten nicht geladen werden: " + errorMessage,
          variant: "destructive",
        });
        
        // Bei Fehler leere Daten anzeigen
        setTransactions([]);
        setSummary({
          cash: 0,
          twint: 0,
          sumup: 0,
          total: 0,
          startingCash: 0,
          endingCash: 0,
        });
      } finally {
        console.log("Laden der Daten abgeschlossen für Datum:", apiDateFormat);
        setIsLoadingData(false);
      }
    }
    
    loadReportData()
  }, [selectedDate, apiDateFormat])

  const handleCloseRegister = () => {
    const actualCash = Number.parseFloat(actualCashAmount)
    if (isNaN(actualCash)) return

    const calculatedDiscrepancy = actualCash - summary.endingCash
    setDiscrepancy(calculatedDiscrepancy)

    // Dialog schließen und Bestätigung öffnen
    setIsCloseDialogOpen(false)
    setIsConfirmationDialogOpen(true)
  }

  const confirmCloseRegister = async () => {
    console.log("Tagesabschluss bestätigen, aktueller Bericht:", currentDailyReport);
    const actualCash = Number.parseFloat(actualCashAmount)
    if (isNaN(actualCash)) return
    
    if (!currentDailyReport) {
      // Neuen Tagesbericht erstellen, falls keiner existiert
      console.log("Erstelle neuen Tagesbericht mit Daten:", {
        date: apiDateFormat,
        cash_total: summary.cash,
        twint_total: summary.twint,
        sumup_total: summary.sumup,
        starting_cash: summary.startingCash || 0,
        ending_cash: actualCash,
        status: 'closed',
        notes: closeNotes || null
      });
      
      try {
        // Benutzer-ID wird im Hook automatisch abgerufen
        const createResult = await createDailyReport({
          date: apiDateFormat,
          cash_total: summary.cash,
          twint_total: summary.twint,
          sumup_total: summary.sumup,
          starting_cash: summary.startingCash || 0, // Fallback, falls nicht verfügbar
          ending_cash: actualCash,
          status: 'closed',
          notes: closeNotes || null,
          monthly_report_id: null, // Wird später bei Monatsabschluss gesetzt
          user_id: '' // Wird im Hook überschrieben
        })
        
        console.log("Ergebnis der Tagesberichtserstellung:", createResult);
        
        if (createResult.success) {
          toast({
            title: "Tagesabschluss erfolgreich",
            description: "Der Tagesabschluss wurde erfolgreich durchgeführt.",
          })
          
          // UI aktualisieren
          setIsConfirmationDialogOpen(false)
          
          // Daten neu laden - mit Timeout, um sicherzustellen, dass die Datenbank aktualisiert ist
          setTimeout(() => {
            console.log("Lade Daten nach Tagesabschluss neu...");
            const loadReportData = async () => {
              const reportResult = await getDailyReportByDate(apiDateFormat)
              console.log("Neuer Tagesbericht nach Erstellung:", reportResult);
            }
            loadReportData();
          }, 1000);
        } else {
          toast({
            title: "Fehler",
            description: createResult.error || "Der Tagesabschluss konnte nicht durchgeführt werden.",
            variant: "destructive",
          })
        }
      } catch (err: any) {
        console.error('Fehler beim Tagesabschluss:', err)
        toast({
          title: "Fehler",
          description: err.message || "Ein unerwarteter Fehler ist aufgetreten.",
          variant: "destructive",
        })
      }
    } else {
      // Bestehenden Tagesbericht aktualisieren
      console.log("Aktualisiere bestehenden Tagesbericht:", currentDailyReport.id);
      
      try {
        const closeResult = await closeDailyReport(
          currentDailyReport.id,
          actualCash,
          closeNotes || undefined
        )
        
        console.log("Ergebnis der Tagesberichtsaktualisierung:", closeResult);
        
        if (closeResult.success) {
          toast({
            title: "Tagesabschluss aktualisiert",
            description: "Der Tagesabschluss wurde erfolgreich aktualisiert.",
          })
          
          // UI aktualisieren
          setIsConfirmationDialogOpen(false)
          
          // Daten neu laden - mit Timeout, um sicherzustellen, dass die Datenbank aktualisiert ist
          setTimeout(() => {
            console.log("Lade Daten nach Tagesabschluss-Update neu...");
            const loadReportData = async () => {
              const reportResult = await getDailyReportByDate(apiDateFormat)
              console.log("Aktualisierter Tagesbericht:", reportResult);
            }
            loadReportData();
          }, 1000);
        } else {
          toast({
            title: "Fehler",
            description: closeResult.error || "Der Tagesabschluss konnte nicht aktualisiert werden.",
            variant: "destructive",
          })
        }
      } catch (err: any) {
        console.error('Fehler beim Aktualisieren des Tagesabschlusses:', err)
        toast({
          title: "Fehler",
          description: err.message || "Ein unerwarteter Fehler ist aufgetreten.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tagesabschluss</h1>
          <p className="text-gray-500">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Datum auswählen */}
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar size={16} />
                Datum
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date)
                    setIsDatePickerOpen(false)
                  }
                }}
                locale={de}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Status Badge */}
          <Badge variant={currentDailyReport?.status === "closed" ? "default" : "outline"}>
            {currentDailyReport?.status === "closed" ? "Abgeschlossen" : "Entwurf"}
          </Badge>

          {/* PDF Export Button */}
          <Button variant="outline" className="flex items-center gap-2" disabled={!currentDailyReport}>
            <Download size={16} />
            PDF
          </Button>

          {/* Abschließen Button - nur anzeigen, wenn es Transaktionen gibt und kein geschlossener Bericht existiert */}
          {(!currentDailyReport || currentDailyReport.status !== "closed") && transactions.length > 0 && (
            <Button 
              className="flex items-center gap-2" 
              onClick={() => {
                // Vorhandenen Endbestand verwenden, wenn verfügbar
                if (summary.endingCash > 0) {
                  setActualCashAmount(summary.endingCash.toString())
                }
                setIsCloseDialogOpen(true)
              }}
            >
              <FileText size={16} />
              Abschließen
            </Button>
          )}
        </div>
      </div>

      {isLoadingData ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 size={30} className="animate-spin mb-4" />
          <span>Daten werden geladen...</span>
          <p className="text-gray-500 mt-2">
            Datum: {apiDateFormat}
          </p>
        </div>
      ) : (
        <>
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
                            <Badge 
                              variant="outline" 
                              className={
                                transaction.status === "completed" 
                                  ? "bg-green-50 text-green-700 hover:bg-green-50" 
                                  : transaction.status === "cancelled"
                                  ? "bg-red-50 text-red-700 hover:bg-red-50"
                                  : "bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
                              }
                            >
                              {transaction.status === "completed" && "Abgeschlossen"}
                              {transaction.status === "cancelled" && "Storniert"}
                              {transaction.status === "refunded" && "Erstattet"}
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
                      <span>CHF {(summary.startingCash + summary.cash).toFixed(2)}</span>
                    </div>
                  </div>

                  {currentDailyReport?.notes && (
                    <div className="pt-4 border-t">
                      <Label>Notizen:</Label>
                      <div className="p-3 bg-gray-50 rounded text-sm mt-2">{currentDailyReport.notes}</div>
                    </div>
                  )}
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
                  <Input id="expected-cash" value={(summary.startingCash + summary.cash).toFixed(2)} disabled />
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
                <Button 
                  onClick={handleCloseRegister}
                  disabled={!actualCashAmount || isNaN(Number.parseFloat(actualCashAmount))}
                >
                  Tagesabschluss durchführen
                </Button>
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
                      <span className="font-medium">CHF {(summary.startingCash + summary.cash).toFixed(2)}</span>
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
        </>
      )}
    </div>
  )
}

