-- Phase 3: Appointment System - Database Schema
-- Simple, clean implementation following existing patterns
-- Created: 2024-12-29

-- ========================================
-- Appointments Table
-- ========================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timing & Duration (simple approach)
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Customer Relationship (reuse existing customers table)
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT, -- Fallback for walk-ins
    customer_phone TEXT, -- Quick contact for walk-ins
    
    -- Service Relationship (reuse existing items table from Phase 2)
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    
    -- Status & Workflow (simple states only)
    status TEXT NOT NULL DEFAULT 'scheduled' 
        CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    
    -- Additional Information
    notes TEXT,
    estimated_price DECIMAL(10,2),
    
    -- Multi-tenant Security (following existing patterns)
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Audit Trail (following existing patterns)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Business Rule Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_price_range CHECK (estimated_price IS NULL OR estimated_price >= 0)
);

-- ========================================
-- Performance Indexes
-- ========================================

-- Primary lookup patterns
CREATE INDEX idx_appointments_organization_date ON appointments(organization_id, appointment_date);
CREATE INDEX idx_appointments_customer ON appointments(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_appointments_item ON appointments(item_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_range ON appointments(appointment_date, start_time, end_time);

-- ========================================
-- Conflict Prevention
-- ========================================

-- Simple overlap prevention (no complex scheduling, just basic conflict check)
-- This prevents exact same time slots being double-booked
CREATE UNIQUE INDEX idx_appointments_no_overlap ON appointments(
    organization_id, 
    appointment_date, 
    start_time, 
    end_time
) WHERE status != 'cancelled';

-- ========================================
-- Row Level Security (RLS)
-- ========================================

-- Enable RLS following existing patterns
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Organization-based access control (following existing patterns)
CREATE POLICY "appointments_organization_policy" ON appointments
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );

-- ========================================
-- Updated At Trigger
-- ========================================

-- Auto-update updated_at timestamp (following existing patterns)
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointments_updated_at();

-- ========================================
-- Comments for Documentation
-- ========================================

COMMENT ON TABLE appointments IS 'Phase 3: Simple appointment booking system for single-user hair salon';
COMMENT ON COLUMN appointments.appointment_date IS 'Date of the appointment (DATE only, time stored separately)';
COMMENT ON COLUMN appointments.start_time IS 'Start time of appointment (TIME only, combined with date for full datetime)';
COMMENT ON COLUMN appointments.end_time IS 'End time of appointment (TIME only, combined with date for full datetime)';
COMMENT ON COLUMN appointments.customer_id IS 'Optional link to customers table, NULL for walk-ins';
COMMENT ON COLUMN appointments.customer_name IS 'Customer name for walk-ins or override';
COMMENT ON COLUMN appointments.item_id IS 'Service from items table (must have requires_booking=true)';
COMMENT ON COLUMN appointments.status IS 'Simple workflow: scheduled → completed or cancelled';
COMMENT ON COLUMN appointments.estimated_price IS 'Expected price, can differ from item default_price';

-- ========================================
-- Grant Permissions (following existing patterns)
-- ========================================

-- Grant access to authenticated users (RLS will handle organization filtering)
GRANT ALL ON appointments TO authenticated;
GRANT ALL ON appointments TO service_role;

-- ========================================
-- Validation Function for Business Rules
-- ========================================

-- Optional: Function to validate appointment against service booking rules
CREATE OR REPLACE FUNCTION validate_appointment_service(
    p_item_id UUID,
    p_organization_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_service_record RECORD;
BEGIN
    -- Get service details
    SELECT type, requires_booking, active 
    INTO v_service_record
    FROM items 
    WHERE id = p_item_id AND organization_id = p_organization_id;
    
    -- Check if service exists and is valid for booking
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service not found for this organization';
    END IF;
    
    IF v_service_record.type != 'service' THEN
        RAISE EXCEPTION 'Item must be a service to book appointments';
    END IF;
    
    IF NOT v_service_record.requires_booking THEN
        RAISE EXCEPTION 'This service does not allow bookings';
    END IF;
    
    IF NOT v_service_record.active THEN
        RAISE EXCEPTION 'Service is not active';
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Simple Conflict Check Function
-- ========================================

-- Function to check for appointment conflicts (simple approach)
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    p_organization_id UUID,
    p_appointment_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_appointment_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_conflict_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM appointments
    WHERE organization_id = p_organization_id
      AND appointment_date = p_appointment_date
      AND status != 'cancelled'
      AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id)
      AND (
          -- Time overlap check: (start1 < end2) AND (start2 < end1)
          (p_start_time < end_time) AND (start_time < p_end_time)
      );
    
    RETURN v_conflict_count = 0; -- TRUE if no conflicts
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Schema Migration Complete
-- ========================================

-- Insert migration record for tracking
INSERT INTO migrations_log (migration_name, applied_at) 
VALUES ('28_appointments_system', NOW())
ON CONFLICT (migration_name) DO NOTHING;