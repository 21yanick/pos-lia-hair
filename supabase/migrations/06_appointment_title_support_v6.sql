-- ========================================
-- Migration 06: Appointment Title Support (V6.1)
-- Add private appointment support without customer requirement
-- Created: 2025-10-12
-- Status: Production-Safe, Backwards Compatible
-- ========================================

-- Migration Purpose:
-- Enable creating appointments without customer (e.g., "Kids Kindergarten abholen")
-- Adds title field for private/blocker appointments
-- Maintains full backwards compatibility with existing 47 customer appointments

BEGIN;

-- ========================================
-- Step 1: Add title column
-- ========================================

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS title TEXT;

COMMENT ON COLUMN appointments.title IS
  'Optional title for private appointments without customer (e.g., "Kids Kindergarten abholen", "Arzttermin"). NULL for customer appointments.';

-- ========================================
-- Step 2: Add constraint (customer OR title required)
-- ========================================

-- Ensure at least one identifier exists: customer OR title
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'appointment_has_customer_or_title'
  ) THEN
    ALTER TABLE appointments
      ADD CONSTRAINT appointment_has_customer_or_title CHECK (
        customer_id IS NOT NULL
        OR customer_name IS NOT NULL
        OR title IS NOT NULL
      );

    RAISE NOTICE 'Constraint appointment_has_customer_or_title created successfully';
  ELSE
    RAISE NOTICE 'Constraint appointment_has_customer_or_title already exists';
  END IF;
END $$;

-- ========================================
-- Step 3: Add performance index for title queries
-- ========================================

CREATE INDEX IF NOT EXISTS idx_appointments_title
  ON appointments(title)
  WHERE title IS NOT NULL;

COMMENT ON INDEX idx_appointments_title IS
  'Partial index for querying private appointments by title';

-- ========================================
-- Step 4: Update appointments_with_services VIEW
-- Add title column to view for frontend compatibility
-- ========================================

-- Drop and recreate view (required when adding column in middle of select list)
DROP VIEW IF EXISTS appointments_with_services;

CREATE VIEW appointments_with_services AS
SELECT
  a.id,
  a.appointment_date,
  a.start_time,
  a.end_time,
  a.customer_id,
  a.customer_name,
  a.customer_phone,
  a.title,  -- ✅ NEW: Title field for private appointments
  a.notes,
  a.estimated_price,
  a.organization_id,
  a.created_at,
  a.created_by,
  a.updated_at,
  a.updated_by,

  -- Aggregated services data
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

-- Restore view permissions
GRANT SELECT ON appointments_with_services TO authenticated;
GRANT SELECT ON appointments_with_services TO service_role;

COMMENT ON VIEW appointments_with_services IS
  'V6.1 Enhanced: Appointments with aggregated services + title support for private appointments';

-- ========================================
-- Step 5: Validation
-- ========================================

DO $$
DECLARE
  v_appointment_count INTEGER;
  v_view_count INTEGER;
  v_title_column_exists BOOLEAN;
  v_constraint_exists BOOLEAN;
BEGIN
  -- Check appointment count
  SELECT COUNT(*) INTO v_appointment_count FROM appointments;
  SELECT COUNT(*) INTO v_view_count FROM appointments_with_services;

  -- Verify title column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'title'
  ) INTO v_title_column_exists;

  -- Verify constraint exists
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'appointment_has_customer_or_title'
  ) INTO v_constraint_exists;

  -- Validation checks
  IF v_appointment_count != v_view_count THEN
    RAISE EXCEPTION 'Migration validation failed: appointments count (%) != view count (%)',
      v_appointment_count, v_view_count;
  END IF;

  IF NOT v_title_column_exists THEN
    RAISE EXCEPTION 'Migration validation failed: title column not created';
  END IF;

  IF NOT v_constraint_exists THEN
    RAISE EXCEPTION 'Migration validation failed: constraint not created';
  END IF;

  RAISE NOTICE '✅ Migration 06 validation successful:';
  RAISE NOTICE '   - % appointments preserved', v_appointment_count;
  RAISE NOTICE '   - title column created';
  RAISE NOTICE '   - constraint applied';
  RAISE NOTICE '   - view updated with title support';
END $$;

COMMIT;

-- ========================================
-- Migration 06 Complete
-- ========================================

-- Success verification query
SELECT
  'Migration 06 Success' as status,
  COUNT(*) as total_appointments,
  COUNT(customer_id) as customer_appointments,
  COUNT(title) as private_appointments,
  (SELECT COUNT(*) FROM appointments_with_services) as view_count
FROM appointments;
