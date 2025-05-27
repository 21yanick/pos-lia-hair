-- ============================================================================
-- 06_MISSING_DAILY_CLOSURES: Daily/Monthly Closure Validation
-- Fügt Funktionen hinzu um fehlende Tagesabschlüsse zu identifizieren
-- ============================================================================

-- ============================
-- 1. MISSING DAILY CLOSURES DETECTION
-- ============================

-- Funktion: Findet Tage mit Verkäufen aber ohne geschlossene daily_summary
CREATE OR REPLACE FUNCTION find_missing_daily_closures(start_date DATE, end_date DATE)
RETURNS TABLE (
    missing_date DATE,
    sales_count INTEGER,
    sales_total DECIMAL(10,2),
    has_draft_summary BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH sales_days AS (
        -- Alle Tage mit Verkäufen im Zeitraum
        SELECT 
            DATE(created_at) as sale_date,
            COUNT(*)::INTEGER as sale_count,
            SUM(total_amount)::DECIMAL(10,2) as total_amount
        FROM sales 
        WHERE status = 'completed'
        AND DATE(created_at) BETWEEN start_date AND end_date
        GROUP BY DATE(created_at)
    ),
    closed_summaries AS (
        -- Alle geschlossenen daily_summaries im Zeitraum
        SELECT report_date
        FROM daily_summaries
        WHERE status = 'closed'
        AND report_date BETWEEN start_date AND end_date
    ),
    draft_summaries AS (
        -- Alle draft daily_summaries im Zeitraum
        SELECT report_date
        FROM daily_summaries
        WHERE status = 'draft'
        AND report_date BETWEEN start_date AND end_date
    )
    SELECT 
        sd.sale_date as missing_date,
        sd.sale_count as sales_count,
        sd.total_amount as sales_total,
        CASE WHEN ds.report_date IS NOT NULL THEN true ELSE false END as has_draft_summary
    FROM sales_days sd
    LEFT JOIN closed_summaries cs ON sd.sale_date = cs.report_date
    LEFT JOIN draft_summaries ds ON sd.sale_date = ds.report_date
    WHERE cs.report_date IS NULL  -- Keine geschlossene Summary vorhanden
    ORDER BY sd.sale_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- 2. MONTHLY CLOSURE PREREQUISITES
-- ============================

-- Funktion: Prüft ob alle Tagesabschlüsse für einen Monat vorhanden sind
CREATE OR REPLACE FUNCTION validate_monthly_closure_prerequisites(check_year INTEGER, check_month INTEGER)
RETURNS TABLE (
    is_valid BOOLEAN,
    missing_count INTEGER,
    missing_dates DATE[]
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_missing_dates DATE[];
    v_missing_count INTEGER;
BEGIN
    -- Monatsgrenzen berechnen
    v_start_date := DATE_TRUNC('month', MAKE_DATE(check_year, check_month, 1))::DATE;
    v_end_date := (DATE_TRUNC('month', MAKE_DATE(check_year, check_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- Fehlende Abschlüsse sammeln
    SELECT 
        ARRAY_AGG(missing_date ORDER BY missing_date),
        COUNT(*)::INTEGER
    INTO v_missing_dates, v_missing_count
    FROM find_missing_daily_closures(v_start_date, v_end_date);
    
    -- Ergebnis zurückgeben
    RETURN QUERY SELECT 
        (v_missing_count = 0) as is_valid,
        COALESCE(v_missing_count, 0) as missing_count,
        COALESCE(v_missing_dates, ARRAY[]::DATE[]) as missing_dates;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- 3. BULK CLOSURE HELPER
-- ============================

-- Funktion: Erstellt daily_summary für ein bestimmtes Datum (für Bulk Closure)
CREATE OR REPLACE FUNCTION create_daily_summary_for_date(
    target_date DATE,
    cash_starting DECIMAL(10,2) DEFAULT 0,
    cash_ending DECIMAL(10,2) DEFAULT 0,
    notes TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    summary_id UUID,
    error_message TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_summary_id UUID;
    v_cash_difference DECIMAL(10,2);
BEGIN
    -- Admin User ID holen
    SELECT id INTO v_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, 'Kein Admin-User gefunden'::TEXT;
        RETURN;
    END IF;
    
    -- Prüfen ob bereits eine Summary existiert
    SELECT id INTO v_summary_id
    FROM daily_summaries
    WHERE report_date = target_date;
    
    IF v_summary_id IS NOT NULL THEN
        -- Existierende Summary aktualisieren
        v_cash_difference := cash_ending - cash_starting;
        
        UPDATE daily_summaries
        SET 
            cash_starting = create_daily_summary_for_date.cash_starting,
            cash_ending = create_daily_summary_for_date.cash_ending,
            cash_difference = v_cash_difference,
            status = 'closed',
            notes = create_daily_summary_for_date.notes,
            closed_at = NOW(),
            user_id = v_user_id
        WHERE id = v_summary_id;
        
        RETURN QUERY SELECT true, v_summary_id, NULL::TEXT;
        RETURN;
    END IF;
    
    -- Automatische Berechnung ausführen
    PERFORM calculate_daily_summary(target_date);
    
    -- Summary ID nach Berechnung holen
    SELECT id INTO v_summary_id
    FROM daily_summaries
    WHERE report_date = target_date;
    
    IF v_summary_id IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, 'Daily Summary konnte nicht erstellt werden'::TEXT;
        RETURN;
    END IF;
    
    -- Bargeld-Werte und Status setzen
    v_cash_difference := cash_ending - cash_starting;
    
    UPDATE daily_summaries
    SET 
        cash_starting = create_daily_summary_for_date.cash_starting,
        cash_ending = create_daily_summary_for_date.cash_ending,
        cash_difference = v_cash_difference,
        status = 'closed',
        notes = create_daily_summary_for_date.notes,
        closed_at = NOW(),
        user_id = v_user_id
    WHERE id = v_summary_id;
    
    RETURN QUERY SELECT true, v_summary_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- 4. BULK CLOSURE MAIN FUNCTION
-- ============================

-- Funktion: Führt Bulk Closure für mehrere Tage durch
CREATE OR REPLACE FUNCTION bulk_close_daily_summaries(
    target_dates DATE[],
    default_cash_starting DECIMAL(10,2) DEFAULT 0,
    default_cash_ending DECIMAL(10,2) DEFAULT 0,
    default_notes TEXT DEFAULT 'Bulk Closure - automatisch geschlossen'
)
RETURNS TABLE (
    processed_date DATE,
    success BOOLEAN,
    summary_id UUID,
    error_message TEXT
) AS $$
DECLARE
    target_date DATE;
BEGIN
    -- Für jedes Datum in der Liste
    FOREACH target_date IN ARRAY target_dates
    LOOP
        -- Daily Summary erstellen/schließen
        RETURN QUERY
        SELECT 
            target_date,
            result.success,
            result.summary_id,
            result.error_message
        FROM create_daily_summary_for_date(
            target_date,
            default_cash_starting,
            default_cash_ending,
            default_notes
        ) AS result;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- 5. CONVENIENCE VIEWS
-- ============================

-- View: Schneller Überblick über fehlende Abschlüsse der letzten 30 Tage
CREATE OR REPLACE VIEW recent_missing_closures AS
SELECT 
    missing_date,
    sales_count,
    sales_total,
    has_draft_summary,
    CURRENT_DATE - missing_date as days_ago
FROM find_missing_daily_closures(
    CURRENT_DATE - INTERVAL '30 days', 
    CURRENT_DATE - INTERVAL '1 day'  -- Heute ausschließen
)
ORDER BY missing_date DESC;

-- ============================
-- 6. ERFOLGSMELDUNG
-- ============================

DO $$
BEGIN
    RAISE NOTICE '🎯 MISSING DAILY CLOSURES DETECTION ERFOLGREICH!';
    RAISE NOTICE '✅ find_missing_daily_closures() Funktion erstellt';
    RAISE NOTICE '✅ validate_monthly_closure_prerequisites() Funktion erstellt';
    RAISE NOTICE '✅ create_daily_summary_for_date() Funktion erstellt';
    RAISE NOTICE '✅ bulk_close_daily_summaries() Funktion erstellt';
    RAISE NOTICE '✅ recent_missing_closures View erstellt';
    RAISE NOTICE '🚀 Bereich 1.5 Backend bereit!';
END;
$$;