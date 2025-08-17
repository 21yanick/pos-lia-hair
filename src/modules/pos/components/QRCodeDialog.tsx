'use client'

import { Check, Copy, Download, QrCode, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { useToast } from '@/shared/hooks/core/useToast'

interface QRCodeDialogProps {
  isOpen: boolean
  receiptUrl: string
  onClose: () => void
}

export function QRCodeDialog({ isOpen, receiptUrl, onClose }: QRCodeDialogProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  // Reset copied state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false)
    }
  }, [isOpen])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(receiptUrl)
      setCopied(true)
      toast({
        title: 'Link kopiert',
        description: 'Der Link zur Quittung wurde in die Zwischenablage kopiert.',
      })

      // Reset after 3 seconds
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      toast({
        title: 'Fehler beim Kopieren',
        description: 'Der Link konnte nicht kopiert werden.',
        variant: 'destructive',
      })
    }
  }

  const handleDirectDownload = () => {
    window.open(receiptUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <QrCode className="text-primary" size={24} />
          </div>
          <DialogTitle className="text-xl font-bold">📱 Quittung herunterladen</DialogTitle>
          <DialogDescription className="text-base">
            Scannen Sie den QR-Code mit Ihrem Smartphone um die Quittung herunterzuladen
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* QR Code Container */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
              <QRCode value={receiptUrl} size={200} level="M" fgColor="#000000" bgColor="#ffffff" />
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2 mb-6">
            <p className="text-sm text-muted-foreground">
              <strong>So geht's:</strong>
            </p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Kamera-App auf dem Smartphone öffnen</li>
              <li>QR-Code scannen</li>
              <li>Auf den angezeigten Link tippen</li>
              <li>PDF wird automatisch geöffnet</li>
            </ol>
          </div>

          {/* Alternative Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={handleDirectDownload}>
              <Download className="mr-2 h-4 w-4" />
              Direkt öffnen (Desktop)
            </Button>

            <Button variant="outline" className="w-full" onClick={handleCopyLink} disabled={copied}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-success" />
                  Link kopiert!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Link kopieren
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
