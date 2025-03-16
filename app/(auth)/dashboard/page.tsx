"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import { ShoppingCart, FileText, BookOpen, BarChart4, Clock, CreditCard, Wallet } from "lucide-react"
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

export default function Dashboard() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [registerAmount, setRegisterAmount] = useState("")
  const [registerNotes, setRegisterNotes] = useState("")

  // Mock data - now with state to allow updating
  const [registerStatus, setRegisterStatus] = useState({
    isOpen: false,
    openedAt: null as Date | null,
    currentBalance: 0,
  })

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

  const handleOpenRegister = () => {
    // Here would be the API call to open the register
    const amount = Number.parseFloat(registerAmount)
    if (isNaN(amount)) return

    setRegisterStatus({
      isOpen: true,
      openedAt: new Date(),
      currentBalance: amount,
    })

    console.log("Opening register with amount:", registerAmount, "and notes:", registerNotes)
    setIsRegisterOpen(false)
  }

  const quickActions = [
    { name: "Neuer Verkauf", icon: ShoppingCart, href: "/pos", color: "bg-blue-500" },
    { name: "Tagesabschluss", icon: FileText, href: "/reports/daily", color: "bg-green-500" },
    { name: "Kassenbuch", icon: BookOpen, href: "/reports/cash-register", color: "bg-purple-500" },
    { name: "Monatsabschluss", icon: BarChart4, href: "/reports/monthly", color: "bg-orange-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Register Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${registerStatus.isOpen ? "bg-green-100" : "bg-red-100"} mr-4`}
              >
                <Clock size={32} className={registerStatus.isOpen ? "text-green-600" : "text-red-600"} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Kassenstatus: {registerStatus.isOpen ? "Geöffnet" : "Geschlossen"}
                </h2>
                {registerStatus.isOpen && registerStatus.openedAt && (
                  <p className="text-gray-500">
                    Geöffnet seit: {registerStatus.openedAt.toLocaleTimeString()} • Aktueller Bestand: CHF{" "}
                    {registerStatus.currentBalance.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button size="lg" disabled={registerStatus.isOpen}>
                  Kasse öffnen
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-notes">Notizen (optional)</Label>
                    <Textarea
                      id="register-notes"
                      placeholder="Zusätzliche Informationen..."
                      value={registerNotes}
                      onChange={(e) => setRegisterNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRegisterOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleOpenRegister}>Kasse öffnen</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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

