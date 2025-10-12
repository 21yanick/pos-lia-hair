-- ============================================================================
-- BANKING MODULE FOUNDATION
-- Modern Click-to-Connect Banking Reconciliation System
-- Ersetzt zeitbasierte Abschlüsse durch kontinuierlichen Abgleich
-- ============================================================================

-- Provider Reports Tabelle
-- Speichert importierte TWINT/SumUp Settlement Reports
CREATE TABLE IF NOT EXISTS provider_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Provider Information
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('twint', 'sumup')),
    provider_reference_id VARCHAR(100), -- Provider's internal transaction ID
    
    -- File Import Details
    file_name VARCHAR(255) NOT NULL,
    import_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Financial Details
    gross_amount DECIMAL(10,2) NOT NULL, -- Bruttobetrag (was Customer paid)
    fees DECIMAL(10,2) NOT NULL DEFAULT 0, -- Provider fees
    net_amount DECIMAL(10,2) NOT NULL, -- Nettobetrag (nach Abzug Gebühren)
    
    -- Settlement Information
    settlement_date DATE NOT NULL, -- When provider settled
    settlement_reference VARCHAR(100), -- Provider settlement batch ID
    
    -- Matching Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'discrepancy', 'ignored')),
    sale_id UUID REFERENCES sales(id), -- Matched POS sale
    match_confidence DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Ownership & Audit
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    matched_at TIMESTAMPTZ,
    matched_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Bank Transactions Tabelle
-- Speichert importierte Bank Statements (Raiffeisen, UBS, etc.)
CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Bank Information
    bank_name VARCHAR(50) NOT NULL, -- 'raiffeisen', 'ubs', 'postfinance', etc.
    iban VARCHAR(34), -- Account IBAN
    
    -- Transaction Details
    transaction_date DATE NOT NULL, -- Value date
    booking_date DATE, -- Booking date (can differ from value date)
    amount DECIMAL(10,2) NOT NULL, -- Transaction amount (+ credit, - debit)
    currency VARCHAR(3) DEFAULT 'CHF',
    
    -- Description & References
    description TEXT NOT NULL, -- Bank's transaction description
    reference VARCHAR(255), -- Bank reference number
    debitor_creditor VARCHAR(255), -- Counterparty name
    
    -- File Import Details
    file_name VARCHAR(255), -- Original import file
    file_type VARCHAR(10) CHECK (file_type IN ('csv', 'xml', 'mt940')),
    import_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Matching Status
    status VARCHAR(20) DEFAULT 'unmatched' CHECK (status IN ('unmatched', 'matched', 'partial', 'ignored')),
    
    -- Ownership & Audit
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Transaction Matches Tabelle (Many-to-Many)
-- Flexible Zuordnung: 1 Bank Transaction ↔ N Sales/Expenses
CREATE TABLE IF NOT EXISTS transaction_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Bank Transaction (1)
    bank_transaction_id UUID REFERENCES bank_transactions(id) ON DELETE CASCADE,
    
    -- Matched Reference (N) - Polymorphic
    reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('sale', 'expense', 'provider_report', 'cash_movement')),
    reference_id UUID NOT NULL, -- Points to sales.id, expenses.id, etc.
    
    -- Match Details
    matched_amount DECIMAL(10,2) NOT NULL, -- Amount allocated to this match
    match_confidence DECIMAL(3,2), -- 0.00 to 1.00
    match_type VARCHAR(20) DEFAULT 'automatic' CHECK (match_type IN ('automatic', 'manual', 'suggested')),
    
    -- Audit Trail
    matched_by UUID REFERENCES auth.users(id),
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    
    -- Ensure referential integrity
    CONSTRAINT positive_matched_amount CHECK (matched_amount > 0)
);

-- ============================================================================
-- EXTEND EXISTING TABLES
-- ============================================================================

-- Extend Sales table für Banking Integration
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS provider_report_id UUID REFERENCES provider_reports(id),
ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES bank_transactions(id),
ADD COLUMN IF NOT EXISTS banking_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (banking_status IN ('pending', 'provider_matched', 'bank_matched', 'fully_reconciled'));

-- Extend Expenses table für Banking Integration
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES bank_transactions(id),
ADD COLUMN IF NOT EXISTS banking_status VARCHAR(20) DEFAULT 'pending'
    CHECK (banking_status IN ('pending', 'bank_matched', 'reconciled'));

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Provider Reports Indexes
CREATE INDEX IF NOT EXISTS idx_provider_reports_provider ON provider_reports(provider);
CREATE INDEX IF NOT EXISTS idx_provider_reports_settlement_date ON provider_reports(settlement_date);
CREATE INDEX IF NOT EXISTS idx_provider_reports_status ON provider_reports(status);
CREATE INDEX IF NOT EXISTS idx_provider_reports_user_id ON provider_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_reports_sale_id ON provider_reports(sale_id);

-- Bank Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_bank_transactions_bank_name ON bank_transactions(bank_name);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_transaction_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_status ON bank_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_user_id ON bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_amount ON bank_transactions(amount);

