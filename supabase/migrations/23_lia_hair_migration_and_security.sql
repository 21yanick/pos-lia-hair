-- Multi-Tenant Foundation: Lia Hair Data Migration + Security Fixes
-- Part 3: Create Lia Hair organization and migrate existing data

-- 1. Create Lia Hair Organization
INSERT INTO organizations (id, name, slug, display_name, address, city, postal_code, phone, email)
VALUES (
    gen_random_uuid(),
    'Lia Hair',
    'lia-hair',
    'Lia Hair by Zilfije Rupp',
    NULL, -- Will be populated from business_settings
    NULL,
    NULL,
    NULL,
    'admin@lia-hair.ch'
);

-- 2. Link existing admin user to Lia Hair organization as owner
INSERT INTO organization_users (organization_id, user_id, role, active)
SELECT 
    (SELECT id FROM organizations WHERE slug = 'lia-hair'),
    (SELECT id FROM auth.users WHERE email = 'admin@lia-hair.ch'),
    'owner',
    true;

-- 3. Migrate business_settings to Lia Hair organization
UPDATE business_settings 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@lia-hair.ch');

-- 4. Copy business_settings data to organizations table
UPDATE organizations 
SET 
    address = bs.company_address,
    city = bs.company_city,
    postal_code = bs.company_postal_code,
    phone = bs.company_phone,
    email = COALESCE(bs.company_email, 'admin@lia-hair.ch'),
    website = bs.company_website,
    uid = bs.company_uid,
    settings = jsonb_build_object(
        'tax_rate', bs.tax_rate,
        'default_currency', bs.default_currency,
        'pdf_show_logo', bs.pdf_show_logo,
        'pdf_show_company_details', bs.pdf_show_company_details,
        'custom_expense_categories', bs.custom_expense_categories
    )
FROM business_settings bs
WHERE organizations.slug = 'lia-hair'
AND bs.organization_id = organizations.id;

-- 5. Migrate all business data to Lia Hair organization
-- Sales data
UPDATE sales 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- Expenses data
UPDATE expenses 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- Items data (products/services)
UPDATE items 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- Cash movements
UPDATE cash_movements 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- Documents
UPDATE documents 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- Banking data
UPDATE bank_accounts 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

UPDATE bank_transactions 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

UPDATE provider_reports 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- Summary data
UPDATE daily_summaries 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

UPDATE monthly_summaries 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- Owner transactions
UPDATE owner_transactions 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- Suppliers
UPDATE suppliers 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- Sale items
UPDATE sale_items 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- Transaction matches
UPDATE transaction_matches 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- Import sessions
UPDATE bank_import_sessions 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

UPDATE provider_import_sessions 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- 6. CRITICAL SECURITY FIX: Replace unsafe RLS policies with organization-aware ones

-- Sales security fix
DROP POLICY IF EXISTS "sales_access" ON sales;
CREATE POLICY "sales_org_access" ON sales
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );

-- Expenses security fix  
DROP POLICY IF EXISTS "expenses_access" ON expenses;
CREATE POLICY "expenses_org_access" ON expenses
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );

-- Business settings security fix
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON business_settings;
CREATE POLICY "business_settings_org_access" ON business_settings
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );

-- Items security policy
CREATE POLICY "items_org_access" ON items
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );

-- Cash movements security policy
CREATE POLICY "cash_movements_org_access" ON cash_movements
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );

-- Documents security policy
CREATE POLICY "documents_org_access" ON documents
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );

-- 7. Verification: Count migrated data
DO $$
DECLARE
    org_id UUID := (SELECT id FROM organizations WHERE slug = 'lia-hair');
    sales_count INT;
    expenses_count INT;
    items_count INT;
BEGIN
    SELECT COUNT(*) INTO sales_count FROM sales WHERE organization_id = org_id;
    SELECT COUNT(*) INTO expenses_count FROM expenses WHERE organization_id = org_id;
    SELECT COUNT(*) INTO items_count FROM items WHERE organization_id = org_id;
    
    RAISE NOTICE 'Lia Hair migration completed:';
    RAISE NOTICE 'Sales migrated: %', sales_count;
    RAISE NOTICE 'Expenses migrated: %', expenses_count;
    RAISE NOTICE 'Items migrated: %', items_count;
END $$;