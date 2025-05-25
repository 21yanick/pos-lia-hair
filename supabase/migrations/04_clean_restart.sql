-- ============================================================================
-- CLEAN RESTART: Vereinfachtes POS + Buchhaltungssystem
-- Löscht alle alten Tabellen und erstellt saubere, einfache Struktur
-- ============================================================================

-- ============================================================================
-- 1. CLEANUP: Alle alten Tabellen entfernen
-- ============================================================================

-- Drop alle bestehenden Policies und Tabellen
DROP POLICY IF EXISTS "Benutzer sind für authentifizierte Benutzer lesbar" ON users;
DROP POLICY IF EXISTS "Nur Admins können Benutzer einfügen" ON users;
DROP POLICY IF EXISTS "Nur Admins können Benutzer aktualisieren" ON users;
DROP POLICY IF EXISTS "Nur Admins können Benutzer löschen" ON users;

DROP POLICY IF EXISTS "Produkte sind für authentifizierte Benutzer lesbar" ON items;
DROP POLICY IF EXISTS "Nur Admins können Produkte einfügen" ON items;
DROP POLICY IF EXISTS "Nur Admins können Produkte aktualisieren" ON items;
DROP POLICY IF EXISTS "Nur Admins können Produkte löschen" ON items;

DROP POLICY IF EXISTS "Transaktionen sind für authentifizierte Benutzer lesbar" ON transactions;
DROP POLICY IF EXISTS "Nur Staff und Admin können Transaktionen erstellen" ON transactions;

DROP POLICY IF EXISTS "Tagesberichte sind für authentifizierte Benutzer lesbar" ON daily_reports;
DROP POLICY IF EXISTS "Nur autorisierte Benutzer können Tagesberichte erstellen" ON daily_reports;
DROP POLICY IF EXISTS "Nur autorisierte Benutzer können Tagesberichte aktualisieren" ON daily_reports;
DROP POLICY IF EXISTS "Nur Admins können Tagesberichte löschen" ON daily_reports;

DROP POLICY IF EXISTS "Kassenstatus ist für authentifizierte Benutzer lesbar" ON register_status;
DROP POLICY IF EXISTS "Nur autorisierte Benutzer können Kassenstatus ändern" ON register_status;
DROP POLICY IF EXISTS "Nur autorisierte Benutzer können Kassenstatus aktualisieren" ON register_status;

-- Drop Funktionen
DROP FUNCTION IF EXISTS is_register_open_for_date(DATE);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_delete();

-- Drop Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Drop Tabellen in der richtigen Reihenfolge (wegen Foreign Keys)
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS supplier_invoices CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS cash_register CASCADE;
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS monthly_reports CASCADE;
DROP TABLE IF EXISTS register_status CASCADE;
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 2. NEUE TABELLEN: Saubere, einfache Struktur
-- ============================================================================

-- ============================
-- 2.1 STAMMDATEN
-- ============================

-- Benutzer (vereinfacht)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')) DEFAULT 'admin',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Produkte & Dienstleistungen (vereinfacht)
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    default_price DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('service', 'product')),
    is_favorite BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================
-- 2.2 TRANSAKTIONS-SYSTEM
-- ============================

-- Verkäufe (POS)
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'twint', 'sumup')),
    status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled', 'refunded')) DEFAULT 'completed',
    notes TEXT,
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verkaufs-Details
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    price DECIMAL(10,2) NOT NULL,
    notes TEXT
);

-- Ausgaben (unabhängig vom Salon-Betrieb)
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('rent', 'supplies', 'salary', 'utilities', 'insurance', 'other')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('bank', 'cash')),
    payment_date DATE NOT NULL,
    supplier_name TEXT,
    invoice_number TEXT,
    notes TEXT,
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bargeld-Bewegungen
CREATE TABLE cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash_in', 'cash_out')),
    description TEXT NOT NULL,
    reference_type TEXT CHECK (reference_type IN ('sale', 'expense', 'adjustment')),
    reference_id UUID, -- Kann auf sales.id oder expenses.id verweisen
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================
-- 2.3 DOKUMENTEN-SYSTEM
-- ============================

-- Alle Belege (generiert + gescannt)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN (
        'receipt',           -- Kundenquittung
        'daily_report',      -- Tagesabschluss
        'monthly_report',    -- Monatsbericht
        'yearly_report',     -- Jahresbericht
        'expense_receipt'    -- Gescannte Ausgabenbelege
    )),
    reference_id UUID NOT NULL, -- ID der zugehörigen Transaktion/Bericht
    file_path TEXT NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'twint', 'sumup', 'bank')), -- Für Sortierung
    document_date DATE NOT NULL, -- Für chronologische Sortierung
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================
-- 2.4 REPORTING-SYSTEM
-- ============================

