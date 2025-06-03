# Transaction Center - Document Management & Overview Hub

**Status**: ✅ LIVE & DEPLOYED | **URL**: /transactions

## Übersicht

Das Transaction Center ist ein **Document Management und Overview Hub**, das eine einheitliche Sicht auf alle Transaktionen und Dokumente im System bietet. Es ergänzt das Banking-Modul (für Reconciliation) um umfassende Übersichts- und Export-Funktionen.

### ✅ Implementierte Features
- ✅ **Zentrale Übersicht** über alle 179 Transaktionen (Sales, Expenses, Banking, Cash Movements)
- ✅ **Smart Search** mit Receipt Number & Description Pattern Recognition
- ✅ **Quick Filters** für häufige Abfragen (Heute, Diese Woche, Typ-Filter)
- ✅ **Custom Date Range** Picker für beliebige Zeiträume
- ✅ **PDF Status** Anzeige und Management
- ✅ **Performance optimiert** mit Database Views und Indexes

### Abgrenzung
- **Keine Reconciliation-Funktionen** (das bleibt im Banking-Modul)
- **Fokus auf Übersicht und Documents**, nicht auf Matching/Abgleich

---

## Bestehende Infrastruktur

### Belegnummern-System ✅ AKTIV
Das System verfügt bereits über ein ausgeklügeltes automatisches Belegnummern-System:

```
✅ VK2025000076  - Verkaufs-Belege (Sales)      - 37 Transaktionen
✅ AG2025000014  - Ausgaben-Belege (Expenses)   - 11 Transaktionen
✅ BT2025000089  - Bank-Transaktionen           - 103 Transaktionen  
✅ CM2025000028  - Kassen-Bewegungen            - 28 Transaktionen
TB2025001        - Tagesberichte (Daily Reports)
MB2025001        - Monatsberichte (Monthly Reports)
```

**✅ Live Features:**
- ✅ Automatische Generierung via Database Triggers
- ✅ Jahr-basierte Nummerierung (Reset jedes Jahr)
- ✅ Sequentiell, lückenlos
- ✅ Race Condition Protection
- ✅ 179 aktive Transaktionen im Transaction Center

### PDF-System ✅
- **ReceiptPDF**: Kunden-Belege für Sales
- **PlaceholderReceiptPDF**: Ausgaben-Belege  
- **MonthlyReportPDF**: Monatsberichte
- **Supabase Storage Integration**
- **Automatische PDF-Generierung**

---

## ✅ LIVE UI/UX Implementation

### 📊 Transaction Center @ `/transactions`

```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Transaction Center - Übersicht & Verwaltung             │
├─────────────────────────────────────────────────────────────┤
│ 📊 Stats: [179 Total] [61 Mit PDF] [118 Ohne PDF] [CHF XX] │
│                                                             │
│ ✅ Smart Search                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🔍] VK2025000076 oder "Haarschnitt" [Suchen] [Reset]  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ✅ Quick Filters                                            │
│ [Heute] [Diese Woche] [Dieser Monat] [Nur Verkäufe] [...] │
│ [Mit PDF] [Ohne PDF] [Unabgeglichen] [Custom Zeitraum ▼]  │
│                                                             │
│ ✅ Alle Transaktionen (179 gefunden)         [Filter] [Export]│
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Zeit  | Typ | Beleg-Nr.    | Beschreibung     | Betrag | 📄 │ │
│ │ 21:04 | VK  | VK2025000076 | Haarschnitt Damen| 65.00  | ✅ │ │
│ │ 20:19 | CM  | CM2025000028 | Owner Entnahme   |-153.00 | ❌ │ │
│ │ 12:44 | BT  | BT2025000086 | TWINT Gutschrift | 362.23 | ❌ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Unified Transactions Table (LIVE)

### ✅ Implemented Columns
| Spalte | Beschreibung | Live Beispiel |
|--------|-------------|---------------|
| **Zeit** | Zeitstempel (HH:MM + Datum) | 21:04, 20:19 |
| **Typ** | Type Badge (farbkodiert) | VK (grün), AG (rot), CM (orange), BT (blau) |
| **Beleg-Nr.** | Receipt Number (searchable) | VK2025000076, CM2025000028 |
| **Beschreibung** | Transaction Description | "Haarschnitt Damen", "Owner Entnahme" |
| **Betrag** | Amount (CHF, farbkodiert) | CHF 65.00 (grün), CHF -153.00 (rot) |
| **📄** | PDF Status (Business-aware) | ✅ verfügbar, ⚠️ fehlt, ➖ nicht nötig, 🔄 generiert |
| **🔄** | Transaction Status | ✅ completed, 🟡 pending/unmatched, ❌ cancelled |

### 🔍 Enhanced Search & Filter Features (LIVE)
- ✅ **Receipt Number Search**: `VK2025000076`, `AG2025`, `CM2025`, `BT2025`
- ✅ **Description Search**: `"Haarschnitt"`, `"Migros"`, `"Owner"`
- ✅ **Auto Pattern Recognition**: Erkennt automatisch Receipt vs Content
- ⭐ **NEW: Multi-Filter Combinations**: Zeit + Typ + Status gleichzeitig
- ✅ **Swiss Calendar**: Deutsche Sprache, Montag-Wochenstart
- ✅ **Performance**: < 100ms für Receipt Number Search

### ⭐ NEW: Direct PDF Actions
```
│ VK2025000123 | Haarschnitt | CHF 47.50 | 📄 ← Click to View  │
│ AG2025000008 | Migros Eink. | CHF 23.45 | ⚠️ ← Click to Generate│
│ CM2025000015 | Cash Transfer| CHF 200.00| ➖ ← No PDF needed   │
```

**Business-aware Logic:**
- **Sales/Expenses**: PDF verfügbar → Click öffnet PDF
- **Sales/Expenses**: PDF fehlt → Click generiert PDF  
- **Cash/Bank**: Kein PDF nötig → Icon nicht klickbar

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

### ⭐ Enhanced Quick Filters (Kombinierbar)
```
📅 Zeit (einer aktiv):     [Heute] [Diese Woche] [Dieser Monat] [Custom ▼]
📄 Typ (kombinierbar):     [Verkäufe] [Ausgaben]
📋 Status (kombinierbar):  [Mit PDF] [Ohne PDF] [Unabgeglichen]
```

**🇨🇭 Swiss Enhancements:**
- **Deutsche Sprache**: Calendar in Deutsch mit Montag-Wochenstart
- **Swiss Date Format**: dd.mm.yyyy durchgängig  
- **Kompaktes Design**: Schlanke Filter ohne Titel, gruppiert mit Trennlinien

**Business Examples:**
- `"Dieser Monat" + "Verkäufe"` = VK Transaktionen im Januar
- `"Verkäufe" + "Ohne PDF"` = VK ohne PDF finden  
- `"Diese Woche" + "Verkäufe" + "Mit PDF"` = Vollständige Kombination

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