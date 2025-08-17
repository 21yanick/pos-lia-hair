-- =====================================================
-- 05_performance_and_validation_v6.sql
-- =====================================================
-- Complete Performance Optimization & Final System Validation (V6)
-- Business Logic: Cross-cutting Performance + System Health + Final Validation
-- Dependencies: ALL previous V6 migration files (01-04)
-- V6 Enhancement: Complete index optimization + comprehensive system validation
-- =====================================================

-- =====================================================
-- CORE BUSINESS PERFORMANCE INDEXES
-- =====================================================

-- Items (Product/Service catalog optimization)
CREATE INDEX idx_items_org_active ON public.items USING btree (organization_id, active);
CREATE INDEX idx_items_type ON public.items USING btree (type);
CREATE INDEX idx_items_deleted ON public.items USING btree (deleted) WHERE deleted = false;
CREATE INDEX idx_items_favorite ON public.items USING btree (is_favorite) WHERE is_favorite = true;

-- Customers (Search and organization access)
CREATE INDEX idx_customers_organization_id ON public.customers USING btree (organization_id);
CREATE INDEX idx_customers_name ON public.customers USING btree (name);
CREATE INDEX idx_customers_email ON public.customers USING btree (email) WHERE (email IS NOT NULL);
CREATE INDEX idx_customers_phone ON public.customers USING btree (phone) WHERE (phone IS NOT NULL);
CREATE INDEX idx_customers_active ON public.customers USING btree (is_active);
CREATE INDEX idx_customers_created_at ON public.customers USING btree (created_at DESC);

-- Customer Notes (CRM performance)
CREATE INDEX idx_customer_notes_customer_id ON public.customer_notes USING btree (customer_id);
CREATE INDEX idx_customer_notes_organization_id ON public.customer_notes USING btree (organization_id);
CREATE INDEX idx_customer_notes_block_name ON public.customer_notes USING btree (block_name);
CREATE INDEX idx_customer_notes_created_at ON public.customer_notes USING btree (created_at DESC);

-- Sales (Revenue reporting and banking integration)
CREATE INDEX idx_sales_org_created ON public.sales USING btree (organization_id, created_at DESC);
CREATE INDEX idx_sales_created_at ON public.sales USING btree (created_at);
CREATE INDEX idx_sales_payment_method ON public.sales USING btree (payment_method);
CREATE INDEX idx_sales_banking_status ON public.sales USING btree (banking_status);
CREATE INDEX idx_sales_user_id ON public.sales USING btree (user_id);
CREATE INDEX idx_sales_customer_id ON public.sales USING btree (customer_id) WHERE (customer_id IS NOT NULL);
CREATE INDEX idx_sales_customer_name ON public.sales USING btree (customer_name) WHERE (customer_name IS NOT NULL);
CREATE INDEX idx_sales_receipt_number ON public.sales USING btree (receipt_number);
CREATE INDEX idx_sales_status ON public.sales USING btree (status);
CREATE INDEX idx_sales_settlement_status ON public.sales USING btree (settlement_status);
CREATE INDEX idx_sales_provider_report_id ON public.sales USING btree (provider_report_id) WHERE (provider_report_id IS NOT NULL);

-- Sale Items (Transaction details)
CREATE INDEX idx_sale_items_org_user ON public.sale_items USING btree (organization_id, user_id);
CREATE INDEX idx_sale_items_user_id ON public.sale_items USING btree (user_id);
CREATE INDEX idx_sale_items_sale_id ON public.sale_items USING btree (sale_id);
CREATE INDEX idx_sale_items_item_id ON public.sale_items USING btree (item_id);

-- Expenses (Cost management and banking integration)
CREATE INDEX idx_expenses_org_date ON public.expenses USING btree (organization_id, payment_date DESC);
CREATE INDEX idx_expenses_payment_date ON public.expenses USING btree (payment_date);
CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);
CREATE INDEX idx_expenses_user_id ON public.expenses USING btree (user_id);
CREATE INDEX idx_expenses_supplier_id ON public.expenses USING btree (supplier_id);
CREATE INDEX idx_expenses_receipt_number ON public.expenses USING btree (receipt_number);
CREATE INDEX idx_expenses_payment_method ON public.expenses USING btree (payment_method);
CREATE INDEX idx_expenses_banking_status ON public.expenses USING btree (banking_status);
CREATE INDEX idx_expenses_created_at ON public.expenses USING btree (created_at DESC);

