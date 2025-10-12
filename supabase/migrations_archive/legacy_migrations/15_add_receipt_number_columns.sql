-- ============================================================================
-- Migration 15: Add Receipt Number Columns to Existing Tables
-- Fügt Belegnummer-Spalten zu allen relevanten Tabellen hinzu
-- ============================================================================

-- Add receipt_number column to sales table
ALTER TABLE sales ADD COLUMN receipt_number VARCHAR(20) UNIQUE;
CREATE INDEX idx_sales_receipt_number ON sales(receipt_number);

-- Add receipt_number column to expenses table  
ALTER TABLE expenses ADD COLUMN receipt_number VARCHAR(20) UNIQUE;
CREATE INDEX idx_expenses_receipt_number ON expenses(receipt_number);

-- Add document_number column to documents table
ALTER TABLE documents ADD COLUMN document_number VARCHAR(20) UNIQUE;
CREATE INDEX idx_documents_document_number ON documents(document_number);

-- Add transaction_number column to bank_transactions table
ALTER TABLE bank_transactions ADD COLUMN transaction_number VARCHAR(20) UNIQUE;
CREATE INDEX idx_bank_transactions_number ON bank_transactions(transaction_number);

-- Add movement_number column to cash_movements table
ALTER TABLE cash_movements ADD COLUMN movement_number VARCHAR(20) UNIQUE;
CREATE INDEX idx_cash_movements_number ON cash_movements(movement_number);

-- Note: daily_summaries and monthly_summaries tables don't exist yet
-- Will be added when those tables are created in future migrations

-- Add constraints to ensure receipt numbers are not null for new records (optional)
-- Note: We don't add NOT NULL constraint yet since existing records don't have receipt numbers

-- Function to get next receipt number for a specific type
CREATE OR REPLACE FUNCTION get_next_receipt_number(doc_type TEXT)
RETURNS TEXT AS $$
DECLARE
    next_number TEXT;
BEGIN
    SELECT generate_document_number(doc_type) INTO next_number;
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if receipt number exists
CREATE OR REPLACE FUNCTION receipt_number_exists(receipt_num TEXT, table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    count_result INTEGER;
    query_text TEXT;
BEGIN
    CASE table_name
        WHEN 'sales' THEN
            SELECT COUNT(*) INTO count_result FROM sales WHERE receipt_number = receipt_num;
        WHEN 'expenses' THEN
            SELECT COUNT(*) INTO count_result FROM expenses WHERE receipt_number = receipt_num;
        WHEN 'documents' THEN
            SELECT COUNT(*) INTO count_result FROM documents WHERE document_number = receipt_num;
        WHEN 'bank_transactions' THEN
            SELECT COUNT(*) INTO count_result FROM bank_transactions WHERE transaction_number = receipt_num;
        WHEN 'cash_movements' THEN
            SELECT COUNT(*) INTO count_result FROM cash_movements WHERE movement_number = receipt_num;
        ELSE
            RETURN FALSE;
    END CASE;
    
    RETURN count_result > 0;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION get_next_receipt_number(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION receipt_number_exists(TEXT, TEXT) TO authenticated;

-- Update RLS policies to include new columns (if needed)
-- The existing policies should automatically cover the new columns

-- Add comments to document the new columns
COMMENT ON COLUMN sales.receipt_number IS 'Human-readable receipt number (e.g., VK2025000001)';
COMMENT ON COLUMN expenses.receipt_number IS 'Human-readable expense receipt number (e.g., AG2025000001)';
COMMENT ON COLUMN documents.document_number IS 'Human-readable document number based on document type';
COMMENT ON COLUMN bank_transactions.transaction_number IS 'Human-readable bank transaction number (e.g., BT2025000001)';
COMMENT ON COLUMN cash_movements.movement_number IS 'Human-readable cash movement number (e.g., CM2025000001)';
-- Comments for daily/monthly summaries will be added when tables are created