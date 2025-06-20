# 🏦 Banking Module Development - Living Document

**Erstellt**: 06.01.2025  
**Status**: ✅ **PHASE 1-4 COMPLETE** - DB + Types + UI + Cash Transfers + File Import ✅ **PRODUCTION READY**  
**Ziel**: Banking Module als 7. Modul implementieren mit 2-Tab Click-to-Connect UX

---

## 📋 Executive Summary

Das Banking Module implementiert ein **kontinuierliches Abgleich-System** basierend auf Swiss Banking Standards. Es ersetzt zeitbasierte Tagesabschlüsse durch einen modernen **Provider-Bank-Abgleich-Workflow** mit Click-to-Connect UX.

**Status**: ✅ **PRODUCTION READY** - Vollständig funktionales Banking Module mit Cash Transfer Integration, konsistenter Cash Balance Berechnung, professioneller UX für Swiss Banking Standards und kompletter CAMT.053 XML Import Funktionalität.

### 🎯 Core Vision
- **2-Tab Interface**: Provider-Abgleich + Bank-Abgleich
- **Click-to-Connect**: Drag & Drop oder Click-basierte Zuordnung
- **Live Status**: Offene Posten in Echtzeit
- **Swiss Compliance**: TWINT/SumUp/Raiffeisen Integration

---

## 🏗️ Technische Architektur

### **Module Structure**
```
src/modules/banking/
├── components/
│   ├── BankingPage.tsx              # Main Banking Dashboard
│   ├── ProviderReconciliation.tsx   # Tab 1: Provider-Abgleich
│   ├── BankReconciliation.tsx       # Tab 2: Bank-Abgleich
│   ├── TransactionTable.tsx         # TanStack Table Implementation
│   ├── MatchingInterface.tsx        # Drag & Drop Matching UI
│   ├── StatusOverview.tsx           # Live Status Dashboard
│   ├── FileImport.tsx               # CSV/XML Upload Interface
│   └── CashTransferDialog.tsx       # Cash-Bank Transfer UI
├── hooks/
│   ├── useBankingState.ts           # Banking Module State Management
│   ├── useTransactionMatching.ts    # Matching Logic & Algorithms
│   └── useProviderImport.ts         # Provider File Processing
├── services/
│   ├── bankingApi.ts                # Banking API Calls
│   └── matchingAlgorithms.ts        # Confidence-based Matching
├── types/
│   └── banking.ts                   # Banking-specific Types
└── index.ts                         # Public API
```

### **Database Schema Extensions**
```sql
-- New Tables for Banking Module
CREATE TABLE provider_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL, -- 'twint', 'sumup'
  file_name VARCHAR(255) NOT NULL,
  import_date TIMESTAMPTZ DEFAULT NOW(),
  gross_amount DECIMAL(10,2) NOT NULL,
  fees DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  provider_reference_id VARCHAR(100),
  settlement_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'matched', 'discrepancy'
  sale_id UUID REFERENCES sales(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name VARCHAR(50) NOT NULL, -- 'raiffeisen', 'ubs', etc.
  transaction_date DATE NOT NULL,
  booking_date DATE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference VARCHAR(255),
  iban VARCHAR(34),
  file_name VARCHAR(255),
  import_date TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'unmatched', -- 'unmatched', 'matched', 'ignored'
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Transaction Matching Table (Many-to-Many)
CREATE TABLE transaction_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id UUID REFERENCES bank_transactions(id),
  reference_type VARCHAR(20) NOT NULL, -- 'sale', 'expense', 'provider_report', 'cash_movement'
  reference_id UUID NOT NULL,
  match_confidence DECIMAL(3,2), -- 0.00 to 1.00
  match_type VARCHAR(20) DEFAULT 'automatic', -- 'automatic', 'manual'
  matched_amount DECIMAL(10,2) NOT NULL,
  matched_by UUID REFERENCES auth.users(id),
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Extension of existing tables
ALTER TABLE sales ADD COLUMN provider_report_id UUID REFERENCES provider_reports(id);
ALTER TABLE sales ADD COLUMN bank_transaction_id UUID REFERENCES bank_transactions(id);
ALTER TABLE expenses ADD COLUMN bank_transaction_id UUID REFERENCES bank_transactions(id);
```

