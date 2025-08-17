-- =====================================================
-- 02_core_pos_business.sql
-- =====================================================
-- Clean Core POS Business extracted from Production
-- Source: production-schema-current-20250815-1855.sql
-- Business Logic: Complete POS System + Appointments
-- Dependencies: 01_multi_tenant_foundation.sql
-- =====================================================

-- =====================================================
-- CUSTOM TYPES & ENUMS
-- =====================================================

-- Supplier categories for expense management
CREATE TYPE public.supplier_category AS ENUM (
    'beauty_supplies',
    'equipment',
    'utilities',
    'rent',
    'insurance',
    'professional_services',
    'retail',
    'online_marketplace',
    'real_estate',
    'other'
);

-- =====================================================
-- CORE POS BUSINESS TABLES
-- =====================================================

-- Items (Service/Product Catalog)
CREATE TABLE public.items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    default_price numeric(10,2) NOT NULL,
    type text NOT NULL,
    is_favorite boolean DEFAULT false,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    organization_id uuid NOT NULL,
    duration_minutes integer,
    requires_booking boolean DEFAULT false,
    booking_buffer_minutes integer DEFAULT 0,
    deleted boolean DEFAULT false,
    CONSTRAINT items_service_duration_check CHECK ((((type = 'service'::text) AND (duration_minutes IS NOT NULL)) OR ((type = 'product'::text) AND (duration_minutes IS NULL)))),
    CONSTRAINT items_type_check CHECK ((type = ANY (ARRAY['service'::text, 'product'::text])))
);

-- Customers (Customer Management + Search)
CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    is_active boolean DEFAULT true,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_at timestamp with time zone DEFAULT now()
);

-- Customer Notes (CRM System - flexible blocks)
CREATE TABLE public.customer_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    block_name text NOT NULL,
    content text NOT NULL,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid
);

-- Sales (Revenue Transactions)
CREATE TABLE public.sales (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    notes text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    gross_amount numeric(10,3),
    provider_fee numeric(10,3),
    net_amount numeric(10,3),
    settlement_status text DEFAULT 'pending'::text,
    settlement_date date,
    provider_reference_id text,
    provider_report_id uuid,
    bank_transaction_id uuid,
    banking_status character varying(20) DEFAULT 'unmatched'::character varying,
    receipt_number character varying(20),
    organization_id uuid NOT NULL,
    customer_id uuid,
    customer_name character varying(255),
    CONSTRAINT sales_banking_status_check CHECK (((banking_status)::text = ANY (ARRAY[('unmatched'::character varying)::text, ('provider_matched'::character varying)::text, ('bank_matched'::character varying)::text, ('fully_matched'::character varying)::text]))),
    CONSTRAINT sales_payment_method_check CHECK ((payment_method = ANY (ARRAY['cash'::text, 'twint'::text, 'sumup'::text]))),
    CONSTRAINT sales_settlement_status_check CHECK ((settlement_status = ANY (ARRAY['pending'::text, 'settled'::text, 'failed'::text, 'weekend_delay'::text, 'charged_back'::text]))),
    CONSTRAINT sales_status_check CHECK ((status = ANY (ARRAY['completed'::text, 'cancelled'::text, 'refunded'::text])))
);

-- Sale Items (Transaction Line Items)
CREATE TABLE public.sale_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sale_id uuid,
    item_id uuid,
    price numeric(10,2) NOT NULL,
    notes text,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);

-- Expenses (Cost Tracking with PDF attachments)
CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    payment_method text NOT NULL,
    payment_date date NOT NULL,
    supplier_name text,
    invoice_number text,
    notes text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    bank_transaction_id uuid,
    banking_status character varying(20) DEFAULT 'unmatched'::character varying,
    receipt_number character varying(20),
    supplier_id uuid,
    organization_id uuid NOT NULL,
    CONSTRAINT check_supplier_info CHECK (((supplier_name IS NOT NULL) OR (supplier_id IS NOT NULL) OR ((supplier_name IS NULL) AND (supplier_id IS NULL)))),
    CONSTRAINT expenses_banking_status_check CHECK (((banking_status)::text = ANY (ARRAY[('unmatched'::character varying)::text, ('matched'::character varying)::text]))),
    -- CONSTRAINT expenses_category_valid CHECK (public.validate_expense_category(category, user_id)), -- Added after function creation
    CONSTRAINT expenses_payment_method_check CHECK ((payment_method = ANY (ARRAY['bank'::text, 'cash'::text])))
);

-- Suppliers (Vendor Management + Categories)
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

-- Appointments (Booking Management System)
CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    customer_id uuid,
    customer_name text,
    customer_phone text,
    notes text,
    estimated_price numeric(10,2),
    organization_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid,
    CONSTRAINT valid_price_range CHECK (((estimated_price IS NULL) OR (estimated_price >= (0)::numeric))),
    CONSTRAINT valid_time_range CHECK ((end_time > start_time))
);

