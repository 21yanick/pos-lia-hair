-- ============================================================================
-- PHASE 0: ACCOUNTING FOUNDATION
-- Swiss Payment Provider Settlement & Legal Compliance
-- ============================================================================

-- ============================================================================
-- 1. EXTEND SALES TABLE FOR PAYMENT PROVIDER SETTLEMENT
-- ============================================================================

-- Add settlement tracking fields to sales table
ALTER TABLE sales ADD COLUMN gross_amount DECIMAL(10,3);           -- Customer paid amount
ALTER TABLE sales ADD COLUMN provider_fee DECIMAL(10,3);           -- TWINT/SumUp fee  
ALTER TABLE sales ADD COLUMN net_amount DECIMAL(10,3);             -- Amount after fees
ALTER TABLE sales ADD COLUMN settlement_status TEXT CHECK (settlement_status IN 
    ('pending', 'settled', 'failed', 'weekend_delay', 'charged_back')) DEFAULT 'pending';
ALTER TABLE sales ADD COLUMN settlement_date DATE;                 -- Different from created_at!
ALTER TABLE sales ADD COLUMN provider_reference_id TEXT;           -- TWINT/SumUp transaction ID

-- Populate existing sales with new fields (migration)
UPDATE sales SET 
    gross_amount = total_amount,
    provider_fee = 0,
    net_amount = total_amount,
    settlement_status = CASE 
        WHEN payment_method = 'cash' THEN 'settled'
        ELSE 'pending'
    END,
    settlement_date = CASE 
        WHEN payment_method = 'cash' THEN DATE(created_at)
        ELSE NULL
    END
WHERE gross_amount IS NULL;

-- ============================================================================
-- 2. SWISS LEGAL AUDIT TRAIL (10-year retention requirement)
-- ============================================================================

-- Audit log for all financial operations
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    session_id TEXT,
    is_immutable BOOLEAN DEFAULT TRUE        -- Swiss legal requirement: no changes allowed
);

-- Create index for performance
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);

-- ============================================================================
-- 3. ATOMIC DAILY CLOSURE PROTECTION
-- ============================================================================

-- Prevent concurrent daily closure operations
CREATE TABLE daily_closure_locks (
    closure_date DATE PRIMARY KEY,
    locked_by UUID REFERENCES users(id),
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('in_progress', 'completed', 'failed')) DEFAULT 'in_progress'
);

-- ============================================================================
-- 4. AUDIT TRAIL TRIGGERS
-- ============================================================================

-- Function to log all changes to financial tables
CREATE OR REPLACE FUNCTION log_financial_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log for financial tables
    IF TG_TABLE_NAME IN ('sales', 'sale_items', 'expenses', 'cash_movements') THEN
        INSERT INTO audit_log (
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            user_id,
            ip_address
        ) VALUES (
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            TG_OP,
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
            COALESCE(NEW.user_id, OLD.user_id),
            inet_client_addr()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to all financial tables
CREATE TRIGGER audit_sales_changes
    AFTER INSERT OR UPDATE OR DELETE ON sales
    FOR EACH ROW EXECUTE FUNCTION log_financial_changes();

CREATE TRIGGER audit_sale_items_changes
    AFTER INSERT OR UPDATE OR DELETE ON sale_items
    FOR EACH ROW EXECUTE FUNCTION log_financial_changes();

CREATE TRIGGER audit_expenses_changes
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION log_financial_changes();

CREATE TRIGGER audit_cash_movements_changes
    AFTER INSERT OR UPDATE OR DELETE ON cash_movements
    FOR EACH ROW EXECUTE FUNCTION log_financial_changes();

-- ============================================================================
-- 5. ATOMIC DAILY CLOSURE FUNCTION
-- ============================================================================

-- Atomic daily closure with proper locking
CREATE OR REPLACE FUNCTION atomic_daily_closure(
    target_date DATE,
    expected_cash_end DECIMAL(10,3),
    user_id UUID
) RETURNS TABLE(
    success BOOLEAN,
    error_message TEXT,
    cash_variance DECIMAL(10,3)
) AS $$
DECLARE
    lock_acquired BOOLEAN := FALSE;
    actual_cash_end DECIMAL(10,3);
    variance DECIMAL(10,3);
BEGIN
    -- Try to acquire lock for this date
    BEGIN
        INSERT INTO daily_closure_locks (closure_date, locked_by, status)
        VALUES (target_date, user_id, 'in_progress');
        lock_acquired := TRUE;
    EXCEPTION WHEN unique_violation THEN
        RETURN QUERY SELECT FALSE, 'Date already locked for closure', 0::DECIMAL(10,3);
        RETURN;
    END;

    -- Check for pending settlements
    IF EXISTS (
        SELECT 1 FROM sales 
        WHERE DATE(created_at) = target_date 
        AND settlement_status = 'pending'
        AND payment_method IN ('twint', 'sumup')
    ) THEN
        DELETE FROM daily_closure_locks WHERE closure_date = target_date;
        RETURN QUERY SELECT FALSE, 'Pending settlements prevent closure', 0::DECIMAL(10,3);
        RETURN;
    END IF;

    -- Calculate actual cash end balance
    SELECT get_current_cash_balance() INTO actual_cash_end;
    variance := expected_cash_end - actual_cash_end;

    -- Update closure status
    UPDATE daily_closure_locks 
    SET status = 'completed' 
    WHERE closure_date = target_date;

    -- Return success
    RETURN QUERY SELECT TRUE, 'Closure completed successfully', variance;

EXCEPTION WHEN OTHERS THEN
    -- Clean up lock on error
    IF lock_acquired THEN
        DELETE FROM daily_closure_locks WHERE closure_date = target_date;
    END IF;
    RETURN QUERY SELECT FALSE, SQLERRM, 0::DECIMAL(10,3);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Verify settlement tracking is working
-- SELECT COUNT(*) as total_sales, 
--        COUNT(*) FILTER (WHERE settlement_status = 'settled') as settled_sales,
--        COUNT(*) FILTER (WHERE settlement_status = 'pending') as pending_sales
-- FROM sales;

-- Verify audit trail is working  
-- SELECT COUNT(*) as audit_entries FROM audit_log;

-- Test atomic closure (example)
-- SELECT * FROM atomic_daily_closure('2024-05-29', 1000.00, '00000000-0000-0000-0000-000000000000');