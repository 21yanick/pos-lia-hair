"use client"

import { useState, useEffect } from "react"
import { CheckCircle, CreditCard, Loader2, Wallet, Smartphone, Zap } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import type { PaymentMethod } from "@/shared/hooks/business/usePOSState"
import type { CartItem, CreateSaleData } from "@/shared/hooks/business/useSales"

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
      const received = parseFloat(cashReceived) || 0
      setCashChange(Math.max(0, received - cartTotal))
    } else {
      setCashChange(0)
    }
  }, [selectedPaymentMethod, cashReceived, cartTotal])

  const handlePayment = () => {
    if (!selectedPaymentMethod) return

    const saleData: CreateSaleData = {
      total_amount: cartTotal,
      payment_method: selectedPaymentMethod,
      items: cartItems,
      received_amount: selectedPaymentMethod === 'cash' ? parseFloat(cashReceived) || cartTotal : undefined
    }

    onPayment(saleData)
  }

  const isPaymentValid = selectedPaymentMethod && 
    (selectedPaymentMethod !== 'cash' || 
     (parseFloat(cashReceived) >= cartTotal))

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-bold flex items-center">
            <div className="mr-3 p-2 bg-primary/10 rounded-xl">
              <CreditCard className="text-primary" size={20} />
            </div>
            Zahlung verarbeiten
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Gesamtbetrag: <span className="text-xl font-bold text-primary">CHF {cartTotal.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Zahlungsmethoden */}
          <div>
            <Label className="text-base font-semibold mb-4 block">Zahlungsmethode wählen</Label>
            <div className="grid grid-cols-1 gap-3">
              {/* Bargeld */}
              <Button
                variant={selectedPaymentMethod === "cash" ? "default" : "outline"}
                className={`h-14 justify-start text-left p-4 ${
                  selectedPaymentMethod === "cash" 
                    ? "bg-payment-cash text-payment-cash-foreground hover:bg-payment-cash/90"
                    : "hover:bg-payment-cash/10 hover:border-payment-cash"
                }`}
                onClick={() => onPaymentMethodChange("cash")}
              >
                <Wallet className="mr-3" size={20} />
                <div className="flex-1">
                  <div className="font-semibold">Bargeld</div>
                  <div className="text-xs opacity-80">Sofortige Zahlung</div>
                </div>
                {selectedPaymentMethod === "cash" && <CheckCircle size={20} />}
              </Button>

              {/* TWINT */}
              <Button
                variant={selectedPaymentMethod === "twint" ? "default" : "outline"}
                className={`h-14 justify-start text-left p-4 ${
                  selectedPaymentMethod === "twint"
                    ? "bg-payment-twint text-payment-twint-foreground hover:bg-payment-twint/90"
                    : "hover:bg-payment-twint/10 hover:border-payment-twint"
                }`}
                onClick={() => onPaymentMethodChange("twint")}
              >
                <Smartphone className="mr-3" size={20} />
                <div className="flex-1">
                  <div className="font-semibold">TWINT</div>
                  <div className="text-xs opacity-80">Mobile Zahlung</div>
                </div>
                {selectedPaymentMethod === "twint" && <CheckCircle size={20} />}
              </Button>

              {/* SumUp */}
              <Button
                variant={selectedPaymentMethod === "sumup" ? "default" : "outline"}
                className={`h-14 justify-start text-left p-4 ${
                  selectedPaymentMethod === "sumup"
                    ? "bg-payment-sumup text-payment-sumup-foreground hover:bg-payment-sumup/90"
                    : "hover:bg-payment-sumup/10 hover:border-payment-sumup"
                }`}
                onClick={() => onPaymentMethodChange("sumup")}
              >
                <CreditCard className="mr-3" size={20} />
                <div className="flex-1">
                  <div className="font-semibold">SumUp (Karte)</div>
                  <div className="text-xs opacity-80">Kreditkarte & EC-Karte</div>
                </div>
                {selectedPaymentMethod === "sumup" && <CheckCircle size={20} />}
              </Button>
            </div>
          </div>

          {/* Bargeld-Eingabe */}
          {selectedPaymentMethod === "cash" && (
            <div className="space-y-4 p-4 bg-payment-cash/5 border border-payment-cash/20 rounded-xl">
              <Label htmlFor="cashReceived" className="text-base font-semibold">
                Erhaltener Betrag
              </Label>
              <Input
                id="cashReceived"
                type="number"
                step="0.05"
                min={cartTotal}
                placeholder={`Mindestens CHF ${cartTotal.toFixed(2)}`}
                value={cashReceived}
                onChange={(e) => onCashReceivedChange(e.target.value)}
                className="text-lg h-12"
              />
              
              {cashReceived && (
                <div className="space-y-2">
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Erhaltener Betrag:</span>
                    <span className="font-semibold">CHF {parseFloat(cashReceived || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Verkaufsbetrag:</span>
                    <span className="font-semibold">CHF {cartTotal.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Rückgeld:</span>
                    <span className={`font-bold text-lg ${cashChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                      CHF {cashChange.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={!isPaymentValid || loading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verarbeiten...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                CHF {cartTotal.toFixed(2)} bezahlen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}