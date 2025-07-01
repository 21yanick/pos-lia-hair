-- Migration: Enable Multiple Services per Appointment
-- Convert 1:1 to 1:Many relationship via junction table
-- Created: 2025-01-07

-- ========================================
-- Step 1: Create Junction Table
-- ========================================

CREATE TABLE appointment_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    
    -- Service-specific details for this appointment
    service_price DECIMAL(10,2), -- Can override default item price
    service_duration_minutes INTEGER, -- Can override default duration
    service_notes TEXT, -- Service-specific notes
    
    -- Ordering within appointment
    sort_order INTEGER DEFAULT 1,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(appointment_id, item_id), -- Prevent duplicate services
    CONSTRAINT valid_service_price CHECK (service_price IS NULL OR service_price >= 0),
    CONSTRAINT valid_service_duration CHECK (service_duration_minutes IS NULL OR service_duration_minutes > 0)
);

-- ========================================
-- Step 2: Migrate Existing Data
-- ========================================

-- Copy existing item_id relationships to junction table
INSERT INTO appointment_services (appointment_id, item_id, service_price, sort_order)
SELECT 
    id as appointment_id,
    item_id,
    estimated_price as service_price,
    1 as sort_order
FROM appointments 
WHERE item_id IS NOT NULL;

-- ========================================
-- Step 3: Remove Old Column (after data migration)
-- ========================================

-- Remove the direct item_id foreign key
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_item_id_fkey;
ALTER TABLE appointments DROP COLUMN IF EXISTS item_id;

-- ========================================
-- Step 4: Indexes for Performance
-- ========================================

CREATE INDEX idx_appointment_services_appointment ON appointment_services(appointment_id);
CREATE INDEX idx_appointment_services_item ON appointment_services(item_id);
CREATE INDEX idx_appointment_services_sort ON appointment_services(appointment_id, sort_order);

-- ========================================
-- Step 5: RLS Policies
-- ========================================

-- Enable RLS
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access services for appointments in their organization
CREATE POLICY "appointment_services_organization_access" ON appointment_services
    FOR ALL USING (
        appointment_id IN (
            SELECT id FROM appointments 
            WHERE organization_id IN (
                SELECT organization_id FROM organization_users 
                WHERE user_id = auth.uid() AND active = true
            )
        )
    );

-- ========================================
-- Step 6: Update Functions & Triggers
-- ========================================

-- Update appointment updated_at when services change
CREATE OR REPLACE FUNCTION update_appointment_on_service_change()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE appointments 
    SET updated_at = NOW() 
    WHERE id = COALESCE(NEW.appointment_id, OLD.appointment_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_services_update_parent
    AFTER INSERT OR UPDATE OR DELETE ON appointment_services
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_on_service_change();

-- ========================================
-- Step 7: Helper Views (Optional)
-- ========================================

-- View for easier querying of appointments with services
CREATE OR REPLACE VIEW appointments_with_services AS
SELECT 
    a.*,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', i.id,
                'name', i.name,
                'price', COALESCE(aps.service_price, i.default_price),
                'duration_minutes', COALESCE(aps.service_duration_minutes, i.duration_minutes),
                'notes', aps.service_notes,
                'sort_order', aps.sort_order
            )
            ORDER BY aps.sort_order
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
    ) as services,
    
    -- Calculated totals
    COALESCE(SUM(COALESCE(aps.service_price, i.default_price)), 0) as total_price,
    COALESCE(SUM(COALESCE(aps.service_duration_minutes, i.duration_minutes)), 0) as total_duration_minutes
    
FROM appointments a
LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
LEFT JOIN items i ON aps.item_id = i.id
GROUP BY a.id;

-- ========================================
-- Comments
-- ========================================

COMMENT ON TABLE appointment_services IS 'Junction table for many-to-many relationship between appointments and services (items)';
COMMENT ON COLUMN appointment_services.service_price IS 'Price override for this service in this appointment';
COMMENT ON COLUMN appointment_services.service_duration_minutes IS 'Duration override for this service in this appointment';
COMMENT ON VIEW appointments_with_services IS 'Convenient view showing appointments with aggregated services data';