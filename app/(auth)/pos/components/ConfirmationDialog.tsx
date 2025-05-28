"use client"

import { CheckCircle, Download, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/lib/hooks/core/useToast"
import type { PaymentMethod, TransactionResult } from "@/lib/hooks/business/usePOSState"

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
      description: "E-Mail-Funktion noch nicht implementiert.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-center text-xl">
            <CheckCircle className="text-green-500 mr-2" size={28} />
            Zahlung erfolgreich
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <div className="space-y-6">
            <div className="p-5 bg-green-50 rounded-lg border border-green-200">
              <div className="mb-4 pb-2 border-b border-green-200">
                <h3 className="font-semibold text-green-800">Transaktionsdetails</h3>
              </div>
              
              <div className="flex justify-between mb-3">
                <span>Zahlungsmethode:</span>
                <span className="font-medium">
                  {selectedPaymentMethod === "cash" && "Barzahlung"}
                  {selectedPaymentMethod === "twint" && "Twint"}
                  {selectedPaymentMethod === "sumup" && "SumUp (Karte)"}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span>Betrag:</span>
                <span className="font-medium">CHF {cartTotal.toFixed(2)}</span>
              </div>
              {selectedPaymentMethod === "cash" && transactionResult && (
                <>
                  <div className="flex justify-between mb-3">
                    <span>Erhalten:</span>
                    <span className="font-medium">CHF {Number.parseFloat(cashReceived).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-1 pt-2 border-t border-green-200">
                    <span>Rückgeld:</span>
                    <span className="font-bold">CHF {(transactionResult.change || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center justify-center py-6 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                onClick={handleDownloadPDF}
                disabled={!transactionResult?.receiptUrl}
              >
                <Download className="mr-2" size={20} />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-normal">Herunterladen</span>
                  <span className="text-xs text-blue-600">PDF Quittung</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center py-6 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                onClick={handleEmailSend}
              >
                <Mail className="mr-2" size={20} />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-normal">Per E-Mail</span>
                  <span className="text-xs text-purple-600">Senden</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onStartNewSale} className="w-full py-6 text-lg">
            <CheckCircle className="mr-2" size={20} />
            Neuer Verkauf starten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}