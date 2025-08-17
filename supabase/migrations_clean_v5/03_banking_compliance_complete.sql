-- =====================================================
-- 03_banking_compliance_complete.sql
-- =====================================================
-- Complete Banking + Compliance Domain (V5 - Self-Contained)
-- Source: production-schema-current-20250815-1855.sql
-- Business Logic: Swiss Banking + Legal Compliance (Self-Contained)
-- Dependencies: 01_multi_tenant_foundation.sql, 02_pos_business_complete.sql
-- =====================================================

-- =====================================================
-- SWISS BANKING TABLES (CAMT.053 & PROVIDER INTEGRATION)
-- =====================================================

-- Bank Accounts (IBAN Management)
CREATE TABLE public.bank_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    bank_name character varying(50) NOT NULL,
    iban character varying(34),
    account_number character varying(50),
    current_balance numeric(12,2) DEFAULT 0.00,
    last_statement_date date,
    is_active boolean DEFAULT true,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    notes text,
    organization_id uuid
);

-- Bank Import Sessions (CAMT.053 Import Audit Trail)
CREATE TABLE public.bank_import_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bank_account_id uuid NOT NULL,
    import_filename character varying(255) NOT NULL,
    import_type character varying(20) DEFAULT 'camt053'::character varying,
    total_entries integer NOT NULL,
    new_entries integer NOT NULL,
    duplicate_entries integer NOT NULL,
    error_entries integer NOT NULL,
    statement_from_date date,
    statement_to_date date,
    status character varying(20) DEFAULT 'completed'::character varying,
    imported_by uuid,
    imported_at timestamp with time zone DEFAULT now(),
    notes text,
    organization_id uuid,
    CONSTRAINT bank_import_sessions_import_type_check CHECK (((import_type)::text = ANY (ARRAY[('camt053'::character varying)::text, ('csv'::character varying)::text]))),
    CONSTRAINT bank_import_sessions_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('completed'::character varying)::text, ('failed'::character varying)::text])))
);

-- Bank Transactions (Swiss Banking Standard CAMT.053)
CREATE TABLE public.bank_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bank_account_id uuid NOT NULL,
    transaction_date date NOT NULL,
    booking_date date,
    amount numeric(12,2) NOT NULL,
    description text NOT NULL,
    reference character varying(255),
    transaction_code character varying(20),
    import_batch_id uuid,
    import_filename character varying(255),
    import_date timestamp with time zone DEFAULT now(),
    raw_data jsonb,
    status character varying(20) DEFAULT 'unmatched'::character varying,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    notes text,
    transaction_number character varying(20),
    organization_id uuid,
    CONSTRAINT bank_transactions_status_check CHECK (((status)::text = ANY (ARRAY[('unmatched'::character varying)::text, ('matched'::character varying)::text, ('ignored'::character varying)::text])))
);

-- Provider Reports (TWINT/SumUp Settlement Tracking)
CREATE TABLE public.provider_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider character varying(20) NOT NULL,
    transaction_date date NOT NULL,
    settlement_date date,
    gross_amount numeric(10,2) NOT NULL,
    fees numeric(10,2) DEFAULT 0.00 NOT NULL,
    net_amount numeric(10,2) NOT NULL,
    provider_transaction_id character varying(100),
    provider_reference character varying(255),
    payment_method character varying(50),
    currency character varying(3) DEFAULT 'CHF'::character varying,
    import_filename character varying(255) NOT NULL,
    import_date timestamp with time zone DEFAULT now(),
    raw_data jsonb,
    sale_id uuid,
    status character varying(20) DEFAULT 'unmatched'::character varying,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    notes text,
    organization_id uuid,
    CONSTRAINT provider_reports_provider_check CHECK (((provider)::text = ANY (ARRAY[('twint'::character varying)::text, ('sumup'::character varying)::text]))),
    CONSTRAINT provider_reports_status_check CHECK (((status)::text = ANY (ARRAY[('unmatched'::character varying)::text, ('matched'::character varying)::text, ('discrepancy'::character varying)::text])))
);

-- Provider Import Sessions (Provider Import Management)
CREATE TABLE public.provider_import_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider character varying(20) NOT NULL,
    filename character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    imported_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    import_type character varying(20) DEFAULT 'csv'::character varying,
    total_records integer DEFAULT 0,
    new_records integer DEFAULT 0,
    duplicate_records integer DEFAULT 0,
    error_records integer DEFAULT 0,
    date_range_from date,
    date_range_to date,
    completed_at timestamp with time zone,
    notes text,
    records_imported integer DEFAULT 0,
    records_failed integer DEFAULT 0,
    organization_id uuid
);

