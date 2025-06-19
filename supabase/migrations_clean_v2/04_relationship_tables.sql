-- ============================================================================
-- RELATIONSHIP TABLES: Dependent entities
-- ============================================================================

-- Table: cash_movements
 CREATE TABLE public.cash_movements (                                                +
     id uuid DEFAULT gen_random_uuid() NOT NULL,                                     +
     amount numeric(10,2) NOT NULL,                                                  +
     type text NOT NULL,                                                             +
     description text NOT NULL,                                                      +
     reference_type text,                                                            +
     reference_id uuid,                                                              +
     user_id uuid NOT NULL,                                                          +
     created_at timestamp with time zone DEFAULT now(),                              +
     bank_transaction_id uuid,                                                       +
     banking_status character varying(20) DEFAULT 'unmatched'::character varying,    +
     movement_type character varying(20) DEFAULT 'cash_operation'::character varying,+
     movement_number character varying(20),                                          +
     organization_id uuid                                                            +
 );                                                                                  +
                                                                                     +
 

-- Table: sale_items
 CREATE TABLE public.sale_items (               +
     id uuid DEFAULT gen_random_uuid() NOT NULL,+
     sale_id uuid,                              +
     item_id uuid,                              +
     price numeric(10,2) NOT NULL,              +
     notes text,                                +
     organization_id uuid                       +
 );                                             +
                                                +
 

-- Table: provider_reports
 CREATE TABLE public.provider_reports (                                  +
     id uuid DEFAULT gen_random_uuid() NOT NULL,                         +
     provider character varying(20) NOT NULL,                            +
     transaction_date date NOT NULL,                                     +
     settlement_date date,                                               +
     gross_amount numeric(10,2) NOT NULL,                                +
     fees numeric(10,2) DEFAULT 0.00 NOT NULL,                           +
     net_amount numeric(10,2) NOT NULL,                                  +
     provider_transaction_id character varying(100),                     +
     provider_reference character varying(255),                          +
     payment_method character varying(50),                               +
     currency character varying(3) DEFAULT 'CHF'::character varying,     +
     import_filename character varying(255) NOT NULL,                    +
     import_date timestamp with time zone DEFAULT now(),                 +
     raw_data jsonb,                                                     +
     sale_id uuid,                                                       +
     status character varying(20) DEFAULT 'unmatched'::character varying,+
     user_id uuid NOT NULL,                                              +
     created_at timestamp with time zone DEFAULT now(),                  +
     updated_at timestamp with time zone DEFAULT now(),                  +
     notes text,                                                         +
     organization_id uuid                                                +
 );                                                                      +
                                                                         +
 

-- Table: owner_transactions
 CREATE TABLE public.owner_transactions (                                        +
     id uuid DEFAULT gen_random_uuid() NOT NULL,                                 +
     transaction_type character varying(20) NOT NULL,                            +
     amount numeric(10,2) NOT NULL,                                              +
     description text NOT NULL,                                                  +
     transaction_date date NOT NULL,                                             +
     payment_method character varying(20) NOT NULL,                              +
     related_expense_id uuid,                                                    +
     related_bank_transaction_id uuid,                                           +
     banking_status character varying(20) DEFAULT 'unmatched'::character varying,+
     user_id uuid NOT NULL,                                                      +
     created_at timestamp with time zone DEFAULT now(),                          +
     updated_at timestamp with time zone DEFAULT now(),                          +
     notes text,                                                                 +
     organization_id uuid                                                        +
 );                                                                              +
                                                                                 +
 

-- Table: transaction_matches
 CREATE TABLE public.transaction_matches (                                +
     id uuid DEFAULT gen_random_uuid() NOT NULL,                          +
     bank_transaction_id uuid NOT NULL,                                   +
     matched_type character varying(20) NOT NULL,                         +
     matched_id uuid NOT NULL,                                            +
     matched_amount numeric(10,2) NOT NULL,                               +
     match_confidence numeric(5,2) DEFAULT 0.00,                          +
     match_type character varying(20) DEFAULT 'manual'::character varying,+
     matched_by uuid,                                                     +
     matched_at timestamp with time zone DEFAULT now(),                   +
     notes text,                                                          +
     organization_id uuid                                                 +
 );                                                                       +
                                                                          +
 

-- Table: organization_users
 CREATE TABLE public.organization_users (              +
     id uuid DEFAULT gen_random_uuid() NOT NULL,       +
     organization_id uuid NOT NULL,                    +
     user_id uuid NOT NULL,                            +
     role text NOT NULL,                               +
     invited_by uuid,                                  +
     joined_at timestamp with time zone DEFAULT now(), +
     created_at timestamp with time zone DEFAULT now(),+
     active boolean DEFAULT true                       +
 );                                                    +
                                                       +
 

