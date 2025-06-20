# Legacy Reports Module Backup

**Backup erstellt**: 06.01.2025
**Grund**: Banking Module Migration - Reports werden durch kontinuierlichen Provider/Bank-Abgleich ersetzt

## Was wurde gesichert

### Daily Reports Module (`daily/`)
- **8 Components**: DailyPage, DailyStats, TransactionsList, DailyActions, CashCountDialog, MissingClosuresWarning, BulkClosureDialog, StatusBadge
- **Business Logic**: Tagesabschluss-Logik, Kassenzählung, Bulk-Closure
- **Utils**: dailyHelpers.ts, dailyTypes.ts (PDF-Generierung, Statistik-Berechnung)
- **Hook Integration**: useDailySummaries, useSales

### Reports Overview (`ReportsOverview.tsx`)
- Navigation zu Daily Reports, Cash Register und Legacy Monthly Reports
- Card-basierte UI für verschiedene Report-Typen

### Module Index (`index.ts`)
- Public API für Reports Module
- Type Re-exports

## Warum wurde es gesichert?

### Banking Module Paradigma-Shift:
- **Alt**: Zeitbasierte Tagesabschlüsse mit manueller Kassenzählung
- **Neu**: Kontinuierlicher Provider/Bank-Abgleich ohne feste Abschluss-Zyklen

### Business Logic Preservation:
- Kassenzählung-Logic könnte für Banking Module relevant sein
- PDF-Generierung könnte adaptiert werden
- Daily Summary Konzept als Banking Report-Referenz

### Architektur-Evolution:
- Cash Register wird eigenständiges Modul (nur Kassenstand-Management)
- Daily Reports werden obsolet durch Banking-Abgleich
- Reports-Struktur wird durch Banking-Tabs ersetzt

## Banking Module Integration

Die gesicherte Business Logic kann als Referenz für:
- **Banking Reports**: Anstatt Tagesabschlüsse → Provider-Abgleich Reports
- **Cash Management**: Kassenstand-Tracking bleibt relevant
- **PDF Export**: Kann für Banking-Reports adaptiert werden

## File Structure

```
daily/
├── components/           # 8 Daily Report Components
│   ├── DailyPage.tsx    # Hauptkomponente mit State Management
│   ├── DailyStats.tsx   # Statistik-Anzeige
│   ├── TransactionsList.tsx # Transaction-Übersicht
│   ├── DailyActions.tsx # Abschluss-Aktionen
│   ├── CashCountDialog.tsx # Kassenzählung-Dialog
│   ├── MissingClosuresWarning.tsx # Warning-Component
│   ├── BulkClosureDialog.tsx # Bulk-Abschluss
│   └── StatusBadge.tsx  # Status-Anzeige
├── utils/
│   ├── dailyHelpers.ts  # PDF, Stats, Transaction-Utils
│   └── dailyTypes.ts    # Type-Definitionen
└── index.ts             # Sub-Module API

ReportsOverview.tsx       # Reports Navigation Component
index.ts                  # Module Public API
```

**Verwendung**: Referenz für Banking Module Development, nicht für direkte Integration.