-- Transaction Matches (3-Way Reconciliation)
CREATE TABLE public.transaction_matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bank_transaction_id uuid NOT NULL,
    matched_type character varying(20) NOT NULL,
    matched_id uuid NOT NULL,
    matched_amount numeric(10,2) NOT NULL,
    match_confidence numeric(5,2) DEFAULT 0.00,
    match_type character varying(20) DEFAULT 'manual'::character varying,
    matched_by uuid,
    matched_at timestamp with time zone DEFAULT now(),
    notes text,
    organization_id uuid,
    CONSTRAINT transaction_matches_match_type_check CHECK (((match_type)::text = ANY (ARRAY[('automatic'::character varying)::text, ('manual'::character varying)::text, ('suggested'::character varying)::text]))),
    CONSTRAINT transaction_matches_matched_type_check CHECK (((matched_type)::text = ANY (ARRAY[('sale'::character varying)::text, ('expense'::character varying)::text, ('provider_batch'::character varying)::text, ('cash_movement'::character varying)::text, ('owner_transaction'::character varying)::text])))
);

-- Cash Movements (Cash Flow Tracking)
CREATE TABLE public.cash_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    amount numeric(10,2) NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    reference_type text,
    reference_id uuid,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    bank_transaction_id uuid,
    banking_status character varying(20) DEFAULT 'unmatched'::character varying,
    movement_type character varying(20) DEFAULT 'cash_operation'::character varying,
    movement_number character varying(20),
    organization_id uuid,
    CONSTRAINT cash_movements_banking_status_check CHECK (((banking_status)::text = ANY (ARRAY[('unmatched'::character varying)::text, ('matched'::character varying)::text]))),
    CONSTRAINT cash_movements_movement_type_check CHECK (((movement_type)::text = ANY (ARRAY[('cash_operation'::character varying)::text, ('bank_transfer'::character varying)::text]))),
    CONSTRAINT cash_movements_reference_type_check CHECK ((reference_type = ANY (ARRAY['sale'::text, 'expense'::text, 'adjustment'::text, 'owner_transaction'::text]))),
    CONSTRAINT cash_movements_type_check CHECK ((type = ANY (ARRAY['cash_in'::text, 'cash_out'::text])))
);

-- Owner Transactions (Owner Draws/Investments)
CREATE TABLE public.owner_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_type character varying(20) NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text NOT NULL,
    transaction_date date NOT NULL,
    payment_method character varying(20) NOT NULL,
    related_expense_id uuid,
    related_bank_transaction_id uuid,
    banking_status character varying(20) DEFAULT 'unmatched'::character varying,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    notes text,
    organization_id uuid,
    CONSTRAINT owner_transactions_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT owner_transactions_banking_status_check CHECK (((banking_status)::text = ANY (ARRAY[('unmatched'::character varying)::text, ('matched'::character varying)::text]))),
    CONSTRAINT owner_transactions_payment_method_check CHECK (((payment_method)::text = ANY (ARRAY[('bank_transfer'::character varying)::text, ('private_card'::character varying)::text, ('private_cash'::character varying)::text]))),
    CONSTRAINT owner_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY (ARRAY[('deposit'::character varying)::text, ('expense'::character varying)::text, ('withdrawal'::character varying)::text])))
);

-- Document Sequences (Swiss Receipt Numbering VK2025000123)
CREATE TABLE public.document_sequences (
    type character varying(20) NOT NULL,
    current_number integer DEFAULT 0 NOT NULL,
    prefix character varying(10) NOT NULL,
    format character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- SWISS COMPLIANCE TABLES (10-YEAR LEGAL REQUIREMENTS)
-- =====================================================

-- Audit Log (10-Year Swiss Compliance Trail)
CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    action text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    user_id uuid NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now(),
    ip_address inet,
    session_id text,
    is_immutable boolean DEFAULT true,
    CONSTRAINT audit_log_action_check CHECK ((action = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

-- Daily Summaries (Swiss Daily Closure Legal Requirement)
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
    cash_starting numeric(10,2) DEFAULT 0 NOT NULL,
    cash_ending numeric(10,2) DEFAULT 0 NOT NULL,
    cash_difference numeric(10,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    notes text,
    created_by uuid,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    closed_at timestamp with time zone,
    organization_id uuid,
    CONSTRAINT daily_summaries_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'closed'::text])))
);

