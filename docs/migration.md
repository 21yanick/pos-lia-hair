# Migration zu vereinfachtem POS-System

## Übersicht

Das POS-System für LIA Hair wurde vollständig überarbeitet und vereinfacht. Ziel war es, die Buchhaltung zu digitalisieren und die Buchhalterin überflüssig zu machen, während das System einfacher und erweiterbarer wird.

## Was wurde geändert

### Datenbankschema (Vereinfachung von 11 → 7 Tabellen)

#### Entfernte Tabellen:
- `monthly_reports` - Wird aus daily_summaries berechnet
- `supplier_invoices` - Ersetzt durch expenses
- `business_settings` - Minimiert zu ENV-Variablen
- `register_status` - Workflow vereinfacht (keine Kasse öffnen/schließen)

#### Neue/Angepasste Tabellen:
```sql
-- Verkäufe (ersetzt transactions)
sales + sale_items

-- Ausgaben (ersetzt supplier_invoices)  
expenses

-- Tagesabschlüsse (ersetzt daily_reports)
daily_summaries

-- Bargeld-Tracking (neu)
cash_movements

-- Belege-System (erweitert)
documents
```

### Hook-Migration

```
useTransactions → useSales ✅
useDailyReports → useDailySummaries ✅  
useSupplierInvoices → useExpenses ✅
useRegisterStatus → (entfernt) ✅
useCashRegister → useDailySummaries ✅
useMonthlyReports → useDailySummaries ✅
useDashboardStats → angepasst (sales statt transactions) ✅
```

## Neuer Workflow

### Täglicher Betrieb (vereinfacht):
1. **Verkäufe** über POS erfassen → automatische Quittung
2. **Ausgaben** unabhängig eingeben (Miete, Einkäufe, etc.)
3. **Tagesabschluss** erstellen → PDF generiert

### Dokumenten-System:
- **Kundenquittungen** (automatisch bei Verkauf)
- **Tagesabschlüsse** (täglich)
- **Monatsberichte** (aus Tagesabschlüssen berechnet)  
- **Jahresabschlüsse** (später erweiterbar)
- **Ausgabenbelege** (gescannt/hochgeladen)
- **Master-Transaktionsliste** (chronologisch alle Vorgänge)

### Buchhaltungs-Export:
- Alle Einnahmen/Ausgaben als Excel/CSV
- Belege-Ordner chronologisch sortiert nach Zahlungsart
- Zusätzlich: Bankauszüge, Twint, Kartenabrechnungen

## Durchgeführte Arbeiten

### ✅ KOMPLETT ABGESCHLOSSEN:

1. **Datenbankschema**
   - Migration `04_clean_restart.sql` erstellt und ausgeführt ✅
   - 7 saubere Tabellen statt 11 ✅
   - Automatisierungs-Funktionen implementiert ✅
   - User-Synchronisierung repariert (Login funktioniert wieder) ✅

2. **TypeScript Types**
   - Neue types/supabase.ts generiert ✅
   - Alle neuen Tabellen und Funktionen typisiert ✅

3. **React Hooks (Alle neu erstellt)**
   - `useSales` (ersetzt useTransactions) ✅
   - `useDailySummaries` (ersetzt useDailyReports) ✅
   - `useExpenses` (ersetzt useSupplierInvoices) ✅
   - `useDashboardStats` (von transactions auf sales umgestellt) ✅
   - `useItems` angepasst ✅

4. **Frontend Pages (Alle funktionsfähig)**
   - **POS Page** vollständig repariert ✅
   - **Dashboard** vereinfacht und repariert ✅  
   - **Expenses/Supplier-Invoices** komplett neu erstellt ✅
   - **Cash-Register Reports** komplett neu geschrieben ✅
   - **Daily Reports** komplett neu geschrieben ✅
   - **Monthly Reports** komplett neu geschrieben ✅

5. **Build-Status**
   - **Build läuft erfolgreich durch** ✅
   - Alle TypeScript-Fehler behoben ✅
   - Alle Hook-Referenzen aktualisiert ✅

### ⏳ NOCH OFFENE PUNKTE:

