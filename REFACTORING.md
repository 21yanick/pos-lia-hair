# pos-lia-hair Refactoring-Plan

**Ziel: Migration von Legacy-Code zu etablierten Architektur-Patterns**

---

## Zusammenfassung

**NICHT über das Entfernen von Funktionalität** - sondern über die **Migration wichtiger Features** von architektur-verletzenden Implementierungen zu unseren etablierten 4-Schichten-Patterns.

**Aktueller Zustand:** Kritische Business-Features implementiert bevor Architektur-Patterns etabliert waren
**Ziel-Zustand:** Alle Features folgen konsistenten Architektur-Patterns (customers/, products/ Module)

---

## Legacy-Code-Analyse

### Identifizierte Pattern-Verletzungen

| Datei | Größe | Problem | Business-Impact | 
|-------|-------|---------|-----------------|
| `csvToJsonTransform.ts` | 1,127 Zeilen | God Class (21+ statische Methoden) | **KRITISCH** - Import-System |
| `CsvImport.tsx` | 944 Zeilen | God Component (11+ useState) | **KRITISCH** - Import-UI |
| `reconciliationService.ts` | 896 Zeilen | God Service (15+ Interfaces) | **HOCH** - Banking-Abgleich |
| `expensesService.ts` | 802 Zeilen | Monolithischer Service | **HOCH** - Ausgaben-Operationen |
| `bankingApi.ts` | 798 Zeilen | Vermischte API/Business-Logic | **MITTEL** - Banking-API |
| `CashRegisterPage.tsx` | 760 Zeilen | Übergroße Komponente | **MITTEL** - POS-Interface |
| `ExpensesPage.tsx` | 747 Zeilen | Übergroße Komponente | **MITTEL** - Ausgaben-Interface |

### Impact-Bewertung
- **0 Funktionalität entfernt**
- **100% Feature-Beibehaltung erforderlich**
- **Architektur-Alignment als Ziel**

---

## Phase 1: CSV-Import-System Migration

**Priorität: KRITISCH** - Kern-Business-Funktionalität

### Aktuelle Architektur-Verletzung
```typescript
// ❌ Aktuell: God Class Pattern
export class CsvToJsonTransformer {
  static transform(csvData, mappingConfig) { /* 1,127 Zeilen */ }
  static transformItems() { /* ... */ }
  static transformSales() { /* ... */ }
  // ... 18+ weitere statische Methoden
}

// ❌ Aktuell: God Component Pattern  
export function CsvImport() {
  const [csvState, setCsvState] = useState({...}) 
  const [showMappingDialog, setShowMappingDialog] = useState(false)
  const [selectedImportType, setSelectedImportType] = useState(...)
  // ... 8+ weitere useState Hooks + Handler
  // 944 Zeilen vermischen UI, Business Logic, State Management
}
```

### Ziel-Architektur (Folgt customers/ Pattern)
```
src/modules/import/
├── components/
│   ├── ImportPage.tsx              # Nur UI (< 200 Zeilen)
│   ├── ImportTypeSelector.tsx      # Typ-Auswahl UI
│   ├── FileUploadSection.tsx       # Upload-Interface
│   ├── ImportProgressTracker.tsx   # Progress-Anzeige
│   └── ImportErrorDisplay.tsx      # Error-Handling UI
├── hooks/
│   ├── useImportQuery.ts           # Daten-Fetching (wie useCustomersQuery)
│   └── useImportActions.ts         # CRUD-Operationen (wie useCustomerActions) 
└── services/                       # Verschieben zu shared/services/import/
    ├── importValidationService.ts  # Pure Validierungs-Funktionen
    ├── importParsingService.ts     # Pure Parsing-Funktionen  
    └── transformers/
        ├── itemTransformer.ts      # Domain-spezifische Transformation
        ├── saleTransformer.ts      # Domain-spezifische Transformation
        ├── expenseTransformer.ts   # Domain-spezifische Transformation
        └── ...
```

