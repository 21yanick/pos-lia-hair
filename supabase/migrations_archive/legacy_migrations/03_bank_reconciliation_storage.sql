-- ============================================================================
-- BANK RECONCILIATION PERSISTENT STORAGE
-- Speicherung der Bank Reconciliation Ergebnisse für jeden Monat
-- ============================================================================

-- Bank Reconciliation Tabelle für persistente Speicherung
CREATE TABLE IF NOT EXISTS bank_reconciliation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    
    -- Bank Statement Details
    bank_statement_filename TEXT,
    bank_entries_count INTEGER NOT NULL DEFAULT 0,
    bank_entries_total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Reconciliation Results
    matched_entries_count INTEGER NOT NULL DEFAULT 0,
    unmatched_entries_count INTEGER NOT NULL DEFAULT 0,
    reconciliation_confidence DECIMAL(5,2) NOT NULL DEFAULT 0, -- Average confidence
    
    -- Status and Metadata
    status TEXT NOT NULL CHECK (status IN ('draft', 'completed')) DEFAULT 'draft',
    completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Individual Match Results (JSON storage)
    matches_data JSONB, -- Stores all matches with confidence scores
    
    -- Audit Trail
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Unique constraint: One reconciliation per month
    UNIQUE(year, month)
);

-- Bank Reconciliation Individual Matches (detailed storage)
CREATE TABLE IF NOT EXISTS bank_reconciliation_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES bank_reconciliation_sessions(id) ON DELETE CASCADE,
    
    -- Bank Entry Details
    bank_entry_date DATE NOT NULL,
    bank_entry_amount DECIMAL(10,2) NOT NULL,
    bank_entry_direction TEXT NOT NULL CHECK (bank_entry_direction IN ('credit', 'debit')),
    bank_entry_description TEXT,
    bank_entry_reference TEXT,
    
    -- Match Details
    match_type TEXT NOT NULL CHECK (match_type IN ('settlement_verification', 'expense_reconciliation', 'unmatched')),
    match_confidence DECIMAL(5,2) NOT NULL DEFAULT 0,
    match_variance DECIMAL(10,2),
    
    -- Matched Transaction References
    matched_sales_ids JSONB, -- Array of sales IDs for batch matches
    matched_expense_id UUID, -- Single expense ID
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewer_notes TEXT,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bank_reconciliation_sessions_month ON bank_reconciliation_sessions(year, month);
CREATE INDEX IF NOT EXISTS idx_bank_reconciliation_matches_session ON bank_reconciliation_matches(session_id);
CREATE INDEX IF NOT EXISTS idx_bank_reconciliation_matches_status ON bank_reconciliation_matches(status);

-- ============================================================================
-- FUNCTIONS FOR BANK RECONCILIATION MANAGEMENT
-- ============================================================================

-- Create or update bank reconciliation session
CREATE OR REPLACE FUNCTION create_bank_reconciliation_session(
    p_year INTEGER,
    p_month INTEGER,
    p_bank_statement_filename TEXT,
    p_bank_entries_count INTEGER,
    p_bank_entries_total_amount DECIMAL(10,2),
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- Insert or update session
    INSERT INTO bank_reconciliation_sessions (
        year, month, bank_statement_filename, bank_entries_count, 
        bank_entries_total_amount, created_by
    ) VALUES (
        p_year, p_month, p_bank_statement_filename, p_bank_entries_count,
        p_bank_entries_total_amount, p_user_id
    )
    ON CONFLICT (year, month) 
    DO UPDATE SET
        bank_statement_filename = EXCLUDED.bank_statement_filename,
        bank_entries_count = EXCLUDED.bank_entries_count,
        bank_entries_total_amount = EXCLUDED.bank_entries_total_amount,
        created_at = NOW() -- Reset timestamp for re-import
    RETURNING id INTO v_session_id;
    
    -- Clear old matches for this session
    DELETE FROM bank_reconciliation_matches WHERE session_id = v_session_id;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Complete bank reconciliation session
CREATE OR REPLACE FUNCTION complete_bank_reconciliation_session(
    p_session_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_matched_count INTEGER;
    v_total_count INTEGER;
    v_completion_percentage DECIMAL(5,2);
BEGIN
    -- Calculate completion stats
    SELECT 
        COUNT(*) FILTER (WHERE status = 'approved'),
        COUNT(*),
        CASE WHEN COUNT(*) > 0 THEN 
            (COUNT(*) FILTER (WHERE status = 'approved') * 100.0 / COUNT(*))
        ELSE 0 END
    INTO v_matched_count, v_total_count, v_completion_percentage
    FROM bank_reconciliation_matches 
    WHERE session_id = p_session_id;
    
    -- Update session
    UPDATE bank_reconciliation_sessions 
    SET 
        status = 'completed',
        matched_entries_count = v_matched_count,
        unmatched_entries_count = v_total_count - v_matched_count,
        completion_percentage = v_completion_percentage,
        completed_at = NOW()
    WHERE id = p_session_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Check if bank reconciliation is completed for a month
CREATE OR REPLACE FUNCTION check_bank_reconciliation_completion(
    p_year INTEGER,
    p_month INTEGER
)
RETURNS TABLE (
    is_completed BOOLEAN,
    session_id UUID,
    matched_entries INTEGER,
    total_entries INTEGER,
    completion_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (brs.status = 'completed') as is_completed,
        brs.id as session_id,
        brs.matched_entries_count as matched_entries,
        brs.bank_entries_count as total_entries,
        brs.completion_percentage
    FROM bank_reconciliation_sessions brs
    WHERE brs.year = p_year AND brs.month = p_month;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE bank_reconciliation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliation_matches ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their reconciliations
CREATE POLICY "bank_reconciliation_sessions_access" ON bank_reconciliation_sessions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "bank_reconciliation_matches_access" ON bank_reconciliation_matches
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- SAMPLE DATA / TESTING
-- ============================================================================

-- The tables are now ready to store bank reconciliation results persistently
-- Each month's bank reconciliation will be saved and can be retrieved
-- This prevents re-processing and maintains audit trail