-- =====================================================
-- 01_multi_tenant_foundation.sql
-- =====================================================
-- Clean Multi-Tenant Foundation (V5 - Self-Contained Domains)
-- Source: production-schema-current-20250815-1855.sql
-- Business Logic: Organizations, Users, Security, Configuration
-- Dependencies: None (Foundation layer)
-- =====================================================

-- =====================================================
-- POSTGRESQL EXTENSIONS & CORE SETUP
-- =====================================================

-- Essential extensions for multi-tenant SaaS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- =====================================================
-- MULTI-TENANT FOUNDATION TABLES
-- =====================================================

-- Organizations (SaaS Multi-Tenant Foundation)
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

-- Organization Users (Role-Based Access Control)
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

-- Users (User Management & Authentication)
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

-- Business Settings (Per-Organization Configuration)
CREATE TABLE public.business_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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
    app_logo_dark_storage_path text,
    working_hours jsonb DEFAULT '{"friday": {"end": "18:00", "start": "09:00", "breaks": [], "closed": false}, "monday": {"end": "18:00", "start": "09:00", "breaks": [{"end": "13:00", "start": "12:00"}], "closed": false}, "sunday": {"end": "16:00", "start": "10:00", "breaks": [], "closed": true}, "tuesday": {"end": "18:00", "start": "09:00", "breaks": [], "closed": false}, "saturday": {"end": "16:00", "start": "09:00", "breaks": [], "closed": false}, "thursday": {"end": "18:00", "start": "09:00", "breaks": [], "closed": false}, "wednesday": {"end": "18:00", "start": "09:00", "breaks": [], "closed": false}}'::jsonb NOT NULL,
    booking_rules jsonb DEFAULT '{"autoConfirm": true, "slotInterval": 15, "bufferMinutes": 5, "maxAdvanceDays": 90, "defaultDuration": 60, "minAdvanceHours": 2}'::jsonb NOT NULL,
    display_preferences jsonb DEFAULT '{"timelineEnd": "19:00", "showWeekends": true, "timelineStart": "08:00", "showClosedDays": false}'::jsonb NOT NULL,
    vacation_periods jsonb DEFAULT '[]'::jsonb NOT NULL
);

-- =====================================================
-- PRIMARY KEYS & UNIQUE CONSTRAINTS
-- =====================================================

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);

-- Unique constraints
ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);

