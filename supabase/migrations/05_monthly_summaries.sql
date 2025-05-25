-- ============================================================================
-- 05_MONTHLY_SUMMARIES: Monthly Reports Status-Management
-- Fügt monthly_summaries Tabelle hinzu analog zu daily_summaries
-- ============================================================================

-- ============================
-- 1. MONTHLY SUMMARIES TABELLE
-- ============================

-- Monatsabschlüsse (analog zu daily_summaries)
CREATE TABLE monthly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    
    -- Verkäufe nach Zahlungsart (zusammengefasst aus daily_summaries)
    sales_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_twint DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_sumup DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Ausgaben nach Zahlungsart (zusammengefasst aus expenses)
    expenses_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
    expenses_bank DECIMAL(10,2) NOT NULL DEFAULT 0,
    expenses_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Statistiken
    transaction_count INTEGER NOT NULL DEFAULT 0,
    avg_daily_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Status (analog zu daily_summaries)
    status TEXT NOT NULL CHECK (status IN ('draft', 'closed')) DEFAULT 'draft',
    notes TEXT,
    
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Unique constraint für Jahr/Monat
    UNIQUE (year, month)
);

-- ============================
-- 2. INDIZES
-- ============================

CREATE INDEX idx_monthly_summaries_year_month ON monthly_summaries(year, month);
CREATE INDEX idx_monthly_summaries_status ON monthly_summaries(status);

-- ============================
-- 3. ROW LEVEL SECURITY
-- ============================

ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Policy: Authentifizierte User haben vollen Zugriff
CREATE POLICY "monthly_summaries_all_access" ON monthly_summaries 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);

-- ============================
-- 4. HELPER FUNKTIONEN
-- ============================

-- Funktion: Automatische Berechnung des Monatsabschlusses
CREATE OR REPLACE FUNCTION calculate_monthly_summary(summary_year INTEGER, summary_month INTEGER)
RETURNS VOID AS $$
DECLARE
    v_sales_cash DECIMAL(10,2) := 0;
    v_sales_twint DECIMAL(10,2) := 0;
    v_sales_sumup DECIMAL(10,2) := 0;
    v_sales_total DECIMAL(10,2) := 0;
    v_expenses_cash DECIMAL(10,2) := 0;
    v_expenses_bank DECIMAL(10,2) := 0;
    v_expenses_total DECIMAL(10,2) := 0;
    v_transaction_count INTEGER := 0;
    v_avg_daily_revenue DECIMAL(10,2) := 0;
    v_days_in_month INTEGER;
    v_user_id UUID;
BEGIN
    -- Admin User ID holen
    SELECT id INTO v_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    -- Anzahl Tage im Monat berechnen
    SELECT EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(summary_year, summary_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER
    INTO v_days_in_month;
    
    -- Verkäufe für den Monat aus daily_summaries zusammenfassen
    SELECT 
        COALESCE(SUM(sales_cash), 0),
        COALESCE(SUM(sales_twint), 0),
        COALESCE(SUM(sales_sumup), 0),
        COALESCE(SUM(sales_total), 0)
    INTO v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total
    FROM daily_summaries 
    WHERE EXTRACT(YEAR FROM report_date) = summary_year 
    AND EXTRACT(MONTH FROM report_date) = summary_month;
    
    -- Ausgaben für den Monat aus expenses zusammenfassen
    SELECT 
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'bank' THEN amount END), 0),
        COALESCE(SUM(amount), 0)
    INTO v_expenses_cash, v_expenses_bank, v_expenses_total
    FROM expenses 
    WHERE EXTRACT(YEAR FROM payment_date) = summary_year 
    AND EXTRACT(MONTH FROM payment_date) = summary_month;
    
    -- Transaktionsanzahl für den Monat
    SELECT COALESCE(COUNT(*), 0)
    INTO v_transaction_count
    FROM sales 
    WHERE EXTRACT(YEAR FROM created_at) = summary_year 
    AND EXTRACT(MONTH FROM created_at) = summary_month
    AND status = 'completed';
    
    -- Durchschnittlicher Tagesumsatz
    IF v_days_in_month > 0 THEN
        v_avg_daily_revenue := v_sales_total / v_days_in_month;
    END IF;
    
    -- Monatsabschluss einfügen oder aktualisieren
    INSERT INTO monthly_summaries (
        year, month, 
        sales_cash, sales_twint, sales_sumup, sales_total,
        expenses_cash, expenses_bank, expenses_total,
        transaction_count, avg_daily_revenue,
        user_id
    ) VALUES (
        summary_year, summary_month,
        v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total,
        v_expenses_cash, v_expenses_bank, v_expenses_total,
        v_transaction_count, v_avg_daily_revenue,
        v_user_id
    )
    ON CONFLICT (year, month) 
    DO UPDATE SET
        sales_cash = EXCLUDED.sales_cash,
        sales_twint = EXCLUDED.sales_twint,
        sales_sumup = EXCLUDED.sales_sumup,
        sales_total = EXCLUDED.sales_total,
        expenses_cash = EXCLUDED.expenses_cash,
        expenses_bank = EXCLUDED.expenses_bank,
        expenses_total = EXCLUDED.expenses_total,
        transaction_count = EXCLUDED.transaction_count,
        avg_daily_revenue = EXCLUDED.avg_daily_revenue;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- 5. ERFOLGS-MELDUNG
-- ============================

DO $$
BEGIN
    RAISE NOTICE '🎯 MONTHLY SUMMARIES MIGRATION ERFOLGREICH!';
    RAISE NOTICE '✅ monthly_summaries Tabelle erstellt';
    RAISE NOTICE '✅ Indizes hinzugefügt';
    RAISE NOTICE '✅ RLS aktiviert';
    RAISE NOTICE '✅ Helper-Funktion calculate_monthly_summary() erstellt';
    RAISE NOTICE '🚀 Monthly Reports System bereit!';
END;
$$;