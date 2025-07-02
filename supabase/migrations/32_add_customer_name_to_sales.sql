-- Add customer_name column to sales table for receipt display
-- This allows displaying customer names on receipts even when customer records are deleted

-- Add customer_name column
ALTER TABLE sales 
ADD COLUMN customer_name VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN sales.customer_name IS 'Customer name for receipt display (fallback when customer_id is null or deleted)';

-- Create index for customer name queries (optional, for performance)
CREATE INDEX idx_sales_customer_name ON sales(customer_name) WHERE customer_name IS NOT NULL;

-- Update existing sales with customer names from customers table
UPDATE sales 
SET customer_name = customers.name 
FROM customers 
WHERE sales.customer_id = customers.id 
AND sales.customer_name IS NULL;