---

## 🎨 UI/UX Design Patterns

### **1. Two-Tab Layout Design**
Basierend auf Web Research zu React Banking UIs und Swiss Banking Patterns:

```typescript
// Main Banking Interface Structure
interface BankingTabStructure {
  tabs: [
    {
      id: 'provider-reconciliation',
      title: 'Provider-Abgleich',
      description: 'TWINT/SumUp ↔ POS Verkäufe',
      leftPanel: 'Interne POS Verkäufe',
      rightPanel: 'Provider Reports (CSV)',
      action: 'Click-to-Connect'
    },
    {
      id: 'bank-reconciliation', 
      title: 'Bank-Abgleich',
      description: 'Bank ↔ Alle Transaktionen',
      leftPanel: 'Bank Transaktionen',
      rightPanel: 'Reconcilierte Sales + Expenses',
      action: 'Multi-Select Matching'
    }
  ]
}
```

### **2. TanStack Table Implementation**
Basierend auf Research zu Financial Data Table Libraries:

```typescript
// TransactionTable.tsx - Using TanStack Table
import { useReactTable, getCoreRowModel, getFilteredRowModel } from '@tanstack/react-table'

interface TransactionTableProps {
  data: Transaction[]
  columns: ColumnDef<Transaction>[]
  onSelect: (transaction: Transaction) => void
  selectedItems: string[]
  selectionMode: 'single' | 'multi'
  enableClickToConnect: boolean
}

// Key Features:
// - Row Selection (Single/Multi) 
// - Click-to-Connect Selection
// - Real-time Status Updates
// - Confidence-based Matching Indicators
// - Pagination for Large Datasets
```

### **3. Click-to-Connect UX Pattern**
```typescript
// Matching Interface States
type MatchingState = 
  | 'idle'           // Default state
  | 'selecting'      // User clicked first item
  | 'confirming'     // User clicked second item, show confidence
  | 'matched'        // Successfully matched
  | 'error'          // Matching failed

// Visual Feedback:
// - Hover Effects on Compatible Items
// - Confidence Indicators (High/Medium/Low)
// - Color-coded Status (Matched/Pending/Error)
// - Progress Indicators during Processing
```

---

## 🔄 Integration mit bestehender Infrastruktur

### **Existing Banking Infrastructure (READY)**
Aus der Analyse der bestehenden Codebase:

```typescript
// ✅ Already Available in shared/hooks/business/
useBankReconciliation.ts    // 70%+ Confidence Matching
useSettlementImport.ts      // TWINT/SumUp CSV Processing
useDailySummaries.ts        // Summary Calculations

// ✅ Already Available in shared/services/
settlementImport.ts         // File Parsers (TWINT, SumUp, Raiffeisen)
importValidation.ts         // Data Validation Logic

// ✅ Already Available in shared/utils/
csvParser.ts                // CSV Processing Utilities
dateUtils.ts                // Date Formatting & Validation
```

### **Migration Strategy von Settings Module**
Das Settlement Import wird von Settings zu Banking migriert:

```typescript
// FROM: src/modules/settings/components/import/
// TO: src/modules/banking/components/

// Files to Migrate:
- SettlementTestDataGenerator.tsx → banking/components/TestDataGenerator.tsx
- Settlement CSV Import Logic → banking/hooks/useProviderImport.ts

// Update Navigation:
- Remove Settlement Import from Settings sidebar
- Add Banking Module to main navigation
```

---

## 🚀 Development Phases

