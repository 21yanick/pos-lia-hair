-- ============================================================================
-- RELATIONSHIP TABLES: Dependent entities
-- ============================================================================

-- Table: cash_movements
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
    CONSTRAINT cash_movements_banking_status_check CHECK (((banking_status)::text = ANY ((ARRAY['unmatched'::character varying, 'matched'::character varying])::text[]))),
    CONSTRAINT cash_movements_movement_type_check CHECK (((movement_type)::text = ANY ((ARRAY['cash_operation'::character varying, 'bank_transfer'::character varying])::text[]))),
    CONSTRAINT cash_movements_reference_type_check CHECK ((reference_type = ANY (ARRAY['sale'::text, 'expense'::text, 'adjustment'::text, 'owner_transaction'::text]))),
    CONSTRAINT cash_movements_type_check CHECK ((type = ANY (ARRAY['cash_in'::text, 'cash_out'::text])))
);
ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_movement_number_key UNIQUE (movement_number);
ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_pkey PRIMARY KEY (id);
CREATE INDEX idx_cash_movements_bank_transaction ON public.cash_movements USING btree (bank_transaction_id);
CREATE INDEX idx_cash_movements_created_at ON public.cash_movements USING btree (created_at);
CREATE INDEX idx_cash_movements_movement_type ON public.cash_movements USING btree (movement_type);
CREATE INDEX idx_cash_movements_number ON public.cash_movements USING btree (movement_number);
CREATE INDEX idx_cash_movements_org_date ON public.cash_movements USING btree (organization_id, created_at DESC);
CREATE INDEX idx_cash_movements_user_id ON public.cash_movements USING btree (user_id);
ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);
ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY cash_movements_access ON public.cash_movements TO authenticated USING (true) WITH CHECK (true);

-- Table: sale_items
CREATE TABLE public.sale_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sale_id uuid,
    item_id uuid,
    price numeric(10,2) NOT NULL,
    notes text,
    organization_id uuid
);
ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);
ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY sale_items_access ON public.sale_items TO authenticated USING (true) WITH CHECK (true);

-- Table: provider_reports
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
    CONSTRAINT provider_reports_provider_check CHECK (((provider)::text = ANY ((ARRAY['twint'::character varying, 'sumup'::character varying])::text[]))),
    CONSTRAINT provider_reports_status_check CHECK (((status)::text = ANY ((ARRAY['unmatched'::character varying, 'matched'::character varying, 'discrepancy'::character varying])::text[])))
);
ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_pkey PRIMARY KEY (id);
CREATE INDEX idx_provider_reports_import_date ON public.provider_reports USING btree (import_date);
CREATE INDEX idx_provider_reports_provider_status ON public.provider_reports USING btree (provider, status);
CREATE INDEX idx_provider_reports_sale_id ON public.provider_reports USING btree (sale_id);
CREATE INDEX idx_provider_reports_transaction_date ON public.provider_reports USING btree (transaction_date);
ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
-- Note: provider_reports_sale_id_fkey constraint added later due to circular dependency
ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.provider_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY provider_reports_access ON public.provider_reports USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

-- Table: owner_transactions
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
    CONSTRAINT owner_transactions_banking_status_check CHECK (((banking_status)::text = ANY ((ARRAY['unmatched'::character varying, 'matched'::character varying])::text[]))),
    CONSTRAINT owner_transactions_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['bank_transfer'::character varying, 'private_card'::character varying, 'private_cash'::character varying])::text[]))),
    CONSTRAINT owner_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['deposit'::character varying, 'expense'::character varying, 'withdrawal'::character varying])::text[])))
);
ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_pkey PRIMARY KEY (id);
CREATE INDEX idx_owner_transactions_banking_status ON public.owner_transactions USING btree (banking_status);
CREATE INDEX idx_owner_transactions_date ON public.owner_transactions USING btree (transaction_date);
CREATE INDEX idx_owner_transactions_payment_method ON public.owner_transactions USING btree (payment_method);
CREATE INDEX idx_owner_transactions_related_expense ON public.owner_transactions USING btree (related_expense_id);
CREATE INDEX idx_owner_transactions_type ON public.owner_transactions USING btree (transaction_type);
CREATE INDEX idx_owner_transactions_user_id ON public.owner_transactions USING btree (user_id);
ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_related_bank_transaction_id_fkey FOREIGN KEY (related_bank_transaction_id) REFERENCES public.bank_transactions(id);
ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_related_expense_id_fkey FOREIGN KEY (related_expense_id) REFERENCES public.expenses(id);
ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.owner_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_transactions_access ON public.owner_transactions USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

-- Table: transaction_matches
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
    CONSTRAINT transaction_matches_match_type_check CHECK (((match_type)::text = ANY ((ARRAY['automatic'::character varying, 'manual'::character varying, 'suggested'::character varying])::text[]))),
    CONSTRAINT transaction_matches_matched_type_check CHECK (((matched_type)::text = ANY ((ARRAY['sale'::character varying, 'expense'::character varying, 'provider_batch'::character varying, 'cash_movement'::character varying, 'owner_transaction'::character varying])::text[])))
);
ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_pkey PRIMARY KEY (id);
CREATE INDEX idx_transaction_matches_bank_transaction ON public.transaction_matches USING btree (bank_transaction_id);
CREATE INDEX idx_transaction_matches_confidence ON public.transaction_matches USING btree (match_confidence);
CREATE INDEX idx_transaction_matches_matched_type_id ON public.transaction_matches USING btree (matched_type, matched_id);
ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);
ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_matched_by_fkey FOREIGN KEY (matched_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE public.transaction_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY transaction_matches_access ON public.transaction_matches USING (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.bank_transactions bt
  WHERE ((bt.id = transaction_matches.bank_transaction_id) AND (bt.user_id = auth.uid()))))));

