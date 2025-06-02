-- =====================================================
-- 07 Cash Movement Types - Banking Architecture Fix
-- =====================================================
-- Date: 2025-01-06
-- Purpose: Unterscheidung zwischen Kassen-Operationen und Bank-Transfers
-- Problem: Normale Bar-Verkäufe sollten NICHT im Bank Matching erscheinen
-- Lösung: movement_type column für Cash Movements

-- =====================================================
-- 1. ADD MOVEMENT_TYPE COLUMN TO CASH_MOVEMENTS
-- =====================================================

-- Add movement_type column with proper constraints
ALTER TABLE cash_movements 
ADD COLUMN IF NOT EXISTS movement_type VARCHAR(20) DEFAULT 'cash_operation' 
CHECK (movement_type IN ('cash_operation', 'bank_transfer'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_cash_movements_movement_type ON cash_movements(movement_type);

-- =====================================================
-- 2. UPDATE EXISTING CASH MOVEMENTS
-- =====================================================

-- Set all existing cash movements to 'cash_operation' (default)
-- This is safe because:
-- - Existing cash movements are likely normal operations (sales, expenses)
-- - Bank transfers will be created explicitly going forward
UPDATE cash_movements 
SET movement_type = 'cash_operation' 
WHERE movement_type IS NULL;

-- =====================================================
-- 3. UPDATE VIEW: available_for_bank_matching
-- =====================================================

-- Drop the existing view
DROP VIEW IF EXISTS available_for_bank_matching;

-- Recreate view with movement_type filter
CREATE VIEW available_for_bank_matching AS
(
    -- Provider-matched sales (net amounts)
    SELECT 
        s.id,
        'sale' as item_type,
        s.created_at::date as date,
        pr.net_amount as amount,
        CONCAT('Sale #', s.id, ' (', pr.provider, ' net)') as description,
        s.banking_status
    FROM sales s
    JOIN provider_reports pr ON s.provider_report_id = pr.id
    WHERE s.banking_status = 'provider_matched'
)
UNION ALL
(
    -- All expenses
    SELECT 
        e.id,
        'expense' as item_type, 
        e.created_at::date as date,
        -e.amount as amount, -- Negative for expenses
        e.description,
        e.banking_status
    FROM expenses e
    WHERE e.banking_status = 'unmatched'
)
UNION ALL
(
    -- ONLY Bank-Transfer Cash movements (NOT normal cash operations)
    SELECT 
        cm.id,
        'cash_movement' as item_type,
        cm.created_at::date as date,
        cm.amount,
        CONCAT('Cash Transfer: ', cm.description) as description,
        cm.banking_status
    FROM cash_movements cm
    WHERE 
        cm.banking_status = 'unmatched' 
        AND cm.movement_type = 'bank_transfer'  -- ← KEY CHANGE: Only bank transfers
)
ORDER BY date DESC;

-- =====================================================
-- 4. UPDATE RLS PERMISSIONS FOR NEW VIEW
-- =====================================================

-- Grant SELECT permission on the updated view
GRANT SELECT ON available_for_bank_matching TO authenticated;

-- =====================================================
-- 5. ADD HELPER FUNCTIONS FOR CASH TRANSFERS
-- =====================================================

-- Function to create a bank transfer cash movement
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
BEGIN
    -- Calculate final amount and description based on direction
    IF p_direction = 'to_bank' THEN
        v_final_amount := -ABS(p_amount); -- Negative = money leaving cash register
        v_final_description := CONCAT('Zur Bank gebracht: ', p_description);
    ELSIF p_direction = 'from_bank' THEN
        v_final_amount := ABS(p_amount); -- Positive = money coming to cash register
        v_final_description := CONCAT('Von Bank geholt: ', p_description);
    ELSE
        RAISE EXCEPTION 'Invalid direction. Use "to_bank" or "from_bank"';
    END IF;

    -- Insert the cash movement
    INSERT INTO cash_movements (
        user_id,
        amount,
        description,
        movement_type,
        banking_status,
        created_at
    ) VALUES (
        p_user_id,
        v_final_amount,
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

-- =====================================================
-- 6. VERIFICATION QUERIES (for testing)
-- =====================================================

-- Query to check cash movement types
-- SELECT movement_type, COUNT(*), SUM(amount) 
-- FROM cash_movements 
-- GROUP BY movement_type;

-- Query to verify view shows only bank transfers
-- SELECT * FROM available_for_bank_matching 
-- WHERE item_type = 'cash_movement';

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================

-- ✅ Added movement_type column to cash_movements
-- ✅ Set all existing movements to 'cash_operation' (safe default)
-- ✅ Updated available_for_bank_matching view to only show bank_transfer movements
-- ✅ Added index for performance
-- ✅ Created helper function for creating bank transfers
-- ✅ Updated RLS permissions

-- RESULT:
-- - Normal cash operations (sales, expenses) stay in cash register
-- - Only explicit bank transfers appear in Banking Tab 2
-- - Clear separation between cash operations and bank transfers