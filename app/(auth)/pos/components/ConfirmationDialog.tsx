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
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Zahlung erfolgreich!
          </DialogTitle>
          <p className="text-gray-600 mt-2">Die Transaktion wurde erfolgreich abgeschlossen.</p>
        </DialogHeader>

        <div className="py-6">
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50">
              <div className="mb-4 pb-3 border-b border-green-200/50">
                <h3 className="font-bold text-green-800 text-lg">Transaktionsdetails</h3>
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

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center justify-center py-5 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-150 text-blue-700 border-blue-200 rounded-xl transition-all duration-200"
                onClick={handleDownloadPDF}
                disabled={!transactionResult?.receiptUrl}
              >
                <Download className="mr-3" size={20} />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">PDF</span>
                  <span className="text-xs text-blue-600">Herunterladen</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center py-5 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-150 text-purple-700 border-purple-200 rounded-xl transition-all duration-200"
                onClick={handleEmailSend}
              >
                <Mail className="mr-3" size={20} />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">E-Mail</span>
                  <span className="text-xs text-purple-600">Senden</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6">
          <Button 
            onClick={onStartNewSale} 
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] rounded-xl"
          >
            <CheckCircle className="mr-3" size={20} />
            Neuer Verkauf starten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}