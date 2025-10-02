---
description: Verschafft Claude einen vollständigen Überblick über das POS-Lia-Hair-Projekt
allowed-tools: ["Read", "Glob", "Grep", "Bash", "mcp__archon__find_tasks", "mcp__archon__rag_search_knowledge_base", "mcp__archon__rag_search_code_examples"]
arguments:
  - name: focus
    description: "Optionaler Fokus-Bereich: 'banking', 'pos', 'appointments', 'expenses', 'dashboard', 'products', 'settings', 'transactions', 'customers', 'cash-register', 'organization'"
    required: false
---

# 🏢 POS-Lia-Hair Projekt-Primer

**Ziel:** Verschaffe dir einen gründlichen Überblick über das POS-Lia-Hair-Projekt und präsentiere eine prägnante Zusammenfassung auf Deutsch.

{{#if focus}}
**Session-Fokus:** {{focus}} Modul
{{/if}}

---

## 0. 🚨 Archon-First Check (MANDATORY!)

**BEFORE ANYTHING ELSE:**

1. **Check if Archon project exists:**
   ```bash
   mcp__archon__find_projects(query="POS Lia Hair")
   ```

2. **Get current tasks:**
   ```bash
   mcp__archon__find_tasks(filter_by="status", filter_value="todo")
   {{#if focus}}
   # Filter for {{focus}} feature
   mcp__archon__find_tasks(query="{{focus}}", include_closed=false)
   {{/if}}
   ```

3. **Search relevant knowledge:**
   ```bash
   {{#if focus}}
   mcp__archon__rag_search_knowledge_base(query="{{focus}} implementation patterns", match_count=5)
   mcp__archon__rag_search_code_examples(query="{{focus}} swiss compliance", match_count=3)
   {{else}}
   mcp__archon__rag_search_knowledge_base(query="multi-tenant SaaS architecture", match_count=5)
   {{/if}}
   ```

**Output:**
- Liste aktive Tasks (todo/doing)
- Identifiziere nächste Priorität (highest task_order)
- Zeige relevante Archon-Knowledge

---

## 1. Hauptdokumentation lesen

Lies die folgenden Dateien vollständig:
- `README.md` - Hauptprojekt-Dokumentation (256 Zeilen Enterprise-Architektur)
- `CLAUDE.md` - Claude Code Guidance (enthält Archon-Workflow, Multi-Tenant Patterns)

{{#if focus}}
**Modul-spezifisch:**
- `src/modules/{{focus}}/README.md` (falls vorhanden)
- `src/modules/{{focus}}/types.ts` - Type Definitions
{{/if}}

---

## 2. Projektstruktur analysieren

**Core Directories:**
```
pos-lia-hair/
├── src/modules/          → 11 Business-Module (modular architecture)
│   ├── pos/             → Point-of-Sale mit Swiss Compliance
│   ├── banking/         → CAMT.053 + TWINT + SumUp Integration
│   ├── cash-register/   → Kassenbuch & Cash Movements
│   ├── dashboard/       → Business Intelligence & KPIs
│   ├── expenses/        → Ausgaben-Management + Supplier Intelligence
│   ├── products/        → Produkt-/Service-Katalog
│   ├── settings/        → Business Configuration + Data Import
│   ├── transactions/    → Transaction Center & Reporting
│   ├── appointments/    → Termin-Buchung mit Kalender
│   ├── customers/       → Kunden-Management mit Sales History
│   └── organization/    → Multi-Tenant Organization Management
├── src/shared/          → Shared Services & Utilities
├── app/                 → Next.js 15 App Router
├── supabase/migrations/ → 33+ Database Migrations
└── infrastructure/      → Docker + Supabase Setup
```

{{#if focus}}
**Fokus auf {{focus}}/ Modul:**
```bash
find src/modules/{{focus}} -type f -name "*.ts*" | head -20
```
{{/if}}

---

## 3. Technologie-Stack erfassen

### **Frontend (Enterprise-Grade)**
- **Framework:** Next.js 15.1.0 (App Router, React 19, TypeScript 5)
- **Styling:** Tailwind CSS 3.4.17 + Shadcn/UI (Radix primitives)
- **State Management:** TanStack Query 5.75.2 + Context API
- **Forms:** React Hook Form + Zod Validation
- **PDF Generation:** @react-pdf/renderer 4.3.0
- **Linting:** Biome 2.2.0 (ersetzt ESLint/Prettier)

### **Backend & Database (Production-Ready)**
- **Database:** PostgreSQL with Supabase (self-hosted auf Hetzner)
- **Architecture:** Multi-Tenant with Row Level Security (RLS)
- **Auth:** JWT-based with organization context
- **Storage:** Organization-isolated file storage
- **Real-time:** Live updates across organization

### **Swiss Banking Integration**
- **CAMT.053:** Swiss banking standard parser
- **TWINT:** Settlement file processing
- **SumUp:** European card payment integration
- **Compliance:** Swiss business day + timezone handling

---

## 4. Datenbankschema verstehen

**Multi-Tenant Design:**
- **Platform Level:** Mehrere Organisationen auf einer Infrastruktur
- **Organization Level:** Jeder Salon hat isolierte Daten mit `organization_id`
- **Row Level Security (RLS):** Automatische Daten-Isolation

### **Business-Level Data (Shared Resources)**
Keine user_id, da Business-owned:
- `organizations` - Salon-Instanzen
- `organization_users` - Team-Mitgliedschaften
- `business_settings` - Pro-Salon Konfiguration
- `items` - Produkt-/Service-Katalog
- `daily_summaries` - Tagesabschlüsse
- `monthly_summaries` - Monatsabschlüsse

### **User-Level Data (Audit Trail)**
Mit created_by für Nachverfolgung:
- `sales` → POS-Verkäufe (wer hat verkauft)
- `sale_items` → Verkaufsdetails
- `expenses` → Business-Ausgaben (wer hat erfasst)
- `cash_movements` → Kassenbuch (wer hat ausgelöst)
- `documents` → PDF-Verwaltung (wer hat erstellt)
- `bank_transactions` → Banking-Daten (wer hat importiert)
- `provider_settlements` → TWINT/SumUp Settlements

{{#if focus}}
### **{{focus}}-Modul Tabellen:**
{{#if (eq focus "banking")}}
- `bank_transactions` - CAMT.053 Import-Daten
- `provider_settlements` - TWINT/SumUp Settlements
- `provider_import_sessions` - Batch-Tracking
- `cash_movements` (type: 'bank_transfer') - Bank ↔ Kasse
{{/if}}
{{#if (eq focus "pos")}}
- `sales` - Verkaufs-Transaktionen
- `sale_items` - Line Items mit item_id
- `daily_summaries` - Tagesabschlüsse (DRAFT → CLOSED)
- `receipt_numbers` - Schweizer Belegnummerierung (VK2025000123)
{{/if}}
{{#if (eq focus "expenses")}}
- `expenses` - Ausgaben-Transaktionen
- `suppliers` - Lieferanten-Stammdaten
- `documents` - PDF-Verwaltung
- `expense_categories` - Kategorisierung
{{/if}}
{{/if}}

---

## 5. Entwicklungs-Workflow

### **Development URLs**
- **Frontend:** http://localhost:3000
- **Supabase Studio:** http://localhost:54323
- **PostgreSQL:** localhost:54322
- **Organization Pages:** http://localhost:3000/org/[slug]/

### **Wichtige Commands**
```bash
# Development
pnpm dev                 # Start dev server
pnpm build              # Production build
pnpm start              # Production server

# Code Quality
pnpm lint:fix           # Biome auto-fix
pnpm type-check         # TypeScript validation
pnpm pre-commit         # Lint + Type-Check
pnpm quality-gate       # Full check: lint + type + build

# Supabase
cd infrastructure && ./setup_fresh_db.sh  # Fresh DB setup
supabase db reset                         # Reset migrations
supabase migration new [name]             # New migration
```

### **Environment Setup**
```bash
# Required .env.local variables
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 📊 Output-Format (auf Deutsch)

### 🎯 Projekt-Überblick
**Multi-Tenant SaaS Platform** für Schweizer Coiffeur-Salons mit vollständigem POS-System, intelligenter Banking-Integration und Business-Management.

**Kernmerkmale:**
- 🏪 Self-Service Salon-Registration mit branded URLs
- 💰 Swiss Compliance (MwSt 7.7%, CAMT.053, Belegnummerierung)
- 🏦 Intelligente Zahlungsabgleichung (TWINT, SumUp, Bank)
- 👥 Multi-User mit granularen Berechtigungen
- 📊 Business Intelligence & Reporting

{{#if focus}}
### 🎯 {{focus}}-Modul Fokus

{{#if (eq focus "banking")}}
**Zweck:** Intelligente Zahlungsabgleichung mit CAMT.053, TWINT, SumUp

**Kernfunktionen:**
- CAMT.053 Swiss Banking Import (XML parsing)
- Provider Settlement Processing (TWINT/SumUp CSV)
- Intelligent Transaction Matching (KI-basiert)
- Manual Reconciliation Flows
- Fee Transparency (echte vs. geschätzte Gebühren)

**Key Files:**
- `src/modules/banking/services/camtParser.ts` - CAMT.053 Parser
- `src/modules/banking/services/transactionMatcher.ts` - Matching Logic
- `src/modules/banking/components/BankingDashboard.tsx` - Main UI
{{/if}}

{{#if (eq focus "pos")}}
**Zweck:** Schweizer POS-System mit Compliance und Multi-Payment

**Kernfunktionen:**
- Multi-Payment Support (Bar, TWINT, SumUp, Karte)
- Automatic Belegnummerierung (VK2025000123)
- PDF-Receipt Generation mit Signed URLs
- Daily Closures (DRAFT → CLOSED → CORRECTED)
- Swiss VAT Handling (7.7% gross principle)

**Key Files:**
- `src/modules/pos/components/POSInterface.tsx` - Main POS UI
- `src/modules/pos/services/receiptService.ts` - PDF Generation
- `src/modules/pos/hooks/useDailyClosure.ts` - Tagesabschluss
{{/if}}

{{#if (eq focus "expenses")}}
**Zweck:** Ausgaben-Management mit Supplier Intelligence

**Kernfunktionen:**
- Kategorisierte Ausgaben-Verwaltung
- Deutsche Volltextsuche für Lieferanten
- Document Management (PDF-Upload/Viewer)
- Auto-Population von Supplier-Daten
- Monthly/Quarterly Reporting

**Key Files:**
- `src/modules/expenses/components/ExpenseForm.tsx` - Erfassung
- `src/modules/expenses/services/supplierSearch.ts` - Fuzzy Search
- `src/modules/expenses/hooks/useExpenseCategories.ts` - Kategorien
{{/if}}
{{/if}}

### 🏗️ Tech-Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5
- **Database:** PostgreSQL mit Supabase (self-hosted)
- **Styling:** Tailwind CSS + Shadcn/UI
- **State:** TanStack Query + Context API
- **Linting:** Biome (ersetzt ESLint/Prettier)

### 🔐 Multi-Tenant Architecture
- **Organization-based isolation:** Alle Tabellen haben `organization_id`
- **Row Level Security (RLS):** Automatische Policy-Enforcement
- **URL Structure:** `/org/[slug]/` für Salon-spezifische Seiten
- **JWT Context:** `organization_id` in auth.user.user_metadata

### 📊 Datenbankschema
- **Business-Level:** organizations, items, daily_summaries, business_settings
- **User-Level:** sales, expenses, bank_transactions, cash_movements
- **Audit Trail:** `created_by` auf allen User-Level Tables

### 🚀 Development
```bash
pnpm dev          # → http://localhost:3000
pnpm type-check   # TypeScript validation
pnpm lint:fix     # Biome auto-fix
```

{{#if (archonTasksFound)}}
### 📋 Archon Tasks (Aktiv)
{{taskList}}
**Nächster Schritt:** {{nextTask}}
{{/if}}

---

**Anweisungen:**
- Alle Antworten auf **Deutsch**
- Prägnant und strukturiert
- Fokus auf praktische Information für {{#if focus}}{{focus}}-Modul{{else}}Gesamtprojekt{{/if}}
- Multi-Tenant Kontext beachten (`organization_id` filtering!)
- Swiss Compliance berücksichtigen (MwSt, Belegnummerierung, CAMT.053)
- Ultrathink pls.