### **Phase 1: Database & Infrastructure** ✅ **COMPLETE**
- [x] **Database Migration**: Banking tables erstellt (`06_banking_system_rebuild.sql`)
- [x] **Core Types**: Banking TypeScript definitions (`src/modules/banking/types/banking.ts`)
- [x] **Legacy Cleanup**: Alte `bank_reconciliation_*` tables entfernt
- [x] **Module Structure**: Grundgerüst `src/modules/banking/` vorhanden
- [x] **API Layer**: Banking API Services (`src/modules/banking/services/bankingApi.ts`)
- [x] **Real Data Connection**: Mock data ersetzt durch echte DB Views
- [x] **Permissions Fix**: RLS Policies für Banking Views konfiguriert

### **Phase 2: Core UI & Data Integration** ✅ **COMPLETE**
- [x] **Banking Hook**: Real-time data fetching (`src/modules/banking/hooks/useBankingData.ts`)
- [x] **Banking Page**: Complete 2-Tab UI with real DB connection
- [x] **Click-to-Connect**: Functional selection & matching logic
- [x] **Loading States**: Professional skeleton UI during data fetch
- [x] **Error Handling**: User-friendly error display with retry functionality
- [x] **Stats Dashboard**: Live banking statistics from real data

### **Phase 3: Schema Enhancement - Cash Movement Types** ✅ **COMPLETE**
- [x] **Schema Update**: `movement_type` column zu Cash Movements hinzugefügt (cash_operation vs bank_transfer)
- [x] **View Correction**: `available_for_bank_matching` nur bank_transfer Cash Movements anzeigen
- [x] **Type Updates**: TypeScript types für movement_type erweitert
- [x] **Cash Transfer Buttons**: Banking UI mit "Geld in Bank einzahlen/abheben" Buttons
- [x] **Cash Balance Fix**: Konsistente Berechnung zwischen Banking und Cash Register
- [x] **Dark Mode**: UI-Komponenten dark mode kompatibel

### **Phase 4: File Import & Processing** ✅ **COMPLETE**
- [x] **Database Constraints**: Migration 11 - AcctSvcrRef uniqueness constraints
- [x] **Bank Import UI**: Raiffeisen CAMT.053 XML Upload Interface mit 3-Step Dialog
- [x] **CAMT.053 Parser**: Vollständiger XML Parser für Swiss Banking Standard
- [x] **File Processors**: XML parsers mit 3-Level Duplicate Detection (File/Record/Preview)
- [x] **Import Validation**: Comprehensive Error Handling + User Feedback
- [x] **TypeScript Integration**: Alle Types und API Services implementiert
- [x] **UI Integration**: Bank Import Button in Banking Page Header

### **Phase 4.5: UX Enhancement** ✅ **COMPLETE**
- [x] **Tab 1 Visual Feedback**: Click-to-Connect mit border-left indicators und smooth transitions
- [x] **Tab 2 Checkbox System**: Multi-Select mit Checkbox-Interface für bessere UX
- [x] **Consistent Hover States**: Einheitliche Hover-Effects in allen Banking Tables
- [x] **Accessibility**: Proper aria-labels für Checkboxes und Screen Reader Support

### **Phase 5: Provider Import System** ✅ **COMPLETE**
- [x] **TWINT CSV Parser**: Auto-detection und German format parsing (semicolon, quotes)
- [x] **SumUp CSV Parser**: Standard comma-separated format mit transaction filtering
- [x] **Provider Auto-Detection**: Confidence-based format detection zwischen TWINT und SumUp
- [x] **3-Step Import Dialog**: Upload → Preview → Confirm mit comprehensive error handling
- [x] **Duplicate Protection**: File-level, record-level und preview-level detection
- [x] **Database Integration**: provider_import_sessions table mit RLS policies
- [x] **UI Integration**: Import Button in Tab 1 mit real-time data refresh
- [x] **TWINT Parser Fixes**: Header names ("Überweisung am"), BOM character handling
- [x] **Production Testing**: Successfully tested mit echten TWINT/SumUp CSV files

