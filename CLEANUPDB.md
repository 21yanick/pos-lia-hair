# 🧹 Clean Database Migration Plan

**Ziel**: 100% reproduzierbare Database mit Single Source of Truth

**Prinzipien**: KISS, YAGNI, Clean Architecture

**Reduktion**: 33+ Migrationen → 3 saubere Migrationen | 26 Tabellen → 15 Kern-Tabellen

---

## 📋 Requirements Analysis

### ✅ Core Business (Täglich genutzt)
- **POS System**: Verkauf, Kasse, Artikel, Kunden
- **Terminbuchung**: Appointments mit Kunden/Services
- **Ausgabenverwaltung**: Expenses mit Suppliers
- **Basis-Reporting**: Tages/Monats-Zusammenfassungen
- **Multi-Tenancy**: Organisationen, Users, Rollen

### ❌ Over-Engineering (Selten/Nie genutzt)
- Komplexe Banking-Reconciliation (20+ Tabellen)
- Provider Import Automation (TWINT/SumUp)  
- Owner Transaction Tracking
- Audit Logging (über Business-Minimum hinaus)
- Advanced Financial Analytics

---

## 🎯 Minimal Viable Schema (15 Tabellen)

### **Tier 1: Multi-Tenancy Foundation (3 Tabellen)**
```sql
organizations          -- Salon/Business (1 pro Kunde)
users                  -- Auth-User (Supabase auth.users)
organization_users     -- User-Rolle-Mapping (owner/admin/staff)
```

### **Tier 2: Core Business (4 Tabellen)**
```sql
items                  -- Services/Produkte im Katalog
customers              -- Kundenstamm mit Kontaktdaten  
sales                  -- Verkäufe/Transaktionen
sale_items             -- Verkaufte Items (N:M zu sales/items)
```

### **Tier 3: Business Operations (5 Tabellen)**
```sql
expenses              -- Ausgaben mit Kategorie
suppliers             -- Lieferanten/Partner
documents             -- PDF Storage (Belege, Reports)
appointments          -- Terminbuchungen
business_settings     -- Org-spezifische Einstellungen
```

### **Tier 4: Reporting (3 Tabellen)**
```sql
daily_summaries       -- Tagesabschlüsse (cash/digital payments)
monthly_summaries     -- Monats-Reports
cash_movements        -- Kassen-Bewegungen (simplified)
```

---

## 🏗️ Entity Relationship Design

### **Core Relationships**
```
Organizations (1) ← (N) Users                   -- Multi-Tenancy
Organizations (1) → (N) Customers/Sales/Items   -- Org-Scoped Data

Customers (1) ← (N) Sales                       -- Customer Assignment
Customers (1) ← (N) Appointments                -- Booking History

Sales (1) → (N) Sale_Items → (1) Items          -- POS Cart
Sales (1) → (1) Documents                       -- Receipt PDF

Appointments (1) → (1) Items                    -- Service Booking
Appointments (1) → (1) Customers                -- Customer Link

Expenses (1) → (1) Suppliers                    -- Expense Tracking
Expenses (1) → (1) Documents                    -- Receipt PDF
```

### **Key Constraints**
- **Organization Isolation**: Alle Business-Tabellen haben `organization_id`
- **Receipt Numbers**: Auto-generated per Organization (`VK2025000001`)
- **Multi-Payment Support**: `payment_method: 'cash' | 'twint' | 'sumup'`
- **Soft Deletes**: `active: boolean` für kritische Business-Daten

---

## 🚀 Migration Strategy (3 Clean Migrations)

### **01_foundation.sql** (~800 Zeilen)
```sql
-- Extensions (uuid, RLS)
-- ENUMs (payment_method, user_role, etc.)
-- Core Tables:
  - organizations (complete schema)
  - users (Supabase integration)  
  - organization_users (role mapping)
  - business_settings (org configuration)
```

### **02_business_core.sql** (~1000 Zeilen)  
```sql
-- Business Tables:
  - customers (with notes field)
  - items (services/products catalog)
  - sales (with customer_name fallback)
  - sale_items (cart items)
  - appointments (with customer/service link)
  - expenses (with supplier reference)
  - suppliers (with categories)
  - documents (PDF storage)

-- Basic Functions:
  - Receipt number generation
  - Customer search (German FTS)
  - Basic business calculations
```

### **03_reporting_security.sql** (~600 Zeilen)
```sql  
-- Reporting Tables:
  - daily_summaries
  - monthly_summaries  
  - cash_movements (simplified)

-- Views:
  - unified_transactions_view
  - customer_sales_history

-- RLS Policies (organization-scoped)
-- Performance Indexes
-- Seed Data (demo organization)
```

**Total: ~2400 Zeilen vs. 5528 Zeilen (57% Reduktion)**

---

## 📝 Type System Integration

