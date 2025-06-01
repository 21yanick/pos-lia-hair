"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Badge } from "@/shared/components/ui/badge"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Target,
  FileText,
  MapPin
} from "lucide-react"

import type {
  ParsedCsvData,
  CsvImportType,
  CsvMappingConfig,
  ColumnMapping,
  FieldDefinition
} from '@/shared/types/csvImport'

import { FIELD_DEFINITIONS } from '@/shared/types/csvImport'

interface ColumnMappingDialogProps {
  isOpen: boolean
  onClose: () => void
  csvData: ParsedCsvData
  importType: CsvImportType
  onMappingComplete: (mappingConfig: CsvMappingConfig) => void
}

export function ColumnMappingDialog({
  isOpen,
  onClose,
  csvData,
  importType,
  onMappingComplete
}: ColumnMappingDialogProps) {
  
  const [mappings, setMappings] = useState<Record<string, ColumnMapping>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  // Get field definitions for current import type
  const fieldDefinitions = FIELD_DEFINITIONS[importType]
  
  // Initialize mappings on mount or when import type changes
  useEffect(() => {
    initializeMappings()
  }, [csvData, importType])
  
  const initializeMappings = () => {
    const initialMappings: Record<string, ColumnMapping> = {}
    
    fieldDefinitions.forEach(field => {
      // Try to auto-detect column mapping based on header names
      const suggestedHeader = findSuggestedHeader(field, csvData.headers)
      
      initialMappings[field.key] = {
        csvHeader: suggestedHeader || '',
        targetField: field.key,
        required: field.required,
        validated: false,
        sampleValue: suggestedHeader ? getSampleValue(suggestedHeader, csvData) : undefined
      }
    })
    
    setMappings(initialMappings)
    validateMappings(initialMappings)
  }
  
  const findSuggestedHeader = (field: FieldDefinition, headers: string[]): string | null => {
    const fieldKey = field.key.toLowerCase()
    const fieldLabel = field.label.toLowerCase()
    
    // Exact matches first
    for (const header of headers) {
      const headerLower = header.toLowerCase()
      if (headerLower === fieldKey || headerLower === fieldLabel) {
        return header
      }
    }
    
    // Partial matches
    const searchTerms = getSearchTermsForField(field.key)
    for (const header of headers) {
      const headerLower = header.toLowerCase()
      for (const term of searchTerms) {
        if (headerLower.includes(term)) {
          return header
        }
      }
    }
    
    return null
  }
  
  const getSearchTermsForField = (fieldKey: string): string[] => {
    const searchMap: { [key: string]: string[] } = {
      'name': ['name', 'produkt', 'service', 'bezeichnung'],
      'default_price': ['price', 'preis', 'cost', 'kosten', 'betrag'],
      'type': ['type', 'typ', 'art', 'category'],
      'date': ['date', 'datum', 'day', 'tag'],
      'time': ['time', 'zeit', 'hour', 'stunde'],
      'total_amount': ['total', 'amount', 'betrag', 'summe', 'gesamt'],
      'payment_method': ['payment', 'zahlung', 'method', 'methode'],
      'item_name': ['item', 'produkt', 'service', 'artikel'],
      'item_price': ['item_price', 'einzelpreis', 'price'],
      'amount': ['amount', 'betrag', 'kosten', 'cost'],
      'description': ['description', 'beschreibung', 'text', 'details'],
      'category': ['category', 'kategorie', 'typ', 'type'],
      'supplier_name': ['supplier', 'lieferant', 'vendor', 'firma'],
      'invoice_number': ['invoice', 'rechnung', 'number', 'nummer'],
      'notes': ['notes', 'notizen', 'bemerkung', 'comment'],
      'is_favorite': ['favorite', 'favorit', 'fav'],
      'active': ['active', 'aktiv', 'enabled']
    }
    
    return searchMap[fieldKey] || [fieldKey]
  }
  
  const getSampleValue = (csvHeader: string, csvData: ParsedCsvData): string | undefined => {
    // Get first non-empty value for this column
    for (const row of csvData.rows.slice(0, 3)) { // Check first 3 rows
      const value = row[csvHeader]
      if (value && value.trim()) {
        return value.trim()
      }
    }
    return undefined
  }
  
  const handleMappingChange = (fieldKey: string, csvHeader: string) => {
    const newMappings = { ...mappings }
    
    // Clear previous mapping for this CSV header
    Object.keys(newMappings).forEach(key => {
      if (newMappings[key].csvHeader === csvHeader && key !== fieldKey) {
        newMappings[key].csvHeader = ''
        newMappings[key].sampleValue = undefined
      }
    })
    
    // Set new mapping
    newMappings[fieldKey] = {
      ...newMappings[fieldKey],
      csvHeader: csvHeader || '',
      sampleValue: csvHeader ? getSampleValue(csvHeader, csvData) : undefined
    }
    
    setMappings(newMappings)
    validateMappings(newMappings)
  }
  
  const validateMappings = (mappingsToValidate: Record<string, ColumnMapping>) => {
    const errors: string[] = []
    
    // Check required fields
    fieldDefinitions.forEach(field => {
      const mapping = mappingsToValidate[field.key]
      if (field.required && (!mapping.csvHeader || mapping.csvHeader.trim() === '')) {
        errors.push(`Pflichtfeld '${field.label}' muss zugeordnet werden`)
      }
    })
    
    // Check for duplicate mappings
    const usedHeaders = new Set<string>()
    Object.values(mappingsToValidate).forEach(mapping => {
      if (mapping.csvHeader && mapping.csvHeader.trim()) {
        if (usedHeaders.has(mapping.csvHeader)) {
          errors.push(`Spalte '${mapping.csvHeader}' ist mehrfach zugeordnet`)
        }
        usedHeaders.add(mapping.csvHeader)
      }
    })
    
    // Validate sample values
    Object.entries(mappingsToValidate).forEach(([fieldKey, mapping]) => {
      if (mapping.csvHeader && mapping.sampleValue) {
        const field = fieldDefinitions.find(f => f.key === fieldKey)
        if (field) {
          const validationError = validateSampleValue(field, mapping.sampleValue)
          if (validationError) {
            errors.push(`${field.label}: ${validationError}`)
          }
        }
      }
    })
    
    setValidationErrors(errors)
  }
  
  const validateSampleValue = (field: FieldDefinition, sampleValue: string): string | null => {
    switch (field.type) {
      case 'number':
        const cleanValue = sampleValue.replace(/[CHF\s₣,]/g, '').replace(',', '.')
        if (isNaN(parseFloat(cleanValue))) {
          return `Beispielwert '${sampleValue}' ist keine gültige Zahl`
        }
        break
      
      case 'date':
        const dateFormats = [
          /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
          /^\d{1,2}\.\d{1,2}\.\d{4}$/, // DD.MM.YYYY
          /^\d{1,2}\/\d{1,2}\/\d{4}$/ // DD/MM/YYYY
        ]
        if (!dateFormats.some(format => format.test(sampleValue))) {
          return `Beispielwert '${sampleValue}' ist kein gültiges Datum (DD.MM.YYYY oder YYYY-MM-DD)`
        }
        break
      
      case 'time':
        if (!/^([01]?\d|2[0-3]):([0-5]\d)$/.test(sampleValue)) {
          return `Beispielwert '${sampleValue}' ist keine gültige Uhrzeit (HH:MM)`
        }
        break
      
      case 'enum':
        if (field.enumValues) {
          const lowerValue = sampleValue.toLowerCase()
          const lowerEnumValues = field.enumValues.map(v => v.toLowerCase())
          if (!lowerEnumValues.includes(lowerValue)) {
            return `Beispielwert '${sampleValue}' muss einer von: ${field.enumValues.join(', ')}`
          }
        }
        break
    }
    
    return null
  }
  
  const handleConfirm = () => {
    const isValid = validationErrors.length === 0
    
    const mappingConfig: CsvMappingConfig = {
      importType,
      mappings,
      isValid,
      validationErrors
    }
    
    onMappingComplete(mappingConfig)
  }
  
  const getAvailableHeaders = (currentFieldKey: string): string[] => {
    const usedHeaders = new Set(
      Object.entries(mappings)
        .filter(([key]) => key !== currentFieldKey)
        .map(([, mapping]) => mapping.csvHeader)
        .filter(header => header && header.trim())
    )
    
    return csvData.headers.filter(header => !usedHeaders.has(header))
  }
  
  const getMappedFieldsCount = (): { mapped: number, required: number, total: number } => {
    const requiredFields = fieldDefinitions.filter(f => f.required)
    const mappedRequired = requiredFields.filter(f => 
      mappings[f.key]?.csvHeader && mappings[f.key].csvHeader.trim()
    )
    const totalMapped = Object.values(mappings).filter(m => 
      m.csvHeader && m.csvHeader.trim()
    )
    
    return {
      mapped: mappedRequired.length,
      required: requiredFields.length,
      total: totalMapped.length
    }
  }
  
  const stats = getMappedFieldsCount()
  const isValid = validationErrors.length === 0 && stats.mapped === stats.required
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Spalten zuordnen</span>
          </DialogTitle>
          <DialogDescription>
            Ordnen Sie die CSV-Spalten den entsprechenden Datenfeldern zu. 
            Pflichtfelder sind mit einem roten Stern (*) markiert.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 overflow-y-auto max-h-[60vh]">
          
          {/* Status Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.mapped}/{stats.required}</p>
                    <p className="text-xs text-muted-foreground">Pflichtfelder</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Zugeordnet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  {isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="text-2xl font-bold">{isValid ? 'OK' : 'Error'}</p>
                    <p className="text-xs text-muted-foreground">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Field Mappings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feldmapping</CardTitle>
              <CardDescription>
                Wählen Sie für jedes Datenfeld die entsprechende CSV-Spalte aus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fieldDefinitions.map(field => {
                  const mapping = mappings[field.key]
                  const availableHeaders = getAvailableHeaders(field.key)
                  const hasError = field.required && (!mapping?.csvHeader || !mapping.csvHeader.trim())
                  
                  return (
                    <div key={field.key} className="flex items-center space-x-4 p-3 border rounded-lg">
                      
                      {/* Field Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{field.label}</span>
                          {field.required && <span className="text-red-500">*</span>}
                          <Badge variant={field.required ? "default" : "secondary"} className="text-xs">
                            {field.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {field.description}
                        </p>
                        {field.example && (
                          <p className="text-xs text-muted-foreground">
                            Beispiel: <code className="bg-muted px-1 rounded">{field.example}</code>
                          </p>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      
                      {/* CSV Column Selection */}
                      <div className="flex-1 min-w-0">
                        <Select
                          value={mapping?.csvHeader || '__NONE__'}
                          onValueChange={(value) => handleMappingChange(field.key, value === '__NONE__' ? '' : value)}
                        >
                          <SelectTrigger className={hasError ? "border-red-500" : ""}>
                            <SelectValue placeholder="CSV-Spalte wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__NONE__">-- Nicht zuordnen --</SelectItem>
                            {availableHeaders.map(header => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                            {mapping?.csvHeader && mapping.csvHeader !== '' && !availableHeaders.includes(mapping.csvHeader) && (
                              <SelectItem value={mapping.csvHeader}>
                                {mapping.csvHeader} (bereits zugeordnet)
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        
                        {/* Sample Value */}
                        {mapping?.sampleValue && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Beispielwert: <code className="bg-muted px-1 rounded">{mapping.sampleValue}</code>
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p><strong>Mapping-Fehler:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!isValid}
            className="min-w-[120px]"
          >
            {isValid ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Weiter
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                {stats.mapped}/{stats.required} Felder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}