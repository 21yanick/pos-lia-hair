-- Migration: Fix business_settings for multi-tenant architecture
-- Problem: Table was created with user_id but service expects organization_id
-- Solution: Migrate to organization-based schema with proper RLS

-- Step 1: Add organization_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'business_settings' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE business_settings 
        ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 2: Migrate existing data (if any) to current user's organization
UPDATE business_settings 
SET organization_id = (
    SELECT organization_id 
    FROM organization_users 
    WHERE user_id = business_settings.user_id 
    AND active = true 
    LIMIT 1
)
WHERE organization_id IS NULL;

-- Step 3: Make organization_id NOT NULL (after migration)
ALTER TABLE business_settings ALTER COLUMN organization_id SET NOT NULL;

-- Step 4: Create new unique constraint for organization-based settings
DROP INDEX IF EXISTS business_settings_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS business_settings_org_unique 
ON business_settings(organization_id);

-- Step 5: Update RLS policy to be organization-based
DROP POLICY IF EXISTS "Users manage own settings" ON business_settings;

CREATE POLICY "Organization members manage settings" ON business_settings 
FOR ALL 
USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- Step 6: Remove user_id column (no longer needed)
ALTER TABLE business_settings DROP COLUMN IF EXISTS user_id;

-- Step 7: Ensure PostgREST can access the table
GRANT ALL ON business_settings TO anon;
GRANT ALL ON business_settings TO authenticated;

-- Step 8: Refresh PostgREST schema cache (comment for manual execution)
-- NOTIFY pgrst, 'reload schema';