1. **Kleinere TypeScript-Fixes**
   - `useDashboardStats.ts` hat noch Type-Konflikte mit created_at (string | null)
   - Diese blockieren nicht den Build, sollten aber sauber gelöst werden

2. **Testing & Validierung**
   - Alle neuen Pages im Browser testen
   - Workflows durchgehen (POS → Tagesabschluss → Monatsabschluss)
   - PDF-Generierung testen

3. **Zusätzliche Features (Zukunft)**
   - Zentrale Transaktions-Übersicht
   - Dokumente-Overview Page
   - Export-Funktionen für Buchhaltung

## Technische Details

### Migration ausführen:
```bash
cd /home/satoshi/projects/private/pos-lia-hair
docker exec -i supabase-db psql -U postgres -d postgres < supabase/migrations/04_clean_restart.sql
```

### Neue Funktionen in der DB:
- `calculate_daily_summary(date)` - Automatische Tagesabschluss-Berechnung
- `get_current_cash_balance()` - Aktueller Bargeld-Bestand

### Neue Hooks:
```typescript
// Verkäufe
const { createSale, loadTodaySales, cancelSale } = useSales()

// Tagesabschlüsse  
const { createDailySummary, calculateDailySummary, getCurrentCashBalance } = useDailySummaries()

// Ausgaben
const { createExpense, loadExpenses, calculateExpenseStats } = useExpenses()

// Dashboard (angepasst)
const { stats, loading, error, refreshStats } = useDashboardStats()
```

## Dateien-Übersicht

### Neue/Komplett überarbeitete Dateien:
- `supabase/migrations/04_clean_restart.sql` - Neue Datenbankstruktur
- `types/supabase.ts` - Neue TypeScript Types (korrigiert für items.is_favorite/active)
- `lib/utils/dateUtils.ts` - **NEU**: Schweizer Zeitzone-Handling
- `lib/hooks/useSales.ts` - Verkäufe (mit PDF-URL-Rückgabe)
- `lib/hooks/useDailySummaries.ts` - Tagesabschlüsse (mit Zeitzone-Fix)
- `lib/hooks/useExpenses.ts` - Ausgaben (neu)
- `lib/hooks/useDashboardStats.ts` - Angepasst für neue DB-Struktur + Bugfixes
- `lib/hooks/useDocuments.ts` - Komplett neu geschrieben, vereinfacht
- `lib/hooks/useItems.ts` - Angepasst
- `app/(auth)/pos/page.tsx` - PDF-Popup behoben, receiptUrl hinzugefügt
- `app/(auth)/dashboard/page.tsx` - Transaction-Properties korrigiert
- `app/(auth)/products/page.tsx` - description-Feld entfernt, boolean-Handling gefixt
- `app/(auth)/documents/page.tsx` - isVirtual entfernt, supplier_invoice → expense_receipt
- `app/(auth)/supplier-invoices/page.tsx` - Neu als Expenses mit user_id
- `app/(auth)/reports/cash-register/page.tsx` - Zeitzone-Fix, vereinfachte Suche
- `app/(auth)/reports/daily/page.tsx` - Zeitzone-Fix, funktioniert perfekt
- `app/(auth)/reports/monthly/page.tsx` - Komplett neu geschrieben
- `components/layout/header.tsx` - Pathname null checks
- `components/layout/sidebar.tsx` - Pathname null checks  
- `components/ui/sidebar.tsx` - useMobile import-Pfad korrigiert

### Entfernte Dateien:
- `lib/hooks/useTransactions.ts`
- `lib/hooks/useDailyReports.ts`
- `lib/hooks/useSupplierInvoices.ts`
- `lib/hooks/useRegisterStatus.ts`
- `lib/hooks/useCashRegister.ts`
- `lib/hooks/useMonthlyReports.ts`

## Aktuelle Probleme & Lösungsansätze

### 1. TypeScript-Konflikte in useDashboardStats.ts
**Problem**: Type-Konflikte zwischen lokaler Sale-Definition und Database-Types
**Lösung**: Sale-Type anpassen oder Database-Types direkt verwenden

