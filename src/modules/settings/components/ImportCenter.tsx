"use client"

import { useState } from "react"
import { JsonImport } from "./import/JsonImport"
import { CsvImport } from "./import/CsvImport"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
import { useSystemStats } from "@/shared/hooks/business/useSystemStats"
import { 
  ArrowLeft,
  Upload, 
  FileJson,
  FileSpreadsheet,
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react"

export function ImportCenter() {
  const [activeTab, setActiveTab] = useState<'upload' | 'json-import' | 'csv-import'>('upload')
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useSystemStats()

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
            Importieren Sie Ihre Daten schnell und sicher in das POS-System
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
          variant={activeTab === 'csv-import' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('csv-import')}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          CSV Import
        </Button>
        <Button 
          variant={activeTab === 'json-import' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('json-import')}
        >
          <FileJson className="h-4 w-4 mr-2" />
          JSON Import
        </Button>
      </div>

      {activeTab === 'upload' && (
        <div className="space-y-6">
          
          {/* Import Types */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* JSON Import */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileJson className="h-5 w-5 text-primary" />
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
                    <p>✅ Verkaufs-Historie</p>
                    <p>✅ Ausgaben-Historie</p>
                    <p>✅ Validierung & PDF-Generierung</p>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="h-5 w-5 text-success" />
                    <CardTitle className="text-lg">CSV Import</CardTitle>
                  </div>
                  <Badge variant="default">GO-Live Ready</Badge>
                </div>
                <CardDescription>
                  Excel/CSV Import mit interaktivem Spalten-Mapping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>✅ Excel/CSV Datei-Upload</p>
                    <p>✅ Intelligentes Spalten-Mapping</p>
                    <p>✅ Live-Datenvorschau</p>
                    <p>✅ Ein-Klick Import</p>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => setActiveTab('csv-import')}
                  >
                    CSV Import starten
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          <Separator />

          {/* Current System Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Aktueller System-Status</span>
                  {statsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetchStats}
                  disabled={statsLoading}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                  <span>Aktualisieren</span>
                </Button>
              </div>
              <CardDescription>
                Übersicht über vorhandene Daten vor dem Import
              </CardDescription>
              {statsError && (
                <div className="text-sm text-destructive flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Fehler beim Laden der Statistiken: {statsError}</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Benutzer</p>
                  <p className="text-2xl font-bold text-primary">
                    {statsLoading ? '...' : stats.usersCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.usersCount === 0 ? 'Keine Benutzer' : 'Registrierte Benutzer'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Produkte</p>
                  <p className={`text-2xl font-bold ${stats.productsCount > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                    {statsLoading ? '...' : stats.productsCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.productsCount === 0 ? 'Bereit für Import' : 'Im Katalog'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Verkäufe</p>
                  <p className={`text-2xl font-bold ${stats.salesCount > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                    {statsLoading ? '...' : stats.salesCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.salesCount === 0 ? 'Bereit für Import' : 'Transaktionen'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ausgaben</p>
                  <p className={`text-2xl font-bold ${stats.expensesCount > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                    {statsLoading ? '...' : stats.expensesCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.expensesCount === 0 ? 'Bereit für Import' : 'Erfasste Ausgaben'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Import-Funktionen</span>
              </CardTitle>
              <CardDescription>
                Alle Funktionen für einen sicheren und vollständigen Datenimport
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium text-success">✅ Was wird importiert</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Produkte und Services</li>
                    <li>• Verkaufs-Historie mit Items</li>
                    <li>• Ausgaben und Belege</li>
                    <li>• Automatische Kassenbuch-Einträge</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-primary">📋 Unterstützte Formate</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• JSON für strukturierte Daten</li>
                    <li>• CSV/Excel mit Spalten-Mapping</li>
                    <li>• Automatische Datenvalidierung</li>
                    <li>• Live-Vorschau vor Import</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-success">🛡️ Sicherheit</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Vollständige Datenvalidierung</li>
                    <li>• Test-Modus für Vorabprüfung</li>
                    <li>• Automatische PDF-Generierung</li>
                    <li>• Fehler-Behandlung mit Rollback</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-primary">🚀 Automatisierung</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Daily Summaries werden berechnet</li>
                    <li>• Receipt-PDFs automatisch erstellt</li>
                    <li>• Kassenbuch-Einträge generiert</li>
                    <li>• Sofort einsatzbereit nach Import</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {activeTab === 'csv-import' && (
        <div className="space-y-6">
          <CsvImport />
        </div>
      )}

      {activeTab === 'json-import' && (
        <div className="space-y-6">
          <JsonImport />
        </div>
      )}


    </div>
  )
}