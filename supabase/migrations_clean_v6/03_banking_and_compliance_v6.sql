-- =====================================================
-- 03_banking_and_compliance_v6.sql
-- =====================================================
-- Complete Banking & Compliance Domain + Reconciliation Functions (V6)
-- Business Logic: Banking Integration + Swiss Compliance + Daily/Monthly Operations
-- Dependencies: 01_foundation_and_security_v6.sql, 02_core_business_logic_v6.sql
-- V6 Enhancement: ALL banking reconciliation + daily/monthly closure functions
-- =====================================================

-- =====================================================
-- BANKING & FINANCIAL DOMAIN TABLES
-- =====================================================

-- Bank Accounts (Swiss Banking Integration)
CREATE TABLE public.bank_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_name character varying(255) NOT NULL,
    iban character varying(34) NOT NULL,
    bic character varying(11),
    bank_name character varying(255) NOT NULL,
    account_type character varying(20) DEFAULT 'checking'::character varying NOT NULL,
    currency character varying(3) DEFAULT 'CHF'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    current_balance numeric(15,2) DEFAULT 0 NOT NULL,
    last_transaction_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    organization_id uuid,
    CONSTRAINT bank_accounts_account_type_check CHECK (((account_type)::text = ANY (ARRAY[('checking'::character varying)::text, ('savings'::character varying)::text, ('business'::character varying)::text]))),
    CONSTRAINT bank_accounts_currency_check CHECK (((currency)::text = ANY (ARRAY[('CHF'::character varying)::text, ('EUR'::character varying)::text, ('USD'::character varying)::text])))
);

-- Bank Transactions (CAMT.053 Integration)
CREATE TABLE public.bank_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reference character varying(255),
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'CHF'::character varying NOT NULL,
    transaction_date date NOT NULL,
    value_date date,
    description text NOT NULL,
    counterparty_name character varying(255),
    counterparty_iban character varying(34),
    transaction_type character varying(50),
    status character varying(20) DEFAULT 'unmatched'::character varying NOT NULL,
    bank_account_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    import_filename character varying(255),
    raw_data jsonb,
    matched_sale_id uuid,
    matched_expense_id uuid,
    transaction_number character varying(20),
    organization_id uuid,
    CONSTRAINT bank_transactions_status_check CHECK (((status)::text = ANY (ARRAY[('unmatched'::character varying)::text, ('matched'::character varying)::text, ('ignored'::character varying)::text])))
);

-- Provider Reports (TWINT/SumUp Integration)
CREATE TABLE public.provider_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider character varying(20) NOT NULL,
    report_date date NOT NULL,
    settlement_date date,
    gross_amount numeric(10,2) NOT NULL,
    fees numeric(10,2) NOT NULL,
    net_amount numeric(10,2) NOT NULL,
    transaction_count integer NOT NULL,
    currency character varying(3) DEFAULT 'CHF'::character varying NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    report_filename character varying(255),
    raw_data jsonb,
    sale_id uuid,
    bank_transaction_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    organization_id uuid,
    CONSTRAINT provider_reports_provider_check CHECK (((provider)::text = ANY (ARRAY[('twint'::character varying)::text, ('sumup'::character varying)::text]))),
    CONSTRAINT provider_reports_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('matched'::character varying)::text, ('settled'::character varying)::text])))
);

-- Document Sequences (Swiss Compliance - Receipt/Invoice Numbering)
CREATE TABLE public.document_sequences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sequence_type character varying(50) NOT NULL,
    current_number integer DEFAULT 1 NOT NULL,
    prefix character varying(10) DEFAULT ''::character varying NOT NULL,
    suffix character varying(10) DEFAULT ''::character varying NOT NULL,
    year integer DEFAULT EXTRACT(year FROM CURRENT_DATE) NOT NULL,
    reset_yearly boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    organization_id uuid,
    CONSTRAINT document_sequences_current_number_check CHECK ((current_number > 0)),
    CONSTRAINT document_sequences_sequence_type_check CHECK (((sequence_type)::text = ANY (ARRAY[('sale_receipt'::character varying)::text, ('expense_receipt'::character varying)::text, ('invoice'::character varying)::text, ('cash_movement'::character varying)::text, ('bank_transaction'::character varying)::text, ('document'::character varying)::text])))
);

-- Daily Summaries (Daily Closure System) - V6 ADDITION
CREATE TABLE public.daily_summaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_date date NOT NULL,
    sales_cash numeric(10,2) DEFAULT 0 NOT NULL,
    sales_twint numeric(10,2) DEFAULT 0 NOT NULL,
    sales_sumup numeric(10,2) DEFAULT 0 NOT NULL,
    sales_total numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_cash numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_bank numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_total numeric(10,2) DEFAULT 0 NOT NULL,
    cash_starting numeric(10,2),
    cash_ending numeric(10,2),
    cash_difference numeric(10,2),
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    organization_id uuid,
    CONSTRAINT daily_summaries_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('closed'::character varying)::text, ('locked'::character varying)::text])))
);

