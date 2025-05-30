-- ============================================================================
-- GESCHÄFTSERÖFFNUNG SEPTEMBER 2024 - ANFANGSBESTÄNDE
-- Script für Erstimport nach Datenbank-Reset
-- ============================================================================

-- Geschäftseröffnung: 1. September 2024
-- Anfangsbestände werden als spezielle "Eröffnungs-Transaktionen" erfasst

-- ============================================================================
-- 1. NEGATIVE EXPENSES = ANFANGSBESTÄNDE (Buchhalterische Korrektheit)
-- ============================================================================

-- Cash Anfangsbestand (z.B. CHF 500 in der Kasse)
INSERT INTO expenses (
    description,
    amount,
    category,
    payment_method,
    receipt_date,
    created_by,
    notes,
    created_at
) VALUES (
    'Geschäftseröffnung - Anfangsbestand Cash',
    -500.00,  -- NEGATIV = Zugang/Einnahme
    'opening_balance',
    'cash',
    '2024-09-01',
    '00000000-0000-0000-0000-000000000000',
    'Anfangsbestand Kasse bei Geschäftseröffnung - Salon Lia Hair',
    '2024-09-01 08:00:00+00'
);

-- Bank Anfangsbestand (z.B. CHF 2,000 auf Geschäftskonto)
INSERT INTO expenses (
    description,
    amount,
    category,
    payment_method,
    receipt_date,
    created_by,
    notes,
    created_at
) VALUES (
    'Geschäftseröffnung - Anfangsbestand Bank',
    -2000.00,  -- NEGATIV = Zugang/Einnahme
    'opening_balance',
    'bank',
    '2024-09-01',
    '00000000-0000-0000-0000-000000000000',
    'Anfangsbestand Geschäftskonto bei Geschäftseröffnung - Raiffeisen',
    '2024-09-01 08:00:00+00'
);

-- ============================================================================
-- 2. SEPTEMBER 2024 DAILY SUMMARY (Geschäftseröffnung)
-- ============================================================================

INSERT INTO daily_summaries (
    report_date,
    cash_starting,
    cash_ending,
    sales_cash,
    sales_twint,
    sales_sumup,
    sales_total,
    expenses_cash,
    expenses_bank,
    expenses_total,
    cash_difference,
    status,
    notes,
    created_by,
    created_at,
    closed_at
) VALUES (
    '2024-09-01',
    500.00,    -- Anfangsbestand Cash (aus obiger Eröffnungs-Transaktion)
    500.00,    -- Gleichbleibend (noch keine Verkäufe/Ausgaben)
    0.00,      -- Noch keine Cash-Verkäufe
    0.00,      -- Noch keine TWINT-Verkäufe
    0.00,      -- Noch keine SumUp-Verkäufe
    0.00,      -- Total Sales = 0
    0.00,      -- Noch keine Cash-Ausgaben
    0.00,      -- Noch keine Bank-Ausgaben (Eröffnungsbestand = Spezialfall)
    0.00,      -- Total Expenses = 0 (Eröffnungsbestand wird separat getrackt)
    0.00,      -- Kein Cash-Unterschied
    'closed',  -- Sofort abgeschlossen
    'Geschäftseröffnung Salon Lia Hair - Anfangsbestände erfasst',
    '00000000-0000-0000-0000-000000000000',
    '2024-09-01 20:00:00+00',
    '2024-09-01 20:00:00+00'
);

-- ============================================================================
-- 3. ERÖFFNUNGS-KATEGORIE ERSTELLEN (für bessere Filterung)
-- ============================================================================

-- Optional: Für bessere Filterung in Reports
-- Die Kategorie 'opening_balance' hilft diese speziellen Transaktionen zu erkennen

-- ============================================================================
-- VERWENDUNG:
-- ============================================================================

-- 1. Datenbank zurücksetzen:
--    ./setup_fresh_db.sh

-- 2. Anfangsbestände setzen:
--    psql -h localhost -p 54322 -U postgres -d postgres -f setup_opening_balances.sql

-- 3. Chronologisch importieren:
--    September 2024 → Oktober 2024 → November 2024 → ... → heute

-- ============================================================================
-- ANPASSUNG DER BETRÄGE:
-- ============================================================================

-- WICHTIG: Passe diese Beträge an deine tatsächlichen Anfangsbestände an:
-- 
-- Cash Anfangsbestand:  CHF 500.00  ← ANPASSEN
-- Bank Anfangsbestand:  CHF 2,000.00 ← ANPASSEN
--
-- Diese Werte sollten deinen tatsächlichen Beständen am 1. September 2024 entsprechen!

-- ============================================================================
-- KONTROLLE:
-- ============================================================================

-- Nach dem Import kannst du die Anfangsbestände so überprüfen:
--
-- SELECT * FROM expenses WHERE category = 'opening_balance';
-- SELECT * FROM daily_summaries WHERE report_date = '2024-09-01';
--
-- Die negativen Amounts in expenses repräsentieren Zugänge (= Anfangsbestände)