-- ============================================================================
-- TRANSACTION TABLES: Bank, Sales, Expenses, Summaries
-- ============================================================================

-- Table: bank_import_sessions
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
    CONSTRAINT bank_import_sessions_import_type_check CHECK (((import_type)::text = ANY ((ARRAY['camt053'::character varying, 'csv'::character varying])::text[]))),
    CONSTRAINT bank_import_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);
ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_pkey PRIMARY KEY (id);
CREATE INDEX idx_bank_import_sessions_account ON public.bank_import_sessions USING btree (bank_account_id);
CREATE INDEX idx_bank_import_sessions_date ON public.bank_import_sessions USING btree (imported_at);
CREATE INDEX idx_bank_import_sessions_filename ON public.bank_import_sessions USING btree (import_filename);
ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);
ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_imported_by_fkey FOREIGN KEY (imported_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Table: provider_import_sessions
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
ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_imported_by_fkey FOREIGN KEY (imported_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE public.provider_import_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY provider_sessions_insert ON public.provider_import_sessions FOR INSERT WITH CHECK ((auth.uid() = imported_by));
CREATE POLICY provider_sessions_select ON public.provider_import_sessions FOR SELECT USING ((auth.uid() = imported_by));
CREATE POLICY provider_sessions_update ON public.provider_import_sessions FOR UPDATE USING ((auth.uid() = imported_by));

-- Table: bank_transactions
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
    CONSTRAINT bank_transactions_status_check CHECK (((status)::text = ANY ((ARRAY['unmatched'::character varying, 'matched'::character varying, 'ignored'::character varying])::text[])))
);
ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_transaction_number_key UNIQUE (transaction_number);
ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT unique_bank_reference_per_account UNIQUE (bank_account_id, reference);
CREATE INDEX idx_bank_transactions_account_date ON public.bank_transactions USING btree (bank_account_id, transaction_date);
CREATE INDEX idx_bank_transactions_amount ON public.bank_transactions USING btree (amount);
CREATE INDEX idx_bank_transactions_booking_date ON public.bank_transactions USING btree (booking_date);
CREATE INDEX idx_bank_transactions_import_batch ON public.bank_transactions USING btree (import_batch_id);
CREATE INDEX idx_bank_transactions_import_filename ON public.bank_transactions USING btree (import_filename);
CREATE INDEX idx_bank_transactions_number ON public.bank_transactions USING btree (transaction_number);
CREATE INDEX idx_bank_transactions_reference ON public.bank_transactions USING btree (reference);
CREATE INDEX idx_bank_transactions_status ON public.bank_transactions USING btree (status);
CREATE INDEX idx_bank_transactions_status_date ON public.bank_transactions USING btree (status, transaction_date);
ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);
ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY bank_transactions_access ON public.bank_transactions USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

-- Table: expenses
CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    payment_method text NOT NULL,
    payment_date date NOT NULL,
    supplier_name text,
    invoice_number text,
    notes text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    bank_transaction_id uuid,
    banking_status character varying(20) DEFAULT 'unmatched'::character varying,
    receipt_number character varying(20),
    supplier_id uuid,
    organization_id uuid NOT NULL,
    CONSTRAINT check_supplier_info CHECK (((supplier_name IS NOT NULL) OR (supplier_id IS NOT NULL) OR ((supplier_name IS NULL) AND (supplier_id IS NULL)))),
    CONSTRAINT expenses_banking_status_check CHECK (((banking_status)::text = ANY ((ARRAY['unmatched'::character varying, 'matched'::character varying])::text[]))),
    CONSTRAINT expenses_payment_method_check CHECK ((payment_method = ANY (ARRAY['bank'::text, 'cash'::text])))
);
ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_receipt_number_key UNIQUE (receipt_number);
CREATE INDEX idx_expenses_bank_transaction ON public.expenses USING btree (bank_transaction_id);
CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);
CREATE INDEX idx_expenses_org_date ON public.expenses USING btree (organization_id, payment_date DESC);
CREATE INDEX idx_expenses_payment_date ON public.expenses USING btree (payment_date);
CREATE INDEX idx_expenses_receipt_number ON public.expenses USING btree (receipt_number);
CREATE INDEX idx_expenses_supplier_id ON public.expenses USING btree (supplier_id);
CREATE INDEX idx_expenses_user_id ON public.expenses USING btree (user_id);
ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);
ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY expenses_org_access ON public.expenses TO authenticated USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));

