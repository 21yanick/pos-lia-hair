# POS-LIA-HAIR Import System

## 📋 Übersicht

Vollständig implementiertes Import-System für historische Datenimporte und Testdaten-Generierung. Das System ist **production-ready** und unterstützt den kompletten Business-Workflow von Items über Sales/Expenses bis hin zur automatischen PDF-Generierung.

## 🎯 Use Cases

1. **Go-Live Import**: Einmalige Migration historischer Buchhaltungsdaten
2. **Development**: Schnelle Generierung realistischer Testdaten
3. **Backup/Restore**: Vollständiger Datenexport und -import (zukünftig)

## 🏗️ System-Architektur

### Business-Centric Design

Das Import-System folgt der **Business-Centric Architektur** des POS-Systems:

```
BUSINESS-LEVEL (Shared)        USER-LEVEL (Audit Trail)
├── Items (shared catalog)  →  ├── Sales (user_id: wer verkauft)
├── Daily Summaries         →  ├── Expenses (user_id: wer erfasst)  
└── Monthly Summaries       →  ├── Documents (user_id: wer erstellt)
                               └── Cash Movements (user_id: wer ausgelöst)
```

**Vorteile:**
- ✅ Items sind gemeinsamer Katalog (keine user_id erforderlich)
- ✅ System User kann eigenständig Daily Summaries erstellen
- ✅ Klarer Audit Trail für alle User-Aktionen
- ✅ Multi-Location ready (zukünftig)

## 🚀 Implementierung

### Datei-Struktur

```
/app/(auth)/settings/import/
├── page.tsx                    # Import Dashboard
└── components/
    └── JsonImport.tsx          # JSON Import UI

/lib/hooks/business/
└── useImport.ts                # Core Import Logic

/components/pdf/
├── ReceiptPDF.tsx              # Sales Receipt PDFs
├── DailyReportPDF.tsx          # Daily Report PDFs
└── PlaceholderReceiptPDF.tsx   # Expense Receipt Placeholders

/sample-import.json             # Beispiel-Daten
```

### Core Hook: useImport.ts

```typescript
interface ImportConfig {
  validateOnly: boolean
  targetUserId: string
  generateMissingReceipts: boolean
  // ...
}

const useImport = () => {
  const processImport = async (data, config) => {
    // 7-Phasen Import-Prozess
  }
  
  return { state, processImport, resetState }
}
```

## 📊 Import-Prozess (7 Phasen)

### Phase 1: Validation
- **Items**: Name unique, Preise valid, Type enum
- **Sales**: Datum gültig, Items existieren, Beträge korrekt
- **Expenses**: Kategorien valid, Zahlungsmethoden korrekt

### Phase 2: Business Data Import
```typescript
// Items - Shared Resources (kein user_id)
const itemsImported = await importItems(data.items)
```

### Phase 3: User Data Import
```typescript
// Sales - mit user_id für Audit Trail
const salesImported = await importSales(data.sales, targetUserId)

// Expenses - mit user_id für Audit Trail  
const expensesImported = await importExpenses(data.expenses, targetUserId)
```

### Phase 4: Cash Movement Generation
```typescript
// Automatische Kassenbuch-Einträge für Cash-Transaktionen
const cashMovements = await generateCashMovements(sales, expenses, targetUserId)
```

### Phase 5: Daily Summary Calculation
```typescript
// System User erstellt Daily Summaries automatisch
const summaries = await calculateDailySummariesForImport(sales, expenses)
```

### Phase 6: Document Generation
```typescript
// 6a: Receipt PDFs für alle Sales
const receiptPDFs = await generateReceiptPDFsForSales(sales, targetUserId)

// 6b: Daily Report PDFs für alle Tage
const dailyPDFs = await generateDailyReportPDFs(sales, expenses, targetUserId)

// 6c: Expense Receipt PDFs (Platzhalter)
const expensePDFs = await generateExpenseReceiptPDFs(expenses, targetUserId)
```

### Phase 7: Progress Tracking
- Real-time Progress Updates
- Detailliertes Error Handling
- Comprehensive Result Summary

## 🗂️ Storage-Struktur

```
documents/
├── receipts/           # Sales Receipt PDFs
│   ├── quittung-{id}.pdf      # Manual Sales
│   └── receipt-{id}.pdf       # Import Sales
├── daily_reports/      # Daily Report PDFs
│   └── daily_report_{date}.pdf
└── expense_receipts/   # Expense Receipt PDFs
    ├── {id}-{timestamp}-{name}     # Manual Upload
    ├── placeholder-beleg-{id}.pdf  # Manual Physical
    └── import-expense-{id}.pdf     # Import Placeholder
```

## 📋 JSON Format

### Minimal Example
```json
{
  "metadata": {
    "version": "1.0",
    "description": "Import für Go-Live"
  },
  "items": [
    {
      "name": "Haarschnitt Damen",
      "default_price": 65.00,
      "type": "service",
      "active": true
    }
  ],
  "sales": [
    {
      "date": "2025-01-15",
      "time": "10:30",
      "total_amount": 65.00,
      "payment_method": "cash",
      "items": [
        {
          "item_name": "Haarschnitt Damen",
          "price": 65.00
        }
      ]
    }
  ],
  "expenses": [
    {
      "date": "2025-01-15",
      "amount": 120.00,
      "description": "Shampoo Nachbestellung",
      "category": "supplies",
      "payment_method": "bank"
    }
  ]
}
```