-- Documents (PDF Storage - Legal 10-Year Requirement)
CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    reference_id uuid NOT NULL,
    file_path text NOT NULL,
    payment_method text,
    document_date date NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    file_name text,
    file_size integer,
    mime_type text DEFAULT 'application/pdf'::text,
    reference_type text,
    notes text,
    document_number character varying(20),
    organization_id uuid,
    CONSTRAINT documents_payment_method_check CHECK ((payment_method = ANY (ARRAY['cash'::text, 'twint'::text, 'sumup'::text, 'bank'::text]))),
    CONSTRAINT documents_reference_type_check CHECK ((reference_type = ANY (ARRAY['sale'::text, 'expense'::text, 'report'::text]))),
    CONSTRAINT documents_type_check CHECK ((type = ANY (ARRAY['receipt'::text, 'daily_report'::text, 'monthly_report'::text, 'yearly_report'::text, 'expense_receipt'::text])))
);

-- Monthly Summaries (Monthly Tax Reporting)
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
    avg_daily_revenue numeric(10,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    notes text,
    created_by uuid,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    closed_at timestamp with time zone,
    organization_id uuid,
    CONSTRAINT monthly_summaries_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'closed'::text])))
);

-- =====================================================
-- PRIMARY KEYS & UNIQUE CONSTRAINTS
-- =====================================================

-- Banking Tables
ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_pkey PRIMARY KEY (type);

-- Compliance Tables
ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_pkey PRIMARY KEY (id);

-- =====================================================
-- FOREIGN KEY RELATIONSHIPS
-- =====================================================

-- Banking Foreign Keys
ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_bank_account_id_fkey 
    FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_imported_by_fkey 
    FOREIGN KEY (imported_by) REFERENCES auth.users(id);

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_bank_account_id_fkey 
    FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_sale_id_fkey 
    FOREIGN KEY (sale_id) REFERENCES public.sales(id);

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_imported_by_fkey 
    FOREIGN KEY (imported_by) REFERENCES auth.users(id);

ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_bank_transaction_id_fkey 
    FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_matched_by_fkey 
    FOREIGN KEY (matched_by) REFERENCES auth.users(id);

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_bank_transaction_id_fkey 
    FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_related_bank_transaction_id_fkey 
    FOREIGN KEY (related_bank_transaction_id) REFERENCES public.bank_transactions(id);

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_related_expense_id_fkey 
    FOREIGN KEY (related_expense_id) REFERENCES public.expenses(id);

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Compliance Foreign Keys
ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Cross-Domain Foreign Keys (Banking ↔ POS Integration)
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_bank_transaction_id_fkey 
    FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_provider_report_id_fkey 
    FOREIGN KEY (provider_report_id) REFERENCES public.provider_reports(id);

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_bank_transaction_id_fkey 
    FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);

-- =====================================================
-- BUSINESS INTELLIGENCE VIEWS (UTF-8 ENCODING FIXED)
-- =====================================================

-- Unified Transactions View (Core Business Intelligence)
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
            bt.user_id,
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

-- Unmatched Bank Transactions View (Banking Reconciliation) - UTF-8 FIXED
CREATE VIEW public.unmatched_bank_transactions AS
 SELECT bt.id,
    bt.bank_account_id,
    bt.transaction_date,
    bt.booking_date,
    bt.amount,
    bt.description,
    bt.reference,
    bt.transaction_code,
    bt.import_batch_id,
    bt.import_filename,
    bt.import_date,
    bt.raw_data,
    bt.status,
    bt.user_id,
    bt.organization_id,
    bt.created_at,
    bt.updated_at,
    bt.notes,
    ba.name AS bank_account_name,
        CASE
            WHEN (bt.amount > (0)::numeric) THEN 'Eingang'::text
            ELSE 'Ausgang'::text
        END AS direction_display,
    abs(bt.amount) AS amount_abs
   FROM (public.bank_transactions bt
     JOIN public.bank_accounts ba ON ((bt.bank_account_id = ba.id)))
  WHERE ((bt.status)::text = 'unmatched'::text)
  ORDER BY bt.transaction_date DESC;