-- Monthly Summaries (Monthly Reporting) - V6 ADDITION
CREATE TABLE public.monthly_summaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    sales_cash numeric(10,2) DEFAULT 0 NOT NULL,
    sales_twint numeric(10,2) DEFAULT 0 NOT NULL,
    sales_sumup numeric(10,2) DEFAULT 0 NOT NULL,
    sales_total numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_cash numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_bank numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_total numeric(10,2) DEFAULT 0 NOT NULL,
    transaction_count integer DEFAULT 0 NOT NULL,
    days_in_month integer NOT NULL,
    avg_daily_revenue numeric(10,2) DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    organization_id uuid,
    CONSTRAINT monthly_summaries_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT monthly_summaries_year_check CHECK ((year >= 2020))
);

-- Bank Reconciliation Sessions (Reconciliation Management) - V6 ADDITION
CREATE TABLE public.bank_reconciliation_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    bank_statement_filename text,
    bank_entries_count integer DEFAULT 0,
    bank_entries_total_amount numeric(12,2) DEFAULT 0,
    matched_entries_count integer DEFAULT 0,
    unmatched_entries_count integer DEFAULT 0,
    completion_percentage numeric(5,2) DEFAULT 0,
    status character varying(20) DEFAULT 'in_progress'::character varying,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    organization_id uuid,
    CONSTRAINT bank_reconciliation_sessions_completion_percentage_check CHECK (((completion_percentage >= (0)::numeric) AND (completion_percentage <= (100)::numeric))),
    CONSTRAINT bank_reconciliation_sessions_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT bank_reconciliation_sessions_status_check CHECK (((status)::text = ANY (ARRAY[('in_progress'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text]))),
    CONSTRAINT bank_reconciliation_sessions_year_check CHECK ((year >= 2020))
);

-- Bank Reconciliation Matches (Match Records) - V6 ADDITION
CREATE TABLE public.bank_reconciliation_matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    bank_transaction_id uuid,
    provider_report_id uuid,
    sale_id uuid,
    expense_id uuid,
    match_type character varying(20) NOT NULL,
    confidence_score numeric(3,2) DEFAULT 0.5,
    amount_difference numeric(10,2) DEFAULT 0,
    status character varying(20) DEFAULT 'pending'::character varying,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    organization_id uuid,
    CONSTRAINT bank_reconciliation_matches_confidence_score_check CHECK (((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric))),
    CONSTRAINT bank_reconciliation_matches_match_type_check CHECK (((match_type)::text = ANY (ARRAY[('exact'::character varying)::text, ('fuzzy'::character varying)::text, ('manual'::character varying)::text]))),
    CONSTRAINT bank_reconciliation_matches_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('approved'::character varying)::text, ('rejected'::character varying)::text])))
);

-- Daily Closure Locks (Prevent Concurrent Closures) - V6 ADDITION
CREATE TABLE public.daily_closure_locks (
    closure_date date NOT NULL,
    locked_by uuid NOT NULL,
    status character varying(20) DEFAULT 'in_progress'::character varying,
    locked_at timestamp with time zone DEFAULT now(),
    organization_id uuid,
    CONSTRAINT daily_closure_locks_status_check CHECK (((status)::text = ANY (ARRAY[('in_progress'::character varying)::text, ('completed'::character varying)::text, ('failed'::character varying)::text])))
);

-- =====================================================
-- BANKING & RECONCILIATION FUNCTIONS (V6 COMPLETE)
-- =====================================================

-- Calculate daily summary (V6 ADDITION - CRITICAL FOR DAILY OPERATIONS)
CREATE OR REPLACE FUNCTION public.calculate_daily_summary(summary_date date) 
RETURNS void
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
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
                                                                                                                                                                                                                                         
    -- Insert or update daily summary                                                                                                                                                                                                    
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
$$;

