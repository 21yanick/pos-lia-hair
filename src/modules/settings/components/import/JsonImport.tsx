"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { 
  Upload, 
  FileJson,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useImport } from '@/shared/hooks/business/useImport'
import type { ItemImport } from '@/shared/types/import'

// Sample JSON für Tests
const SAMPLE_ITEMS: ItemImport[] = [
  {
    name: "Haarschnitt Damen",
    default_price: 65.00,
    type: "service",
    is_favorite: true,
    active: true
  },
  {
    name: "Haarschnitt Herren",
    default_price: 45.00,
    type: "service",
    is_favorite: true,
    active: true
  },
  {
    name: "Föhnen",
    default_price: 25.00,
    type: "service",
    is_favorite: false,
    active: true
  }
]

export function JsonImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [jsonData, setJsonData] = useState<any>(null)
  // Removed activeTab - only single upload tab now
  
  const { state, processImport, resetState } = useImport()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      alert('Bitte wählen Sie eine JSON-Datei aus')
      return
    }

    setSelectedFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        setJsonData(data)
      } catch (error) {
        alert('Ungültige JSON-Datei')
        setSelectedFile(null)
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async (validateOnly = false) => {
    if (!jsonData) return

    // ✅ SECURITY FIX: Let useImport hook handle authentication
    // Uses authenticated user.id and currentOrganization.id automatically
    await processImport(jsonData, {
      validateOnly,
      useSystemUserForSummaries: true
      // targetUserId automatically set by useImport hook
    })
  }

  const handleReset = () => {
    setSelectedFile(null)
    setJsonData(null)
    resetState()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const loadSampleData = () => {
    setJsonData({ items: SAMPLE_ITEMS })
    setSelectedFile(null)
  }

  return (
    <div className="space-y-6">
      
      {/* JSON Import */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileJson className="h-5 w-5 text-primary" />
              <CardTitle>JSON Import</CardTitle>
            </div>
            <CardDescription className="break-words">
              Vollständiger Import von Produkten, Verkäufen und Ausgaben mit automatischer PDF-Generierung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
        
        {/* File Upload */}
        {state.status === 'idle' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">JSON-Datei hochladen</p>
                <p className="text-xs text-muted-foreground">
                  Ihre Daten werden validiert und sicher importiert
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Datei auswählen
                </Button>
                <Button variant="outline" onClick={loadSampleData} className="w-full sm:w-auto">
                  Beispieldaten laden
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* File Info - Mobile-optimiert */}
        {(selectedFile || jsonData) && state.status === 'idle' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="break-words">
              {selectedFile ? (
                <div className="space-y-1">
                  <div><strong>Datei geladen:</strong></div>
                  <div className="text-sm text-muted-foreground truncate">
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </div>
                </div>
              ) : (
                <>
                  <strong>Beispieldaten geladen:</strong> {jsonData?.items?.length || 0} Items
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Data Preview - Mobile-optimiert */}
        {jsonData && state.status === 'idle' && (
          <div className="space-y-3">
            <h4 className="font-medium">Daten-Vorschau</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {jsonData.items && (
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="font-medium text-primary-foreground">Produkte</p>
                  <p className="text-2xl font-bold text-primary">{jsonData.items.length}</p>
                </div>
              )}
              {jsonData.sales && (
                <div className="bg-success/10 p-3 rounded-lg">
                  <p className="font-medium text-success-foreground">Verkäufe</p>
                  <p className="text-2xl font-bold text-success">{jsonData.sales.length}</p>
                </div>
              )}
              {jsonData.expenses && (
                <div className="bg-warning/10 p-3 rounded-lg">
                  <p className="font-medium text-warning-foreground">Ausgaben</p>
                  <p className="text-2xl font-bold text-warning">{jsonData.expenses.length}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions - Mobile-optimiert */}
        {jsonData && state.status === 'idle' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => handleImport(false)} className="w-full sm:w-auto">
              Import starten
            </Button>
            <Button onClick={() => handleImport(true)} variant="outline" className="w-full sm:w-auto">
              <span className="sm:hidden">Validieren</span>
              <span className="hidden sm:inline">Validierung testen</span>
            </Button>
            <Button onClick={handleReset} variant="ghost" className="w-full sm:w-auto">
              Zurücksetzen
            </Button>
          </div>
        )}

        {/* Progress */}
        {state.status === 'processing' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">{state.currentPhase}</span>
            </div>
            <Progress value={state.progress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {state.progress}% abgeschlossen
            </p>
          </div>
        )}

        {/* Results */}
        {state.status === 'success' && state.results && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Import erfolgreich!</strong></p>
                <div className="text-sm space-y-1">
                  <p>• {state.results.itemsImported} Produkte importiert</p>
                  <p>• {state.results.salesImported} Verkäufe importiert</p>
                  <p>• {state.results.expensesImported} Ausgaben importiert</p>
                  <p>• {state.results.cashMovementsGenerated} Kassenbuch-Einträge generiert</p>
                  <p>• {state.results.dailySummariesCalculated} Daily Summaries berechnet</p>
                  <p>• {state.results.documentsGenerated} Receipt PDFs erstellt</p>
                  <p>• Verarbeitungszeit: {Math.round(state.results.totalProcessingTime / 1000)}s</p>
                </div>
                <Button onClick={handleReset} size="sm" className="mt-2">
                  Neuer Import
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Errors */}
        {state.status === 'error' && state.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Import-Fehler:</strong></p>
                <ul className="text-sm space-y-1 ml-4">
                  {state.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
                <Button onClick={handleReset} size="sm" variant="outline" className="mt-2">
                  Zurücksetzen
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* JSON Format Info - Mobile-optimiert */}
        {state.status === 'idle' && !jsonData && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Erwartetes JSON-Format:</h4>
            <div className="bg-background border rounded p-3 overflow-hidden">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
{`{
  "items": [
    {
      "name": "Haarschnitt Damen",
      "default_price": 65.00,
      "type": "service",
      "is_favorite": true,
      "active": true
    }
  ]
}`}
              </pre>
            </div>
          </div>
        )}

          </CardContent>
        </Card>
    </div>
  )
}