-- Tagesabschlüsse (Basis für alle Berichte)
CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL UNIQUE,
    
    -- Verkäufe nach Zahlungsart
    sales_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_twint DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_sumup DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Ausgaben nach Zahlungsart
    expenses_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
    expenses_bank DECIMAL(10,2) NOT NULL DEFAULT 0,
    expenses_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Bargeld-Bestand
    cash_starting DECIMAL(10,2) NOT NULL DEFAULT 0,
    cash_ending DECIMAL(10,2) NOT NULL DEFAULT 0,
    cash_difference DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('draft', 'closed')) DEFAULT 'draft',
    notes TEXT,
    
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 3. INDIZES FÜR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_payment_method ON sales(payment_method);
CREATE INDEX idx_expenses_payment_date ON expenses(payment_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_document_date ON documents(document_date);
CREATE INDEX idx_daily_summaries_report_date ON daily_summaries(report_date);
CREATE INDEX idx_cash_movements_created_at ON cash_movements(created_at);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Aktiviere RLS für alle Tabellen
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Einfache Policies: Da nur du das System nutzt, haben authentifizierte User vollen Zugriff

-- Users
CREATE POLICY "users_all_access" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Items
CREATE POLICY "items_all_access" ON items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sales
CREATE POLICY "sales_all_access" ON sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sale Items
CREATE POLICY "sale_items_all_access" ON sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Expenses
CREATE POLICY "expenses_all_access" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Cash Movements
CREATE POLICY "cash_movements_all_access" ON cash_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Documents
CREATE POLICY "documents_all_access" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Daily Summaries
CREATE POLICY "daily_summaries_all_access" ON daily_summaries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- 5. AUTH-TRIGGER WIEDERHERSTELLEN
-- ============================================================================

-- Funktion für Auto-Sync auth.users → public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, username, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), 
    NEW.email,
    'admin'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', users.name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für neue Auth-User
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 6. NÜTZLICHE FUNKTIONEN
-- ============================================================================

-- Funktion: Automatische Berechnung des Tagesabschlusses
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
BEGIN
    -- Admin User ID holen
    SELECT id INTO v_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    -- Verkäufe nach Zahlungsart berechnen
    SELECT 
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'twint' THEN total_amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'sumup' THEN total_amount END), 0),
        COALESCE(SUM(total_amount), 0)
    INTO v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total
    FROM sales 
    WHERE DATE(created_at) = summary_date 
    AND status = 'completed';
    
    -- Ausgaben nach Zahlungsart berechnen
    SELECT 
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'bank' THEN amount END), 0),
        COALESCE(SUM(amount), 0)
    INTO v_expenses_cash, v_expenses_bank, v_expenses_total
    FROM expenses 
    WHERE payment_date = summary_date;
    
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
END;
$$ LANGUAGE plpgsql;

-- Funktion: Bargeld-Bestand berechnen
CREATE OR REPLACE FUNCTION get_current_cash_balance()
RETURNS DECIMAL(10,2) AS $$
DECLARE
    balance DECIMAL(10,2) := 0;
BEGIN
    SELECT COALESCE(SUM(
        CASE 
            WHEN type = 'cash_in' THEN amount 
            WHEN type = 'cash_out' THEN -amount 
            ELSE 0 
        END
    ), 0) INTO balance
    FROM cash_movements;
    
    RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. DEMO-DATEN EINFÜGEN
-- ============================================================================

-- Admin-User (wird automatisch über Auth-Trigger erstellt, aber sicherstellen)
INSERT INTO users (name, username, email, role)
VALUES ('LIA Hair Admin', 'admin', 'admin@lia-hair.ch', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Demo-Produkte und Dienstleistungen
INSERT INTO items (name, default_price, type, is_favorite) VALUES
-- Dienstleistungen
('Herrenschnitt', 45.00, 'service', true),
('Damenschnitt', 65.00, 'service', true),
('Waschen & Föhnen', 35.00, 'service', true),
('Färben', 85.00, 'service', false),
('Dauerwelle', 120.00, 'service', false),
('Bart trimmen', 25.00, 'service', true),

-- Produkte
('Shampoo Professional', 24.90, 'product', false),
('Conditioner', 19.90, 'product', false),
('Haargel', 15.50, 'product', true),
('Haarspray', 18.00, 'product', false);

-- ============================================================================
-- ERFOLGSMELDUNG
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🎯 CLEAN RESTART ERFOLGREICH!';
    RAISE NOTICE '✅ Alte Tabellen entfernt';
    RAISE NOTICE '✅ Neue vereinfachte Struktur erstellt';
    RAISE NOTICE '✅ 7 Kern-Tabellen statt 11';
    RAISE NOTICE '✅ Auth-Trigger wiederhergestellt';
    RAISE NOTICE '✅ RLS-Policies aktiviert';
    RAISE NOTICE '✅ Demo-Daten eingefügt';
    RAISE NOTICE '🚀 System bereit für Entwicklung!';
END;
$$;