### **Phase 6: Real Data Testing & Validation** ✅ **COMPLETE** 
- [x] **Real CSV Testing**: Vollständige Tests mit allen TWINT/SumUp Example Files - WORKING
- [x] **TWINT Format Variations**: Analyzed all 7 TWINT files - consistent format confirmed
- [x] **Parser Robustness**: BOM handling, German dates, decimal parsing verified
- [x] **Real-time Updates**: Provider match → automatic Tab 2 refresh implemented

### **Phase 7: UX Enhancements & Polish** ✅ **COMPLETE**
- [x] **Bank Balance Display**: Prominente Balance Card mit live calculation
- [x] **Deutsche UI Labels**: Alle Banking-Begriffe benutzerfreundlich auf Deutsch
- [x] **Provider Badges**: Color-coded SumUp/TWINT/Cash/Ausgabe identification
- [x] **Button Consistency**: Bank Import Button von Header zu Tab 2 verschoben  
- [x] **Stats Cleanup**: Redundante Unmatched Cards entfernt für cleaner UI
- [x] **TypeScript Robustness**: Real-time tab updates ohne Manual refresh

### **Phase 8: Advanced Features & Future Enhancements**
- [ ] **Automatic Matching**: Confidence-based Suggestions für Provider/Bank Matches  
- [ ] **Smart Matching**: Amount + Date + Payment Method correlation algorithms
- [ ] **Match History Tab**: View all completed matches with undo functionality
- [ ] **Advanced Filters**: Search by amount, date, provider, status
- [ ] **Batch Processing**: Bulk Import Optimization für multiple files
- [ ] **Swiss Compliance**: Advanced TWINT/SumUp edge cases handling
- [ ] **Performance**: Large dataset optimization für 1000+ Transaktionen
- [ ] **Export Functions**: Matched/Unmatched reports für Buchhaltung

---

## 🎯 Key Technical Decisions

### **1. State Management Strategy**
```typescript
// useBankingState.ts - Central Banking State
interface BankingState {
  activeTab: 'provider' | 'bank'
  providerReports: ProviderReport[]
  bankTransactions: BankTransaction[]
  unmatchedSales: Sale[]
  unmatchedExpenses: Expense[]
  selectedItems: {
    provider: string[]
    bank: string[]
  }
  matchingMode: 'single' | 'multi'
  filters: {
    dateRange: [Date, Date]
    provider?: 'twint' | 'sumup'
    status?: 'matched' | 'unmatched'
  }
}
```

### **2. Table Library Choice: TanStack Table**
Basierend auf Web Research - beste Option für Financial Data:
- **Headless Design**: 100% UI control
- **Performance**: Virtualization für große Datasets
- **Selection**: Single/Multi-row selection mit Click-to-Connect
- **Row States**: Visual feedback für selected/matched/pending items
- **Filtering**: Advanced filter UIs
- **Sorting**: Multi-column sorting

### **3. File Processing Architecture**
```typescript
// Provider File Import Flow
CSV Upload → Parser → Validation → Database → UI Update

// Supported Formats:
- TWINT: CSV mit German locale support
- SumUp: Transaction Reports CSV
- Raiffeisen: CAMT.053 XML + CSV fallback
```

### **4. Matching Algorithm Confidence**
```typescript
interface MatchConfidence {
  score: number        // 0.0 - 1.0
  factors: {
    amount: number     // Exact/Close amount match
    date: number       // Date proximity 
    reference: number  // Reference string similarity
    frequency: number  // Pattern recognition
  }
  threshold: {
    auto: 0.85         // Auto-match threshold
    suggest: 0.60      // Suggest match threshold
    manual: 0.30       // Show as possible match
  }
}
```

---

## 📊 Success Metrics & Validation

### **Functional Requirements**
- [ ] **Provider Import**: TWINT/SumUp CSV files successfully processed
- [ ] **Bank Import**: Raiffeisen CAMT.053 XML + CSV support
- [ ] **Matching Accuracy**: >85% automatic matching confidence
- [ ] **Multi-Select**: Batch payments (1 Bank ↔ N Sales) working
- [ ] **Cash Integration**: Cash-Bank transfers create proper entries
- [ ] **Real-time Status**: Live update of open items count

