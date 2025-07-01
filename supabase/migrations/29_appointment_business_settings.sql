-- Appointment Business Settings Extension
-- Extends existing business_settings table with appointment-specific configuration
-- Created: 2025-01-07

-- ========================================
-- Add Appointment-Specific Settings to business_settings
-- ========================================

-- Working Hours Configuration (JSONB for flexibility)
ALTER TABLE business_settings 
ADD COLUMN working_hours JSONB NOT NULL DEFAULT '{
  "monday": {"start": "09:00", "end": "18:00", "closed": false, "breaks": [{"start": "12:00", "end": "13:00"}]},
  "tuesday": {"start": "09:00", "end": "18:00", "closed": false, "breaks": []},
  "wednesday": {"start": "09:00", "end": "18:00", "closed": false, "breaks": []},
  "thursday": {"start": "09:00", "end": "18:00", "closed": false, "breaks": []},
  "friday": {"start": "09:00", "end": "18:00", "closed": false, "breaks": []},
  "saturday": {"start": "09:00", "end": "16:00", "closed": false, "breaks": []},
  "sunday": {"start": "10:00", "end": "16:00", "closed": true, "breaks": []}
}';

-- Booking Rules Configuration
ALTER TABLE business_settings 
ADD COLUMN booking_rules JSONB NOT NULL DEFAULT '{
  "slotInterval": 15,
  "defaultDuration": 60,
  "maxAdvanceDays": 90,
  "minAdvanceHours": 2,
  "bufferMinutes": 5,
  "autoConfirm": true
}';

-- Display Preferences for Calendar/Timeline
ALTER TABLE business_settings 
ADD COLUMN display_preferences JSONB NOT NULL DEFAULT '{
  "timelineStart": "08:00",
  "timelineEnd": "19:00",
  "showWeekends": true,
  "showClosedDays": false
}';

-- Vacation Periods (Multi-day support)
ALTER TABLE business_settings 
ADD COLUMN vacation_periods JSONB NOT NULL DEFAULT '[]';

-- ========================================
-- Helper Functions for Appointment Settings
-- ========================================

-- Function to get organization working hours for a specific day
CREATE OR REPLACE FUNCTION get_working_hours(
    p_organization_id UUID,
    p_weekday TEXT  -- 'monday', 'tuesday', etc.
) RETURNS JSONB AS $$
DECLARE
    v_working_hours JSONB;
BEGIN
    SELECT working_hours->p_weekday
    INTO v_working_hours
    FROM business_settings
    WHERE organization_id = p_organization_id;
    
    IF v_working_hours IS NULL THEN
        -- Return default if not found
        RETURN '{"start": "09:00", "end": "18:00", "closed": false, "breaks": []}'::JSONB;
    END IF;
    
    RETURN v_working_hours;
END;
$$ LANGUAGE plpgsql;

