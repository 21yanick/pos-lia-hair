-- ============================================================================
-- FOUNDATION: Extensions, Users, Organizations
-- ============================================================================
-- No dependencies - safe to run first

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom ENUM types
CREATE TYPE public.supplier_category AS ENUM ('beauty_supplies', 'equipment', 'utilities', 'rent', 'insurance', 'professional_services', 'retail', 'online_marketplace', 'real_estate', 'other');

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
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'staff'::text])))
);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: users users_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_select_own ON public.users FOR SELECT USING ((auth.uid() = id));


--
-- Name: users users_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_update_own ON public.users FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


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
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    display_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true,
    address text,
    city text,
    postal_code text,
    phone text,
    email text,
    website text,
    uid text,
    settings jsonb DEFAULT '{}'::jsonb
);


--
-- Name: TABLE organizations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organizations IS 'Multi-tenancy enforced by frontend logic, not RLS (Docker Supabase limitation)';


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_slug_key UNIQUE (slug);


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
-- Name: document_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_sequences (
    type character varying(20) NOT NULL,
    current_number integer DEFAULT 0 NOT NULL,
    prefix character varying(10) NOT NULL,
    format character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: document_sequences document_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_pkey PRIMARY KEY (type);


--
-- Name: idx_document_sequences_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_sequences_type ON public.document_sequences USING btree (type);


--
-- Name: document_sequences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

--
-- Name: document_sequences document_sequences_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY document_sequences_access ON public.document_sequences TO authenticated USING (true) WITH CHECK (true);


--
-- PostgreSQL database dump complete
--