### **Automated Type Generation**
```json
// package.json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id YOUR_ID > types/supabase_generated.ts",
    "db:reset-local": "supabase db reset --local",
    "db:diff": "supabase db diff --schema public"
  }
}
```

### **Clean Type Structure**
```typescript
// types/database.ts (neue Struktur)
export * from './supabase_generated'     // Generated types nur
export type * from './business'          // Custom business types
export type * from './ui'                // UI-spezifische types

// Keine manuellen Modifications in generated files!
```

### **Service Layer Types**
```typescript
// Beispiel: Clean service interfaces
export interface CreateSaleRequest {
  items: CartItem[]
  customer_id?: string
  customer_name?: string  // Walk-in fallback
  payment_method: PaymentMethod
}

export interface SaleWithItems extends Sale {
  sale_items: (SaleItem & { item: Item })[]
  customer?: Customer
  document?: Document
}
```

---

## 🛠️ Implementation Plan

### **Phase 1: Vorbereitung (1 Tag)**
- [ ] **Backup**: Vollständiger Production DB Export
- [ ] **Validierung**: Welche Daten sind aktuell in Production?
- [ ] **Cleanup**: Nicht mehr genutzte Migrations archivieren
- [ ] **Setup**: Supabase CLI für Type-Generation konfigurieren

### **Phase 2: Schema Design (2 Tage)**
- [ ] **01_foundation.sql**: Multi-Tenancy + Core Setup
- [ ] **02_business_core.sql**: Alle Business-Tabellen + Functions  
- [ ] **03_reporting_security.sql**: Reporting + RLS + Indexes
- [ ] **Validierung**: Syntax-Check und Dependency-Order

### **Phase 3: Data Migration (1 Tag)**
- [ ] **Staging DB**: Fresh Setup mit 3 Clean Migrations
- [ ] **Data Transfer**: Production → Staging (nur relevante Daten)
- [ ] **Testing**: Alle Core Business Workflows testen
- [ ] **Type Generation**: Fresh TypeScript Types generieren

### **Phase 4: Deployment (1 Tag)**
- [ ] **Production Switch**: Atomic Migration Replacement
- [ ] **Validation**: Health-Checks und Smoke Tests
- [ ] **Documentation**: README und Setup-Instructions
- [ ] **Team Training**: Neue Migration-Procedures

---

## ✅ Success Criteria

### **Technical Goals**
- ✅ **100% Reproduzierbar**: Fresh DB Setup in 5 Minuten
- ✅ **Single Source of Truth**: Generated Types ohne manuelle Edits
- ✅ **57% Complexity Reduction**: 15 statt 26 Tabellen
- ✅ **KISS Compliant**: Jede Tabelle hat klaren Business-Purpose

### **Business Goals**
- ✅ **Zero Downtime**: Alle Core-Features funktionieren
- ✅ **Performance**: POS Operations < 200ms
- ✅ **Maintainability**: Neue Developer können Schema in 30min verstehen
- ✅ **Scalability**: Multi-Tenant Ready für SaaS Expansion

### **Quality Gates**
- ✅ **TypeScript Strict Mode**: 0 Type-Errors
- ✅ **Database Constraints**: Foreign Keys + Check Constraints
- ✅ **Security**: RLS Policies + Role-Based Access  
- ✅ **Performance**: Alle Queries < 100ms mit Indexes

---

## 🚨 Risk Mitigation

### **Data Safety**
- **Full Backup**: pg_dump vor jeder Migration
- **Rollback Plan**: Automatisierte Restore-Procedures  
- **Staging Validation**: Komplette Business-Workflows testen
- **Row-Count Verification**: Data-Integrity zwischen Alt/Neu

### **Development Safety**
- **Local Development**: Supabase Local für Testing
- **CI/CD Integration**: Automated Migration Testing
- **Type Safety**: Generated Types im Git für Review
- **Code Review**: Alle Migrations peer-reviewed

### **Business Continuity**
- **Feature Parity**: Alle aktiven Features behalten
- **User Training**: Neue Procedures dokumentieren
- **Support Plan**: 1 Woche intensive Überwachung
- **Emergency Contacts**: 24h Support während Transition

---

## 💡 Next Steps

**Ready to Start?** 

1. **Backup Production DB**:
   ```bash
   pg_dump -h 167.235.150.94 -U postgres --schema-only > backup_schema.sql
   pg_dump -h 167.235.150.94 -U postgres --data-only > backup_data.sql
   ```

2. **Create Clean Migrations**:
   ```bash
   mkdir supabase/migrations_final
   # Start with 01_foundation.sql
   ```

3. **Setup Type Generation**:
   ```bash
   pnpm add -D supabase@latest
   # Add scripts to package.json
   ```

**Estimated Timeline: 5 Tage für komplette Migration**

**Ready to proceed?** 🚀