-- Unmatched Provider Reports View (Provider Reconciliation) - UTF-8 FIXED  
CREATE VIEW public.unmatched_provider_reports AS
 SELECT pr.id,
    pr.provider,
    pr.transaction_date,
    pr.settlement_date,
    pr.gross_amount,
    pr.fees,
    pr.net_amount,
    pr.provider_transaction_id,
    pr.provider_reference,
    pr.payment_method,
    pr.currency,
    pr.import_filename,
    pr.import_date,
    pr.raw_data,
    pr.sale_id,
    pr.status,
    pr.user_id,
    pr.organization_id,
    pr.created_at,
    pr.updated_at,
    pr.notes,
        CASE
            WHEN ((pr.provider)::text = 'twint'::text) THEN 'TWINT'::character varying
            WHEN ((pr.provider)::text = 'sumup'::text) THEN 'SumUp'::character varying
            ELSE pr.provider
        END AS provider_display
   FROM public.provider_reports pr
  WHERE ((pr.status)::text = 'unmatched'::text)
  ORDER BY pr.transaction_date DESC;

-- Unmatched Sales for Provider View (Sales Matching) - UTF-8 FIXED
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
            WHEN 'twint'::text THEN 'TWINT'::text
            WHEN 'sumup'::text THEN 'SumUp'::text
            ELSE s.payment_method
        END AS payment_display
   FROM public.sales s
  WHERE ((s.payment_method = ANY (ARRAY['twint'::text, 'sumup'::text])) AND (s.provider_report_id IS NULL) AND ((s.banking_status)::text = 'unmatched'::text))
  ORDER BY s.created_at DESC;

-- =====================================================
-- PERFORMANCE INDEXES (SWISS BANKING + COMPLIANCE)
-- =====================================================

-- Bank Accounts (IBAN management and organization access)
CREATE INDEX idx_bank_accounts_iban ON public.bank_accounts USING btree (iban);
CREATE INDEX idx_bank_accounts_org_active ON public.bank_accounts USING btree (organization_id, is_active);
CREATE INDEX idx_bank_accounts_user_active ON public.bank_accounts USING btree (user_id, is_active);

-- Bank Import Sessions (CAMT.053 import tracking)
CREATE INDEX idx_bank_import_sessions_account ON public.bank_import_sessions USING btree (bank_account_id);
CREATE INDEX idx_bank_import_sessions_date ON public.bank_import_sessions USING btree (imported_at);
CREATE INDEX idx_bank_import_sessions_filename ON public.bank_import_sessions USING btree (import_filename);

-- Bank Transactions (Swiss banking performance)
CREATE INDEX idx_bank_transactions_account_date ON public.bank_transactions USING btree (bank_account_id, transaction_date);
CREATE INDEX idx_bank_transactions_amount ON public.bank_transactions USING btree (amount);
CREATE INDEX idx_bank_transactions_booking_date ON public.bank_transactions USING btree (booking_date);
CREATE INDEX idx_bank_transactions_import_batch ON public.bank_transactions USING btree (import_batch_id);
CREATE INDEX idx_bank_transactions_import_filename ON public.bank_transactions USING btree (import_filename);
CREATE INDEX idx_bank_transactions_number ON public.bank_transactions USING btree (transaction_number);
CREATE INDEX idx_bank_transactions_reference ON public.bank_transactions USING btree (reference);
CREATE INDEX idx_bank_transactions_status ON public.bank_transactions USING btree (status);
CREATE INDEX idx_bank_transactions_status_date ON public.bank_transactions USING btree (status, transaction_date);

-- Provider Reports (TWINT/SumUp settlement optimization)
CREATE INDEX idx_provider_reports_import_date ON public.provider_reports USING btree (import_date);
CREATE INDEX idx_provider_reports_provider_status ON public.provider_reports USING btree (provider, status);
CREATE INDEX idx_provider_reports_sale_id ON public.provider_reports USING btree (sale_id);
CREATE INDEX idx_provider_reports_transaction_date ON public.provider_reports USING btree (transaction_date);

-- Transaction Matches (3-way reconciliation performance)
CREATE INDEX idx_transaction_matches_bank_transaction ON public.transaction_matches USING btree (bank_transaction_id);
CREATE INDEX idx_transaction_matches_confidence ON public.transaction_matches USING btree (match_confidence);
CREATE INDEX idx_transaction_matches_matched_type_id ON public.transaction_matches USING btree (matched_type, matched_id);