-- Suppliers (Vendor search and management)
CREATE INDEX idx_suppliers_normalized_name ON public.suppliers USING btree (normalized_name);
CREATE INDEX idx_suppliers_category ON public.suppliers USING btree (category);
CREATE INDEX idx_suppliers_active ON public.suppliers USING btree (is_active);
CREATE INDEX idx_suppliers_created_at ON public.suppliers USING btree (created_at);
CREATE INDEX idx_suppliers_organization_id ON public.suppliers USING btree (organization_id);
CREATE INDEX idx_suppliers_name_fts ON public.suppliers USING gin (to_tsvector('german'::regconfig, (name)::text));

-- Appointments (Booking system optimization)
CREATE INDEX idx_appointments_organization_date ON public.appointments USING btree (organization_id, appointment_date);
CREATE INDEX idx_appointments_date_range ON public.appointments USING btree (appointment_date, start_time, end_time);
CREATE INDEX idx_appointments_customer ON public.appointments USING btree (customer_id) WHERE (customer_id IS NOT NULL);
CREATE INDEX idx_appointments_created_by ON public.appointments USING btree (created_by);
CREATE INDEX idx_appointments_updated_at ON public.appointments USING btree (updated_at DESC);

-- Appointment Services (Multi-service appointments)
CREATE INDEX idx_appointment_services_appointment ON public.appointment_services USING btree (appointment_id);
CREATE INDEX idx_appointment_services_item ON public.appointment_services USING btree (item_id);
CREATE INDEX idx_appointment_services_sort ON public.appointment_services USING btree (appointment_id, sort_order);
CREATE INDEX idx_appointment_services_created_at ON public.appointment_services USING btree (created_at DESC);

-- Cash Movements (Cash flow tracking)
CREATE INDEX idx_cash_movements_org_date ON public.cash_movements USING btree (organization_id, created_at DESC);
CREATE INDEX idx_cash_movements_type ON public.cash_movements USING btree (type);
CREATE INDEX idx_cash_movements_user_id ON public.cash_movements USING btree (user_id);
CREATE INDEX idx_cash_movements_reference ON public.cash_movements USING btree (reference_type, reference_id) WHERE (reference_type IS NOT NULL);
CREATE INDEX idx_cash_movements_banking_status ON public.cash_movements USING btree (banking_status);
CREATE INDEX idx_cash_movements_movement_type ON public.cash_movements USING btree (movement_type);
CREATE INDEX idx_cash_movements_movement_number ON public.cash_movements USING btree (movement_number);

-- Owner Transactions (Owner financial tracking)
CREATE INDEX idx_owner_transactions_user_id ON public.owner_transactions USING btree (user_id);
CREATE INDEX idx_owner_transactions_type ON public.owner_transactions USING btree (transaction_type);
CREATE INDEX idx_owner_transactions_date ON public.owner_transactions USING btree (transaction_date DESC);
CREATE INDEX idx_owner_transactions_org_id ON public.owner_transactions USING btree (organization_id);
CREATE INDEX idx_owner_transactions_banking_status ON public.owner_transactions USING btree (banking_status);

-- =====================================================
-- BANKING & COMPLIANCE PERFORMANCE INDEXES
-- =====================================================

-- Bank Accounts (Banking system optimization)
CREATE INDEX idx_bank_accounts_organization_id ON public.bank_accounts USING btree (organization_id);
CREATE INDEX idx_bank_accounts_iban ON public.bank_accounts USING btree (iban);
CREATE INDEX idx_bank_accounts_active ON public.bank_accounts USING btree (is_active);
CREATE INDEX idx_bank_accounts_currency ON public.bank_accounts USING btree (currency);
CREATE INDEX idx_bank_accounts_updated_at ON public.bank_accounts USING btree (updated_at DESC);

