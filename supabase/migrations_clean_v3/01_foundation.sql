-- ============================================================================
-- FOUNDATION: Extensions, ENUM Types, Core Entities
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Custom ENUM types
 CREATE TYPE public.supplier_category AS ENUM ('beauty_supplies', 'equipment', 'utilities', 'rent', 'insurance', 'professional_services', 'retail', 'online_marketplace', 'real_estate', 'other');


-- Core entities (users, organizations, document_sequences)
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
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select_own ON public.users FOR SELECT USING ((auth.uid() = id));
CREATE POLICY users_update_own ON public.users FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));

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
ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_slug_key UNIQUE (slug);

CREATE TABLE public.document_sequences (
    type character varying(20) NOT NULL,
    current_number integer DEFAULT 0 NOT NULL,
    prefix character varying(10) NOT NULL,
    format character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_pkey PRIMARY KEY (type);
CREATE INDEX idx_document_sequences_type ON public.document_sequences USING btree (type);
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY document_sequences_access ON public.document_sequences TO authenticated USING (true) WITH CHECK (true);

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
ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_organization_id_user_id_key UNIQUE (organization_id, user_id);
ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