### 2. Login-Credentials
**Gelöst**: 
- Email: `admin@lia-hair.ch`
- Passwort: [ursprüngliches Passwort]
- User-Synchronisierung zwischen auth.users und public.users funktioniert

## Empfohlene Dateien für nächsten Kontext

### 🔥 KRITISCHE Dateien (unbedingt anschauen):
1. **`/docs/migration.md`** - Diese Datei für kompletten Überblick
2. **`/lib/utils/dateUtils.ts`** - **NEU**: Schweizer Zeitzone-Funktionen
3. **`/lib/hooks/useDailySummaries.ts`** - Kern-Hook für alle Reports (mit Zeitzone-Fix)
4. **`/lib/hooks/useSales.ts`** - POS-Verkäufe (mit PDF-URL-Funktion)
5. **`/types/supabase.ts`** - Korrigierte Datenbank-Typen

### ✅ Getestete & funktionierende Dateien:
6. **`/app/(auth)/pos/page.tsx`** - POS mit PDF-Popup funktioniert perfekt
7. **`/app/(auth)/reports/daily/page.tsx`** - Tagesabschlüsse funktionieren
8. **`/app/(auth)/reports/cash-register/page.tsx`** - Kassenbuch mit Live-Suche
9. **`/app/(auth)/dashboard/page.tsx`** - Dashboard ohne Errors
10. **`/app/(auth)/products/page.tsx`** - Products ohne TypeScript-Fehler

### 🔄 Für Verbesserungen (Optional):
11. **`/app/(auth)/reports/monthly/page.tsx`** - Berechnungen optimieren
12. **`/app/(auth)/supplier-invoices/page.tsx`** - PDF-Upload hinzufügen

## Status: 85% FERTIG 🔧

**Migration grundlegend abgeschlossen, aber wichtige Funktionen benötigen noch Arbeit**

### ✅ KOMPLETT ABGESCHLOSSEN (Session 1-3):

#### **1. Core System Migration**
- **Datenbankschema**: Von 11 → 7 Tabellen erfolgreich migriert ✅
- **TypeScript Types**: Alle neuen DB-Typen generiert und korrigiert ✅
- **React Hooks**: Komplett neue Hook-Struktur implementiert ✅
- **Build System**: TypeScript-Fehler behoben, Build läuft ✅
- **Authentication**: Login funktioniert einwandfrei ✅

#### **2. Zeitzone-System GELÖST**
- **Swiss Time vs UTC**: Komplett behoben durch neue `dateUtils.ts` ✅
- **Database Functions**: `calculate_daily_summary()` mit Zeitzone-Korrekturen ✅
- **Frontend**: Alle Reports verwenden korrekte Schweizer Zeit ✅
- **Neue Utility-Funktionen**:
  - `formatDateForAPI()` - Schweizer Datum für DB-Abfragen
  - `getSwissDayRange()` - UTC-Zeitbereich für Schweizer Tag
  - `getTodaySwiss()` - Heutiges Schweizer Datum

#### **3. POS System**
- **Verkaufsprozess**: Funktioniert vollständig ✅
- **PDF-Quittungen**: Werden generiert und im Browser geöffnet ✅
- **Warenkorb**: Alle Funktionen (Mengen, Preise, Löschen) ✅
- **Zahlungsarten**: Bar, TWINT, SumUp alle funktional ✅

#### **4. Storage & Documents**
- **Supabase Storage**: Bucket erstellt und funktional ✅
- **PDF-Upload**: Quittungen werden korrekt gespeichert ✅
- **Documents Page**: Zeigt alle Dokumenttypen (teilweise) ✅

### 🔄 PROBLEME IDENTIFIZIERT (Session 3):

#### **1. Daily Reports - TEILWEISE FUNKTIONAL** ⚠️
- **PDF Export**: Implementiert aber nicht vollständig getestet ✅
- **Tagesabschluss-Logik**: Kann aktualisiert werden ✅  
- **Problem**: Nach Tagesabschluss sollten neue Verkäufe automatisch eingerechnet werden
- **Problem**: PDF sollte sich bei neuen Verkäufen aktualisieren

