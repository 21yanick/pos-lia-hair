-- =====================================================
-- 03_banking_and_compliance.sql
-- =====================================================
-- Swiss Banking Integration & Legal Compliance extracted from Production
-- Source: production-schema-current-20250815-1855.sql
-- Business Logic: Banking, CAMT.053, TWINT/SumUp, Swiss Compliance
-- Dependencies: 01_multi_tenant_foundation.sql, 02_core_pos_business.sql
-- =====================================================

-- =====================================================
-- SWISS BANKING & COMPLIANCE TABLES
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
-- PRIMARY KEYS & UNIQUE CONSTRAINTS
-- =====================================================

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

-- =====================================================
-- FOREIGN KEY RELATIONSHIPS
-- =====================================================

-- Bank Accounts
ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Bank Import Sessions
ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_bank_account_id_fkey 
    FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_imported_by_fkey 
    FOREIGN KEY (imported_by) REFERENCES auth.users(id);

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Bank Transactions
ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_bank_account_id_fkey 
    FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Provider Reports
ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_sale_id_fkey 
    FOREIGN KEY (sale_id) REFERENCES public.sales(id);

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Provider Import Sessions
ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_imported_by_fkey 
    FOREIGN KEY (imported_by) REFERENCES auth.users(id);

ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Transaction Matches
ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_bank_transaction_id_fkey 
    FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_matched_by_fkey 
    FOREIGN KEY (matched_by) REFERENCES auth.users(id);

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Cash Movements
ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_bank_transaction_id_fkey 
    FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Owner Transactions
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

-- Foreign Keys for existing tables (Sales & Expenses)
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
-- PERFORMANCE INDEXES (SWISS BANKING OPTIMIZATION)
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

-- =====================================================
-- ROW LEVEL SECURITY (MULTI-TENANT BANKING ACCESS)
-- =====================================================

-- Enable RLS on all banking tables
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

-- Bank Accounts: User-scoped access
CREATE POLICY bank_accounts_access ON public.bank_accounts 
    USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

-- Bank Transactions: User-scoped access
CREATE POLICY bank_transactions_access ON public.bank_transactions 
    USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

-- Cash Movements: Organization-scoped access
CREATE POLICY cash_movements_organization_access ON public.cash_movements 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

-- Document Sequences: Global access for authenticated users
CREATE POLICY document_sequences_access ON public.document_sequences 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Owner Transactions: User-scoped access
CREATE POLICY owner_transactions_access ON public.owner_transactions 
    USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

-- Provider Reports: User-scoped access
CREATE POLICY provider_reports_access ON public.provider_reports 
    USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

-- Provider Import Sessions: User-scoped access with CRUD operations
CREATE POLICY provider_sessions_insert ON public.provider_import_sessions 
    FOR INSERT 
    WITH CHECK ((auth.uid() = imported_by));

CREATE POLICY provider_sessions_select ON public.provider_import_sessions 
    FOR SELECT 
    USING ((auth.uid() = imported_by));

CREATE POLICY provider_sessions_update ON public.provider_import_sessions 
    FOR UPDATE 
    USING ((auth.uid() = imported_by));

-- Transaction Matches: Complex organization-scoped access
CREATE POLICY transaction_matches_access ON public.transaction_matches 
    USING (((auth.role() = 'authenticated'::text) AND (EXISTS (
        SELECT 1
        FROM public.bank_transactions bt
        WHERE bt.id = transaction_matches.bank_transaction_id 
        AND bt.user_id = auth.uid()
    ))));

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.bank_accounts IS 'Swiss bank account management with IBAN support';
COMMENT ON TABLE public.bank_import_sessions IS 'CAMT.053 import audit trail for Swiss banking compliance';
COMMENT ON TABLE public.bank_transactions IS 'Bank transactions imported via CAMT.053 Swiss standard';
COMMENT ON TABLE public.provider_reports IS 'TWINT/SumUp settlement reports for payment reconciliation';
COMMENT ON TABLE public.provider_import_sessions IS 'Provider report import management and tracking';
COMMENT ON TABLE public.transaction_matches IS '3-way reconciliation between sales, providers, and bank';
COMMENT ON TABLE public.cash_movements IS 'Cash flow tracking and bank transfer management';
COMMENT ON TABLE public.owner_transactions IS 'Owner draws, investments, and private transactions';
COMMENT ON TABLE public.document_sequences IS 'Swiss receipt numbering system (VK2025000123 format)';

COMMENT ON COLUMN public.bank_transactions.status IS 'Banking reconciliation workflow status';
COMMENT ON COLUMN public.provider_reports.provider IS 'Payment provider: twint or sumup';
COMMENT ON COLUMN public.transaction_matches.match_confidence IS 'Automatic matching confidence score (0-100)';
COMMENT ON COLUMN public.cash_movements.movement_type IS 'Type: cash_operation or bank_transfer';
COMMENT ON COLUMN public.owner_transactions.transaction_type IS 'Type: deposit, expense, or withdrawal';
COMMENT ON COLUMN public.document_sequences.format IS 'Swiss receipt format pattern';

-- =====================================================
-- END OF 03_banking_and_compliance.sql
-- =====================================================
-- Next: 04_performance_and_security.sql (Final optimization + views)
-- =====================================================