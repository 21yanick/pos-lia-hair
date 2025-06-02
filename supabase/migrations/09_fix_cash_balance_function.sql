-- =====================================================
-- 09 Fix Cash Balance Function - Handle signed amounts correctly
-- =====================================================
-- Date: 2025-01-06
-- Purpose: Fix get_current_cash_balance to handle pre-signed amounts from bank transfers

-- =====================================================
-- UPDATE CASH BALANCE FUNCTION
-- =====================================================

-- Drop and recreate with correct logic
DROP FUNCTION IF EXISTS get_current_cash_balance();

CREATE OR REPLACE FUNCTION get_current_cash_balance()
RETURNS NUMERIC AS $$
DECLARE
    balance DECIMAL(10,2) := 0;
BEGIN
    -- Simply sum all amounts as they are already correctly signed
    -- - cash_in amounts are positive
    -- - cash_out amounts from regular operations are negative (handled by UI)
    -- - cash_out amounts from bank transfers are negative (handled by function)
    SELECT COALESCE(SUM(amount), 0) INTO balance
    FROM cash_movements;
    
    RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_cash_balance TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test the function
-- SELECT get_current_cash_balance() as new_balance;

-- Check what each movement type contributes
-- SELECT 
--     movement_type,
--     type,
--     COUNT(*) as count,
--     SUM(amount) as sum
-- FROM cash_movements 
-- GROUP BY movement_type, type 
-- ORDER BY movement_type, type;