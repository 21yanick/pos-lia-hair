-- =====================================================
-- 02_core_business_logic_v6.sql
-- =====================================================
-- Complete POS Business Domain + ALL Business Functions (V6)
-- Business Logic: POS System + Cash Management + Financial Reporting
-- Dependencies: 01_foundation_and_security_v6.sql
-- V6 Enhancement: ALL 39 missing business functions integrated
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
    CONSTRAINT expenses_payment_method_check CHECK ((payment_method = ANY (ARRAY['bank'::text, 'cash'::text])))
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

-- Cash Movements (Cash Flow Tracking) - V6 ADDITION
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
    CONSTRAINT cash_movements_banking_status_check CHECK (((banking_status)::text = ANY (ARRAY[('unmatched'::character varying)::text, ('matched'::character varying)::text]))),
    CONSTRAINT cash_movements_movement_type_check CHECK (((movement_type)::text = ANY (ARRAY[('cash_operation'::character varying)::text, ('bank_transfer'::character varying)::text]))),
    CONSTRAINT cash_movements_reference_type_check CHECK ((reference_type = ANY (ARRAY['sale'::text, 'expense'::text, 'adjustment'::text, 'owner_transaction'::text]))),
    CONSTRAINT cash_movements_type_check CHECK ((type = ANY (ARRAY['cash_in'::text, 'cash_out'::text])))
);

-- Owner Transactions (Owner Draws/Investments) - V6 ADDITION
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
    CONSTRAINT owner_transactions_banking_status_check CHECK (((banking_status)::text = ANY (ARRAY[('unmatched'::character varying)::text, ('matched'::character varying)::text]))),
    CONSTRAINT owner_transactions_payment_method_check CHECK (((payment_method)::text = ANY (ARRAY[('bank_transfer'::character varying)::text, ('private_card'::character varying)::text, ('private_cash'::character varying)::text]))),
    CONSTRAINT owner_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY (ARRAY[('deposit'::character varying)::text, ('expense'::character varying)::text, ('withdrawal'::character varying)::text])))
);

-- Documents (PDF Receipts & File Management) - V6 ADDITION
CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    reference_id uuid NOT NULL,
    file_path text NOT NULL,
    payment_method text,
    document_date date NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    file_name text,
    file_size integer,
    mime_type text DEFAULT 'application/pdf'::text,
    reference_type text,
    notes text,
    document_number character varying(20),
    organization_id uuid,
    CONSTRAINT documents_payment_method_check CHECK ((payment_method = ANY (ARRAY['cash'::text, 'twint'::text, 'sumup'::text, 'bank'::text]))),
    CONSTRAINT documents_reference_type_check CHECK ((reference_type = ANY (ARRAY['sale'::text, 'expense'::text, 'report'::text]))),
    CONSTRAINT documents_type_check CHECK ((type = ANY (ARRAY['receipt'::text, 'daily_report'::text, 'monthly_report'::text, 'yearly_report'::text, 'expense_receipt'::text])))
);

-- =====================================================
-- AUDIT SYSTEM (Financial Compliance & Logging)
-- =====================================================

