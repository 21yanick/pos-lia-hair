-- ============================================================================
-- BUSINESS TABLES: Core business entities (no triggers)
-- ============================================================================

-- Table: bank_accounts
 CREATE TABLE public.bank_accounts (                   +
     id uuid DEFAULT gen_random_uuid() NOT NULL,       +
     name character varying(100) NOT NULL,             +
     bank_name character varying(50) NOT NULL,         +
     iban character varying(34),                       +
     account_number character varying(50),             +
     current_balance numeric(12,2) DEFAULT 0.00,       +
     last_statement_date date,                         +
     is_active boolean DEFAULT true,                   +
     user_id uuid NOT NULL,                            +
     created_at timestamp with time zone DEFAULT now(),+
     updated_at timestamp with time zone DEFAULT now(),+
     notes text,                                       +
     organization_id uuid                              +
 );                                                    +
                                                       +
 

-- Table: items
 CREATE TABLE public.items (                           +
     id uuid DEFAULT gen_random_uuid() NOT NULL,       +
     name text NOT NULL,                               +
     default_price numeric(10,2) NOT NULL,             +
     type text NOT NULL,                               +
     is_favorite boolean DEFAULT false,                +
     active boolean DEFAULT true,                      +
     created_at timestamp with time zone DEFAULT now(),+
     organization_id uuid NOT NULL                     +
 );                                                    +
                                                       +
 

-- Table: suppliers
 CREATE TABLE public.suppliers (                                          +
     id uuid DEFAULT gen_random_uuid() NOT NULL,                          +
     name character varying(255) NOT NULL,                                +
     normalized_name character varying(255) NOT NULL,                     +
     category public.supplier_category DEFAULT 'other'::supplier_category,+
     contact_email character varying(255),                                +
     contact_phone character varying(50),                                 +
     website character varying(255),                                      +
     address_line1 character varying(255),                                +
     address_line2 character varying(255),                                +
     postal_code character varying(20),                                   +
     city character varying(100),                                         +
     country character varying(2) DEFAULT 'CH'::character varying,        +
     iban character varying(34),                                          +
     vat_number character varying(50),                                    +
     is_active boolean DEFAULT true,                                      +
     notes text,                                                          +
     created_at timestamp with time zone DEFAULT now(),                   +
     updated_at timestamp with time zone DEFAULT now(),                   +
     created_by uuid,                                                     +
     organization_id uuid                                                 +
 );                                                                       +
                                                                          +
 

-- Table: business_settings
 CREATE TABLE public.business_settings (                  +
     id uuid DEFAULT gen_random_uuid() NOT NULL,          +
     user_id uuid NOT NULL,                               +
     company_name text,                                   +
     company_tagline text,                                +
     company_address text,                                +
     company_postal_code text,                            +
     company_city text,                                   +
     company_phone text,                                  +
     company_email text,                                  +
     company_website text,                                +
     company_uid text,                                    +
     logo_url text,                                       +
     logo_storage_path text,                              +
     default_currency text DEFAULT 'CHF'::text,           +
     tax_rate numeric(5,2) DEFAULT 7.7,                   +
     pdf_show_logo boolean DEFAULT true,                  +
     pdf_show_company_details boolean DEFAULT true,       +
     created_at timestamp with time zone DEFAULT now(),   +
     updated_at timestamp with time zone DEFAULT now(),   +
     custom_expense_categories jsonb DEFAULT '{}'::jsonb, +
     organization_id uuid NOT NULL,                       +
     custom_supplier_categories jsonb DEFAULT '{}'::jsonb,+
     app_logo_light_url text,                             +
     app_logo_light_storage_path text,                    +
     app_logo_dark_url text,                              +
     app_logo_dark_storage_path text                      +
 );                                                       +
                                                          +
 

-- Table: audit_log
 CREATE TABLE public.audit_log (                      +
     id uuid DEFAULT gen_random_uuid() NOT NULL,      +
     table_name text NOT NULL,                        +
     record_id uuid NOT NULL,                         +
     action text NOT NULL,                            +
     old_values jsonb,                                +
     new_values jsonb,                                +
     user_id uuid NOT NULL,                           +
     timestamp timestamp with time zone DEFAULT now(),+
     ip_address inet,                                 +
     session_id text,                                 +
     is_immutable boolean DEFAULT true                +
 );                                                   +
                                                      +
 

