-- ============================================================================
-- COMPLETE BUSINESS-CENTRIC SCHEMA
-- Clean, modern POS system with proper data ownership separation
-- Business-Level vs User-Level data clearly separated
-- ============================================================================

-- ============================================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================================

-- Users table (auth sync target)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')) DEFAULT 'admin',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System user for automation and imports
INSERT INTO users (
    id, 
    name, 
    username, 
    email, 
    role
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'System',
    'system', 
    'system@internal',
    'admin'
);

-- ============================================================================
-- 2. BUSINESS-LEVEL DATA (Shared Resources)
-- ============================================================================

-- Items: Shared product/service catalog (NO user_id!)
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    default_price DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('service', 'product')),
    is_favorite BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily summaries: Business-owned with audit trail
CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL UNIQUE,
    
    -- Sales by payment method
    sales_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_twint DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_sumup DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Expenses by payment method
    expenses_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
    expenses_bank DECIMAL(10,2) NOT NULL DEFAULT 0,
    expenses_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Cash tracking
    cash_starting DECIMAL(10,2) NOT NULL DEFAULT 0,
    cash_ending DECIMAL(10,2) NOT NULL DEFAULT 0,
    cash_difference DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Status and metadata
    status TEXT NOT NULL CHECK (status IN ('draft', 'closed')) DEFAULT 'draft',
    notes TEXT,
    
    -- BUSINESS-CENTRIC: created_by for audit trail, NO ownership
    created_by UUID REFERENCES users(id),  -- Who created this (audit trail)
    user_id UUID REFERENCES users(id),     -- OPTIONAL: Compatibility/fallback
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Monthly summaries: Business-owned with audit trail
CREATE TABLE monthly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    
    -- Sales aggregated from daily_summaries
    sales_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_twint DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_sumup DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Expenses aggregated
    expenses_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
    expenses_bank DECIMAL(10,2) NOT NULL DEFAULT 0,
    expenses_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Statistics
    transaction_count INTEGER NOT NULL DEFAULT 0,
    avg_daily_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Status and metadata
    status TEXT NOT NULL CHECK (status IN ('draft', 'closed')) DEFAULT 'draft',
    notes TEXT,
    
    -- BUSINESS-CENTRIC: created_by for audit trail, NO ownership
    created_by UUID REFERENCES users(id),  -- Who created this (audit trail)
    user_id UUID REFERENCES users(id),     -- OPTIONAL: Compatibility/fallback
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE (year, month)
);

-- ============================================================================
-- 3. USER-LEVEL DATA (Actions/Transactions)
-- ============================================================================

-- Sales: User-owned (who made the sale)
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'twint', 'sumup')),
    status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled', 'refunded')) DEFAULT 'completed',
    notes TEXT,
    user_id UUID REFERENCES users(id) NOT NULL,  -- Who made this sale
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale items: Details of sales
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    price DECIMAL(10,2) NOT NULL,
    notes TEXT
);

-- Expenses: User-owned (who recorded the expense)
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
    user_id UUID REFERENCES users(id) NOT NULL,  -- Who recorded this expense
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cash movements: User-owned (who triggered the movement)
CREATE TABLE cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash_in', 'cash_out')),
    description TEXT NOT NULL,
    reference_type TEXT CHECK (reference_type IN ('sale', 'expense', 'adjustment')),
    reference_id UUID, -- Can reference sales.id or expenses.id
    user_id UUID REFERENCES users(id) NOT NULL,  -- Who triggered this movement
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents: User-owned (who created/uploaded the document)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN (
        'receipt',           -- Customer receipt
        'daily_report',      -- Daily closing report
        'monthly_report',    -- Monthly report
        'yearly_report',     -- Yearly report
        'expense_receipt'    -- Scanned expense receipts
    )),
    reference_id UUID NOT NULL, -- ID of related transaction/report
    file_path TEXT NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'twint', 'sumup', 'bank')),
    document_date DATE NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,  -- Who created/uploaded this
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_payment_method ON sales(payment_method);
CREATE INDEX idx_sales_user_id ON sales(user_id);

CREATE INDEX idx_expenses_payment_date ON expenses(payment_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);

CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_document_date ON documents(document_date);
CREATE INDEX idx_documents_user_id ON documents(user_id);

CREATE INDEX idx_daily_summaries_report_date ON daily_summaries(report_date);
CREATE INDEX idx_daily_summaries_created_by ON daily_summaries(created_by);

CREATE INDEX idx_monthly_summaries_year_month ON monthly_summaries(year, month);
CREATE INDEX idx_monthly_summaries_created_by ON monthly_summaries(created_by);

CREATE INDEX idx_cash_movements_created_at ON cash_movements(created_at);
CREATE INDEX idx_cash_movements_user_id ON cash_movements(user_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

-- BUSINESS-LEVEL: Full access for authenticated users
CREATE POLICY "items_business_access" ON items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "daily_summaries_business_access" ON daily_summaries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "monthly_summaries_business_access" ON monthly_summaries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- USER-LEVEL: Full access (simple policies for single-business use)
CREATE POLICY "users_access" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sales_access" ON sales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sale_items_access" ON sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "expenses_access" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cash_movements_access" ON cash_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "documents_access" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- 6. AUTHENTICATION & USER SYNC
-- ============================================================================

-- Function for auto-sync auth.users → public.users
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

-- Trigger for new auth users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function for user deletion (soft delete)
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users 
  SET active = FALSE
  WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for deleted users
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- ============================================================================
-- 7. STORAGE BUCKETS
-- ============================================================================

-- Documents storage bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('documents', 'documents', TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
    -- Allow public read access to documents
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'documents_public_read'
    ) THEN
        EXECUTE 'CREATE POLICY "documents_public_read" ON storage.objects FOR SELECT USING (bucket_id = ''documents'')';
    END IF;

    -- Allow authenticated users to upload
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'documents_authenticated_upload'
    ) THEN
        EXECUTE 'CREATE POLICY "documents_authenticated_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''documents'' AND auth.role() = ''authenticated'')';
    END IF;

    -- Allow owners to delete their documents
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'documents_owner_delete'
    ) THEN
        EXECUTE 'CREATE POLICY "documents_owner_delete" ON storage.objects FOR DELETE USING (bucket_id = ''documents'' AND auth.uid() = owner)';
    END IF;
END $$;

-- ============================================================================
-- 8. BUSINESS LOGIC FUNCTIONS
-- ============================================================================

