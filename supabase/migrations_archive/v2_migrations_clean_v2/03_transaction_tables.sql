-- ============================================================================
-- TRANSACTION TABLES: Bank, Sales, Expenses, Summaries
-- ============================================================================

-- Table: bank_import_sessions
 CREATE TABLE public.bank_import_sessions (                                 +
     id uuid DEFAULT gen_random_uuid() NOT NULL,                            +
     bank_account_id uuid NOT NULL,                                         +
     import_filename character varying(255) NOT NULL,                       +
     import_type character varying(20) DEFAULT 'camt053'::character varying,+
     total_entries integer NOT NULL,                                        +
     new_entries integer NOT NULL,                                          +
     duplicate_entries integer NOT NULL,                                    +
     error_entries integer NOT NULL,                                        +
     statement_from_date date,                                              +
     statement_to_date date,                                                +
     status character varying(20) DEFAULT 'completed'::character varying,   +
     imported_by uuid,                                                      +
     imported_at timestamp with time zone DEFAULT now(),                    +
     notes text,                                                            +
     organization_id uuid                                                   +
 );                                                                         +
                                                                            +
 

-- Table: provider_import_sessions
 CREATE TABLE public.provider_import_sessions (                         +
     id uuid DEFAULT gen_random_uuid() NOT NULL,                        +
     provider character varying(20) NOT NULL,                           +
     filename character varying(255) NOT NULL,                          +
     status character varying(20) DEFAULT 'pending'::character varying, +
     imported_by uuid NOT NULL,                                         +
     created_at timestamp with time zone DEFAULT now(),                 +
     import_type character varying(20) DEFAULT 'csv'::character varying,+
     total_records integer DEFAULT 0,                                   +
     new_records integer DEFAULT 0,                                     +
     duplicate_records integer DEFAULT 0,                               +
     error_records integer DEFAULT 0,                                   +
     date_range_from date,                                              +
     date_range_to date,                                                +
     completed_at timestamp with time zone,                             +
     notes text,                                                        +
     records_imported integer DEFAULT 0,                                +
     records_failed integer DEFAULT 0,                                  +
     organization_id uuid                                               +
 );                                                                     +
                                                                        +
 

-- Table: bank_transactions
 CREATE TABLE public.bank_transactions (                                 +
     id uuid DEFAULT gen_random_uuid() NOT NULL,                         +
     bank_account_id uuid NOT NULL,                                      +
     transaction_date date NOT NULL,                                     +
     booking_date date,                                                  +
     amount numeric(12,2) NOT NULL,                                      +
     description text NOT NULL,                                          +
     reference character varying(255),                                   +
     transaction_code character varying(20),                             +
     import_batch_id uuid,                                               +
     import_filename character varying(255),                             +
     import_date timestamp with time zone DEFAULT now(),                 +
     raw_data jsonb,                                                     +
     status character varying(20) DEFAULT 'unmatched'::character varying,+
     user_id uuid NOT NULL,                                              +
     created_at timestamp with time zone DEFAULT now(),                  +
     updated_at timestamp with time zone DEFAULT now(),                  +
     notes text,                                                         +
     transaction_number character varying(20),                           +
     organization_id uuid                                                +
 );                                                                      +
                                                                         +
 

-- Table: expenses
 CREATE TABLE public.expenses (                                                  +
     id uuid DEFAULT gen_random_uuid() NOT NULL,                                 +
     amount numeric(10,2) NOT NULL,                                              +
     description text NOT NULL,                                                  +
     category text NOT NULL,                                                     +
     payment_method text NOT NULL,                                               +
     payment_date date NOT NULL,                                                 +
     supplier_name text,                                                         +
     invoice_number text,                                                        +
     notes text,                                                                 +
     user_id uuid NOT NULL,                                                      +
     created_at timestamp with time zone DEFAULT now(),                          +
     bank_transaction_id uuid,                                                   +
     banking_status character varying(20) DEFAULT 'unmatched'::character varying,+
     receipt_number character varying(20),                                       +
     supplier_id uuid,                                                           +
     organization_id uuid NOT NULL                                               +
 );                                                                              +
                                                                                 +
 

