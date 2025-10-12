-- ============================================================================
-- BUSINESS CORE: Bank Accounts, Items, Suppliers, Business Settings
-- ============================================================================
-- Depends on: users, organizations

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: idx_bank_accounts_iban; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_accounts_iban ON public.bank_accounts USING btree (iban);


--
-- Name: idx_bank_accounts_org_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_accounts_org_active ON public.bank_accounts USING btree (organization_id, is_active);


--
-- Name: idx_bank_accounts_user_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_accounts_user_active ON public.bank_accounts USING btree (user_id, is_active);


--
-- Name: bank_accounts bank_accounts_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: bank_accounts bank_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: bank_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: bank_accounts bank_accounts_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bank_accounts_access ON public.bank_accounts USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));


--
-- PostgreSQL database dump complete
--


--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: items; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: idx_items_org_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_org_active ON public.items USING btree (organization_id, active);


--
-- Name: items items_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

--
-- Name: items items_business_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY items_business_access ON public.items TO authenticated USING (true) WITH CHECK (true);


--
-- PostgreSQL database dump complete
--


--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: TABLE suppliers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.suppliers IS 'Master table for supplier normalization and analytics';


--
-- Name: COLUMN suppliers.normalized_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.suppliers.normalized_name IS 'Lowercase, trimmed name for matching and deduplication';


--
-- Name: COLUMN suppliers.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.suppliers.category IS 'Business category for expense analytics';


--
-- Name: COLUMN suppliers.vat_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.suppliers.vat_number IS 'Swiss UID number for tax purposes';


--
-- Name: suppliers suppliers_normalized_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_normalized_name_key UNIQUE (normalized_name);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: idx_suppliers_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_active ON public.suppliers USING btree (is_active);


--
-- Name: idx_suppliers_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_category ON public.suppliers USING btree (category);


--
-- Name: idx_suppliers_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_created_at ON public.suppliers USING btree (created_at);


--
-- Name: idx_suppliers_name_fts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_name_fts ON public.suppliers USING gin (to_tsvector('german'::regconfig, (name)::text));


--
-- Name: idx_suppliers_normalized_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_normalized_name ON public.suppliers USING btree (normalized_name);


--
-- Name: suppliers trigger_suppliers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_suppliers_updated_at();


--
-- Name: suppliers suppliers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: suppliers suppliers_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: suppliers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

--
-- Name: suppliers suppliers_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY suppliers_access ON public.suppliers TO authenticated USING (true) WITH CHECK (true);


--
-- PostgreSQL database dump complete
--


--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: business_settings; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: COLUMN business_settings.custom_expense_categories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_settings.custom_expense_categories IS 'User-defined expense categories as JSON object: {"key": "Display Name"}';


--
-- Name: COLUMN business_settings.app_logo_light_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_settings.app_logo_light_url IS 'URL for the app logo displayed in light theme';


--
-- Name: COLUMN business_settings.app_logo_dark_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_settings.app_logo_dark_url IS 'URL for the app logo displayed in dark theme';


--
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- Name: business_settings business_settings_user_org_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_user_org_unique UNIQUE (user_id, organization_id);


--
-- Name: business_settings update_business_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON public.business_settings FOR EACH ROW EXECUTE FUNCTION public.update_business_settings_updated_at();


--
-- Name: business_settings business_settings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: business_settings business_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: business_settings Enable all access for service role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for service role" ON public.business_settings TO service_role USING (true);


--
-- Name: business_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: business_settings business_settings_org_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY business_settings_org_access ON public.business_settings TO authenticated USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- PostgreSQL database dump complete
--


--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: idx_audit_log_table_record; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_table_record ON public.audit_log USING btree (table_name, record_id);


--
-- Name: idx_audit_log_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_timestamp ON public.audit_log USING btree ("timestamp");


--
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_log audit_log_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY audit_log_insert_policy ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: audit_log audit_log_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY audit_log_select_policy ON public.audit_log FOR SELECT TO authenticated USING (true);


--
-- PostgreSQL database dump complete
--


