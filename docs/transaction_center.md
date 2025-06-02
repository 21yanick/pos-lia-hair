# Transaction Center - Document Management & Overview Hub

## Übersicht

Das Transaction Center ist ein **Document Management und Overview Hub**, das eine einheitliche Sicht auf alle Transaktionen und Dokumente im System bietet. Es ergänzt das Banking-Modul (für Reconciliation) um umfassende Übersichts- und Export-Funktionen.

### Zweck
- **Zentrale Übersicht** über alle Transaktionen (Sales, Expenses, Banking, Cash Movements)
- **Document Management** mit Fokus auf Belegnummern und PDF-Verwaltung
- **Bulk Operations** für Export und PDF-Management
- **Advanced Search** mit flexiblen Filtermöglichkeiten

### Abgrenzung
- **Keine Reconciliation-Funktionen** (das bleibt im Banking-Modul)
- **Fokus auf Übersicht und Documents**, nicht auf Matching/Abgleich

---

## Bestehende Infrastruktur

### Belegnummern-System ✅
Das System verfügt bereits über ein ausgeklügeltes automatisches Belegnummern-System:

```
VK2025000001  - Verkaufs-Belege (Sales)
AG2025000001  - Ausgaben-Belege (Expenses)  
TB2025001     - Tagesberichte (Daily Reports)
MB2025001     - Monatsberichte (Monthly Reports)
BT2025000001  - Bank-Transaktionen
CM2025000001  - Kassen-Bewegungen (Cash Movements)
```

**Features:**
- Automatische Generierung via Database Triggers
- Jahr-basierte Nummerierung (Reset jedes Jahr)
- Sequentiell, lückenlos
- Race Condition Protection
- 238+ bestehende Belege bereits migriert

### PDF-System ✅
- **ReceiptPDF**: Kunden-Belege für Sales
- **PlaceholderReceiptPDF**: Ausgaben-Belege  
- **MonthlyReportPDF**: Monatsberichte
- **Supabase Storage Integration**
- **Automatische PDF-Generierung**

---

## UI/UX Konzept

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Transaction Center - Übersicht & Dokumente              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔍 Smart Search                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🔍] VK2025000123 oder "Haarschnitt" oder CHF 47.50    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📅 Quick Filters                                           │
│ [Heute] [Diese Woche] [Dieser Monat] [Custom Range...]     │
│ [Alle Typen ▼] [Mit PDF ▼] [Betrag: Alle ▼]                │
│                                                             │
│ 📋 Alle Transaktionen                     [⬇️ Export] [📱 Bulk]│
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☑️ | Zeit  | Typ | Beleg-Nr.    | Beschreibung | Betrag | 📄 │ │
│ │ ☑️ | 15:30 | VK  | VK2025000123 | Haarschnitt  | 47.50  | 📄 │ │
│ │ ☑️ | 15:25 | VK  | VK2025000122 | Waschen+Föhn | 28.00  | 📄 │ │
│ │ ☐ | 14:20 | AG  | AG2025000045 | Shampoo Wella| -15.50 | ❌ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Haupttabelle: Unified Transactions

### Spalten
| Spalte | Beschreibung | Beispiel |
|--------|-------------|----------|
| **☑️** | Multi-Select Checkbox | - |
| **Zeit** | Zeitstempel | 15:30 |
| **Typ** | Transaction Type Badge | VK, AG, BT, CM, TB, MB |
| **Beleg-Nr.** | Receipt Number (klickbar) | VK2025000123 |
| **Beschreibung** | Transaction Description | "Haarschnitt", "Shampoo Wella" |
| **Betrag** | Amount (farbkodiert) | CHF 47.50, CHF -15.50 |
| **📄** | PDF Status | 📄 (vorhanden), ❌ (fehlt) |

### Row Actions
```
│ VK2025000123 | Haarschnitt | 47.50 | [👁️] [📄] [🔄] │
                                      View  PDF  Regen
```

### Transaction Types
- **VK** - Verkäufe (Sales) - Grün
- **AG** - Ausgaben (Expenses) - Rot  
- **BT** - Bank Transaktionen - Blau
- **CM** - Kassen-Bewegungen - Orange
- **TB** - Tagesberichte - Violett
- **MB** - Monatsberichte - Grau

---

## Search & Filter System

### Smart Search
```typescript
interface SearchQuery {
  // Beleg-Nummer search
  receiptNumber?: string;     // "VK2025000123"
  
  // Content search  
  description?: string;       // "Haarschnitt", "Wella"
  
  // Amount search
  amountFrom?: number;        // CHF 20.00
  amountTo?: number;          // CHF 100.00
  exactAmount?: number;       // CHF 47.50
  
  // Date search
  dateFrom?: Date;
  dateTo?: Date;
  
  // Document status
  hasPdf?: boolean;           // true/false/undefined
  documentType?: string[];    // ['receipt', 'expense_receipt']
  
  // Payment method
  paymentMethod?: string[];   // ['cash', 'twint', 'sumup']
}
```

### Quick Filters
- **Zeitraum**: Heute, Diese Woche, Dieser Monat, Custom Range
- **Typ**: Alle Typen, VK, AG, BT, CM, TB, MB
- **PDF Status**: Alle, Mit PDF, Ohne PDF
- **Betrag**: Alle, Custom Range

