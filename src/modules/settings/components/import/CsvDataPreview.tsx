'use client'

import {
  AlertCircle,
  CheckCircle,
  Database,
  Eye,
  FileText,
  MoreHorizontal,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
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
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import type { ExpenseImport, ItemImport, SaleImport } from '@/shared/hooks/business/useImport'
import type { CsvMappingConfig, ParsedCsvData } from '@/shared/types/csvImport'

import { getCsvStats } from '@/shared/utils/csvParser'
import { validateTransformedData } from '@/shared/utils/csvToJsonTransform'

interface CsvDataPreviewProps {
  csvData: ParsedCsvData
  mappingConfig: CsvMappingConfig
  transformedData: {
    items?: ItemImport[]
    sales?: SaleImport[]
    expenses?: ExpenseImport[]
  }
  onConfirm: () => void
  onBack: () => void
}

export function CsvDataPreview({
  csvData,
  mappingConfig,
  transformedData,
  onConfirm,
  onBack,
}: CsvDataPreviewProps) {
  const [showAllRows, setShowAllRows] = useState(false)

  // Get data statistics
  const csvStats = getCsvStats(csvData)
  const validation = validateTransformedData(transformedData, mappingConfig.importType)

  // Determine preview rows
  const maxPreviewRows = 10
  const displayRows = showAllRows ? csvData.rows : csvData.rows.slice(0, maxPreviewRows)
  const hasMoreRows = csvData.rows.length > maxPreviewRows

  // Get mapped headers only
  const mappedHeaders = Object.values(mappingConfig.mappings)
    .filter((mapping) => mapping.csvHeader?.trim())
    .map((mapping) => mapping.csvHeader)

  // V6.1 Pattern 4: Function Return Value Guarantee (no undefined)
  const getTransformedDataStats = () => {
    switch (mappingConfig.importType) {
      case 'items':
        return {
          count: transformedData.items?.length || 0,
          type: 'Produkte/Services',
          icon: <Database className="h-4 w-4" />,
        }
      case 'sales':
        return {
          count: transformedData.sales?.length || 0,
          type: 'Verkäufe',
          icon: <TrendingUp className="h-4 w-4" />,
        }
      case 'expenses':
        return {
          count: transformedData.expenses?.length || 0,
          type: 'Ausgaben',
          icon: <FileText className="h-4 w-4" />,
        }
      default:
        // V6.1: Guarantee return value for unknown import types
        return {
          count: 0,
          type: 'Unbekannt',
          icon: <Database className="h-4 w-4" />,
        }
    }
  }

  const transformedStats = getTransformedDataStats()

  const renderPreviewData = () => {
    switch (mappingConfig.importType) {
      case 'items':
        return renderItemsPreview()
      case 'sales':
        return renderSalesPreview()
      case 'expenses':
        return renderExpensesPreview()
      default:
        return null
    }
  }

  const renderItemsPreview = () => {
    const items = transformedData.items?.slice(0, showAllRows ? undefined : maxPreviewRows) || []

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Preis</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Favorit</TableHead>
            <TableHead>Aktiv</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={`item-${item.name}-${index}`}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>CHF {item.default_price.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={item.type === 'service' ? 'default' : 'secondary'}>
                  {item.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={item.is_favorite ? 'default' : 'outline'}>
                  {item.is_favorite ? 'Ja' : 'Nein'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={item.active ? 'default' : 'destructive'}>
                  {item.active ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  const renderSalesPreview = () => {
    const sales = transformedData.sales?.slice(0, showAllRows ? undefined : maxPreviewRows) || []

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Zeit</TableHead>
            <TableHead>Betrag</TableHead>
            <TableHead>Zahlung</TableHead>
            <TableHead>Produkt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale, index) => (
            <TableRow key={`sale-${sale.date}-${sale.time}-${index}`}>
              <TableCell>{sale.date}</TableCell>
              <TableCell>{sale.time}</TableCell>
              <TableCell className="font-medium">CHF {sale.total_amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    sale.payment_method === 'cash'
                      ? 'default'
                      : sale.payment_method === 'twint'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {sale.payment_method}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{sale.items[0]?.item_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  const renderExpensesPreview = () => {
    const expenses =
      transformedData.expenses?.slice(0, showAllRows ? undefined : maxPreviewRows) || []

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Betrag</TableHead>
            <TableHead>Beschreibung</TableHead>
            <TableHead>Kategorie</TableHead>
            <TableHead>Zahlung</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense, index) => (
            <TableRow key={`expense-${expense.date}-${expense.amount}-${index}`}>
              <TableCell>{expense.date}</TableCell>
              <TableCell className="font-medium">CHF {expense.amount.toFixed(2)}</TableCell>
              <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
              <TableCell>
                <Badge variant="outline">{expense.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={expense.payment_method === 'cash' ? 'default' : 'secondary'}>
                  {expense.payment_method}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Daten-Vorschau</h3>
        </div>
        <Badge variant="outline" className="text-sm">
          {mappingConfig.importType.charAt(0).toUpperCase() + mappingConfig.importType.slice(1)}{' '}
          Import
        </Badge>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{csvStats.totalRows}</p>
                <p className="text-xs text-muted-foreground">CSV Zeilen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              {transformedStats.icon}
              <div>
                <p className="text-2xl font-bold">{transformedStats.count}</p>
                <p className="text-xs text-muted-foreground">{transformedStats.type}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{mappedHeaders.length}</p>
                <p className="text-xs text-muted-foreground">Zugeordnet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              {validation.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <div>
                <p className="text-2xl font-bold">{csvStats.dataQuality}%</p>
                <p className="text-xs text-muted-foreground">Qualität</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Results */}
      {!validation.isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Validierungsfehler gefunden:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={`error-${error.slice(0, 20)}-${index}`} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Warnungen:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={`warning-${warning.slice(0, 20)}-${index}`} className="text-sm">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Raw CSV Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Original CSV Daten</CardTitle>
          <CardDescription>
            Vorschau der ursprünglichen CSV-Daten mit zugeordneten Spalten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  {mappedHeaders.map((header) => (
                    <TableHead key={header} className="min-w-[120px]">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((row, index) => (
                  <TableRow key={`row-${index}-${Object.values(row).slice(0, 2).join('-')}`}>
                    {mappedHeaders.map((header) => (
                      <TableCell key={`${index}-${header}`} className="max-w-[200px] truncate">
                        {row[header] || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {hasMoreRows && !showAllRows && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={() => setShowAllRows(true)}>
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Alle {csvData.rows.length} Zeilen anzeigen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transformed Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transformierte Daten</CardTitle>
          <CardDescription>
            Vorschau der transformierten Daten, die importiert werden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">{renderPreviewData()}</ScrollArea>

          {hasMoreRows && !showAllRows && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Zeige {Math.min(maxPreviewRows, transformedStats.count)} von{' '}
                {transformedStats.count} {transformedStats.type}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Zurück zu Mapping
        </Button>

        <Button onClick={onConfirm} disabled={!validation.isValid} className="min-w-[140px]">
          {validation.isValid ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Import starten
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Fehler beheben
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
