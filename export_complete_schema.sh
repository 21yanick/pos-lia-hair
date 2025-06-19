#!/bin/bash
# Emergency Complete Schema Export for Production Deployment

echo "🔄 Exporting complete current database schema..."

# Export complete schema (structure + data)
docker exec supabase-db pg_dump \
  -U postgres \
  -d postgres \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --disable-triggers \
  -f /tmp/complete_production_schema.sql

# Copy to host
docker cp supabase-db:/tmp/complete_production_schema.sql ./supabase/production_schema_export.sql

echo "✅ Schema exported to: ./supabase/production_schema_export.sql"

# Export ONLY custom views and functions
echo "🔄 Exporting custom business logic..."

docker exec supabase-db psql -U postgres -d postgres -c "
-- Export Views
SELECT 'CREATE OR REPLACE VIEW ' || table_name || ' AS ' || view_definition || ';'
FROM information_schema.views 
WHERE table_schema = 'public'
" > ./supabase/custom_views.sql

# Export Functions
docker exec supabase-db pg_dump \
  -U postgres \
  -d postgres \
  --schema-only \
  --no-owner \
  --no-privileges \
  -t 'pg_proc' \
  | grep -A 1000 "CREATE OR REPLACE FUNCTION public\." > ./supabase/custom_functions.sql

echo "✅ Custom logic exported to:"
echo "   - ./supabase/custom_views.sql"  
echo "   - ./supabase/custom_functions.sql"

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Review exported files"
echo "2. Create consolidated migration"
echo "3. Test deployment on fresh database"