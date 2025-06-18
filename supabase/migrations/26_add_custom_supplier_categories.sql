-- Add custom supplier categories to business_settings
-- This allows organizations to define their own supplier categories
-- in addition to the default ones

-- Add custom_supplier_categories JSONB column to business_settings
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS custom_supplier_categories JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.business_settings.custom_supplier_categories IS 
'Custom supplier categories defined by the organization as key-value pairs. Format: {"category_key": "Display Name"}';

-- Example data structure:
-- {
--   "local_vendors": "Lokale Anbieter",
--   "premium_brands": "Premium Marken",
--   "eco_suppliers": "Öko-Lieferanten"
-- }