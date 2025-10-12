# 🗄️ Database Migrations - V6.1 Production Suite

**Status**: ✅ Production Active
**Last Updated**: 2025-10-12
**Total Migrations**: 6 files (4,404 lines)

---

## 📋 **Migration Files**

### **01_foundation_and_security_v6.sql** (773 lines)
**Domain**: Multi-tenant Foundation + Security
**Tables**: 4 (organizations, organization_users, users, business_settings)
**Features**:
- Multi-tenant foundation with RLS
- User management + authentication
- Storage infrastructure (documents, business-logos buckets)
- Auto-bootstrap system for new organizations
- PostgreSQL grants + security policies

### **02_core_business_logic_v6.sql** (993 lines)
**Domain**: Core POS Business Logic
**Tables**: 13 (items, customers, sales, expenses, suppliers, appointments, documents, audit_log)
**Views**: 1 (appointments_with_services)
**Functions**: 11 (including get_current_cash_balance_for_org)
**Features**:
- Complete POS workflow
- Cash management + profit/revenue calculations
- Customer/supplier management
- Financial audit trail (audit_log table)
- Appointment system with multi-service support

### **03_banking_and_compliance_v6.sql** (1,082 lines)
**Domain**: Banking Integration + Swiss Compliance
**Tables**: 10 (bank_accounts, bank_transactions, provider_reports, document_sequences)
**Views**: 5 (unified_transactions, reconciliation views, available_for_bank_matching)
**Functions**: Banking reconciliation + get_owner_balance
**Features**:
- CAMT.053 Swiss banking standard support
- TWINT/SumUp payment provider integration
- Daily/monthly closure system
- Swiss audit compliance
- Banking reconciliation workflows

### **04_automation_and_triggers_v6.sql** (697 lines)
**Domain**: Automation + Triggers
**Triggers**: 19 (all production-parity triggers)
**Features**:
- Auto-numbering (VK-, AK-, CM-, BT- prefixes)
- Business logic automation
- Financial audit triggers
- User management triggers
- Auto-bootstrap trigger for new organizations
- Atomic daily closure operations

### **05_performance_and_validation_v6.sql** (683 lines)
**Domain**: Performance Optimization + Validation
**Indexes**: 148+ performance indexes
**Views**: 4 Business Intelligence views
**Functions**: System health validation
**Features**:
- Production-grade query performance
- Comprehensive index coverage
- Business Intelligence reporting
- System health scoring (100/100 validated)

### **06_appointment_title_support_v6.sql** (176 lines) ✨ NEW
**Domain**: Appointment System Enhancement
**Changes**:
- Added `title` column to appointments table
- Constraint: customer OR title required
- Updated appointments_with_services view
- Performance index for title queries
**Features**:
- Private appointment support (without customer)
- Blocker appointments (e.g., "Kids Kindergarten abholen")
- Backwards compatible with existing customer appointments

---

## 🚀 **Deployment**

### **Fresh Deployment**
```bash
# Sequential execution (order matters!)
docker exec supabase-db-container psql -U postgres -f /tmp/01_foundation_and_security_v6.sql
docker exec supabase-db-container psql -U postgres -f /tmp/02_core_business_logic_v6.sql
docker exec supabase-db-container psql -U postgres -f /tmp/03_banking_and_compliance_v6.sql
docker exec supabase-db-container psql -U postgres -f /tmp/04_automation_and_triggers_v6.sql
docker exec supabase-db-container psql -U postgres -f /tmp/05_performance_and_validation_v6.sql
docker exec supabase-db-container psql -U postgres -f /tmp/06_appointment_title_support_v6.sql

# Validate
docker exec supabase-db-container psql -U postgres -c "SELECT validate_system_health();"
```

### **Production Update (Migration 06 Only)**
```bash
# For existing V6 deployments, only run Migration 06
docker exec supabase-db-container psql -U postgres -f /tmp/06_appointment_title_support_v6.sql
```

---

## 📊 **System Health**

**Expected Results:**
```
Tables:     26+ (130% coverage)
Functions:  86+ (245% coverage)
Triggers:   30+ (375% coverage)
Indexes:    148+ (296% coverage)
RLS Tables: 24+ (160% coverage)
Health Score: 100/100 ✅
```

---

## 📁 **Project Structure**

```
supabase/
├── migrations/                    ✅ V6.1 Active (this directory)
│   ├── 01_foundation_and_security_v6.sql
│   ├── 02_core_business_logic_v6.sql
│   ├── 03_banking_and_compliance_v6.sql
│   ├── 04_automation_and_triggers_v6.sql
│   ├── 05_performance_and_validation_v6.sql
│   ├── 06_appointment_title_support_v6.sql ✨ NEW
│   └── README.md (this file)
│
└── migrations_archive/            📦 Historical versions (read-only)
    ├── legacy_migrations/         (original incremental migrations)
    ├── v1_migrations_clean/       (V1 consolidated)
    ├── v2_migrations_clean_v2/    (V2 attempt)
    ├── v3_migrations_clean_v3/    (V3 refinement)
    ├── v4_migrations_clean_v4/    (V4 cleanup)
    └── v5_migrations_clean_v5/    (V5 pre-final)
```

---

## 🔧 **Maintenance**

### **Adding New Migrations**
```bash
# Create new migration with sequential number
touch supabase/migrations/07_new_feature_v6.sql

# Follow naming convention: XX_descriptive_name_v6.sql
# Always include validation and rollback comments
# Test on local Supabase before production deployment
```

### **Rollback Strategy**
Each migration is atomic (BEGIN...COMMIT) and can be reversed:
1. Restore from backup (automatic Supabase backups)
2. Run reverse migration SQL (if provided in migration comments)
3. Validate system health after rollback

---

## 📖 **Documentation**

**Full Documentation**: See `/CLEANUPDB.md` in project root
**Architecture Details**: V6.1 Enhanced Domain-Focused Migration Suite
**Production Status**: ✅ Live on Hetzner (`db.lia-hair.ch`)

---

## 🎯 **V6.1 Enhancements Summary**

- ✅ **Auto-Bootstrap**: Zero-config organization setup
- ✅ **Production Parity**: All 19 production triggers
- ✅ **Financial Audit**: Complete audit_log system
- ✅ **Swiss Compliance**: VK-, AK-, CM-, BT- numbering
- ✅ **Performance**: 148 indexes, sub-second queries
- ✅ **Private Appointments**: Title-based blocker appointments ✨ NEW

**Last Migration**: 06 (2025-10-12) - Appointment Title Support
