-- Fix: Just update the RLS policy for business_settings since table exists

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