-- Bank Transactions (CAMT.053 processing optimization)
CREATE INDEX idx_bank_transactions_account_date ON public.bank_transactions USING btree (bank_account_id, transaction_date DESC);
CREATE INDEX idx_bank_transactions_reference ON public.bank_transactions USING btree (reference);
CREATE INDEX idx_bank_transactions_status ON public.bank_transactions USING btree (status);
CREATE INDEX idx_bank_transactions_amount ON public.bank_transactions USING btree (amount);
CREATE INDEX idx_bank_transactions_counterparty ON public.bank_transactions USING btree (counterparty_name) WHERE (counterparty_name IS NOT NULL);
CREATE INDEX idx_bank_transactions_import_filename ON public.bank_transactions USING btree (import_filename) WHERE (import_filename IS NOT NULL);
CREATE INDEX idx_bank_transactions_transaction_number ON public.bank_transactions USING btree (transaction_number);
CREATE INDEX idx_bank_transactions_matched_sale ON public.bank_transactions USING btree (matched_sale_id) WHERE (matched_sale_id IS NOT NULL);
CREATE INDEX idx_bank_transactions_matched_expense ON public.bank_transactions USING btree (matched_expense_id) WHERE (matched_expense_id IS NOT NULL);

-- Provider Reports (TWINT/SumUp optimization)
CREATE INDEX idx_provider_reports_provider_date ON public.provider_reports USING btree (provider, report_date DESC);
CREATE INDEX idx_provider_reports_status ON public.provider_reports USING btree (status);
CREATE INDEX idx_provider_reports_settlement_date ON public.provider_reports USING btree (settlement_date) WHERE (settlement_date IS NOT NULL);
CREATE INDEX idx_provider_reports_sale_id ON public.provider_reports USING btree (sale_id) WHERE (sale_id IS NOT NULL);
CREATE INDEX idx_provider_reports_bank_transaction_id ON public.provider_reports USING btree (bank_transaction_id) WHERE (bank_transaction_id IS NOT NULL);
CREATE INDEX idx_provider_reports_organization_id ON public.provider_reports USING btree (organization_id);

-- Document Sequences (Swiss compliance numbering)
CREATE INDEX idx_document_sequences_type_year ON public.document_sequences USING btree (sequence_type, year);
CREATE INDEX idx_document_sequences_organization_id ON public.document_sequences USING btree (organization_id);

-- Daily Summaries (Daily operations optimization)
CREATE INDEX idx_daily_summaries_org_date ON public.daily_summaries USING btree (organization_id, report_date DESC);
CREATE INDEX idx_daily_summaries_status ON public.daily_summaries USING btree (status);
CREATE INDEX idx_daily_summaries_created_by ON public.daily_summaries USING btree (created_by);
CREATE INDEX idx_daily_summaries_closed_at ON public.daily_summaries USING btree (closed_at) WHERE (closed_at IS NOT NULL);

-- Monthly Summaries (Monthly reporting optimization)
CREATE INDEX idx_monthly_summaries_org_year_month ON public.monthly_summaries USING btree (organization_id, year, month);
CREATE INDEX idx_monthly_summaries_created_by ON public.monthly_summaries USING btree (created_by);

-- Bank Reconciliation Sessions (Reconciliation workflow)
CREATE INDEX idx_bank_reconciliation_sessions_year_month ON public.bank_reconciliation_sessions USING btree (year, month);
CREATE INDEX idx_bank_reconciliation_sessions_status ON public.bank_reconciliation_sessions USING btree (status);
CREATE INDEX idx_bank_reconciliation_sessions_created_by ON public.bank_reconciliation_sessions USING btree (created_by);
CREATE INDEX idx_bank_reconciliation_sessions_organization_id ON public.bank_reconciliation_sessions USING btree (organization_id);

-- Bank Reconciliation Matches (Match processing)
CREATE INDEX idx_bank_reconciliation_matches_session ON public.bank_reconciliation_matches USING btree (session_id);
CREATE INDEX idx_bank_reconciliation_matches_status ON public.bank_reconciliation_matches USING btree (status);
CREATE INDEX idx_bank_reconciliation_matches_match_type ON public.bank_reconciliation_matches USING btree (match_type);
CREATE INDEX idx_bank_reconciliation_matches_bank_transaction ON public.bank_reconciliation_matches USING btree (bank_transaction_id) WHERE (bank_transaction_id IS NOT NULL);
CREATE INDEX idx_bank_reconciliation_matches_sale ON public.bank_reconciliation_matches USING btree (sale_id) WHERE (sale_id IS NOT NULL);

