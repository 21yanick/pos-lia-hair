-- ============================================================================
-- SIMPLE BANKING SYSTEM
-- 2-Tab Click-to-Connect: Provider-Gebühren + Bank-Abgleich
-- ============================================================================

-- Provider Settlements (TWINT/SumUp CSV Import)
CREATE TABLE IF NOT EXISTS provider_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Provider Info
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('twint', 'sumup')),
    
    -- Transaction Details
    transaction_date DATE NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL, -- Was Customer bezahlt hat
    fees DECIMAL(10,2) NOT NULL DEFAULT 0, -- Provider Gebühren
    net_amount DECIMAL(10,2) NOT NULL, -- Nach Abzug Gebühren
    
    -- Provider Reference
    provider_reference VARCHAR(100), -- Provider Transaction ID
    description TEXT,
    
    -- Matching
    matched_sale_id UUID REFERENCES sales(id),
    is_matched BOOLEAN DEFAULT false,
    
    -- Import Info
    import_file VARCHAR(255),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Transactions (Bank CSV Import)
CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction Details
    transaction_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL, -- + Eingang, - Ausgang
    description TEXT NOT NULL,
    reference VARCHAR(255),
    
    -- Bank Info
    bank_name VARCHAR(50) DEFAULT 'raiffeisen',
    
    -- Matching Status
    is_matched BOOLEAN DEFAULT false,
    match_type VARCHAR(20), -- 'expense', 'provider_batch', 'other'
    
    -- Import Info
    import_file VARCHAR(255),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend existing tables with simple foreign keys
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS provider_settlement_id UUID REFERENCES provider_settlements(id);

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES bank_transactions(id);

-- ============================================================================
-- SIMPLE MATCHING FUNCTIONS
-- ============================================================================

-- Match POS Sale to Provider Settlement (Tab 1)
CREATE OR REPLACE FUNCTION match_sale_to_provider(
    p_sale_id UUID,
    p_settlement_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update provider settlement
    UPDATE provider_settlements 
    SET matched_sale_id = p_sale_id, is_matched = true
    WHERE id = p_settlement_id;
    
    -- Update sale
    UPDATE sales 
    SET provider_settlement_id = p_settlement_id
    WHERE id = p_sale_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Match Expense to Bank Transaction (Tab 2)
CREATE OR REPLACE FUNCTION match_expense_to_bank(
    p_expense_id UUID,
    p_bank_transaction_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update bank transaction
    UPDATE bank_transactions 
    SET is_matched = true, match_type = 'expense'
    WHERE id = p_bank_transaction_id;
    
    -- Update expense
    UPDATE expenses 
    SET bank_transaction_id = p_bank_transaction_id
    WHERE id = p_expense_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Mark Bank Transaction as Provider Batch
CREATE OR REPLACE FUNCTION mark_bank_as_provider_batch(
    p_bank_transaction_id UUID,
    p_provider VARCHAR(20)
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE bank_transactions 
    SET 
        is_matched = true, 
        match_type = 'provider_batch',
        description = description || ' (' || p_provider || ' Sammlung)'
    WHERE id = p_bank_transaction_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SIMPLE OVERVIEW FUNCTIONS
-- ============================================================================

-- Get Unmatched Items Count
CREATE OR REPLACE FUNCTION get_unmatched_counts(p_user_id UUID)
RETURNS TABLE (
    unmatched_sales INTEGER,
    unmatched_settlements INTEGER,
    unmatched_expenses INTEGER,
    unmatched_bank_transactions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM sales 
         WHERE user_id = p_user_id AND provider_settlement_id IS NULL),
        (SELECT COUNT(*)::INTEGER FROM provider_settlements 
         WHERE user_id = p_user_id AND is_matched = false),
        (SELECT COUNT(*)::INTEGER FROM expenses 
         WHERE user_id = p_user_id AND bank_transaction_id IS NULL),
        (SELECT COUNT(*)::INTEGER FROM bank_transactions 
         WHERE user_id = p_user_id AND is_matched = false);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES & SECURITY
-- ============================================================================

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_provider_settlements_user ON provider_settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_settlements_matched ON provider_settlements(is_matched);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_user ON bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_matched ON bank_transactions(is_matched);

-- Row Level Security
ALTER TABLE provider_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "provider_settlements_user_access" ON provider_settlements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "bank_transactions_user_access" ON bank_transactions
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE provider_settlements IS 'TWINT/SumUp settlements for fee calculation';
COMMENT ON TABLE bank_transactions IS 'Bank account transactions for reconciliation';
COMMENT ON FUNCTION match_sale_to_provider IS 'Tab 1: Match POS sale to provider settlement';
COMMENT ON FUNCTION match_expense_to_bank IS 'Tab 2: Match expense to bank transaction';

-- Simple Banking System Ready!