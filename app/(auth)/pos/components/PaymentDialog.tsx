"use client"

import { useState, useEffect } from "react"
import { CheckCircle, CreditCard, Loader2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <CreditCard className="mr-2" />
            Zahlung
          </DialogTitle>
          <DialogDescription>
            Wählen Sie die Zahlungsmethode und schließen Sie den Verkauf ab.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Button
              variant={selectedPaymentMethod === "cash" ? "default" : "outline"}
              className={`flex flex-col items-center justify-center h-28 rounded-lg transition-all ${
                selectedPaymentMethod === "cash" ? "ring-2 ring-primary shadow-md" : ""
              }`}
              onClick={() => onPaymentMethodChange("cash")}
            >
              <Wallet className="mb-2" size={28} />
              <span className="text-base">Bar</span>
            </Button>
            <Button
              variant={selectedPaymentMethod === "twint" ? "default" : "outline"}
              className={`flex flex-col items-center justify-center h-28 rounded-lg transition-all ${
                selectedPaymentMethod === "twint" ? "ring-2 ring-primary shadow-md" : ""
              }`}
              onClick={() => onPaymentMethodChange("twint")}
            >
              <svg 
                className="mb-2" 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 7v10h14V7H5z" fill={selectedPaymentMethod === "twint" ? "white" : "currentColor"} />
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.5 12c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-6c-.83 0-1.5-.67-1.5-1.5S11.17 7.5 12 7.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill={selectedPaymentMethod === "twint" ? "white" : "currentColor"} />
              </svg>
              <span className="text-base">Twint</span>
            </Button>
            <Button
              variant={selectedPaymentMethod === "sumup" ? "default" : "outline"}
              className={`flex flex-col items-center justify-center h-28 rounded-lg transition-all ${
                selectedPaymentMethod === "sumup" ? "ring-2 ring-primary shadow-md" : ""
              }`}
              onClick={() => onPaymentMethodChange("sumup")}
            >
              <CreditCard className="mb-2" size={28} />
              <span className="text-base">SumUp</span>
            </Button>
          </div>

          {selectedPaymentMethod === "cash" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="cash-received" className="text-base">Erhaltener Betrag (CHF)</Label>
                <Input
                  id="cash-received"
                  type="number"
                  step="0.05"
                  min={cartTotal}
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => onCashReceivedChange(e.target.value)}
                  className="text-lg py-6"
                />
              </div>

              {cashReceived && Number.parseFloat(cashReceived) >= cartTotal && (
                <div className="flex justify-between p-3 bg-green-100 rounded-lg border border-green-200">
                  <span className="font-medium text-green-800">Rückgeld:</span>
                  <span className="font-bold text-green-800">CHF {cashChange.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Gesamtbetrag:</span>
              <span className="font-bold text-xl">CHF {cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:w-auto text-base py-6"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isPaymentDisabled}
            className="w-full sm:w-auto text-base py-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Wird verarbeitet...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2" size={18} />
                Zahlung abschließen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}