-- Audit log table for financial transactions tracking
CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    action text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    user_id uuid NOT NULL,
    timestamp timestamp with time zone DEFAULT now(),
    ip_address inet,
    organization_id uuid,
    session_id text,
    is_immutable boolean DEFAULT true,
    CONSTRAINT audit_log_action_check CHECK ((action = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

-- =====================================================
-- BUSINESS FUNCTIONS (V6 COMPLETE - ALL MISSING FUNCTIONS)
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

-- Normalize supplier name (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.normalize_supplier_name(supplier_name text) 
RETURNS text
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
BEGIN                                                                                                                                                                                                                                    
  RETURN lower(trim(regexp_replace(supplier_name, '[^a-zA-Z0-9\s]', '', 'g')));                                                                                                                                                          
END;                                                                                                                                                                                                                                     
$$;

-- Get or create supplier (V6 ADDITION - CRITICAL FOR AUTO-POPULATION)
CREATE OR REPLACE FUNCTION public.get_or_create_supplier(supplier_name_input text, user_id_input uuid DEFAULT NULL::uuid) 
RETURNS uuid
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
  normalized_name_var TEXT;                                                                                                                                                                                                              
  supplier_id_result UUID;                                                                                                                                                                                                               
  default_user_id UUID;                                                                                                                                                                                                                  
BEGIN                                                                                                                                                                                                                                    
  -- Return NULL if no supplier name provided                                                                                                                                                                                            
  IF supplier_name_input IS NULL OR trim(supplier_name_input) = '' THEN                                                                                                                                                                  
    RETURN NULL;                                                                                                                                                                                                                         
  END IF;                                                                                                                                                                                                                                
                                                                                                                                                                                                                                         
  -- Normalize the name                                                                                                                                                                                                                  
  normalized_name_var := normalize_supplier_name(supplier_name_input);                                                                                                                                                                   
                                                                                                                                                                                                                                         
  -- Try to find existing supplier                                                                                                                                                                                                       
  SELECT id INTO supplier_id_result                                                                                                                                                                                                      
  FROM suppliers                                                                                                                                                                                                                         
  WHERE normalized_name = normalized_name_var;                                                                                                                                                                                           
                                                                                                                                                                                                                                         
  -- If found, return the ID                                                                                                                                                                                                             
  IF supplier_id_result IS NOT NULL THEN                                                                                                                                                                                                 
    RETURN supplier_id_result;                                                                                                                                                                                                           
  END IF;                                                                                                                                                                                                                                
                                                                                                                                                                                                                                         
  -- Get default user if none provided                                                                                                                                                                                                   
  IF user_id_input IS NULL THEN                                                                                                                                                                                                          
    SELECT id INTO default_user_id                                                                                                                                                                                                       
    FROM users                                                                                                                                                                                                                           
    WHERE role = 'admin'                                                                                                                                                                                                                 
    LIMIT 1;                                                                                                                                                                                                                             
  ELSE                                                                                                                                                                                                                                   
    default_user_id := user_id_input;                                                                                                                                                                                                    
  END IF;                                                                                                                                                                                                                                
                                                                                                                                                                                                                                         
  -- Create new supplier if not found                                                                                                                                                                                                    
  INSERT INTO suppliers (name, normalized_name, category, created_by, notes)                                                                                                                                                             
  VALUES (                                                                                                                                                                                                                               
    trim(supplier_name_input),                                                                                                                                                                                                           
    normalized_name_var,                                                                                                                                                                                                                 
    'other'::supplier_category,                                                                                                                                                                                                          
    default_user_id,                                                                                                                                                                                                                     
    'Auto-created from expense entry'                                                                                                                                                                                                    
  )                                                                                                                                                                                                                                      
  RETURNING id INTO supplier_id_result;                                                                                                                                                                                                   
                                                                                                                                                                                                                                         
  RETURN supplier_id_result;                                                                                                                                                                                                             
END;                                                                                                                                                                                                                                     
$$;

-- Get current cash balance (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.get_current_cash_balance() 
RETURNS numeric
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
    balance DECIMAL(10,2) := 0;                                                                                                                                                                                                          
BEGIN                                                                                                                                                                                                                                    
    SELECT COALESCE(SUM(                                                                                                                                                                                                                 
        CASE                                                                                                                                                                                                                             
            WHEN type = 'cash_in' THEN amount                                                                                                                                                                                            
            WHEN type = 'cash_out' THEN -amount                                                                                                                                                                                          
            ELSE 0                                                                                                                                                                                                                       
        END                                                                                                                                                                                                                              
    ), 0) INTO balance                                                                                                                                                                                                                   
    FROM cash_movements;                                                                                                                                                                                                                 
                                                                                                                                                                                                                                         
    RETURN balance;                                                                                                                                                                                                                      
END;                                                                                                                                                                                                                                     
$$;

-- Get current cash balance for organization (V6 ADDITION - CRITICAL CONSOLE ERROR FIX)
CREATE OR REPLACE FUNCTION public.get_current_cash_balance_for_org(org_id uuid) 
RETURNS numeric
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
    balance DECIMAL(10,2) := 0;                                                                                                                                                                                                          
BEGIN                                                                                                                                                                                                                                    
    SELECT COALESCE(SUM(                                                                                                                                                                                                                 
        CASE                                                                                                                                                                                                                             
            WHEN type = 'cash_in' THEN amount                                                                                                                                                                                            
            WHEN type = 'cash_out' THEN -amount                                                                                                                                                                                          
            ELSE 0                                                                                                                                                                                                                       
        END                                                                                                                                                                                                                              
    ), 0) INTO balance                                                                                                                                                                                                                   
    FROM cash_movements                                                                                                                                                                                                                  
    WHERE organization_id = org_id;                                                                                                                                                                                                      
                                                                                                                                                                                                                                         
    RETURN balance;                                                                                                                                                                                                                      
END;                                                                                                                                                                                                                                     
$$;

-- Get net revenue for period (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.get_net_revenue_for_period(start_date date, end_date date) 
RETURNS numeric
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
BEGIN                                                                                                                                                                                                                                    
    RETURN (                                                                                                                                                                                                                             
        SELECT COALESCE(SUM(                                                                                                                                                                                                             
            CASE                                                                                                                                                                                                                         
                WHEN s.payment_method IN ('twint', 'sumup')                                                                                                                                                                              
                THEN s.total_amount - COALESCE(pr.fees, 0)                                                                                                                                                                               
                ELSE s.total_amount                                                                                                                                                                                                      
            END                                                                                                                                                                                                                          
        ), 0)                                                                                                                                                                                                                            
        FROM sales s                                                                                                                                                                                                                     
        LEFT JOIN provider_reports pr ON s.id = pr.sale_id                                                                                                                                                                               
        WHERE s.status = 'completed'                                                                                                                                                                                                     
        AND s.banking_status IN ('provider_matched', 'fully_matched')                                                                                                                                                                    
        AND DATE(s.created_at) BETWEEN start_date AND end_date                                                                                                                                                                           
    );                                                                                                                                                                                                                                   
END;                                                                                                                                                                                                                                     
$$;

-- Get net profit for period (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.get_net_profit_for_period(start_date date, end_date date) 
RETURNS numeric
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
    net_revenue DECIMAL(10,2);                                                                                                                                                                                                           
    total_expenses DECIMAL(10,2);                                                                                                                                                                                                        
BEGIN                                                                                                                                                                                                                                    
    -- Get net revenue (after provider fees)                                                                                                                                                                                             
    SELECT get_net_revenue_for_period(start_date, end_date) INTO net_revenue;                                                                                                                                                            
                                                                                                                                                                                                                                         
    -- Get total expenses for the period                                                                                                                                                                                                 
    SELECT COALESCE(SUM(amount), 0)                                                                                                                                                                                                      
    INTO total_expenses                                                                                                                                                                                                                  
    FROM expenses                                                                                                                                                                                                                        
    WHERE payment_date BETWEEN start_date AND end_date;                                                                                                                                                                                  
                                                                                                                                                                                                                                         
    RETURN net_revenue - total_expenses;                                                                                                                                                                                                 
END;                                                                                                                                                                                                                                     
$$;

-- Get revenue breakdown for period (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.get_revenue_breakdown_for_period(start_date date, end_date date) 
RETURNS TABLE(gross_revenue numeric, total_fees numeric, net_revenue numeric, cash_revenue numeric, provider_revenue numeric)
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
BEGIN                                                                                                                                                                                                                                    
    RETURN QUERY                                                                                                                                                                                                                         
    SELECT                                                                                                                                                                                                                               
        COALESCE(SUM(s.total_amount), 0) as gross_revenue,                                                                                                                                                                               
        COALESCE(SUM(                                                                                                                                                                                                                    
            CASE                                                                                                                                                                                                                         
                WHEN s.payment_method IN ('twint', 'sumup')                                                                                                                                                                              
                THEN COALESCE(pr.fees, 0)                                                                                                                                                                                                
                ELSE 0                                                                                                                                                                                                                   
            END                                                                                                                                                                                                                          
        ), 0) as total_fees,                                                                                                                                                                                                             
        COALESCE(SUM(                                                                                                                                                                                                                    
            CASE                                                                                                                                                                                                                         
                WHEN s.payment_method IN ('twint', 'sumup')                                                                                                                                                                              
                THEN s.total_amount - COALESCE(pr.fees, 0)                                                                                                                                                                               
                ELSE s.total_amount                                                                                                                                                                                                      
            END                                                                                                                                                                                                                          
        ), 0) as net_revenue,                                                                                                                                                                                                            
        COALESCE(SUM(                                                                                                                                                                                                                    
            CASE                                                                                                                                                                                                                         
                WHEN s.payment_method = 'cash'                                                                                                                                                                                           
                THEN s.total_amount                                                                                                                                                                                                      
                ELSE 0                                                                                                                                                                                                                   
            END                                                                                                                                                                                                                          
        ), 0) as cash_revenue,                                                                                                                                                                                                           
        COALESCE(SUM(                                                                                                                                                                                                                    
            CASE                                                                                                                                                                                                                         
                WHEN s.payment_method IN ('twint', 'sumup')                                                                                                                                                                              
                THEN s.total_amount - COALESCE(pr.fees, 0)                                                                                                                                                                               
                ELSE 0                                                                                                                                                                                                                   
            END                                                                                                                                                                                                                          
        ), 0) as provider_revenue                                                                                                                                                                                                        
    FROM sales s                                                                                                                                                                                                                         
    LEFT JOIN provider_reports pr ON s.id = pr.sale_id                                                                                                                                                                                   
    WHERE s.status = 'completed'                                                                                                                                                                                                         
    AND s.banking_status IN ('provider_matched', 'fully_matched')                                                                                                                                                                        
    AND DATE(s.created_at) BETWEEN start_date AND end_date;                                                                                                                                                                              
END;
$$;

-- Create bank transfer cash movement (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.create_bank_transfer_cash_movement(p_user_id uuid, p_amount numeric, p_description text, p_direction character varying, p_organization_id uuid) 
RETURNS uuid
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
    v_cash_movement_id UUID;                                                                                                                                                                                                             
    v_final_amount DECIMAL(10,2);                                                                                                                                                                                                        
    v_final_description TEXT;                                                                                                                                                                                                            
    v_type VARCHAR(10);                                                                                                                                                                                                                  
BEGIN                                                                                                                                                                                                                                    
    v_final_amount := ABS(p_amount);                                                                                                                                                                                                     
                                                                                                                                                                                                                                         
    IF p_direction = 'to_bank' THEN                                                                                                                                                                                                      
        v_final_description := CONCAT('Zur Bank gebracht: ', p_description);                                                                                                                                                             
        v_type := 'cash_out';                                                                                                                                                                                                            
    ELSIF p_direction = 'from_bank' THEN                                                                                                                                                                                                 
        v_final_description := CONCAT('Von Bank geholt: ', p_description);                                                                                                                                                               
        v_type := 'cash_in';                                                                                                                                                                                                             
    ELSE                                                                                                                                                                                                                                 
        RAISE EXCEPTION 'Invalid direction. Use "to_bank" or "from_bank"';                                                                                                                                                               
    END IF;                                                                                                                                                                                                                              
                                                                                                                                                                                                                                         
    INSERT INTO cash_movements (                                                                                                                                                                                                         
        user_id,                                                                                                                                                                                                                         
        amount,                                                                                                                                                                                                                          
        type,                                                                                                                                                                                                                            
        description,                                                                                                                                                                                                                     
        organization_id,                                                                                                                                                                                                                 
        movement_type,                                                                                                                                                                                                                   
        banking_status,                                                                                                                                                                                                                  
        created_at                                                                                                                                                                                                                       
    ) VALUES (                                                                                                                                                                                                                           
        p_user_id,                                                                                                                                                                                                                       
        v_final_amount,                                                                                                                                                                                                                  
        v_type,                                                                                                                                                                                                                          
        v_final_description,                                                                                                                                                                                                             
        p_organization_id,                                                                                                                                                                                                               
        'bank_transfer',                                                                                                                                                                                                                 
        'unmatched',                                                                                                                                                                                                                     
        NOW()                                                                                                                                                                                                                            
    ) RETURNING id INTO v_cash_movement_id;                                                                                                                                                                                               
                                                                                                                                                                                                                                         
    RETURN v_cash_movement_id;                                                                                                                                                                                                           
END;                                                                                                                                                                                                                                     
$$;

-- Get owner loan balance (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.get_owner_loan_balance(user_uuid uuid) 
RETURNS numeric
LANGUAGE plpgsql SECURITY DEFINER
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
    total_expenses DECIMAL(10,2) := 0;                                                                                                                                                                                                   
    total_deposits DECIMAL(10,2) := 0;                                                                                                                                                                                                   
    total_withdrawals DECIMAL(10,2) := 0;                                                                                                                                                                                                
BEGIN                                                                                                                                                                                                                                    
    -- Owner paid for business expenses (Owner gave money to business)                                                                                                                                                                   
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses                                                                                                                                                                                  
    FROM owner_transactions                                                                                                                                                                                                              
    WHERE user_id = user_uuid AND transaction_type = 'expense';                                                                                                                                                                          
                                                                                                                                                                                                                                         
    -- Owner deposited money into business (Owner gave money to business)                                                                                                                                                                
    SELECT COALESCE(SUM(amount), 0) INTO total_deposits                                                                                                                                                                                  
    FROM owner_transactions                                                                                                                                                                                                              
    WHERE user_id = user_uuid AND transaction_type = 'deposit';                                                                                                                                                                          
                                                                                                                                                                                                                                         
    -- Owner withdrew money from business (Business gave money to Owner)                                                                                                                                                                 
    SELECT COALESCE(SUM(amount), 0) INTO total_withdrawals                                                                                                                                                                               
    FROM owner_transactions                                                                                                                                                                                                              
    WHERE user_id = user_uuid AND transaction_type = 'withdrawal';                                                                                                                                                                       
                                                                                                                                                                                                                                         
    -- Calculation:                                                                                                                                                                                                                      
    -- Positive = Business owes Owner money                                                                                                                                                                                              
    -- Negative = Owner owes Business money                                                                                                                                                                                              
    -- Formula: (Owner gave) - (Owner received) = (Expenses + Deposits) - Withdrawals                                                                                                                                                    
    RETURN (total_expenses + total_deposits - total_withdrawals);                                                                                                                                                                        
END;                                                                                                                                                                                                                                     
$$;

-- Financial audit trigger function for compliance logging
CREATE OR REPLACE FUNCTION public.log_financial_changes() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only log for financial tables
    IF TG_TABLE_NAME IN ('sales', 'sale_items', 'expenses', 'cash_movements') THEN
        INSERT INTO audit_log (
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            user_id,
            ip_address,
            organization_id
        ) VALUES (
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            TG_OP,
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
            COALESCE(NEW.user_id, OLD.user_id),
            inet_client_addr(),
            COALESCE(NEW.organization_id, OLD.organization_id)
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

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

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_document_number_key UNIQUE (document_number);

-- =====================================================
-- LATE CONSTRAINTS (AFTER FUNCTIONS)
-- =====================================================

-- Add expense category validation constraint after function creation
ALTER TABLE public.expenses 
    ADD CONSTRAINT expenses_category_valid 
    CHECK (public.validate_expense_category(category, user_id));

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

-- Sales
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

-- Expenses
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

-- Cash Movements
ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Owner Transactions
ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

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
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY cash_movements_organization_access ON public.cash_movements 
    USING (organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() AND active = true
    ));

CREATE POLICY owner_transactions_access ON public.owner_transactions 
    USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));

CREATE POLICY documents_organization_access ON public.documents 
    USING (organization_id IN (
        SELECT organization_users.organization_id
        FROM public.organization_users
        WHERE organization_users.user_id = auth.uid() AND organization_users.active = true
    ));

-- =====================================================
-- BUSINESS VIEWS (V6 ADDITION)
-- =====================================================

-- Appointments with aggregated services view (CRITICAL for frontend)
CREATE OR REPLACE VIEW public.appointments_with_services AS
SELECT 
    a.*,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', i.id,
                'name', i.name,
                'price', COALESCE(aps.service_price, i.default_price),
                'duration_minutes', COALESCE(aps.service_duration_minutes, i.duration_minutes),
                'notes', aps.service_notes,
                'sort_order', aps.sort_order
            )
            ORDER BY aps.sort_order
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
    ) as services,
    
    -- Calculated totals
    COALESCE(SUM(COALESCE(aps.service_price, i.default_price)), 0) as total_price,
    COALESCE(SUM(COALESCE(aps.service_duration_minutes, i.duration_minutes)), 0) as total_duration_minutes
    
FROM public.appointments a
LEFT JOIN public.appointment_services aps ON a.id = aps.appointment_id
LEFT JOIN public.items i ON aps.item_id = i.id
GROUP BY a.id;

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
COMMENT ON VIEW public.appointments_with_services IS 'CRITICAL: Convenient view showing appointments with aggregated services data - required for frontend appointment system';
COMMENT ON TABLE public.cash_movements IS 'Cash flow tracking and bank transfer management';
COMMENT ON TABLE public.owner_transactions IS 'Owner draws, investments, and private transactions';
COMMENT ON TABLE public.documents IS 'PDF receipts, reports and file management with storage integration';

COMMENT ON COLUMN public.items.type IS 'service (requires duration) or product';
COMMENT ON COLUMN public.items.duration_minutes IS 'Required for services, NULL for products';
COMMENT ON COLUMN public.sales.banking_status IS 'Banking reconciliation status workflow';
COMMENT ON COLUMN public.expenses.category IS 'Validated against default + custom categories';
COMMENT ON COLUMN public.suppliers.normalized_name IS 'Lowercase, trimmed name for matching';
COMMENT ON COLUMN public.cash_movements.movement_type IS 'Type: cash_operation or bank_transfer';
COMMENT ON COLUMN public.owner_transactions.transaction_type IS 'Type: deposit, expense, or withdrawal';

COMMENT ON FUNCTION public.validate_expense_category(text, uuid) IS 'Validates expense categories against default and custom organization categories';
COMMENT ON FUNCTION public.normalize_supplier_name(text) IS 'Normalizes supplier names for consistent matching';
COMMENT ON FUNCTION public.get_or_create_supplier(text, uuid) IS 'Gets existing supplier or creates new one with normalized name matching';
COMMENT ON FUNCTION public.get_current_cash_balance() IS 'Returns current total cash balance from all cash movements';
COMMENT ON FUNCTION public.get_current_cash_balance_for_org(uuid) IS 'CRITICAL: Returns current cash balance for specific organization - fixes console error';
COMMENT ON FUNCTION public.get_net_revenue_for_period(date, date) IS 'Returns net revenue for period (after provider fees)';
COMMENT ON FUNCTION public.get_net_profit_for_period(date, date) IS 'Returns net profit for period (revenue minus expenses)';
COMMENT ON FUNCTION public.get_revenue_breakdown_for_period(date, date) IS 'Returns detailed revenue breakdown with fees, cash, and provider revenue';
COMMENT ON FUNCTION public.create_bank_transfer_cash_movement(uuid, numeric, text, character varying, uuid) IS 'Creates cash movement for bank transfers (to_bank or from_bank)';
COMMENT ON FUNCTION public.get_owner_loan_balance(uuid) IS 'Calculates owner loan balance - positive means business owes owner';

-- =====================================================
-- END OF 02_core_business_logic_v6.sql (V6)
-- =====================================================
-- COMPLETE CORE BUSINESS DOMAIN: All POS tables + appointments_with_services view + ALL critical business functions (V6)
-- Next: 03_banking_and_compliance_v6.sql (Banking + Compliance + Reconciliation functions)
-- =====================================================