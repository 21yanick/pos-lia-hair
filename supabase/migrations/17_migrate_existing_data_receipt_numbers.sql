-- ============================================================================
-- Migration 17: Migrate Existing Data with Receipt Numbers
-- Versieht alle bestehenden Datensätze mit fortlaufenden Belegnummern
-- ============================================================================

-- Safety: Create backup tables before migration
CREATE TABLE sales_backup_before_receipt_migration AS SELECT * FROM sales;
CREATE TABLE expenses_backup_before_receipt_migration AS SELECT * FROM expenses;
CREATE TABLE documents_backup_before_receipt_migration AS SELECT * FROM documents;
CREATE TABLE bank_transactions_backup_before_receipt_migration AS SELECT * FROM bank_transactions;
CREATE TABLE cash_movements_backup_before_receipt_migration AS SELECT * FROM cash_movements;

-- Function to migrate existing sales with receipt numbers
-- Migrates in chronological order to maintain sequence
CREATE OR REPLACE FUNCTION migrate_existing_sales_receipt_numbers()
RETURNS INTEGER AS $$
DECLARE
    sale_record RECORD;
    updated_count INTEGER := 0;
    new_receipt_number TEXT;
BEGIN
    -- Process sales in chronological order (oldest first)
    FOR sale_record IN 
        SELECT id, created_at 
        FROM sales 
        WHERE receipt_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        -- Generate receipt number
        new_receipt_number := generate_document_number('sale_receipt');
        
        -- Update the sale with receipt number
        UPDATE sales 
        SET receipt_number = new_receipt_number 
        WHERE id = sale_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate existing expenses with receipt numbers
CREATE OR REPLACE FUNCTION migrate_existing_expenses_receipt_numbers()
RETURNS INTEGER AS $$
DECLARE
    expense_record RECORD;
    updated_count INTEGER := 0;
    new_receipt_number TEXT;
BEGIN
    -- Process expenses in chronological order (oldest first)
    FOR expense_record IN 
        SELECT id, created_at 
        FROM expenses 
        WHERE receipt_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        -- Generate receipt number
        new_receipt_number := generate_document_number('expense_receipt');
        
        -- Update the expense with receipt number
        UPDATE expenses 
        SET receipt_number = new_receipt_number 
        WHERE id = expense_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate existing documents with document numbers
CREATE OR REPLACE FUNCTION migrate_existing_documents_numbers()
RETURNS INTEGER AS $$
DECLARE
    doc_record RECORD;
    updated_count INTEGER := 0;
    new_document_number TEXT;
    doc_type_for_sequence TEXT;
BEGIN
    -- Process documents in chronological order (oldest first)
    FOR doc_record IN 
        SELECT id, type, created_at 
        FROM documents 
        WHERE document_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        -- Determine sequence type based on document type
        CASE doc_record.type
            WHEN 'receipt' THEN
                doc_type_for_sequence := 'sale_receipt';
            WHEN 'expense_receipt' THEN
                doc_type_for_sequence := 'expense_receipt';
            WHEN 'daily_report' THEN
                doc_type_for_sequence := 'daily_report';
            WHEN 'monthly_report' THEN
                doc_type_for_sequence := 'monthly_report';
            WHEN 'yearly_report' THEN
                doc_type_for_sequence := 'monthly_report'; -- Use monthly format
            ELSE
                doc_type_for_sequence := 'sale_receipt'; -- Default fallback
        END CASE;
        
        -- Generate document number
        new_document_number := generate_document_number(doc_type_for_sequence);
        
        -- Update the document with document number
        UPDATE documents 
        SET document_number = new_document_number 
        WHERE id = doc_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate existing bank transactions with transaction numbers
CREATE OR REPLACE FUNCTION migrate_existing_bank_transactions_numbers()
RETURNS INTEGER AS $$
DECLARE
    transaction_record RECORD;
    updated_count INTEGER := 0;
    new_transaction_number TEXT;
BEGIN
    -- Process bank transactions in chronological order (oldest first)
    FOR transaction_record IN 
        SELECT id, created_at 
        FROM bank_transactions 
        WHERE transaction_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        -- Generate transaction number
        new_transaction_number := generate_document_number('bank_transaction');
        
        -- Update the bank transaction with transaction number
        UPDATE bank_transactions 
        SET transaction_number = new_transaction_number 
        WHERE id = transaction_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate existing cash movements with movement numbers
CREATE OR REPLACE FUNCTION migrate_existing_cash_movements_numbers()
RETURNS INTEGER AS $$
DECLARE
    movement_record RECORD;
    updated_count INTEGER := 0;
    new_movement_number TEXT;
BEGIN
    -- Process cash movements in chronological order (oldest first)
    FOR movement_record IN 
        SELECT id, created_at 
        FROM cash_movements 
        WHERE movement_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        -- Generate movement number
        new_movement_number := generate_document_number('cash_movement');
        
        -- Update the cash movement with movement number
        UPDATE cash_movements 
        SET movement_number = new_movement_number 
        WHERE id = movement_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration functions
DO $$
DECLARE
    sales_migrated INTEGER;
    expenses_migrated INTEGER;
    documents_migrated INTEGER;
    bank_transactions_migrated INTEGER;
    cash_movements_migrated INTEGER;
BEGIN
    -- Migrate sales
    SELECT migrate_existing_sales_receipt_numbers() INTO sales_migrated;
    RAISE NOTICE 'Migrated % sales with receipt numbers', sales_migrated;
    
    -- Migrate expenses
    SELECT migrate_existing_expenses_receipt_numbers() INTO expenses_migrated;
    RAISE NOTICE 'Migrated % expenses with receipt numbers', expenses_migrated;
    
    -- Migrate documents
    SELECT migrate_existing_documents_numbers() INTO documents_migrated;
    RAISE NOTICE 'Migrated % documents with document numbers', documents_migrated;
    
    -- Migrate bank transactions
    SELECT migrate_existing_bank_transactions_numbers() INTO bank_transactions_migrated;
    RAISE NOTICE 'Migrated % bank transactions with transaction numbers', bank_transactions_migrated;
    
    -- Migrate cash movements
    SELECT migrate_existing_cash_movements_numbers() INTO cash_movements_migrated;
    RAISE NOTICE 'Migrated % cash movements with movement numbers', cash_movements_migrated;
    
    RAISE NOTICE 'Migration completed successfully!';
END $$;

-- Grant permissions for migration functions (in case they need to be called manually)
GRANT EXECUTE ON FUNCTION migrate_existing_sales_receipt_numbers() TO authenticated;
GRANT EXECUTE ON FUNCTION migrate_existing_expenses_receipt_numbers() TO authenticated;
GRANT EXECUTE ON FUNCTION migrate_existing_documents_numbers() TO authenticated;
GRANT EXECUTE ON FUNCTION migrate_existing_bank_transactions_numbers() TO authenticated;
GRANT EXECUTE ON FUNCTION migrate_existing_cash_movements_numbers() TO authenticated;

-- Clean up: Remove the test records we created during testing
DELETE FROM sales WHERE receipt_number = 'VK2025000003';
DELETE FROM expenses WHERE receipt_number = 'AG2025000003';

-- Reset sequences to account for the deleted test records
UPDATE document_sequences SET current_number = current_number - 1 WHERE type = 'sale_receipt';
UPDATE document_sequences SET current_number = current_number - 1 WHERE type = 'expense_receipt';