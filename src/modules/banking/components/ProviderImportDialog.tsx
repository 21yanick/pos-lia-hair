'use client'

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Database,
  FileSpreadsheet,
  FileX,
  Loader2,
  Upload,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Separator } from '@/shared/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { formatDateForDisplay } from '@/shared/utils/dateUtils'
import { importProviderFile, previewProviderFile } from '../services/providerImporter'
import type { ProviderImportPreview, ProviderImportResult } from '../types/provider'

type ImportStep = 'upload' | 'preview' | 'confirm'

interface ProviderImportDialogProps {
  isOpen: boolean
  userId: string
  onClose: () => void
  onSuccess: () => void
}

interface ImportState {
  step: ImportStep
  file: File | null
  preview: ProviderImportPreview | null
  result: ProviderImportResult | null
  loading: boolean
  error: string | null
}

export function ProviderImportDialog({
  isOpen,
  userId,
  onClose,
  onSuccess,
}: ProviderImportDialogProps) {
  const [state, setState] = useState<ImportState>({
    step: 'upload',
    file: null,
    preview: null,
    result: null,
    loading: false,
    error: null,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // =====================================================
  // RESET STATE
  // =====================================================

  const resetState = () => {
    setState({
      step: 'upload',
      file: null,
      preview: null,
      result: null,
      loading: false,
      error: null,
    })
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  // =====================================================
  // FILE UPLOAD HANDLERS
  // =====================================================

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setState((prev) => ({
        ...prev,
        error: 'Please select a CSV file. TWINT and SumUp exports should be in CSV format.',
      }))
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setState((prev) => ({
        ...prev,
        error: 'File size too large. Please select a file smaller than 10MB.',
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      file,
      error: null,
    }))
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]

    if (file) {
      // Simulate file input change
      const fakeEvent = {
        target: { files: [file] },
      } as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(fakeEvent)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  // =====================================================
  // PREVIEW GENERATION
  // =====================================================

  const handleGeneratePreview = async () => {
    if (!state.file) return

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }))

    try {
      const preview = await previewProviderFile(state.file)
      setState((prev) => ({
        ...prev,
        preview,
        step: 'preview',
        loading: false,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to preview file',
        loading: false,
      }))
    }
  }

  // =====================================================
  // IMPORT EXECUTION
  // =====================================================

  const handleConfirmImport = async () => {
    if (!state.preview) return

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }))

    try {
      const result = await importProviderFile(state.preview, userId)

      setState((prev) => ({
        ...prev,
        result,
        step: 'confirm',
        loading: false,
      }))

      // Notify parent of successful import
      if (result.success) {
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 3000) // Longer delay to ensure DB commit
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import file',
        loading: false,
      }))
    }
  }

  // =====================================================
  // STEP NAVIGATION
  // =====================================================

  const goBack = () => {
    if (state.step === 'preview') {
      setState((prev) => ({ ...prev, step: 'upload' }))
    }
  }

  // =====================================================
  // RENDER STEP CONTENT
  // =====================================================

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <button
        type="button"
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer w-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <FileSpreadsheet className="h-8 w-8 text-primary dark:text-blue-400" />
          </div>

          <div>
            <h3 className="text-lg font-medium">Provider CSV hochladen</h3>
            <p className="text-sm text-muted-foreground mt-1">
              TWINT oder SumUp CSV Datei hier ablegen oder zum Durchsuchen klicken
            </p>
          </div>

          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            CSV Datei auswählen
          </Button>
        </div>
      </button>

      {/* Selected File Info */}
      {state.file && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-5 w-5 text-chart-3" />
              <div className="flex-1">
                <p className="font-medium">{state.file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(state.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button onClick={handleGeneratePreview} disabled={state.loading}>
                {state.loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {state.loading ? 'Verarbeitung...' : 'Vorschau'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderPreviewStep = () => {
    if (!state.preview) return null

    return (
      <div className="space-y-6">
        {/* File Info & Detection */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">File Analysis</CardTitle>
              <Badge variant={state.preview.provider === 'twint' ? 'default' : 'secondary'}>
                {state.preview.detectedFormat}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-3">
                  {state.preview.newRecords.length}
                </div>
                <div className="text-sm text-muted-foreground">New Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {state.preview.duplicateRecords.length}
                </div>
                <div className="text-sm text-muted-foreground">Duplicates</div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Amount</div>
                <div className="text-chart-3 font-bold">
                  {state.preview.totalAmount.toFixed(2)} CHF
                </div>
              </div>
              <div>
                <div className="font-medium">Total Fees</div>
                <div className="text-destructive font-bold">
                  {state.preview.totalFees.toFixed(2)} CHF
                </div>
              </div>
              <div>
                <div className="font-medium">Date Range</div>
                <div className="text-muted-foreground">
                  {formatDateForDisplay(state.preview.dateRange.from)} -{' '}
                  {formatDateForDisplay(state.preview.dateRange.to)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warnings */}
        {state.preview.warnings.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {state.preview.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Preview Table */}
        {state.preview.newRecords.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preview - First 5 Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.preview.newRecords.slice(0, 5).map((record) => (
                    <TableRow key={record.provider_transaction_id}>
                      <TableCell>{formatDateForDisplay(record.transaction_date)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {record.provider_transaction_id.substring(0, 12)}...
                      </TableCell>
                      <TableCell className="text-chart-3">
                        {record.gross_amount.toFixed(2)} CHF
                      </TableCell>
                      <TableCell className="text-destructive">
                        {record.fees.toFixed(2)} CHF
                      </TableCell>
                      <TableCell className="text-primary">
                        {record.net_amount.toFixed(2)} CHF
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {state.preview.newRecords.length > 5 && (
                <div className="mt-3 text-sm text-muted-foreground text-center">
                  ... and {state.preview.newRecords.length - 5} more records
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleConfirmImport}
            disabled={!state.preview.importable || state.loading}
          >
            {state.loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            {state.loading ? 'Importing...' : `Import ${state.preview.newRecords.length} Records`}
          </Button>
        </div>
      </div>
    )
  }

  const renderConfirmStep = () => {
    if (!state.result) return null

    const success = state.result.success

    return (
      <div className="space-y-6">
        {/* Result Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {success ? (
                <div className="p-3 bg-chart-3/10 dark:bg-green-900 rounded-full">
                  <CheckCircle className="h-8 w-8 text-chart-3 dark:text-green-400" />
                </div>
              ) : (
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <FileX className="h-8 w-8 text-destructive dark:text-red-400" />
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {success ? 'Import Completed Successfully!' : 'Import Failed'}
                </h3>
                <p className="text-muted-foreground">
                  {success
                    ? `${state.result.recordsImported} records imported in ${state.result.processingTimeMs}ms`
                    : 'The import process encountered errors'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Statistics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Import Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-3">
                  {state.result.recordsImported}
                </div>
                <div className="text-sm text-muted-foreground">Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {state.result.recordsFailed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Errors */}
        {state.result.errors && state.result.errors.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-destructive">Import Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {state.result.errors.slice(0, 10).map((error) => (
                  <div
                    key={error.rowIndex}
                    className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded"
                  >
                    <span className="font-medium">Row {error.rowIndex}:</span> {error.error}
                  </div>
                ))}
                {state.result.errors.length > 10 && (
                  <div className="text-sm text-muted-foreground text-center">
                    ... and {state.result.errors.length - 10} more errors
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Close Button */}
        <div className="flex justify-center">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    )
  }

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Provider Import - TWINT & SumUp</span>
          </DialogTitle>
          <DialogDescription>
            Transaktionsdaten aus TWINT oder SumUp CSV-Exporten importieren und mit POS-Verkäufen
            abgleichen
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center space-x-4 mb-6">
          <div
            className={`flex items-center space-x-2 ${
              state.step === 'upload'
                ? 'text-primary'
                : ['preview', 'confirm'].includes(state.step)
                  ? 'text-chart-3'
                  : 'text-muted-foreground'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                state.step === 'upload'
                  ? 'bg-primary/10 text-primary'
                  : ['preview', 'confirm'].includes(state.step)
                    ? 'bg-chart-3/10 text-chart-3'
                    : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              1
            </div>
            <span className="font-medium">Hochladen</span>
          </div>

          <div className="flex-1 h-px bg-gray-200"></div>

          <div
            className={`flex items-center space-x-2 ${
              state.step === 'preview'
                ? 'text-primary'
                : state.step === 'confirm'
                  ? 'text-chart-3'
                  : 'text-muted-foreground'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                state.step === 'preview'
                  ? 'bg-primary/10 text-primary'
                  : state.step === 'confirm'
                    ? 'bg-chart-3/10 text-chart-3'
                    : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              2
            </div>
            <span className="font-medium">Vorschau</span>
          </div>

          <div className="flex-1 h-px bg-gray-200"></div>

          <div
            className={`flex items-center space-x-2 ${
              state.step === 'confirm' ? 'text-chart-3' : 'text-muted-foreground'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                state.step === 'confirm'
                  ? 'bg-chart-3/10 text-chart-3'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              3
            </div>
            <span className="font-medium">Bestätigen</span>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        {state.step === 'upload' && renderUploadStep()}
        {state.step === 'preview' && renderPreviewStep()}
        {state.step === 'confirm' && renderConfirmStep()}
      </DialogContent>
    </Dialog>
  )
}