### **Performance Requirements**  
- [ ] **Large Datasets**: Handle >1000 transactions without lag
- [ ] **File Upload**: Process CSV files <30MB in <5 seconds
- [ ] **Virtualization**: Table renders smoothly with 500+ rows
- [ ] **Memory Usage**: Efficient state management, no memory leaks

### **UX Requirements**
- [ ] **Intuitive Matching**: Click-to-connect feels natural
- [ ] **Error Feedback**: Clear error messages for failed matches
- [ ] **Visual Confidence**: Matching confidence clearly indicated
- [ ] **Undo/Redo**: Ability to unmatch incorrectly matched items
- [ ] **Responsive**: Works on tablet/mobile for field use

---

## 🔍 Technical Research Insights

### **React Banking UI Patterns**
Web Research ergab folgende Best Practices:
- **Compound Components Pattern** für komplexe Banking UIs
- **Container/Presentation Separation** für Business Logic
- **React Reconciliation** optimization für real-time updates
- **Unique Keys** für dynamische Transaction Lists

### **Swiss Banking Integration**
- **TWINT**: >5M users (50%+ Swiss population), 386M transactions/year
- **SumUp**: Debitoor automatic reconciliation patterns
- **CSV Export**: Standard in Swiss Fintech (neon, TWINT, SumUp)
- **CAMT.053**: XML standard für Swiss banks (Raiffeisen, UBS)

### **Financial Data Table Libraries**
- **TanStack Table**: Best-in-class für Financial Dashboards
- **Material-UI Integration**: Available für Swiss bank aesthetics
- **Row Selection**: Multi-row selection für batch matching
- **Virtualization**: Essential für large Swiss bank statements

---

## ✅ **CURRENT STATUS UPDATE**

### **Was bereits funktioniert (Januar 2025) - LIVE STATUS:**
- **Database Schema**: ✅ Neue Banking-Tabellen sind live in Supabase
- **TypeScript Types**: ✅ Vollständige Type-Definitionen für alle Banking-Tabellen
- **UI Views**: ✅ 4 optimierte Views für die 2-Tab UI:
  ```sql
  - unmatched_provider_reports      -- Tab 1 rechts ✅ LIVE
  - unmatched_sales_for_provider    -- Tab 1 links  ✅ LIVE
  - unmatched_bank_transactions     -- Tab 2 links  ✅ LIVE
  - available_for_bank_matching     -- Tab 2 rechts ✅ LIVE
  ```
- **Banking Page**: ✅ Vollständige 2-Tab UI mit echten DB-Daten
- **Design System**: ✅ Konsistente Farben (accent, success, destructive)
- **API Services**: ✅ Complete Banking API Layer
- **React Hooks**: ✅ Real-time data management
- **Click-to-Connect**: ✅ Functional selection & matching
- **Error Handling**: ✅ Professional error states & retry

### **Banking Module ist PRODUCTION-READY für:**
1. ✅ **Provider Matching**: Sale ↔ Provider Report zuordnen
2. ✅ **Bank Matching**: Bank Transaction ↔ Multiple Items zuordnen
3. ✅ **Live Stats**: Real-time unmatched counts & progress
4. ✅ **Professional UX**: Loading states, error handling, empty states

### **Was als nächstes implementiert werden kann:**
1. **Sidebar Navigation** Banking Module zur Hauptnavigation hinzufügen
2. **Real Data Testing** mit allen echten Files aus `docs/twint_sumup_banking_examples/`
3. **Automatic Matching** confidence-based suggestions implementieren
4. **Performance Optimization** für große CSV Files und bulk operations

## 🛠️ Implementation Examples

