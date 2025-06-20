# 🏢 Multi-Tenant Hair Salon POS Platform

Eine **professionelle Multi-Tenant SaaS Platform** für Schweizer Coiffeur-Salons. Entwickelt mit **Enterprise-Architektur**, Next.js 15 und Supabase für maximale Skalierbarkeit und Compliance.

![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Self--Hosted-3ECF8E)
![Multi-Tenant](https://img.shields.io/badge/Architecture-Multi--Tenant-green)
![Status](https://img.shields.io/badge/Status-Live%20on%20Hetzner-brightgreen)

## 🎯 **Was ist das System?**

**Multi-Tenant SaaS Platform** die es Schweizer Coiffeur-Salons ermöglicht:
- 🏪 **Eigene Organisation** mit individueller Branding und Einstellungen zu erstellen
- 👥 **Mehrere Mitarbeiter** mit granularen Berechtigungen zu verwalten  
- 💰 **Vollständiges POS-System** mit Schweizer Compliance (MwSt, Belegnummerierung)
- 🏦 **Intelligente Banking-Integration** (CAMT.053, TWINT, SumUp)
- 📊 **Umfassendes Business-Management** (Ausgaben, Lieferanten, Reporting)

## 🏗️ **Enterprise-Architektur**

### **Multi-Tenant Design**
```
Platform Level:
├── Tenant 1: Salon "LIA Hair" (/org/lia-hair/)
├── Tenant 2: Salon "Beauty Studio" (/org/beauty-studio/)  
└── Tenant N: Beliebige Salons (/org/[slug]/)

Each Tenant:
├── Eigene Daten-Isolation (Row-Level Security)
├── Individual Branding & Business Settings
├── Separate Benutzer & Berechtigungen
└── Unabhängige Backup & Compliance
```

### **7 Core Module**
```
src/modules/
├── 🛒 pos/           → Point-of-Sale mit Zahlungsarten
├── 💰 banking/       → Intelligente Zahlungsabgleichung  
├── 💳 cash-register/ → Kassenbuch & Bargeld-Tracking
├── 📊 dashboard/     → Business Intelligence & KPIs
├── 💸 expenses/      → Ausgaben-Management & Lieferanten
├── 📦 products/      → Produkt- & Service-Katalog
├── ⚙️ settings/      → Business-Konfiguration & Import
└── 🔄 transactions/ → Transaction-Center & Reporting
```

## 🌟 **Kernfunktionen**

### **🏪 Multi-Tenant SaaS**
- **Organisation Creation** - Self-Service Salon-Registration
- **Team Management** - Mitarbeiter einladen mit Rollen (Admin/Staff)
- **Brand Customization** - Logo-Upload, individuelle Business-Settings
- **Data Isolation** - Vollständige Trennung zwischen Organisationen
- **Custom Slugs** - Branded URLs pro Salon (`/org/ihr-salon-name/`)

### **💰 Schweizer POS-System**
- **Multi-Payment Support** - Bar, TWINT, SumUp, Kartenzahlung
- **Swiss Compliance** - 7.7% MwSt, Schweizer Belegnummerierung (VK2025000123)
- **Automatic Receipts** - PDF-Generierung mit Signed URLs
- **Daily Closures** - Status-Management (DRAFT → CLOSED → CORRECTED)
- **Monthly Reports** - Buchhaltungs-konforme Abschlüsse

### **🏦 Banking-Integration (Enterprise-Level)**
- **CAMT.053 Import** - Schweizer Banking-Standard  
- **Provider Settlement** - TWINT/SumUp automatische Abgleichung
- **Intelligent Matching** - KI-basierte Transaktions-Zuordnung
- **Manual Reconciliation** - Komplexe Zahlungsabgleiche
- **Fee Transparency** - Echte vs. geschätzte Provider-Gebühren

### **📊 Business Management**
- **Expense Tracking** - Kategorisierte Ausgaben-Verwaltung
- **Supplier Intelligence** - Deutsche Volltextsuche & Auto-Population
- **Document Management** - Zentrale PDF-Verwaltung mit Kategorisierung
- **Advanced Reporting** - Monats-/Quartals-/Jahresberichte
- **Multi-User Workflows** - Audit-Trail & Berechtigungsmanagement

## 🚀 **Quick Start (Development)**

### **Voraussetzungen**
- Node.js 18+ und pnpm
- Docker & docker-compose für Supabase
- Git für Repository-Management

### **1. Repository Setup**
```bash
git clone https://github.com/yourusername/multi-tenant-pos.git
cd multi-tenant-pos
pnpm install
```

### **2. Supabase lokal einrichten**
```bash
# Vollständige Anleitung in docs/setup/supabase-setup.md
./setup_fresh_db.sh
```

### **3. Environment konfigurieren**
```bash
cp .env.example .env.local
# Anpassen der Werte (siehe docs/setup/supabase-setup.md)
```

### **4. Development Server**
```bash
pnpm dev
# → http://localhost:3000
```

### **5. Erste Organisation erstellen**
```
1. Registrieren: http://localhost:3000/register
2. Organisation erstellen: http://localhost:3000/organizations/create  
3. Salon einrichten: http://localhost:3000/org/[ihr-slug]/settings
```

## 🔧 **Technologie-Stack**

### **Frontend (Enterprise-Grade)**
- **Framework**: Next.js 15.1.0 (App Router, React 19)
- **Language**: TypeScript 5 (strict mode, full coverage)
- **Styling**: Tailwind CSS 3.4.17 + Shadcn/UI
- **State**: TanStack Query 5.75.2 + Context API
- **Forms**: React Hook Form + Zod Validation
- **PDF System**: @react-pdf/renderer 4.3.0

### **Backend & Database (Production-Ready)**
- **Database**: PostgreSQL with Supabase (self-hosted)
- **Architecture**: Multi-Tenant with Row Level Security (RLS)
- **Auth**: JWT-based with organization context
- **Storage**: Organization-isolated file storage
- **Real-time**: Live updates across organization
- **API**: Auto-generated REST + TypeScript types

### **Swiss Banking Integration**
- **CAMT.053**: Swiss banking standard parser
- **TWINT**: Settlement file processing  
- **SumUp**: European card payment integration
- **Provider Matching**: Intelligent transaction reconciliation
- **Compliance**: Swiss business day + timezone handling

## 🗄️ **Multi-Tenant Database Design**

### **Organization-Level Data (Shared per Tenant)**
```sql
organizations          → Salon-Instanzen
organization_users      → Team-Mitgliedschaften  
business_settings      → Pro-Salon Konfiguration
items                  → Produkt-/Service-Katalog
daily_summaries        → Tagesabschlüsse
monthly_summaries      → Monatsabschlüsse
```

### **User-Level Data (Audit Trail)**
```sql
sales                  → POS-Verkäufe (wer hat verkauft)
sale_items            → Verkaufsdetails (user_id + organization_id)
expenses              → Business-Ausgaben (wer hat erfasst)
cash_movements        → Kassenbuch (wer hat ausgelöst)  
documents             → PDF-Verwaltung (wer hat erstellt)
bank_transactions     → Banking-Daten (wer hat importiert)
```

### **Security & Isolation**
- **Row Level Security (RLS)** auf allen Tabellen
- **Organization-basierte Policies** (`organization_id IN (...)`)
- **Audit Trail** mit `created_by` für Nachverfolgung
- **Automatic User Sync** zwischen Supabase Auth und users table

## 🌍 **Production Deployment**

### **Self-Hosted Supabase (Empfohlen)**
```bash
# Vollständige Anleitung in docs/setup/supabase-setup.md
# - VPS Setup (Hetzner/DigitalOcean)
# - Docker-basierte Supabase Installation  
# - SSL-Zertifikate mit Let's Encrypt
# - Backup-Strategien & Monitoring
```

### **Multi-Tenant Scaling**
- **Horizontal**: Mehrere Datenbank-Instanzen pro Region
- **Vertical**: CPU/RAM-Skalierung basierend auf Tenant-Anzahl
- **CDN**: Asset-Delivery für Organization-Branding
- **Monitoring**: Pro-Tenant Performance-Metriken

## 📚 **Dokumentation**

### **Setup & Development**
- [`docs/setup/setup_supabase.md`](docs/setup/setup_supabase.md) - **610 Zeilen Gold-Standard Setup**
- [`DEPLOYMENT.md`](DEPLOYMENT.md) - Production Deployment (Hetzner + Coolify)
- [`PRE_DEPLOYMENT_CHECKLIST.md`](PRE_DEPLOYMENT_CHECKLIST.md) - Go-Live Checklist

### **Business & Architecture** 
- [`docs/business/konzept.md`](docs/business/konzept.md) - Schweizer Buchhaltungs-Konzept
- [`docs/business/MULTI_TENANT_IMPLEMENTATION_PLAN.md`](docs/business/MULTI_TENANT_IMPLEMENTATION_PLAN.md) - Multi-Tenant Design
- [`docs/technical/BANKING_MODULE_DEVELOPMENT.md`](docs/technical/BANKING_MODULE_DEVELOPMENT.md) - Banking-Integration

### **Migration & Strategy**
- [`MIGRATION_STRATEGY.md`](MIGRATION_STRATEGY.md) - Database-Migration Strategy
- [`docs/technical/refactoring-cleanup-2025.md`](docs/technical/refactoring-cleanup-2025.md) - Code-Reorganisation

## 🎯 **Current Status**

### **🚀 LIVE ON HETZNER - TEST ENVIRONMENT**
- **Server:** `167.235.150.94` (Hetzner Cloud VPS)
- **Database:** `https://db.lia-hair.ch` (Self-hosted Supabase)
- **Status:** ✅ **DEPLOYED & TESTING**

### **✅ Production-Ready Features (95%)**
- Multi-Tenant Organization Management ✅ **LIVE**
- Complete POS System with Swiss Compliance ✅ **LIVE**
- Banking Integration (CAMT.053, TWINT, SumUp) ✅ **LIVE**
- Expense Management & Supplier Intelligence ✅ **LIVE**
- Document Management & PDF Generation ✅ **LIVE**
- Business Settings & Team Management ✅ **LIVE**
- Transaction Center & Advanced Reporting ✅ **LIVE**

### **🧪 Currently Testing (5%)**
- Multi-Organization Performance unter Real Load
- Banking Workflow End-to-End Validation  
- Multi-User Concurrent Access Testing
- Production-grade Error Handling

## 🤝 **Multi-Tenant SaaS Features**

### **Enterprise-Ready**
- **Self-Service Onboarding** - Salons können sich selbst registrieren
- **Team Collaboration** - Mehrbenutzersystem mit Rollen
- **Data Sovereignty** - Jeder Salon hat vollständige Kontrolle über seine Daten
- **Swiss Compliance** - Bruttoprinzip, Belegnummerierung, MwSt-Behandlung
- **Audit Trail** - Vollständige Nachverfolgung aller Änderungen

### **Business Value**
- **Skalierbarkeit** - Unbegrenzte Salon-Anzahl auf einer Platform
- **Kosteneffizienz** - Shared Infrastructure, individuelle Features
- **Compliance** - Automatische Schweizer Business-Standards
- **Integration** - Banking, Payment-Provider, Buchhaltungssysteme
- **Customization** - Pro-Salon Branding und Business-Logic

## 📞 **Support & Community**

- **Documentation**: [`docs/`](docs/) Verzeichnis → Siehe [`docs/README.md`](docs/README.md) für Navigation
- **Issues**: GitHub Issues für Bug-Reports und Feature-Requests
- **Multi-Tenant Setup**: [`docs/setup/setup_supabase.md`](docs/setup/setup_supabase.md)
- **Production Deployment**: [`DEPLOYMENT.md`](DEPLOYMENT.md)

## 📝 **License**

This project is licensed under the [MIT License](LICENSE).

---

**🏢 Enterprise Multi-Tenant POS Platform für die Schweizer Coiffeur-Branche**  
**Entwickelt mit Next.js 15, Supabase und Enterprise-Architektur-Prinzipien**