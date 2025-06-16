-- Enable Custom Expense Categories
-- Simple JSONB approach using existing business_settings infrastructure

-- 1. Remove hardcoded category constraint
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

-- 2. Add custom categories field to business_settings
ALTER TABLE business_settings 
ADD COLUMN IF NOT EXISTS custom_expense_categories JSONB DEFAULT '{}';

-- 3. Add simple validation function
CREATE OR REPLACE FUNCTION validate_expense_category(
  category_key TEXT,
  user_id_param UUID
) RETURNS BOOLEAN AS $$
DECLARE
  business_settings_record RECORD;
  default_categories TEXT[] := ARRAY['rent', 'supplies', 'salary', 'utilities', 'insurance', 'other'];
BEGIN
  -- Allow default categories
  IF category_key = ANY(default_categories) THEN
    RETURN TRUE;
  END IF;
  
  -- Check custom categories in business_settings
  SELECT custom_expense_categories 
  INTO business_settings_record 
  FROM business_settings 
  WHERE business_settings.user_id = user_id_param;
  
  -- If no business settings yet, only allow default categories
  IF business_settings_record.custom_expense_categories IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if category exists in custom categories
  RETURN (business_settings_record.custom_expense_categories ? category_key);
END;
$$ LANGUAGE plpgsql;

-- 4. Add check constraint using validation function
ALTER TABLE expenses 
ADD CONSTRAINT expenses_category_valid 
CHECK (validate_expense_category(category, user_id));

-- 5. Comment
COMMENT ON COLUMN business_settings.custom_expense_categories IS 'User-defined expense categories as JSON object: {"key": "Display Name"}';
COMMENT ON FUNCTION validate_expense_category IS 'Validates expense category against default + custom categories';