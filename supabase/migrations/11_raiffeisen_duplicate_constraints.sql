-- =====================================================
-- 11 Raiffeisen Duplicate Constraints - CAMT.053 Import Protection
-- =====================================================
-- Date: 2025-01-06
-- Purpose: Add duplicate prevention for Raiffeisen bank import
-- Prevents: Same AcctSvcrRef being imported twice per account

-- =====================================================
-- 1. ADD UNIQUE CONSTRAINT FOR BANK REFERENCES
-- =====================================================

-- Prevent duplicate AcctSvcrRef per bank account
-- AcctSvcrRef is bank's unique reference (e.g. 17770794885)
ALTER TABLE bank_transactions 
ADD CONSTRAINT unique_bank_reference_per_account 
UNIQUE (bank_account_id, reference);

-- =====================================================
-- 2. PERFORMANCE INDEXES FOR IMPORT OPERATIONS
-- =====================================================

-- Index for fast reference lookups during duplicate checking
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reference 
ON bank_transactions(reference);

-- Index for file import tracking and duplicate file detection
CREATE INDEX IF NOT EXISTS idx_bank_transactions_import_filename 
ON bank_transactions(import_filename);

-- Index for booking date range queries (import period overlap detection)
CREATE INDEX IF NOT EXISTS idx_bank_transactions_booking_date 
ON bank_transactions(booking_date);

-- Composite index for import status and date filtering
CREATE INDEX IF NOT EXISTS idx_bank_transactions_status_date 
ON bank_transactions(status, transaction_date);

-- =====================================================
-- 3. HELPER FUNCTIONS FOR IMPORT VALIDATION
-- =====================================================

-- Function to check if a file was already imported
CREATE OR REPLACE FUNCTION check_file_already_imported(
    p_filename VARCHAR(255),
    p_bank_account_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM bank_transactions 
        WHERE import_filename = p_filename 
        AND bank_account_id = p_bank_account_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check for duplicate references in batch
CREATE OR REPLACE FUNCTION check_duplicate_references(
    p_references TEXT[],
    p_bank_account_id UUID
) RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT reference 
        FROM bank_transactions 
        WHERE reference = ANY(p_references) 
        AND bank_account_id = p_bank_account_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check period overlap for import
CREATE OR REPLACE FUNCTION check_period_overlap(
    p_from_date DATE,
    p_to_date DATE,
    p_bank_account_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM bank_transactions 
        WHERE bank_account_id = p_bank_account_id
        AND transaction_date BETWEEN p_from_date AND p_to_date
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. IMPORT METADATA TRACKING
-- =====================================================

-- Table to track import sessions and statistics
CREATE TABLE IF NOT EXISTS bank_import_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID REFERENCES bank_accounts(id) NOT NULL,
    import_filename VARCHAR(255) NOT NULL,
    import_type VARCHAR(20) DEFAULT 'camt053' CHECK (import_type IN ('camt053', 'csv')),
    
    -- Import statistics
    total_entries INTEGER NOT NULL,
    new_entries INTEGER NOT NULL,
    duplicate_entries INTEGER NOT NULL,
    error_entries INTEGER NOT NULL,
    
    -- Time period covered
    statement_from_date DATE,
    statement_to_date DATE,
    
    -- Import status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    
    -- Audit
    imported_by UUID REFERENCES auth.users(id),
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Indexes for import sessions
CREATE INDEX idx_bank_import_sessions_account ON bank_import_sessions(bank_account_id);
CREATE INDEX idx_bank_import_sessions_filename ON bank_import_sessions(import_filename);
CREATE INDEX idx_bank_import_sessions_date ON bank_import_sessions(imported_at);

-- RLS for import sessions
ALTER TABLE bank_import_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bank_import_sessions_access" ON bank_import_sessions
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM bank_accounts ba 
            WHERE ba.id = bank_account_id AND ba.user_id = auth.uid()
        )
    );

-- =====================================================
-- 5. VALIDATION COMMENTS
-- =====================================================

-- Add helpful comments to the reference column
COMMENT ON COLUMN bank_transactions.reference IS 'Bank unique reference (AcctSvcrRef in CAMT.053) - used for duplicate prevention';
COMMENT ON CONSTRAINT unique_bank_reference_per_account ON bank_transactions IS 'Prevents importing same bank transaction twice per account';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary:
-- ✅ Unique constraint on (bank_account_id, reference) prevents AcctSvcrRef duplicates
-- ✅ Performance indexes for fast import operations
-- ✅ Helper functions for duplicate checking
-- ✅ Import session tracking for audit trail
-- ✅ RLS policies for security

-- Next Steps:
-- 1. Test constraint with sample data
-- 2. Implement CAMT.053 XML parser
-- 3. Build import UI with duplicate preview
-- 4. Test with real Raiffeisen XML files