-- Calculate monthly summary (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.calculate_monthly_summary(summary_year integer, summary_month integer) 
RETURNS void
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
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
                                                                                                                                                                                                                                         
    -- Insert or update monthly summary                                                                                                                                                                                                  
    INSERT INTO monthly_summaries (                                                                                                                                                                                                      
        year, month, sales_cash, sales_twint, sales_sumup, sales_total,                                                                                                                                                                  
        expenses_cash, expenses_bank, expenses_total,                                                                                                                                                                                    
        transaction_count, days_in_month, avg_daily_revenue,                                                                                                                                                                             
        created_by                                                                                                                                                                                                                       
    ) VALUES (                                                                                                                                                                                                                           
        summary_year, summary_month, v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total,                                                                                                                                         
        v_expenses_cash, v_expenses_bank, v_expenses_total,                                                                                                                                                                              
        v_transaction_count, v_days_in_month, v_avg_daily_revenue,                                                                                                                                                                       
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
$$;

-- Create bank reconciliation session (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.create_bank_reconciliation_session(p_year integer, p_month integer, p_bank_statement_filename text, p_bank_entries_count integer, p_bank_entries_total_amount numeric, p_user_id uuid) 
RETURNS uuid
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
    v_session_id UUID;                                                                                                                                                                                                                   
BEGIN                                                                                                                                                                                                                                    
    -- Insert or update session                                                                                                                                                                                                          
    INSERT INTO bank_reconciliation_sessions (                                                                                                                                                                                           
        year, month, bank_statement_filename, bank_entries_count,                                                                                                                                                                        
        bank_entries_total_amount, created_by                                                                                                                                                                                            
    ) VALUES (                                                                                                                                                                                                                           
        p_year, p_month, p_bank_statement_filename, p_bank_entries_count,                                                                                                                                                                
        p_bank_entries_total_amount, p_user_id                                                                                                                                                                                           
    )                                                                                                                                                                                                                                    
    ON CONFLICT (year, month)                                                                                                                                                                                                            
    DO UPDATE SET                                                                                                                                                                                                                        
        bank_statement_filename = EXCLUDED.bank_statement_filename,                                                                                                                                                                      
        bank_entries_count = EXCLUDED.bank_entries_count,                                                                                                                                                                                
        bank_entries_total_amount = EXCLUDED.bank_entries_total_amount,                                                                                                                                                                  
        created_at = NOW() -- Reset timestamp for re-import                                                                                                                                                                              
    RETURNING id INTO v_session_id;                                                                                                                                                                                                      
                                                                                                                                                                                                                                         
    -- Clear old matches for this session                                                                                                                                                                                                
    DELETE FROM bank_reconciliation_matches WHERE session_id = v_session_id;                                                                                                                                                             
                                                                                                                                                                                                                                         
    RETURN v_session_id;                                                                                                                                                                                                                 
END;                                                                                                                                                                                                                                     
$$;

-- Complete bank reconciliation session (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.complete_bank_reconciliation_session(p_session_id uuid, p_user_id uuid) 
RETURNS boolean
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
    v_matched_count INTEGER;                                                                                                                                                                                                             
    v_total_count INTEGER;                                                                                                                                                                                                               
    v_completion_percentage DECIMAL(5,2);                                                                                                                                                                                                
BEGIN                                                                                                                                                                                                                                    
    -- Calculate completion stats                                                                                                                                                                                                        
    SELECT                                                                                                                                                                                                                               
        COUNT(*) FILTER (WHERE status = 'approved'),                                                                                                                                                                                     
        COUNT(*),                                                                                                                                                                                                                        
        CASE WHEN COUNT(*) > 0 THEN                                                                                                                                                                                                      
            (COUNT(*) FILTER (WHERE status = 'approved') * 100.0 / COUNT(*))                                                                                                                                                             
        ELSE 0 END                                                                                                                                                                                                                       
    INTO v_matched_count, v_total_count, v_completion_percentage                                                                                                                                                                         
    FROM bank_reconciliation_matches                                                                                                                                                                                                     
    WHERE session_id = p_session_id;                                                                                                                                                                                                     
                                                                                                                                                                                                                                         
    -- Update session                                                                                                                                                                                                                    
    UPDATE bank_reconciliation_sessions                                                                                                                                                                                                  
    SET                                                                                                                                                                                                                                  
        status = 'completed',                                                                                                                                                                                                            
        matched_entries_count = v_matched_count,                                                                                                                                                                                         
        unmatched_entries_count = v_total_count - v_matched_count,                                                                                                                                                                       
        completion_percentage = v_completion_percentage,                                                                                                                                                                                 
        completed_at = NOW()                                                                                                                                                                                                             
    WHERE id = p_session_id;                                                                                                                                                                                                             
                                                                                                                                                                                                                                         
    RETURN TRUE;                                                                                                                                                                                                                         
END;                                                                                                                                                                                                                                     
$$;

-- Execute exact matches (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.execute_exact_matches() 
RETURNS TABLE(bank_id uuid, bank_amount numeric, bank_desc text, provider_id uuid, provider_amount numeric, provider_type text, difference numeric)
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
  bank_rec RECORD;                                                                                                                                                                                                                       
  provider_rec RECORD;                                                                                                                                                                                                                   
  match_count INT := 0;                                                                                                                                                                                                                  
BEGIN                                                                                                                                                                                                                                    
  -- Find exact matches between unmatched bank and matched providers                                                                                                                                                                     
  FOR bank_rec IN                                                                                                                                                                                                                        
    SELECT id, amount, description, transaction_date                                                                                                                                                                                     
    FROM bank_transactions                                                                                                                                                                                                               
    WHERE status = 'unmatched'                                                                                                                                                                                                           
    ORDER BY transaction_date                                                                                                                                                                                                            
  LOOP                                                                                                                                                                                                                                   
    FOR provider_rec IN                                                                                                                                                                                                                  
      SELECT id, provider, net_amount, settlement_date                                                                                                                                                                                   
      FROM provider_reports                                                                                                                                                                                                              
      WHERE status = 'matched'                                                                                                                                                                                                           
      AND ABS(net_amount - bank_rec.amount) < 0.01                                                                                                                                                                                       
    LOOP                                                                                                                                                                                                                                 
      -- Return the match for review                                                                                                                                                                                                     
      bank_id := bank_rec.id;                                                                                                                                                                                                            
      bank_amount := bank_rec.amount;                                                                                                                                                                                                    
      bank_desc := bank_rec.description;                                                                                                                                                                                                 
      provider_id := provider_rec.id;                                                                                                                                                                                                    
      provider_amount := provider_rec.net_amount;                                                                                                                                                                                        
      provider_type := provider_rec.provider;                                                                                                                                                                                            
      difference := ABS(provider_rec.net_amount - bank_rec.amount);                                                                                                                                                                      
                                                                                                                                                                                                                                         
      RETURN NEXT;                                                                                                                                                                                                                       
      match_count := match_count + 1;                                                                                                                                                                                                    
    END LOOP;                                                                                                                                                                                                                            
  END LOOP;                                                                                                                                                                                                                              
                                                                                                                                                                                                                                         
  RAISE NOTICE 'Found % exact matches', match_count;                                                                                                                                                                                     
END;                                                                                                                                                                                                                                     
$$;

-- Check duplicate references (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.check_duplicate_references(p_references text[], p_bank_account_id uuid) 
RETURNS text[]
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
BEGIN                                                                                                                                                                                                                                    
    RETURN ARRAY(                                                                                                                                                                                                                        
        SELECT reference                                                                                                                                                                                                                 
        FROM bank_transactions                                                                                                                                                                                                           
        WHERE reference = ANY(p_references)                                                                                                                                                                                              
        AND bank_account_id = p_bank_account_id                                                                                                                                                                                          
    );                                                                                                                                                                                                                                   
END;                                                                                                                                                                                                                                     
$$;

-- Check file already imported (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.check_file_already_imported(p_filename character varying, p_bank_account_id uuid) 
RETURNS boolean
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
BEGIN                                                                                                                                                                                                                                    
    RETURN EXISTS (                                                                                                                                                                                                                      
        SELECT 1 FROM bank_transactions                                                                                                                                                                                                  
        WHERE import_filename = p_filename                                                                                                                                                                                               
        AND bank_account_id = p_bank_account_id                                                                                                                                                                                          
    );                                                                                                                                                                                                                                   
END;                                                                                                                                                                                                                                     
$$;

-- Check period overlap (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.check_period_overlap(p_from_date date, p_to_date date, p_bank_account_id uuid) 
RETURNS boolean
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
BEGIN                                                                                                                                                                                                                                    
    RETURN EXISTS (                                                                                                                                                                                                                      
        SELECT 1 FROM bank_transactions                                                                                                                                                                                                  
        WHERE bank_account_id = p_bank_account_id                                                                                                                                                                                        
        AND transaction_date BETWEEN p_from_date AND p_to_date                                                                                                                                                                           
    );                                                                                                                                                                                                                                   
END;                                                                                                                                                                                                                                     
$$;

-- Generate document number (from V5)
CREATE OR REPLACE FUNCTION public.generate_document_number(doc_type text) 
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    current_year INTEGER;
    sequence_record RECORD;
    new_number INTEGER;
    document_number TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Get or create sequence record
    SELECT * FROM document_sequences 
    WHERE sequence_type = doc_type 
    INTO sequence_record;
    
    -- Create sequence if it doesn't exist
    IF NOT FOUND THEN
        INSERT INTO document_sequences (sequence_type, current_number, year)
        VALUES (doc_type, 1, current_year)
        RETURNING * INTO sequence_record;
    END IF;
    
    -- Reset sequence if year changed and reset_yearly is true
    IF sequence_record.reset_yearly AND sequence_record.year != current_year THEN
        UPDATE document_sequences 
        SET current_number = 1, year = current_year, updated_at = NOW()
        WHERE sequence_type = doc_type
        RETURNING current_number INTO new_number;
    ELSE
        -- Increment sequence
        UPDATE document_sequences 
        SET current_number = current_number + 1, updated_at = NOW()
        WHERE sequence_type = doc_type
        RETURNING current_number INTO new_number;
    END IF;
    
    -- Format document number
    document_number := sequence_record.prefix || 
                      LPAD(new_number::text, 6, '0') || 
                      sequence_record.suffix;
    
    RETURN document_number;
END;
$$;

-- =====================================================
-- PRIMARY KEYS & UNIQUE CONSTRAINTS
-- =====================================================

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.bank_reconciliation_sessions
    ADD CONSTRAINT bank_reconciliation_sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.bank_reconciliation_matches
    ADD CONSTRAINT bank_reconciliation_matches_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.daily_closure_locks
    ADD CONSTRAINT daily_closure_locks_pkey PRIMARY KEY (closure_date);

-- Unique constraints
ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_iban_key UNIQUE (iban);

ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_type_year_key UNIQUE (sequence_type, year);

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_report_date_key UNIQUE (report_date);

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_year_month_key UNIQUE (year, month);

ALTER TABLE ONLY public.bank_reconciliation_sessions
    ADD CONSTRAINT bank_reconciliation_sessions_year_month_key UNIQUE (year, month);

-- =====================================================
-- FOREIGN KEY RELATIONSHIPS
-- =====================================================

-- Bank Accounts
ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Bank Transactions
ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_bank_account_id_fkey 
    FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Provider Reports
ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_sale_id_fkey 
    FOREIGN KEY (sale_id) REFERENCES public.sales(id);

-- Document Sequences
ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Daily Summaries
ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Monthly Summaries
ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Bank Reconciliation Sessions
ALTER TABLE ONLY public.bank_reconciliation_sessions
    ADD CONSTRAINT bank_reconciliation_sessions_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.bank_reconciliation_sessions
    ADD CONSTRAINT bank_reconciliation_sessions_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Bank Reconciliation Matches
ALTER TABLE ONLY public.bank_reconciliation_matches
    ADD CONSTRAINT bank_reconciliation_matches_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES public.bank_reconciliation_sessions(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.bank_reconciliation_matches
    ADD CONSTRAINT bank_reconciliation_matches_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Daily Closure Locks
ALTER TABLE ONLY public.daily_closure_locks
    ADD CONSTRAINT daily_closure_locks_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.daily_closure_locks
    ADD CONSTRAINT daily_closure_locks_locked_by_fkey 
    FOREIGN KEY (locked_by) REFERENCES auth.users(id);

-- =====================================================
-- ROW LEVEL SECURITY (BANKING ACCESS)
-- =====================================================

-- Enable RLS on all banking tables
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_reconciliation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_reconciliation_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_closure_locks ENABLE ROW LEVEL SECURITY;

-- Standard organization-scoped access pattern
CREATE POLICY bank_accounts_organization_access ON public.bank_accounts 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY bank_transactions_organization_access ON public.bank_transactions 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY provider_reports_organization_access ON public.provider_reports 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY document_sequences_organization_access ON public.document_sequences 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY daily_summaries_organization_access ON public.daily_summaries 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY monthly_summaries_organization_access ON public.monthly_summaries 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY bank_reconciliation_sessions_organization_access ON public.bank_reconciliation_sessions 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY bank_reconciliation_matches_organization_access ON public.bank_reconciliation_matches 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY daily_closure_locks_organization_access ON public.daily_closure_locks 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

-- =====================================================
-- BUSINESS VIEWS (V6 ADDITION)
-- =====================================================

-- Unified transactions view (CRITICAL for transactions page)
CREATE VIEW public.unified_transactions_view AS
 WITH transaction_base AS (
         SELECT s.id,
            'sale'::text AS transaction_type,
            'VK'::text AS type_code,
            s.receipt_number,
            s.created_at AS transaction_date,
            s.total_amount AS amount,
            s.payment_method,
            s.status,
            s.user_id,
            s.organization_id,
            COALESCE(( SELECT string_agg(i.name, ', '::text) AS string_agg
                   FROM (public.sale_items si
                     JOIN public.items i ON ((si.item_id = i.id)))
                  WHERE (si.sale_id = s.id)), 'Verkauf'::text) AS description,
            d.id AS document_id,
                CASE
                    WHEN (d.id IS NOT NULL) THEN true
                    ELSE false
                END AS has_pdf,
            s.banking_status,
            pr.fees AS provider_fee,
            pr.net_amount,
            s.provider_report_id,
                CASE
                    WHEN (s.provider_report_id IS NOT NULL) THEN true
                    ELSE false
                END AS has_real_provider_fees,
            s.customer_id,
            s.customer_name
           FROM ((public.sales s
             LEFT JOIN public.documents d ON (((d.reference_id = s.id) AND (d.type = 'receipt'::text))))
             LEFT JOIN public.provider_reports pr ON ((s.provider_report_id = pr.id)))
        UNION ALL
         SELECT e.id,
            'expense'::text AS transaction_type,
            'AG'::text AS type_code,
            e.receipt_number,
            e.created_at AS transaction_date,
            (- e.amount) AS amount,
            e.payment_method,
            'completed'::text AS status,
            e.user_id,
            e.organization_id,
            e.description,
            d.id AS document_id,
                CASE
                    WHEN (d.id IS NOT NULL) THEN true
                    ELSE false
                END AS has_pdf,
            e.banking_status,
            NULL::numeric AS provider_fee,
            NULL::numeric AS net_amount,
            NULL::uuid AS provider_report_id,
            false AS has_real_provider_fees,
            NULL::uuid AS customer_id,
            NULL::character varying(255) AS customer_name
           FROM (public.expenses e
             LEFT JOIN public.documents d ON (((d.reference_id = e.id) AND (d.type = 'expense_receipt'::text))))
        UNION ALL
         SELECT cm.id,
            'cash_movement'::text AS transaction_type,
            'CM'::text AS type_code,
            cm.movement_number AS receipt_number,
            cm.created_at AS transaction_date,
                CASE
                    WHEN (cm.type = 'cash_in'::text) THEN cm.amount
                    ELSE (- cm.amount)
                END AS amount,
            'cash'::text AS payment_method,
            'completed'::text AS status,
            cm.user_id,
            cm.organization_id,
            cm.description,
            NULL::uuid AS document_id,
            false AS has_pdf,
            cm.banking_status,
            NULL::numeric AS provider_fee,
            NULL::numeric AS net_amount,
            NULL::uuid AS provider_report_id,
            false AS has_real_provider_fees,
            NULL::uuid AS customer_id,
            NULL::character varying(255) AS customer_name
           FROM public.cash_movements cm
        UNION ALL
         SELECT bt.id,
            'bank_transaction'::text AS transaction_type,
            'BT'::text AS type_code,
            bt.transaction_number AS receipt_number,
            bt.created_at AS transaction_date,
            bt.amount,
            'bank'::text AS payment_method,
            bt.status,
            NULL::uuid AS user_id,
            bt.organization_id,
            bt.description,
            NULL::uuid AS document_id,
            false AS has_pdf,
            bt.status AS banking_status,
            NULL::numeric AS provider_fee,
            NULL::numeric AS net_amount,
            NULL::uuid AS provider_report_id,
            false AS has_real_provider_fees,
            NULL::uuid AS customer_id,
            NULL::character varying(255) AS customer_name
           FROM public.bank_transactions bt
        )
 SELECT tb.id,
    tb.transaction_type,
    tb.type_code,
    tb.receipt_number,
    tb.transaction_date,
    tb.amount,
    tb.payment_method,
    tb.status,
    tb.user_id,
    tb.organization_id,
    tb.description,
    tb.document_id,
    tb.has_pdf,
    tb.banking_status,
    date(tb.transaction_date) AS date_only,
    to_char(tb.transaction_date, 'HH24:MI'::text) AS time_only,
    lower(tb.description) AS description_lower,
    lower((tb.receipt_number)::text) AS receipt_number_lower,
    tb.provider_fee,
    tb.net_amount,
    tb.provider_report_id,
    tb.has_real_provider_fees,
    tb.customer_id,
    tb.customer_name
   FROM transaction_base tb
  ORDER BY tb.transaction_date DESC;

-- Unmatched bank transactions view (Banking reconciliation)
CREATE VIEW public.unmatched_bank_transactions AS
 SELECT bt.id,
    bt.bank_account_id,
    bt.transaction_date,
    bt.value_date AS booking_date,
    bt.amount,
    bt.description,
    bt.reference,
    bt.transaction_type AS transaction_code,
    NULL::uuid AS import_batch_id,
    bt.import_filename,
    bt.created_at AS import_date,
    bt.raw_data,
    bt.status,
    NULL::uuid AS user_id,
    bt.organization_id,
    bt.created_at,
    bt.created_at AS updated_at,
    NULL::text AS notes,
    ba.account_name AS bank_account_name,
        CASE
            WHEN (bt.amount > (0)::numeric) THEN '⬆️ Eingang'::text
            ELSE '⬇️ Ausgang'::text
        END AS direction_display,
    abs(bt.amount) AS amount_abs
   FROM (public.bank_transactions bt
     JOIN public.bank_accounts ba ON ((bt.bank_account_id = ba.id)))
  WHERE ((bt.status)::text = 'unmatched'::text)
  ORDER BY bt.transaction_date DESC;

-- Unmatched provider reports view (TWINT/SumUp reconciliation)
CREATE VIEW public.unmatched_provider_reports AS
 SELECT pr.id,
    pr.provider,
    pr.report_date AS transaction_date,
    pr.settlement_date,
    pr.gross_amount,
    pr.fees,
    pr.net_amount,
    NULL::character varying(255) AS provider_transaction_id,
    NULL::character varying(255) AS provider_reference,
    NULL::character varying(20) AS payment_method,
    pr.currency,
    pr.report_filename AS import_filename,
    pr.created_at AS import_date,
    pr.raw_data,
    pr.sale_id,
    pr.status,
    NULL::uuid AS user_id,
    pr.organization_id,
    pr.created_at,
    pr.created_at AS updated_at,
    NULL::text AS notes,
        CASE
            WHEN ((pr.provider)::text = 'twint'::text) THEN '🟦 TWINT'::character varying
            WHEN ((pr.provider)::text = 'sumup'::text) THEN '🟧 SumUp'::character varying
            ELSE pr.provider
        END AS provider_display
   FROM public.provider_reports pr
  WHERE ((pr.status)::text = 'unmatched'::text)
  ORDER BY pr.report_date DESC;

-- Unmatched sales for provider view (Sales reconciliation)
CREATE VIEW public.unmatched_sales_for_provider AS
 SELECT s.id,
    s.total_amount,
    s.payment_method,
    s.status,
    s.notes,
    s.user_id,
    s.organization_id,
    s.created_at,
    s.gross_amount,
    s.provider_fee,
    s.net_amount,
    s.settlement_status,
    s.settlement_date,
    s.provider_reference_id,
    s.provider_report_id,
    s.bank_transaction_id,
    s.banking_status,
        CASE s.payment_method
            WHEN 'twint'::text THEN '🟦 TWINT'::text
            WHEN 'sumup'::text THEN '🟧 SumUp'::text
            ELSE s.payment_method
        END AS payment_display
   FROM public.sales s
  WHERE ((s.payment_method = ANY (ARRAY['twint'::text, 'sumup'::text])) AND (s.provider_report_id IS NULL) AND ((s.banking_status)::text = 'unmatched'::text))
  ORDER BY s.created_at DESC;

-- Available transactions for bank matching view (Banking reconciliation)
CREATE VIEW public.available_for_bank_matching AS
 SELECT s.id,
    'sale'::text AS item_type,
    (s.created_at)::date AS date,
    pr.net_amount AS amount,
    concat('Sale #', s.id, ' (', pr.provider, ' net)') AS description,
    s.banking_status,
    s.organization_id
   FROM (public.sales s
     JOIN public.provider_reports pr ON ((s.provider_report_id = pr.id)))
  WHERE ((s.banking_status)::text = 'provider_matched'::text)
UNION ALL
 SELECT e.id,
    'expense'::text AS item_type,
    e.payment_date AS date,
    (- e.amount) AS amount,
    e.description,
    e.banking_status,
    e.organization_id
   FROM public.expenses e
  WHERE ((e.banking_status)::text = 'unmatched'::text)
UNION ALL
 SELECT cm.id,
    'cash_movement'::text AS item_type,
    (cm.created_at)::date AS date,
    cm.amount,
    concat('Cash Transfer: ', cm.description) AS description,
    cm.banking_status,
    cm.organization_id
   FROM public.cash_movements cm
  WHERE (((cm.banking_status)::text = 'unmatched'::text) AND ((cm.movement_type)::text = 'bank_transfer'::text))
UNION ALL
 SELECT ot.id,
    'owner_transaction'::text AS item_type,
    ot.transaction_date AS date,
        CASE ot.transaction_type
            WHEN 'deposit'::text THEN ot.amount
            WHEN 'withdrawal'::text THEN (- ot.amount)
            WHEN 'expense'::text THEN (- ot.amount)
            ELSE NULL::numeric
        END AS amount,
    concat('Owner ',
        CASE ot.transaction_type
            WHEN 'deposit'::text THEN 'Einlage'::text
            WHEN 'withdrawal'::text THEN 'Entnahme'::text
            WHEN 'expense'::text THEN 'Ausgabe'::text
            ELSE NULL::text
        END, ': ', ot.description) AS description,
    ot.banking_status,
    ot.organization_id
   FROM public.owner_transactions ot
  WHERE (((ot.payment_method)::text = 'bank_transfer'::text) AND ((ot.banking_status)::text = 'unmatched'::text))
  ORDER BY 3 DESC;

-- =====================================================
-- FRONTEND COMPATIBILITY FUNCTIONS
-- =====================================================

-- Frontend compatibility wrapper for get_owner_loan_balance
CREATE OR REPLACE FUNCTION public.get_owner_balance(user_uuid uuid) 
RETURNS numeric AS $$
BEGIN
    RETURN get_owner_loan_balance(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.bank_accounts IS 'Swiss bank account management with IBAN validation';
COMMENT ON TABLE public.bank_transactions IS 'CAMT.053 bank statement import and reconciliation';
COMMENT ON TABLE public.provider_reports IS 'TWINT/SumUp settlement integration';
COMMENT ON TABLE public.document_sequences IS 'Swiss compliance - sequential receipt/invoice numbering';
COMMENT ON TABLE public.daily_summaries IS 'Daily business closure and cash reconciliation';
COMMENT ON TABLE public.monthly_summaries IS 'Monthly financial reporting and analysis';
COMMENT ON TABLE public.bank_reconciliation_sessions IS 'Bank reconciliation workflow management';
COMMENT ON TABLE public.bank_reconciliation_matches IS 'Transaction matching and approval workflow';
COMMENT ON TABLE public.daily_closure_locks IS 'Prevent concurrent daily closure operations';

-- Views
COMMENT ON VIEW public.unified_transactions_view IS 'CRITICAL: Unified view of all financial transactions (sales, expenses, cash, bank) - required for transactions page';
COMMENT ON VIEW public.unmatched_bank_transactions IS 'Bank transactions awaiting reconciliation with sales/expenses';
COMMENT ON VIEW public.unmatched_provider_reports IS 'Provider reports (TWINT/SumUp) awaiting reconciliation with sales';
COMMENT ON VIEW public.unmatched_sales_for_provider IS 'Sales transactions awaiting provider reconciliation';
COMMENT ON VIEW public.available_for_bank_matching IS 'CRITICAL: Transactions ready for bank matching/reconciliation - required for banking page';

-- Functions
COMMENT ON FUNCTION public.get_owner_balance(uuid) IS 'CRITICAL: Frontend compatibility wrapper for get_owner_loan_balance - required for banking page';

COMMENT ON COLUMN public.bank_transactions.reference IS 'CAMT.053 transaction reference for matching';
COMMENT ON COLUMN public.provider_reports.provider IS 'TWINT or SumUp payment provider';
COMMENT ON COLUMN public.document_sequences.sequence_type IS 'Type: sale_receipt, expense_receipt, invoice, etc.';
COMMENT ON COLUMN public.daily_summaries.status IS 'Status: draft, closed, locked';
COMMENT ON COLUMN public.bank_reconciliation_matches.match_type IS 'Type: exact, fuzzy, manual';

COMMENT ON FUNCTION public.calculate_daily_summary(date) IS 'CRITICAL: Calculates daily business summary for closure workflow';
COMMENT ON FUNCTION public.calculate_monthly_summary(integer, integer) IS 'Calculates monthly financial summary from daily summaries';
COMMENT ON FUNCTION public.create_bank_reconciliation_session(integer, integer, text, integer, numeric, uuid) IS 'Creates bank reconciliation session for CAMT.053 processing';
COMMENT ON FUNCTION public.complete_bank_reconciliation_session(uuid, uuid) IS 'Completes bank reconciliation with statistics';
COMMENT ON FUNCTION public.execute_exact_matches() IS 'Finds exact amount matches between bank and provider transactions';
COMMENT ON FUNCTION public.check_duplicate_references(text[], uuid) IS 'Prevents duplicate CAMT.053 reference imports';
COMMENT ON FUNCTION public.check_file_already_imported(character varying, uuid) IS 'Prevents duplicate file imports';
COMMENT ON FUNCTION public.check_period_overlap(date, date, uuid) IS 'Checks for overlapping import periods';
COMMENT ON FUNCTION public.generate_document_number(text) IS 'Generates sequential Swiss-compliant document numbers';

-- =====================================================
-- END OF 03_banking_and_compliance_v6.sql (V6)
-- =====================================================
-- COMPLETE BANKING & COMPLIANCE DOMAIN: Banking + Swiss Compliance + Reconciliation + 5 Business VIEWs + 1 Frontend Function (V6)
-- BANKING PAGE FIXES: available_for_bank_matching VIEW + get_owner_balance function (17.08.2025)
-- Next: 04_automation_and_triggers_v6.sql (ALL triggers + auto-numbering functions)
-- =====================================================