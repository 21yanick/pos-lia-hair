-- ============================================================================
-- BUSINESS TABLES: Core business entities (schema only)
-- ============================================================================

-- Table: bank_accounts
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
ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);
CREATE INDEX idx_bank_accounts_iban ON public.bank_accounts USING btree (iban);
CREATE INDEX idx_bank_accounts_org_active ON public.bank_accounts USING btree (organization_id, is_active);
CREATE INDEX idx_bank_accounts_user_active ON public.bank_accounts USING btree (user_id, is_active);
ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY bank_accounts_access ON public.bank_accounts USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

-- Table: items
CREATE TABLE public.items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    default_price numeric(10,2) NOT NULL,
    type text NOT NULL,
    is_favorite boolean DEFAULT false,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    organization_id uuid NOT NULL,
    CONSTRAINT items_type_check CHECK ((type = ANY (ARRAY['service'::text, 'product'::text])))
);
ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);
CREATE INDEX idx_items_org_active ON public.items USING btree (organization_id, active);
ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY items_business_access ON public.items TO authenticated USING (true) WITH CHECK (true);

-- Table: suppliers
CREATE TABLE public.suppliers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    normalized_name character varying(255) NOT NULL,
    category public.supplier_category DEFAULT 'other'::public.supplier_category,
    contact_email character varying(255),
    contact_phone character varying(50),
    website character varying(255),
    address_line1 character varying(255),
    address_line2 character varying(255),
    postal_code character varying(20),
    city character varying(100),
    country character varying(2) DEFAULT 'CH'::character varying,
    iban character varying(34),
    vat_number character varying(50),
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    organization_id uuid
);
ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_normalized_name_key UNIQUE (normalized_name);
ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);
CREATE INDEX idx_suppliers_active ON public.suppliers USING btree (is_active);
CREATE INDEX idx_suppliers_category ON public.suppliers USING btree (category);
CREATE INDEX idx_suppliers_created_at ON public.suppliers USING btree (created_at);
CREATE INDEX idx_suppliers_name_fts ON public.suppliers USING gin (to_tsvector('german'::regconfig, (name)::text));
CREATE INDEX idx_suppliers_normalized_name ON public.suppliers USING btree (normalized_name);
ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY suppliers_access ON public.suppliers TO authenticated USING (true) WITH CHECK (true);

-- Table: business_settings
CREATE TABLE public.business_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_name text,
    company_tagline text,
    company_address text,
    company_postal_code text,
    company_city text,
    company_phone text,
    company_email text,
    company_website text,
    company_uid text,
    logo_url text,
    logo_storage_path text,
    default_currency text DEFAULT 'CHF'::text,
    tax_rate numeric(5,2) DEFAULT 7.7,
    pdf_show_logo boolean DEFAULT true,
    pdf_show_company_details boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    custom_expense_categories jsonb DEFAULT '{}'::jsonb,
    organization_id uuid NOT NULL,
    custom_supplier_categories jsonb DEFAULT '{}'::jsonb,
    app_logo_light_url text,
    app_logo_light_storage_path text,
    app_logo_dark_url text,
    app_logo_dark_storage_path text
);
ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_user_org_unique UNIQUE (user_id, organization_id);
ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE POLICY "Enable all access for service role" ON public.business_settings TO service_role USING (true);
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY business_settings_org_access ON public.business_settings TO authenticated USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));

-- Table: audit_log
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
ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);
CREATE INDEX idx_audit_log_table_record ON public.audit_log USING btree (table_name, record_id);
CREATE INDEX idx_audit_log_timestamp ON public.audit_log USING btree ("timestamp");
ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_insert_policy ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY audit_log_select_policy ON public.audit_log FOR SELECT TO authenticated USING (true);

