-- Multi-Tenant Foundation: Organization-aware Functions and Final Setup
-- Part 4: Update database functions and add constraints

-- 1. Update cash balance function for organization scope
CREATE OR REPLACE FUNCTION get_current_cash_balance(target_org_id UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(
            CASE 
                WHEN type = 'inflow' THEN amount
                WHEN type = 'outflow' THEN -amount
                ELSE 0
            END
        ) FROM cash_movements 
        WHERE organization_id = target_org_id),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- 2. Update owner loan balance function for organization scope
CREATE OR REPLACE FUNCTION get_owner_loan_balance(user_uuid UUID, target_org_id UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(
            CASE 
                WHEN type = 'deposit' THEN amount
                WHEN type = 'withdrawal' THEN -amount
                ELSE 0
            END
        ) FROM owner_transactions 
        WHERE user_id = user_uuid 
        AND organization_id = target_org_id),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- 3. Update expense category validation for organization scope
CREATE OR REPLACE FUNCTION validate_expense_category(
    category_key TEXT,
    user_id_param UUID
) RETURNS BOOLEAN AS $$
DECLARE
    business_settings_record RECORD;
    user_org_id UUID;
    default_categories TEXT[] := ARRAY['rent', 'supplies', 'salary', 'utilities', 'insurance', 'other'];
BEGIN
    -- Allow default categories
    IF category_key = ANY(default_categories) THEN
        RETURN TRUE;
    END IF;
    
    -- Get user's current organization (assume first active membership for now)
    SELECT organization_id INTO user_org_id
    FROM organization_users 
    WHERE user_id = user_id_param AND active = true
    LIMIT 1;
    
    IF user_org_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check custom categories in organization settings
    SELECT settings->'custom_expense_categories' as custom_expense_categories
    INTO business_settings_record 
    FROM organizations 
    WHERE id = user_org_id;
    
    -- If no custom categories, only allow default categories
    IF business_settings_record.custom_expense_categories IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if category exists in custom categories
    RETURN (business_settings_record.custom_expense_categories ? category_key);
END;
$$ LANGUAGE plpgsql;

-- 4. Update document numbering functions for organization scope
CREATE OR REPLACE FUNCTION auto_generate_sales_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
    new_number INTEGER;
    receipt_number TEXT;
    org_prefix TEXT;
BEGIN
    -- Get organization prefix (first 2 letters of slug, uppercase)
    SELECT UPPER(LEFT(slug, 2)) INTO org_prefix
    FROM organizations 
    WHERE id = NEW.organization_id;
    
    -- Get next number for this organization and year
    INSERT INTO document_sequences (organization_id, type, year, current_number)
    VALUES (NEW.organization_id, 'sales', EXTRACT(YEAR FROM NOW()), 1)
    ON CONFLICT (organization_id, type, year) 
    DO UPDATE SET current_number = document_sequences.current_number + 1
    RETURNING current_number INTO new_number;
    
    -- Format: ORGYYYNNNNNNN (e.g., LH2025000001)
    receipt_number := org_prefix || EXTRACT(YEAR FROM NOW())::TEXT || LPAD(new_number::TEXT, 6, '0');
    
    NEW.receipt_number := receipt_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_generate_expenses_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
    new_number INTEGER;
    receipt_number TEXT;
    org_prefix TEXT;
BEGIN
    -- Get organization prefix (first 2 letters of slug, uppercase)
    SELECT UPPER(LEFT(slug, 2)) INTO org_prefix
    FROM organizations 
    WHERE id = NEW.organization_id;
    
    -- Get next number for this organization and year
    INSERT INTO document_sequences (organization_id, type, year, current_number)
    VALUES (NEW.organization_id, 'expenses', EXTRACT(YEAR FROM NOW()), 1)
    ON CONFLICT (organization_id, type, year) 
    DO UPDATE SET current_number = document_sequences.current_number + 1
    RETURNING current_number INTO new_number;
    
    -- Format: ORGAG2025NNNNNN (e.g., LHAG2025000001)
    receipt_number := org_prefix || 'AG' || EXTRACT(YEAR FROM NOW())::TEXT || LPAD(new_number::TEXT, 6, '0');
    
    NEW.receipt_number := receipt_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Update document sequences table for organization scope
ALTER TABLE document_sequences DROP CONSTRAINT IF EXISTS document_sequences_pkey;
ALTER TABLE document_sequences ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE document_sequences ADD PRIMARY KEY (organization_id, type, year);

-- Migrate existing document sequences to Lia Hair
UPDATE document_sequences 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'lia-hair')
WHERE organization_id IS NULL;

-- 6. Add NOT NULL constraints for organization_id (after migration)
-- Core business tables
ALTER TABLE sales ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE items ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE cash_movements ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE documents ALTER COLUMN organization_id SET NOT NULL;

-- Banking tables
ALTER TABLE bank_accounts ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE bank_transactions ALTER COLUMN organization_id SET NOT NULL;

-- Settings and sequences
ALTER TABLE business_settings ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE document_sequences ALTER COLUMN organization_id SET NOT NULL;

-- Add unique constraint for business_settings per organization
ALTER TABLE business_settings ADD CONSTRAINT business_settings_org_unique UNIQUE (organization_id);

-- 7. Create helper views for organization context
CREATE OR REPLACE VIEW organization_summary AS
SELECT 
    o.id,
    o.name,
    o.slug,
    o.display_name,
    o.created_at,
    o.active,
    COUNT(DISTINCT ou.user_id) as user_count,
    COUNT(DISTINCT s.id) as sales_count,
    COUNT(DISTINCT e.id) as expenses_count,
    COALESCE(SUM(s.total_amount), 0) as total_revenue
FROM organizations o
LEFT JOIN organization_users ou ON o.id = ou.organization_id AND ou.active = true
LEFT JOIN sales s ON o.id = s.organization_id
LEFT JOIN expenses e ON o.id = e.organization_id
GROUP BY o.id, o.name, o.slug, o.display_name, o.created_at, o.active;

-- 8. Enable RLS on remaining tables
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- 9. Create remaining RLS policies
CREATE POLICY "bank_accounts_org_access" ON bank_accounts
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );

CREATE POLICY "suppliers_org_access" ON suppliers
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );

CREATE POLICY "daily_summaries_org_access" ON daily_summaries
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );

-- 10. Final verification and logging
DO $$
DECLARE
    org_count INT;
    user_count INT;
    sales_count INT;
    total_tables_with_org_id INT := 16; -- Expected number of tables with organization_id
    actual_tables_with_org_id INT;
BEGIN
    -- Count organizations and basic data
    SELECT COUNT(*) INTO org_count FROM organizations;
    SELECT COUNT(*) INTO user_count FROM organization_users;
    SELECT COUNT(*) INTO sales_count FROM sales WHERE organization_id IS NOT NULL;
    
    -- Count tables with organization_id column
    SELECT COUNT(*) INTO actual_tables_with_org_id
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name = 'organization_id';
    
    RAISE NOTICE '=== Multi-Tenant Migration Complete ===';
    RAISE NOTICE 'Organizations created: %', org_count;
    RAISE NOTICE 'Organization users: %', user_count;
    RAISE NOTICE 'Sales with organization_id: %', sales_count;
    RAISE NOTICE 'Tables with organization_id: % (expected: %)', actual_tables_with_org_id, total_tables_with_org_id;
    
    IF actual_tables_with_org_id >= total_tables_with_org_id THEN
        RAISE NOTICE 'SUCCESS: Multi-tenant foundation ready!';
    ELSE
        RAISE WARNING 'Some tables may be missing organization_id column';
    END IF;
END $$;