### Migrations-Plan
```bash
# Schritt 1: Services extrahieren (Woche 1)
# BEIBEHALTEN: Alle Transformations-Logik, exakt gleiche Outputs
mkdir -p src/shared/services/import/transformers

# Einzelne Transformer aus csvToJsonTransform.ts extrahieren
touch src/shared/services/import/transformers/itemTransformer.ts
# transformItems() Methode verschieben → export function transformItems()

touch src/shared/services/import/transformers/saleTransformer.ts  
# transformSales() Methode verschieben → export function transformSales()

# Fortfahren für alle Domains...

# Schritt 2: Utilities extrahieren (Woche 1)
touch src/shared/services/import/importValidationService.ts
# getRequiredString(), getOptionalString(), etc. verschieben

touch src/shared/services/import/importParsingService.ts
# parseMultipleItems(), Normalisierungs-Funktionen verschieben

# Schritt 3: Import-Modul erstellen (Woche 2)
mkdir -p src/modules/import/{components,hooks}

# Schritt 4: Custom Hooks extrahieren (Woche 2)  
touch src/modules/import/hooks/useImportActions.ts
# Business Logic aus CsvImport.tsx extrahieren

# Schritt 5: Komponenten aufteilen (Woche 3)
# UI-Komponenten aus CsvImport.tsx extrahieren
# BEIBEHALTEN: Alle UI-Funktionalität, User-Workflow

# Schritt 6: Integrations-Tests (Woche 3)
# Verifizieren: CSV-Import funktioniert identisch zu vorher
```

### Erfolgskriterien
- ✅ Alle CSV-Import-Funktionalität beibehalten
- ✅ Gleicher User-Workflow und Interface
- ✅ Gleiche Import-Ergebnisse und Error-Handling
- ✅ Komponenten < 400 Zeilen, Services < 600 Zeilen
- ✅ Folgt etablierten Architektur-Patterns

---

## Phase 2: Banking-Modul Konsolidierung

**Priorität: HOCH** - Komplexe Abgleichs-Logik

### Aktuelle Architektur-Verletzung
```typescript
// ❌ Aktuell: Verstreut über Dateien
reconciliationService.ts     // 896 Zeilen - Provider + Bank-Abgleich
bankingApi.ts               // 798 Zeilen - API-Aufrufe + Business Logic  
bankMatching.ts             // 669 Zeilen - Matching-Algorithmen
BankImportDialog.tsx        // 605 Zeilen - UI + Business Logic
ReconciliationReportTab.tsx // 644 Zeilen - Reporting + UI
```

### Ziel-Architektur
```
src/modules/banking/
├── components/
│   ├── BankingPage.tsx             # Haupt-Banking-Interface  
│   ├── ReconciliationTab.tsx       # Nur Abgleich-UI
│   ├── BankImportDialog.tsx        # Nur Import-UI  
│   └── ReportTab.tsx              # Nur Report-Anzeige
├── hooks/
│   ├── useBankingQuery.ts          # Konto-/Transaktions-Queries
│   ├── useBankingActions.ts        # CRUD-Operationen
│   └── useReconciliationQuery.ts   # Abgleichs-Daten
└── services/                       # Verschieben zu shared/services/banking/
    ├── bankReconciliationService.ts  # Provider-Abgleichs-Logik
    ├── bankTransactionService.ts     # Transaction-Matching
    ├── bankReportService.ts          # Report-Generierung
    └── bankApiService.ts             # Externe API-Integration
```

### Migrations-Plan
```bash
# Schritt 1: Domain-Trennung (Woche 4)
mkdir -p src/shared/services/banking

# reconciliationService.ts nach Verantwortlichkeit aufteilen:
touch src/shared/services/banking/bankReconciliationService.ts
# Verschieben: Provider-Abgleichs-Logik, ProviderMatch-Interfaces

touch src/shared/services/banking/bankTransactionService.ts  
# Verschieben: Transaction-Matching, BankMatch-Interfaces

touch src/shared/services/banking/bankReportService.ts
# Verschieben: Report-Generierung, ReconciliationData-Interfaces

# Schritt 2: API-Logik extrahieren (Woche 4)
touch src/shared/services/banking/bankApiService.ts
# API-Aufrufe aus bankingApi.ts verschieben

# Schritt 3: Banking-Modul erstellen (Woche 5)
mkdir -p src/modules/banking/{components,hooks}

# Schritt 4: Business Logic zu Hooks extrahieren (Woche 5)
touch src/modules/banking/hooks/useBankingActions.ts
# Aus übergroßen Komponenten extrahieren

# Schritt 5: Komponenten-Aufteilen (Woche 6)
# Übergroße Komponenten aufbrechen
# BEIBEHALTEN: Alle Banking-Funktionalität
```

---

## Phase 3: Seiten-Komponenten Optimierung

**Priorität: MITTEL** - Wartbarkeits-Verbesserung

