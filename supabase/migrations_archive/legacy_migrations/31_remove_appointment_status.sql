-- Migration: Remove Appointment Status System
-- Ultra-clean approach: Appointment exists = scheduled, deleted = cancelled
-- Created: 2025-01-07

-- ========================================
-- Remove Status Column & Constraints
-- ========================================

-- Drop the check constraint first
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Remove the status column completely
ALTER TABLE appointments DROP COLUMN IF EXISTS status;

-- ========================================
-- Comments for Documentation
-- ========================================

COMMENT ON TABLE appointments IS 'Ultra-clean appointment system: appointment exists = scheduled, deleted = cancelled';

-- ========================================
-- Migration Log
-- ========================================

-- Insert migration record for tracking
INSERT INTO migrations_log (migration_name, applied_at) 
VALUES ('31_remove_appointment_status', NOW())
ON CONFLICT (migration_name) DO NOTHING;

-- ========================================
-- Verification Queries (for manual testing)
-- ========================================

-- Verify status column is removed
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'appointments' AND column_name = 'status';
-- (Should return no rows)

-- Verify constraints are removed  
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'appointments' AND constraint_name LIKE '%status%';
-- (Should return no rows)