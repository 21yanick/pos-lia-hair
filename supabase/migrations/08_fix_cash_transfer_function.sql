-- =====================================================
-- 08 Fix Cash Transfer Function - Add missing type column
-- =====================================================
-- Date: 2025-01-06
-- Purpose: Fix create_bank_transfer_cash_movement function to include required type column

-- =====================================================
-- UPDATE CASH TRANSFER FUNCTION
-- =====================================================

-- Drop and recreate the function with proper type handling
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
    -- Calculate final amount, description and type based on direction
    IF p_direction = 'to_bank' THEN
        v_final_amount := -ABS(p_amount); -- Negative = money leaving cash register
        v_final_description := CONCAT('Zur Bank gebracht: ', p_description);
        v_type := 'cash_out'; -- Money going out of cash register
    ELSIF p_direction = 'from_bank' THEN
        v_final_amount := ABS(p_amount); -- Positive = money coming to cash register
        v_final_description := CONCAT('Von Bank geholt: ', p_description);
        v_type := 'cash_in'; -- Money coming into cash register
    ELSE
        RAISE EXCEPTION 'Invalid direction. Use "to_bank" or "from_bank"';
    END IF;

    -- Insert the cash movement with all required fields
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_bank_transfer_cash_movement TO authenticated;