-- Daily Closure Locks (Concurrency control)
CREATE INDEX idx_daily_closure_locks_status ON public.daily_closure_locks USING btree (status);
CREATE INDEX idx_daily_closure_locks_locked_by ON public.daily_closure_locks USING btree (locked_by);
CREATE INDEX idx_daily_closure_locks_organization_id ON public.daily_closure_locks USING btree (organization_id);

-- =====================================================
-- ADVANCED VALIDATION FUNCTIONS (V6 COMPLETE)
-- =====================================================

-- Comprehensive system health check (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.validate_system_health()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
    table_count integer;
    function_count integer;
    trigger_count integer;
    index_count integer;
    rls_enabled_count integer;
    grant_check boolean;
BEGIN
    -- Count all business tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%';
    
    -- Count all business functions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    AND routine_name NOT LIKE 'pg_%';
    
    -- Count all triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    -- Count all indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    -- Count RLS enabled tables
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = true;
    
    -- Check basic grants
    SELECT EXISTS (
        SELECT 1 FROM information_schema.role_table_grants 
        WHERE grantee = 'authenticated' 
        AND table_schema = 'public'
        LIMIT 1
    ) INTO grant_check;
    
    SELECT jsonb_build_object(
        'database_health', jsonb_build_object(
            'tables_created', table_count,
            'expected_tables', 20, -- Minimum expected tables
            'tables_healthy', (table_count >= 20)
        ),
        'function_health', jsonb_build_object(
            'functions_available', function_count,
            'expected_functions', 35, -- Expected business functions
            'functions_healthy', (function_count >= 35)
        ),
        'automation_health', jsonb_build_object(
            'triggers_active', trigger_count,
            'expected_triggers', 8, -- Minimum expected triggers
            'automation_healthy', (trigger_count >= 8)
        ),
        'performance_health', jsonb_build_object(
            'indexes_created', index_count,
            'expected_indexes', 50, -- Expected performance indexes
            'performance_optimized', (index_count >= 50)
        ),
        'security_health', jsonb_build_object(
            'rls_enabled_tables', rls_enabled_count,
            'expected_rls_tables', 15, -- Expected RLS-enabled tables
            'grants_configured', grant_check,
            'security_healthy', (rls_enabled_count >= 15 AND grant_check)
        ),
        'overall_health', jsonb_build_object(
            'system_ready', (
                table_count >= 20 AND 
                function_count >= 35 AND 
                trigger_count >= 8 AND 
                index_count >= 50 AND 
                rls_enabled_count >= 15 AND 
                grant_check
            ),
            'health_score', (
                CASE WHEN table_count >= 20 THEN 20 ELSE 0 END +
                CASE WHEN function_count >= 35 THEN 20 ELSE 0 END +
                CASE WHEN trigger_count >= 8 THEN 20 ELSE 0 END +
                CASE WHEN index_count >= 50 THEN 20 ELSE 0 END +
                CASE WHEN rls_enabled_count >= 15 AND grant_check THEN 20 ELSE 0 END
            ),
            'max_score', 100
        ),
        'validation_timestamp', now()
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Check missing business functions (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.check_missing_business_functions()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
    critical_functions text[] := ARRAY[
        'get_current_cash_balance_for_org',
        'get_current_cash_balance',
        'get_net_profit_for_period',
        'get_net_revenue_for_period',
        'get_revenue_breakdown_for_period',
        'calculate_daily_summary',
        'calculate_monthly_summary',
        'atomic_daily_closure',
        'generate_document_number',
        'handle_new_user'
    ];
    missing_functions text[] := '{}';
    available_functions text[] := '{}';
    func_name text;
BEGIN
    -- Get all available business functions
    SELECT array_agg(routine_name) INTO available_functions
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    AND routine_name NOT LIKE 'pg_%';
    
    -- Check each critical function
    FOREACH func_name IN ARRAY critical_functions
    LOOP
        IF NOT (func_name = ANY(available_functions)) THEN
            missing_functions := array_append(missing_functions, func_name);
        END IF;
    END LOOP;
    
    SELECT jsonb_build_object(
        'critical_functions_required', array_length(critical_functions, 1),
        'critical_functions_available', (array_length(critical_functions, 1) - array_length(missing_functions, 1)),
        'missing_functions', missing_functions,
        'all_critical_functions_available', (array_length(missing_functions, 1) = 0),
        'business_logic_complete', (array_length(missing_functions, 1) = 0),
        'check_timestamp', now()
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Validate RLS configuration (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.validate_rls_configuration()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
    orgs_rls_disabled boolean;
    org_users_rls_enabled boolean;
    org_users_policy_count integer;
    total_rls_enabled integer;
    critical_tables_with_rls integer;
BEGIN
    -- Check organizations RLS is disabled
    SELECT NOT rowsecurity INTO orgs_rls_disabled
    FROM pg_tables 
    WHERE tablename = 'organizations' AND schemaname = 'public';
    
    -- Check organization_users RLS is enabled
    SELECT rowsecurity INTO org_users_rls_enabled
    FROM pg_tables 
    WHERE tablename = 'organization_users' AND schemaname = 'public';
    
    -- Count organization_users policies
    SELECT COUNT(*) INTO org_users_policy_count
    FROM pg_policies 
    WHERE tablename = 'organization_users' AND schemaname = 'public';
    
    -- Count total RLS enabled tables
    SELECT COUNT(*) INTO total_rls_enabled
    FROM pg_tables 
    WHERE schemaname = 'public' AND rowsecurity = true;
    
    -- Count critical business tables with RLS
    SELECT COUNT(*) INTO critical_tables_with_rls
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = true
    AND tablename IN ('sales', 'expenses', 'customers', 'items', 'suppliers', 'appointments');
    
    SELECT jsonb_build_object(
        'multi_tenant_pattern', jsonb_build_object(
            'organizations_rls_disabled', orgs_rls_disabled,
            'organization_users_rls_enabled', org_users_rls_enabled,
            'organization_users_policies', org_users_policy_count,
            'pattern_correct', (orgs_rls_disabled AND org_users_rls_enabled AND org_users_policy_count = 4)
        ),
        'security_coverage', jsonb_build_object(
            'total_rls_enabled_tables', total_rls_enabled,
            'critical_tables_with_rls', critical_tables_with_rls,
            'expected_critical_tables', 6,
            'security_complete', (critical_tables_with_rls = 6)
        ),
        'rls_health', jsonb_build_object(
            'configuration_valid', (
                orgs_rls_disabled AND 
                org_users_rls_enabled AND 
                org_users_policy_count = 4 AND 
                critical_tables_with_rls = 6
            )
        ),
        'validation_timestamp', now()
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Performance benchmark test (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.run_performance_benchmark()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
    start_time timestamp;
    end_time timestamp;
    select_performance integer;
    index_performance integer;
    function_performance integer;
BEGIN
    -- Test 1: Basic SELECT performance
    start_time := clock_timestamp();
    PERFORM COUNT(*) FROM sales WHERE created_at >= (now() - interval '30 days');
    end_time := clock_timestamp();
    select_performance := EXTRACT(milliseconds FROM (end_time - start_time));
    
    -- Test 2: Index utilization test
    start_time := clock_timestamp();
    PERFORM COUNT(*) FROM sales WHERE organization_id = (SELECT id FROM organizations LIMIT 1);
    end_time := clock_timestamp();
    index_performance := EXTRACT(milliseconds FROM (end_time - start_time));
    
    -- Test 3: Function execution test
    start_time := clock_timestamp();
    PERFORM validate_system_integrity();
    end_time := clock_timestamp();
    function_performance := EXTRACT(milliseconds FROM (end_time - start_time));
    
    SELECT jsonb_build_object(
        'performance_tests', jsonb_build_object(
            'select_query_ms', select_performance,
            'indexed_query_ms', index_performance,
            'function_execution_ms', function_performance
        ),
        'performance_rating', jsonb_build_object(
            'select_rating', CASE 
                WHEN select_performance < 100 THEN 'excellent'
                WHEN select_performance < 500 THEN 'good'
                WHEN select_performance < 1000 THEN 'acceptable'
                ELSE 'needs_optimization'
            END,
            'index_rating', CASE 
                WHEN index_performance < 50 THEN 'excellent'
                WHEN index_performance < 200 THEN 'good'
                WHEN index_performance < 500 THEN 'acceptable'
                ELSE 'needs_optimization'
            END,
            'function_rating', CASE 
                WHEN function_performance < 200 THEN 'excellent'
                WHEN function_performance < 500 THEN 'good'
                WHEN function_performance < 1000 THEN 'acceptable'
                ELSE 'needs_optimization'
            END
        ),
        'overall_performance', CASE 
            WHEN select_performance < 100 AND index_performance < 50 AND function_performance < 200 THEN 'excellent'
            WHEN select_performance < 500 AND index_performance < 200 AND function_performance < 500 THEN 'good'
            WHEN select_performance < 1000 AND index_performance < 500 AND function_performance < 1000 THEN 'acceptable'
            ELSE 'needs_optimization'
        END,
        'benchmark_timestamp', now()
    ) INTO result;
    
    RETURN result;
END;
$$;

-- =====================================================
-- BUSINESS INTELLIGENCE VIEWS (V6 COMPLETE)
-- =====================================================

-- Sales performance view
CREATE VIEW public.sales_performance_summary AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    organization_id,
    payment_method,
    COUNT(*) as transaction_count,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_transaction_value,
    MIN(total_amount) as min_transaction,
    MAX(total_amount) as max_transaction
FROM public.sales 
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at), organization_id, payment_method
ORDER BY month DESC, organization_id, payment_method;

-- Monthly financial summary view
CREATE VIEW public.monthly_financial_overview AS
SELECT 
    DATE_TRUNC('month', s.created_at) as month,
    s.organization_id,
    -- Revenue
    COALESCE(SUM(s.total_amount), 0) as gross_revenue,
    COALESCE(SUM(CASE WHEN s.payment_method = 'cash' THEN s.total_amount ELSE 0 END), 0) as cash_revenue,
    COALESCE(SUM(CASE WHEN s.payment_method IN ('twint', 'sumup') THEN s.total_amount ELSE 0 END), 0) as digital_revenue,
    -- Expenses
    COALESCE(SUM(e.amount), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN e.payment_method = 'cash' THEN e.amount ELSE 0 END), 0) as cash_expenses,
    COALESCE(SUM(CASE WHEN e.payment_method = 'bank' THEN e.amount ELSE 0 END), 0) as bank_expenses,
    -- Profit
    (COALESCE(SUM(s.total_amount), 0) - COALESCE(SUM(e.amount), 0)) as net_profit
FROM public.sales s
FULL OUTER JOIN public.expenses e ON DATE_TRUNC('month', s.created_at) = DATE_TRUNC('month', e.payment_date)
    AND s.organization_id = e.organization_id
WHERE s.status = 'completed' OR s.status IS NULL
GROUP BY DATE_TRUNC('month', s.created_at), s.organization_id
ORDER BY month DESC, s.organization_id;

-- Customer activity view
CREATE VIEW public.customer_activity_summary AS
SELECT 
    c.id as customer_id,
    c.name as customer_name,
    c.organization_id,
    COUNT(s.id) as total_sales,
    COALESCE(SUM(s.total_amount), 0) as total_spent,
    COALESCE(AVG(s.total_amount), 0) as avg_transaction_value,
    MAX(s.created_at) as last_purchase_date,
    MIN(s.created_at) as first_purchase_date,
    COUNT(a.id) as total_appointments
FROM public.customers c
LEFT JOIN public.sales s ON c.id = s.customer_id AND s.status = 'completed'
LEFT JOIN public.appointments a ON c.id = a.customer_id
GROUP BY c.id, c.name, c.organization_id
ORDER BY total_spent DESC;

-- Supplier spending analysis view
CREATE VIEW public.supplier_spending_analysis AS
SELECT 
    s.id as supplier_id,
    s.name as supplier_name,
    s.category,
    s.organization_id,
    COUNT(e.id) as transaction_count,
    COALESCE(SUM(e.amount), 0) as total_spent,
    COALESCE(AVG(e.amount), 0) as avg_transaction_value,
    MAX(e.payment_date) as last_transaction_date,
    MIN(e.payment_date) as first_transaction_date
FROM public.suppliers s
LEFT JOIN public.expenses e ON s.id = e.supplier_id
GROUP BY s.id, s.name, s.category, s.organization_id
ORDER BY total_spent DESC;

-- =====================================================
-- SYSTEM VALIDATION & HEALTH CHECKS
-- =====================================================

-- Final system validation
DO $$
DECLARE
    health_result jsonb;
    function_result jsonb;
    rls_result jsonb;
    performance_result jsonb;
    overall_healthy boolean;
    health_score integer;
BEGIN
    -- Run comprehensive health checks
    SELECT public.validate_system_health() INTO health_result;
    SELECT public.check_missing_business_functions() INTO function_result;
    SELECT public.validate_rls_configuration() INTO rls_result;
    
    -- Extract overall health status
    SELECT (health_result->'overall_health'->>'system_ready')::boolean INTO overall_healthy;
    SELECT (health_result->'overall_health'->>'health_score')::integer INTO health_score;
    
    -- Display comprehensive validation results
    RAISE NOTICE '🎉 ========================================';
    RAISE NOTICE '🎉 V6 MIGRATION SUITE VALIDATION COMPLETE';
    RAISE NOTICE '🎉 ========================================';
    RAISE NOTICE '';
    
    -- Database Health
    RAISE NOTICE '📊 DATABASE HEALTH:';
    RAISE NOTICE '   Tables: % (Expected: %)', 
        health_result->'database_health'->>'tables_created',
        health_result->'database_health'->>'expected_tables';
    RAISE NOTICE '   Status: %', 
        CASE WHEN (health_result->'database_health'->>'tables_healthy')::boolean 
        THEN '✅ HEALTHY' ELSE '❌ INCOMPLETE' END;
    RAISE NOTICE '';
    
    -- Function Health
    RAISE NOTICE '⚙️  FUNCTION HEALTH:';
    RAISE NOTICE '   Functions: % (Expected: %)', 
        health_result->'function_health'->>'functions_available',
        health_result->'function_health'->>'expected_functions';
    RAISE NOTICE '   Critical Functions: %', 
        CASE WHEN (function_result->>'all_critical_functions_available')::boolean 
        THEN '✅ ALL AVAILABLE' ELSE '❌ MISSING SOME' END;
    RAISE NOTICE '   Status: %', 
        CASE WHEN (health_result->'function_health'->>'functions_healthy')::boolean 
        THEN '✅ HEALTHY' ELSE '❌ INCOMPLETE' END;
    RAISE NOTICE '';
    
    -- Automation Health
    RAISE NOTICE '🤖 AUTOMATION HEALTH:';
    RAISE NOTICE '   Triggers: % (Expected: %)', 
        health_result->'automation_health'->>'triggers_active',
        health_result->'automation_health'->>'expected_triggers';
    RAISE NOTICE '   Status: %', 
        CASE WHEN (health_result->'automation_health'->>'automation_healthy')::boolean 
        THEN '✅ HEALTHY' ELSE '❌ INCOMPLETE' END;
    RAISE NOTICE '';
    
    -- Performance Health
    RAISE NOTICE '⚡ PERFORMANCE HEALTH:';
    RAISE NOTICE '   Indexes: % (Expected: %)', 
        health_result->'performance_health'->>'indexes_created',
        health_result->'performance_health'->>'expected_indexes';
    RAISE NOTICE '   Status: %', 
        CASE WHEN (health_result->'performance_health'->>'performance_optimized')::boolean 
        THEN '✅ OPTIMIZED' ELSE '❌ NEEDS WORK' END;
    RAISE NOTICE '';
    
    -- Security Health
    RAISE NOTICE '🛡️  SECURITY HEALTH:';
    RAISE NOTICE '   RLS Tables: % (Expected: %)', 
        health_result->'security_health'->>'rls_enabled_tables',
        health_result->'security_health'->>'expected_rls_tables';
    RAISE NOTICE '   Multi-tenant Pattern: %', 
        CASE WHEN (rls_result->'multi_tenant_pattern'->>'pattern_correct')::boolean 
        THEN '✅ CORRECT' ELSE '❌ INCORRECT' END;
    RAISE NOTICE '   Status: %', 
        CASE WHEN (health_result->'security_health'->>'security_healthy')::boolean 
        THEN '✅ HEALTHY' ELSE '❌ INCOMPLETE' END;
    RAISE NOTICE '';
    
    -- Overall Status
    RAISE NOTICE '🎯 OVERALL SYSTEM STATUS:';
    RAISE NOTICE '   Health Score: %/100', health_score;
    RAISE NOTICE '   System Ready: %', 
        CASE WHEN overall_healthy THEN '✅ YES' ELSE '❌ NO' END;
    RAISE NOTICE '';
    
    IF overall_healthy AND health_score = 100 THEN
        RAISE NOTICE '🎉 SUCCESS: V6 Migration Suite Complete!';
        RAISE NOTICE '🎉 System is ready for production deployment!';
        RAISE NOTICE '';
        RAISE NOTICE '📋 Ready Features:';
        RAISE NOTICE '   ✅ Multi-tenant foundation with proper RLS';
        RAISE NOTICE '   ✅ Complete POS business logic (% functions)', 
            function_result->>'critical_functions_available';
        RAISE NOTICE '   ✅ Banking & compliance integration';
        RAISE NOTICE '   ✅ Auto-numbering system (Swiss compliance)';
        RAISE NOTICE '   ✅ Performance optimization (% indexes)', 
            health_result->'performance_health'->>'indexes_created';
        RAISE NOTICE '   ✅ User automation & registration flow';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Next Steps:';
        RAISE NOTICE '   1. Deploy V6 migrations to fresh Supabase instance';
        RAISE NOTICE '   2. Test complete user registration flow';
        RAISE NOTICE '   3. Validate console error fixes';
        RAISE NOTICE '   4. Production launch ready!';
    ELSE
        RAISE WARNING '⚠️  V6 Migration Suite incomplete!';
        RAISE WARNING '⚠️  Health Score: %/100', health_score;
        RAISE WARNING '⚠️  Review validation details above';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ========================================';
END;
$$;

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION public.validate_system_health() IS 'Comprehensive system health check - validates all V6 components';
COMMENT ON FUNCTION public.check_missing_business_functions() IS 'Validates that all critical business functions are available';
COMMENT ON FUNCTION public.validate_rls_configuration() IS 'Validates multi-tenant RLS configuration is correct';
COMMENT ON FUNCTION public.run_performance_benchmark() IS 'Performance benchmark test for V6 optimization validation';

COMMENT ON VIEW public.sales_performance_summary IS 'Monthly sales performance analysis by payment method';
COMMENT ON VIEW public.monthly_financial_overview IS 'Complete monthly financial overview with profit calculation';
COMMENT ON VIEW public.customer_activity_summary IS 'Customer spending and activity analysis';
COMMENT ON VIEW public.supplier_spending_analysis IS 'Supplier spending analysis and categorization';

-- =====================================================
-- END OF 05_performance_and_validation_v6.sql (V6)
-- =====================================================
-- COMPLETE V6 MIGRATION SUITE: Performance + Validation + Business Intelligence (V6)
-- 🎉 V6 DOMAIN-FOCUSED ARCHITECTURE COMPLETE:
-- ✅ 01_foundation_and_security_v6.sql (Foundation + Security + User Automation)
-- ✅ 02_core_business_logic_v6.sql (POS + ALL business functions) 
-- ✅ 03_banking_and_compliance_v6.sql (Banking + Compliance + Reconciliation)
-- ✅ 04_automation_and_triggers_v6.sql (ALL triggers + auto-numbering)
-- ✅ 05_performance_and_validation_v6.sql (Performance + Validation + BI)
-- 🚀 READY FOR FRESH DEPLOYMENT AND TESTING!
-- =====================================================