### **Provider Reconciliation Tab**
```typescript
// ProviderReconciliation.tsx
export function ProviderReconciliation() {
  const { posData, providerData, matchTransaction } = useBankingState()
  
  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* Left Panel - POS Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Interne POS Verkäufe</CardTitle>
          <p className="text-sm text-muted-foreground">
            Unmatched: {posData.filter(s => !s.provider_report_id).length}
          </p>
        </CardHeader>
        <CardContent>
          <TransactionTable
            data={posData}
            onSelect={handlePOSSelect}
            selectedItems={selectedPOS}
            selectionMode="single"
            columns={posColumns}
            enableClickToConnect={true}
          />
        </CardContent>
      </Card>

      {/* Right Panel - Provider Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Reports</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">TWINT</Badge>
            <Badge variant="outline">SumUp</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionTable
            data={providerData}
            onSelect={handleProviderSelect}
            selectedItems={selectedProvider}
            selectionMode="single"
            columns={providerColumns}
            enableClickToConnect={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

### **Matching Interface with Confidence**
```typescript
// MatchingInterface.tsx
interface MatchSuggestion {
  sale: Sale
  providerReport: ProviderReport
  confidence: number
  reasons: string[]
}

export function MatchingInterface({ suggestions }: { suggestions: MatchSuggestion[] }) {
  return (
    <div className="space-y-4">
      {suggestions.map(suggestion => (
        <Card key={`${suggestion.sale.id}-${suggestion.providerReport.id}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">
                  POS Sale: {suggestion.sale.total_amount} CHF
                </p>
                <p className="text-sm text-muted-foreground">
                  Provider: {suggestion.providerReport.gross_amount} CHF
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge 
                  variant={suggestion.confidence > 0.85 ? "default" : "secondary"}
                >
                  {Math.round(suggestion.confidence * 100)}% Match
                </Badge>
                
                <Button 
                  size="sm"
                  onClick={() => handleMatch(suggestion)}
                >
                  Connect
                </Button>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              {suggestion.reasons.join(" • ")}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## 📋 Next Actions

### **COMPLETED ✅**
1. **Database Migration**: ✅ Banking tables created (`06_banking_system_rebuild.sql`)
2. **Module Setup**: ✅ `src/modules/banking/` structure initialized
3. **Type Definitions**: ✅ Banking TypeScript types (`types/supabase.ts` + `banking.ts`)
4. **Legacy Cleanup**: ✅ Old `bank_reconciliation_*` code moved to backup
5. **Real Data Connection**: ✅ Banking Page mit echten DB Views verbunden
6. **API Layer**: ✅ Complete Banking API Services (`bankingApi.ts`)
7. **Banking Hook**: ✅ React state management (`useBankingData.ts`)
8. **UI Implementation**: ✅ 2-Tab interface mit Click-to-Connect
9. **Error Handling**: ✅ Comprehensive error states & retry functionality
10. **Permissions**: ✅ RLS policies für Banking Views konfiguriert

### **LIVE & FUNCTIONAL 🚀**
- ✅ **Banking Page**: `/banking` route funktional
- ✅ **Tab 1 (Provider)**: Shows unmatched sales ↔ provider reports
- ✅ **Tab 2 (Bank)**: Shows bank transactions ↔ available items
- ✅ **Click-to-Connect**: Selection & matching logic implemented
- ✅ **Live Stats**: Real-time dashboard metrics
- ✅ **Loading States**: Professional skeleton UI
- ✅ **Empty States**: Clean "no data found" displays

### **NEXT UP 📋 - PHASE 6 REAL DATA TESTING**

**Testing Tasks (Ready for Implementation):**
1. **Real XML Import**: Testen mit echten Raiffeisen CAMT.053 Files
2. **Real CSV Import**: Vollständige Tests mit TWINT/SumUp Example Files
3. **Duplicate Detection**: Edge cases mit realen Daten validieren
4. **Error Scenarios**: Invalid files, missing fields, malformed data
5. **Performance Testing**: Large files (>100 transactions)
6. **UI/UX Optimization**: User Experience mit echten Import-Workflows

**Advanced Features (Future):**
7. **Smart Matching**: Automatic correlation zwischen POS Sales und Provider Reports
8. **Confidence Scoring**: Matching algorithms mit threshold configuration
9. **Bulk Operations**: Multi-file import and batch processing

**Implementation Ready:**
- ✅ **Database Schema**: Migration 11 applied, constraints active
- ✅ **CAMT.053 Parser**: ISO 20022 standard compliant
- ✅ **Import UI**: 3-Step Dialog (Upload → Preview → Confirm)
- ✅ **Error Handling**: Comprehensive validation + user feedback
- ✅ **TypeScript**: All types resolved, compilation ready

### **✅ COMPLETED ARCHITECTURE ENHANCEMENT:**
**Problem gelöst**: Cash System Konsistenz und Banking Integration + Real-time Updates

**Implementierte Lösung**:
- `movement_type` unterscheidet zwischen:
  - `cash_operation`: Normale Kassen-Operationen (POS Sales, Expenses)
  - `bank_transfer`: Kasse-Bank-Transfers (erscheinen in Banking Tab 2)
- Konsistente positive Amount-Storage mit korrekter Balance-Berechnung
- Cash Transfer Buttons mit Live-Kassenbestand-Anzeige
- **Real-time Tab Updates**: Provider-Match in Tab 1 → sofort sichtbar in Tab 2
- **TypeScript Robustness**: Alle Banking Hook Type-Errors resolved

---

## 📂 **FILE IMPORT SYSTEM - IMPLEMENTATION GUIDE**

### **Database Schema Enhancements:**

**1. Add Duplicate Prevention Constraints:**
```sql
-- Migration: 11_add_provider_constraints.sql
ALTER TABLE provider_reports 
ADD CONSTRAINT unique_provider_transaction 
UNIQUE (provider, provider_transaction_id, transaction_date, gross_amount);

-- Add indexes for performance
CREATE INDEX idx_provider_reports_transaction_id ON provider_reports(provider_transaction_id);
CREATE INDEX idx_provider_reports_import_filename ON provider_reports(import_filename);
```

### **File Import Flow Architecture:**

**Step 1: File Upload Component**
```typescript
// src/modules/banking/components/FileImportDialog.tsx
interface FileImportProps {
  provider: 'twint' | 'sumup' | 'bank'
  onSuccess: (result: ImportResult) => void
}

// Upload → Parse → Preview → Confirm → Import
```

**Step 2: CSV Parser Services**
```typescript
// src/modules/banking/services/csvParsers.ts
export interface TWINTCsvRow {
  'Transaktions-ID': string           // provider_transaction_id
  'Transaktionsdatum': string        // transaction_date
  'Betrag Transaktion': string       // gross_amount
  'Transaktionsgebühr': string       // fees
  'Gutgeschriebener Betrag': string  // net_amount
  // ... more fields
}

export interface SumUpCsvRow {
  'Transaktions-ID': string    // provider_transaction_id
  'Datum': string             // transaction_date  
  'Betrag inkl. MwSt.': string // gross_amount
  'Gebühr': string            // fees
  'Auszahlung': string        // net_amount
  // ... more fields
}
```

**Step 3: Duplicate Detection Logic**
```typescript
// src/modules/banking/services/duplicateDetection.ts
export interface DuplicateCheckResult {
  totalRecords: number
  newRecords: ParsedRecord[]
  duplicates: DuplicateRecord[]
  errors: ErrorRecord[]
  fileAlreadyImported: boolean
}

export async function checkDuplicates(
  records: ParsedRecord[], 
  filename: string
): Promise<DuplicateCheckResult> {
  // 1. File-level check
  const fileExists = await checkFileImported(filename)
  
  // 2. Record-level check
  const duplicates = await checkRecordDuplicates(records)
  
  return { /* results */ }
}
```

**Step 4: Import Preview UI**
```typescript
// Import Preview Component
<ImportPreview>
  <ImportStats>
    📊 {totalRecords} records found
    ✅ {newRecords.length} new records
    ⚠️ {duplicates.length} duplicates
    ❌ {errors.length} errors
  </ImportStats>
  
  <ImportActions>
    <Button onClick={confirmImport}>Import {newRecords.length} Records</Button>
    <Button variant="outline">Cancel</Button>
  </ImportActions>
</ImportPreview>
```

### **Provider-Specific Parsing:**

**TWINT CSV Format:**
```typescript
function parseTWINTCsv(csvContent: string): TWINTRecord[] {
  // Handle German CSV format (semicolon-separated)
  // Parse dates: "31.10.2024" → Date
  // Parse amounts: "30" → 30.00
  // Extract transaction IDs, fees, etc.
}
```

**SumUp CSV Format:**
```typescript
function parseSumUpCsv(csvContent: string): SumUpRecord[] {
  // Handle comma-separated format
  // Parse dates: "2024-11-27 12:43:22" → Date
  // Parse amounts: "200.0" → 200.00
  // Handle Umsatz vs Auszahlung rows
}
```

### **Error Handling Strategy:**

**Validation Rules:**
- Required fields present
- Valid date formats
- Numeric amounts
- Provider transaction ID format
- Currency validation (CHF only)

**User Feedback:**
- Real-time validation during upload
- Detailed error messages with row numbers
- Skip invalid rows, continue with valid ones
- Comprehensive import summary

---

## 💰 **CASH SYSTEM ARCHITECTURE - FINAL IMPLEMENTATION**

### **Complete Cash Flow in POS System:**

**1. POS Cash Sales** → `cash_movements` (cash_in, cash_operation)
```typescript
Customer pays 50 CHF cash → Creates:
├── sales: payment_method='cash', total_amount=50
└── cash_movements: type='cash_in', amount=+50, movement_type='cash_operation'
```

**2. Cash Expenses** → `expenses` + `cash_movements` (cash_out, cash_operation)  
```typescript
Buy materials for 30 CHF cash → Creates:
├── expenses: payment_method='cash', amount=30
└── cash_movements: type='cash_out', amount=+30, movement_type='cash_operation'
```

**3. Bank Transfers** → `cash_movements` (cash_in/out, bank_transfer)
```typescript
Deposit 200 CHF to bank → Creates:
└── cash_movements: type='cash_out', amount=+200, movement_type='bank_transfer'

Withdraw 100 CHF from bank → Creates:
└── cash_movements: type='cash_in', amount=+100, movement_type='bank_transfer'
```

### **Cash Balance Calculation:**
```sql
-- get_current_cash_balance() function:
Cash Balance = SUM(cash_in amounts) - SUM(cash_out amounts)
             = (POS Sales + Bank Withdrawals) - (Expenses + Bank Deposits)
```

### **Banking Tab 2 Integration:**
- **Only `bank_transfer` movements** appear in Banking Tab 2 for matching
- **Regular `cash_operation` movements** stay in Cash Register only
- Clean separation between operational cash and banking reconciliation

---

## 🎯 Strategic Impact

### **Business Value**
- **Swiss Compliance**: Native TWINT/SumUp/Bank integration
- **Time Savings**: Automated matching vs manual reconciliation  
- **Accuracy**: Confidence-based matching reduces errors
- **Real-time Insights**: Live status of financial position

### **Technical Excellence**
- **Modern Architecture**: Domain-based modular design
- **Performance**: TanStack Table + virtualization
- **UX Innovation**: Click-to-connect banking reconciliation
- **Swiss Standards**: CAMT.053 XML + CSV support

### **Competitive Advantage**
- **Unique UX**: 2-Tab banking reconciliation interface
- **Integration Depth**: Native Swiss payment method support
- **Automation**: AI-powered transaction matching
- **Scalability**: Handle growing transaction volumes

---

**Next Update**: Nach Phase 1 Completion (Database & Infrastructure)  
**Reviewer**: Development Team  
**Status**: 🚧 Ready for Implementation Start