-- Transaction Matches Indexes
CREATE INDEX IF NOT EXISTS idx_transaction_matches_bank_transaction ON transaction_matches(bank_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_matches_reference ON transaction_matches(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_transaction_matches_confidence ON transaction_matches(match_confidence);

-- Extended Sales Indexes
CREATE INDEX IF NOT EXISTS idx_sales_provider_report ON sales(provider_report_id);
CREATE INDEX IF NOT EXISTS idx_sales_bank_transaction ON sales(bank_transaction_id);
CREATE INDEX IF NOT EXISTS idx_sales_banking_status ON sales(banking_status);

-- Extended Expenses Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_bank_transaction ON expenses(bank_transaction_id);
CREATE INDEX IF NOT EXISTS idx_expenses_banking_status ON expenses(banking_status);

-- ============================================================================
-- BANKING MODULE FUNCTIONS
-- ============================================================================

-- Function: Import Provider Report
CREATE OR REPLACE FUNCTION import_provider_report(
    p_provider VARCHAR(50),
    p_file_name VARCHAR(255),
    p_gross_amount DECIMAL(10,2),
    p_fees DECIMAL(10,2),
    p_net_amount DECIMAL(10,2),
    p_settlement_date DATE,
    p_provider_reference_id VARCHAR(100),
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_report_id UUID;
BEGIN
    INSERT INTO provider_reports (
        provider, file_name, gross_amount, fees, net_amount,
        settlement_date, provider_reference_id, user_id
    ) VALUES (
        p_provider, p_file_name, p_gross_amount, p_fees, p_net_amount,
        p_settlement_date, p_provider_reference_id, p_user_id
    ) RETURNING id INTO v_report_id;
    
    RETURN v_report_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Match Provider Report to Sale
CREATE OR REPLACE FUNCTION match_provider_to_sale(
    p_provider_report_id UUID,
    p_sale_id UUID,
    p_confidence DECIMAL(3,2),
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update provider report
    UPDATE provider_reports 
    SET 
        sale_id = p_sale_id,
        status = 'matched',
        match_confidence = p_confidence,
        matched_by = p_user_id,
        matched_at = NOW()
    WHERE id = p_provider_report_id;
    
    -- Update sale
    UPDATE sales 
    SET 
        provider_report_id = p_provider_report_id,
        banking_status = 'provider_matched'
    WHERE id = p_sale_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Match Bank Transaction to References
CREATE OR REPLACE FUNCTION match_bank_transaction(
    p_bank_transaction_id UUID,
    p_reference_type VARCHAR(20),
    p_reference_id UUID,
    p_matched_amount DECIMAL(10,2),
    p_confidence DECIMAL(3,2),
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Create transaction match
    INSERT INTO transaction_matches (
        bank_transaction_id, reference_type, reference_id,
        matched_amount, match_confidence, matched_by
    ) VALUES (
        p_bank_transaction_id, p_reference_type, p_reference_id,
        p_matched_amount, p_confidence, p_user_id
    );
    
    -- Update bank transaction status
    UPDATE bank_transactions 
    SET status = 'matched'
    WHERE id = p_bank_transaction_id;
    
    -- Update reference status based on type
    IF p_reference_type = 'sale' THEN
        UPDATE sales 
        SET 
            bank_transaction_id = p_bank_transaction_id,
            banking_status = CASE 
                WHEN provider_report_id IS NOT NULL THEN 'fully_reconciled'
                ELSE 'bank_matched'
            END
        WHERE id = p_reference_id;
    ELSIF p_reference_type = 'expense' THEN
        UPDATE expenses 
        SET 
            bank_transaction_id = p_bank_transaction_id,
            banking_status = 'reconciled'
        WHERE id = p_reference_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Banking Status Overview
CREATE OR REPLACE FUNCTION get_banking_status_overview(p_user_id UUID)
RETURNS TABLE (
    unmatched_sales INTEGER,
    unmatched_provider_reports INTEGER,
    unmatched_bank_transactions INTEGER,
    unmatched_expenses INTEGER,
    fully_reconciled_sales INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM sales 
         WHERE user_id = p_user_id AND banking_status = 'pending'),
        (SELECT COUNT(*)::INTEGER FROM provider_reports 
         WHERE user_id = p_user_id AND status = 'pending'),
        (SELECT COUNT(*)::INTEGER FROM bank_transactions 
         WHERE user_id = p_user_id AND status = 'unmatched'),
        (SELECT COUNT(*)::INTEGER FROM expenses 
         WHERE user_id = p_user_id AND banking_status = 'pending'),
        (SELECT COUNT(*)::INTEGER FROM sales 
         WHERE user_id = p_user_id AND banking_status = 'fully_reconciled');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE provider_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_matches ENABLE ROW LEVEL SECURITY;

-- Provider Reports Policies
CREATE POLICY "provider_reports_user_access" ON provider_reports
    FOR ALL USING (auth.uid() = user_id);

-- Bank Transactions Policies  
CREATE POLICY "bank_transactions_user_access" ON bank_transactions
    FOR ALL USING (auth.uid() = user_id);

-- Transaction Matches Policies
CREATE POLICY "transaction_matches_user_access" ON transaction_matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bank_transactions bt 
            WHERE bt.id = bank_transaction_id AND bt.user_id = auth.uid()
        )
    );

-- ============================================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE provider_reports IS 'Imported settlement reports from payment providers (TWINT, SumUp)';
COMMENT ON TABLE bank_transactions IS 'Imported bank account transactions (Raiffeisen, UBS, etc.)';
COMMENT ON TABLE transaction_matches IS 'Many-to-many mapping between bank transactions and business transactions';

COMMENT ON FUNCTION import_provider_report IS 'Import a provider settlement report record';
COMMENT ON FUNCTION match_provider_to_sale IS 'Match a provider report to a POS sale';
COMMENT ON FUNCTION match_bank_transaction IS 'Match a bank transaction to sales/expenses';
COMMENT ON FUNCTION get_banking_status_overview IS 'Get overview of unmatched items for dashboard';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Banking Module Foundation erfolgreich erstellt
-- Ready für Phase 2: Module Structure & Components