-- Appointment Services (Multi-Service Appointments)
CREATE TABLE public.appointment_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    item_id uuid NOT NULL,
    service_price numeric(10,2),
    service_duration_minutes integer,
    service_notes text,
    sort_order integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_service_duration CHECK (((service_duration_minutes IS NULL) OR (service_duration_minutes > 0))),
    CONSTRAINT valid_service_price CHECK (((service_price IS NULL) OR (service_price >= (0)::numeric)))
);

-- =====================================================
-- PRIMARY KEYS & UNIQUE CONSTRAINTS
-- =====================================================

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_pkey PRIMARY KEY (id);

-- =====================================================
-- FOREIGN KEY RELATIONSHIPS
-- =====================================================

-- Items
ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Customers
ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Customer Notes
ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Sales (Note: Banking FKs will be added in 03_banking_and_compliance.sql)
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

-- Sale Items
ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey 
    FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES public.items(id);

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Expenses (Note: Banking FKs will be added in 03_banking_and_compliance.sql)
ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_supplier_id_fkey 
    FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);

-- Suppliers
ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.users(id);

-- Appointments
ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_updated_by_fkey 
    FOREIGN KEY (updated_by) REFERENCES auth.users(id);

-- Appointment Services
ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_appointment_id_fkey 
    FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE RESTRICT;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Items (Product/Service catalog optimization)
CREATE INDEX idx_items_org_active ON public.items USING btree (organization_id, active);

-- Customers (Search and organization access)
CREATE INDEX idx_customers_organization_id ON public.customers USING btree (organization_id);
CREATE INDEX idx_customers_name ON public.customers USING btree (name);
CREATE INDEX idx_customers_email ON public.customers USING btree (email) WHERE (email IS NOT NULL);
CREATE INDEX idx_customers_phone ON public.customers USING btree (phone) WHERE (phone IS NOT NULL);

-- Customer Notes (CRM performance)
CREATE INDEX idx_customer_notes_customer_id ON public.customer_notes USING btree (customer_id);
CREATE INDEX idx_customer_notes_organization_id ON public.customer_notes USING btree (organization_id);
CREATE INDEX idx_customer_notes_block_name ON public.customer_notes USING btree (block_name);

-- Sales (Revenue reporting and banking integration)
CREATE INDEX idx_sales_org_created ON public.sales USING btree (organization_id, created_at DESC);
CREATE INDEX idx_sales_created_at ON public.sales USING btree (created_at);
CREATE INDEX idx_sales_payment_method ON public.sales USING btree (payment_method);
CREATE INDEX idx_sales_banking_status ON public.sales USING btree (banking_status);
CREATE INDEX idx_sales_user_id ON public.sales USING btree (user_id);
CREATE INDEX idx_sales_customer_id ON public.sales USING btree (customer_id) WHERE (customer_id IS NOT NULL);
CREATE INDEX idx_sales_customer_name ON public.sales USING btree (customer_name) WHERE (customer_name IS NOT NULL);
CREATE INDEX idx_sales_receipt_number ON public.sales USING btree (receipt_number);

-- Sale Items (Transaction details)
CREATE INDEX idx_sale_items_org_user ON public.sale_items USING btree (organization_id, user_id);
CREATE INDEX idx_sale_items_user_id ON public.sale_items USING btree (user_id);

-- Expenses (Cost management and banking integration)
CREATE INDEX idx_expenses_org_date ON public.expenses USING btree (organization_id, payment_date DESC);
CREATE INDEX idx_expenses_payment_date ON public.expenses USING btree (payment_date);
CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);
CREATE INDEX idx_expenses_user_id ON public.expenses USING btree (user_id);
CREATE INDEX idx_expenses_supplier_id ON public.expenses USING btree (supplier_id);
CREATE INDEX idx_expenses_receipt_number ON public.expenses USING btree (receipt_number);

-- Suppliers (Vendor search and management)
CREATE INDEX idx_suppliers_normalized_name ON public.suppliers USING btree (normalized_name);
CREATE INDEX idx_suppliers_category ON public.suppliers USING btree (category);
CREATE INDEX idx_suppliers_active ON public.suppliers USING btree (is_active);
CREATE INDEX idx_suppliers_created_at ON public.suppliers USING btree (created_at);
CREATE INDEX idx_suppliers_name_fts ON public.suppliers USING gin (to_tsvector('german'::regconfig, (name)::text));

-- Appointments (Booking system optimization)
CREATE INDEX idx_appointments_organization_date ON public.appointments USING btree (organization_id, appointment_date);
CREATE INDEX idx_appointments_date_range ON public.appointments USING btree (appointment_date, start_time, end_time);
CREATE INDEX idx_appointments_customer ON public.appointments USING btree (customer_id) WHERE (customer_id IS NOT NULL);