-- Function to check if organization is open on a specific date/time
CREATE OR REPLACE FUNCTION is_organization_open(
    p_organization_id UUID,
    p_date DATE,
    p_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
    v_weekday TEXT;
    v_day_hours JSONB;
    v_vacation_periods JSONB;
    v_vacation JSONB;
    v_break JSONB;
BEGIN
    -- Get weekday name
    v_weekday := LOWER(TO_CHAR(p_date, 'Day'));
    v_weekday := TRIM(v_weekday);
    
    -- Get working hours and vacation periods
    SELECT working_hours->v_weekday, vacation_periods
    INTO v_day_hours, v_vacation_periods
    FROM business_settings
    WHERE organization_id = p_organization_id;
    
    -- Check if day is closed
    IF (v_day_hours->>'closed')::BOOLEAN = true THEN
        RETURN false;
    END IF;
    
    -- Check if outside working hours
    IF p_time < (v_day_hours->>'start')::TIME OR p_time >= (v_day_hours->>'end')::TIME THEN
        RETURN false;
    END IF;
    
    -- Check vacation periods
    FOR v_vacation IN SELECT * FROM jsonb_array_elements(v_vacation_periods)
    LOOP
        IF p_date >= (v_vacation->>'start')::DATE AND p_date <= (v_vacation->>'end')::DATE THEN
            RETURN false;
        END IF;
    END LOOP;
    
    -- Check break times
    FOR v_break IN SELECT * FROM jsonb_array_elements(v_day_hours->'breaks')
    LOOP
        IF p_time >= (v_break->>'start')::TIME AND p_time < (v_break->>'end')::TIME THEN
            RETURN false;
        END IF;
    END LOOP;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get organization booking rules
CREATE OR REPLACE FUNCTION get_booking_rules(
    p_organization_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_booking_rules JSONB;
BEGIN
    SELECT booking_rules
    INTO v_booking_rules
    FROM business_settings
    WHERE organization_id = p_organization_id;
    
    IF v_booking_rules IS NULL THEN
        -- Return defaults if not found
        RETURN '{
            "slotInterval": 15,
            "defaultDuration": 60,
            "maxAdvanceDays": 90,
            "minAdvanceHours": 2,
            "bufferMinutes": 5,
            "autoConfirm": true
        }'::JSONB;
    END IF;
    
    RETURN v_booking_rules;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Validation Functions
-- ========================================

-- Function to validate working hours JSON structure
CREATE OR REPLACE FUNCTION validate_working_hours(working_hours_json JSONB) 
RETURNS BOOLEAN AS $$
DECLARE
    required_days TEXT[] := ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    day TEXT;
    day_config JSONB;
BEGIN
    -- Check all required days are present
    FOREACH day IN ARRAY required_days
    LOOP
        IF NOT (working_hours_json ? day) THEN
            RAISE EXCEPTION 'Missing required day: %', day;
        END IF;
        
        day_config := working_hours_json->day;
        
        -- Validate required fields for each day
        IF NOT (day_config ? 'start' AND day_config ? 'end' AND day_config ? 'closed' AND day_config ? 'breaks') THEN
            RAISE EXCEPTION 'Day % missing required fields (start, end, closed, breaks)', day;
        END IF;
        
        -- Validate time format (basic check)
        IF NOT (day_config->>'closed')::BOOLEAN THEN
            -- Only validate times if not closed
            IF (day_config->>'start')::TIME >= (day_config->>'end')::TIME THEN
                RAISE EXCEPTION 'Day % start time must be before end time', day;
            END IF;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Add Constraints for Data Validation
-- ========================================

-- Add constraint to validate working_hours structure
ALTER TABLE business_settings 
ADD CONSTRAINT valid_working_hours_structure 
CHECK (validate_working_hours(working_hours));

-- Add constraint to validate booking rules
ALTER TABLE business_settings 
ADD CONSTRAINT valid_booking_rules_structure 
CHECK (
    (booking_rules ? 'slotInterval') AND
    (booking_rules ? 'defaultDuration') AND
    (booking_rules ? 'maxAdvanceDays') AND
    (booking_rules ? 'minAdvanceHours') AND
    (booking_rules ? 'bufferMinutes') AND
    (booking_rules ? 'autoConfirm')
);

-- ========================================
-- Comments for Documentation
-- ========================================

COMMENT ON COLUMN business_settings.working_hours IS 'Weekly working hours configuration with breaks per day (JSONB)';
COMMENT ON COLUMN business_settings.booking_rules IS 'Appointment booking rules and constraints (JSONB)';
COMMENT ON COLUMN business_settings.display_preferences IS 'Calendar and timeline display preferences (JSONB)';
COMMENT ON COLUMN business_settings.vacation_periods IS 'Multi-day vacation/closure periods (JSONB array)';

-- ========================================
-- Update Existing Organizations with Default Settings
-- ========================================

-- Ensure all existing organizations have appointment settings
-- (The default values will be applied automatically due to NOT NULL DEFAULT)

-- ========================================
-- Grant Permissions
-- ========================================

-- Grant access to the new functions
GRANT EXECUTE ON FUNCTION get_working_hours(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_organization_open(UUID, DATE, TIME) TO authenticated;
GRANT EXECUTE ON FUNCTION get_booking_rules(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_working_hours(JSONB) TO authenticated;

-- Service role needs all access
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ========================================
-- Sample Data Examples (for documentation)
-- ========================================

/*
-- Example working_hours JSON:
{
  "monday": {
    "start": "09:00",
    "end": "18:00", 
    "closed": false,
    "breaks": [
      {"start": "12:00", "end": "13:00"}
    ]
  },
  "tuesday": {
    "start": "09:00",
    "end": "18:00",
    "closed": false,
    "breaks": []
  }
  // ... other days
}

-- Example vacation_periods JSON:
[
  {
    "start": "2024-07-15",
    "end": "2024-07-29", 
    "reason": "Sommerurlaub"
  },
  {
    "start": "2024-12-24",
    "end": "2024-12-26",
    "reason": "Weihnachten"
  }
]

-- Example booking_rules JSON:
{
  "slotInterval": 15,        // 15-minute booking grid
  "defaultDuration": 60,     // 60-minute default appointment
  "maxAdvanceDays": 90,      // Can book up to 90 days ahead
  "minAdvanceHours": 2,      // Must book at least 2 hours in advance
  "bufferMinutes": 5,        // 5 minutes between appointments
  "autoConfirm": true        // Automatically confirm bookings
}
*/

-- ========================================
-- Migration Complete
-- ========================================

-- Update migration log
INSERT INTO migrations_log (migration_name, applied_at) 
VALUES ('29_appointment_business_settings', NOW())
ON CONFLICT (migration_name) DO NOTHING;