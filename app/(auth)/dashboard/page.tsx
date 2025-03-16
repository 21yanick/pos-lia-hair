"use client"

import { DialogFooter } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { ShoppingCart, FileText, BookOpen, BarChart4, Clock, CreditCard, Wallet, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AuthDebugPanel } from "@/components/debug/AuthDebugPanel"
import { useRegisterStatus } from "@/lib/hooks/useRegisterStatus"
import { useToast } from "@/lib/hooks/useToast"

export default function Dashboard() {
  // Hooks
  const { 
    loading, 
    error, 
    isOpen, 
    currentRegisterStatus, 
    openRegister, 
    closeRegister,
    calculateCurrentBalance 
  } = useRegisterStatus()
  
  const { toast } = useToast()
  
  // Local state
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [isCloseRegisterDialogOpen, setIsCloseRegisterDialogOpen] = useState(false)
  const [registerAmount, setRegisterAmount] = useState("")
  const [actualEndingAmount, setActualEndingAmount] = useState("")
  const [registerNotes, setRegisterNotes] = useState("")
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Aktuelle Kassenbestände berechnen
  useEffect(() => {
    const loadBalances = async () => {
      if (currentRegisterStatus && isOpen) {
        const result = await calculateCurrentBalance()
        if (result.success) {
          setCurrentBalance(result.balance)
        }
      }
    }
    
    loadBalances()
  }, [currentRegisterStatus, isOpen, calculateCurrentBalance])
  
  // Fehlerbehandlung
  useEffect(() => {
    if (error) {
      toast({
        title: "Fehler",
        description: error,
        variant: "destructive"
      })
    }
  }, [error, toast])

  const todayStats = {
    revenue: 1250.5,
    transactions: 15,
    paymentMethods: {
      cash: 450.5,
      twint: 500.0,
      sumup: 300.0,
    },
    recentTransactions: [
      { id: "1", time: "14:25", amount: 85.0, method: "cash" },
      { id: "2", time: "13:10", amount: 120.0, method: "twint" },
      { id: "3", time: "11:45", amount: 65.5, method: "sumup" },
      { id: "4", time: "10:30", amount: 95.0, method: "cash" },
      { id: "5", time: "09:15", amount: 45.0, method: "twint" },
    ],
  }

  const handleOpenRegister = async () => {
    const amount = Number.parseFloat(registerAmount)
    if (isNaN(amount)) return
    
    setIsProcessing(true)
    
    try {
      const result = await openRegister(amount, registerNotes || undefined)
      
      if (result.success) {
        toast({
          title: "Kasse geöffnet",
          description: `Die Kasse wurde erfolgreich mit einem Bestand von CHF ${amount.toFixed(2)} geöffnet.`,
        })
        setIsRegisterDialogOpen(false)
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Die Kasse konnte nicht geöffnet werden.",
          variant: "destructive"
        })
      }
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleCloseRegister = async () => {
    const amount = actualEndingAmount ? Number.parseFloat(actualEndingAmount) : currentBalance
    if (!amount) return
    
    setIsProcessing(true)
    
    try {
      const result = await closeRegister(amount, registerNotes || undefined)
      
      if (result.success) {
        toast({
          title: "Kasse geschlossen",
          description: `Die Kasse wurde erfolgreich mit einem Endbestand von CHF ${amount.toFixed(2)} geschlossen.`,
        })
        
        // Anzeigen von Differenzen zwischen Soll und Ist
        if (currentBalance !== null && amount !== currentBalance) {
          toast({
            title: "Differenz im Kassenbestand",
            description: `Es wurde eine Differenz von CHF ${Math.abs(amount - currentBalance).toFixed(2)} zwischen berechnetem und tatsächlichem Kassenbestand festgestellt.`,
            variant: "warning"
          })
        }
        
        setIsCloseRegisterDialogOpen(false)
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Die Kasse konnte nicht geschlossen werden.",
          variant: "destructive"
        })
      }
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setActualEndingAmount("")
      setRegisterNotes("")
    }
  }

  const quickActions = [
    { name: "Neuer Verkauf", icon: ShoppingCart, href: "/pos", color: "bg-blue-500" },
    { name: "Tagesabschluss", icon: FileText, href: "/reports/daily", color: "bg-green-500" },
    { name: "Kassenbuch", icon: BookOpen, href: "/reports/cash-register", color: "bg-purple-500" },
    { name: "Monatsabschluss", icon: BarChart4, href: "/reports/monthly", color: "bg-orange-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Debug-Komponente für User-DB-Synchronisation */}
      <AuthDebugPanel />
      
      {/* Register Status Card */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={30} className="animate-spin mr-2" />
              <span>Kassenstatus wird geladen...</span>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${isOpen ? "bg-green-100" : "bg-red-100"} mr-4`}
                >
                  <Clock size={32} className={isOpen ? "text-green-600" : "text-red-600"} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Kassenstatus: {isOpen ? "Geöffnet" : "Geschlossen"}
                  </h2>
                  {isOpen && currentRegisterStatus && (
                    <p className="text-gray-500">
                      Geöffnet seit: {new Date(currentRegisterStatus.opened_at).toLocaleTimeString()} • 
                      Aktueller Bestand: CHF {currentBalance !== null ? currentBalance.toFixed(2) : currentRegisterStatus.starting_amount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Kasse öffnen Dialog */}
              <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    disabled={isOpen || loading || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird verarbeitet...
                      </>
                    ) : (
                      "Kasse öffnen"
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Kasse öffnen</DialogTitle>
                    <DialogDescription>
                      Geben Sie den aktuellen Bargeldbestand ein, um die Kasse zu öffnen.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {loading ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        <span>Vorherigen Kassenstand laden...</span>
                      </div>
                    ) : (
                      <>
                        <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                          <h3 className="font-medium text-amber-800 mb-1">Information zum Kassenbestand</h3>
                          <p className="text-sm text-amber-700">
                            Der Kassenbestand sollte mit dem Endbetrag von gestern übereinstimmen. 
                            Bitte zählen Sie das Bargeld in der Kasse und geben Sie den tatsächlichen Betrag ein.
                          </p>
                          
                          {currentRegisterStatus?.status === 'closed' && (
                            <div className="mt-2 pt-2 border-t border-amber-200">
                              <div className="flex justify-between text-sm">
                                <span>Letzter Kassenstand:</span>
                                <span className="font-bold">
                                  CHF {currentRegisterStatus.ending_amount?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                              <div className="text-xs text-amber-600 mt-1">
                                {currentRegisterStatus.closed_at && (
                                  <>Zuletzt geschlossen: {new Date(currentRegisterStatus.closed_at).toLocaleDateString()}, {new Date(currentRegisterStatus.closed_at).toLocaleTimeString()}</>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-amount">Bargeldbestand (CHF)</Label>
                          <Input
                            id="register-amount"
                            type="number"
                            step="0.05"
                            min="0"
                            placeholder="0.00"
                            value={registerAmount}
                            onChange={(e) => setRegisterAmount(e.target.value)}
                          />
                          {currentRegisterStatus?.status === 'closed' && currentRegisterStatus.ending_amount && registerAmount && (
                            <div className={`text-sm mt-1 ${
                              Number(registerAmount) !== currentRegisterStatus.ending_amount 
                                ? 'text-red-600' 
                                : 'text-green-600'
                            }`}>
                              {Number(registerAmount) !== currentRegisterStatus.ending_amount 
                                ? `Differenz: CHF ${Math.abs(Number(registerAmount) - currentRegisterStatus.ending_amount).toFixed(2)}` 
                                : 'Der Betrag stimmt mit dem letzten Kassenstand überein.'}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-notes">Notizen (optional)</Label>
                          <Textarea
                            id="register-notes"
                            placeholder="Zusätzliche Informationen..."
                            value={registerNotes}
                            onChange={(e) => setRegisterNotes(e.target.value)}
                          />
                          {currentRegisterStatus?.status === 'closed' && currentRegisterStatus.ending_amount && Number(registerAmount) !== currentRegisterStatus.ending_amount && (
                            <div className="text-xs text-amber-600">
                              Bitte erklären Sie die Differenz zum vorherigen Kassenstand in den Notizen.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button 
                      onClick={handleOpenRegister} 
                      disabled={isProcessing || !registerAmount || loading}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird verarbeitet...
                        </>
                      ) : (
                        "Kasse öffnen"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Kasse schließen Dialog - nur anzeigen, wenn Kasse geöffnet ist */}
              {isOpen && (
                <Dialog open={isCloseRegisterDialogOpen} onOpenChange={setIsCloseRegisterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="ml-2"
                      disabled={!isOpen || loading || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird verarbeitet...
                        </>
                      ) : (
                        "Kasse schließen"
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Kasse schließen</DialogTitle>
                      <DialogDescription>
                        Überprüfen Sie den Kassenbestand und schließen Sie die Kasse für heute.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Berechneter aktueller Bargeldbestand</Label>
                        <div className="bg-gray-50 p-3 rounded-md flex justify-between">
                          <span>Aktueller Bestand (Soll):</span>
                          <span className="font-bold">
                            CHF {currentBalance !== null ? currentBalance.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="actual-ending-amount">Tatsächlicher Bargeldbestand (Ist)</Label>
                        <Input
                          id="actual-ending-amount"
                          type="number"
                          step="0.05"
                          min="0"
                          placeholder="0.00"
                          value={actualEndingAmount}
                          onChange={(e) => setActualEndingAmount(e.target.value)}
                        />
                        {actualEndingAmount && currentBalance !== null && (
                          <div className={`text-sm mt-1 ${
                            Number(actualEndingAmount) !== currentBalance 
                              ? 'text-amber-600' 
                              : 'text-green-600'
                          }`}>
                            {Number(actualEndingAmount) !== currentBalance 
                              ? `Differenz: CHF ${Math.abs(Number(actualEndingAmount) - currentBalance).toFixed(2)}` 
                              : 'Der tatsächliche Bestand stimmt mit dem berechneten Bestand überein.'}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-notes">Notizen (optional)</Label>
                        <Textarea
                          id="register-notes"
                          placeholder="Zusätzliche Informationen zum Tagesabschluss..."
                          value={registerNotes}
                          onChange={(e) => setRegisterNotes(e.target.value)}
                        />
                        {actualEndingAmount && currentBalance !== null && Number(actualEndingAmount) !== currentBalance && (
                          <div className="text-xs text-amber-600">
                            Bitte erklären Sie die Differenz zwischen berechnetem und tatsächlichem Kassenbestand.
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCloseRegisterDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button 
                        onClick={handleCloseRegister} 
                        disabled={isProcessing || currentBalance === null || (actualEndingAmount && Number.isNaN(Number.parseFloat(actualEndingAmount)))}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Wird verarbeitet...
                          </>
                        ) : (
                          "Kasse schließen"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.name}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center space-y-2 border-2"
              onClick={() => (window.location.href = action.href)}
            >
              <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center`}>
                <action.icon size={24} className="text-white" />
              </div>
              <span>{action.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Today's Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tagesstatistik</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Umsatz heute</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wallet className="mr-2 text-green-500" />
                <span className="text-2xl font-bold">CHF {todayStats.revenue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Transaktionen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingCart className="mr-2 text-blue-500" />
                <span className="text-2xl font-bold">{todayStats.transactions}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Zahlungsarten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Wallet className="mr-1 text-green-500" size={16} />
                  <span>CHF {todayStats.paymentMethods.cash.toFixed(2)}</span>
                </div>
                <div className="flex items-center">
                  <Wallet className="mr-1 text-purple-500" size={16} />
                  <span>CHF {todayStats.paymentMethods.twint.toFixed(2)}</span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="mr-1 text-blue-500" size={16} />
                  <span>CHF {todayStats.paymentMethods.sumup.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Letzte Transaktionen</CardTitle>
            <CardDescription>Die letzten 5 Transaktionen des Tages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayStats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 border-b last:border-0">
                  <div className="flex items-center">
                    {transaction.method === "cash" && <Wallet size={16} className="mr-2 text-green-500" />}
                    {transaction.method === "twint" && <Wallet size={16} className="mr-2 text-purple-500" />}
                    {transaction.method === "sumup" && <CreditCard size={16} className="mr-2 text-blue-500" />}
                    <span>{transaction.time}</span>
                  </div>
                  <span className="font-medium">CHF {transaction.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

