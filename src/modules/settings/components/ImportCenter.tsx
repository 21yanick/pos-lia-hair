'use client'

import { AlertCircle, Database, FileJson, FileSpreadsheet, Loader2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { SettingsHeader } from '@/shared/components/settings/SettingsHeader'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useSystemStats } from '@/shared/hooks/business/useSystemStats'
import { CsvImport } from './import/CsvImport'
import { JsonImport } from './import/JsonImport'

export function ImportCenter() {
  const [activeTab, setActiveTab] = useState<'csv-import' | 'json-import'>('csv-import')
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useSystemStats()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Navigation */}
      <SettingsHeader
        title="Import-Center"
        description="Importieren Sie Ihre Daten schnell und sicher in das POS-System"
      />

      {/* System Status - Kompakt */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>System-Status</span>
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
              <span className="hidden sm:inline">Aktualisieren</span>
            </Button>
          </div>
          {statsError && (
            <div className="text-sm text-destructive flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Fehler beim Laden der Statistiken: {statsError}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Benutzer</p>
              <p className="text-2xl font-bold text-primary">
                {statsLoading ? '...' : stats.usersCount}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Produkte</p>
              <p
                className={`text-2xl font-bold ${stats.productsCount > 0 ? 'text-success' : 'text-muted-foreground'}`}
              >
                {statsLoading ? '...' : stats.productsCount}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Verkäufe</p>
              <p
                className={`text-2xl font-bold ${stats.salesCount > 0 ? 'text-success' : 'text-muted-foreground'}`}
              >
                {statsLoading ? '...' : stats.salesCount}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Ausgaben</p>
              <p
                className={`text-2xl font-bold ${stats.expensesCount > 0 ? 'text-success' : 'text-muted-foreground'}`}
              >
                {statsLoading ? '...' : stats.expensesCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs - Mobile-optimiert */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'csv-import' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('csv-import')}
          title="CSV Import"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">CSV Import</span>
        </Button>
        <Button
          variant={activeTab === 'json-import' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('json-import')}
          title="JSON Import"
        >
          <FileJson className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">JSON Import</span>
        </Button>
      </div>

      {activeTab === 'csv-import' && <CsvImport />}
      {activeTab === 'json-import' && <JsonImport />}
    </div>
  )
}
