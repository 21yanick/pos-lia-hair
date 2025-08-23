'use client'

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Database,
  FileSpreadsheet,
  FileX,
  Loader2,
  RefreshCw,
  Upload,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Progress } from '@/shared/components/ui/progress'
import { Separator } from '@/shared/components/ui/separator'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { formatDateForAPI } from '@/shared/utils/dateUtils'
import { importCAMTFile, previewCAMTFile } from '../services/camtImporter'
import type { ImportExecutionResult, ImportPreviewData } from '../types/banking'

type ImportStep = 'upload' | 'preview' | 'confirm'

interface BankImportDialogProps {
  isOpen: boolean
  bankAccountId: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

interface ImportState {
  step: ImportStep
  file: File | null
  preview: ImportPreviewData | null
  result: ImportExecutionResult | null
  loading: boolean
  error: string | null
}

export function BankImportDialog({
  isOpen,
  bankAccountId,
  userId,
  onClose,
  onSuccess,
}: BankImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🔒 Multi-Tenant Organization Context
  const { currentOrganization } = useCurrentOrganization()

  const [state, setState] = useState<ImportState>({
    step: 'upload',
    file: null,
    preview: null,
    result: null,
    loading: false,
    error: null,
  })

  // Reset state when dialog opens/closes
  const handleClose = () => {
    setState({
      step: 'upload',
      file: null,
      preview: null,
      result: null,
      loading: false,
      error: null,
    })
    onClose()
  }

  // File selection handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setState((prev) => ({
        ...prev,
        error: 'Bitte wählen Sie eine XML-Datei aus (CAMT.053 Format)',
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      file,
      error: null,
    }))
  }

  // Drag & Drop handlers
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]

    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xml')) {
      setState((prev) => ({
        ...prev,
        error: 'Bitte wählen Sie eine XML-Datei aus (CAMT.053 Format)',
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      file,
      error: null,
    }))
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  // Parse and preview file
  const handleParseFile = async () => {
    if (!state.file) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const xmlContent = await state.file.text()

      // Preview only - NO DATABASE WRITES
      const result = await previewCAMTFile(xmlContent, state.file.name, bankAccountId)

      if (!result.success || !result.preview) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.errors.join(', ') || 'Fehler beim Parsen der Datei',
        }))
        return
      }

      const preview: ImportPreviewData = {
        filename: result.preview.filename,
        totalEntries: result.preview.duplicateCheck.totalEntries,
        newEntries: result.preview.duplicateCheck.newEntries.length,
        duplicateEntries: result.preview.duplicateCheck.duplicateEntries.length,
        errorEntries: result.preview.duplicateCheck.errorEntries.length,
        fileAlreadyImported: result.preview.duplicateCheck.fileAlreadyImported,
        periodOverlap: result.preview.duplicateCheck.periodOverlap,
        importable: result.preview.importable,
        statementPeriod: {
          from: formatDateForAPI(result.preview.statement.fromDateTime),
          to: formatDateForAPI(result.preview.statement.toDateTime),
        },
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        preview,
        step: 'preview',
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Parsen',
      }))
    }
  }

  // Execute import
  const handleExecuteImport = async () => {
    if (!state.file || !state.preview) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      // 🔒 Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt. Bitte wählen Sie eine Organization.')
      }

      const xmlContent = await state.file.text()
      const result = await importCAMTFile(
        xmlContent,
        state.file.name,
        bankAccountId,
        userId,
        currentOrganization.id // ✅ CRITICAL FIX: Organization security
      )

      if (result.success && result.importResult) {
        // Type-safe ImportExecutionResult structure conversion (Clean Architecture)
        const executionResult: ImportExecutionResult = {
          success: true, // Known successful at this point
          importedCount: result.importResult.importedCount,
          errors: result.importResult.errors,
          // sessionId is optional, not provided by API
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          result: executionResult,
          step: 'confirm',
        }))

        // Trigger data refresh in parent
        onSuccess()
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.errors.join(', ') || 'Import fehlgeschlagen',
        }))
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unbekannter Import-Fehler',
      }))
    }
  }

  // Navigation
  const goBack = () => {
    setState((prev) => ({
      ...prev,
      step: prev.step === 'preview' ? 'upload' : 'upload',
      error: null,
    }))
  }

  const goToUpload = () => {
    setState((prev) => ({
      ...prev,
      step: 'upload',
      file: null,
      preview: null,
      result: null,
      error: null,
    }))
  }

  // Render current step
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Bank Import</h3>
        <p className="text-muted-foreground">Raiffeisen CAMT.053 XML Datei hochladen</p>
      </div>

      {/* File Upload Area */}
      <button
        type="button"
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        aria-label="XML-Datei auswählen oder hierher ziehen"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-accent rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-accent-foreground" />
          </div>

          <div>
            <p className="text-sm font-medium">XML-Datei hier ablegen oder klicken zum Auswählen</p>
            <p className="text-xs text-muted-foreground mt-1">
              Unterstützt: CAMT.053 XML Format (Raiffeisen)
            </p>
          </div>
        </div>
      </button>

      {/* Selected File */}
      {state.file && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" title={state.file.name}>
                  {state.file.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(state.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Badge variant="outline">XML</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleClose}>
          Abbrechen
        </Button>
        <Button onClick={handleParseFile} disabled={!state.file || state.loading}>
          {state.loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 mr-2" />
          )}
          {state.loading ? 'Analysiere...' : 'Analysieren'}
        </Button>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Import Vorschau</h3>
        <p className="text-muted-foreground">Überprüfen Sie die Import-Details vor dem Import</p>
      </div>

      {/* File Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
            <span className="truncate" title={state.preview?.filename}>
              {state.preview?.filename}
            </span>
          </CardTitle>
          {state.preview?.statementPeriod && (
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {state.preview.statementPeriod.from} bis {state.preview.statementPeriod.to}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded">
              <div className="text-2xl font-bold text-primary">
                {state.preview?.totalEntries || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Einträge</div>
            </div>
            <div className="text-center p-4 bg-chart-3/10 rounded">
              <div className="text-2xl font-bold text-chart-3">
                {state.preview?.newEntries || 0}
              </div>
              <div className="text-sm text-muted-foreground">Neue Einträge</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate & Error Summary */}
      {(state.preview?.duplicateEntries || 0) > 0 ||
        ((state.preview?.errorEntries || 0) > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(state.preview?.duplicateEntries || 0) > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{state.preview?.duplicateEntries}</strong> Duplikate gefunden
                  <br />
                  <span className="text-xs text-muted-foreground">Diese werden übersprungen</span>
                </AlertDescription>
              </Alert>
            )}

            {(state.preview?.errorEntries || 0) > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{state.preview?.errorEntries}</strong> Fehlerhafte Einträge
                  <br />
                  <span className="text-xs">Diese können nicht importiert werden</span>
                </AlertDescription>
              </Alert>
            )}
          </div>
        ))}

      {/* Warnings */}
      <div className="space-y-3">
        {state.preview?.fileAlreadyImported && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Diese Datei wurde bereits importiert. Duplikate werden automatisch übersprungen.
            </AlertDescription>
          </Alert>
        )}

        {state.preview?.periodOverlap && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Zeitraum überschneidet sich mit bestehenden Importen. Überprüfen Sie Duplikate
              sorgfältig.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Import Decision */}
      <Card
        className={
          state.preview?.importable
            ? 'border-green-200 dark:border-green-800'
            : 'border-destructive'
        }
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {state.preview?.importable ? (
              <CheckCircle className="h-5 w-5 text-chart-3" />
            ) : (
              <FileX className="h-5 w-5 text-destructive" />
            )}
            <div>
              <p className="font-medium">
                {state.preview?.importable ? 'Import möglich' : 'Import nicht möglich'}
              </p>
              <p className="text-sm text-muted-foreground">
                {state.preview?.importable
                  ? `${state.preview.newEntries} neue Transaktionen werden importiert`
                  : 'Keine neuen Einträge oder Validierungsfehler gefunden'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <Button
          onClick={handleExecuteImport}
          disabled={!state.preview?.importable || state.loading}
        >
          {state.loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Database className="h-4 w-4 mr-2" />
          )}
          {state.loading
            ? 'Importiere...'
            : `${state.preview?.newEntries || 0} Einträge importieren`}
        </Button>
      </div>
    </div>
  )

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-chart-3/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-chart-3" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Import erfolgreich!</h3>
        <p className="text-muted-foreground">
          Die Bank-Transaktionen wurden erfolgreich importiert
        </p>
      </div>

      {/* Success Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-chart-3">
              {state.result?.importedCount || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Transaktionen erfolgreich importiert
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-start gap-4">
              <span className="text-muted-foreground flex-shrink-0">Datei:</span>
              <span className="font-medium text-right break-all">{state.preview?.filename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="default" className="bg-green-600 dark:bg-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Vollständig
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Alert>
        <RefreshCw className="h-4 w-4" />
        <AlertDescription>
          Die neuen Transaktionen sind jetzt in Tab 2 (Bank-Abgleich) verfügbar und können mit
          internen Einträgen verknüpft werden.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={goToUpload}>
          Neuer Import
        </Button>
        <Button onClick={handleClose}>Schließen</Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bank Import - CAMT.053</DialogTitle>
          <DialogDescription>
            Importieren Sie Raiffeisen Bank-Transaktionen aus XML-Dateien
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm ${state.step === 'upload' ? 'font-medium text-primary' : 'text-muted-foreground'}`}
              >
                1. Upload
              </span>
              <span
                className={`text-sm ${state.step === 'preview' ? 'font-medium text-primary' : 'text-muted-foreground'}`}
              >
                2. Vorschau
              </span>
              <span
                className={`text-sm ${state.step === 'confirm' ? 'font-medium text-primary' : 'text-muted-foreground'}`}
              >
                3. Bestätigung
              </span>
            </div>
            <Progress
              value={state.step === 'upload' ? 33 : state.step === 'preview' ? 66 : 100}
              className="h-2"
            />
          </div>

          {/* Step Content */}
          {state.step === 'upload' && renderUploadStep()}
          {state.step === 'preview' && renderPreviewStep()}
          {state.step === 'confirm' && renderConfirmStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
