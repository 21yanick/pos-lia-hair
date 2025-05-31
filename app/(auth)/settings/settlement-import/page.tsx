'use client'

import { useState } from 'react'
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
  Eye
} from 'lucide-react'
import { useSettlementImport } from '@/shared/hooks/business/useSettlementImport'
import { formatDateForDisplay } from '@/shared/utils/dateUtils'

export default function SettlementImportPage() {
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

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderUploadArea = () => (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Settlement Dateien hochladen</h3>
      <p className="text-muted-foreground mb-4">
        Unterstützte Formate: SumUp CSV, TWINT CSV, Raiffeisen CAMT.053 XML
      </p>
      
      <input
        type="file"
        accept=".csv,.xml"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="outline" className="cursor-pointer">
          Datei auswählen
        </Button>
      </label>
      
      <p className="text-sm text-muted-foreground mt-2">
        oder Datei hierher ziehen
      </p>
    </div>
  )

  const renderProgress = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          Import Progress
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
        
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className={`text-center p-2 rounded ${progress.step === 'upload' ? 'bg-primary/10' : progress.current > 20 ? 'bg-green-100' : 'bg-muted'}`}>
            <Upload className="h-4 w-4 mx-auto mb-1" />
            Upload
          </div>
          <div className={`text-center p-2 rounded ${progress.step === 'parsing' ? 'bg-primary/10' : progress.current > 40 ? 'bg-green-100' : 'bg-muted'}`}>
            <FileText className="h-4 w-4 mx-auto mb-1" />
            Parsing
          </div>
          <div className={`text-center p-2 rounded ${progress.step === 'matching' ? 'bg-primary/10' : progress.current > 80 ? 'bg-green-100' : 'bg-muted'}`}>
            <Eye className="h-4 w-4 mx-auto mb-1" />
            Matching
          </div>
          <div className={`text-center p-2 rounded ${progress.step === 'completed' ? 'bg-green-100' : 'bg-muted'}`}>
            <CheckCircle className="h-4 w-4 mx-auto mb-1" />
            Complete
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderResults = () => (
    <div className="space-y-6">
      {/* Import Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Import Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{results.updated}</div>
              <div className="text-sm text-muted-foreground">Updated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{results.matches.length}</div>
              <div className="text-sm text-muted-foreground">Matched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{results.unmatched.length}</div>
              <div className="text-sm text-muted-foreground">Unmatched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{results.imported.length}</div>
              <div className="text-sm text-muted-foreground">Imported</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matched Transactions */}
      {results.matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matched Transactions</CardTitle>
            <CardDescription>
              Automatically matched settlement data with POS transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.matches.map((match, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={match.matchType === 'exact' ? 'default' : 'secondary'}>
                        {match.matchType}
                      </Badge>
                      <Badge variant="outline">
                        {match.posTransaction.payment_method}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Confidence: {match.matchConfidence}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">POS:</span> CHF {match.posTransaction.total_amount}
                      </div>
                      <div>
                        <span className="font-medium">Settlement:</span> CHF {match.settlementTransaction?.grossAmount}
                      </div>
                      <div>
                        <span className="font-medium">Fee:</span> CHF {match.settlementTransaction?.providerFee}
                      </div>
                    </div>
                    
                    {match.variance && match.variance > 0.01 && (
                      <div className="text-sm text-orange-600 mt-1">
                        Variance: CHF {match.variance.toFixed(2)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {match.matchConfidence < 70 && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => approveMatch(match)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => rejectMatch(match)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {match.matchConfidence >= 70 && (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Auto-Updated
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unmatched Transactions */}
      {results.unmatched.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Unmatched Transactions
            </CardTitle>
            <CardDescription>
              These transactions require manual review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.unmatched.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 border rounded-lg bg-orange-50"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{transaction.payment_method}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDateForDisplay(transaction.created_at)}
                      </span>
                    </div>
                    <div className="text-sm">
                      Amount: CHF {transaction.total_amount} | Status: {transaction.settlement_status}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Manual Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={resetImport} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Import Another File
        </Button>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settlement Import</h1>
        <p className="text-muted-foreground">
          Import settlement data from TWINT, SumUp, and bank statements for automatic reconciliation
        </p>
      </div>

      {/* Supported Formats Info */}
      <Card>
        <CardHeader>
          <CardTitle>Supported File Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">SumUp CSV</h4>
                <p className="text-sm text-muted-foreground">
                  Transaction reports from SumUp dashboard
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">TWINT CSV</h4>
                <p className="text-sm text-muted-foreground">
                  Transaction reports from TWINT Business portal
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Raiffeisen XML</h4>
                <p className="text-sm text-muted-foreground">
                  CAMT.053 bank statements (ISO 20022)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
  )
}