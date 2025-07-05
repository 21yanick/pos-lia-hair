"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
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
      // ✅ SECURITY FIX: Let useImport hook handle authentication
      // Uses authenticated user.id and currentOrganization.id automatically
      await processImport(csvState.transformedData, {
        validateOnly: false,
        useSystemUserForSummaries: true
        // targetUserId automatically set by useImport hook
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
          ['Haarschnitt Damen (Waschen+Schneiden+Föhnen)', '65.00', 'service', 'true', 'true'],
          ['Haarschnitt Herren (klassisch)', '45.00', 'service', 'true', 'true'],
          ['Shampoo Kerastase 250ml', '32.50', 'product', 'false', 'true'],
          ['Coloration (Aufpreis je nach Länge)', '85.00', 'service', 'true', 'true'],
          ['Haargummi Professional', '4.90', 'product', 'false', 'false']
        ]
      },
      sales: {
        headers: ['Datum', 'Zeit', 'Gesamtbetrag', 'Zahlungsmethode', 'Items', 'Notizen', 'Status', 'Bruttobetrag', 'Anbietergebühr', 'Nettobetrag', 'Abrechnungsstatus'],
        rows: [
          ['2024-01-15', '14:30', '65.00', 'cash', 'Haarschnitt Damen (Waschen+Schneiden+Föhnen):65.00', 'Bar bezahlt - keine Gebühren', 'completed', '65.00', '0.00', '65.00', 'pending'],
          ['2024-01-15', '15:45', '45.00', 'twint', 'Haarschnitt Herren (klassisch):45.00', 'TWINT - 3% Gebühr, T+2 Settlement', 'completed', '45.00', '1.35', '43.65', 'settled'],
          ['2024-01-16', '10:15', '97.50', 'sumup', 'Coloration (Aufpreis je nach Länge):85.00;Shampoo Kerastase 250ml:32.50', 'SumUp - 2.75% + 0.25 CHF', 'completed', '97.50', '2.93', '94.57', 'weekend_delay'],
          ['2024-01-17', '11:20', '32.50', 'cash', 'Shampoo Kerastase 250ml:32.50', 'Nur Produktverkauf', 'completed', '32.50', '0.00', '32.50', 'pending']
        ]
      },
      expenses: {
        headers: ['Betrag', 'Beschreibung', 'Kategorie', 'Zahlungsmethode', 'Zahlungsdatum', 'Lieferant', 'Rechnungsnummer', 'Notizen', 'Banking-Status'],
        rows: [
          ['2200.00', 'Miete Salon Januar 2024', 'rent', 'bank', '2024-01-05', 'Immobilien Zürich AG', 'RENT-2024-001', 'Monatliche Miete Räumlichkeiten Bahnhofstrasse', 'matched'],
          ['287.40', 'Haarprodukte Kerastase + L\'Oréal', 'supplies', 'cash', '2024-01-08', 'Beauty Professional GmbH', 'BP-24-0156', 'Shampoo, Conditioner, Styling-Produkte', 'unmatched'],
          ['156.80', 'Strom + Heizung Dezember', 'utilities', 'bank', '2024-01-15', 'EWZ Zürich', 'EWZ-2024-001234', 'Energiekosten Dezember 2023', 'matched'],
          ['45.60', 'Reinigungsmittel + Handtücher', 'supplies', 'cash', '2024-01-12', 'Coop Bau+Hobby', '', 'Barzahlung Coop - keine Rechnung', 'unmatched'],
          ['890.00', 'Marketing Facebook Ads Januar', 'marketing', 'bank', '2024-01-31', 'Meta Platforms Ireland', 'META-INV-456789', 'Social Media Werbung Januar', 'matched']
        ]
      },
      users: {
        headers: ['Name', 'Benutzername', 'E-Mail', 'Rolle', 'Aktiv'],
        rows: [
          ['Lia Schmid (Inhaberin)', 'lia.schmid', 'lia@coiffure-lia.ch', 'admin', 'true'],
          ['Maria Friseurin', 'maria.stylist', 'maria@coiffure-lia.ch', 'staff', 'true'],
          ['Anna Lehrling', 'anna.apprentice', 'anna@coiffure-lia.ch', 'staff', 'true'],
          ['Sarah Ex-Mitarbeiterin', 'sarah.former', 'sarah@gmail.com', 'staff', 'false']
        ]
      },
      owner_transactions: {
        headers: ['Transaktionstyp', 'Betrag', 'Beschreibung', 'Transaktionsdatum', 'Zahlungsmethode', 'Banking-Status', 'Notizen'],
        rows: [
          ['deposit', '25000.00', 'Startkapital Salonöffnung', '2024-01-01', 'bank_transfer', 'matched', 'Eigenkapital für Geschäftseröffnung Januar 2024'],
          ['expense', '8950.00', 'Renovierung + Ausrüstung', '2024-01-15', 'private_card', 'matched', 'Friseurstühle, Waschbecken, Spiegel - Privatkarte Lia'],
          ['expense', '2340.50', 'Erstausstattung Produkte', '2024-01-20', 'private_cash', 'unmatched', 'Startbestand Haarprodukte - bar bezahlt'],
          ['withdrawal', '3500.00', 'Privatentnahme Januar', '2024-01-31', 'bank_transfer', 'matched', 'Lohn/Entnahme Inhaberin Januar'],
          ['deposit', '1200.00', 'Zusatzkapital Frühjahr', '2024-04-01', 'bank_transfer', 'matched', 'Zusätzliche Einlage für Sommersaison-Vorbereitung']
        ]
      },
      bank_accounts: {
        headers: ['Kontoname', 'Bankname', 'IBAN', 'Kontonummer', 'Aktueller Saldo', 'Letztes Kontodatum', 'Aktiv', 'Notizen'],
        rows: [
          ['Geschäftskonto Coiffure Lia', 'UBS Switzerland AG', 'CH93 0024 5245 1234 5678 9', 'UBS-240001234', '18756.45', '2024-01-31', 'true', 'Hauptgeschäftskonto für tägl. Umsätze + Ausgaben'],
          ['Sparkonto Rücklagen', 'Zürcher Kantonalbank', 'CH54 0070 0110 0023 2456 1', 'ZKB-110234561', '35200.00', '2024-01-31', 'true', 'Steuern, Investitionen, Notreserve'],
          ['Privatkonto Lia Schmid', 'PostFinance AG', 'CH17 0900 0000 3012 3456 7', 'PF-30123456', '12450.80', '2024-01-31', 'true', 'Privatkonto für Owner Transactions + Entnahmen'],
          ['Altes Konto (geschlossen)', 'Credit Suisse (historisch)', 'CH45 0483 5012 3456 7800 0', 'CS-50123456', '0.00', '2023-06-30', 'false', 'Geschlossen vor Salonöffnung - nur für historische Daten']
        ]
      },
      suppliers: {
        headers: ['Name', 'Normalisierter Name', 'Kategorie', 'Kontakt E-Mail', 'Kontakt Telefon', 'Website', 'Adresse Zeile 1', 'Adresse Zeile 2', 'PLZ', 'Stadt', 'Land', 'IBAN', 'MwSt-Nummer', 'Aktiv', 'Notizen'],
        rows: [
          ['Beauty Professional Schweiz GmbH', 'beauty-professional-schweiz-gmbh', 'beauty_supplies', 'orders@beautypro.ch', '+41 44 567 89 12', 'https://beautypro.ch', 'Industriestrasse 45', 'Gebäude C, 2. Stock', '8050', 'Zürich', 'CH', 'CH12 0070 0114 8012 3456 7', 'CHE-234.567.890', 'true', 'Kerastase, L\'Oréal Professional - Hauptlieferant'],
          ['Immobilien Bahnhof AG', 'immobilien-bahnhof-ag', 'real_estate', 'vermietung@bahnhof-properties.ch', '+41 44 321 65 43', 'https://bahnhof-properties.ch', 'Bahnhofstrasse 87', 'Büro 205', '8001', 'Zürich', 'CH', 'CH54 0024 5245 7890 1234 5', 'CHE-345.678.901', 'true', 'Vermieter Salon Räumlichkeiten - Mietvertrag bis 2026'],
          ['EWZ Elektrizitätswerk Zürich', 'ewz-elektrizitaetswerk-zuerich', 'utilities', 'kundendienst@ewz.ch', '+41 58 319 41 11', 'https://ewz.ch', 'Tramstrasse 35', '', '8050', 'Zürich', 'CH', '', 'CHE-109.240.709', 'true', 'Strom + Heizung - monatliche Abrechnung'],
          ['Coop Bau+Hobby', 'coop-bau-hobby', 'retail', '', '+41 848 888 444', 'https://bauundhobby.ch', 'Härdlistrasse 15', 'Einkaufszentrum', '8005', 'Zürich', 'CH', '', '', 'true', 'Reinigungsmittel, Handtücher - Barzahlung meist'],
          ['Swisscom (Schweiz) AG', 'swisscom-schweiz-ag', 'services', 'business@swisscom.com', '+41 800 800 800', 'https://swisscom.ch', 'Alte Tiefenaustrasse 6', '', '3048', 'Worblaufen', 'CH', 'CH95 0023 5235 8940 4000 1', 'CHE-107.418.778', 'true', 'Internet, Telefon, Mobile - Business Paket']
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
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <CardTitle>CSV Import</CardTitle>
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