### Advanced Filter Panel
```
┌─────────────────────────────────────────────────────────────┐
│ 🎛️ Advanced Filters                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📅 Zeitraum:                                               │
│ [📅 Von: 01.01.2025] [📅 Bis: 31.01.2025] [⚡ Preset ▼]   │
│                                                             │
│ 💰 Betrag:                                                  │
│ [💰 Von: CHF ___] [💰 Bis: CHF ___] [💰 Exakt: CHF ___]    │
│                                                             │
│ 📄 Beleg-Typ:                                               │
│ ☑️ Verkäufe (VK)   ☑️ Ausgaben (AG)   ☑️ Tagesberichte    │ 
│ ☑️ Bank (BT)       ☑️ Kasse (CM)      ☑️ Monatsberichte   │
│                                                             │
│ 💳 Zahlungsart:                                             │
│ ☑️ Bargeld   ☑️ TWINT   ☑️ SumUp   ☑️ Bank                 │
│                                                             │
│ 📄 PDF Status:                                              │
│ ☐ Nur mit PDF   ☐ Nur ohne PDF   ☑️ Alle anzeigen          │
│                                                             │
│ [🔍 Filter anwenden] [🚫 Zurücksetzen] [💾 Als Preset speichern]│
└─────────────────────────────────────────────────────────────┘
```

---

## Bulk Operations

### Interface
```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Bulk Operations (5 selected)                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📄 Download PDFs                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [📦 ZIP Download] - Alle 5 PDFs als .zip               │ │
│ │ [🔄 Regenerate Missing] - Fehlende PDFs erstellen      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📊 Export Data                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [📄 CSV Export] - Für Excel/Buchhaltung                │ │
│ │ [📊 Excel Report] - Formatierte Übersicht              │ │
│ │ [📋 Print List] - Druckbare Liste                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🔧 Utilities                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🏷️ Add Tags] - Kategorien hinzufügen                  │ │
│ │ [📝 Bulk Notes] - Notizen für Buchhaltung              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Features
- **ZIP Download**: Mehrere PDFs als ZIP-Archiv
- **PDF Regeneration**: Fehlende PDFs nachträglich erstellen
- **CSV Export**: Transaction-Daten für Excel/Buchhaltung
- **Excel Report**: Formatierte Übersicht mit Styling
- **Print List**: Browser-optimierte Druckliste

---

## Document Status Management

### Missing PDF Detection
```
📄 Dokument Status                                         
✅ 226 Belege haben PDFs (95.0%)                           
❌ 12 Belege ohne PDF (5.0%)                               
🔄 3 PDFs werden regeneriert...                            

📊 Fehlende PDFs nach Typ:                                 
• 8x Sales (VK) - [🔄 Alle regenerieren]                  
• 3x Expenses (AG) - [🔄 Alle regenerieren]               
• 1x Cash Movement (CM) - [🔄 Alle regenerieren]          

💾 Storage: 2.1 GB / 10 GB verwendet (21%)                 
```

### PDF Status Indicators
- **📄** - PDF vorhanden und verfügbar
- **❌** - PDF fehlt (kann regeneriert werden)
- **🔄** - PDF wird gerade erstellt
- **⚠️** - PDF fehlerhaft (erneute Generierung nötig)

---

## Implementation Plan

### Phase 1: Basic Transaction Center
- [ ] **Unified Transactions View** - Alle Transaction-Typen in einer Tabelle
- [ ] **Basic Search** - Receipt Number und Description Search
- [ ] **Simple Filters** - Datum, Typ, PDF Status
- [ ] **Individual Actions** - View, Download PDF, Regenerate

### Phase 2: Bulk Operations  
- [ ] **Multi-Select** - Checkbox-System für Bulk-Auswahl
- [ ] **ZIP Downloads** - Mehrere PDFs als ZIP
- [ ] **CSV Export** - Gefilterte Daten exportieren
- [ ] **PDF Regeneration** - Bulk-PDF-Erstellung

### Phase 3: Advanced Features
- [ ] **Advanced Search/Filters** - Amount ranges, Complex queries
- [ ] **Filter Presets** - Gespeicherte Filter-Kombinationen
- [ ] **Document Management** - Storage-Übersicht, Cleanup
- [ ] **Performance Optimization** - Virtualized table, Pagination

---

## Technical Architecture

### Module Structure
```
src/modules/transactions/
├── components/
│   ├── TransactionCenterPage.tsx       # Main page component
│   ├── UnifiedTransactionsTable.tsx    # Main transactions table
│   ├── TransactionFilters.tsx          # Filter panel
│   ├── BulkOperationsPanel.tsx         # Bulk actions interface
│   ├── SearchBar.tsx                   # Smart search component
│   └── DocumentStatusPanel.tsx         # PDF status overview
├── hooks/
│   ├── useUnifiedTransactions.ts       # Main data hook
│   ├── useTransactionFilters.ts        # Filter logic
│   ├── useBulkOperations.ts            # Bulk actions logic
│   └── useDocumentStatus.ts            # PDF status management
├── services/
│   ├── transactionAggregator.ts        # Combines all transaction types
│   ├── transactionExporter.ts          # Export functionality
│   └── documentManager.ts              # PDF operations
└── types/
    ├── unifiedTransactions.ts          # Type definitions
    └── filters.ts                      # Filter types
```

### Database Integration
- **Existing Tables**: Nutzt bestehende sales, expenses, cash_movements, etc.
- **Unified View**: Optional - Erstelle Database View für Performance
- **No Schema Changes**: Keine Änderungen an bestehender Struktur nötig

---

## Success Metrics

### User Experience
- **Schnelle Suche**: Receipt Number in < 1 Sekunde finden
- **Bulk Operations**: 50+ PDFs in < 30 Sekunden herunterladen
- **Filter Performance**: Complex filters in < 2 Sekunden

### Business Value  
- **Document Coverage**: 100% aller Transactions haben PDFs
- **Export Efficiency**: CSV Export für Buchhaltung in < 10 Sekunden
- **Storage Management**: Übersicht über Document Storage Usage

### Technical Goals
- **Performance**: Table mit 1000+ Einträgen flüssig
- **Scalability**: System wächst mit Business mit
- **Maintainability**: Clean, testbare Module-Struktur