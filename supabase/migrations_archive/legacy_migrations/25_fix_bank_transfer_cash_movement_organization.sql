-- =====================================================
-- Fix Bank Transfer Cash Movement Function for Multi-Tenancy
-- =====================================================
-- Migration to add organization_id parameter to create_bank_transfer_cash_movement function
-- This fixes the missing organization_id in cash movements created by banking transfers

-- Drop the existing function
DROP FUNCTION IF EXISTS create_bank_transfer_cash_movement(uuid, numeric, text, character varying);

-- Create the updated function with organization_id parameter
CREATE OR REPLACE FUNCTION create_bank_transfer_cash_movement(
    p_user_id UUID,
    p_amount NUMERIC,
    p_description TEXT,
    p_direction CHARACTER VARYING,
    p_organization_id UUID  -- ✅ NEW: Organization ID for Multi-Tenant security
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
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

    -- ✅ FIXED: Insert with organization_id for Multi-Tenant security
    INSERT INTO cash_movements (
        user_id,
        amount,
        type,
        description,
        organization_id,  -- ✅ NEW: Organization security
        movement_type,
        banking_status,
        created_at
    ) VALUES (
        p_user_id,
        v_final_amount,
        v_type,
        v_final_description,
        p_organization_id,  -- ✅ NEW: Organization security
        'bank_transfer',
        'unmatched',
        NOW()
    ) RETURNING id INTO v_cash_movement_id;

    RETURN v_cash_movement_id;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION create_bank_transfer_cash_movement(UUID, NUMERIC, TEXT, CHARACTER VARYING, UUID) TO authenticated;