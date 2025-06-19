# 🚀 Clean Migration Files v2 - Trigger Safe

## 📁 Migration Structure

```
01_foundation.sql           # Extensions, ENUMs, Core entities
02_business_tables.sql      # Business tables (no triggers)  
03_transaction_tables.sql   # Transaction tables
04_relationship_tables.sql  # Dependent tables
05_constraints_indexes.sql  # PKs, FKs, Indexes
06_functions_triggers.sql   # Functions & Triggers
07_views_security_data.sql  # Views, RLS, Seed Data
```

## ✅ Deployment Order

Run in EXACT order 01 → 07

**No trigger dependency issues!**

Tables are created first, then functions, then triggers that reference functions.

## 🎯 For Coolify

Copy *.sql files to Coolify Supabase migrations folder.
Each file is dependency-safe and can be debugged independently.
