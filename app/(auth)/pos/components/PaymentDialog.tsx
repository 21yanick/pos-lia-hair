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
                    ? "bg-payment-cash hover:bg-payment-cash/90 text-payment-cash-foreground shadow-lg ring-2 ring-payment-cash/20" 
                    : "hover:bg-payment-cash/10 hover:border-payment-cash/30"
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
                    ? "bg-payment-twint hover:bg-payment-twint/90 text-payment-twint-foreground shadow-lg ring-2 ring-payment-twint/20" 
                    : "hover:bg-payment-twint/10 hover:border-payment-twint/30 text-payment-twint"
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
                    ? "bg-payment-sumup hover:bg-payment-sumup/90 text-payment-sumup-foreground shadow-lg ring-2 ring-payment-sumup/20" 
                    : "hover:bg-payment-sumup/10 hover:border-payment-sumup/30"
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
            <div className="space-y-4 p-6 bg-gradient-to-br from-payment-cash/10 to-payment-cash/5 rounded-xl border border-payment-cash/20">
              <div className="space-y-3">
                <Label htmlFor="cash-received" className="text-base font-semibold text-payment-cash">
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
                  className="text-xl py-4 bg-white/80 border-payment-cash/30 focus:border-payment-cash focus:ring-payment-cash/20"
                />
              </div>

              {cashReceived && Number.parseFloat(cashReceived) >= cartTotal && (
                <div className="p-4 bg-gradient-to-r from-payment-cash/20 to-payment-cash/10 rounded-lg border border-payment-cash/30">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-payment-cash">Rückgeld:</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-payment-cash">CHF {cashChange.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Total Amount */}
          <div className="p-6 bg-gradient-to-r from-muted/50 to-primary/10 rounded-xl border border-border">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-muted-foreground text-sm">Zu zahlender Betrag</span>
                <div className="font-bold text-xl text-foreground">Gesamtbetrag</div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">CHF {cartTotal.toFixed(2)}</span>
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