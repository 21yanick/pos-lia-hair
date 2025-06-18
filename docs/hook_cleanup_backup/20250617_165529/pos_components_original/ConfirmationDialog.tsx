"use client"

import { CheckCircle, Download, Mail } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { useToast } from "@/shared/hooks/core/useToast"
import type { PaymentMethod, TransactionResult } from "../hooks/usePOSState"

interface ConfirmationDialogProps {
  isOpen: boolean
  selectedPaymentMethod: PaymentMethod | null
  cashReceived: string
  cartTotal: number
  transactionResult: TransactionResult | null
  onStartNewSale: () => void
  onClose: () => void
}

export function ConfirmationDialog({
  isOpen,
  selectedPaymentMethod,
  cashReceived,
  cartTotal,
  transactionResult,
  onStartNewSale,
  onClose,
}: ConfirmationDialogProps) {
  const { toast } = useToast()

  const handleDownloadPDF = () => {
    if (transactionResult?.receiptUrl) {
      console.log('Opening PDF URL:', transactionResult.receiptUrl)
      window.open(transactionResult.receiptUrl, '_blank')
    } else {
      console.error('No receipt URL available:', transactionResult)
      toast({
        title: "PDF nicht verfügbar",
        description: "Die Quittung konnte nicht erstellt werden.",
        variant: "destructive",
      })
    }
  }

  const handleEmailSend = () => {
    toast({
      title: "E-Mail-Versand",
      description: "Diese Funktion ist noch nicht implementiert.",
    })
  }

  const getPaymentMethodLabel = (method: PaymentMethod | null) => {
    switch (method) {
      case 'cash': return 'Bargeld'
      case 'twint': return 'TWINT'
      case 'sumup': return 'SumUp (Karte)'
      default: return 'Unbekannt'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-success" size={32} />
          </div>
          <DialogTitle className="text-2xl font-bold text-success">
            Zahlung erfolgreich!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transaktionsdetails */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Betrag:</span>
              <span className="font-bold text-lg">CHF {(transactionResult?.amount || cartTotal).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Zahlungsmethode:</span>
              <span className="font-semibold">{getPaymentMethodLabel(transactionResult?.paymentMethod || selectedPaymentMethod)}</span>
            </div>

            {(transactionResult?.paymentMethod === 'cash' || selectedPaymentMethod === 'cash') && (transactionResult?.cashReceived || cashReceived) && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Erhalten:</span>
                  <span className="font-semibold">CHF {(transactionResult?.cashReceived || parseFloat(cashReceived)).toFixed(2)}</span>
                </div>
                {transactionResult?.change && transactionResult.change > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Rückgeld:</span>
                    <span className="font-bold text-success">CHF {transactionResult.change.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quittung-Aktionen */}
          {transactionResult?.receiptUrl && (
            <div className="space-y-3">
              <h4 className="font-semibold text-center">Quittung</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownloadPDF}
                >
                  <Download className="mr-2 h-4 w-4" />
                  PDF öffnen
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleEmailSend}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  E-Mail
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-6">
          <Button 
            onClick={onStartNewSale}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-semibold"
          >
            Neuer Verkauf
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}