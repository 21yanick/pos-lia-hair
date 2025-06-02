-- ============================================================================
-- Migration 16: Auto Receipt Number Generation Triggers
-- Erstellt Trigger für automatische Belegnummer-Generierung bei INSERT
-- ============================================================================

-- Trigger function to auto-generate receipt numbers for sales
CREATE OR REPLACE FUNCTION auto_generate_sales_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if receipt_number is NULL
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number := generate_document_number('sale_receipt');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate receipt numbers for expenses
CREATE OR REPLACE FUNCTION auto_generate_expenses_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if receipt_number is NULL
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number := generate_document_number('expense_receipt');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate document numbers for documents
CREATE OR REPLACE FUNCTION auto_generate_document_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if document_number is NULL
    IF NEW.document_number IS NULL THEN
        -- Determine document type based on document type field
        CASE NEW.type
            WHEN 'receipt' THEN
                NEW.document_number := generate_document_number('sale_receipt');
            WHEN 'expense_receipt' THEN
                NEW.document_number := generate_document_number('expense_receipt');
            WHEN 'daily_report' THEN
                NEW.document_number := generate_document_number('daily_report');
            WHEN 'monthly_report' THEN
                NEW.document_number := generate_document_number('monthly_report');
            WHEN 'yearly_report' THEN
                NEW.document_number := generate_document_number('monthly_report'); -- Use monthly format for yearly
            ELSE
                NEW.document_number := generate_document_number('sale_receipt'); -- Default fallback
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate transaction numbers for bank transactions
CREATE OR REPLACE FUNCTION auto_generate_bank_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if transaction_number is NULL
    IF NEW.transaction_number IS NULL THEN
        NEW.transaction_number := generate_document_number('bank_transaction');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate movement numbers for cash movements
CREATE OR REPLACE FUNCTION auto_generate_cash_movement_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if movement_number is NULL
    IF NEW.movement_number IS NULL THEN
        NEW.movement_number := generate_document_number('cash_movement');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic receipt number generation
-- Sales trigger
CREATE TRIGGER trigger_auto_sales_receipt_number
    BEFORE INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_sales_receipt_number();

-- Expenses trigger
CREATE TRIGGER trigger_auto_expenses_receipt_number
    BEFORE INSERT ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_expenses_receipt_number();

-- Documents trigger
CREATE TRIGGER trigger_auto_document_number
    BEFORE INSERT ON documents
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_document_number();

-- Bank transactions trigger
CREATE TRIGGER trigger_auto_bank_transaction_number
    BEFORE INSERT ON bank_transactions
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_bank_transaction_number();

-- Cash movements trigger
CREATE TRIGGER trigger_auto_cash_movement_number
    BEFORE INSERT ON cash_movements
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_cash_movement_number();

-- Grant permissions for new trigger functions
GRANT EXECUTE ON FUNCTION auto_generate_sales_receipt_number() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_generate_expenses_receipt_number() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_generate_document_number() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_generate_bank_transaction_number() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_generate_cash_movement_number() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION auto_generate_sales_receipt_number() IS 'Auto-generates receipt numbers for new sales (format: VK2025000001)';
COMMENT ON FUNCTION auto_generate_expenses_receipt_number() IS 'Auto-generates receipt numbers for new expenses (format: AG2025000001)';
COMMENT ON FUNCTION auto_generate_document_number() IS 'Auto-generates document numbers based on document type';
COMMENT ON FUNCTION auto_generate_bank_transaction_number() IS 'Auto-generates transaction numbers for bank transactions (format: BT2025000001)';
COMMENT ON FUNCTION auto_generate_cash_movement_number() IS 'Auto-generates movement numbers for cash movements (format: CM2025000001)';