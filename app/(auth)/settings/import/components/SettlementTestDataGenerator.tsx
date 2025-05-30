'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  Database, 
  Info, 
  TestTube,
  FileText,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { 
  generateSettlementTestJSON, 
  getTestDataStats,
  generateSettlementTestData 
} from '@/lib/utils/generateSettlementTestData'

interface SettlementTestDataGeneratorProps {
  onTestDataGenerated?: (jsonData: string) => void
}

export function SettlementTestDataGenerator({ onTestDataGenerated }: SettlementTestDataGeneratorProps) {
  const [generatedData, setGeneratedData] = useState<string | null>(null)
  const [stats, setStats] = useState<ReturnType<typeof getTestDataStats> | null>(null)

  const handleGenerateTestData = () => {
    const jsonData = generateSettlementTestJSON()
    const dataStats = getTestDataStats()
    
    setGeneratedData(jsonData)
    setStats(dataStats)
    
    // Notify parent component
    onTestDataGenerated?.(jsonData)
  }

  const handleDownloadJSON = () => {
    if (!generatedData) return
    
    const blob = new Blob([generatedData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'settlement-test-data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyToClipboard = () => {
    if (!generatedData) return
    
    navigator.clipboard.writeText(generatedData).then(() => {
      // Could add a toast notification here
      console.log('Test data copied to clipboard')
    })
  }

  return (
    <div className="space-y-6">
      
      {/* Generator Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-500" />
            Settlement Test Data Generator
          </CardTitle>
          <CardDescription>
            Generiert realistische POS-Daten basierend auf echten Provider-Settlement-Dateien
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Diese Test-Daten basieren auf den echten Settlement-Dateien in{' '}
                <code className="text-sm bg-muted px-1 rounded">docs/twint_sumup_banking_examples/</code>
                {' '}und ermöglichen realistische Tests des Settlement Import Systems.
              </AlertDescription>
            </Alert>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Enthalten:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• 8 SumUp Transaktionen (echte Beträge & IDs)</li>
                  <li>• 15 TWINT Transaktionen (echte Beträge & IDs)</li>
                  <li>• 5 Cash Transaktionen (für Vollständigkeit)</li>
                  <li>• 6 Bank Expenses (CHF 8.057) + 2 Cash Expenses</li>
                  <li>• 20 realistische Friseur-Services</li>
                  <li>• Zeitraum: April 2025</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Test-Workflow:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>1. Test-Daten importieren</li>
                  <li>2. Settlement Import testen</li>
                  <li>3. Echte Provider-Dateien hochladen</li>
                  <li>4. Automatisches Matching prüfen</li>
                  <li>5. Reconciliation validieren</li>
                </ul>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex gap-2">
              <Button onClick={handleGenerateTestData} className="flex-1">
                <Database className="h-4 w-4 mr-2" />
                Settlement Test-Daten generieren
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Data Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Generierte Test-Daten Übersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</div>
                <div className="text-sm text-muted-foreground">Total Verkäufe</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.sumupTransactions}</div>
                <div className="text-sm text-muted-foreground">SumUp</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.twintTransactions}</div>
                <div className="text-sm text-muted-foreground">TWINT</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.cashTransactions}</div>
                <div className="text-sm text-muted-foreground">Cash</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.totalExpenses}</div>
                <div className="text-sm text-muted-foreground">Expenses</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sales Total:</span>
                  <div className="text-blue-600 font-bold">CHF {stats.totalAmount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    SumUp: CHF {stats.sumupTotal.toFixed(2)}<br/>
                    TWINT: CHF {stats.twintTotal.toFixed(2)}<br/>
                    Cash: CHF {stats.cashTotal.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Expenses Total:</span>
                  <div className="text-red-600 font-bold">CHF {stats.totalExpenseAmount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    Bank: CHF {stats.bankExpensesTotal.toFixed(2)}<br/>
                    Cash: CHF {stats.cashExpensesTotal.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Net Result:</span>
                  <div className="text-primary font-bold">CHF {(stats.totalAmount - stats.totalExpenseAmount).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.bankExpenses} Bank + {stats.cashExpenses} Cash Expenses
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline">
                {stats.dateRange.from} bis {stats.dateRange.to}
              </Badge>
              <Badge variant="secondary">
                {stats.totalTransactions} Sales + {stats.totalExpenses} Expenses
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated JSON Actions */}
      {generatedData && (
        <Card>
          <CardHeader>
            <CardTitle>Test-Daten bereit für Import</CardTitle>
            <CardDescription>
              JSON-Daten wurden generiert und können nun importiert werden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              
              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleDownloadJSON} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  JSON herunterladen
                </Button>
                
                <Button onClick={handleCopyToClipboard} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  In Zwischenablage kopieren
                </Button>
              </div>

              {/* Data Preview */}
              <div className="space-y-2">
                <h4 className="font-medium">JSON Preview:</h4>
                <div className="bg-muted p-3 rounded-lg text-sm font-mono max-h-40 overflow-y-auto">
                  <pre>{generatedData.substring(0, 500)}...</pre>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gesamtgröße: {Math.round(generatedData.length / 1024)} KB
                </p>
              </div>

              {/* Next Steps */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Nächste Schritte:</strong>
                  <br />
                  1. JSON-Daten über das Import-System importieren
                  <br />
                  2. Settlement Import System mit echten Provider-Dateien testen
                  <br />
                  3. Automatic Matching und Reconciliation validieren
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}