-- =====================================================
-- FOREIGN KEY RELATIONSHIPS  
-- =====================================================

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_invited_by_fkey 
    FOREIGN KEY (invited_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Business Settings
CREATE UNIQUE INDEX business_settings_org_unique ON public.business_settings USING btree (organization_id);

-- Organization Users (Multi-tenant access patterns)
CREATE INDEX idx_organization_users_org_id ON public.organization_users USING btree (organization_id);
CREATE INDEX idx_organization_users_user_id ON public.organization_users USING btree (user_id);
CREATE INDEX idx_organization_users_active ON public.organization_users USING btree (active);

-- Organizations (Search and filtering)
CREATE INDEX idx_organizations_slug ON public.organizations USING btree (slug);
CREATE INDEX idx_organizations_active ON public.organizations USING btree (active);

-- Users (Authentication and search)
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_username ON public.users USING btree (username);
CREATE INDEX idx_users_active ON public.users USING btree (active);

-- =====================================================
-- ROW LEVEL SECURITY (PRODUCTION-READY MULTI-TENANT DESIGN)
-- =====================================================

-- CRITICAL: Auth Schema Grants (Required for auth.uid() function)
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role, authenticator;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role, authenticator;

-- CRITICAL: Public Schema Grants (Required for PostgREST API)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Default Privileges (for future objects)
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- =====================================================
-- MULTI-TENANT SECURITY PATTERN
-- =====================================================

-- Organizations: NO RLS (authenticated users can create organizations) 
-- This eliminates circular dependency issues and allows self-enrollment
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- Organization Users: FULL RLS (user-scoped access only)
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;

-- Users: RLS for organization member visibility
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Business Settings: RLS for organization-scoped access
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ORGANIZATION_USERS RLS POLICIES (CRITICAL FOR 2-STEP FLOW)
-- =====================================================

-- SELECT: Users can see their own memberships
CREATE POLICY organization_users_select ON public.organization_users 
    FOR SELECT 
    USING (user_id = auth.uid());

-- INSERT: Users can insert themselves (enables self-enrollment as owner)
CREATE POLICY organization_users_insert ON public.organization_users 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can update their own memberships
CREATE POLICY organization_users_update ON public.organization_users 
    FOR UPDATE 
    USING (user_id = auth.uid());

-- DELETE: Users can delete their own memberships
CREATE POLICY organization_users_delete ON public.organization_users 
    FOR DELETE 
    USING (user_id = auth.uid());

-- Users: Users can see other users in their organizations
CREATE POLICY users_select_organization_members ON public.users FOR SELECT 
    USING (id IN (
        SELECT ou.user_id
        FROM public.organization_users ou
        WHERE ou.organization_id IN (
            SELECT ou2.organization_id
            FROM public.organization_users ou2
            WHERE ou2.user_id = auth.uid() AND ou2.active = true
        )
    ));

-- Users: Allow users to insert themselves
CREATE POLICY users_insert_own ON public.users FOR INSERT 
    WITH CHECK (id = auth.uid());

-- Business Settings: Organization-scoped access
CREATE POLICY business_settings_organization_access ON public.business_settings 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

-- Service role bypass (for admin operations)
CREATE POLICY "Enable all access for service role" ON public.business_settings 
    AS PERMISSIVE FOR ALL TO service_role 
    USING (true);

-- =====================================================
-- BUSINESS FUNCTIONS (MULTI-TENANT HELPERS)
-- =====================================================

-- Get booking rules for organization
CREATE OR REPLACE FUNCTION public.get_booking_rules(p_organization_id uuid) 
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_booking_rules JSONB;
BEGIN
    SELECT booking_rules 
    INTO v_booking_rules
    FROM public.business_settings 
    WHERE organization_id = p_organization_id;
    
    -- Return default if not found
    IF v_booking_rules IS NULL THEN
        v_booking_rules := '{"autoConfirm": true, "slotInterval": 15, "bufferMinutes": 5, "maxAdvanceDays": 90, "defaultDuration": 60, "minAdvanceHours": 2}'::jsonb;
    END IF;
    
    RETURN v_booking_rules;
END;
$$;

-- Get working hours for organization and weekday  
CREATE OR REPLACE FUNCTION public.get_working_hours(p_organization_id uuid, p_weekday text) 
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_working_hours JSONB;
BEGIN
    SELECT working_hours -> p_weekday 
    INTO v_working_hours
    FROM public.business_settings 
    WHERE organization_id = p_organization_id;
    
    -- Return default if not found
    IF v_working_hours IS NULL THEN
        v_working_hours := '{"end": "18:00", "start": "09:00", "breaks": [], "closed": false}'::jsonb;
    END IF;
    
    RETURN v_working_hours;
END;
$$;

-- Check if organization is open at specific date/time
CREATE OR REPLACE FUNCTION public.is_organization_open(p_organization_id uuid, p_date date, p_time time without time zone) 
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    v_weekday TEXT;
    v_day_hours JSONB;
    v_start_time TIME;
    v_end_time TIME;
    v_is_closed BOOLEAN;
    v_breaks JSONB;
    v_break JSONB;
    v_break_start TIME;
    v_break_end TIME;
    v_vacation_periods JSONB;
    v_vacation JSONB;
    v_vacation_start DATE;
    v_vacation_end DATE;
BEGIN
    -- Get weekday (lowercase)
    v_weekday := lower(to_char(p_date, 'day'));
    v_weekday := trim(v_weekday);
    
    -- Get working hours for this weekday
    v_day_hours := get_working_hours(p_organization_id, v_weekday);
    
    -- Check if closed
    v_is_closed := COALESCE((v_day_hours->>'closed')::boolean, false);
    IF v_is_closed THEN
        RETURN false;
    END IF;
    
    -- Get start and end times
    v_start_time := (v_day_hours->>'start')::time;
    v_end_time := (v_day_hours->>'end')::time;
    
    -- Check if time is within working hours
    IF p_time < v_start_time OR p_time > v_end_time THEN
        RETURN false;
    END IF;
    
    -- Check breaks
    v_breaks := v_day_hours->'breaks';
    IF v_breaks IS NOT NULL THEN
        FOR v_break IN SELECT * FROM jsonb_array_elements(v_breaks)
        LOOP
            v_break_start := (v_break->>'start')::time;
            v_break_end := (v_break->>'end')::time;
            
            IF p_time >= v_break_start AND p_time <= v_break_end THEN
                RETURN false;
            END IF;
        END LOOP;
    END IF;
    
    -- Check vacation periods
    SELECT vacation_periods INTO v_vacation_periods
    FROM public.business_settings 
    WHERE organization_id = p_organization_id;
    
    IF v_vacation_periods IS NOT NULL THEN
        FOR v_vacation IN SELECT * FROM jsonb_array_elements(v_vacation_periods)
        LOOP
            v_vacation_start := (v_vacation->>'start')::date;
            v_vacation_end := (v_vacation->>'end')::date;
            
            IF p_date >= v_vacation_start AND p_date <= v_vacation_end THEN
                RETURN false;
            END IF;
        END LOOP;
    END IF;
    
    RETURN true;
END;
$$;

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.organizations IS 'Multi-tenant organizations (SaaS foundation)';
COMMENT ON TABLE public.organization_users IS 'Role-based access control for organizations';
COMMENT ON TABLE public.users IS 'User management and authentication';
COMMENT ON TABLE public.business_settings IS 'Per-organization configuration and preferences';

COMMENT ON COLUMN public.organizations.slug IS 'URL-friendly organization identifier';
COMMENT ON COLUMN public.organization_users.role IS 'Role: owner, admin, or staff';
COMMENT ON COLUMN public.business_settings.tax_rate IS 'Swiss VAT rate (7.7% default)';
COMMENT ON COLUMN public.business_settings.working_hours IS 'Weekly working hours configuration';
COMMENT ON COLUMN public.business_settings.booking_rules IS 'Appointment booking rules and constraints';

-- =====================================================
-- END OF 01_multi_tenant_foundation.sql (V5)
-- =====================================================
-- V5 SELF-CONTAINED DOMAINS STRUCTURE:
-- Next: 02_pos_business_complete.sql (Complete POS domain - self-contained)
-- Next: 03_banking_compliance_complete.sql (Complete Banking + Compliance domain - self-contained)  
-- Next: 04_indexes_and_final.sql (Pure technical layer - performance only)
-- =====================================================