-- Cash Movements (Cash flow tracking)
CREATE INDEX idx_cash_movements_bank_transaction ON public.cash_movements USING btree (bank_transaction_id);
CREATE INDEX idx_cash_movements_created_at ON public.cash_movements USING btree (created_at);
CREATE INDEX idx_cash_movements_movement_type ON public.cash_movements USING btree (movement_type);
CREATE INDEX idx_cash_movements_number ON public.cash_movements USING btree (movement_number);
CREATE INDEX idx_cash_movements_org_date ON public.cash_movements USING btree (organization_id, created_at DESC);
CREATE INDEX idx_cash_movements_user_id ON public.cash_movements USING btree (user_id);

-- Owner Transactions (Owner draws/investments)
CREATE INDEX idx_owner_transactions_banking_status ON public.owner_transactions USING btree (banking_status);
CREATE INDEX idx_owner_transactions_date ON public.owner_transactions USING btree (transaction_date);
CREATE INDEX idx_owner_transactions_payment_method ON public.owner_transactions USING btree (payment_method);
CREATE INDEX idx_owner_transactions_related_expense ON public.owner_transactions USING btree (related_expense_id);
CREATE INDEX idx_owner_transactions_type ON public.owner_transactions USING btree (transaction_type);
CREATE INDEX idx_owner_transactions_user_id ON public.owner_transactions USING btree (user_id);

-- Document Sequences (Swiss receipt numbering)
CREATE INDEX idx_document_sequences_type ON public.document_sequences USING btree (type);

-- Audit Log (10-year compliance queries)
CREATE INDEX idx_audit_log_table_name ON public.audit_log USING btree (table_name);
CREATE INDEX idx_audit_log_timestamp ON public.audit_log USING btree ("timestamp");
CREATE INDEX idx_audit_log_user_id ON public.audit_log USING btree (user_id);
CREATE INDEX idx_audit_log_record_id ON public.audit_log USING btree (record_id);

-- Daily Summaries (daily reporting)
CREATE INDEX idx_daily_summaries_org_date ON public.daily_summaries USING btree (organization_id, report_date);
CREATE INDEX idx_daily_summaries_status ON public.daily_summaries USING btree (status);
CREATE INDEX idx_daily_summaries_user_id ON public.daily_summaries USING btree (user_id);
CREATE UNIQUE INDEX idx_daily_summaries_unique_date_user ON public.daily_summaries USING btree (report_date, user_id);

-- Documents (PDF search and management)
CREATE INDEX idx_documents_reference_type_id ON public.documents USING btree (reference_type, reference_id);
CREATE INDEX idx_documents_organization_date ON public.documents USING btree (organization_id, document_date);
CREATE INDEX idx_documents_type ON public.documents USING btree (type);
CREATE INDEX idx_documents_user_id ON public.documents USING btree (user_id);
CREATE INDEX idx_documents_file_path ON public.documents USING btree (file_path);

-- Monthly Summaries (monthly reporting)
CREATE INDEX idx_monthly_summaries_org_year_month ON public.monthly_summaries USING btree (organization_id, year, month);
CREATE INDEX idx_monthly_summaries_status ON public.monthly_summaries USING btree (status);
CREATE INDEX idx_monthly_summaries_user_id ON public.monthly_summaries USING btree (user_id);
CREATE UNIQUE INDEX idx_monthly_summaries_unique_period_user ON public.monthly_summaries USING btree (year, month, user_id);

-- =====================================================
-- ROW LEVEL SECURITY (MULTI-TENANT BANKING + COMPLIANCE)
-- =====================================================

-- Enable RLS on all banking and compliance tables
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Banking RLS Policies
CREATE POLICY bank_accounts_access ON public.bank_accounts 
    USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

CREATE POLICY bank_transactions_access ON public.bank_transactions 
    USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

CREATE POLICY cash_movements_organization_access ON public.cash_movements 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY document_sequences_access ON public.document_sequences 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY owner_transactions_access ON public.owner_transactions 
    USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

CREATE POLICY provider_reports_access ON public.provider_reports 
    USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

CREATE POLICY provider_sessions_insert ON public.provider_import_sessions 
    FOR INSERT 
    WITH CHECK ((auth.uid() = imported_by));