## 🎨 UI Features

### Import Dashboard (`/settings/import`)
- **File Upload**: Drag & Drop JSON Import
- **Real-time Progress**: Phasen-basierte Fortschrittsanzeige
- **Result Summary**: Detaillierte Import-Statistiken
- **Error Handling**: Comprehensive Fehlermeldungen

### Manual Expense Receipt Handling
- **Radio Button**: "Digitalen Beleg hochladen" vs "Physischer Beleg vorhanden"
- **Archive Location**: Optional für physische Belege
- **Automatic PDF**: PlaceholderReceiptPDF für physische Belege

## 💡 Lessons Learned

### 1. Schema-Konsistenz Critical
**Problem**: Unterschiedliche Storage-Pfade zwischen Manual/Import  
**Lösung**: Einheitliche `documents/{type}/` Struktur

```typescript
// VORHER: Inkonsistent
const manualPath = `documents/receipts/${filename}`
const importPath = `receipts/${filename}`

// NACHHER: Konsistent
const unifiedPath = `documents/receipts/${filename}`
```

### 2. PDF Generation Memory-Efficient
**Lösung**: Dynamic Imports für PDF-Libraries
```typescript
const { pdf } = await import('@react-pdf/renderer')
const { ReceiptPDF } = await import('@/components/pdf/ReceiptPDF')
```

### 3. Receipt Requirements Flexible
**Problem**: Manual System verlangte immer digitalen Upload  
**Lösung**: Physical Receipt Option mit Auto-Placeholder

### 4. Error Recovery Robust
- Continue on single PDF failures
- Comprehensive logging for debugging
- Graceful degradation (Sales ohne Receipts OK)

### 5. Business-Centric Simplifies Imports
```typescript
// Items: Kein user_id erforderlich (shared)
const items = await importItems(data.items)

// System User für Daily Summaries
const summaries = await calculateDailySummaries(SYSTEM_USER_ID)
```

## ⚙️ Configuration

### System Users
```typescript
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'
const ADMIN_USER_ID = 'dd1329e7-5439-43ad-989b-0b8f5714824b'
```

### Default Config
```typescript
const DEFAULT_CONFIG: ImportConfig = {
  validateOnly: false,
  batchSize: 100,
  targetUserId: 'current',
  generateMissingReceipts: true,
  overwriteExisting: false,
  useSystemUserForSummaries: true
}
```

## 🧪 Testing

### Sample Data
- **15 Items**: Verschiedene Services/Products
- **6 Sales**: Multi-Item Sales mit Cash/Digital
- **4 Expenses**: Verschiedene Kategorien
- **Auto-Generation**: 4 Cash Movements, 12 Daily Reports, 19 PDFs

### Test Flow
1. Clear Storage & Documents (`clear_storage.js`)
2. Import via `/settings/import`
3. Verify in `/documents` (alle PDFs sichtbar)
4. Check Storage Structure (konsistente Pfade)

## 🚨 Production Considerations

### Performance
- **Batch Size**: 100 Records default (anpassbar)
- **Parallel Processing**: Wo möglich (PDF-Generation sequentiell)
- **Memory Management**: Dynamic Imports für PDF-Libraries

### Error Handling
- **Validation First**: Alle Daten vor Import validieren
- **Atomic Operations**: Database-Level Konsistenz
- **Graceful Failures**: Continue on non-critical errors

### Security
- **User Validation**: Auth-State required
- **RLS Policies**: Database-Level Security
- **File Validation**: JSON Schema Validation

## 🔮 Future Enhancements

### Phase 8: CSV/Excel Support
```typescript
const importCsv = async (file: File) => {
  const data = await parseCsv(file)
  return processImport(data)
}
```

### Phase 9: Batch Processing
```typescript
const importLargeBatch = async (data: any[], config: ImportConfig) => {
  const chunks = chunkArray(data, config.batchSize)
  for (const chunk of chunks) {
    await processChunk(chunk)
  }
}
```

### Phase 10: Import History
```typescript
interface ImportHistory {
  id: string
  timestamp: string
  user_id: string
  summary: ImportResults
  file_hash: string
}
```

## ✅ Status: Production Ready

**Das Import-System ist vollständig implementiert und production-ready:**

- ✅ **Complete Import Pipeline**: 7-Phase Process
- ✅ **Real PDF Generation**: Receipt, Daily Report, Expense Placeholder
- ✅ **Unified Storage Structure**: Consistent paths
- ✅ **Comprehensive Error Handling**: Robust and recoverable
- ✅ **Business-Centric Architecture**: Future-proof design
- ✅ **Manual/Import Consistency**: Same user experience
- ✅ **Document Management**: Everything visible in `/documents`

**Ready for Go-Live! 🚀**