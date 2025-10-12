# 🚀 Clean Migration Files for Coolify Deployment

## 📁 Migration Structure

```
supabase/migrations_clean/
├── 01_foundation.sql          # Extensions, Users, Organizations, Document Sequences
├── 02_business_core.sql       # Bank Accounts, Items, Suppliers, Business Settings  
├── 03_import_sessions.sql     # Import Session tables
├── 04_transactions.sql        # Bank Transactions, Expenses, Sales, Summaries
├── 05_relationships.sql       # Cash Movements, Sale Items, Provider Reports
├── 06_functions.sql           # All 47 Business Functions
└── 07_views_indexes_security.sql # Views, Indexes, RLS, Seed Data
```

## ✅ Deployment Order (CRITICAL!)

**Run migrations in EXACT order 01 → 07**

1. `01_foundation.sql` - Core entities (no dependencies)
2. `02_business_core.sql` - Business basics  
3. `03_import_sessions.sql` - Import sessions
4. `04_transactions.sql` - Main transactions
5. `05_relationships.sql` - Dependent tables
6. `06_functions.sql` - Business logic
7. `07_views_indexes_security.sql` - Views, indexes, security

## 🎯 For Coolify Deployment

### Copy to Coolify Supabase Service:

```bash
# In Coolify Supabase service migrations folder:
cp migrations_clean/*.sql /path/to/coolify/supabase/migrations/
```

### File Sizes (Optimized):
- Each file: ~500-2000 lines (vs 7266 lines single file)
- Dependency-safe 
- Easy to debug if errors occur
- Supabase-friendly sizes

## 🔍 What's Included

✅ **22 Tables** (dependency-ordered)
✅ **6 Business Views** 
✅ **47 Custom Functions**
✅ **84 Performance Indexes**
✅ **RLS Security Policies**
✅ **Essential Seed Data**

## 🚨 Troubleshooting

If migration fails:
1. Check which file failed
2. That file can be debugged independently 
3. Dependencies are clearly separated
4. Much easier than debugging 7266-line monster file!

## ✨ Benefits vs Single File

- **Dependency-aware**: Correct order guaranteed
- **Debuggable**: Each file can be tested separately
- **Supabase-friendly**: No size limit issues
- **Maintainable**: Logic clearly separated
- **Coolify-optimized**: Perfect for production deployment
