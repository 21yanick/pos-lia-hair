-- ============================================================================
-- IMPORT SESSIONS: Bank Import, Provider Import Sessions
-- ============================================================================
-- Depends on: bank_accounts, organizations, users

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
-- Name: bank_import_sessions; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: bank_import_sessions bank_import_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_pkey PRIMARY KEY (id);


--
-- Name: idx_bank_import_sessions_account; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_import_sessions_account ON public.bank_import_sessions USING btree (bank_account_id);


--
-- Name: idx_bank_import_sessions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_import_sessions_date ON public.bank_import_sessions USING btree (imported_at);


--
-- Name: idx_bank_import_sessions_filename; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_import_sessions_filename ON public.bank_import_sessions USING btree (import_filename);


--
-- Name: bank_import_sessions bank_import_sessions_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: bank_import_sessions bank_import_sessions_imported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_imported_by_fkey FOREIGN KEY (imported_by) REFERENCES auth.users(id);


--
-- Name: bank_import_sessions bank_import_sessions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


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
-- Name: provider_import_sessions; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: provider_import_sessions provider_import_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_pkey PRIMARY KEY (id);


--
-- Name: provider_import_sessions provider_import_sessions_imported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_imported_by_fkey FOREIGN KEY (imported_by) REFERENCES auth.users(id);


--
-- Name: provider_import_sessions provider_import_sessions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: provider_import_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.provider_import_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: provider_import_sessions provider_sessions_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY provider_sessions_insert ON public.provider_import_sessions FOR INSERT WITH CHECK ((auth.uid() = imported_by));


--
-- Name: provider_import_sessions provider_sessions_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY provider_sessions_select ON public.provider_import_sessions FOR SELECT USING ((auth.uid() = imported_by));


--
-- Name: provider_import_sessions provider_sessions_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY provider_sessions_update ON public.provider_import_sessions FOR UPDATE USING ((auth.uid() = imported_by));


--
-- PostgreSQL database dump complete
--


