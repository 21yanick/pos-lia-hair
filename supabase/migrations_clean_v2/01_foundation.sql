-- ============================================================================
-- FOUNDATION: Extensions, ENUM Types, Users, Organizations  
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom ENUM types
 CREATE TYPE public.supplier_category AS ENUM ('beauty_supplies', 'equipment', 'utilities', 'rent', 'insurance', 'professional_services', 'retail', 'online_marketplace', 'real_estate', 'other');


-- Core tables (without triggers)
-- Table: users
 CREATE TABLE public.users (                          +
     id uuid DEFAULT gen_random_uuid() NOT NULL,      +
     name text NOT NULL,                              +
     username text NOT NULL,                          +
     email text NOT NULL,                             +
     role text DEFAULT 'admin'::text NOT NULL,        +
     active boolean DEFAULT true,                     +
     created_at timestamp with time zone DEFAULT now()+
 );                                                   +
                                                      +
 

-- Table: organizations
 CREATE TABLE public.organizations (                   +
     id uuid DEFAULT gen_random_uuid() NOT NULL,       +
     name text NOT NULL,                               +
     slug text NOT NULL,                               +
     display_name text,                                +
     created_at timestamp with time zone DEFAULT now(),+
     updated_at timestamp with time zone DEFAULT now(),+
     active boolean DEFAULT true,                      +
     address text,                                     +
     city text,                                        +
     postal_code text,                                 +
     phone text,                                       +
     email text,                                       +
     website text,                                     +
     uid text,                                         +
     settings jsonb DEFAULT '{}'::jsonb                +
 );                                                    +
                                                       +
 

-- Table: document_sequences
 CREATE TABLE public.document_sequences (              +
     type character varying(20) NOT NULL,              +
     current_number integer DEFAULT 0 NOT NULL,        +
     prefix character varying(10) NOT NULL,            +
     format character varying(50) NOT NULL,            +
     created_at timestamp with time zone DEFAULT now(),+
     updated_at timestamp with time zone DEFAULT now() +
 );                                                    +
                                                       +
 