-- Appointment Services (Multi-service appointments)
CREATE INDEX idx_appointment_services_appointment ON public.appointment_services USING btree (appointment_id);
CREATE INDEX idx_appointment_services_item ON public.appointment_services USING btree (item_id);
CREATE INDEX idx_appointment_services_sort ON public.appointment_services USING btree (appointment_id, sort_order);

-- =====================================================
-- BUSINESS FUNCTIONS (POS SYSTEM)
-- =====================================================

-- Validate expense category (supports custom categories per organization)
CREATE OR REPLACE FUNCTION public.validate_expense_category(category_key text, user_id_param uuid) 
RETURNS boolean
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
  business_settings_record RECORD;                                                                                                                                                                                                       
  default_categories TEXT[] := ARRAY['rent', 'supplies', 'salary', 'utilities', 'insurance', 'other'];                                                                                                                                   
BEGIN                                                                                                                                                                                                                                    
  -- Allow default categories                                                                                                                                                                                                            
  IF category_key = ANY(default_categories) THEN                                                                                                                                                                                         
    RETURN TRUE;                                                                                                                                                                                                                         
  END IF;                                                                                                                                                                                                                                
                                                                                                                                                                                                                                         
  -- Get organization's custom categories                                                                                                                                                                                                
  SELECT bs.custom_expense_categories                                                                                                                                                                                                    
  INTO business_settings_record                                                                                                                                                                                                         
  FROM business_settings bs                                                                                                                                                                                                              
  JOIN organization_users ou ON bs.organization_id = ou.organization_id                                                                                                                                                                 
  WHERE ou.user_id = user_id_param AND ou.active = true;                                                                                                                                                                                
                                                                                                                                                                                                                                         
  -- Check custom categories                                                                                                                                                                                                             
  IF business_settings_record.custom_expense_categories IS NOT NULL THEN                                                                                                                                                                
    IF jsonb_typeof(business_settings_record.custom_expense_categories) = 'object' THEN                                                                                                                                                 
      IF business_settings_record.custom_expense_categories ? category_key THEN                                                                                                                                                         
        RETURN TRUE;                                                                                                                                                                                                                     
      END IF;                                                                                                                                                                                                                            
    END IF;                                                                                                                                                                                                                              
  END IF;                                                                                                                                                                                                                                
                                                                                                                                                                                                                                         
  -- Category not found                                                                                                                                                                                                                  
  RETURN FALSE;                                                                                                                                                                                                                          
END;                                                                                                                                                                                                                                     
$$;

-- Add expense category validation constraint after function creation
ALTER TABLE public.expenses 
    ADD CONSTRAINT expenses_category_valid 
    CHECK (public.validate_expense_category(category, user_id));

-- =====================================================
-- ROW LEVEL SECURITY (MULTI-TENANT POS ACCESS)
-- =====================================================

-- Enable RLS on all POS tables
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;

-- Standard organization-scoped access pattern
CREATE POLICY items_organization_access ON public.items 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY customers_organization_policy ON public.customers 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY customer_notes_organization_policy ON public.customer_notes 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY sales_organization_access ON public.sales 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY sale_items_organization_access ON public.sale_items 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY expenses_org_access ON public.expenses TO authenticated 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY suppliers_organization_access ON public.suppliers 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY appointments_organization_policy ON public.appointments 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY appointment_services_organization_access ON public.appointment_services 
    USING (appointment_id IN (
        SELECT appointments.id
        FROM public.appointments
        WHERE appointments.organization_id IN (
            SELECT organization_users.organization_id
            FROM public.organization_users
            WHERE organization_users.user_id = auth.uid() AND organization_users.active = true
        )
    ));

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.items IS 'Service and product catalog for POS system';
COMMENT ON TABLE public.customers IS 'Customer management and contact information';
COMMENT ON TABLE public.customer_notes IS 'Flexible CRM system with block-based notes';
COMMENT ON TABLE public.sales IS 'Revenue transactions with banking integration';
COMMENT ON TABLE public.sale_items IS 'Line items for each sale transaction';
COMMENT ON TABLE public.expenses IS 'Cost tracking with supplier and banking integration';
COMMENT ON TABLE public.suppliers IS 'Vendor management with categorization';
COMMENT ON TABLE public.appointments IS 'Booking management system';
COMMENT ON TABLE public.appointment_services IS 'Multi-service appointment support';

COMMENT ON COLUMN public.items.type IS 'service (requires duration) or product';
COMMENT ON COLUMN public.items.duration_minutes IS 'Required for services, NULL for products';
COMMENT ON COLUMN public.sales.banking_status IS 'Banking reconciliation status workflow';
COMMENT ON COLUMN public.expenses.category IS 'Validated against default + custom categories';
COMMENT ON COLUMN public.suppliers.normalized_name IS 'Lowercase, trimmed name for matching';

-- =====================================================
-- END OF 02_core_pos_business.sql
-- =====================================================
-- Next: 03_banking_and_compliance.sql (Swiss Banking + Legal)
-- Next: 04_performance_and_security.sql (Final indexes + views)
-- =====================================================