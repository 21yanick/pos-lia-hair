"use client"

import { useState, useEffect } from "react"
import { CheckCircle, CreditCard, Loader2, Wallet, Smartphone, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PaymentMethod } from "@/lib/hooks/business/usePOSState"
import type { CartItem, CreateSaleData } from "@/lib/hooks/business/useSales"

interface PaymentDialogProps {
  isOpen: boolean
  cartTotal: number
  cartItems: CartItem[]
  selectedPaymentMethod: PaymentMethod | null
  cashReceived: string
  loading: boolean
  onPaymentMethodChange: (method: PaymentMethod) => void
  onCashReceivedChange: (amount: string) => void
  onPayment: (data: CreateSaleData) => void
  onClose: () => void
}

export function PaymentDialog({
  isOpen,
  cartTotal,
  cartItems,
  selectedPaymentMethod,
  cashReceived,
  loading,
  onPaymentMethodChange,
  onCashReceivedChange,
  onPayment,
  onClose,
}: PaymentDialogProps) {
  const [cashChange, setCashChange] = useState(0)

  // Rückgeld berechnen
  useEffect(() => {
    if (selectedPaymentMethod === "cash" && cashReceived) {
      const receivedAmount = Number.parseFloat(cashReceived)
      if (!isNaN(receivedAmount)) {
        setCashChange(receivedAmount - cartTotal)
      } else {
        setCashChange(0)
      }
    } else {
      setCashChange(0)
    }
  }, [selectedPaymentMethod, cashReceived, cartTotal])

  const handlePayment = () => {
    if (!selectedPaymentMethod) return

    const paymentData: CreateSaleData = {
      total_amount: cartTotal,
      payment_method: selectedPaymentMethod,
      items: cartItems,
      received_amount: selectedPaymentMethod === 'cash' && cashReceived ? Number.parseFloat(cashReceived) : undefined,
      notes: cartItems.length > 3 
        ? `${cartItems.length} Produkte/Dienstleistungen` 
        : cartItems.map(item => item.name).join(', ')
    }

    onPayment(paymentData)
  }

  const isPaymentDisabled = loading || 
    !selectedPaymentMethod || 
    (selectedPaymentMethod === "cash" && (!cashReceived || Number.parseFloat(cashReceived) < cartTotal))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold flex items-center">
            <div className="mr-3 p-2 bg-blue-100 rounded-xl">
              <CreditCard className="text-blue-600" size={24} />
            </div>
            Zahlung abschließen
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Wählen Sie Ihre bevorzugte Zahlungsmethode und schließen Sie den Verkauf ab.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Payment Method Selection */}
          <div>
            <Label className="text-base font-semibold mb-4 block">Zahlungsmethode wählen</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={selectedPaymentMethod === "cash" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-28 rounded-xl transition-all duration-200 ${
                  selectedPaymentMethod === "cash" 
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg ring-2 ring-green-200" 
                    : "hover:bg-green-50 hover:border-green-300"
                }`}
                onClick={() => onPaymentMethodChange("cash")}
              >
                <Wallet className="mb-2" size={28} />
                <span className="font-semibold">Bargeld</span>
              </Button>
              
              <Button
                variant={selectedPaymentMethod === "twint" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-28 rounded-xl transition-all duration-200 ${
                  selectedPaymentMethod === "twint" 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg ring-2 ring-yellow-200" 
                    : "hover:bg-yellow-50 hover:border-yellow-300 text-yellow-600"
                }`}
                onClick={() => onPaymentMethodChange("twint")}
              >
                <div className="mb-2 text-2xl font-bold">T</div>
                <span className="font-semibold">TWINT</span>
              </Button>
              
              <Button
                variant={selectedPaymentMethod === "sumup" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-28 rounded-xl transition-all duration-200 ${
                  selectedPaymentMethod === "sumup" 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg ring-2 ring-blue-200" 
                    : "hover:bg-blue-50 hover:border-blue-300"
                }`}
                onClick={() => onPaymentMethodChange("sumup")}
              >
                <CreditCard className="mb-2" size={28} />
                <span className="font-semibold">SumUp</span>
              </Button>
            </div>
          </div>

          {/* Cash Input Section */}
          {selectedPaymentMethod === "cash" && (
            <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50">
              <div className="space-y-3">
                <Label htmlFor="cash-received" className="text-base font-semibold text-green-800">
                  Erhaltener Betrag (CHF)
                </Label>
                <Input
                  id="cash-received"
                  type="number"
                  step="0.05"
                  min={cartTotal}
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => onCashReceivedChange(e.target.value)}
                  className="text-xl py-4 bg-white/80 border-green-300 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>

              {cashReceived && Number.parseFloat(cashReceived) >= cartTotal && (
                <div className="p-4 bg-gradient-to-r from-green-100 to-green-200/80 rounded-lg border border-green-300/50">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-800">Rückgeld:</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-700">CHF {cashChange.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Total Amount */}
          <div className="p-6 bg-gradient-to-r from-gray-100/80 to-blue-100/40 rounded-xl border border-gray-200/50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600 text-sm">Zu zahlender Betrag</span>
                <div className="font-bold text-xl text-gray-800">Gesamtbetrag</div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-600">CHF {cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:w-auto py-4 text-base rounded-xl border-gray-300 hover:bg-gray-50"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isPaymentDisabled}
            className="w-full sm:flex-1 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Wird verarbeitet...
              </>
            ) : (
              <>
                <Zap className="mr-3 h-5 w-5" />
                Zahlung abschließen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}