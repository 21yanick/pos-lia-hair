-- =====================================================
-- 04_performance_and_security.sql
-- =====================================================
-- Final Performance Optimization & Security Layer extracted from Production
-- Source: production-schema-current-20250815-1855.sql
-- Business Logic: Missing Tables, Views, Performance, Security
-- Dependencies: 01_multi_tenant_foundation.sql, 02_core_pos_business.sql, 03_banking_and_compliance.sql
-- =====================================================

-- =====================================================
-- MISSING COMPLIANCE TABLES (EXTRACTED FROM PRODUCTION)
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
-- PRIMARY KEYS & CONSTRAINTS FOR MISSING TABLES
-- =====================================================

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_pkey PRIMARY KEY (id);

-- =====================================================
-- FOREIGN KEYS FOR MISSING TABLES
-- =====================================================

-- Audit Log
ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Daily Summaries
ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Documents
ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Monthly Summaries
ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

-- =====================================================
-- BUSINESS INTELLIGENCE VIEWS
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

-- Unmatched Bank Transactions View (Banking Reconciliation)
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
            WHEN (bt.amount > (0)::numeric) THEN ' Eingang'::text
            ELSE ' Ausgang'::text
        END AS direction_display,
    abs(bt.amount) AS amount_abs
   FROM (public.bank_transactions bt
     JOIN public.bank_accounts ba ON ((bt.bank_account_id = ba.id)))
  WHERE ((bt.status)::text = 'unmatched'::text)
  ORDER BY bt.transaction_date DESC;

-- Unmatched Provider Reports View (Provider Reconciliation)
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
            WHEN ((pr.provider)::text = 'twint'::text) THEN '=æ TWINT'::character varying
            WHEN ((pr.provider)::text = 'sumup'::text) THEN '=ç SumUp'::character varying
            ELSE pr.provider
        END AS provider_display
   FROM public.provider_reports pr
  WHERE ((pr.status)::text = 'unmatched'::text)
  ORDER BY pr.transaction_date DESC;

-- Unmatched Sales for Provider View (Sales Matching)
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
            WHEN 'twint'::text THEN '=æ TWINT'::text
            WHEN 'sumup'::text THEN '=ç SumUp'::text
            ELSE s.payment_method
        END AS payment_display
   FROM public.sales s
  WHERE ((s.payment_method = ANY (ARRAY['twint'::text, 'sumup'::text])) AND (s.provider_report_id IS NULL) AND ((s.banking_status)::text = 'unmatched'::text))
  ORDER BY s.created_at DESC;

-- =====================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- =====================================================

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
-- ROW LEVEL SECURITY FOR MISSING TABLES
-- =====================================================

-- Enable RLS on missing tables
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Audit Log: User-scoped access (immutable records)
CREATE POLICY audit_log_select_policy ON public.audit_log 
    FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY audit_log_insert_policy ON public.audit_log 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- Daily Summaries: Organization-scoped access
CREATE POLICY daily_summaries_organization_access ON public.daily_summaries 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

-- Documents: Organization-scoped access
CREATE POLICY documents_organization_access ON public.documents 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

-- Monthly Summaries: Organization-scoped access
CREATE POLICY monthly_summaries_organization_access ON public.monthly_summaries 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.audit_log IS '10-year Swiss compliance audit trail for all financial operations';
COMMENT ON TABLE public.daily_summaries IS 'Swiss daily closure legal requirement with cash reconciliation';
COMMENT ON TABLE public.documents IS 'PDF document storage for 10-year legal compliance requirement';
COMMENT ON TABLE public.monthly_summaries IS 'Monthly financial summaries for Swiss tax reporting';

COMMENT ON VIEW public.unified_transactions_view IS 'Unified view of all financial transactions (sales, expenses, cash, bank)';
COMMENT ON VIEW public.unmatched_bank_transactions IS 'Bank transactions awaiting reconciliation with sales/expenses';
COMMENT ON VIEW public.unmatched_provider_reports IS 'Provider reports (TWINT/SumUp) awaiting reconciliation with sales';
COMMENT ON VIEW public.unmatched_sales_for_provider AS 'Sales transactions awaiting provider reconciliation';

COMMENT ON COLUMN public.audit_log.is_immutable IS 'Immutable audit records for compliance';
COMMENT ON COLUMN public.daily_summaries.status IS 'Status: draft or closed (immutable when closed)';
COMMENT ON COLUMN public.documents.type IS 'Document type: receipt, daily_report, monthly_report, yearly_report, expense_receipt';
COMMENT ON COLUMN public.monthly_summaries.status IS 'Status: draft or closed (immutable when closed)';

-- =====================================================
-- END OF 04_performance_and_security.sql
-- =====================================================
-- CLEAN MIGRATION STRUCTURE COMPLETE 
-- =====================================================
-- Total: 4 logical business migrations
-- All 26 production tables preserved
-- Swiss banking & compliance complete
-- Multi-tenant security implemented
-- Performance optimized
-- Ready for type system automation
-- =====================================================