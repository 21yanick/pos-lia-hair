-- ============================================================================
-- RELATIONSHIPS: Cash Movements, Sale Items, Provider Reports, Matches
-- ============================================================================
-- Depends on: bank_transactions, sales, expenses, items

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
-- Name: cash_movements; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: COLUMN cash_movements.movement_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_movements.movement_number IS 'Human-readable cash movement number (e.g., CM2025000001)';


--
-- Name: cash_movements cash_movements_movement_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_movement_number_key UNIQUE (movement_number);


--
-- Name: cash_movements cash_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_pkey PRIMARY KEY (id);


--
-- Name: idx_cash_movements_bank_transaction; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_bank_transaction ON public.cash_movements USING btree (bank_transaction_id);


--
-- Name: idx_cash_movements_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_created_at ON public.cash_movements USING btree (created_at);


--
-- Name: idx_cash_movements_movement_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_movement_type ON public.cash_movements USING btree (movement_type);


--
-- Name: idx_cash_movements_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_number ON public.cash_movements USING btree (movement_number);


--
-- Name: idx_cash_movements_org_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_org_date ON public.cash_movements USING btree (organization_id, created_at DESC);


--
-- Name: idx_cash_movements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_user_id ON public.cash_movements USING btree (user_id);


--
-- Name: cash_movements audit_cash_movements_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_cash_movements_changes AFTER INSERT OR DELETE OR UPDATE ON public.cash_movements FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

ALTER TABLE public.cash_movements DISABLE TRIGGER audit_cash_movements_changes;


--
-- Name: cash_movements trigger_auto_cash_movement_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_cash_movement_number BEFORE INSERT ON public.cash_movements FOR EACH ROW EXECUTE FUNCTION public.auto_generate_cash_movement_number();


--
-- Name: cash_movements cash_movements_bank_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);


--
-- Name: cash_movements cash_movements_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: cash_movements cash_movements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: cash_movements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

--
-- Name: cash_movements cash_movements_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cash_movements_access ON public.cash_movements TO authenticated USING (true) WITH CHECK (true);


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
-- Name: sale_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sale_id uuid,
    item_id uuid,
    price numeric(10,2) NOT NULL,
    notes text,
    organization_id uuid
);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sale_items audit_sale_items_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_sale_items_changes AFTER INSERT OR DELETE OR UPDATE ON public.sale_items FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

ALTER TABLE public.sale_items DISABLE TRIGGER audit_sale_items_changes;


--
-- Name: sale_items sale_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: sale_items sale_items_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: sale_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

--
-- Name: sale_items sale_items_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sale_items_access ON public.sale_items TO authenticated USING (true) WITH CHECK (true);


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
-- Name: provider_reports; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: provider_reports provider_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_pkey PRIMARY KEY (id);


--
-- Name: idx_provider_reports_import_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_reports_import_date ON public.provider_reports USING btree (import_date);


--
-- Name: idx_provider_reports_provider_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_reports_provider_status ON public.provider_reports USING btree (provider, status);


--
-- Name: idx_provider_reports_sale_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_reports_sale_id ON public.provider_reports USING btree (sale_id);


--
-- Name: idx_provider_reports_transaction_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_reports_transaction_date ON public.provider_reports USING btree (transaction_date);


--
-- Name: provider_reports trigger_update_sales_banking_status; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_sales_banking_status AFTER UPDATE ON public.provider_reports FOR EACH ROW EXECUTE FUNCTION public.update_sales_banking_status();


--
-- Name: provider_reports provider_reports_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: provider_reports provider_reports_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: provider_reports provider_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: provider_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.provider_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: provider_reports provider_reports_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY provider_reports_access ON public.provider_reports USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));


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
-- Name: owner_transactions; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: owner_transactions owner_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_pkey PRIMARY KEY (id);


--
-- Name: idx_owner_transactions_banking_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_banking_status ON public.owner_transactions USING btree (banking_status);


--
-- Name: idx_owner_transactions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_date ON public.owner_transactions USING btree (transaction_date);


--
-- Name: idx_owner_transactions_payment_method; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_payment_method ON public.owner_transactions USING btree (payment_method);


--
-- Name: idx_owner_transactions_related_expense; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_related_expense ON public.owner_transactions USING btree (related_expense_id);


--
-- Name: idx_owner_transactions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_type ON public.owner_transactions USING btree (transaction_type);


--
-- Name: idx_owner_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_user_id ON public.owner_transactions USING btree (user_id);


--
-- Name: owner_transactions trigger_update_owner_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_owner_transactions_updated_at BEFORE UPDATE ON public.owner_transactions FOR EACH ROW EXECUTE FUNCTION public.update_owner_transactions_updated_at();


--
-- Name: owner_transactions owner_transactions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: owner_transactions owner_transactions_related_bank_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_related_bank_transaction_id_fkey FOREIGN KEY (related_bank_transaction_id) REFERENCES public.bank_transactions(id);


--
-- Name: owner_transactions owner_transactions_related_expense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_related_expense_id_fkey FOREIGN KEY (related_expense_id) REFERENCES public.expenses(id);


--
-- Name: owner_transactions owner_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: owner_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.owner_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: owner_transactions owner_transactions_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY owner_transactions_access ON public.owner_transactions USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));


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
-- Name: transaction_matches; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: transaction_matches transaction_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_pkey PRIMARY KEY (id);


--
-- Name: idx_transaction_matches_bank_transaction; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_matches_bank_transaction ON public.transaction_matches USING btree (bank_transaction_id);


--
-- Name: idx_transaction_matches_confidence; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_matches_confidence ON public.transaction_matches USING btree (match_confidence);


--
-- Name: idx_transaction_matches_matched_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_matches_matched_type_id ON public.transaction_matches USING btree (matched_type, matched_id);


--
-- Name: transaction_matches transaction_matches_bank_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);


--
-- Name: transaction_matches transaction_matches_matched_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_matched_by_fkey FOREIGN KEY (matched_by) REFERENCES auth.users(id);


--
-- Name: transaction_matches transaction_matches_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: transaction_matches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transaction_matches ENABLE ROW LEVEL SECURITY;

--
-- Name: transaction_matches transaction_matches_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY transaction_matches_access ON public.transaction_matches USING (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.bank_transactions bt
  WHERE ((bt.id = transaction_matches.bank_transaction_id) AND (bt.user_id = auth.uid()))))));


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
-- Name: organization_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    invited_by uuid,
    joined_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true,
    CONSTRAINT organization_users_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'staff'::text])))
);


--
-- Name: TABLE organization_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organization_users IS 'Multi-tenancy enforced by frontend logic, not RLS (Docker Supabase limitation)';


--
-- Name: organization_users organization_users_organization_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_organization_id_user_id_key UNIQUE (organization_id, user_id);


--
-- Name: organization_users organization_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_pkey PRIMARY KEY (id);


--
-- Name: organization_users organization_users_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id);


--
-- Name: organization_users organization_users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_users organization_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


