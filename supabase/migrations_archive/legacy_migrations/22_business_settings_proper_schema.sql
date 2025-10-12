-- Proper business_settings schema with audit trail
-- Migration: Add back audit columns while keeping organization-based unique constraint

-- Add audit trail columns back
ALTER TABLE business_settings 
ADD COLUMN created_by UUID REFERENCES auth.users(id),
ADD COLUMN updated_by UUID REFERENCES auth.users(id);

-- Set created_by for existing records (if any) to the organization owner
UPDATE business_settings 
SET created_by = (
    SELECT user_id 
    FROM organization_users 
    WHERE organization_id = business_settings.organization_id 
    AND role = 'owner' 
    AND active = true 
    LIMIT 1
);

-- Set updated_by same as created_by initially
UPDATE business_settings 
SET updated_by = created_by 
WHERE updated_by IS NULL;

-- Make created_by NOT NULL (all existing records should have it now)
ALTER TABLE business_settings ALTER COLUMN created_by SET NOT NULL;

-- Update the trigger to set updated_by
CREATE OR REPLACE FUNCTION update_business_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid(); -- Track who made the update
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the service to use insert trigger for created_by
CREATE OR REPLACE FUNCTION set_business_settings_created_by()
RETURNS TRIGGER AS $$
BEGIN
    -- Set created_by on INSERT if not provided
    IF NEW.created_by IS NULL THEN
        NEW.created_by = auth.uid();
    END IF;
    -- Set updated_by on INSERT as well
    IF NEW.updated_by IS NULL THEN
        NEW.updated_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_business_settings_created_by
    BEFORE INSERT ON business_settings
    FOR EACH ROW
    EXECUTE FUNCTION set_business_settings_created_by();

-- Update RLS policies to be more specific
DROP POLICY IF EXISTS "authenticated_full_access" ON business_settings;

-- Create proper organization-based policies with audit awareness
CREATE POLICY "organization_members_read_settings" ON business_settings 
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

CREATE POLICY "organization_admins_manage_settings" ON business_settings 
FOR INSERT, UPDATE, DELETE USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
        AND role IN ('owner', 'admin') -- Only owners and admins can modify
    )
);

-- Comments for documentation
COMMENT ON COLUMN business_settings.created_by IS 'User who created the business settings';
COMMENT ON COLUMN business_settings.updated_by IS 'User who last updated the business settings';
COMMENT ON COLUMN business_settings.organization_id IS 'Organization these settings belong to (unique constraint)';

-- Verify the schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'business_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;