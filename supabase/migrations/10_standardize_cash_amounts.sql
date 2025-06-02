-- =====================================================
-- 10 Standardize Cash Amounts - Consistent Data Format
-- =====================================================
-- Date: 2025-01-06
-- Purpose: Make bank transfers consistent with POS cash operations (positive amounts)

-- =====================================================
-- 1. REVERT CASH BALANCE FUNCTION TO ORIGINAL LOGIC
-- =====================================================

DROP FUNCTION IF EXISTS get_current_cash_balance();

CREATE OR REPLACE FUNCTION get_current_cash_balance()
RETURNS NUMERIC AS $$
DECLARE
    balance DECIMAL(10,2) := 0;
BEGIN
    -- Original logic: cash_in positive, cash_out made negative
    SELECT COALESCE(SUM(
        CASE 
            WHEN type = 'cash_in' THEN amount 
            WHEN type = 'cash_out' THEN -amount 
            ELSE 0 
        END
    ), 0) INTO balance
    FROM cash_movements;
    
    RETURN balance;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_current_cash_balance TO authenticated;

-- =====================================================
-- 2. UPDATE BANK TRANSFER FUNCTION - STORE POSITIVE AMOUNTS
-- =====================================================

DROP FUNCTION IF EXISTS create_bank_transfer_cash_movement;

CREATE OR REPLACE FUNCTION create_bank_transfer_cash_movement(
    p_user_id UUID,
    p_amount DECIMAL(10,2),
    p_description TEXT,
    p_direction VARCHAR(10) -- 'to_bank' or 'from_bank'
)
RETURNS UUID AS $$
DECLARE
    v_cash_movement_id UUID;
    v_final_amount DECIMAL(10,2);
    v_final_description TEXT;
    v_type VARCHAR(10);
BEGIN
    -- Store amounts as POSITIVE values (consistent with cash_operations)
    -- The cash balance function will apply the correct sign
    v_final_amount := ABS(p_amount); -- Always positive
    
    IF p_direction = 'to_bank' THEN
        v_final_description := CONCAT('Zur Bank gebracht: ', p_description);
        v_type := 'cash_out'; -- Money going out of cash register
    ELSIF p_direction = 'from_bank' THEN
        v_final_description := CONCAT('Von Bank geholt: ', p_description);
        v_type := 'cash_in'; -- Money coming into cash register
    ELSE
        RAISE EXCEPTION 'Invalid direction. Use "to_bank" or "from_bank"';
    END IF;

    -- Insert with positive amount (consistent with existing cash_operations)
    INSERT INTO cash_movements (
        user_id,
        amount,
        type,
        description,
        movement_type,
        banking_status,
        created_at
    ) VALUES (
        p_user_id,
        v_final_amount,
        v_type,
        v_final_description,
        'bank_transfer',
        'unmatched',
        NOW()
    ) RETURNING id INTO v_cash_movement_id;

    RETURN v_cash_movement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_bank_transfer_cash_movement TO authenticated;

-- =====================================================
-- 3. FIX EXISTING BANK TRANSFER RECORDS
-- =====================================================

-- Update existing bank_transfer records to have positive amounts
UPDATE cash_movements 
SET amount = ABS(amount)
WHERE movement_type = 'bank_transfer' AND amount < 0;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check the standardized data
-- SELECT 
--     movement_type,
--     type,
--     COUNT(*) as count,
--     MIN(amount) as min_amount,
--     MAX(amount) as max_amount,
--     SUM(amount) as sum_amount
-- FROM cash_movements 
-- GROUP BY movement_type, type 
-- ORDER BY movement_type, type;

-- Test the balance function
-- SELECT get_current_cash_balance() as corrected_balance;