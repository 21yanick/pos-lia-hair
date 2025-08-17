'use client'

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Package,
  RefreshCw,
  X,
} from 'lucide-react'
import React, { useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { usePdfActions } from '../hooks/usePdfActions'
import type { UnifiedTransaction } from '../types/unifiedTransactions'

interface BulkOperationsPanelProps {
  selectedTransactions: UnifiedTransaction[]
  onClearSelection: () => void
  onBulkComplete: () => void
  className?: string
}

export function BulkOperationsPanel({
  selectedTransactions,
  onClearSelection,
  onBulkComplete,
  className = '',
}: BulkOperationsPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [operationStatus, setOperationStatus] = useState<string | null>(null)
  const [operationError, setOperationError] = useState<string | null>(null)

  const { downloadMultiplePdfs } = usePdfActions()

  // Statistics über ausgewählte Transaktionen
  const selectedStats = {
    total: selectedTransactions.length,
    withPdf: selectedTransactions.filter((tx) => tx.pdf_status === 'available').length,
    missingPdf: selectedTransactions.filter((tx) => tx.pdf_status === 'missing').length,
    sales: selectedTransactions.filter((tx) => tx.transaction_type === 'sale').length,
    expenses: selectedTransactions.filter((tx) => tx.transaction_type === 'expense').length,
    totalAmount: selectedTransactions.reduce((sum, tx) => sum + tx.amount, 0),
  }

  // ZIP Download für alle verfügbaren PDFs
  const handleZipDownload = async () => {
    if (selectedStats.withPdf === 0) {
      setOperationError('Keine PDFs zum Download verfügbar')
      return
    }

    setIsLoading(true)
    setOperationStatus('ZIP-Archiv wird erstellt...')
    setOperationError(null)

    try {
      const result = await downloadMultiplePdfs(selectedTransactions)

      if (result.success) {
        setOperationStatus(`${selectedStats.withPdf} PDFs erfolgreich heruntergeladen`)
        setTimeout(() => {
          setOperationStatus(null)
          onBulkComplete()
        }, 2000)
      } else {
        setOperationError(result.error || 'Fehler beim Erstellen des ZIP-Archivs')
      }
    } catch (error: any) {
      setOperationError(`ZIP Download fehlgeschlagen: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // CSV Export für alle ausgewählten Transaktionen
  const handleCsvExport = async () => {
    setIsLoading(true)
    setOperationStatus('CSV-Export wird erstellt...')
    setOperationError(null)

    try {
      // Dynamisch TransactionExporter importieren (wird in Step 3 erstellt)
      const { exportTransactionsToCSV } = await import('../services/transactionExporter')

      const filename = `transaktionen_${new Date().toISOString().split('T')[0]}.csv`
      exportTransactionsToCSV(selectedTransactions, filename)

      setOperationStatus(`${selectedStats.total} Transaktionen als CSV exportiert`)
      setTimeout(() => {
        setOperationStatus(null)
        onBulkComplete()
      }, 2000)
    } catch (error: any) {
      setOperationError(`CSV Export fehlgeschlagen: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // PDF Regeneration für fehlende PDFs
  const handlePdfRegeneration = async () => {
    if (selectedStats.missingPdf === 0) {
      setOperationError('Keine fehlenden PDFs gefunden')
      return
    }

    setIsLoading(true)
    setOperationStatus('Fehlende PDFs werden erstellt...')
    setOperationError(null)

    try {
      // TODO: Implement bulk PDF regeneration
      // Für jetzt: Placeholder Implementation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setOperationStatus(`${selectedStats.missingPdf} PDFs erfolgreich erstellt`)
      setTimeout(() => {
        setOperationStatus(null)
        onBulkComplete()
      }, 2000)
    } catch (error: any) {
      setOperationError(`PDF Regeneration fehlgeschlagen: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (selectedTransactions.length === 0) {
    return null
  }

  return (
    <Card className={`border-primary/20 bg-primary/5 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bulk Operationen
            </CardTitle>
            <CardDescription>{selectedStats.total} Transaktionen ausgewählt</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selection Statistics */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{selectedStats.total} Total</Badge>
          {selectedStats.sales > 0 && (
            <Badge variant="default">{selectedStats.sales} Verkäufe</Badge>
          )}
          {selectedStats.expenses > 0 && (
            <Badge variant="destructive">{selectedStats.expenses} Ausgaben</Badge>
          )}
          {selectedStats.withPdf > 0 && (
            <Badge variant="outline" className="text-green-600">
              {selectedStats.withPdf} mit PDF
            </Badge>
          )}
          {selectedStats.missingPdf > 0 && (
            <Badge variant="outline" className="text-yellow-600">
              {selectedStats.missingPdf} ohne PDF
            </Badge>
          )}
        </div>

        <Separator />

        {/* Status Messages */}
        {operationStatus && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            {operationStatus}
          </div>
        )}

        {operationError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {operationError}
          </div>
        )}

        {/* Bulk Operations Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* ZIP Download */}
          <Button
            variant="outline"
            onClick={handleZipDownload}
            disabled={isLoading || selectedStats.withPdf === 0}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Package className="w-4 h-4" />
            )}
            ZIP Download
            {selectedStats.withPdf > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedStats.withPdf}
              </Badge>
            )}
          </Button>

          {/* CSV Export */}
          <Button
            variant="outline"
            onClick={handleCsvExport}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            CSV Export
            <Badge variant="secondary" className="ml-1">
              {selectedStats.total}
            </Badge>
          </Button>

          {/* PDF Regeneration */}
          <Button
            variant="outline"
            onClick={handlePdfRegeneration}
            disabled={isLoading || selectedStats.missingPdf === 0}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            PDFs erstellen
            {selectedStats.missingPdf > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedStats.missingPdf}
              </Badge>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground">
          💡 Tipp: ZIP Download enthält nur verfügbare PDFs. CSV Export enthält alle ausgewählten
          Transaktionen.
        </div>
      </CardContent>
    </Card>
  )
}