-- Table: sales
CREATE TABLE public.sales (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    notes text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    gross_amount numeric(10,3),
    provider_fee numeric(10,3),
    net_amount numeric(10,3),
    settlement_status text DEFAULT 'pending'::text,
    settlement_date date,
    provider_reference_id text,
    provider_report_id uuid,
    bank_transaction_id uuid,
    banking_status character varying(20) DEFAULT 'unmatched'::character varying,
    receipt_number character varying(20),
    organization_id uuid NOT NULL,
    CONSTRAINT sales_banking_status_check CHECK (((banking_status)::text = ANY ((ARRAY['unmatched'::character varying, 'provider_matched'::character varying, 'bank_matched'::character varying, 'fully_matched'::character varying])::text[]))),
    CONSTRAINT sales_payment_method_check CHECK ((payment_method = ANY (ARRAY['cash'::text, 'twint'::text, 'sumup'::text]))),
    CONSTRAINT sales_settlement_status_check CHECK ((settlement_status = ANY (ARRAY['pending'::text, 'settled'::text, 'failed'::text, 'weekend_delay'::text, 'charged_back'::text]))),
    CONSTRAINT sales_status_check CHECK ((status = ANY (ARRAY['completed'::text, 'cancelled'::text, 'refunded'::text])))
);
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_receipt_number_key UNIQUE (receipt_number);
CREATE INDEX idx_sales_bank_transaction ON public.sales USING btree (bank_transaction_id);
CREATE INDEX idx_sales_banking_status ON public.sales USING btree (banking_status);
CREATE INDEX idx_sales_created_at ON public.sales USING btree (created_at);
CREATE INDEX idx_sales_org_created ON public.sales USING btree (organization_id, created_at DESC);
CREATE INDEX idx_sales_payment_method ON public.sales USING btree (payment_method);
CREATE INDEX idx_sales_provider_report ON public.sales USING btree (provider_report_id);
CREATE INDEX idx_sales_receipt_number ON public.sales USING btree (receipt_number);
CREATE INDEX idx_sales_user_id ON public.sales USING btree (user_id);
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
-- Note: sales_provider_report_id_fkey constraint added later due to circular dependency
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY sales_org_access ON public.sales TO authenticated USING (true) WITH CHECK (true);

-- Table: documents
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
ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_document_number_key UNIQUE (document_number);
ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
CREATE INDEX idx_documents_document_date ON public.documents USING btree (document_date);
CREATE INDEX idx_documents_document_number ON public.documents USING btree (document_number);
CREATE INDEX idx_documents_org_type ON public.documents USING btree (organization_id, type);
CREATE INDEX idx_documents_reference_type_id ON public.documents USING btree (reference_type, reference_id);
CREATE INDEX idx_documents_type ON public.documents USING btree (type);
CREATE INDEX idx_documents_type_date ON public.documents USING btree (type, document_date);
CREATE INDEX idx_documents_user_id ON public.documents USING btree (user_id);
CREATE INDEX idx_documents_user_type ON public.documents USING btree (user_id, type);
ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_access ON public.documents TO authenticated USING (true) WITH CHECK (true);

-- Table: daily_summaries
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
ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_report_date_key UNIQUE (report_date);
CREATE INDEX idx_daily_summaries_created_by ON public.daily_summaries USING btree (created_by);
CREATE INDEX idx_daily_summaries_report_date ON public.daily_summaries USING btree (report_date);
ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_summaries_business_access ON public.daily_summaries TO authenticated USING (true) WITH CHECK (true);

-- Table: monthly_summaries
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
ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_year_month_key UNIQUE (year, month);
CREATE INDEX idx_monthly_summaries_created_by ON public.monthly_summaries USING btree (created_by);
CREATE INDEX idx_monthly_summaries_year_month ON public.monthly_summaries USING btree (year, month);
ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY monthly_summaries_business_access ON public.monthly_summaries TO authenticated USING (true) WITH CHECK (true);

