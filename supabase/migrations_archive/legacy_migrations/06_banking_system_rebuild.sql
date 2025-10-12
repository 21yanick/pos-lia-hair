-- =====================================================
-- 06 Banking System Rebuild - Provider & Bank Reconciliation
-- =====================================================
-- Date: 2025-01-06
-- Purpose: Complete banking system rewrite based on real TWINT/SumUp/Bank data
-- Replaces: Legacy bank_reconciliation_* tables (moved to docs/legacy_modules_backup/)

-- =====================================================
-- 1. CLEANUP: Drop Legacy Banking Tables
-- =====================================================

-- Store legacy data if needed (should be backed up first)
DROP TABLE IF EXISTS bank_reconciliation_matches CASCADE;
DROP TABLE IF EXISTS bank_reconciliation_sessions CASCADE;

-- =====================================================
-- 2. CORE BANKING INFRASTRUCTURE  
-- =====================================================

-- Bank Accounts (Multiple accounts support: Raiffeisen, UBS, etc.)
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- 'Raiffeisen Geschäftskonto'
    bank_name VARCHAR(50) NOT NULL, -- 'raiffeisen', 'ubs', 'postfinance'
    iban VARCHAR(34), -- CH5180808002007735062
    account_number VARCHAR(50),
    current_balance DECIMAL(12,2) DEFAULT 0.00,
    last_statement_date DATE,
    is_active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Bank Transactions (All bank movements: imports from XML/CSV)
CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID REFERENCES bank_accounts(id) NOT NULL,
    transaction_date DATE NOT NULL,
    booking_date DATE, -- Buchungsdatum (can differ from transaction_date)
    amount DECIMAL(12,2) NOT NULL, -- Positive = Eingang, Negative = Ausgang
    description TEXT NOT NULL,
    reference VARCHAR(255), -- Bank reference number
    transaction_code VARCHAR(20), -- Bank-specific transaction codes
    
    -- Import metadata
    import_batch_id UUID, -- For tracking bulk imports
    import_filename VARCHAR(255),
    import_date TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB, -- Original XML/CSV data for audit
    
    -- Reconciliation status
    status VARCHAR(20) DEFAULT 'unmatched' CHECK (status IN ('unmatched', 'matched', 'ignored')),
    
    -- Audit
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- =====================================================
-- 3. PROVIDER REPORTS (TWINT/SumUp Settlements)
-- =====================================================

-- Provider Reports (TWINT/SumUp CSV imports)
CREATE TABLE provider_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('twint', 'sumup')),
    
    -- Transaction details
    transaction_date DATE NOT NULL,
    settlement_date DATE, -- When provider pays out
    gross_amount DECIMAL(10,2) NOT NULL, -- Original transaction amount
    fees DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Provider fees
    net_amount DECIMAL(10,2) NOT NULL, -- Amount after fees (gross - fees)
    
    -- Provider-specific data
    provider_transaction_id VARCHAR(100), -- TWINT/SumUp transaction ID
    provider_reference VARCHAR(255),
    payment_method VARCHAR(50), -- 'MASTERCARD', 'VISA', etc.
    currency VARCHAR(3) DEFAULT 'CHF',
    
    -- Import metadata  
    import_filename VARCHAR(255) NOT NULL,
    import_date TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB, -- Original CSV row for audit
    
    -- Reconciliation
    sale_id UUID REFERENCES sales(id), -- Matched POS sale
    status VARCHAR(20) DEFAULT 'unmatched' CHECK (status IN ('unmatched', 'matched', 'discrepancy')),
    
    -- Audit
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- =====================================================
-- 4. TRANSACTION MATCHING SYSTEM
-- =====================================================

-- Many-to-Many Relationship: Bank Transactions ↔ Internal Transactions
CREATE TABLE transaction_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_transaction_id UUID REFERENCES bank_transactions(id) NOT NULL,
    
    -- What is being matched (polymorphic)
    matched_type VARCHAR(20) NOT NULL CHECK (matched_type IN ('sale', 'expense', 'provider_batch', 'cash_movement')),
    matched_id UUID NOT NULL, -- References sales.id, expenses.id, etc.
    
    -- Matching details
    matched_amount DECIMAL(10,2) NOT NULL, -- Portion of bank transaction
    match_confidence DECIMAL(5,2) DEFAULT 0.00, -- 0.00 to 100.00 (percentage)
    match_type VARCHAR(20) DEFAULT 'manual' CHECK (match_type IN ('automatic', 'manual', 'suggested')),
    
    -- Audit  
    matched_by UUID REFERENCES auth.users(id),
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- =====================================================
-- 5. EXTEND EXISTING TABLES
-- =====================================================