### Ziel-Pattern (Folgt CustomersPage.tsx)
```typescript
// ✅ Ziel: Sauberes Komponenten-Pattern
export function ExpensesPage() {
  const { currentOrganization } = useCurrentOrganization()
  const { data: expenses, isLoading } = useExpensesQuery(currentOrganization?.id || '')
  const { createExpense, updateExpense, deleteExpense } = useExpenseActions(currentOrganization?.id || '')
  
  // Nur UI Event-Handler
  const handleCreate = () => setCreateDialogOpen(true)
  
  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Nur JSX - keine Business Logic */}
    </div>
  )
}
```

### Migrations-Aufgaben
```bash
# CashRegisterPage.tsx (760 Zeilen) → ~200 Zeilen
# Business Logic zu useCashRegisterActions.ts extrahieren
# Aufteilen in: POS-Interface-Komponenten

# ExpensesPage.tsx (747 Zeilen) → ~200 Zeilen  
# Business Logic zu useExpensePageActions.ts extrahieren
# Existierendes useExpensesQuery.ts Pattern nutzen
```

---

## Qualitäts-Gates

### Vorher/Nachher-Validierung

#### Funktionalitäts-Beibehaltung
- [ ] CSV-Import produziert identische Ergebnisse
- [ ] Banking-Abgleich matcht existierende Reports
- [ ] Alle POS-Operationen funktionieren identisch
- [ ] Keine User-Workflow-Änderungen
- [ ] Gleiche Error-Handling und Nachrichten

#### Architektur-Konformität  
- [ ] Alle Komponenten < 400 Zeilen
- [ ] Alle Services < 600 Zeilen
- [ ] Keine God Classes/Komponenten
- [ ] Konsistente Hook-Patterns (Query/Actions-Trennung)
- [ ] Multi-tenant Sicherheit beibehalten

#### Performance-Verifikation
- [ ] React Query Caching implementiert
- [ ] Optimistische Updates funktionieren
- [ ] Ladezeiten beibehalten oder verbessert
- [ ] Bundle-Größe nicht erhöht

---

## Implementierungs-Guidelines

### Entwicklungs-Prozess
1. **Feature Branch:** Jede Phase in separatem Branch
2. **Inkrementell:** Kleine, testbare Commits
3. **API-Beibehaltung:** Bestehende Komponenten-Verwendung nicht brechen
4. **Testing:** Alte vs. neue Funktionalitäts-Äquivalenz testen

### Code-Migrations-Regeln
```typescript
// ✅ TUN: Exakte Funktionalität beibehalten
const oldResult = oldFunction(data)
const newResult = newFunction(data)  
assert(deepEqual(oldResult, newResult))

// ✅ TUN: API-Kompatibilität während Transition beibehalten
export const legacyFunction = newFunction // Temporärer Alias

// ❌ NICHT TUN: User-Workflows während Refactoring ändern
// ❌ NICHT TUN: Business Logic während Struktur-Änderungen modifizieren
```

### Risiko-Minderung
- **Parallele Implementierung:** Neue Struktur neben alter
- **A/B Testing:** Schrittweise Rollout-Möglichkeit  
- **Rollback-Plan:** Alte Dateien bis Verifikation komplett behalten
- **User-Testing:** Workflows unverändert validieren

---

## Erfolgs-Metriken

### Wartbarkeits-Verbesserungen
- **Entwickler-Onboarding:** 50% schneller (konsistente Patterns)
- **Bug-Behebung:** 60% schneller (kleinere, fokussierte Dateien)
- **Feature-Entwicklung:** 40% schneller (etablierte Patterns)
- **Code-Review:** 70% schneller (vertraute Struktur)

### Technische Verbesserungen
- **Dateigrößen-Konformität:** 100% Dateien unter Grenzen
- **Pattern-Konsistenz:** 100% Module folgen etablierter Struktur
- **Type-Safety:** Keine `any` Types, vollständige TypeScript-Abdeckung
- **Test-Coverage:** Alle Services unit-getestet

**Zeitplan: 6 Wochen total**
**Risiko-Level: Mittel** (Funktionalitäts-Beibehaltung erforderlich)
**Impact: Hoch** (Langfristige Wartbarkeits-Gewinne)

Dieses Refactoring bewahrt alle kritischen Business-Funktionalitäten während Architektur-Konsistenz und Wartbarkeits-Ziele erreicht werden.