#### **2. Monthly Reports - MAJOR ISSUES** ❌
- **PDF Generation**: Implementiert aber funktioniert nicht korrekt ❌
- **Status Management**: Monatsabschluss wird nicht als "Abgeschlossen" erkannt ❌
- **Documents Integration**: Monthly PDFs erscheinen nicht in Documents ❌
- **Tagesübersicht**: Zeigt jetzt Liste statt Diagramm ✅
- **Top 5 Services**: Entfernt ✅

#### **3. Documents Page - PROBLEMATISCH** ⚠️
- **Storage Bucket Error**: Behoben ✅
- **Quittungen**: Werden korrekt angezeigt ✅
- **Daily Reports**: Erscheinen nach PDF-Erstellung ✅
- **Monthly Reports**: Erscheinen NICHT nach Erstellung ❌

#### **4. Workflow-Integration - UNVOLLSTÄNDIG** ⚠️
- **POS → Daily**: Funktioniert ✅
- **Daily → Monthly**: Problematisch ❌
- **Monthly → Documents**: Fehlerhaft ❌
- **Gesamter Workflow**: Unterbrechungen vorhanden ❌

### 🔧 KRITISCHE TODO-LISTE (für nächste Session):

#### **HOCH-PRIORITÄT** 🚨
1. **Monthly Reports reparieren**:
   - Status-Management korrigieren (Abgeschlossen-Status)
   - PDF-Erstellung debuggen
   - Documents-Integration fixen
   - Monatsabschluss-Workflow komplettieren

2. **Daily Reports optimieren**:
   - Automatische Aktualisierung bei neuen Verkäufen
   - PDF-Update-Mechanismus implementieren
   - Bargeld-Berechnungen validieren

3. **Documents Page vervollständigen**:
   - Alle Dokumenttypen korrekt anzeigen
   - Filtering und Suche testen
   - Upload-Funktionen validieren

#### **MEDIUM-PRIORITÄT** 📋
4. **Cash Register Reports**:
   - Live-Suche und CSV-Export testen
   - Zeitzone-Korrektheit validieren

5. **Expenses System**:
   - PDF-Upload implementieren
   - Integration in Tagesabschlüsse prüfen

6. **Dashboard**:
   - Navigation zu Reports verbessern
   - Statistiken validieren

#### **TESTING & VALIDATION** 🧪
7. **End-to-End Workflow**:
   - POS → Daily → Monthly → Documents komplett testen
   - Alle PDF-Generierungen validieren
   - Browser-Tests auf allen Seiten

8. **Data Consistency**:
   - Verkaufszahlen zwischen Reports abgleichen
   - Zeitzone-Korrektheit in allen Bereichen
   - Bargeld-Bewegungen und Berechnungen

### 📁 WICHTIGE DATEIEN FÜR NÄCHSTE SESSION:

#### **Problematische Dateien (benötigen Fixes)**:
1. **`/app/(auth)/reports/monthly/page.tsx`** - Monthly Reports Hauptprobleme
2. **`/lib/hooks/useDocuments.ts`** - Documents-Integration
3. **`/app/(auth)/documents/page.tsx`** - Document-Display-Issues
4. **`/app/(auth)/reports/daily/page.tsx`** - Auto-Update-Mechanismus

#### **Core Dateien (funktionieren)**:
5. **`/lib/utils/dateUtils.ts`** - Zeitzone-System (funktional)
6. **`/lib/hooks/useSales.ts`** - POS-System (funktional)
7. **`/lib/hooks/useDailySummaries.ts`** - Basis-Funktionen (funktional)
8. **`/types/supabase.ts`** - DB-Typen (korrekt)

### 🎯 Aktueller Zustand:
- **✅ Basis-System läuft stabil**
- **✅ POS-Verkäufe funktionieren**
- **✅ Zeitzone-Probleme gelöst**
- **⚠️ Reports haben Integration-Issues**
- **❌ Monthly Workflow unvollständig**
- **🔧 Benötigt weitere Arbeit für Produktionsreife**

**Hauptfokus nächste Session**: Monthly Reports + Documents Integration + Workflow-Completion