-- Add Banking columns to Sales
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS provider_report_id UUID REFERENCES provider_reports(id),
ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES bank_transactions(id),
ADD COLUMN IF NOT EXISTS banking_status VARCHAR(20) DEFAULT 'unmatched' 
    CHECK (banking_status IN ('unmatched', 'provider_matched', 'bank_matched', 'fully_matched'));

-- Add Banking columns to Expenses  
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES bank_transactions(id),
ADD COLUMN IF NOT EXISTS banking_status VARCHAR(20) DEFAULT 'unmatched'
    CHECK (banking_status IN ('unmatched', 'matched'));

-- Add Banking columns to Cash Movements
ALTER TABLE cash_movements
ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES bank_transactions(id),
ADD COLUMN IF NOT EXISTS banking_status VARCHAR(20) DEFAULT 'unmatched'
    CHECK (banking_status IN ('unmatched', 'matched'));

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Bank Accounts
CREATE INDEX idx_bank_accounts_user_active ON bank_accounts(user_id, is_active);
CREATE INDEX idx_bank_accounts_iban ON bank_accounts(iban);

-- Bank Transactions  
CREATE INDEX idx_bank_transactions_account_date ON bank_transactions(bank_account_id, transaction_date);
CREATE INDEX idx_bank_transactions_status ON bank_transactions(status);
CREATE INDEX idx_bank_transactions_amount ON bank_transactions(amount);
CREATE INDEX idx_bank_transactions_import_batch ON bank_transactions(import_batch_id);

-- Provider Reports
CREATE INDEX idx_provider_reports_provider_status ON provider_reports(provider, status);
CREATE INDEX idx_provider_reports_transaction_date ON provider_reports(transaction_date);
CREATE INDEX idx_provider_reports_sale_id ON provider_reports(sale_id);
CREATE INDEX idx_provider_reports_import_date ON provider_reports(import_date);

-- Transaction Matches
CREATE INDEX idx_transaction_matches_bank_transaction ON transaction_matches(bank_transaction_id);
CREATE INDEX idx_transaction_matches_matched_type_id ON transaction_matches(matched_type, matched_id);
CREATE INDEX idx_transaction_matches_confidence ON transaction_matches(match_confidence);

-- Extended table indexes
CREATE INDEX idx_sales_provider_report ON sales(provider_report_id);
CREATE INDEX idx_sales_bank_transaction ON sales(bank_transaction_id);
CREATE INDEX idx_sales_banking_status ON sales(banking_status);
CREATE INDEX idx_expenses_bank_transaction ON expenses(bank_transaction_id);
CREATE INDEX idx_cash_movements_bank_transaction ON cash_movements(bank_transaction_id);

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_matches ENABLE ROW LEVEL SECURITY;

-- Bank Accounts Policies
CREATE POLICY "bank_accounts_access" ON bank_accounts
    FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Bank Transactions Policies  
CREATE POLICY "bank_transactions_access" ON bank_transactions
    FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Provider Reports Policies
CREATE POLICY "provider_reports_access" ON provider_reports
    FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Transaction Matches Policies
