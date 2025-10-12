-- =====================================================
-- Provider Import Sessions Table
-- =====================================================
-- Purpose: Track TWINT/SumUp CSV import sessions for audit trail
-- Date: 2025-01-06

-- Create provider_import_sessions table
CREATE TABLE IF NOT EXISTS provider_import_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Provider identification
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('twint', 'sumup')),
  filename VARCHAR(255) NOT NULL,
  import_type VARCHAR(20) NOT NULL DEFAULT 'csv',
  
  -- Import statistics
  total_records INTEGER NOT NULL DEFAULT 0,
  new_records INTEGER NOT NULL DEFAULT 0,
  duplicate_records INTEGER NOT NULL DEFAULT 0,
  error_records INTEGER NOT NULL DEFAULT 0,
  
  -- Date range of imported data
  date_range_from DATE,
  date_range_to DATE,
  
  -- Session status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- User tracking
  imported_by UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Additional metadata
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_provider_import_sessions_provider ON provider_import_sessions(provider);
CREATE INDEX idx_provider_import_sessions_status ON provider_import_sessions(status);
CREATE INDEX idx_provider_import_sessions_user ON provider_import_sessions(imported_by);
CREATE INDEX idx_provider_import_sessions_filename ON provider_import_sessions(filename);
CREATE INDEX idx_provider_import_sessions_created_at ON provider_import_sessions(created_at DESC);

-- RLS Policies
ALTER TABLE provider_import_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own import sessions
CREATE POLICY "Users can view own import sessions" ON provider_import_sessions
  FOR SELECT USING (auth.uid() = imported_by);

-- Policy: Users can create import sessions
CREATE POLICY "Users can create import sessions" ON provider_import_sessions
  FOR INSERT WITH CHECK (auth.uid() = imported_by);

-- Policy: Users can update their own import sessions
CREATE POLICY "Users can update own import sessions" ON provider_import_sessions
  FOR UPDATE USING (auth.uid() = imported_by);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON provider_import_sessions TO authenticated;
GRANT USAGE ON SEQUENCE provider_import_sessions_id_seq TO authenticated;