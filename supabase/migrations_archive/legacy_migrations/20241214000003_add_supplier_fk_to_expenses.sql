-- Add supplier_id foreign key to expenses table
-- Maintains backward compatibility during transition

-- Add new supplier_id column
ALTER TABLE expenses 
ADD COLUMN supplier_id UUID REFERENCES suppliers(id);

-- Create index for performance
CREATE INDEX idx_expenses_supplier_id ON expenses(supplier_id);

-- Update existing expenses to link with suppliers
UPDATE expenses 
SET supplier_id = s.id
FROM suppliers s
WHERE expenses.supplier_name IS NOT NULL 
  AND expenses.supplier_name != ''
  AND s.normalized_name = normalize_supplier_name(expenses.supplier_name);

-- Create helper function to get or create supplier
CREATE OR REPLACE FUNCTION get_or_create_supplier(
  supplier_name_input TEXT,
  user_id_input UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  normalized_name_var TEXT;
  supplier_id_result UUID;
  default_user_id UUID;
BEGIN
  -- Return NULL if no supplier name provided
  IF supplier_name_input IS NULL OR trim(supplier_name_input) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Normalize the name
  normalized_name_var := normalize_supplier_name(supplier_name_input);
  
  -- Try to find existing supplier
  SELECT id INTO supplier_id_result 
  FROM suppliers 
  WHERE normalized_name = normalized_name_var;
  
  -- If found, return the ID
  IF supplier_id_result IS NOT NULL THEN
    RETURN supplier_id_result;
  END IF;
  
  -- Get default user if none provided
  IF user_id_input IS NULL THEN
    SELECT id INTO default_user_id 
    FROM users 
    WHERE role = 'admin' 
    LIMIT 1;
  ELSE
    default_user_id := user_id_input;
  END IF;
  
  -- Create new supplier if not found
  INSERT INTO suppliers (name, normalized_name, category, created_by, notes)
  VALUES (
    trim(supplier_name_input),
    normalized_name_var,
    'other'::supplier_category,
    default_user_id,
    'Auto-created from expense entry'
  )
  RETURNING id INTO supplier_id_result;
  
  RETURN supplier_id_result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-populate supplier_id when supplier_name is used
CREATE OR REPLACE FUNCTION auto_populate_supplier_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if supplier_name is provided but supplier_id is not
  IF NEW.supplier_name IS NOT NULL 
     AND trim(NEW.supplier_name) != '' 
     AND NEW.supplier_id IS NULL THEN
    
    NEW.supplier_id := get_or_create_supplier(NEW.supplier_name, NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_populate_supplier_id
  BEFORE INSERT OR UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_supplier_id();

-- Add constraint to ensure either supplier_name OR supplier_id is provided
-- (allows gradual migration)
ALTER TABLE expenses 
ADD CONSTRAINT check_supplier_info 
CHECK (
  supplier_name IS NOT NULL 
  OR supplier_id IS NOT NULL 
  OR (supplier_name IS NULL AND supplier_id IS NULL)
);

-- Comments
COMMENT ON COLUMN expenses.supplier_id IS 'Foreign key to suppliers table - preferred over supplier_name';
COMMENT ON FUNCTION get_or_create_supplier IS 'Auto-creates supplier record if not exists, returns supplier_id';
COMMENT ON TRIGGER trigger_auto_populate_supplier_id ON expenses IS 'Auto-populates supplier_id from supplier_name during insert/update';