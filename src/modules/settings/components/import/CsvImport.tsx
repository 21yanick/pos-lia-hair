"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { 
  Upload, 
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Zap
} from "lucide-react"

import { useImport } from '@/shared/hooks/business/useImport'
import { CsvParser, suggestImportType } from '@/shared/utils/csvParser'
import { CsvToJsonTransformer } from '@/shared/utils/csvToJsonTransform'
import { ColumnMappingDialog } from './ColumnMappingDialog'
import { CsvDataPreview } from './CsvDataPreview'

import type {
  CsvImportState,
  CsvImportType,
  CsvMappingConfig
} from '@/shared/types/csvImport'

export function CsvImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // CSV Import State
  const [csvState, setCsvState] = useState<CsvImportState>({
    status: 'idle',
    file: null,
    parsedData: null,
    mappingConfig: null,
    transformedData: null,
    errors: [],
    progress: 0
  })
  
  // Dialog States
  const [showMappingDialog, setShowMappingDialog] = useState(false)
  const [selectedImportType, setSelectedImportType] = useState<CsvImportType>('items')
  
  // Existing JSON Import Hook
  const { state: importState, processImport, resetState } = useImport()
  
  // =================================
  // File Handling
  // =================================
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Reset previous state
    setCsvState({
      status: 'idle',
      file: null,
      parsedData: null,
      mappingConfig: null,
      transformedData: null,
      errors: [],
      progress: 0
    })
    
    // Validate file
    const validation = CsvParser.validateFile(file)
    if (!validation.isValid) {
      setCsvState(prev => ({
        ...prev,
        status: 'error',
        errors: validation.errors
      }))
      return
    }
    
    try {
      setCsvState(prev => ({ ...prev, status: 'file-loaded', file, progress: 25 }))
      
      // Parse CSV file
      const parsedData = await CsvParser.parseFile(file)
      
      if (parsedData.meta.errors.length > 0) {
        setCsvState(prev => ({
          ...prev,
          status: 'error',
          errors: parsedData.meta.errors
        }))
        return
      }
      
      // Suggest import type
      const suggestion = suggestImportType(parsedData)
      if (suggestion.type !== 'unknown') {
        setSelectedImportType(suggestion.type)
      }
      
      setCsvState(prev => ({
        ...prev,
        parsedData,
        progress: 50
      }))
      
    } catch (error) {
      setCsvState(prev => ({
        ...prev,
        status: 'error',
        errors: [error instanceof Error ? error.message : 'Unknown error parsing CSV']
      }))
    }
  }
  
  const handleImportTypeChange = (importType: CsvImportType) => {
    setSelectedImportType(importType)
  }
  
  const handleStartMapping = () => {
    if (!csvState.parsedData) return
    setShowMappingDialog(true)
  }
  
  // =================================
  // Mapping Flow
  // =================================
  
  const handleMappingComplete = (mappingConfig: CsvMappingConfig) => {
    setShowMappingDialog(false)
    
    if (!mappingConfig.isValid) {
      setCsvState(prev => ({
        ...prev,
        status: 'error',
        errors: mappingConfig.validationErrors
      }))
      return
    }
    
    try {
      // Transform CSV data to JSON format
      const transformedData = CsvToJsonTransformer.transform(
        csvState.parsedData!,
        mappingConfig
      )
      
      setCsvState(prev => ({
        ...prev,
        status: 'preview',
        mappingConfig,
        transformedData,
        progress: 75
      }))
      
    } catch (error) {
      setCsvState(prev => ({
        ...prev,
        status: 'error',
        errors: [error instanceof Error ? error.message : 'Error transforming data']
      }))
    }
  }
  
  const handleBackToMapping = () => {
    setShowMappingDialog(true)
  }
  
  // =================================
  // Import Execution
  // =================================
  
  const handleConfirmImport = async () => {
    if (!csvState.transformedData) return
    
    setCsvState(prev => ({ ...prev, status: 'importing', progress: 80 }))
    
    try {
      // Use existing import hook with transformed data
      const currentUserId = 'dd1329e7-5439-43ad-989b-0b8f5714824b' // LIA Hair Admin
      
      await processImport(csvState.transformedData, {
        validateOnly: false,
        targetUserId: currentUserId,
        useSystemUserForSummaries: true
      })
      
      setCsvState(prev => ({ ...prev, status: 'success', progress: 100 }))
      
    } catch (error) {
      setCsvState(prev => ({
        ...prev,
        status: 'error',
        errors: [error instanceof Error ? error.message : 'Import failed']
      }))
    }
  }
  
  // =================================
  // Reset Functions
  // =================================
  
  const handleReset = () => {
    setCsvState({
      status: 'idle',
      file: null,
      parsedData: null,
      mappingConfig: null,
      transformedData: null,
      errors: [],
      progress: 0
    })
    resetState()
    setSelectedImportType('items')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // =================================
  // Template Generation
  // =================================
  
  const generateTemplate = (type: CsvImportType) => {
    const templates = {
      items: {
        headers: ['Name', 'Preis', 'Typ', 'Favorit', 'Aktiv'],
        rows: [
          ['Haarschnitt Damen', '65.00', 'service', 'true', 'true'],
          ['Haarschnitt Herren', '45.00', 'service', 'true', 'true'],
          ['Föhnen', '25.00', 'service', 'false', 'true']
        ]
      },
      sales: {
        headers: ['Datum', 'Zeit', 'Gesamtbetrag', 'Zahlungsmethode', 'Items', 'Notizen'],
        rows: [
          ['2024-01-15', '14:30', '85.00', 'cash', 'Haarschnitt Damen:60.00;Styling:25.00', 'Multi-Item Sale'],
          ['2024-01-15', '15:45', '45.00', 'twint', 'Haarschnitt Herren:45.00', 'Single-Item Sale'],
          ['2024-01-16', '10:15', '70.00', 'sumup', 'Föhnen:25.00;Haarprodukt:45.00', 'Styling + Produkt']
        ]
      },
      expenses: {
        headers: ['Datum', 'Betrag', 'Beschreibung', 'Kategorie', 'Zahlungsmethode', 'Lieferant', 'Rechnungsnummer'],
        rows: [
          ['2024-01-01', '1200.00', 'Miete Januar', 'rent', 'bank', 'Immobilien AG', 'RE-2024-001'],
          ['2024-01-05', '150.00', 'Haarprodukte', 'supplies', 'cash', 'Beauty Store', ''],
          ['2024-01-10', '80.00', 'Strom', 'utilities', 'bank', 'EWZ', 'EWZ-456789']
        ]
      },
      users: {
        headers: ['Name', 'Benutzername', 'E-Mail', 'Rolle', 'Aktiv'],
        rows: [
          ['Maria Müller', 'maria.mueller', 'maria@salon.ch', 'staff', 'true'],
          ['Thomas Weber', 'thomas.weber', 'thomas@salon.ch', 'staff', 'true'],
          ['Lisa Admin', 'lisa.admin', 'lisa@salon.ch', 'admin', 'true']
        ]
      },
      owner_transactions: {
        headers: ['Transaktionstyp', 'Betrag', 'Beschreibung', 'Datum', 'Zahlungsmethode', 'Notizen'],
        rows: [
          ['deposit', '10000.00', 'Eigenkapital Einlage', '2024-01-01', 'bank_transfer', 'Startkapital für Salon'],
          ['expense', '5000.00', 'Ausrüstung Anschaffung', '2024-01-15', 'private_card', 'Friseurstühle und Equipment'],
          ['withdrawal', '1500.00', 'Privatentnahme', '2024-01-31', 'bank_transfer', 'Monatliche Entnahme']
        ]
      },
      bank_accounts: {
        headers: ['Kontoname', 'Bankname', 'IBAN', 'Kontonummer', 'Aktueller Saldo', 'Aktiv', 'Notizen'],
        rows: [
          ['Geschäftskonto UBS', 'UBS AG', 'CH93 0076 2011 6238 5295 7', '123456789', '15000.00', 'true', 'Hauptgeschäftskonto'],
          ['Sparkonto ZKB', 'Zürcher Kantonalbank', 'CH54 0070 0110 0023 2456 1', '987654321', '25000.00', 'true', 'Rücklagen'],
          ['Postfinance Konto', 'PostFinance AG', 'CH17 0900 0000 3012 3456 7', 'PF-789123', '5000.00', 'false', 'Inaktives Konto']
        ]
      },
      suppliers: {
        headers: ['Name', 'Kategorie', 'E-Mail', 'Telefon', 'Website', 'Adresse', 'Stadt', 'PLZ', 'Land', 'IBAN', 'UID', 'Aktiv', 'Notizen'],
        rows: [
          ['NewFlag AG', 'beauty_supplies', 'info@newflag.ch', '+41 44 123 45 67', 'https://newflag.ch', 'Beauty Street 123', 'Zürich', '8001', 'CH', 'CH93 0076 2011 6238 5295 7', 'CHE-123.456.789', 'true', 'Hauptlieferant für Haarprodukte'],
          ['Immobilien Müller', 'real_estate', 'info@immobilien-mueller.ch', '+41 44 987 65 43', '', 'Bahnhofstrasse 45', 'Zürich', '8001', 'CH', '', '', 'true', 'Vermieter Salon Räumlichkeiten'],
          ['Coop Genossenschaft', 'retail', '', '', 'https://coop.ch', '', '', '', 'CH', '', '', 'true', 'Büromaterial und Reinigungsmittel']
        ]
      }
    }
    
    const template = templates[type]
    const csvContent = [template.headers, ...template.rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${type}_template.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // =================================
  // Render Functions
  // =================================
  
  const renderImportTypeSelection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Import-Typ auswählen</label>
        <Select value={selectedImportType} onValueChange={handleImportTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Was möchten Sie importieren?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="items">
              <div className="flex items-center space-x-2">
                <div>
                  <p className="font-medium">Produkte & Services</p>
                  <p className="text-xs text-muted-foreground">Haarschnitte, Behandlungen, etc.</p>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="sales">
              <div className="flex items-center space-x-2">
                <div>
                  <p className="font-medium">Verkäufe</p>
                  <p className="text-xs text-muted-foreground">Historische Umsätze</p>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="expenses">
              <div className="flex items-center space-x-2">
                <div>
                  <p className="font-medium">Ausgaben</p>
                  <p className="text-xs text-muted-foreground">Kosten und Rechnungen</p>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="users">
              <div className="flex items-center space-x-2">
                <div>
                  <p className="font-medium">Benutzer</p>
                  <p className="text-xs text-muted-foreground">Mitarbeiter und Administratoren</p>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="owner_transactions">
              <div className="flex items-center space-x-2">
                <div>
                  <p className="font-medium">Inhabertransaktionen</p>
                  <p className="text-xs text-muted-foreground">Eigenkapital, Entnahmen, etc.</p>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="bank_accounts">
              <div className="flex items-center space-x-2">
                <div>
                  <p className="font-medium">Bankkonten</p>
                  <p className="text-xs text-muted-foreground">Geschäfts- und Privatkonten</p>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="suppliers">
              <div className="flex items-center space-x-2">
                <div>
                  <p className="font-medium">Lieferanten</p>
                  <p className="text-xs text-muted-foreground">Supplier Master Data</p>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Template Download */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">CSV Template herunterladen</p>
            <p className="text-xs text-muted-foreground">
              Vorlage mit korrekten Spalten und Beispieldaten
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateTemplate(selectedImportType)}
          >
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
        </div>
      </div>
    </div>
  )
  
  const renderFileUpload = () => (
    <div className="space-y-4">
      {renderImportTypeSelection()}
      
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-sm font-medium">CSV-Datei auswählen</p>
          <p className="text-xs text-muted-foreground">
            Laden Sie Ihre CSV-Datei hoch oder verwenden Sie unser Template
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="mt-4"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          CSV-Datei auswählen
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
  
  const renderFileInfo = () => (
    <div className="space-y-4">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <p><strong>Datei geladen:</strong> {csvState.file?.name}</p>
            <p><strong>Größe:</strong> {Math.round((csvState.file?.size || 0) / 1024)} KB</p>
            <p><strong>Zeilen:</strong> {csvState.parsedData?.rows.length || 0}</p>
            <p><strong>Spalten:</strong> {csvState.parsedData?.headers.length || 0}</p>
          </div>
        </AlertDescription>
      </Alert>
      
      {renderImportTypeSelection()}
      
      <div className="flex space-x-2">
        <Button onClick={handleStartMapping} className="flex-1">
          <Zap className="h-4 w-4 mr-2" />
          Spalten zuordnen
        </Button>
        <Button onClick={handleReset} variant="outline">
          Zurücksetzen
        </Button>
      </div>
    </div>
  )
  
  const renderErrors = () => (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p><strong>Fehler beim CSV Import:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              {csvState.errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </div>
        </AlertDescription>
      </Alert>
      
      <Button onClick={handleReset} variant="outline" className="w-full">
        Neuer Versuch
      </Button>
    </div>
  )
  
  const renderImportResults = () => {
    if (importState.status === 'success' && importState.results) {
      return (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>CSV Import erfolgreich!</strong></p>
              <div className="text-sm space-y-1">
                <p>• {importState.results.itemsImported} Produkte importiert</p>
                <p>• {importState.results.usersImported} Benutzer importiert</p>
                <p>• {importState.results.ownerTransactionsImported} Inhabertransaktionen importiert</p>
                <p>• {importState.results.bankAccountsImported} Bankkonten importiert</p>
                <p>• {importState.results.salesImported} Verkäufe importiert</p>
                <p>• {importState.results.expensesImported} Ausgaben importiert</p>
                <p>• {importState.results.cashMovementsGenerated} Kassenbuch-Einträge generiert</p>
                <p>• {importState.results.dailySummariesCalculated} Daily Summaries berechnet</p>
                <p>• {importState.results.documentsGenerated} PDFs erstellt</p>
                <p>• Verarbeitungszeit: {Math.round(importState.results.totalProcessingTime / 1000)}s</p>
              </div>
              <Button onClick={handleReset} size="sm" className="mt-2">
                Neuer Import
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }
    
    if (importState.status === 'error') {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Import-Fehler:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                {importState.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
              <Button onClick={handleReset} size="sm" variant="outline" className="mt-2">
                Zurücksetzen
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }
    
    if (importState.status === 'processing') {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">{importState.currentPhase}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${importState.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {importState.progress}% abgeschlossen
          </p>
        </div>
      )
    }
    
    return null
  }
  
  // =================================
  // Main Render
  // =================================
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <CardTitle>CSV Import</CardTitle>
            </div>
            <Badge variant="secondary">GO-Live Ready</Badge>
          </div>
          <CardDescription>
            Importieren Sie Ihre historischen Daten aus Excel/CSV Dateien
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Status-based rendering */}
          {csvState.status === 'idle' && renderFileUpload()}
          {csvState.status === 'file-loaded' && csvState.parsedData && renderFileInfo()}
          {csvState.status === 'error' && renderErrors()}
          {(csvState.status === 'importing' || csvState.status === 'success') && renderImportResults()}
          
        </CardContent>
      </Card>
      
      {/* Column Mapping Dialog */}
      {showMappingDialog && csvState.parsedData && (
        <ColumnMappingDialog
          isOpen={showMappingDialog}
          onClose={() => setShowMappingDialog(false)}
          csvData={csvState.parsedData}
          importType={selectedImportType}
          onMappingComplete={handleMappingComplete}
        />
      )}
      
      {/* Data Preview */}
      {csvState.status === 'preview' && 
       csvState.parsedData && 
       csvState.mappingConfig && 
       csvState.transformedData && (
        <CsvDataPreview
          csvData={csvState.parsedData}
          mappingConfig={csvState.mappingConfig}
          transformedData={csvState.transformedData}
          onConfirm={handleConfirmImport}
          onBack={handleBackToMapping}
        />
      )}
    </div>
  )
}