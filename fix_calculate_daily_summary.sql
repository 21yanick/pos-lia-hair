-- Verbesserte calculate_daily_summary Funktion mit korrekter Zeitzone-Behandlung
CREATE OR REPLACE FUNCTION calculate_daily_summary(summary_date DATE)
RETURNS VOID AS $$
DECLARE
    v_sales_cash DECIMAL(10,2) := 0;
    v_sales_twint DECIMAL(10,2) := 0;
    v_sales_sumup DECIMAL(10,2) := 0;
    v_sales_total DECIMAL(10,2) := 0;
    v_expenses_cash DECIMAL(10,2) := 0;
    v_expenses_bank DECIMAL(10,2) := 0;
    v_expenses_total DECIMAL(10,2) := 0;
    v_user_id UUID;
    v_start_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
BEGIN
    -- Admin User ID holen
    SELECT id INTO v_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    -- Schweizer Zeitzone: Start und Ende des Tages in UTC konvertieren
    -- summary_date ist bereits ein Schweizer Datum (YYYY-MM-DD)
    v_start_time := (summary_date || ' 00:00:00')::timestamp AT TIME ZONE 'Europe/Zurich';
    v_end_time := (summary_date || ' 23:59:59.999')::timestamp AT TIME ZONE 'Europe/Zurich';
    
    RAISE NOTICE 'Berechne Tagesabschluss für Schweizer Datum: % (UTC: % bis %)', summary_date, v_start_time, v_end_time;
    
    -- Verkäufe nach Zahlungsart berechnen (mit korrekter Zeitzone)
    SELECT 
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'twint' THEN total_amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'sumup' THEN total_amount END), 0),
        COALESCE(SUM(total_amount), 0)
    INTO v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total
    FROM sales 
    WHERE created_at >= v_start_time 
    AND created_at <= v_end_time
    AND status = 'completed';
    
    RAISE NOTICE 'Verkäufe: Cash=%, TWINT=%, SumUp=%, Total=%', v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total;
    
    -- Ausgaben nach Zahlungsart berechnen (Datum-basiert, da payment_date bereits lokales Datum ist)
    SELECT 
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'bank' THEN amount END), 0),
        COALESCE(SUM(amount), 0)
    INTO v_expenses_cash, v_expenses_bank, v_expenses_total
    FROM expenses 
    WHERE payment_date = summary_date;
    
    RAISE NOTICE 'Ausgaben: Cash=%, Bank=%, Total=%', v_expenses_cash, v_expenses_bank, v_expenses_total;
    
    -- Tagesabschluss einfügen oder aktualisieren
    INSERT INTO daily_summaries (
        report_date, sales_cash, sales_twint, sales_sumup, sales_total,
        expenses_cash, expenses_bank, expenses_total,
        user_id
    ) VALUES (
        summary_date, v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total,
        v_expenses_cash, v_expenses_bank, v_expenses_total,
        v_user_id
    )
    ON CONFLICT (report_date) 
    DO UPDATE SET
        sales_cash = EXCLUDED.sales_cash,
        sales_twint = EXCLUDED.sales_twint,
        sales_sumup = EXCLUDED.sales_sumup,
        sales_total = EXCLUDED.sales_total,
        expenses_cash = EXCLUDED.expenses_cash,
        expenses_bank = EXCLUDED.expenses_bank,
        expenses_total = EXCLUDED.expenses_total;
        
    RAISE NOTICE 'Tagesabschluss für % erfolgreich berechnet und gespeichert', summary_date;
END;
$$ LANGUAGE plpgsql;