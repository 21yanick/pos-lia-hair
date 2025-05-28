"use client"

import { useState } from "react"
import { JsonImport } from "./components/JsonImport"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Upload, 
  FileJson,
  FileSpreadsheet,
  Database,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'history' | 'json-import'>('upload')

  return (
    <div className="container mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Einstellungen
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Import-Center</h1>
          <p className="text-muted-foreground">
            Importieren Sie historische Daten oder Testdaten in Ihr POS-System
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button 
          variant={activeTab === 'upload' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('upload')}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button 
          variant={activeTab === 'json-import' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('json-import')}
        >
          <FileJson className="h-4 w-4 mr-2" />
          JSON Import
        </Button>
        <Button 
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('history')}
        >
          <Clock className="h-4 w-4 mr-2" />
          Verlauf
        </Button>
      </div>

      {activeTab === 'upload' && (
        <div className="space-y-6">
          
          {/* Import Types */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* JSON Import */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileJson className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">JSON Import</CardTitle>
                  </div>
                  <Badge variant="default">Verfügbar</Badge>
                </div>
                <CardDescription>
                  Strukturierter Import für vollständige Datensets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>✅ Produkte & Services</p>
                    <p>🚧 Verkaufs-Historie (Phase 2)</p>
                    <p>🚧 Ausgaben-Historie (Phase 2)</p>
                    <p>✅ Validierung & Rollback</p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => setActiveTab('json-import')}
                  >
                    JSON Import starten
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CSV Import */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">CSV Import</CardTitle>
                </div>
                <CardDescription>
                  Einfacher Import für einzelne Datentabellen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📄 Separate CSV-Dateien</p>
                    <p>📄 Items.csv</p>
                    <p>📄 Sales.csv</p>
                    <p>📄 Expenses.csv</p>
                  </div>
                  <Button variant="outline" className="w-full" disabled>
                    CSV-Dateien auswählen
                    <span className="ml-2 text-xs opacity-75">(Phase 3)</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test Data */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Test-Daten</CardTitle>
                </div>
                <CardDescription>
                  Generierte Beispieldaten für Entwicklung & Tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>🎲 Zufällige Verkäufe</p>
                    <p>🎲 Realistische Ausgaben</p>
                    <p>🎲 Letzte 30 Tage</p>
                    <p>🎲 Vollständige Integration</p>
                  </div>
                  <Button variant="outline" className="w-full" disabled>
                    Test-Daten generieren
                    <span className="ml-2 text-xs opacity-75">(Phase 2)</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          <Separator />

          {/* Current System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Aktueller System-Status</span>
              </CardTitle>
              <CardDescription>
                Übersicht über vorhandene Daten vor dem Import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Benutzer</p>
                  <p className="text-2xl font-bold text-blue-600">2</p>
                  <p className="text-xs text-muted-foreground">System + Admin</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Produkte</p>
                  <p className="text-2xl font-bold text-green-600">10</p>
                  <p className="text-xs text-muted-foreground">Shared Catalog</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Verkäufe</p>
                  <p className="text-2xl font-bold text-gray-400">0</p>
                  <p className="text-xs text-muted-foreground">Bereit für Import</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ausgaben</p>
                  <p className="text-2xl font-bold text-gray-400">0</p>
                  <p className="text-xs text-muted-foreground">Bereit für Import</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span>Wichtige Hinweise</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Business-Centric Vorteile</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Produkte sind shared resources - keine user_id erforderlich</li>
                  <li>• System User für automatische Daily Summary Berechnung</li>
                  <li>• Klare Audit Trails mit created_by Feldern</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">📋 Unterstützte Formate</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• JSON: Vollständiger strukturierter Import (empfohlen)</li>
                  <li>• CSV: Einzelne Tabellen (Phase 3)</li>
                  <li>• Excel: Multi-Sheet Import (Phase 3)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-orange-600">⚠️ Vorsichtsmaßnahmen</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Backup wird automatisch erstellt vor Import</li>
                  <li>• Validierung verhindert ungültige Daten</li>
                  <li>• Rollback bei Fehlern verfügbar</li>
                  <li>• Test-Modus für sichere Vorabprüfung</li>
                </ul>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {activeTab === 'json-import' && (
        <div className="space-y-6">
          <JsonImport />
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Import-Verlauf</CardTitle>
            <CardDescription>
              Übersicht über durchgeführte Import-Operationen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Imports durchgeführt</p>
              <p className="text-sm">Import-Verlauf wird hier angezeigt nach dem ersten Import</p>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}