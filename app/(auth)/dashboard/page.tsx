"use client"

import { DialogFooter } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { ShoppingCart, FileText, BookOpen, BarChart4, Clock, CreditCard, Wallet, Loader2, RefreshCw } from "lucide-react"
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
import { useRegisterStatus } from "@/lib/hooks/useRegisterStatus"
import { useToast } from "@/lib/hooks/useToast"
import { useDashboardStats } from "@/lib/hooks/useDashboardStats"

export default function Dashboard() {
  // Hooks
  const { 
    loading: registerLoading, 
    error: registerError, 
    isOpen, 
    currentRegisterStatus, 
    openRegister, 
    closeRegister,
    calculateCurrentBalance 
  } = useRegisterStatus()
  
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refreshStats
  } = useDashboardStats()
  
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
  
  // Fehlerbehandlung für Kassenregister
  useEffect(() => {
    if (registerError) {
      toast({
        title: "Fehler",
        description: registerError,
        variant: "destructive"
      })
    }
  }, [registerError, toast])

  // Fehlerbehandlung für Dashboard-Statistiken
  useEffect(() => {
    if (statsError) {
      toast({
        title: "Fehler beim Laden der Statistiken",
        description: statsError,
        variant: "destructive"
      });
    }
  }, [statsError, toast]);

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
    { 
      name: "Neuer Verkauf", 
      description: "Verkaufsbildschirm öffnen", 
      icon: ShoppingCart, 
      href: "/pos", 
      color: "bg-gradient-to-br from-blue-400 to-blue-600" 
    },
    { 
      name: "Tagesabschluss", 
      description: "Tagesberichte anzeigen", 
      icon: FileText, 
      href: "/reports/daily", 
      color: "bg-gradient-to-br from-emerald-400 to-emerald-600" 
    },
    { 
      name: "Kassenbuch", 
      description: "Kassenbewegungen verwalten", 
      icon: BookOpen, 
      href: "/reports/cash-register", 
      color: "bg-gradient-to-br from-violet-400 to-violet-600" 
    },
    { 
      name: "Monatsabschluss", 
      description: "Monatsberichte anzeigen", 
      icon: BarChart4, 
      href: "/reports/monthly", 
      color: "bg-gradient-to-br from-amber-400 to-amber-600" 
    },
  ]

  return (
    <div className="space-y-6">
      {/* Register Status Card */}
      <Card className="overflow-hidden">
        <div className={`h-1 ${isOpen ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-red-400 to-red-600"}`} />
        <CardContent className="p-6">
          {registerLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={30} className="animate-spin mr-2 text-primary" />
              <span className="text-lg">Kassenstatus wird geladen...</span>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-6 md:mb-0">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center bg-white border border-gray-200 mr-5 shadow-sm"
                >
                  <Clock size={30} className="text-gray-700" />
                </div>
                <div>
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold">
                      Kassenstatus:
                    </h2>
                    <span className={`ml-2 text-lg font-medium px-3 py-1 rounded-full ${isOpen 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"}`}>
                      {isOpen ? "Geöffnet" : "Geschlossen"}
                    </span>
                  </div>
                  {isOpen && currentRegisterStatus && (
                    <p className="text-gray-600 mt-2">
                      <span className="font-medium">Geöffnet seit:</span> {new Date(currentRegisterStatus.opened_at).toLocaleTimeString()} <span className="px-2">•</span>
                      <span className="font-medium">Aktueller Bestand:</span> CHF {currentBalance !== null ? currentBalance.toFixed(2) : currentRegisterStatus.starting_amount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Kasse öffnen Dialog */}
              <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={isOpen || registerLoading || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Wird verarbeitet...
                      </>
                    ) : (
                      <>
                        <Clock className="mr-2 h-5 w-5" />
                        Kasse öffnen
                      </>
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
                    {registerLoading ? (
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
                      disabled={isProcessing || !registerAmount || registerLoading}
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
                      className="ml-3 border-2 border-red-200 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 hover:border-red-300 shadow-sm transition-all duration-200"
                      disabled={!isOpen || registerLoading || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Wird verarbeitet...
                        </>
                      ) : (
                        <>
                          <Clock className="mr-2 h-5 w-5" />
                          Kasse schließen
                        </>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action) => (
            <Card
              key={action.name}
              className="overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer group"
              onClick={() => (window.location.href = action.href)}
            >
              <div className={`h-2 ${action.color}`} />
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-md bg-white border border-gray-200 flex items-center justify-center mr-4 shadow-sm group-hover:shadow transition-all">
                    <action.icon size={20} className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{action.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Today's Statistics */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tagesstatistik</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600"
            onClick={refreshStats}
            disabled={statsLoading}
          >
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1 text-xs">Aktualisieren</span>
          </Button>
        </div>
        
        {statsLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Tagesstatistik wird geladen...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Umsatz heute</CardTitle>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="flex items-center">
                    <div className="bg-white border border-gray-200 w-12 h-12 rounded-md flex items-center justify-center shadow-sm mr-4">
                      <Wallet className="text-gray-700" size={22} />
                    </div>
                    <div>
                      <span className="text-3xl font-bold">CHF {stats.revenue.toFixed(2)}</span>
                      <p className="text-xs text-gray-500 mt-1">Gesamt eingenommen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Transaktionen</CardTitle>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="flex items-center">
                    <div className="bg-white border border-gray-200 w-12 h-12 rounded-md flex items-center justify-center shadow-sm mr-4">
                      <ShoppingCart className="text-gray-700" size={22} />
                    </div>
                    <div>
                      <span className="text-3xl font-bold">{stats.transactions}</span>
                      <p className="text-xs text-gray-500 mt-1">Verkäufe heute</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="h-1 bg-gradient-to-r from-violet-400 to-violet-600" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Zahlungsarten</CardTitle>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-2 rounded-md bg-green-50">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center shadow-sm mr-2">
                          <Wallet className="text-gray-700" size={14} />
                        </div>
                        <span className="text-sm font-medium">Bargeld</span>
                      </div>
                      <span className="font-medium">CHF {stats.paymentMethods.cash.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-violet-50">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center shadow-sm mr-2">
                          <Wallet className="text-gray-700" size={14} />
                        </div>
                        <span className="text-sm font-medium">Twint</span>
                      </div>
                      <span className="font-medium">CHF {stats.paymentMethods.twint.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-blue-50">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center shadow-sm mr-2">
                          <CreditCard className="text-gray-700" size={14} />
                        </div>
                        <span className="text-sm font-medium">SumUp</span>
                      </div>
                      <span className="font-medium">CHF {stats.paymentMethods.sumup.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        

        {/* Recent Transactions */}
        <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
          <CardHeader>
            <CardTitle>Letzte Transaktionen</CardTitle>
            <CardDescription>Die letzten 5 Transaktionen des Tages</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span>Transaktionen werden geladen...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((transaction) => {
                    // Icon basierend auf Zahlungsmethode auswählen
                    const Icon = transaction.method === "sumup" ? CreditCard : Wallet;
                    
                    return (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center shadow-sm mr-3">
                            <Icon size={14} className="text-gray-700" />
                          </div>
                          <div>
                            <div className="font-medium">Verkauf</div>
                            <div className="text-xs text-gray-500">{transaction.time} Uhr</div>
                          </div>
                        </div>
                        <span className="font-bold text-lg">CHF {transaction.amount.toFixed(2)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Heute wurden noch keine Transaktionen durchgeführt.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