-- Calculate daily summary (business-level operation)
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
    v_system_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Calculate sales by payment method
    SELECT 
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'twint' THEN total_amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'sumup' THEN total_amount END), 0),
        COALESCE(SUM(total_amount), 0)
    INTO v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total
    FROM sales 
    WHERE DATE(created_at) = summary_date 
    AND status = 'completed';
    
    -- Calculate expenses by payment method
    SELECT 
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'bank' THEN amount END), 0),
        COALESCE(SUM(amount), 0)
    INTO v_expenses_cash, v_expenses_bank, v_expenses_total
    FROM expenses 
    WHERE payment_date = summary_date;
    
    -- Insert or update daily summary (business-level, created by system)
    INSERT INTO daily_summaries (
        report_date, sales_cash, sales_twint, sales_sumup, sales_total,
        expenses_cash, expenses_bank, expenses_total,
        created_by
    ) VALUES (
        summary_date, v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total,
        v_expenses_cash, v_expenses_bank, v_expenses_total,
        v_system_user_id
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

-- Calculate monthly summary (business-level operation)
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
    v_system_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Calculate days in month
    SELECT EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(summary_year, summary_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER
    INTO v_days_in_month;
    
    -- Aggregate sales from daily_summaries
    SELECT 
        COALESCE(SUM(sales_cash), 0),
        COALESCE(SUM(sales_twint), 0),
        COALESCE(SUM(sales_sumup), 0),
        COALESCE(SUM(sales_total), 0)
    INTO v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total
    FROM daily_summaries 
    WHERE EXTRACT(YEAR FROM report_date) = summary_year 
    AND EXTRACT(MONTH FROM report_date) = summary_month;
    
    -- Aggregate expenses
    SELECT 
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'bank' THEN amount END), 0),
        COALESCE(SUM(amount), 0)
    INTO v_expenses_cash, v_expenses_bank, v_expenses_total
    FROM expenses 
    WHERE EXTRACT(YEAR FROM payment_date) = summary_year 
    AND EXTRACT(MONTH FROM payment_date) = summary_month;
    
    -- Count transactions
    SELECT COALESCE(COUNT(*), 0)
    INTO v_transaction_count
    FROM sales 
    WHERE EXTRACT(YEAR FROM created_at) = summary_year 
    AND EXTRACT(MONTH FROM created_at) = summary_month
    AND status = 'completed';
    
    -- Calculate average daily revenue
    IF v_days_in_month > 0 THEN
        v_avg_daily_revenue := v_sales_total / v_days_in_month;
    END IF;
    
    -- Insert or update monthly summary (business-level, created by system)
    INSERT INTO monthly_summaries (
        year, month, 
        sales_cash, sales_twint, sales_sumup, sales_total,
        expenses_cash, expenses_bank, expenses_total,
        transaction_count, avg_daily_revenue,
        created_by
    ) VALUES (
        summary_year, summary_month,
        v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total,
        v_expenses_cash, v_expenses_bank, v_expenses_total,
        v_transaction_count, v_avg_daily_revenue,
        v_system_user_id
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

-- Get current cash balance
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

-- Find missing daily closures
CREATE OR REPLACE FUNCTION find_missing_daily_closures(start_date DATE, end_date DATE)
RETURNS TABLE(
    missing_date DATE,
    sales_count INTEGER,
    sales_total DECIMAL(10,2),
    has_draft_summary BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS check_date
    ),
    sales_by_date AS (
        SELECT 
            DATE(created_at) as sale_date,
            COUNT(*) as sales_count,
            SUM(total_amount) as sales_total
        FROM sales 
        WHERE DATE(created_at) BETWEEN start_date AND end_date
        AND status = 'completed'
        GROUP BY DATE(created_at)
    ),
    summaries_by_date AS (
        SELECT 
            report_date,
            status = 'draft' as is_draft
        FROM daily_summaries 
        WHERE report_date BETWEEN start_date AND end_date
    )
    SELECT 
        ds.check_date,
        COALESCE(sbd.sales_count, 0)::INTEGER,
        COALESCE(sbd.sales_total, 0)::DECIMAL(10,2),
        COALESCE(subd.is_draft, false)::BOOLEAN
    FROM date_series ds
    LEFT JOIN sales_by_date sbd ON ds.check_date = sbd.sale_date
    LEFT JOIN summaries_by_date subd ON ds.check_date = subd.report_date
    WHERE (sbd.sales_count > 0 OR subd.report_date IS NOT NULL)  -- Has activity
    AND (subd.report_date IS NULL OR subd.is_draft = true);      -- No closure or still draft
END;
$$ LANGUAGE plpgsql;

-- Create view for recent missing closures
CREATE VIEW recent_missing_closures AS
SELECT 
    missing_date,
    sales_count,
    sales_total,
    has_draft_summary,
    (CURRENT_DATE - missing_date) as days_ago
FROM find_missing_daily_closures(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day')
ORDER BY missing_date DESC;

-- Bulk close daily summaries
CREATE OR REPLACE FUNCTION bulk_close_daily_summaries(
    target_dates DATE[],
    default_cash_starting DECIMAL(10,2) DEFAULT 0,
    default_cash_ending DECIMAL(10,2) DEFAULT 0,
    default_notes TEXT DEFAULT 'Bulk closure - automatically closed'
)
RETURNS TABLE(
    processed_date DATE,
    success BOOLEAN,
    summary_id UUID,
    error_message TEXT
) AS $$
DECLARE
    target_date DATE;
    v_summary_id UUID;
    v_system_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    FOREACH target_date IN ARRAY target_dates
    LOOP
        BEGIN
            -- Calculate or update daily summary
            PERFORM calculate_daily_summary(target_date);
            
            -- Get the summary ID
            SELECT id INTO v_summary_id 
            FROM daily_summaries 
            WHERE report_date = target_date;
            
            -- Update with cash values and close
            UPDATE daily_summaries 
            SET 
                cash_starting = default_cash_starting,
                cash_ending = default_cash_ending,
                cash_difference = default_cash_ending - default_cash_starting,
                status = 'closed',
                notes = default_notes,
                closed_at = NOW(),
                created_by = COALESCE(created_by, v_system_user_id)
            WHERE id = v_summary_id;
            
            RETURN QUERY SELECT target_date, true, v_summary_id, NULL::TEXT;
            
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT target_date, false, NULL::UUID, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Validate monthly closure prerequisites
CREATE OR REPLACE FUNCTION validate_monthly_closure_prerequisites(check_year INTEGER, check_month INTEGER)
RETURNS TABLE(
    is_valid BOOLEAN,
    missing_count INTEGER,
    missing_dates DATE[]
) AS $$
DECLARE
    month_start DATE;
    month_end DATE;
    missing_closures DATE[];
    missing_count_val INTEGER;
BEGIN
    -- Calculate month boundaries
    month_start := DATE_TRUNC('month', MAKE_DATE(check_year, check_month, 1))::DATE;
    month_end := (DATE_TRUNC('month', MAKE_DATE(check_year, check_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- Find missing closures
    SELECT ARRAY_AGG(missing_date ORDER BY missing_date)
    INTO missing_closures
    FROM find_missing_daily_closures(month_start, month_end);
    
    missing_count_val := COALESCE(array_length(missing_closures, 1), 0);
    
    RETURN QUERY SELECT 
        (missing_count_val = 0), 
        missing_count_val, 
        missing_closures;
END;
$$ LANGUAGE plpgsql;

-- Create function for daily summary creation (with user context)
CREATE OR REPLACE FUNCTION create_daily_summary_for_date(
    target_date DATE,
    cash_starting DECIMAL(10,2) DEFAULT 0,
    cash_ending DECIMAL(10,2) DEFAULT 0,
    notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    summary_id UUID,
    error_message TEXT
) AS $$
DECLARE
    v_summary_id UUID;
    v_user_id UUID;
BEGIN
    -- Get current user (or fall back to system user)
    v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000');
    
    BEGIN
        -- Calculate daily summary
        PERFORM calculate_daily_summary(target_date);
        
        -- Get the summary
        SELECT id INTO v_summary_id 
        FROM daily_summaries 
        WHERE report_date = target_date;
        
        -- Update with provided values
        UPDATE daily_summaries 
        SET 
            cash_starting = create_daily_summary_for_date.cash_starting,
            cash_ending = create_daily_summary_for_date.cash_ending,
            cash_difference = create_daily_summary_for_date.cash_ending - create_daily_summary_for_date.cash_starting,
            status = 'closed',
            notes = create_daily_summary_for_date.notes,
            closed_at = NOW(),
            created_by = v_user_id
        WHERE id = v_summary_id;
        
        RETURN QUERY SELECT true, v_summary_id, NULL::TEXT;
        
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT false, NULL::UUID, SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. DEMO DATA
-- ============================================================================

-- Demo items (shared resources)
INSERT INTO items (name, default_price, type, is_favorite) VALUES
-- Services
('Herrenschnitt', 45.00, 'service', true),
('Damenschnitt', 65.00, 'service', true),
('Waschen & Föhnen', 35.00, 'service', true),
('Färben', 85.00, 'service', false),
('Dauerwelle', 120.00, 'service', false),
('Bart trimmen', 25.00, 'service', true),

-- Products
('Shampoo Professional', 24.90, 'product', false),
('Conditioner', 19.90, 'product', false),
('Haargel', 15.50, 'product', true),
('Haarspray', 18.00, 'product', false);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🎯 BUSINESS-CENTRIC SCHEMA ERFOLGREICH ERSTELLT!';
    RAISE NOTICE '✅ Business-Level: items, daily_summaries, monthly_summaries (shared/audit trail)';
    RAISE NOTICE '✅ User-Level: sales, expenses, documents, cash_movements (ownership)';
    RAISE NOTICE '✅ System User für Automation erstellt';
    RAISE NOTICE '✅ Auth-Trigger und Storage-Buckets konfiguriert';
    RAISE NOTICE '✅ Business-Logic Funktionen erstellt';
    RAISE NOTICE '✅ Demo-Daten eingefügt';
    RAISE NOTICE '🚀 READY FOR MODERN POS OPERATIONS!';
END;
$$;