-- Table: sales
 CREATE TABLE public.sales (                                                     +
     id uuid DEFAULT gen_random_uuid() NOT NULL,                                 +
     total_amount numeric(10,2) NOT NULL,                                        +
     payment_method text NOT NULL,                                               +
     status text DEFAULT 'completed'::text NOT NULL,                             +
     notes text,                                                                 +
     user_id uuid NOT NULL,                                                      +
     created_at timestamp with time zone DEFAULT now(),                          +
     gross_amount numeric(10,3),                                                 +
     provider_fee numeric(10,3),                                                 +
     net_amount numeric(10,3),                                                   +
     settlement_status text DEFAULT 'pending'::text,                             +
     settlement_date date,                                                       +
     provider_reference_id text,                                                 +
     provider_report_id uuid,                                                    +
     bank_transaction_id uuid,                                                   +
     banking_status character varying(20) DEFAULT 'unmatched'::character varying,+
     receipt_number character varying(20),                                       +
     organization_id uuid NOT NULL                                               +
 );                                                                              +
                                                                                 +
 

-- Table: documents
 CREATE TABLE public.documents (                       +
     id uuid DEFAULT gen_random_uuid() NOT NULL,       +
     type text NOT NULL,                               +
     reference_id uuid NOT NULL,                       +
     file_path text NOT NULL,                          +
     payment_method text,                              +
     document_date date NOT NULL,                      +
     user_id uuid NOT NULL,                            +
     created_at timestamp with time zone DEFAULT now(),+
     file_name text,                                   +
     file_size integer,                                +
     mime_type text DEFAULT 'application/pdf'::text,   +
     reference_type text,                              +
     notes text,                                       +
     document_number character varying(20),            +
     organization_id uuid                              +
 );                                                    +
                                                       +
 

-- Table: daily_summaries
 CREATE TABLE public.daily_summaries (                 +
     id uuid DEFAULT gen_random_uuid() NOT NULL,       +
     report_date date NOT NULL,                        +
     sales_cash numeric(10,2) DEFAULT 0 NOT NULL,      +
     sales_twint numeric(10,2) DEFAULT 0 NOT NULL,     +
     sales_sumup numeric(10,2) DEFAULT 0 NOT NULL,     +
     sales_total numeric(10,2) DEFAULT 0 NOT NULL,     +
     expenses_cash numeric(10,2) DEFAULT 0 NOT NULL,   +
     expenses_bank numeric(10,2) DEFAULT 0 NOT NULL,   +
     expenses_total numeric(10,2) DEFAULT 0 NOT NULL,  +
     cash_starting numeric(10,2) DEFAULT 0 NOT NULL,   +
     cash_ending numeric(10,2) DEFAULT 0 NOT NULL,     +
     cash_difference numeric(10,2) DEFAULT 0 NOT NULL, +
     status text DEFAULT 'draft'::text NOT NULL,       +
     notes text,                                       +
     created_by uuid,                                  +
     user_id uuid,                                     +
     created_at timestamp with time zone DEFAULT now(),+
     closed_at timestamp with time zone,               +
     organization_id uuid                              +
 );                                                    +
                                                       +
 

-- Table: monthly_summaries
 CREATE TABLE public.monthly_summaries (                +
     id uuid DEFAULT gen_random_uuid() NOT NULL,        +
     year integer NOT NULL,                             +
     month integer NOT NULL,                            +
     sales_cash numeric(10,2) DEFAULT 0 NOT NULL,       +
     sales_twint numeric(10,2) DEFAULT 0 NOT NULL,      +
     sales_sumup numeric(10,2) DEFAULT 0 NOT NULL,      +
     sales_total numeric(10,2) DEFAULT 0 NOT NULL,      +
     expenses_cash numeric(10,2) DEFAULT 0 NOT NULL,    +
     expenses_bank numeric(10,2) DEFAULT 0 NOT NULL,    +
     expenses_total numeric(10,2) DEFAULT 0 NOT NULL,   +
     transaction_count integer DEFAULT 0 NOT NULL,      +
     avg_daily_revenue numeric(10,2) DEFAULT 0 NOT NULL,+
     status text DEFAULT 'draft'::text NOT NULL,        +
     notes text,                                        +
     created_by uuid,                                   +
     user_id uuid,                                      +
     created_at timestamp with time zone DEFAULT now(), +
     closed_at timestamp with time zone,                +
     organization_id uuid                               +
 );                                                     +
                                                        +
 