CREATE POLICY "transaction_matches_access" ON transaction_matches
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM bank_transactions bt 
            WHERE bt.id = bank_transaction_id AND bt.user_id = auth.uid()
        )
    );

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update bank account balance when transactions change
CREATE OR REPLACE FUNCTION update_bank_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current_balance and last_statement_date
    UPDATE bank_accounts 
    SET 
        current_balance = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM bank_transactions 
            WHERE bank_account_id = COALESCE(NEW.bank_account_id, OLD.bank_account_id)
        ),
        last_statement_date = (
            SELECT MAX(transaction_date)
            FROM bank_transactions 
            WHERE bank_account_id = COALESCE(NEW.bank_account_id, OLD.bank_account_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.bank_account_id, OLD.bank_account_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for bank balance updates
CREATE TRIGGER trigger_update_bank_balance
    AFTER INSERT OR UPDATE OR DELETE ON bank_transactions
    FOR EACH ROW EXECUTE FUNCTION update_bank_account_balance();

-- Update banking_status for sales when provider_report is matched
CREATE OR REPLACE FUNCTION update_sales_banking_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sale_id IS NOT NULL AND OLD.sale_id IS NULL THEN
        -- Provider report was just matched to a sale
        UPDATE sales 
        SET 
            provider_report_id = NEW.id,
            banking_status = CASE 
                WHEN bank_transaction_id IS NOT NULL THEN 'fully_matched'
                ELSE 'provider_matched'
            END
        WHERE id = NEW.sale_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sales banking status
CREATE TRIGGER trigger_update_sales_banking_status
    AFTER UPDATE ON provider_reports
    FOR EACH ROW EXECUTE FUNCTION update_sales_banking_status();

-- =====================================================
-- 9. USEFUL VIEWS FOR THE UI
-- =====================================================

-- Unmatched Provider Reports (for Tab 1 right side)
CREATE VIEW unmatched_provider_reports AS
SELECT 
    pr.*,
    CASE 
        WHEN pr.provider = 'twint' THEN '🟦 TWINT'
        WHEN pr.provider = 'sumup' THEN '🟧 SumUp'
        ELSE pr.provider
    END as provider_display
FROM provider_reports pr
WHERE pr.status = 'unmatched'
ORDER BY pr.transaction_date DESC;

-- Unmatched Sales for Provider Matching (for Tab 1 left side) 
CREATE VIEW unmatched_sales_for_provider AS
SELECT 
    s.*,
    CASE s.payment_method
        WHEN 'twint' THEN '🟦 TWINT'
        WHEN 'sumup' THEN '🟧 SumUp'
        ELSE s.payment_method
    END as payment_display
FROM sales s
WHERE 
    s.payment_method IN ('twint', 'sumup') 
    AND s.provider_report_id IS NULL
    AND s.banking_status = 'unmatched'
ORDER BY s.created_at DESC;

-- Unmatched Bank Transactions (for Tab 2 left side)
CREATE VIEW unmatched_bank_transactions AS
SELECT 
    bt.*,
    ba.name as bank_account_name,
    CASE 
        WHEN bt.amount > 0 THEN '⬆️ Eingang'
        ELSE '⬇️ Ausgang'
    END as direction_display,
    ABS(bt.amount) as amount_abs
FROM bank_transactions bt
JOIN bank_accounts ba ON bt.bank_account_id = ba.id
WHERE bt.status = 'unmatched'
ORDER BY bt.transaction_date DESC;

-- Available items for Bank Matching (for Tab 2 right side)
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
    -- Cash movements
    SELECT 
        cm.id,
        'cash_movement' as item_type,
        cm.created_at::date as date,
        cm.amount,
        CONCAT('Cash: ', cm.description) as description,
        cm.banking_status
    FROM cash_movements cm
    WHERE cm.banking_status = 'unmatched'
)
ORDER BY date DESC;

-- =====================================================
-- 10. SAMPLE DATA (for development)
-- =====================================================

-- Insert default bank account
INSERT INTO bank_accounts (name, bank_name, iban, user_id)
SELECT 
    'Raiffeisen Geschäftskonto',
    'raiffeisen', 
    'CH5180808002007735062',
    id
FROM auth.users 
LIMIT 1;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary:
-- ✅ Legacy bank_reconciliation_* tables dropped
-- ✅ New banking infrastructure created
-- ✅ Provider reports system for TWINT/SumUp
-- ✅ Flexible transaction matching system  
-- ✅ Extended existing tables with banking references
-- ✅ Performance indexes added
-- ✅ RLS policies configured
-- ✅ Automatic triggers for balance updates
-- ✅ Helper views for UI components
-- ✅ Sample data inserted

-- Next Steps:
-- 1. Run this migration: supabase db reset --linked
-- 2. Update TypeScript types 
-- 3. Implement file import services (TWINT/SumUp/Bank CSV/XML)
-- 4. Build Banking UI with 2-tab system
-- 5. Implement click-to-connect matching logic