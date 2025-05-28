# POS-LIA-HAIR

Ein modernes, **produktions-bereites** Point-of-Sale (POS) System für den Schweizer Coiffeursalon "LIA Hair". Entwickelt mit **business-centric Architektur**, Next.js 15 und Supabase für maximale Effizienz im Salon-Management.

![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-latest-3ECF8E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC)
![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-latest-000000)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.75.2-FF4154)
![React PDF](https://img.shields.io/badge/React%20PDF-4.3.0-e53e3e)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

## 💡 Kürzliche Verbesserungen (2024)

### **🔧 Architektur-Modernisierung**
- **Business-Centric Refactoring**: 11→7 Tabellen für bessere Datenstruktur
- **Hooks-Reorganisation**: Domain-basierte Struktur (business/core/ui)
- **PDF-System Modernisierung**: @react-pdf/renderer (68% Code-Reduktion)
- **Missing Closures Detection**: Automatische Erkennung fehlender Tagesabschlüsse

### **📊 Neue Features**
- **JSON Import-System**: 7-Phasen-Import für historische Daten
- **Documents Management**: Zentrale PDF-Verwaltung mit automatischer Kategorisierung  
- **Monthly Reports Refactoring**: Modulare, performante Monatsabschlüsse
- **Native Timezone**: Schweizer Zeitzone ohne externe Libraries

### **🎯 Performance-Optimierungen**
- **Time-to-Feature**: Von 7-8h auf ~1h Zielzeit reduziert
- **Component Modularität**: Klare Trennung zwischen UI/Logic/Data
- **Database Effizienz**: RLS-optimierte Queries mit System User
- **Automatisierung**: Reduzierte manuelle Eingriffe bei Daily/Monthly Operations

---

## 📋 Kernfunktionen

### 🏪 **Salon-Betrieb**
- 🛒 **Point-of-Sale (POS)**: Intuitiver Verkaufsbildschirm mit allen Zahlungsarten (Bar, TWINT, SumUp)
- 📄 **Automatische Quittungen**: React-PDF Generierung mit Signed URLs
- 📊 **Tagesabschlüsse**: Automatische Berechnung mit Status-Management (DRAFT → CLOSED → CORRECTED)
- 📈 **Monatsabschlüsse**: Persistente Summaries mit Business-Level Status
- 📖 **Kassenbuch**: Monatsübersicht aller Bargeld-Bewegungen

### 💼 **Business-Management**
- 💰 **Ausgaben-System**: Separate Verwaltung nach Kategorien (Miete, Einkauf, Lohn, etc.)
- 🏷️ **Produkt-Katalog**: Shared Resources (business-centric, nicht user-abhängig)
- 📑 **Lieferantenrechnungen**: Vollständiges Tracking mit Dokumenten-Verknüpfung
- 📁 **Dokumentenverwaltung**: Zentrale PDF-Verwaltung mit automatischer Kategorisierung

### 🔧 **System-Features**
- 👤 **Benutzer-Management**: Admin/Staff Rollen mit granularen Berechtigungen
- 📊 **Import-System**: Umfassendes JSON-basiertes Import für historische Daten
- 🔄 **Business-Centric Architecture**: Saubere Trennung zwischen Geschäfts- und Benutzer-Daten
- 🏦 **Audit-Trail**: Vollständige Nachverfolgung aller Änderungen mit created_by

## 🚀 Schnellstart

### Voraussetzungen

- **Node.js 18+** und **pnpm** (empfohlen)
- **Docker und docker-compose** für lokale Supabase-Instanz
- **Git** für Repository-Management

### Installation

1. Repository klonen
   ```bash
   git clone https://github.com/yourusername/pos-lia-hair.git
   cd pos-lia-hair
   ```

2. Abhängigkeiten installieren
   ```bash
   pnpm install
   ```

3. Supabase lokal einrichten
   ```bash
   # Supabase-Repository im separaten Verzeichnis klonen
   mkdir -p supabase-local
   cd supabase-local
   git clone --depth 1 https://github.com/supabase/supabase .
   
   # In das Docker-Verzeichnis wechseln
   cd docker
   
   # Umgebungsvariablen konfigurieren
   cp .env.example .env
   
   # Docker-Compose starten
   docker-compose up -d
   ```

### Supabase starten und stoppen

- Supabase-Container stoppen (um Ports freizugeben):
  ```bash
  docker stop $(docker ps -q --filter "name=supabase")
  ```

- Supabase-Container wieder starten:
  ```bash
  cd /home/satoshi/projects/private/pos-lia-hair/supabase-local/docker
  docker-compose up -d
  ```

4. Umgebungsvariablen konfigurieren
   ```bash
   # In das Hauptverzeichnis zurückkehren
   cd /pfad/zu/pos-lia-hair
   
   # .env.local erstellen
   cp .env.example .env.local
   
   # Anpassen der Werte in .env.local
   ```

5. Datenbank mit Business-Centric Schema initialisieren
   ```bash
   # Automatisches Setup-Script verwenden
   ./setup_fresh_db.sh
   
   # ODER: Manuell im Supabase Studio
   # Öffne http://localhost:8000 → SQL Editor
   # Führe 00_complete_business_centric_schema.sql aus
   ```

6. Entwicklungsserver starten
   ```bash
   pnpm dev
   ```

7. Browser öffnen und zur Anwendung navigieren
   ```
   http://localhost:3000
   ```

## 🏗️ Projektstruktur

```
/
├── app/                        # Next.js 15 App Router
│   ├── (auth)/                 # Geschützter Bereich mit Layout
│   │   ├── dashboard/          # Business-Dashboard mit KPIs
│   │   ├── pos/                # Point-of-Sale Verkaufsbildschirm
│   │   ├── reports/            # Umfassendes Berichts-System
│   │   │   ├── daily/          # Tagesabschlüsse mit Missing-Detection
│   │   │   ├── monthly/        # Monatsabschlüsse (komplett refactored)
│   │   │   └── cash-register/  # Kassenbuch Monatsübersicht
│   │   ├── documents/          # Zentrale PDF-Verwaltung (neu: 2024)
│   │   │   ├── components/     # DocumentsStats, DocumentsTable, DocumentsUpload
│   │   │   └── utils/          # documentHelpers für bessere Namen
│   │   ├── products/           # Shared Produkt-Katalog (business-centric)
│   │   ├── settings/           # System-Einstellungen & Import
│   │   │   └── import/         # JSON Import-System (produktions-bereit)
│   │   └── supplier-invoices/  # Lieferantenrechnungen-Tracking
│   └── login/                  # Supabase Auth Integration
├── components/                 # UI-Komponenten
│   ├── layout/                 # Header, Sidebar (kollapsibel, responsive)
│   ├── pdf/                    # React-PDF Komponenten (modernisiert)
│   │   ├── ReceiptPDF.tsx      # Quittungs-PDFs (auto-generation)
│   │   ├── DailyReportPDF.tsx  # Tagesabschluss-PDFs  
│   │   ├── MonthlyReportPDF.tsx # Monatsabschluss-PDFs
│   │   └── PlaceholderReceiptPDF.tsx # Import-Support
│   └── ui/                     # Shadcn/UI Komponenten (vollständig)
├── lib/                        # Business Logic (neu strukturiert)
│   ├── hooks/                  # Custom React Hooks (domain-organized)
│   │   ├── business/           # Business-Domain Hooks (neu: 2024)
│   │   │   ├── useSales.ts     # POS-Verkäufe mit PDF-Integration
│   │   │   ├── useExpenses.ts  # Ausgaben-System
│   │   │   ├── useDailySummaries.ts   # Tagesabschlüsse
│   │   │   ├── useMonthlySummaries.ts # Monatsabschlüsse (refactored)
│   │   │   ├── useDocuments.ts # Dokumentenverwaltung (neu)
│   │   │   ├── useItems.ts     # Produkt-Katalog
│   │   │   ├── useImport.ts    # Import-System (neu)
│   │   │   └── useReports.ts   # Report-Generierung
│   │   └── core/               # Core-Funktionalitäten
│   │       ├── useCashMovements.ts # Kassenbuch-Logic (zentralisiert)
│   │       ├── useMobile.tsx   # Mobile-Detection
│   │       └── useToast.ts     # Toast-Notifications
│   ├── supabase/               # Database Client (SSR + Client)
│   └── utils/                  # Helper-Funktionen
│       └── dateUtils.ts        # Native Timezone-Handling (Europa/Zürich)
├── supabase/migrations/        # Database Schema
│   ├── 00_complete_business_centric_schema.sql # Business-Centric Schema
│   └── 01_extend_documents_schema.sql          # Documents Extension
├── types/                      # TypeScript-Typen
│   └── supabase.ts            # Auto-generierte DB-Typen (aktuell)
└── docs/                       # Umfassende Dokumentation (erweitert)
    ├── konzept.md             # Business-Konzept & Workflows
    ├── Business-Centric-Refactoring.md # Architektur-Umstellung
    ├── Import.md              # Import-System (7-Phasen-Prozess)
    ├── aktueller-stand-nach-funktionstest.md # Status-Report
    └── funktionstest-checkliste.md # Test-Procedures
```

## 🛠️ Technologie-Stack

### **Frontend Stack**
- **Framework**: Next.js 15.1.0 (App Router, React 19)
- **Sprache**: TypeScript 5 (strict mode, vollständig typisiert)
- **Styling**: Tailwind CSS 3.4.17 + Tailwind Animate
- **UI-Framework**: Shadcn/UI (Radix UI + CVA, vollständiger Komponentensatz)
- **State Management**: TanStack Query 5.75.2 (mit Optimistic Updates)
- **Formulare**: React Hook Form + Zod Validation
- **PDF-System**: @react-pdf/renderer 4.3.0 (modernisiert, 68% kleiner)
- **Icons**: Lucide React (konsistentes Design)
- **Notifications**: Sonner (moderne Toast-UI)

### **Backend & Database**
- **Database**: PostgreSQL mit Supabase (self-hosted)
- **Schema**: Business-Centric Architecture (7 Haupttabellen)
- **Auth**: Supabase Auth + Row Level Security (RLS)
- **Storage**: Supabase Storage (zentrale PDF-Verwaltung)
- **API**: Auto-generierte RESTful + TypeScript Types
- **Real-time**: Supabase Realtime (für Live-Updates)
- **Migrations**: SQL-basiert mit Versionierung

### **Development & Quality**
- **Package Manager**: pnpm (performance-optimiert)
- **Local Development**: Docker-Compose + Supabase
- **Code Quality**: ESLint + TypeScript strict + Prettier
- **Architecture**: Domain-driven Hooks (business/core/ui)
- **Testing**: Funktionstest-Checklisten + E2E-Workflows
- **Documentation**: Comprehensive `/docs` mit Business-Konzept

## 🗄️ Business-Centric Datenbankschema

### **Business-Level Tabellen** (Shared Resources)
- **`items`**: Shared Produkt-/Service-Katalog (KEINE user_id!)
- **`daily_summaries`**: Tagesabschlüsse (business-owned mit created_by audit)
- **`monthly_summaries`**: Monatsabschlüsse (persistente Status-Verwaltung)

### **User-Level Tabellen** (Audit Trail)
- **`sales`**: POS-Verkäufe (wer hat verkauft)
- **`sale_items`**: Verkaufsposten (Foreign Key zu items)
- **`expenses`**: Business-Ausgaben (wer hat erfasst)
- **`cash_movements`**: Kassenbuch (wer hat ausgelöst)
- **`documents`**: PDF-Verwaltung (wer hat erstellt)

### **System-Tabellen**
- **`users`**: Benutzer mit Rollen (admin/staff)
- **System User**: `00000000-0000-0000-0000-000000000000` für Automation

### **Architektur-Prinzipien**
- ✅ **Saubere Trennung**: Business-Data ≠ User-Data
- ✅ **Audit Trail**: `created_by` statt `user_id` für Geschäftsdaten
- ✅ **Shared Resources**: Items sind system-weit verfügbar
- ✅ **Status-Persistierung**: Daily/Monthly Summaries mit Draft/Closed States
- ✅ **Foreign Key Constraints**: Datenintegrität gewährleistet

Detailliertes Schema: `/supabase/migrations/00_complete_business_centric_schema.sql`

## 🔄 Täglicher Workflow

### **Geschäftsbetrieb**
1. **Automatische Daily Summary**: System erstellt täglich DRAFT-Summary
2. **POS-Verkäufe**: Bar-, TWINT-, SumUp-Zahlungen mit automatischen Quittungen
3. **Ausgaben erfassen**: Separate Verwaltung (Miete, Einkauf, Lohn, etc.)
4. **Kassenbuch**: Automatische Bargeld-Tracking bei Cash-Transaktionen
5. **Tagesabschluss**: Status DRAFT → CLOSED (mit Kassensturz)

### **Monatsabschluss**
1. **Validierung**: Alle Tagesabschlüsse CLOSED oder CORRECTED
2. **Monthly Summary**: Aggregation aller Daily Summaries + Ausgaben
3. **PDF-Export**: Vollständiger Monatsbericht für Buchhaltung
4. **Status schließen**: DRAFT → CLOSED (unveränderlich)

### **Korrektur-Workflow** (geplant)
- Nachträgliche Anpassungen mit Dokumentation
- Status CLOSED → CORRECTED
- Neues PDF mit Korrektur-Anhang
- Original bleibt archiviert (Audit-Trail)

## 🔐 Sicherheit & Berechtigungen

### **Authentifizierung**
- **Supabase Auth**: JWT-basierte Session-Verwaltung
- **Row Level Security (RLS)**: Datenbankebene-Autorisierung
- **Auto-User-Sync**: Automatische users-Tabelle Synchronisation

### **Benutzerrollen**
- **👑 Admin**: Vollzugriff, Korrekturen, Monatsabschlüsse, User-Management
- **👤 Staff**: POS-Verkäufe, Ausgaben erfassen, Berichte einsehen (read-only)
- **🤖 System**: Automation User für Imports und System-Operations

### **Business-Centric Permissions**
- **Business-Level**: Alle authentifizierten User können auf Shared Data zugreifen
- **User-Level**: RLS filtert nach user_id für persönliche Aktionen
- **Audit-Trail**: `created_by` für Nachverfolgung ohne Ownership-Einschränkung

## 📚 Umfassende Dokumentation

Das `/docs`-Verzeichnis enthält detaillierte Dokumentation:

### **Konzept & Architektur**
- [`konzept.md`](/docs/konzept.md) - Vollständiges Business-Konzept mit Workflows
- [`Business-Centric-Refactoring.md`](/docs/Business-Centric-Refactoring.md) - Architektur-Umstellung
- [`pos-doc.md`](/docs/pos-doc.md) - Funktionelle POS-Spezifikation

### **Setup & Migration**
- [`setup_supabase.md`](/docs/setup_supabase.md) - Supabase-Konfiguration
- [`migration.md`](/docs/migration.md) - Datenbank-Migrations
- [`README_FRESH_SETUP.md`](/docs/README_FRESH_SETUP.md) - Komplettes Neu-Setup

### **Import & Integration**
- [`Import.md`](/docs/Import.md) - JSON-Import System für historische Daten
- [`funktionstest-checkliste.md`](/docs/funktionstest-checkliste.md) - Test-Workflows

### **Status & Entwicklung**
- [`aktueller-stand-nach-funktionstest.md`](/docs/aktueller-stand-nach-funktionstest.md) - Aktueller Implementierungsstand
- [`refactoring.md`](/docs/refactoring.md) - Code-Verbesserungen

## 🚀 System-Status & Roadmap

### **✅ Produktions-Bereit (90% Complete)**
- **POS-System**: Vollständig funktional mit allen Schweizer Zahlungsarten (Bar, TWINT, SumUp)
- **PDF-System**: Modernisiert mit @react-pdf/renderer (68% Code-Reduktion erreicht)
- **Tagesabschlüsse**: Status-Management mit "Missing Closures Detection"
- **Monatsabschlüsse**: Komplett refactored - modular und performant
- **Import-System**: Produktions-bereites JSON-Import mit 7-Phasen-Prozess
- **Dokumentenverwaltung**: Zentrale PDF-Verwaltung komplett überarbeitet
- **Business-Centric Schema**: Vollständig implementiert (11→7 Tabellen)
- **Hooks-Architektur**: Neu strukturiert in business/core/ui Domains

### **🔧 Finale Integration (5% Remaining)**
- End-to-End Testing mit Echtdaten
- Workflow-Kontinuität zwischen Modulen verfeinern
- Buchhaltungs-Export (ZIP-Struktur)

### **⚠️ Zukünftige Erweiterungen (5%)**
- Korrektur-System für Nachbuchungen
- Status-Schutz (POS-Warnung bei geschlossenen Tagen)
- Multi-Location Support
- Advanced Analytics & Mobile App

## 📈 Performance & Qualität

### **Code Quality Metriken**
- **PDF-System**: 68% Code-Reduktion durch React-PDF Migration
- **Database Schema**: 11→7 Tabellen (business-centric)
- **Hook-Architecture**: Domain-driven Organisation (3 Kategorien)
- **Time-to-Feature**: Zielzeit ~1h (vs. 7-8h vorher)

### **Produktions-Bereitschaft**
- **Core POS**: ✅ 100% funktional, alle Zahlungsarten
- **Import-System**: ✅ 7-Phasen-Prozess, produktions-bereit  
- **PDF-Generation**: ✅ Automatisch für alle Dokumente
- **Business Logic**: ✅ Vollständig implementiert
- **Integration**: 🔧 95% - finale Tests laufend

## 🤝 Mitwirken

Das Projekt folgt modernen Entwicklungsstandards:

- **TypeScript Strict Mode**: 100% typisiert, null-safe
- **Business-Centric Architecture**: Domain-driven Design
- **Hook-Pattern**: Geschäftslogik gekapselt in Custom Hooks  
- **Component Composition**: Modulare, wiederverwendbare UI
- **Documentation-First**: Umfassende `/docs` für Business & Tech

## 📝 Lizenz

Dieses Projekt ist lizenziert unter der [MIT Lizenz](LICENSE).

## 🙏 Danksagungen

- [Next.js](https://nextjs.org/) für das Framework
- [Supabase](https://supabase.io/) für die Backend-Dienste
- [Shadcn/UI](https://ui.shadcn.com/) für die UI-Komponenten
- [Tailwind CSS](https://tailwindcss.com/) für das Styling-System