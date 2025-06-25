'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { X, Download, ExternalLink } from "lucide-react"

interface PDFModalProps {
  isOpen: boolean
  url: string | null
  title: string | null
  onClose: () => void
}

/**
 * Simple PDF Modal Component
 * 
 * BEFORE: EnterprisePDFProvider (355 lines, complex API proxy, mobile workarounds)
 * AFTER:  Simple iframe-based PDF viewer (~50 lines)
 * 
 * Features:
 * - Simple iframe-based viewing
 * - Download & external link options
 * - Mobile responsive
 * - No complex API proxy needed
 */
export function PDFModal({ isOpen, url, title, onClose }: PDFModalProps) {
  if (!isOpen || !url) return null

  const handleDownload = () => {
    if (url) {
      const link = document.createElement('a')
      link.href = url
      link.download = title || 'document.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleOpenExternal = () => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate">
              {title || 'PDF Dokument'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Extern öffnen
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 pb-6">
          <iframe 
            src={url} 
            className="w-full h-[75vh] border rounded-md"
            title={title || 'PDF Dokument'}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}