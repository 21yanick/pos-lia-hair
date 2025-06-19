-- EXECUTE IN SUPABASE STUDIO SQL EDITOR
-- Copy this SQL and run it in: https://db.lia-hair.ch/project/default/sql

-- 1. Check current table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'business_settings' 
ORDER BY ordinal_position;

-- 2. Check if organization_id already exists
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_settings' 
    AND column_name = 'organization_id'
) as has_organization_id;

-- 3. Add organization_id column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'business_settings' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE business_settings 
        ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added organization_id column';
    ELSE
        RAISE NOTICE 'organization_id column already exists';
    END IF;
END $$;

-- 4. Check if there's any data to migrate
SELECT COUNT(*) as row_count FROM business_settings;

-- 5. Migrate existing data (if any)
UPDATE business_settings 
SET organization_id = (
    SELECT organization_id 
    FROM organization_users 
    WHERE user_id = business_settings.user_id 
    AND active = true 
    LIMIT 1
)
WHERE organization_id IS NULL AND user_id IS NOT NULL;

-- 6. Make organization_id NOT NULL
ALTER TABLE business_settings ALTER COLUMN organization_id SET NOT NULL;

-- 7. Create unique constraint for organization-based settings
DROP INDEX IF EXISTS business_settings_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS business_settings_org_unique 
ON business_settings(organization_id);

-- 8. Update RLS policy
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

-- 9. Remove user_id column (no longer needed)
ALTER TABLE business_settings DROP COLUMN IF EXISTS user_id;

-- 10. Ensure proper grants
GRANT ALL ON business_settings TO anon;
GRANT ALL ON business_settings TO authenticated;

-- 11. Check final table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'business_settings' 
ORDER BY ordinal_position;

SELECT 'Migration completed successfully!' as result;