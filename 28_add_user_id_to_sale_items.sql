-- Migration: Add user_id to sale_items for consistent financial table schema
-- This enables individual stylist performance tracking in hair salon POS

-- Add user_id column to sale_items
ALTER TABLE sale_items 
ADD COLUMN user_id UUID REFERENCES users(id);

-- Populate existing sale_items with user_id from their parent sales
UPDATE sale_items 
SET user_id = (
    SELECT s.user_id 
    FROM sales s 
    WHERE s.id = sale_items.sale_id
);

-- Make user_id NOT NULL after populating existing records
ALTER TABLE sale_items 
ALTER COLUMN user_id SET NOT NULL;

-- Add organization_id explicitly to new sale_items (currently handled by constraint)
-- This ensures consistency and explicit column presence
ALTER TABLE sale_items 
ALTER COLUMN organization_id SET NOT NULL;

-- Update RLS policy to include user_id validation (consistent with other financial tables)
DROP POLICY IF EXISTS "sale_items_organization_access" ON sale_items;

CREATE POLICY "sale_items_organization_access" ON sale_items 
FOR ALL USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- Add service_role policy for admin access
CREATE POLICY "sale_items_service_role_access" ON sale_items 
FOR ALL TO service_role USING (true);

-- Add index for performance on user_id queries (stylist performance tracking)
CREATE INDEX idx_sale_items_user_id ON sale_items(user_id);
CREATE INDEX idx_sale_items_org_user ON sale_items(organization_id, user_id);

-- Comments for documentation
COMMENT ON COLUMN sale_items.user_id IS 'Stylist who performed this service (enables individual performance tracking)';
COMMENT ON COLUMN sale_items.organization_id IS 'Organization this sale item belongs to (multi-tenant isolation)';

-- Verify the updated schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'sale_items' 
AND table_schema = 'public'
ORDER BY ordinal_position;