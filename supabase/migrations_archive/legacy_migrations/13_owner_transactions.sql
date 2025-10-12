-- =====================================================
-- 13 Owner Transactions - Private Einlagen & Ausgaben
-- =====================================================
-- Date: 2025-01-06
-- Purpose: Owner Transactions für Privateinlagen, private Geschäftsausgaben und Entnahmen
-- Integration: Banking Module Tab 2 für Bank Matching

-- =====================================================
-- 1. OWNER TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE owner_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction Details
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'expense', 'withdrawal')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0), -- Always positive, type determines direction
    description TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('bank_transfer', 'private_card', 'private_cash')),
    
    -- Banking Integration
    related_expense_id UUID REFERENCES expenses(id), -- Wenn expense über privaten Weg bezahlt
    related_bank_transaction_id UUID REFERENCES bank_transactions(id), -- Wenn via Bank Transfer
    banking_status VARCHAR(20) DEFAULT 'unmatched' CHECK (banking_status IN ('unmatched', 'matched')),
    
    -- Metadata
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_owner_transactions_type ON owner_transactions(transaction_type);
CREATE INDEX idx_owner_transactions_date ON owner_transactions(transaction_date);
CREATE INDEX idx_owner_transactions_user_id ON owner_transactions(user_id);
CREATE INDEX idx_owner_transactions_payment_method ON owner_transactions(payment_method);
CREATE INDEX idx_owner_transactions_banking_status ON owner_transactions(banking_status);
CREATE INDEX idx_owner_transactions_related_expense ON owner_transactions(related_expense_id);

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE owner_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_transactions_access" ON owner_transactions
    FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- =====================================================
-- 4. EXTEND AVAILABLE_FOR_BANK_MATCHING VIEW
-- =====================================================

-- Drop and recreate view to include owner transactions
DROP VIEW available_for_bank_matching;

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
    -- Cash movements (bank transfers only)
    SELECT 
        cm.id,
        'cash_movement' as item_type,
        cm.created_at::date as date,
        cm.amount,
        CONCAT('Cash Transfer: ', cm.description) as description,
        cm.banking_status
    FROM cash_movements cm
    WHERE cm.banking_status = 'unmatched' 
      AND cm.movement_type = 'bank_transfer'
)
UNION ALL
(
    -- Owner transactions (bank transfers only)
    SELECT 
        ot.id,
        'owner_transaction' as item_type,
        ot.transaction_date as date,
        CASE ot.transaction_type 
            WHEN 'deposit' THEN ot.amount     -- Positive: Money INTO business
            WHEN 'withdrawal' THEN -ot.amount -- Negative: Money OUT of business  
            WHEN 'expense' THEN -ot.amount    -- Negative: Owner paid expense
        END as amount,
        CONCAT('Owner ', 
            CASE ot.transaction_type
                WHEN 'deposit' THEN 'Einlage'
                WHEN 'withdrawal' THEN 'Entnahme'
                WHEN 'expense' THEN 'Ausgabe'
            END, 
            ': ', ot.description) as description,
        ot.banking_status
    FROM owner_transactions ot
    WHERE ot.payment_method = 'bank_transfer' 
      AND ot.banking_status = 'unmatched'
)
ORDER BY date DESC;

-- =====================================================
-- 5. OWNER BALANCE CALCULATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_owner_loan_balance(user_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_expenses DECIMAL(10,2) := 0;
    total_deposits DECIMAL(10,2) := 0;
    total_withdrawals DECIMAL(10,2) := 0;
BEGIN
    -- Owner paid for business expenses (Owner gave money to business)
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses
    FROM owner_transactions 
    WHERE user_id = user_uuid AND transaction_type = 'expense';
    
    -- Owner deposited money into business (Owner gave money to business)
    SELECT COALESCE(SUM(amount), 0) INTO total_deposits
    FROM owner_transactions 
    WHERE user_id = user_uuid AND transaction_type = 'deposit';
    
    -- Owner withdrew money from business (Business gave money to Owner)
    SELECT COALESCE(SUM(amount), 0) INTO total_withdrawals
    FROM owner_transactions 
    WHERE user_id = user_uuid AND transaction_type = 'withdrawal';
    
    -- Calculation:
    -- Positive = Business owes Owner money
    -- Negative = Owner owes Business money
    -- Formula: (Owner gave) - (Owner received) = (Expenses + Deposits) - Withdrawals
    RETURN (total_expenses + total_deposits - total_withdrawals);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_owner_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_owner_transactions_updated_at
    BEFORE UPDATE ON owner_transactions
    FOR EACH ROW EXECUTE FUNCTION update_owner_transactions_updated_at();

-- =====================================================
-- 7. EXTEND TRANSACTION MATCHES TABLE
-- =====================================================

-- Add owner_transaction to existing matched_type constraint
ALTER TABLE transaction_matches 
DROP CONSTRAINT transaction_matches_matched_type_check;

ALTER TABLE transaction_matches 
ADD CONSTRAINT transaction_matches_matched_type_check 
CHECK (matched_type IN ('sale', 'expense', 'provider_batch', 'cash_movement', 'owner_transaction'));

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary:
-- ✅ owner_transactions table created with banking integration
-- ✅ available_for_bank_matching view extended for owner transactions
-- ✅ Owner balance calculation function created
-- ✅ Proper RLS, indexes, and triggers configured
-- ✅ transaction_matches extended to support owner_transaction matching
-- ✅ Only bank_transfer owner transactions appear in Banking Tab 2

-- Use Cases Supported:
-- 1. Privateinlage: transaction_type='deposit', payment_method='bank_transfer'
-- 2. Private Geschäftsausgabe: transaction_type='expense', payment_method='private_card'
-- 3. Owner Entnahme: transaction_type='withdrawal', payment_method='bank_transfer'
-- 4. Automatic Banking Integration: bank_transfer items appear in Tab 2 for matching