CREATE POLICY provider_sessions_select ON public.provider_import_sessions 
    FOR SELECT 
    USING ((auth.uid() = imported_by));

CREATE POLICY provider_sessions_update ON public.provider_import_sessions 
    FOR UPDATE 
    USING ((auth.uid() = imported_by));

CREATE POLICY transaction_matches_access ON public.transaction_matches 
    USING (((auth.role() = 'authenticated'::text) AND (EXISTS (
        SELECT 1
        FROM public.bank_transactions bt
        WHERE bt.id = transaction_matches.bank_transaction_id 
        AND bt.user_id = auth.uid()
    ))));

-- Compliance RLS Policies
CREATE POLICY audit_log_select_policy ON public.audit_log 
    FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY audit_log_insert_policy ON public.audit_log 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY daily_summaries_organization_access ON public.daily_summaries 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY documents_organization_access ON public.documents 
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

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

-- Banking Tables
COMMENT ON TABLE public.bank_accounts IS 'Swiss bank account management with IBAN support';
COMMENT ON TABLE public.bank_import_sessions IS 'CAMT.053 import audit trail for Swiss banking compliance';
COMMENT ON TABLE public.bank_transactions IS 'Bank transactions imported via CAMT.053 Swiss standard';
COMMENT ON TABLE public.provider_reports IS 'TWINT/SumUp settlement reports for payment reconciliation';
COMMENT ON TABLE public.provider_import_sessions IS 'Provider report import management and tracking';
COMMENT ON TABLE public.transaction_matches IS '3-way reconciliation between sales, providers, and bank';
COMMENT ON TABLE public.cash_movements IS 'Cash flow tracking and bank transfer management';
COMMENT ON TABLE public.owner_transactions IS 'Owner draws, investments, and private transactions';
COMMENT ON TABLE public.document_sequences IS 'Swiss receipt numbering system (VK2025000123 format)';

-- Compliance Tables
COMMENT ON TABLE public.audit_log IS '10-year Swiss compliance audit trail for all financial operations';
COMMENT ON TABLE public.daily_summaries IS 'Swiss daily closure legal requirement with cash reconciliation';
COMMENT ON TABLE public.documents IS 'PDF document storage for 10-year legal compliance requirement';
COMMENT ON TABLE public.monthly_summaries IS 'Monthly financial summaries for Swiss tax reporting';

-- Views
COMMENT ON VIEW public.unified_transactions_view IS 'Unified view of all financial transactions (sales, expenses, cash, bank)';
COMMENT ON VIEW public.unmatched_bank_transactions IS 'Bank transactions awaiting reconciliation with sales/expenses';
COMMENT ON VIEW public.unmatched_provider_reports IS 'Provider reports (TWINT/SumUp) awaiting reconciliation with sales';
COMMENT ON VIEW public.unmatched_sales_for_provider IS 'Sales transactions awaiting provider reconciliation';

-- Column Comments
COMMENT ON COLUMN public.bank_transactions.status IS 'Banking reconciliation workflow status';
COMMENT ON COLUMN public.provider_reports.provider IS 'Payment provider: twint or sumup';
COMMENT ON COLUMN public.transaction_matches.match_confidence IS 'Automatic matching confidence score (0-100)';
COMMENT ON COLUMN public.cash_movements.movement_type IS 'Type: cash_operation or bank_transfer';
COMMENT ON COLUMN public.owner_transactions.transaction_type IS 'Type: deposit, expense, or withdrawal';
COMMENT ON COLUMN public.document_sequences.format IS 'Swiss receipt format pattern';
COMMENT ON COLUMN public.audit_log.is_immutable IS 'Immutable audit records for compliance';
COMMENT ON COLUMN public.daily_summaries.status IS 'Status: draft or closed (immutable when closed)';
COMMENT ON COLUMN public.documents.type IS 'Document type: receipt, daily_report, monthly_report, yearly_report, expense_receipt';
COMMENT ON COLUMN public.monthly_summaries.status IS 'Status: draft or closed (immutable when closed)';

-- =====================================================
-- END OF 03_banking_compliance_complete.sql (V5)
-- =====================================================
-- COMPLETE BANKING + COMPLIANCE DOMAIN: All banking + compliance tables + views + RLS (self-contained)
-- Next: 04_indexes_and_final.sql (Pure technical layer - cross-cutting performance optimization)  
-- =====================================================