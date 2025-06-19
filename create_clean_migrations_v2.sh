#!/bin/bash
# 🚀 Create Clean Migration Files v2 - Trigger-Safe
# Separates tables from functions/triggers to avoid dependency issues

echo "🧹 Creating clean migration files v2 (trigger-safe)..."

# Create clean migrations directory
mkdir -p supabase/migrations_clean_v2
cd supabase/migrations_clean_v2

# Remove old files if exist
rm -f *.sql

echo "📊 Analyzing database dependencies..."

# =============================================================================
# 01_foundation.sql - Extensions, ENUMs, Core entities
# =============================================================================
echo "1️⃣ Creating foundation (extensions, enums, users, organizations)..."

cat > 01_foundation.sql << 'EOF'
-- ============================================================================
-- FOUNDATION: Extensions, ENUM Types, Users, Organizations  
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

EOF

# Export custom ENUM types
echo "-- Create custom ENUM types" >> 01_foundation.sql
docker exec supabase-db psql -U postgres -d postgres -c "
SELECT 'CREATE TYPE public.' || t.typname || ' AS ENUM (' || 
       string_agg('''' || e.enumlabel || '''', ', ' ORDER BY e.enumsortorder) || 
       ');' 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND t.typtype = 'e'
GROUP BY t.typname
ORDER BY t.typname;
" -t >> 01_foundation.sql

echo "" >> 01_foundation.sql

# Export core tables without triggers
echo "-- Core tables (without triggers)" >> 01_foundation.sql
for table in "users" "organizations" "document_sequences"; do
  echo "-- Table: $table" >> 01_foundation.sql
  docker exec supabase-db psql -U postgres -d postgres -c "
  SELECT 
    'CREATE TABLE public.' || c.table_name || ' (' || chr(10) ||
    string_agg(
      '    ' || c.column_name || ' ' || 
      CASE 
        WHEN c.data_type = 'USER-DEFINED' THEN 'public.' || c.udt_name
        ELSE c.data_type 
      END ||
      CASE 
        WHEN c.character_maximum_length IS NOT NULL 
        THEN '(' || c.character_maximum_length || ')'
        ELSE ''
      END ||
      CASE 
        WHEN c.column_default IS NOT NULL 
        THEN ' DEFAULT ' || c.column_default
        ELSE ''
      END ||
      CASE 
        WHEN c.is_nullable = 'NO' 
        THEN ' NOT NULL'
        ELSE ''
      END,
      ',' || chr(10)
      ORDER BY c.ordinal_position
    ) || chr(10) || ');' || chr(10) || chr(10)
  FROM information_schema.columns c
  WHERE c.table_name = '$table' 
    AND c.table_schema = 'public'
  GROUP BY c.table_name;
  " -t >> 01_foundation.sql
done

# =============================================================================
# 02_business_tables.sql - Business tables without triggers
# =============================================================================
echo "2️⃣ Creating business tables (no triggers)..."

cat > 02_business_tables.sql << 'EOF'
-- ============================================================================
-- BUSINESS TABLES: Core business entities (no triggers)
-- ============================================================================

EOF

# Export business tables without triggers
for table in "bank_accounts" "items" "suppliers" "business_settings" "audit_log"; do
  echo "-- Table: $table" >> 02_business_tables.sql
  docker exec supabase-db psql -U postgres -d postgres -c "
  SELECT 
    'CREATE TABLE public.' || c.table_name || ' (' || chr(10) ||
    string_agg(
      '    ' || c.column_name || ' ' || 
      CASE 
        WHEN c.data_type = 'USER-DEFINED' THEN 'public.' || c.udt_name
        WHEN c.data_type = 'numeric' AND c.numeric_precision IS NOT NULL 
        THEN c.data_type || '(' || c.numeric_precision || ',' || c.numeric_scale || ')'
        WHEN c.character_maximum_length IS NOT NULL 
        THEN c.data_type || '(' || c.character_maximum_length || ')'
        ELSE c.data_type 
      END ||
      CASE 
        WHEN c.column_default IS NOT NULL 
        THEN ' DEFAULT ' || c.column_default
        ELSE ''
      END ||
      CASE 
        WHEN c.is_nullable = 'NO' 
        THEN ' NOT NULL'
        ELSE ''
      END,
      ',' || chr(10)
      ORDER BY c.ordinal_position
    ) || chr(10) || ');' || chr(10) || chr(10)
  FROM information_schema.columns c
  WHERE c.table_name = '$table' 
    AND c.table_schema = 'public'
  GROUP BY c.table_name;
  " -t >> 02_business_tables.sql
done

# =============================================================================
# 03_transaction_tables.sql - Transaction tables 
# =============================================================================
echo "3️⃣ Creating transaction tables..."

cat > 03_transaction_tables.sql << 'EOF'
-- ============================================================================
-- TRANSACTION TABLES: Bank, Sales, Expenses, Summaries
-- ============================================================================

EOF

for table in "bank_import_sessions" "provider_import_sessions" "bank_transactions" "expenses" "sales" "documents" "daily_summaries" "monthly_summaries"; do
  echo "-- Table: $table" >> 03_transaction_tables.sql
  docker exec supabase-db psql -U postgres -d postgres -c "
  SELECT 
    'CREATE TABLE public.' || c.table_name || ' (' || chr(10) ||
    string_agg(
      '    ' || c.column_name || ' ' || 
      CASE 
        WHEN c.data_type = 'USER-DEFINED' THEN 'public.' || c.udt_name
        WHEN c.data_type = 'numeric' AND c.numeric_precision IS NOT NULL 
        THEN c.data_type || '(' || c.numeric_precision || ',' || c.numeric_scale || ')'
        WHEN c.character_maximum_length IS NOT NULL 
        THEN c.data_type || '(' || c.character_maximum_length || ')'
        ELSE c.data_type 
      END ||
      CASE 
        WHEN c.column_default IS NOT NULL 
        THEN ' DEFAULT ' || c.column_default
        ELSE ''
      END ||
      CASE 
        WHEN c.is_nullable = 'NO' 
        THEN ' NOT NULL'
        ELSE ''
      END,
      ',' || chr(10)
      ORDER BY c.ordinal_position
    ) || chr(10) || ');' || chr(10) || chr(10)
  FROM information_schema.columns c
  WHERE c.table_name = '$table' 
    AND c.table_schema = 'public'
  GROUP BY c.table_name;
  " -t >> 03_transaction_tables.sql
done

# =============================================================================
# 04_relationship_tables.sql - Dependent tables
# =============================================================================
echo "4️⃣ Creating relationship tables..."

cat > 04_relationship_tables.sql << 'EOF'
-- ============================================================================
-- RELATIONSHIP TABLES: Dependent entities
-- ============================================================================

EOF

for table in "cash_movements" "sale_items" "provider_reports" "owner_transactions" "transaction_matches" "organization_users"; do
  echo "-- Table: $table" >> 04_relationship_tables.sql
  docker exec supabase-db psql -U postgres -d postgres -c "
  SELECT 
    'CREATE TABLE public.' || c.table_name || ' (' || chr(10) ||
    string_agg(
      '    ' || c.column_name || ' ' || 
      CASE 
        WHEN c.data_type = 'USER-DEFINED' THEN 'public.' || c.udt_name
        WHEN c.data_type = 'numeric' AND c.numeric_precision IS NOT NULL 
        THEN c.data_type || '(' || c.numeric_precision || ',' || c.numeric_scale || ')'
        WHEN c.character_maximum_length IS NOT NULL 
        THEN c.data_type || '(' || c.character_maximum_length || ')'
        ELSE c.data_type 
      END ||
      CASE 
        WHEN c.column_default IS NOT NULL 
        THEN ' DEFAULT ' || c.column_default
        ELSE ''
      END ||
      CASE 
        WHEN c.is_nullable = 'NO' 
        THEN ' NOT NULL'
        ELSE ''
      END,
      ',' || chr(10)
      ORDER BY c.ordinal_position
    ) || chr(10) || ');' || chr(10) || chr(10)
  FROM information_schema.columns c
  WHERE c.table_name = '$table' 
    AND c.table_schema = 'public'
  GROUP BY c.table_name;
  " -t >> 04_relationship_tables.sql
done

# =============================================================================
# 05_constraints_indexes.sql - PKs, FKs, Indexes
# =============================================================================
echo "5️⃣ Creating constraints and indexes..."

cat > 05_constraints_indexes.sql << 'EOF'
-- ============================================================================
-- CONSTRAINTS & INDEXES: PKs, FKs, Unique, Performance Indexes
-- ============================================================================

-- PRIMARY KEYS
EOF

# Export primary keys
docker exec supabase-db psql -U postgres -d postgres -c "
SELECT 'ALTER TABLE public.' || tc.table_name || 
       ' ADD CONSTRAINT ' || tc.constraint_name || 
       ' PRIMARY KEY (' || string_agg(kcu.column_name, ', ') || ');'
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY' 
  AND tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;
" -t >> 05_constraints_indexes.sql

echo "" >> 05_constraints_indexes.sql
echo "-- FOREIGN KEYS" >> 05_constraints_indexes.sql

# Export foreign keys
docker exec supabase-db psql -U postgres -d postgres -c "
SELECT 'ALTER TABLE public.' || tc.table_name || 
       ' ADD CONSTRAINT ' || tc.constraint_name || 
       ' FOREIGN KEY (' || kcu.column_name || ') REFERENCES public.' || 
       ccu.table_name || '(' || ccu.column_name || ');'
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
" -t >> 05_constraints_indexes.sql

echo "" >> 05_constraints_indexes.sql
echo "-- PERFORMANCE INDEXES" >> 05_constraints_indexes.sql

# Export custom indexes
docker exec supabase-db psql -U postgres -d postgres -c "
SELECT indexdef || ';'
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname NOT LIKE '%_pkey'
  AND indexname NOT LIKE 'pg_%'
ORDER BY tablename, indexname;
" -t >> 05_constraints_indexes.sql

# =============================================================================
# 06_functions_triggers.sql - Functions and triggers
# =============================================================================
echo "6️⃣ Creating functions and triggers..."

cat > 06_functions_triggers.sql << 'EOF'
-- ============================================================================
-- FUNCTIONS & TRIGGERS: Business logic and automated triggers
-- ============================================================================

EOF

# Export all public functions
docker exec supabase-db psql -U postgres -d postgres -c "
SELECT 
  pg_get_functiondef(oid) || ';' || chr(10) || chr(10)
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;
" -t >> 06_functions_triggers.sql

echo "" >> 06_functions_triggers.sql
echo "-- TRIGGERS" >> 06_functions_triggers.sql

# Export triggers
docker exec supabase-db psql -U postgres -d postgres -c "
SELECT 'CREATE TRIGGER ' || trigger_name || 
       ' ' || action_timing || ' ' || event_manipulation || 
       ' ON public.' || event_object_table || 
       ' FOR EACH ' || action_orientation || 
       ' EXECUTE FUNCTION public.' || replace(action_statement, 'EXECUTE FUNCTION ', '') || ';'
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
" -t >> 06_functions_triggers.sql

# =============================================================================
# 07_views_security_data.sql - Views, RLS, Seed Data
# =============================================================================
echo "7️⃣ Creating views, security & seed data..."

cat > 07_views_security_data.sql << 'EOF'
-- ============================================================================
-- VIEWS, SECURITY & SEED DATA: Final setup
-- ============================================================================

-- CUSTOM VIEWS
EOF

# Export views
docker exec supabase-db psql -U postgres -d postgres -c "
SELECT 'CREATE OR REPLACE VIEW public.' || table_name || ' AS ' || chr(10) || view_definition || ';' || chr(10) || chr(10)
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;
" -t >> 07_views_security_data.sql

echo "-- RLS POLICIES" >> 07_views_security_data.sql

# Export RLS policies
docker exec supabase-db psql -U postgres -d postgres -c "
SELECT 'ALTER TABLE public.' || tablename || ' ENABLE ROW LEVEL SECURITY;' || chr(10) ||
       'CREATE POLICY ' || policyname || ' ON public.' || tablename || ' ' || 
       'FOR ' || cmd || ' ' ||
       CASE WHEN roles IS NOT NULL THEN 'TO ' || array_to_string(roles, ', ') || ' ' ELSE '' END ||
       CASE WHEN qual IS NOT NULL THEN 'USING (' || qual || ') ' ELSE '' END ||
       CASE WHEN with_check IS NOT NULL THEN 'WITH CHECK (' || with_check || ')' ELSE '' END ||
       ';' || chr(10)
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
" -t >> 07_views_security_data.sql

echo "" >> 07_views_security_data.sql
echo "-- ESSENTIAL SEED DATA" >> 07_views_security_data.sql

# Export essential data
docker exec supabase-db psql -U postgres -d postgres -c "
-- System user
SELECT 'INSERT INTO public.users (id, name, username, email, role) VALUES (''' || id || ''', ''' || name || ''', ''' || username || ''', ''' || email || ''', ''' || role || ''') ON CONFLICT (id) DO NOTHING;' || chr(10)
FROM users WHERE username = 'system'
UNION ALL
-- Document sequences  
SELECT 'INSERT INTO public.document_sequences (type, current_number, prefix, format) VALUES (''' || type || ''', ' || current_number || ', ''' || prefix || ''', ''' || format || ''') ON CONFLICT (type) DO NOTHING;' || chr(10)
FROM document_sequences;
" -t >> 07_views_security_data.sql

# =============================================================================
# Create README
# =============================================================================
cat > README_CLEAN_V2.md << 'EOF'
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
EOF

echo ""
echo "✅ Clean migration files v2 created successfully!"
echo ""
echo "📁 Files created:"
ls -la *.sql README_CLEAN_V2.md
echo ""
echo "📊 File sizes:"
wc -l *.sql
echo ""
echo "🎯 Ready for Coolify deployment (trigger-safe)!"