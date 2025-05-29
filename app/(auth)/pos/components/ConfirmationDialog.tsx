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
          <div className="mx-auto mb-4 p-3 bg-success/10 rounded-full w-fit">
            <CheckCircle className="text-success" size={32} />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Zahlung erfolgreich!
          </DialogTitle>
          <p className="text-muted-foreground mt-2">Die Transaktion wurde erfolgreich abgeschlossen.</p>
        </DialogHeader>

        <div className="py-6">
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-success/5 to-success/10 rounded-xl border border-success/20">
              <div className="mb-4 pb-3 border-b border-success/20">
                <h3 className="font-bold text-success text-lg">Transaktionsdetails</h3>
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
                  <div className="flex justify-between mb-1 pt-2 border-t border-success/20">
                    <span>Rückgeld:</span>
                    <span className="font-bold">CHF {(transactionResult.change || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center justify-center py-5 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 text-primary border-primary/20 rounded-xl transition-all duration-200"
                onClick={handleDownloadPDF}
                disabled={!transactionResult?.receiptUrl}
              >
                <Download className="mr-3" size={20} />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">PDF</span>
                  <span className="text-xs text-primary">Herunterladen</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center py-5 bg-gradient-to-br from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/15 text-secondary-foreground border-secondary/20 rounded-xl transition-all duration-200"
                onClick={handleEmailSend}
              >
                <Mail className="mr-3" size={20} />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">E-Mail</span>
                  <span className="text-xs text-secondary-foreground">Senden</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6">
          <Button 
            onClick={onStartNewSale} 
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success/80 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] rounded-xl"
          >
            <CheckCircle className="mr-3" size={20} />
            Neuer Verkauf starten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}