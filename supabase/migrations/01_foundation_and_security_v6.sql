-- =====================================================
-- 01_foundation_and_security_v6.sql
-- =====================================================
-- Complete Multi-Tenant Foundation + Security Layer (V6)
-- Business Logic: Organizations, Users, Security, User Automation
-- Dependencies: None (Foundation layer)
-- V6 Enhancement: Complete user automation + production-ready security
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
-- CRITICAL POSTGRESQL GRANTS (PRODUCTION-READY SECURITY)
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
-- MULTI-TENANT SECURITY PATTERN (PRODUCTION-READY)
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
-- USER AUTOMATION SYSTEM (V6 COMPLETE)
-- =====================================================

-- Enhanced handle_new_user function with V6 compatibility
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_name TEXT;
    user_username TEXT;
BEGIN
    -- Extract user data with fallbacks
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name', 
        split_part(NEW.email, '@', 1)
    );
    
    user_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
    );
    
    -- Make username unique if already exists
    WHILE EXISTS (SELECT 1 FROM public.users WHERE username = user_username) LOOP
        user_username := user_username || '_' || floor(random() * 1000)::text;
    END LOOP;
    
    -- Insert user with SECURITY DEFINER to bypass RLS
    INSERT INTO public.users (id, name, username, email, role, active)
    VALUES (
        NEW.id,
        user_name,
        user_username,
        NEW.email,
        'admin', -- Default role for new users
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        email = NEW.email,
        name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', users.name),
        active = CASE 
            WHEN NEW.email_confirmed_at IS NOT NULL THEN true 
            ELSE users.active 
        END;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail auth
        RAISE LOG 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- User deletion handler function
CREATE OR REPLACE FUNCTION public.handle_user_delete() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- Soft delete: mark user as inactive instead of hard delete
    UPDATE public.users 
    SET active = FALSE 
    WHERE id = OLD.id;
    
    RETURN OLD;
END;
$$;

-- Grant necessary permissions for trigger execution
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Enhanced RLS policy for user insertion (allows trigger operations)
CREATE POLICY users_insert_enhanced ON public.users FOR INSERT 
    WITH CHECK (
        id = auth.uid() OR 
        auth.role() = 'service_role' OR
        current_setting('role') = 'supabase_auth_admin'
    );

-- Service role bypass for administrative operations
CREATE POLICY "Enable all access for service role users" ON public.users
    AS PERMISSIVE FOR ALL TO service_role 
    USING (true);

-- Auth admin bypass for trigger operations  
CREATE POLICY "Enable all access for auth admin users" ON public.users
    AS PERMISSIVE FOR ALL TO supabase_auth_admin
    USING (true);

-- Create trigger for automatic user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
    FOR EACH ROW 
    WHEN (NEW.email_confirmed_at IS NOT NULL) -- Only trigger for confirmed users
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions for triggers to work
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- =====================================================
-- STORAGE INFRASTRUCTURE (V6 COMPLETE)
-- =====================================================

-- Create Storage Buckets for file management
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', true, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('business-logos', 'business-logos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

-- Storage RLS Policies (Organization-scoped file access)
CREATE POLICY "Users manage organization documents" ON storage.objects 
FOR ALL TO authenticated
USING ((bucket_id = 'documents') AND ((storage.foldername(name))[1] IN (
  SELECT (organization_users.organization_id)::text 
  FROM public.organization_users 
  WHERE organization_users.user_id = auth.uid() AND organization_users.active = true
)));

CREATE POLICY "Users manage organization logos" ON storage.objects 
FOR ALL TO authenticated
USING ((bucket_id = 'business-logos') AND ((storage.foldername(name))[1] IN (
  SELECT (organization_users.organization_id)::text 
  FROM public.organization_users 
  WHERE organization_users.user_id = auth.uid() AND organization_users.active = true
)));

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
-- ORGANIZATION BOOTSTRAP SYSTEM (V6 COMPLETE)
-- =====================================================

-- Bootstrap document sequences for new organization
CREATE OR REPLACE FUNCTION public.bootstrap_organization_sequences(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sequences_created INTEGER := 0;
    sequence_types TEXT[] := ARRAY['sale_receipt', 'expense_receipt', 'cash_movement', 'bank_transaction'];
    seq_type TEXT;
    current_year INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Create default document sequences for organization
    FOREACH seq_type IN ARRAY sequence_types
    LOOP
        -- Only create if doesn't exist for this org and year
        IF NOT EXISTS (
            SELECT 1 FROM document_sequences 
            WHERE document_sequences.sequence_type = seq_type 
            AND document_sequences.organization_id = p_organization_id 
            AND document_sequences.year = current_year
        ) THEN
            INSERT INTO document_sequences 
            (sequence_type, current_number, prefix, year, reset_yearly, organization_id, created_at, updated_at)
            VALUES 
            (
                seq_type,
                1, -- Start at 1 (constraint requirement)
                CASE seq_type
                    WHEN 'sale_receipt' THEN 'VK-'
                    WHEN 'expense_receipt' THEN 'AK-'
                    WHEN 'cash_movement' THEN 'CM-'
                    WHEN 'bank_transaction' THEN 'BT-'
                    ELSE 'DOC-'
                END,
                current_year,
                true,
                p_organization_id,
                NOW(),
                NOW()
            );
            sequences_created := sequences_created + 1;
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object(
        'organization_id', p_organization_id,
        'sequences_created', sequences_created,
        'sequence_types', sequence_types,
        'year', current_year,
        'bootstrap_timestamp', NOW()
    );
END;
$$;

-- Complete organization bootstrap (sequences + settings check)
CREATE OR REPLACE FUNCTION public.bootstrap_organization_complete(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sequences_result jsonb;
    settings_exists boolean;
    result jsonb;
BEGIN
    -- Bootstrap document sequences
    SELECT bootstrap_organization_sequences(p_organization_id) INTO sequences_result;
    
    -- Check if business settings exist
    SELECT EXISTS (
        SELECT 1 FROM business_settings 
        WHERE organization_id = p_organization_id
    ) INTO settings_exists;
    
    -- If no business settings, create default
    IF NOT settings_exists THEN
        INSERT INTO business_settings (organization_id, created_at, updated_at)
        VALUES (p_organization_id, NOW(), NOW());
    END IF;
    
    SELECT jsonb_build_object(
        'organization_id', p_organization_id,
        'sequences_bootstrap', sequences_result,
        'business_settings_created', NOT settings_exists,
        'bootstrap_complete', true,
        'bootstrap_timestamp', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permissions for bootstrap functions
GRANT EXECUTE ON FUNCTION public.bootstrap_organization_sequences(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_organization_complete(uuid) TO authenticated;

-- Organization auto-bootstrap trigger function
CREATE OR REPLACE FUNCTION public.trigger_bootstrap_new_organization() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- Auto-bootstrap new organization with sequences and settings
    PERFORM bootstrap_organization_complete(NEW.id);
    RETURN NEW;
END;
$$;

-- Grant execute permissions for auto-bootstrap trigger
GRANT EXECUTE ON FUNCTION public.trigger_bootstrap_new_organization() TO authenticated;

-- =====================================================
-- VALIDATION FUNCTIONS
-- =====================================================

-- Function to test user creation automation
CREATE OR REPLACE FUNCTION public.test_user_automation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    trigger_exists boolean;
    policies_exist integer;
BEGIN
    -- Check if trigger exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
        AND event_object_table = 'users'
        AND event_object_schema = 'auth'
    ) INTO trigger_exists;
    
    -- Check if policies exist
    SELECT count(*) INTO policies_exist
    FROM pg_policies 
    WHERE tablename = 'users' 
    AND schemaname = 'public'
    AND policyname IN ('users_insert_enhanced', 'Enable all access for service role users', 'Enable all access for auth admin users');
    
    SELECT jsonb_build_object(
        'trigger_exists', trigger_exists,
        'policies_count', policies_exist,
        'expected_policies', 3,
        'automation_ready', (trigger_exists AND policies_exist = 3),
        'checked_at', now()
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant test function to authenticated users
GRANT EXECUTE ON FUNCTION public.test_user_automation() TO authenticated;

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

COMMENT ON FUNCTION public.handle_new_user() IS 'CRITICAL: Automatically creates public.users record when auth.users is created. Required for registration page';
COMMENT ON FUNCTION public.test_user_automation() IS 'Tests user automation setup - trigger and policies must exist for registration to work';
COMMENT ON FUNCTION public.get_booking_rules(uuid) IS 'Returns booking rules for organization with fallback defaults';
COMMENT ON FUNCTION public.get_working_hours(uuid, text) IS 'Returns working hours for organization and weekday with fallback defaults';
COMMENT ON FUNCTION public.is_organization_open(uuid, date, time) IS 'Checks if organization is open at specific date/time considering working hours, breaks, and vacations';
COMMENT ON FUNCTION public.bootstrap_organization_sequences(uuid) IS 'CRITICAL: Creates default document sequences for new organization (sales, expenses, cash, bank)';
COMMENT ON FUNCTION public.bootstrap_organization_complete(uuid) IS 'COMPLETE: Bootstrap function that initializes all necessary organization setup (sequences + settings)';

-- =====================================================
-- SYSTEM VALIDATION
-- =====================================================

-- Validate user automation setup
DO $$
DECLARE
    automation_status jsonb;
    is_ready boolean;
BEGIN
    SELECT public.test_user_automation() INTO automation_status;
    SELECT automation_status->>'automation_ready' = 'true' INTO is_ready;
    
    IF is_ready THEN
        RAISE NOTICE '✅ SUCCESS: User automation configured correctly';
        RAISE NOTICE '✅ Trigger: on_auth_user_created created';
        RAISE NOTICE '✅ RLS Policies: 3 policies configured';
        RAISE NOTICE '✅ Registration flow: Ready for testing';
    ELSE
        RAISE WARNING '⚠️  User automation setup incomplete: %', automation_status;
    END IF;
END;
$$;

-- Validate final RLS state
DO $$
DECLARE
    orgs_rls BOOLEAN;
    org_users_rls BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Check organizations RLS is disabled
    SELECT rowsecurity INTO orgs_rls 
    FROM pg_tables 
    WHERE tablename = 'organizations' AND schemaname = 'public';
    
    -- Check organization_users RLS is enabled
    SELECT rowsecurity INTO org_users_rls 
    FROM pg_tables 
    WHERE tablename = 'organization_users' AND schemaname = 'public';
    
    -- Count organization_users policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'organization_users';
    
    IF orgs_rls = false AND org_users_rls = true AND policy_count = 4 THEN
        RAISE NOTICE '🎉 SUCCESS: Multi-Tenant Security Pattern correctly configured!';
        RAISE NOTICE '✅ organizations: RLS disabled (users can create orgs)';
        RAISE NOTICE '✅ organization_users: RLS enabled with 4 individual policies';
        RAISE NOTICE '✅ Registration flow: Ready for production testing';
    ELSE
        RAISE WARNING '⚠️  RLS configuration issue: orgs_rls=%, org_users_rls=%, policies=%', 
            orgs_rls, org_users_rls, policy_count;
    END IF;
END;
$$;

-- =====================================================
-- END OF 01_foundation_and_security_v6.sql (V6)
-- =====================================================
-- V6 DOMAIN-FOCUSED STRUCTURE:
-- ✅ 01_foundation_and_security_v6.sql (Foundation + Security + User Automation)
-- Next: 02_core_business_logic_v6.sql (POS + ALL business functions)
-- Next: 03_banking_and_compliance_v6.sql (Banking + Compliance + Reconciliation)
-- Next: 04_automation_and_triggers_v6.sql (ALL triggers + auto-numbering)
-- Next: 05_performance_and_validation_v6.sql (Indexes + Validation + Final)
-- =====================================================