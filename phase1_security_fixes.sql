-- PHASE 1.2: SYSTEMATIC RLS SECURITY FIXES
-- Fix overly permissive policies with proper organization-based access control

-- ===================================================================
-- CRITICAL POS TABLES (sales, sale_items, items)
-- ===================================================================

-- 1. SALES TABLE
DROP POLICY IF EXISTS "sales_org_access" ON sales;
CREATE POLICY "sales_organization_access" ON sales 
FOR ALL USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- 2. SALE_ITEMS TABLE  
DROP POLICY IF EXISTS "sale_items_access" ON sale_items;
CREATE POLICY "sale_items_organization_access" ON sale_items 
FOR ALL USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- 3. ITEMS TABLE (services/products)
DROP POLICY IF EXISTS "items_business_access" ON items;
CREATE POLICY "items_organization_access" ON items 
FOR ALL USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- ===================================================================
-- FINANCIAL TABLES (cash_movements, documents, suppliers)
-- ===================================================================

-- 4. CASH_MOVEMENTS TABLE
DROP POLICY IF EXISTS "cash_movements_access" ON cash_movements;
CREATE POLICY "cash_movements_organization_access" ON cash_movements 
FOR ALL USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- 5. DOCUMENTS TABLE
DROP POLICY IF EXISTS "documents_access" ON documents;
CREATE POLICY "documents_organization_access" ON documents 
FOR ALL USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- 6. SUPPLIERS TABLE
DROP POLICY IF EXISTS "suppliers_access" ON suppliers;
CREATE POLICY "suppliers_organization_access" ON suppliers 
FOR ALL USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- ===================================================================
-- REPORTING TABLES (daily_summaries, monthly_summaries) 
-- ===================================================================

-- 7. DAILY_SUMMARIES TABLE
DROP POLICY IF EXISTS "daily_summaries_business_access" ON daily_summaries;
CREATE POLICY "daily_summaries_organization_access" ON daily_summaries 
FOR ALL USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- 8. MONTHLY_SUMMARIES TABLE
DROP POLICY IF EXISTS "monthly_summaries_business_access" ON monthly_summaries;
CREATE POLICY "monthly_summaries_organization_access" ON monthly_summaries 
FOR ALL USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- ===================================================================
-- SERVICE ROLE POLICIES (keep for admin access)
-- ===================================================================

-- Keep service_role policies for each table (admin access)
CREATE POLICY "sales_service_role_access" ON sales 
FOR ALL TO service_role USING (true);

CREATE POLICY "sale_items_service_role_access" ON sale_items 
FOR ALL TO service_role USING (true);

CREATE POLICY "items_service_role_access" ON items 
FOR ALL TO service_role USING (true);

CREATE POLICY "cash_movements_service_role_access" ON cash_movements 
FOR ALL TO service_role USING (true);

CREATE POLICY "documents_service_role_access" ON documents 
FOR ALL TO service_role USING (true);

CREATE POLICY "suppliers_service_role_access" ON suppliers 
FOR ALL TO service_role USING (true);

CREATE POLICY "daily_summaries_service_role_access" ON daily_summaries 
FOR ALL TO service_role USING (true);

CREATE POLICY "monthly_summaries_service_role_access" ON monthly_summaries 
FOR ALL TO service_role USING (true);

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Check that all policies are correctly applied
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    CASE 
        WHEN qual LIKE '%organization_id IN%' THEN '✅ Organization-based'
        WHEN qual = 'true' AND roles = '{service_role}' THEN '✅ Service role only'
        WHEN qual = 'true' THEN '🚨 SECURITY RISK'
        ELSE '⚠️ Custom policy'
    END as security_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('sales', 'sale_items', 'items', 'cash_movements', 'documents', 'suppliers', 'daily_summaries', 'monthly_summaries')
ORDER BY tablename, policyname;