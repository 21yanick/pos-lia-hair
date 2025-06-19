-- Fix: Update business_settings to be organization-based instead of user-based

-- Add organization_id column
ALTER TABLE business_settings 
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Migrate existing data (if any) to current user's organization
UPDATE business_settings 
SET organization_id = (
  SELECT organization_id 
  FROM organization_users 
  WHERE user_id = business_settings.user_id 
  AND active = true 
  LIMIT 1
)
WHERE organization_id IS NULL;

-- Drop old user_id column (after migration)
-- ALTER TABLE business_settings DROP COLUMN user_id;

-- Update RLS policy to be organization-based
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

-- Make organization_id NOT NULL (after migration)
-- ALTER TABLE business_settings ALTER COLUMN organization_id SET NOT NULL;