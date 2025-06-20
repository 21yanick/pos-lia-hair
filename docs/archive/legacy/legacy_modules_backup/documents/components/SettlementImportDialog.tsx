'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Progress } from '@/shared/components/ui/progress'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  RefreshCw,
  Eye,
  X
} from 'lucide-react'
import { useSettlementImport } from '@/shared/hooks/business/useSettlementImport'
import { formatDateForDisplay } from '@/shared/utils/dateUtils'

interface SettlementImportDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  month: string // Format: "2025-04" for April 2025
  onComplete?: () => void // Callback when settlement import is completed
}

export function SettlementImportDialog({ 
  isOpen, 
  onOpenChange, 
  month, 
  onComplete 
}: SettlementImportDialogProps) {
  const [dragActive, setDragActive] = useState(false)
  const {
    loading,
    error,
    progress,
    results,
    importSettlementFile,
    approveMatch,
    rejectMatch,
    resetImport
  } = useSettlementImport()

  // Format month for display
  const [year, monthNum] = month.split('-').map(Number)
  const monthName = new Date(year, monthNum - 1).toLocaleDateString('de-CH', { 
    year: 'numeric', 
    month: 'long' 
  })

  // ============================================================================
  // FILE UPLOAD HANDLERS
  // ============================================================================

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    await importSettlementFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleComplete = () => {
    onComplete?.()
    onOpenChange(false)
    resetImport()
  }

  const handleClose = () => {
    onOpenChange(false)
    // Optional: Reset import when closing
    if (progress.step === 'upload') {
      resetImport()
    }
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderUploadArea = () => (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
      <h3 className="font-semibold mb-2">Settlement Dateien für {monthName}</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Unterstützte Formate: SumUp CSV, TWINT CSV, Raiffeisen CAMT.053 XML
      </p>
      
      <input
        type="file"
        accept=".csv,.xml"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        id="settlement-file-upload"
      />
      <label htmlFor="settlement-file-upload">
        <Button variant="outline" className="cursor-pointer">
          Datei auswählen
        </Button>
      </label>
      
      <p className="text-xs text-muted-foreground mt-2">
        oder Datei hierher ziehen
      </p>
    </div>
  )

  const renderProgress = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Settlement Import Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{progress.message}</span>
            <span>{progress.current}%</span>
          </div>
          <Progress value={progress.current} className="w-full" />
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className={`text-center p-2 rounded ${progress.step === 'upload' ? 'bg-primary/10' : progress.current > 20 ? 'bg-green-100' : 'bg-muted'}`}>
            <Upload className="h-3 w-3 mx-auto mb-1" />
            Upload
          </div>
          <div className={`text-center p-2 rounded ${progress.step === 'parsing' ? 'bg-primary/10' : progress.current > 40 ? 'bg-green-100' : 'bg-muted'}`}>
            <FileText className="h-3 w-3 mx-auto mb-1" />
            Parsing
          </div>
          <div className={`text-center p-2 rounded ${progress.step === 'matching' ? 'bg-primary/10' : progress.current > 80 ? 'bg-green-100' : 'bg-muted'}`}>
            <Eye className="h-3 w-3 mx-auto mb-1" />
            Matching
          </div>
          <div className={`text-center p-2 rounded ${progress.step === 'completed' ? 'bg-green-100' : 'bg-muted'}`}>
            <CheckCircle className="h-3 w-3 mx-auto mb-1" />
            Complete
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderResults = () => (
    <div className="space-y-4">
      {/* Import Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Import Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{results.updated}</div>
              <div className="text-xs text-muted-foreground">Updated</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{results.matches.length}</div>
              <div className="text-xs text-muted-foreground">Matched</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{results.unmatched.length}</div>
              <div className="text-xs text-muted-foreground">Unmatched</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-600">{results.imported.length}</div>
              <div className="text-xs text-muted-foreground">Imported</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matched Transactions - Compact for Dialog */}
      {results.matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matched Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {results.matches.slice(0, 5).map((match, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={match.matchType === 'exact' ? 'default' : 'secondary'} className="text-xs">
                        {match.matchType}
                      </Badge>
                      <span className="text-xs">CHF {match.posTransaction.total_amount}</span>
                    </div>
                  </div>
                  
                  {match.matchConfidence < 70 && (
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => approveMatch(match)}
                      >
                        ✓
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => rejectMatch(match)}
                      >
                        ✗
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {results.matches.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{results.matches.length - 5} weitere Matches
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button onClick={handleComplete} className="flex-1">
          Settlement Import abschließen
        </Button>
        <Button onClick={resetImport} variant="outline">
          Neue Datei
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Settlement Import - {monthName}
          </DialogTitle>
          <DialogDescription>
            Importieren Sie TWINT/SumUp CSV-Dateien und Bank-Statements für den monatlichen Settlement-Abgleich
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Main Content Area */}
          {!loading && progress.step === 'upload' && !results.imported.length && renderUploadArea()}
          
          {loading && renderProgress()}
          
          {progress.step === 'completed' && results.imported.length > 0 && renderResults()}
        </div>
      </DialogContent>
    </Dialog>
  )
}