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

--
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA _realtime;


--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: pgsodium; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgsodium;


--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;


--
-- Name: EXTENSION pgsodium; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgsodium IS 'Pgsodium is a modern cryptography library for Postgres.';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_functions;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: supplier_category; Type: TYPE; Schema: public; Owner: -
--

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


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RAISE WARNING 'PgBouncer auth request: %', p_usename;

    RETURN QUERY
    SELECT usename::TEXT, passwd::TEXT FROM pg_catalog.pg_shadow
    WHERE usename = p_usename;
END;
$$;


--
-- Name: atomic_daily_closure(date, numeric, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.atomic_daily_closure(target_date date, expected_cash_end numeric, user_id uuid) RETURNS TABLE(success boolean, error_message text, cash_variance numeric)
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     lock_acquired BOOLEAN := FALSE;                                                                                                                                                                                                      
     actual_cash_end DECIMAL(10,3);                                                                                                                                                                                                       
     variance DECIMAL(10,3);                                                                                                                                                                                                              
 BEGIN                                                                                                                                                                                                                                    
     -- Try to acquire lock for this date                                                                                                                                                                                                 
     BEGIN                                                                                                                                                                                                                                
         INSERT INTO daily_closure_locks (closure_date, locked_by, status)                                                                                                                                                                
         VALUES (target_date, user_id, 'in_progress');                                                                                                                                                                                    
         lock_acquired := TRUE;                                                                                                                                                                                                           
     EXCEPTION WHEN unique_violation THEN                                                                                                                                                                                                 
         RETURN QUERY SELECT FALSE, 'Date already locked for closure', 0::DECIMAL(10,3);                                                                                                                                                  
         RETURN;                                                                                                                                                                                                                          
     END;                                                                                                                                                                                                                                 
                                                                                                                                                                                                                                          
     -- Check for pending settlements                                                                                                                                                                                                     
     IF EXISTS (                                                                                                                                                                                                                          
         SELECT 1 FROM sales                                                                                                                                                                                                              
         WHERE DATE(created_at) = target_date                                                                                                                                                                                             
         AND settlement_status = 'pending'                                                                                                                                                                                                
         AND payment_method IN ('twint', 'sumup')                                                                                                                                                                                         
     ) THEN                                                                                                                                                                                                                               
         DELETE FROM daily_closure_locks WHERE closure_date = target_date;                                                                                                                                                                
         RETURN QUERY SELECT FALSE, 'Pending settlements prevent closure', 0::DECIMAL(10,3);                                                                                                                                              
         RETURN;                                                                                                                                                                                                                          
     END IF;                                                                                                                                                                                                                              
                                                                                                                                                                                                                                          
     -- Calculate actual cash end balance                                                                                                                                                                                                 
     SELECT get_current_cash_balance() INTO actual_cash_end;                                                                                                                                                                              
     variance := expected_cash_end - actual_cash_end;                                                                                                                                                                                     
                                                                                                                                                                                                                                          
     -- Update closure status                                                                                                                                                                                                             
     UPDATE daily_closure_locks                                                                                                                                                                                                           
     SET status = 'completed'                                                                                                                                                                                                             
     WHERE closure_date = target_date;                                                                                                                                                                                                    
                                                                                                                                                                                                                                          
     -- Return success                                                                                                                                                                                                                    
     RETURN QUERY SELECT TRUE, 'Closure completed successfully', variance;                                                                                                                                                                
                                                                                                                                                                                                                                          
 EXCEPTION WHEN OTHERS THEN                                                                                                                                                                                                               
     -- Clean up lock on error                                                                                                                                                                                                            
     IF lock_acquired THEN                                                                                                                                                                                                                
         DELETE FROM daily_closure_locks WHERE closure_date = target_date;                                                                                                                                                                
     END IF;                                                                                                                                                                                                                              
     RETURN QUERY SELECT FALSE, SQLERRM, 0::DECIMAL(10,3);                                                                                                                                                                                
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: auto_generate_bank_transaction_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_generate_bank_transaction_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     -- Only generate if transaction_number is NULL                                                                                                                                                                                       
     IF NEW.transaction_number IS NULL THEN                                                                                                                                                                                               
         NEW.transaction_number := generate_document_number('bank_transaction');                                                                                                                                                          
     END IF;                                                                                                                                                                                                                              
     RETURN NEW;                                                                                                                                                                                                                          
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: auto_generate_cash_movement_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_generate_cash_movement_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     -- Only generate if movement_number is NULL                                                                                                                                                                                          
     IF NEW.movement_number IS NULL THEN                                                                                                                                                                                                  
         NEW.movement_number := generate_document_number('cash_movement');                                                                                                                                                                
     END IF;                                                                                                                                                                                                                              
     RETURN NEW;                                                                                                                                                                                                                          
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: auto_generate_document_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_generate_document_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     -- Only generate if document_number is NULL                                                                                                                                                                                          
     IF NEW.document_number IS NULL THEN                                                                                                                                                                                                  
         -- Determine document type based on document type field                                                                                                                                                                          
         CASE NEW.type                                                                                                                                                                                                                    
             WHEN 'receipt' THEN                                                                                                                                                                                                          
                 NEW.document_number := generate_document_number('sale_receipt');                                                                                                                                                         
             WHEN 'expense_receipt' THEN                                                                                                                                                                                                  
                 NEW.document_number := generate_document_number('expense_receipt');                                                                                                                                                      
             WHEN 'daily_report' THEN                                                                                                                                                                                                     
                 NEW.document_number := generate_document_number('daily_report');                                                                                                                                                         
             WHEN 'monthly_report' THEN                                                                                                                                                                                                   
                 NEW.document_number := generate_document_number('monthly_report');                                                                                                                                                       
             WHEN 'yearly_report' THEN                                                                                                                                                                                                    
                 NEW.document_number := generate_document_number('monthly_report'); -- Use monthly format for yearly                                                                                                                      
             ELSE                                                                                                                                                                                                                         
                 NEW.document_number := generate_document_number('sale_receipt'); -- Default fallback                                                                                                                                     
         END CASE;                                                                                                                                                                                                                        
     END IF;                                                                                                                                                                                                                              
     RETURN NEW;                                                                                                                                                                                                                          
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: auto_generate_expenses_receipt_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_generate_expenses_receipt_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     -- Only generate if receipt_number is NULL                                                                                                                                                                                           
     IF NEW.receipt_number IS NULL THEN                                                                                                                                                                                                   
         NEW.receipt_number := generate_document_number('expense_receipt');                                                                                                                                                               
     END IF;                                                                                                                                                                                                                              
     RETURN NEW;                                                                                                                                                                                                                          
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: auto_generate_sales_receipt_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_generate_sales_receipt_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     -- Only generate if receipt_number is NULL                                                                                                                                                                                           
     IF NEW.receipt_number IS NULL THEN                                                                                                                                                                                                   
         NEW.receipt_number := generate_document_number('sale_receipt');                                                                                                                                                                  
     END IF;                                                                                                                                                                                                                              
     RETURN NEW;                                                                                                                                                                                                                          
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: auto_populate_supplier_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_populate_supplier_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
   -- Only process if supplier_name is provided but supplier_id is not                                                                                                                                                                    
   IF NEW.supplier_name IS NOT NULL                                                                                                                                                                                                       
      AND trim(NEW.supplier_name) != ''                                                                                                                                                                                                   
      AND NEW.supplier_id IS NULL THEN                                                                                                                                                                                                    
                                                                                                                                                                                                                                          
     NEW.supplier_id := get_or_create_supplier(NEW.supplier_name, NEW.user_id);                                                                                                                                                           
   END IF;                                                                                                                                                                                                                                
                                                                                                                                                                                                                                          
   RETURN NEW;                                                                                                                                                                                                                            
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: bulk_close_daily_summaries(date[], numeric, numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.bulk_close_daily_summaries(target_dates date[], default_cash_starting numeric DEFAULT 0, default_cash_ending numeric DEFAULT 0, default_notes text DEFAULT 'Bulk closure - automatically closed'::text) RETURNS TABLE(processed_date date, success boolean, summary_id uuid, error_message text)
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     target_date DATE;                                                                                                                                                                                                                    
     v_summary_id UUID;                                                                                                                                                                                                                   
     v_system_user_id UUID := '00000000-0000-0000-0000-000000000000';                                                                                                                                                                     
 BEGIN                                                                                                                                                                                                                                    
     FOREACH target_date IN ARRAY target_dates                                                                                                                                                                                            
     LOOP                                                                                                                                                                                                                                 
         BEGIN                                                                                                                                                                                                                            
             -- Calculate or update daily summary                                                                                                                                                                                         
             PERFORM calculate_daily_summary(target_date);                                                                                                                                                                                
                                                                                                                                                                                                                                          
             -- Get the summary ID                                                                                                                                                                                                        
             SELECT id INTO v_summary_id                                                                                                                                                                                                  
             FROM daily_summaries                                                                                                                                                                                                         
             WHERE report_date = target_date;                                                                                                                                                                                             
                                                                                                                                                                                                                                          
             -- Update with cash values and close                                                                                                                                                                                         
             UPDATE daily_summaries                                                                                                                                                                                                       
             SET                                                                                                                                                                                                                          
                 cash_starting = default_cash_starting,                                                                                                                                                                                   
                 cash_ending = default_cash_ending,                                                                                                                                                                                       
                 cash_difference = default_cash_ending - default_cash_starting,                                                                                                                                                           
                 status = 'closed',                                                                                                                                                                                                       
                 notes = default_notes,                                                                                                                                                                                                   
                 closed_at = NOW(),                                                                                                                                                                                                       
                 created_by = COALESCE(created_by, v_system_user_id)                                                                                                                                                                      
             WHERE id = v_summary_id;                                                                                                                                                                                                     
                                                                                                                                                                                                                                          
             RETURN QUERY SELECT target_date, true, v_summary_id, NULL::TEXT;                                                                                                                                                             
                                                                                                                                                                                                                                          
         EXCEPTION WHEN OTHERS THEN                                                                                                                                                                                                       
             RETURN QUERY SELECT target_date, false, NULL::UUID, SQLERRM;                                                                                                                                                                 
         END;                                                                                                                                                                                                                             
     END LOOP;                                                                                                                                                                                                                            
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: calculate_daily_summary(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_daily_summary(summary_date date) RETURNS void
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     v_sales_cash DECIMAL(10,2) := 0;                                                                                                                                                                                                     
     v_sales_twint DECIMAL(10,2) := 0;                                                                                                                                                                                                    
     v_sales_sumup DECIMAL(10,2) := 0;                                                                                                                                                                                                    
     v_sales_total DECIMAL(10,2) := 0;                                                                                                                                                                                                    
     v_expenses_cash DECIMAL(10,2) := 0;                                                                                                                                                                                                  
     v_expenses_bank DECIMAL(10,2) := 0;                                                                                                                                                                                                  
     v_expenses_total DECIMAL(10,2) := 0;                                                                                                                                                                                                 
     v_system_user_id UUID := '00000000-0000-0000-0000-000000000000';                                                                                                                                                                     
 BEGIN                                                                                                                                                                                                                                    
     -- Calculate sales by payment method                                                                                                                                                                                                 
     SELECT                                                                                                                                                                                                                               
         COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount END), 0),                                                                                                                                                       
         COALESCE(SUM(CASE WHEN payment_method = 'twint' THEN total_amount END), 0),                                                                                                                                                      
         COALESCE(SUM(CASE WHEN payment_method = 'sumup' THEN total_amount END), 0),                                                                                                                                                      
         COALESCE(SUM(total_amount), 0)                                                                                                                                                                                                   
     INTO v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total                                                                                                                                                                       
     FROM sales                                                                                                                                                                                                                           
     WHERE DATE(created_at) = summary_date                                                                                                                                                                                                
     AND status = 'completed';                                                                                                                                                                                                            
                                                                                                                                                                                                                                          
     -- Calculate expenses by payment method                                                                                                                                                                                              
     SELECT                                                                                                                                                                                                                               
         COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount END), 0),                                                                                                                                                             
         COALESCE(SUM(CASE WHEN payment_method = 'bank' THEN amount END), 0),                                                                                                                                                             
         COALESCE(SUM(amount), 0)                                                                                                                                                                                                         
     INTO v_expenses_cash, v_expenses_bank, v_expenses_total                                                                                                                                                                              
     FROM expenses                                                                                                                                                                                                                        
     WHERE payment_date = summary_date;                                                                                                                                                                                                   
                                                                                                                                                                                                                                          
     -- Insert or update daily summary (business-level, created by system)                                                                                                                                                                
     INSERT INTO daily_summaries (                                                                                                                                                                                                        
         report_date, sales_cash, sales_twint, sales_sumup, sales_total,                                                                                                                                                                  
         expenses_cash, expenses_bank, expenses_total,                                                                                                                                                                                    
         created_by                                                                                                                                                                                                                       
     ) VALUES (                                                                                                                                                                                                                           
         summary_date, v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total,                                                                                                                                                         
         v_expenses_cash, v_expenses_bank, v_expenses_total,                                                                                                                                                                              
         v_system_user_id                                                                                                                                                                                                                 
     )                                                                                                                                                                                                                                    
     ON CONFLICT (report_date)                                                                                                                                                                                                            
     DO UPDATE SET                                                                                                                                                                                                                        
         sales_cash = EXCLUDED.sales_cash,                                                                                                                                                                                                
         sales_twint = EXCLUDED.sales_twint,                                                                                                                                                                                              
         sales_sumup = EXCLUDED.sales_sumup,                                                                                                                                                                                              
         sales_total = EXCLUDED.sales_total,                                                                                                                                                                                              
         expenses_cash = EXCLUDED.expenses_cash,                                                                                                                                                                                          
         expenses_bank = EXCLUDED.expenses_bank,                                                                                                                                                                                          
         expenses_total = EXCLUDED.expenses_total;                                                                                                                                                                                        
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: calculate_monthly_summary(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_monthly_summary(summary_year integer, summary_month integer) RETURNS void
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     v_sales_cash DECIMAL(10,2) := 0;                                                                                                                                                                                                     
     v_sales_twint DECIMAL(10,2) := 0;                                                                                                                                                                                                    
     v_sales_sumup DECIMAL(10,2) := 0;                                                                                                                                                                                                    
     v_sales_total DECIMAL(10,2) := 0;                                                                                                                                                                                                    
     v_expenses_cash DECIMAL(10,2) := 0;                                                                                                                                                                                                  
     v_expenses_bank DECIMAL(10,2) := 0;                                                                                                                                                                                                  
     v_expenses_total DECIMAL(10,2) := 0;                                                                                                                                                                                                 
     v_transaction_count INTEGER := 0;                                                                                                                                                                                                    
     v_avg_daily_revenue DECIMAL(10,2) := 0;                                                                                                                                                                                              
     v_days_in_month INTEGER;                                                                                                                                                                                                             
     v_system_user_id UUID := '00000000-0000-0000-0000-000000000000';                                                                                                                                                                     
 BEGIN                                                                                                                                                                                                                                    
     -- Calculate days in month                                                                                                                                                                                                           
     SELECT EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(summary_year, summary_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER                                                                                           
     INTO v_days_in_month;                                                                                                                                                                                                                
                                                                                                                                                                                                                                          
     -- Aggregate sales from daily_summaries                                                                                                                                                                                              
     SELECT                                                                                                                                                                                                                               
         COALESCE(SUM(sales_cash), 0),                                                                                                                                                                                                    
         COALESCE(SUM(sales_twint), 0),                                                                                                                                                                                                   
         COALESCE(SUM(sales_sumup), 0),                                                                                                                                                                                                   
         COALESCE(SUM(sales_total), 0)                                                                                                                                                                                                    
     INTO v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total                                                                                                                                                                       
     FROM daily_summaries                                                                                                                                                                                                                 
     WHERE EXTRACT(YEAR FROM report_date) = summary_year                                                                                                                                                                                  
     AND EXTRACT(MONTH FROM report_date) = summary_month;                                                                                                                                                                                 
                                                                                                                                                                                                                                          
     -- Aggregate expenses                                                                                                                                                                                                                
     SELECT                                                                                                                                                                                                                               
         COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount END), 0),                                                                                                                                                             
         COALESCE(SUM(CASE WHEN payment_method = 'bank' THEN amount END), 0),                                                                                                                                                             
         COALESCE(SUM(amount), 0)                                                                                                                                                                                                         
     INTO v_expenses_cash, v_expenses_bank, v_expenses_total                                                                                                                                                                              
     FROM expenses                                                                                                                                                                                                                        
     WHERE EXTRACT(YEAR FROM payment_date) = summary_year                                                                                                                                                                                 
     AND EXTRACT(MONTH FROM payment_date) = summary_month;                                                                                                                                                                                
                                                                                                                                                                                                                                          
     -- Count transactions                                                                                                                                                                                                                
     SELECT COALESCE(COUNT(*), 0)                                                                                                                                                                                                         
     INTO v_transaction_count                                                                                                                                                                                                             
     FROM sales                                                                                                                                                                                                                           
     WHERE EXTRACT(YEAR FROM created_at) = summary_year                                                                                                                                                                                   
     AND EXTRACT(MONTH FROM created_at) = summary_month                                                                                                                                                                                   
     AND status = 'completed';                                                                                                                                                                                                            
                                                                                                                                                                                                                                          
     -- Calculate average daily revenue                                                                                                                                                                                                   
     IF v_days_in_month > 0 THEN                                                                                                                                                                                                          
         v_avg_daily_revenue := v_sales_total / v_days_in_month;                                                                                                                                                                          
     END IF;                                                                                                                                                                                                                              
                                                                                                                                                                                                                                          
     -- Insert or update monthly summary (business-level, created by system)                                                                                                                                                              
     INSERT INTO monthly_summaries (                                                                                                                                                                                                      
         year, month,                                                                                                                                                                                                                     
         sales_cash, sales_twint, sales_sumup, sales_total,                                                                                                                                                                               
         expenses_cash, expenses_bank, expenses_total,                                                                                                                                                                                    
         transaction_count, avg_daily_revenue,                                                                                                                                                                                            
         created_by                                                                                                                                                                                                                       
     ) VALUES (                                                                                                                                                                                                                           
         summary_year, summary_month,                                                                                                                                                                                                     
         v_sales_cash, v_sales_twint, v_sales_sumup, v_sales_total,                                                                                                                                                                       
         v_expenses_cash, v_expenses_bank, v_expenses_total,                                                                                                                                                                              
         v_transaction_count, v_avg_daily_revenue,                                                                                                                                                                                        
         v_system_user_id                                                                                                                                                                                                                 
     )                                                                                                                                                                                                                                    
     ON CONFLICT (year, month)                                                                                                                                                                                                            
     DO UPDATE SET                                                                                                                                                                                                                        
         sales_cash = EXCLUDED.sales_cash,                                                                                                                                                                                                
         sales_twint = EXCLUDED.sales_twint,                                                                                                                                                                                              
         sales_sumup = EXCLUDED.sales_sumup,                                                                                                                                                                                              
         sales_total = EXCLUDED.sales_total,                                                                                                                                                                                              
         expenses_cash = EXCLUDED.expenses_cash,                                                                                                                                                                                          
         expenses_bank = EXCLUDED.expenses_bank,                                                                                                                                                                                          
         expenses_total = EXCLUDED.expenses_total,                                                                                                                                                                                        
         transaction_count = EXCLUDED.transaction_count,                                                                                                                                                                                  
         avg_daily_revenue = EXCLUDED.avg_daily_revenue;                                                                                                                                                                                  
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: check_bank_reconciliation_completion(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_bank_reconciliation_completion(p_year integer, p_month integer) RETURNS TABLE(is_completed boolean, session_id uuid, matched_entries integer, total_entries integer, completion_percentage numeric)
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     RETURN QUERY                                                                                                                                                                                                                         
     SELECT                                                                                                                                                                                                                               
         (brs.status = 'completed') as is_completed,                                                                                                                                                                                      
         brs.id as session_id,                                                                                                                                                                                                            
         brs.matched_entries_count as matched_entries,                                                                                                                                                                                    
         brs.bank_entries_count as total_entries,                                                                                                                                                                                         
         brs.completion_percentage                                                                                                                                                                                                        
     FROM bank_reconciliation_sessions brs                                                                                                                                                                                                
     WHERE brs.year = p_year AND brs.month = p_month;                                                                                                                                                                                     
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: check_duplicate_references(text[], uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_duplicate_references(p_references text[], p_bank_account_id uuid) RETURNS text[]
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     RETURN ARRAY(                                                                                                                                                                                                                        
         SELECT reference                                                                                                                                                                                                                 
         FROM bank_transactions                                                                                                                                                                                                           
         WHERE reference = ANY(p_references)                                                                                                                                                                                              
         AND bank_account_id = p_bank_account_id                                                                                                                                                                                          
     );                                                                                                                                                                                                                                   
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: check_file_already_imported(character varying, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_file_already_imported(p_filename character varying, p_bank_account_id uuid) RETURNS boolean
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     RETURN EXISTS (                                                                                                                                                                                                                      
         SELECT 1 FROM bank_transactions                                                                                                                                                                                                  
         WHERE import_filename = p_filename                                                                                                                                                                                               
         AND bank_account_id = p_bank_account_id                                                                                                                                                                                          
     );                                                                                                                                                                                                                                   
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: check_period_overlap(date, date, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_period_overlap(p_from_date date, p_to_date date, p_bank_account_id uuid) RETURNS boolean
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     RETURN EXISTS (                                                                                                                                                                                                                      
         SELECT 1 FROM bank_transactions                                                                                                                                                                                                  
         WHERE bank_account_id = p_bank_account_id                                                                                                                                                                                        
         AND transaction_date BETWEEN p_from_date AND p_to_date                                                                                                                                                                           
     );                                                                                                                                                                                                                                   
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: complete_bank_reconciliation_session(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.complete_bank_reconciliation_session(p_session_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     v_matched_count INTEGER;                                                                                                                                                                                                             
     v_total_count INTEGER;                                                                                                                                                                                                               
     v_completion_percentage DECIMAL(5,2);                                                                                                                                                                                                
 BEGIN                                                                                                                                                                                                                                    
     -- Calculate completion stats                                                                                                                                                                                                        
     SELECT                                                                                                                                                                                                                               
         COUNT(*) FILTER (WHERE status = 'approved'),                                                                                                                                                                                     
         COUNT(*),                                                                                                                                                                                                                        
         CASE WHEN COUNT(*) > 0 THEN                                                                                                                                                                                                      
             (COUNT(*) FILTER (WHERE status = 'approved') * 100.0 / COUNT(*))                                                                                                                                                             
         ELSE 0 END                                                                                                                                                                                                                       
     INTO v_matched_count, v_total_count, v_completion_percentage                                                                                                                                                                         
     FROM bank_reconciliation_matches                                                                                                                                                                                                     
     WHERE session_id = p_session_id;                                                                                                                                                                                                     
                                                                                                                                                                                                                                          
     -- Update session                                                                                                                                                                                                                    
     UPDATE bank_reconciliation_sessions                                                                                                                                                                                                  
     SET                                                                                                                                                                                                                                  
         status = 'completed',                                                                                                                                                                                                            
         matched_entries_count = v_matched_count,                                                                                                                                                                                         
         unmatched_entries_count = v_total_count - v_matched_count,                                                                                                                                                                       
         completion_percentage = v_completion_percentage,                                                                                                                                                                                 
         completed_at = NOW()                                                                                                                                                                                                             
     WHERE id = p_session_id;                                                                                                                                                                                                             
                                                                                                                                                                                                                                          
     RETURN TRUE;                                                                                                                                                                                                                         
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: create_bank_reconciliation_session(integer, integer, text, integer, numeric, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_bank_reconciliation_session(p_year integer, p_month integer, p_bank_statement_filename text, p_bank_entries_count integer, p_bank_entries_total_amount numeric, p_user_id uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     v_session_id UUID;                                                                                                                                                                                                                   
 BEGIN                                                                                                                                                                                                                                    
     -- Insert or update session                                                                                                                                                                                                          
     INSERT INTO bank_reconciliation_sessions (                                                                                                                                                                                           
         year, month, bank_statement_filename, bank_entries_count,                                                                                                                                                                        
         bank_entries_total_amount, created_by                                                                                                                                                                                            
     ) VALUES (                                                                                                                                                                                                                           
         p_year, p_month, p_bank_statement_filename, p_bank_entries_count,                                                                                                                                                                
         p_bank_entries_total_amount, p_user_id                                                                                                                                                                                           
     )                                                                                                                                                                                                                                    
     ON CONFLICT (year, month)                                                                                                                                                                                                            
     DO UPDATE SET                                                                                                                                                                                                                        
         bank_statement_filename = EXCLUDED.bank_statement_filename,                                                                                                                                                                      
         bank_entries_count = EXCLUDED.bank_entries_count,                                                                                                                                                                                
         bank_entries_total_amount = EXCLUDED.bank_entries_total_amount,                                                                                                                                                                  
         created_at = NOW() -- Reset timestamp for re-import                                                                                                                                                                              
     RETURNING id INTO v_session_id;                                                                                                                                                                                                      
                                                                                                                                                                                                                                          
     -- Clear old matches for this session                                                                                                                                                                                                
     DELETE FROM bank_reconciliation_matches WHERE session_id = v_session_id;                                                                                                                                                             
                                                                                                                                                                                                                                          
     RETURN v_session_id;                                                                                                                                                                                                                 
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: create_bank_transfer_cash_movement(uuid, numeric, text, character varying, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_bank_transfer_cash_movement(p_user_id uuid, p_amount numeric, p_description text, p_direction character varying, p_organization_id uuid) RETURNS uuid
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


--
-- Name: create_daily_summary_for_date(date, numeric, numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_daily_summary_for_date(target_date date, cash_starting numeric DEFAULT 0, cash_ending numeric DEFAULT 0, notes text DEFAULT NULL::text) RETURNS TABLE(success boolean, summary_id uuid, error_message text)
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     v_summary_id UUID;                                                                                                                                                                                                                   
     v_user_id UUID;                                                                                                                                                                                                                      
 BEGIN                                                                                                                                                                                                                                    
     -- Get current user (or fall back to system user)                                                                                                                                                                                    
     v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000');                                                                                                                                                           
                                                                                                                                                                                                                                          
     BEGIN                                                                                                                                                                                                                                
         -- Calculate daily summary                                                                                                                                                                                                       
         PERFORM calculate_daily_summary(target_date);                                                                                                                                                                                    
                                                                                                                                                                                                                                          
         -- Get the summary                                                                                                                                                                                                               
         SELECT id INTO v_summary_id                                                                                                                                                                                                      
         FROM daily_summaries                                                                                                                                                                                                             
         WHERE report_date = target_date;                                                                                                                                                                                                 
                                                                                                                                                                                                                                          
         -- Update with provided values                                                                                                                                                                                                   
         UPDATE daily_summaries                                                                                                                                                                                                           
         SET                                                                                                                                                                                                                              
             cash_starting = create_daily_summary_for_date.cash_starting,                                                                                                                                                                 
             cash_ending = create_daily_summary_for_date.cash_ending,                                                                                                                                                                     
             cash_difference = create_daily_summary_for_date.cash_ending - create_daily_summary_for_date.cash_starting,                                                                                                                   
             status = 'closed',                                                                                                                                                                                                           
             notes = create_daily_summary_for_date.notes,                                                                                                                                                                                 
             closed_at = NOW(),                                                                                                                                                                                                           
             created_by = v_user_id                                                                                                                                                                                                       
         WHERE id = v_summary_id;                                                                                                                                                                                                         
                                                                                                                                                                                                                                          
         RETURN QUERY SELECT true, v_summary_id, NULL::TEXT;                                                                                                                                                                              
                                                                                                                                                                                                                                          
     EXCEPTION WHEN OTHERS THEN                                                                                                                                                                                                           
         RETURN QUERY SELECT false, NULL::UUID, SQLERRM;                                                                                                                                                                                  
     END;                                                                                                                                                                                                                                 
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: execute_exact_matches(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.execute_exact_matches() RETURNS TABLE(bank_id uuid, bank_amount numeric, bank_desc text, provider_id uuid, provider_amount numeric, provider_type text, difference numeric)
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
   bank_rec RECORD;                                                                                                                                                                                                                       
   provider_rec RECORD;                                                                                                                                                                                                                   
   match_count INT := 0;                                                                                                                                                                                                                  
 BEGIN                                                                                                                                                                                                                                    
   -- Find exact matches between unmatched bank and matched providers                                                                                                                                                                     
   FOR bank_rec IN                                                                                                                                                                                                                        
     SELECT id, amount, description, transaction_date                                                                                                                                                                                     
     FROM bank_transactions                                                                                                                                                                                                               
     WHERE status = 'unmatched'                                                                                                                                                                                                           
     ORDER BY transaction_date                                                                                                                                                                                                            
   LOOP                                                                                                                                                                                                                                   
     FOR provider_rec IN                                                                                                                                                                                                                  
       SELECT id, provider, net_amount, settlement_date                                                                                                                                                                                   
       FROM provider_reports                                                                                                                                                                                                              
       WHERE status = 'matched'                                                                                                                                                                                                           
       AND ABS(net_amount - bank_rec.amount) < 0.01                                                                                                                                                                                       
     LOOP                                                                                                                                                                                                                                 
       -- Return the match for review                                                                                                                                                                                                     
       bank_id := bank_rec.id;                                                                                                                                                                                                            
       bank_amount := bank_rec.amount;                                                                                                                                                                                                    
       bank_desc := bank_rec.description;                                                                                                                                                                                                 
       provider_id := provider_rec.id;                                                                                                                                                                                                    
       provider_amount := provider_rec.net_amount;                                                                                                                                                                                        
       provider_type := provider_rec.provider;                                                                                                                                                                                            
       difference := ABS(provider_rec.net_amount - bank_rec.amount);                                                                                                                                                                      
                                                                                                                                                                                                                                          
       RETURN NEXT;                                                                                                                                                                                                                       
       match_count := match_count + 1;                                                                                                                                                                                                    
     END LOOP;                                                                                                                                                                                                                            
   END LOOP;                                                                                                                                                                                                                              
                                                                                                                                                                                                                                          
   RAISE NOTICE 'Found % exact matches', match_count;                                                                                                                                                                                     
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: find_missing_daily_closures(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.find_missing_daily_closures(start_date date, end_date date) RETURNS TABLE(missing_date date, sales_count integer, sales_total numeric, has_draft_summary boolean)
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     RETURN QUERY                                                                                                                                                                                                                         
     WITH date_series AS (                                                                                                                                                                                                                
         SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS check_date                                                                                                                                              
     ),                                                                                                                                                                                                                                   
     sales_by_date AS (                                                                                                                                                                                                                   
         SELECT                                                                                                                                                                                                                           
             DATE(created_at) as sale_date,                                                                                                                                                                                               
             COUNT(*) as sales_count,                                                                                                                                                                                                     
             SUM(total_amount) as sales_total                                                                                                                                                                                             
         FROM sales                                                                                                                                                                                                                       
         WHERE DATE(created_at) BETWEEN start_date AND end_date                                                                                                                                                                           
         AND status = 'completed'                                                                                                                                                                                                         
         GROUP BY DATE(created_at)                                                                                                                                                                                                        
     ),                                                                                                                                                                                                                                   
     summaries_by_date AS (                                                                                                                                                                                                               
         SELECT                                                                                                                                                                                                                           
             report_date,                                                                                                                                                                                                                 
             status = 'draft' as is_draft                                                                                                                                                                                                 
         FROM daily_summaries                                                                                                                                                                                                             
         WHERE report_date BETWEEN start_date AND end_date                                                                                                                                                                                
     )                                                                                                                                                                                                                                    
     SELECT                                                                                                                                                                                                                               
         ds.check_date,                                                                                                                                                                                                                   
         COALESCE(sbd.sales_count, 0)::INTEGER,                                                                                                                                                                                           
         COALESCE(sbd.sales_total, 0)::DECIMAL(10,2),                                                                                                                                                                                     
         COALESCE(subd.is_draft, false)::BOOLEAN                                                                                                                                                                                          
     FROM date_series ds                                                                                                                                                                                                                  
     LEFT JOIN sales_by_date sbd ON ds.check_date = sbd.sale_date                                                                                                                                                                         
     LEFT JOIN summaries_by_date subd ON ds.check_date = subd.report_date                                                                                                                                                                 
     WHERE (sbd.sales_count > 0 OR subd.report_date IS NOT NULL)  -- Has activity                                                                                                                                                         
     AND (subd.report_date IS NULL OR subd.is_draft = true);      -- No closure or still draft                                                                                                                                            
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: generate_document_number(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_document_number(doc_type text) RETURNS text
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     sequence_record RECORD;                                                                                                                                                                                                              
     new_number INTEGER;                                                                                                                                                                                                                  
     formatted_number TEXT;                                                                                                                                                                                                               
     current_year TEXT;                                                                                                                                                                                                                   
 BEGIN                                                                                                                                                                                                                                    
     current_year := EXTRACT(YEAR FROM NOW())::TEXT;                                                                                                                                                                                      
                                                                                                                                                                                                                                          
     -- Lock row for update to prevent race conditions                                                                                                                                                                                    
     SELECT * INTO sequence_record                                                                                                                                                                                                        
     FROM document_sequences                                                                                                                                                                                                              
     WHERE type = doc_type                                                                                                                                                                                                                
     FOR UPDATE;                                                                                                                                                                                                                          
                                                                                                                                                                                                                                          
     IF NOT FOUND THEN                                                                                                                                                                                                                    
         RAISE EXCEPTION 'Document type % not found in document_sequences table', doc_type;                                                                                                                                               
     END IF;                                                                                                                                                                                                                              
                                                                                                                                                                                                                                          
     new_number := sequence_record.current_number + 1;                                                                                                                                                                                    
                                                                                                                                                                                                                                          
     -- Update sequence counter                                                                                                                                                                                                           
     UPDATE document_sequences                                                                                                                                                                                                            
     SET current_number = new_number,                                                                                                                                                                                                     
         updated_at = NOW()                                                                                                                                                                                                               
     WHERE type = doc_type;                                                                                                                                                                                                               
                                                                                                                                                                                                                                          
     -- Format number according to pattern                                                                                                                                                                                                
     -- Replace {YYYY} with current year and {number:06d} with zero-padded number                                                                                                                                                         
     formatted_number := REPLACE(                                                                                                                                                                                                         
         REPLACE(sequence_record.format, '{YYYY}', current_year),                                                                                                                                                                         
         '{number:06d}', LPAD(new_number::TEXT, 6, '0')                                                                                                                                                                                   
     );                                                                                                                                                                                                                                   
                                                                                                                                                                                                                                          
     -- Handle different number formats for reports                                                                                                                                                                                       
     formatted_number := REPLACE(formatted_number, '{number:04d}', LPAD(new_number::TEXT, 4, '0'));                                                                                                                                       
     formatted_number := REPLACE(formatted_number, '{number:03d}', LPAD(new_number::TEXT, 3, '0'));                                                                                                                                       
                                                                                                                                                                                                                                          
     RETURN formatted_number;                                                                                                                                                                                                             
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: get_booking_rules(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_booking_rules(p_organization_id uuid) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_booking_rules JSONB;
BEGIN
    SELECT booking_rules
    INTO v_booking_rules
    FROM business_settings
    WHERE organization_id = p_organization_id;
    
    IF v_booking_rules IS NULL THEN
        -- Return defaults if not found
        RETURN '{
            "slotInterval": 15,
            "defaultDuration": 60,
            "maxAdvanceDays": 90,
            "minAdvanceHours": 2,
            "bufferMinutes": 5,
            "autoConfirm": true
        }'::JSONB;
    END IF;
    
    RETURN v_booking_rules;
END;
$$;


--
-- Name: get_current_cash_balance(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_cash_balance() RETURNS numeric
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


--
-- Name: get_current_cash_balance_for_org(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_cash_balance_for_org(org_id uuid) RETURNS numeric
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


--
-- Name: get_net_profit_for_period(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_net_profit_for_period(start_date date, end_date date) RETURNS numeric
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


--
-- Name: get_net_revenue_for_period(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_net_revenue_for_period(start_date date, end_date date) RETURNS numeric
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


--
-- Name: get_next_receipt_number(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_next_receipt_number(doc_type text) RETURNS text
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     next_number TEXT;                                                                                                                                                                                                                    
 BEGIN                                                                                                                                                                                                                                    
     SELECT generate_document_number(doc_type) INTO next_number;                                                                                                                                                                          
     RETURN next_number;                                                                                                                                                                                                                  
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: get_or_create_supplier(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_or_create_supplier(supplier_name_input text, user_id_input uuid DEFAULT NULL::uuid) RETURNS uuid
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


--
-- Name: get_owner_loan_balance(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_owner_loan_balance(user_uuid uuid) RETURNS numeric
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
     -- Formula: (Owner gave) - (Owner received) = (Expenses  Deposits) - Withdrawals                                                                                                                                                    
     RETURN (total_expenses + total_deposits - total_withdrawals);                                                                                                                                                                        
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: get_revenue_breakdown_for_period(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_revenue_breakdown_for_period(start_date date, end_date date) RETURNS TABLE(gross_revenue numeric, total_fees numeric, net_revenue numeric, cash_revenue numeric, provider_revenue numeric)
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


--
-- Name: get_working_hours(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_working_hours(p_organization_id uuid, p_weekday text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_working_hours JSONB;
BEGIN
    SELECT working_hours->p_weekday
    INTO v_working_hours
    FROM business_settings
    WHERE organization_id = p_organization_id;
    
    IF v_working_hours IS NULL THEN
        -- Return default if not found
        RETURN '{"start": "09:00", "end": "18:00", "closed": false, "breaks": []}'::JSONB;
    END IF;
    
    RETURN v_working_hours;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
   INSERT INTO public.users (id, name, username, email, role)                                                                                                                                                                             
   VALUES (                                                                                                                                                                                                                               
     NEW.id,                                                                                                                                                                                                                              
     COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),                                                                                                                                                                                
     COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),                                                                                                                                                        
     NEW.email,                                                                                                                                                                                                                           
     'admin'                                                                                                                                                                                                                              
   )                                                                                                                                                                                                                                      
   ON CONFLICT (id) DO UPDATE                                                                                                                                                                                                             
   SET                                                                                                                                                                                                                                    
     email = NEW.email,                                                                                                                                                                                                                   
     name = COALESCE(NEW.raw_user_meta_data->>'name', users.name);                                                                                                                                                                        
                                                                                                                                                                                                                                          
   RETURN NEW;                                                                                                                                                                                                                            
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: handle_user_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_user_delete() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
   UPDATE public.users                                                                                                                                                                                                                    
   SET active = FALSE                                                                                                                                                                                                                     
   WHERE id = OLD.id;                                                                                                                                                                                                                     
                                                                                                                                                                                                                                          
   RETURN OLD;                                                                                                                                                                                                                            
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: is_organization_open(uuid, date, time without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_organization_open(p_organization_id uuid, p_date date, p_time time without time zone) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_weekday TEXT;
    v_day_hours JSONB;
    v_vacation_periods JSONB;
    v_vacation JSONB;
    v_break JSONB;
BEGIN
    -- Get weekday name
    v_weekday := LOWER(TO_CHAR(p_date, 'Day'));
    v_weekday := TRIM(v_weekday);
    
    -- Get working hours and vacation periods
    SELECT working_hours->v_weekday, vacation_periods
    INTO v_day_hours, v_vacation_periods
    FROM business_settings
    WHERE organization_id = p_organization_id;
    
    -- Check if day is closed
    IF (v_day_hours->>'closed')::BOOLEAN = true THEN
        RETURN false;
    END IF;
    
    -- Check if outside working hours
    IF p_time < (v_day_hours->>'start')::TIME OR p_time >= (v_day_hours->>'end')::TIME THEN
        RETURN false;
    END IF;
    
    -- Check vacation periods
    FOR v_vacation IN SELECT * FROM jsonb_array_elements(v_vacation_periods)
    LOOP
        IF p_date >= (v_vacation->>'start')::DATE AND p_date <= (v_vacation->>'end')::DATE THEN
            RETURN false;
        END IF;
    END LOOP;
    
    -- Check break times
    FOR v_break IN SELECT * FROM jsonb_array_elements(v_day_hours->'breaks')
    LOOP
        IF p_time >= (v_break->>'start')::TIME AND p_time < (v_break->>'end')::TIME THEN
            RETURN false;
        END IF;
    END LOOP;
    
    RETURN true;
END;
$$;


--
-- Name: log_financial_changes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_financial_changes() RETURNS trigger
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
             ip_address                                                                                                                                                                                                                   
         ) VALUES (                                                                                                                                                                                                                       
             TG_TABLE_NAME,                                                                                                                                                                                                               
             COALESCE(NEW.id, OLD.id),                                                                                                                                                                                                    
             TG_OP,                                                                                                                                                                                                                       
             CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,                                                                                                                                                              
             CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,                                                                                                                                                 
             COALESCE(NEW.user_id, OLD.user_id),                                                                                                                                                                                          
             inet_client_addr()                                                                                                                                                                                                           
         );                                                                                                                                                                                                                               
     END IF;                                                                                                                                                                                                                              
                                                                                                                                                                                                                                          
     RETURN COALESCE(NEW, OLD);                                                                                                                                                                                                           
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: migrate_existing_bank_transactions_numbers(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.migrate_existing_bank_transactions_numbers() RETURNS integer
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     transaction_record RECORD;                                                                                                                                                                                                           
     updated_count INTEGER := 0;                                                                                                                                                                                                          
     new_transaction_number TEXT;                                                                                                                                                                                                         
 BEGIN                                                                                                                                                                                                                                    
     -- Process bank transactions in chronological order (oldest first)                                                                                                                                                                   
     FOR transaction_record IN                                                                                                                                                                                                            
         SELECT id, created_at                                                                                                                                                                                                            
         FROM bank_transactions                                                                                                                                                                                                           
         WHERE transaction_number IS NULL                                                                                                                                                                                                 
         ORDER BY created_at ASC                                                                                                                                                                                                          
     LOOP                                                                                                                                                                                                                                 
         -- Generate transaction number                                                                                                                                                                                                   
         new_transaction_number := generate_document_number('bank_transaction');                                                                                                                                                          
                                                                                                                                                                                                                                          
         -- Update the bank transaction with transaction number                                                                                                                                                                           
         UPDATE bank_transactions                                                                                                                                                                                                         
         SET transaction_number = new_transaction_number                                                                                                                                                                                  
         WHERE id = transaction_record.id;                                                                                                                                                                                                
                                                                                                                                                                                                                                          
         updated_count := updated_count + 1;                                                                                                                                                                                              
     END LOOP;                                                                                                                                                                                                                            
                                                                                                                                                                                                                                          
     RETURN updated_count;                                                                                                                                                                                                                
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: migrate_existing_cash_movements_numbers(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.migrate_existing_cash_movements_numbers() RETURNS integer
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     movement_record RECORD;                                                                                                                                                                                                              
     updated_count INTEGER := 0;                                                                                                                                                                                                          
     new_movement_number TEXT;                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     -- Process cash movements in chronological order (oldest first)                                                                                                                                                                      
     FOR movement_record IN                                                                                                                                                                                                               
         SELECT id, created_at                                                                                                                                                                                                            
         FROM cash_movements                                                                                                                                                                                                              
         WHERE movement_number IS NULL                                                                                                                                                                                                    
         ORDER BY created_at ASC                                                                                                                                                                                                          
     LOOP                                                                                                                                                                                                                                 
         -- Generate movement number                                                                                                                                                                                                      
         new_movement_number := generate_document_number('cash_movement');                                                                                                                                                                
                                                                                                                                                                                                                                          
         -- Update the cash movement with movement number                                                                                                                                                                                 
         UPDATE cash_movements                                                                                                                                                                                                            
         SET movement_number = new_movement_number                                                                                                                                                                                        
         WHERE id = movement_record.id;                                                                                                                                                                                                   
                                                                                                                                                                                                                                          
         updated_count := updated_count + 1;                                                                                                                                                                                              
     END LOOP;                                                                                                                                                                                                                            
                                                                                                                                                                                                                                          
     RETURN updated_count;                                                                                                                                                                                                                
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: migrate_existing_documents_numbers(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.migrate_existing_documents_numbers() RETURNS integer
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     doc_record RECORD;                                                                                                                                                                                                                   
     updated_count INTEGER := 0;                                                                                                                                                                                                          
     new_document_number TEXT;                                                                                                                                                                                                            
     doc_type_for_sequence TEXT;                                                                                                                                                                                                          
 BEGIN                                                                                                                                                                                                                                    
     -- Process documents in chronological order (oldest first)                                                                                                                                                                           
     FOR doc_record IN                                                                                                                                                                                                                    
         SELECT id, type, created_at                                                                                                                                                                                                      
         FROM documents                                                                                                                                                                                                                   
         WHERE document_number IS NULL                                                                                                                                                                                                    
         ORDER BY created_at ASC                                                                                                                                                                                                          
     LOOP                                                                                                                                                                                                                                 
         -- Determine sequence type based on document type                                                                                                                                                                                
         CASE doc_record.type                                                                                                                                                                                                             
             WHEN 'receipt' THEN                                                                                                                                                                                                          
                 doc_type_for_sequence := 'sale_receipt';                                                                                                                                                                                 
             WHEN 'expense_receipt' THEN                                                                                                                                                                                                  
                 doc_type_for_sequence := 'expense_receipt';                                                                                                                                                                              
             WHEN 'daily_report' THEN                                                                                                                                                                                                     
                 doc_type_for_sequence := 'daily_report';                                                                                                                                                                                 
             WHEN 'monthly_report' THEN                                                                                                                                                                                                   
                 doc_type_for_sequence := 'monthly_report';                                                                                                                                                                               
             WHEN 'yearly_report' THEN                                                                                                                                                                                                    
                 doc_type_for_sequence := 'monthly_report'; -- Use monthly format                                                                                                                                                         
             ELSE                                                                                                                                                                                                                         
                 doc_type_for_sequence := 'sale_receipt'; -- Default fallback                                                                                                                                                             
         END CASE;                                                                                                                                                                                                                        
                                                                                                                                                                                                                                          
         -- Generate document number                                                                                                                                                                                                      
         new_document_number := generate_document_number(doc_type_for_sequence);                                                                                                                                                          
                                                                                                                                                                                                                                          
         -- Update the document with document number                                                                                                                                                                                      
         UPDATE documents                                                                                                                                                                                                                 
         SET document_number = new_document_number                                                                                                                                                                                        
         WHERE id = doc_record.id;                                                                                                                                                                                                        
                                                                                                                                                                                                                                          
         updated_count := updated_count + 1;                                                                                                                                                                                              
     END LOOP;                                                                                                                                                                                                                            
                                                                                                                                                                                                                                          
     RETURN updated_count;                                                                                                                                                                                                                
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: migrate_existing_expenses_receipt_numbers(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.migrate_existing_expenses_receipt_numbers() RETURNS integer
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     expense_record RECORD;                                                                                                                                                                                                               
     updated_count INTEGER := 0;                                                                                                                                                                                                          
     new_receipt_number TEXT;                                                                                                                                                                                                             
 BEGIN                                                                                                                                                                                                                                    
     -- Process expenses in chronological order (oldest first)                                                                                                                                                                            
     FOR expense_record IN                                                                                                                                                                                                                
         SELECT id, created_at                                                                                                                                                                                                            
         FROM expenses                                                                                                                                                                                                                    
         WHERE receipt_number IS NULL                                                                                                                                                                                                     
         ORDER BY created_at ASC                                                                                                                                                                                                          
     LOOP                                                                                                                                                                                                                                 
         -- Generate receipt number                                                                                                                                                                                                       
         new_receipt_number := generate_document_number('expense_receipt');                                                                                                                                                               
                                                                                                                                                                                                                                          
         -- Update the expense with receipt number                                                                                                                                                                                        
         UPDATE expenses                                                                                                                                                                                                                  
         SET receipt_number = new_receipt_number                                                                                                                                                                                          
         WHERE id = expense_record.id;                                                                                                                                                                                                    
                                                                                                                                                                                                                                          
         updated_count := updated_count + 1;                                                                                                                                                                                              
     END LOOP;                                                                                                                                                                                                                            
                                                                                                                                                                                                                                          
     RETURN updated_count;                                                                                                                                                                                                                
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: migrate_existing_sales_receipt_numbers(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.migrate_existing_sales_receipt_numbers() RETURNS integer
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     sale_record RECORD;                                                                                                                                                                                                                  
     updated_count INTEGER := 0;                                                                                                                                                                                                          
     new_receipt_number TEXT;                                                                                                                                                                                                             
 BEGIN                                                                                                                                                                                                                                    
     -- Process sales in chronological order (oldest first)                                                                                                                                                                               
     FOR sale_record IN                                                                                                                                                                                                                   
         SELECT id, created_at                                                                                                                                                                                                            
         FROM sales                                                                                                                                                                                                                       
         WHERE receipt_number IS NULL                                                                                                                                                                                                     
         ORDER BY created_at ASC                                                                                                                                                                                                          
     LOOP                                                                                                                                                                                                                                 
         -- Generate receipt number                                                                                                                                                                                                       
         new_receipt_number := generate_document_number('sale_receipt');                                                                                                                                                                  
                                                                                                                                                                                                                                          
         -- Update the sale with receipt number                                                                                                                                                                                           
         UPDATE sales                                                                                                                                                                                                                     
         SET receipt_number = new_receipt_number                                                                                                                                                                                          
         WHERE id = sale_record.id;                                                                                                                                                                                                       
                                                                                                                                                                                                                                          
         updated_count := updated_count + 1;                                                                                                                                                                                              
     END LOOP;                                                                                                                                                                                                                            
                                                                                                                                                                                                                                          
     RETURN updated_count;                                                                                                                                                                                                                
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: normalize_supplier_name(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.normalize_supplier_name(supplier_name text) RETURNS text
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
   RETURN lower(trim(regexp_replace(supplier_name, '[^a-zA-Z0-9\s]', '', 'g')));                                                                                                                                                          
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: receipt_number_exists(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.receipt_number_exists(receipt_num text, table_name text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     count_result INTEGER;                                                                                                                                                                                                                
     query_text TEXT;                                                                                                                                                                                                                     
 BEGIN                                                                                                                                                                                                                                    
     CASE table_name                                                                                                                                                                                                                      
         WHEN 'sales' THEN                                                                                                                                                                                                                
             SELECT COUNT(*) INTO count_result FROM sales WHERE receipt_number = receipt_num;                                                                                                                                             
         WHEN 'expenses' THEN                                                                                                                                                                                                             
             SELECT COUNT(*) INTO count_result FROM expenses WHERE receipt_number = receipt_num;                                                                                                                                          
         WHEN 'documents' THEN                                                                                                                                                                                                            
             SELECT COUNT(*) INTO count_result FROM documents WHERE document_number = receipt_num;                                                                                                                                        
         WHEN 'bank_transactions' THEN                                                                                                                                                                                                    
             SELECT COUNT(*) INTO count_result FROM bank_transactions WHERE transaction_number = receipt_num;                                                                                                                             
         WHEN 'cash_movements' THEN                                                                                                                                                                                                       
             SELECT COUNT(*) INTO count_result FROM cash_movements WHERE movement_number = receipt_num;                                                                                                                                   
         ELSE                                                                                                                                                                                                                             
             RETURN FALSE;                                                                                                                                                                                                                
     END CASE;                                                                                                                                                                                                                            
                                                                                                                                                                                                                                          
     RETURN count_result > 0;                                                                                                                                                                                                             
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: reset_sequence_for_year(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reset_sequence_for_year(doc_type text) RETURNS void
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     UPDATE document_sequences                                                                                                                                                                                                            
     SET current_number = 0,                                                                                                                                                                                                              
         updated_at = NOW()                                                                                                                                                                                                               
     WHERE type = doc_type;                                                                                                                                                                                                               
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: update_appointment_on_service_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_appointment_on_service_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE appointments 
    SET updated_at = NOW() 
    WHERE id = COALESCE(NEW.appointment_id, OLD.appointment_id);
    RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_bank_account_balance(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_bank_account_balance() RETURNS trigger
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     -- Update current_balance and last_statement_date                                                                                                                                                                                    
     UPDATE bank_accounts                                                                                                                                                                                                                 
     SET                                                                                                                                                                                                                                  
         current_balance = (                                                                                                                                                                                                              
             SELECT COALESCE(SUM(amount), 0)                                                                                                                                                                                              
             FROM bank_transactions                                                                                                                                                                                                       
             WHERE bank_account_id = COALESCE(NEW.bank_account_id, OLD.bank_account_id)                                                                                                                                                   
         ),                                                                                                                                                                                                                               
         last_statement_date = (                                                                                                                                                                                                          
             SELECT MAX(transaction_date)                                                                                                                                                                                                 
             FROM bank_transactions                                                                                                                                                                                                       
             WHERE bank_account_id = COALESCE(NEW.bank_account_id, OLD.bank_account_id)                                                                                                                                                   
         ),                                                                                                                                                                                                                               
         updated_at = NOW()                                                                                                                                                                                                               
     WHERE id = COALESCE(NEW.bank_account_id, OLD.bank_account_id);                                                                                                                                                                       
                                                                                                                                                                                                                                          
     RETURN COALESCE(NEW, OLD);                                                                                                                                                                                                           
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: update_business_settings_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_business_settings_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
   NEW.updated_at = NOW();                                                                                                                                                                                                                
   RETURN NEW;                                                                                                                                                                                                                            
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: update_owner_transactions_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_owner_transactions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     NEW.updated_at = NOW();                                                                                                                                                                                                              
     RETURN NEW;                                                                                                                                                                                                                          
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: update_sales_banking_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_sales_banking_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
     IF NEW.sale_id IS NOT NULL AND OLD.sale_id IS NULL THEN                                                                                                                                                                              
         -- Provider report was just matched to a sale                                                                                                                                                                                    
         UPDATE sales                                                                                                                                                                                                                     
         SET                                                                                                                                                                                                                              
             provider_report_id = NEW.id,                                                                                                                                                                                                 
             banking_status = CASE                                                                                                                                                                                                        
                 WHEN bank_transaction_id IS NOT NULL THEN 'fully_matched'                                                                                                                                                                
                 ELSE 'provider_matched'                                                                                                                                                                                                  
             END                                                                                                                                                                                                                          
         WHERE id = NEW.sale_id;                                                                                                                                                                                                          
     END IF;                                                                                                                                                                                                                              
                                                                                                                                                                                                                                          
     RETURN NEW;                                                                                                                                                                                                                          
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: update_suppliers_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_suppliers_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 BEGIN                                                                                                                                                                                                                                    
   NEW.updated_at = now();                                                                                                                                                                                                                
   RETURN NEW;                                                                                                                                                                                                                            
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: validate_expense_category(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_expense_category(category_key text, user_id_param uuid) RETURNS boolean
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
                                                                                                                                                                                                                                          
   -- Check custom categories in business_settings                                                                                                                                                                                        
   SELECT custom_expense_categories                                                                                                                                                                                                       
   INTO business_settings_record                                                                                                                                                                                                          
   FROM business_settings                                                                                                                                                                                                                 
   WHERE business_settings.user_id = user_id_param;                                                                                                                                                                                       
                                                                                                                                                                                                                                          
   -- If no business settings yet, only allow default categories                                                                                                                                                                          
   IF business_settings_record.custom_expense_categories IS NULL THEN                                                                                                                                                                     
     RETURN FALSE;                                                                                                                                                                                                                        
   END IF;                                                                                                                                                                                                                                
                                                                                                                                                                                                                                          
   -- Check if category exists in custom categories                                                                                                                                                                                       
   RETURN (business_settings_record.custom_expense_categories ? category_key);                                                                                                                                                            
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: validate_monthly_closure_prerequisites(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_monthly_closure_prerequisites(check_year integer, check_month integer) RETURNS TABLE(is_valid boolean, missing_count integer, missing_dates date[])
    LANGUAGE plpgsql
    AS $$                                                                                                                                                                                                                            
 DECLARE                                                                                                                                                                                                                                  
     month_start DATE;                                                                                                                                                                                                                    
     month_end DATE;                                                                                                                                                                                                                      
     missing_closures DATE[];                                                                                                                                                                                                             
     missing_count_val INTEGER;                                                                                                                                                                                                           
 BEGIN                                                                                                                                                                                                                                    
     -- Calculate month boundaries                                                                                                                                                                                                        
     month_start := DATE_TRUNC('month', MAKE_DATE(check_year, check_month, 1))::DATE;                                                                                                                                                     
     month_end := (DATE_TRUNC('month', MAKE_DATE(check_year, check_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;                                                                                                             
                                                                                                                                                                                                                                          
     -- Find missing closures                                                                                                                                                                                                             
     SELECT ARRAY_AGG(missing_date ORDER BY missing_date)                                                                                                                                                                                 
     INTO missing_closures                                                                                                                                                                                                                
     FROM find_missing_daily_closures(month_start, month_end);                                                                                                                                                                            
                                                                                                                                                                                                                                          
     missing_count_val := COALESCE(array_length(missing_closures, 1), 0);                                                                                                                                                                 
                                                                                                                                                                                                                                          
     RETURN QUERY SELECT                                                                                                                                                                                                                  
         (missing_count_val = 0),                                                                                                                                                                                                         
         missing_count_val,                                                                                                                                                                                                               
         missing_closures;                                                                                                                                                                                                                
 END;                                                                                                                                                                                                                                     
 $$;


--
-- Name: validate_working_hours(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_working_hours(working_hours_json jsonb) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    required_days TEXT[] := ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    day TEXT;
    day_config JSONB;
BEGIN
    -- Check all required days are present
    FOREACH day IN ARRAY required_days
    LOOP
        IF NOT (working_hours_json ? day) THEN
            RAISE EXCEPTION 'Missing required day: %', day;
        END IF;
        
        day_config := working_hours_json->day;
        
        -- Validate required fields for each day
        IF NOT (day_config ? 'start' AND day_config ? 'end' AND day_config ? 'closed' AND day_config ? 'breaks') THEN
            RAISE EXCEPTION 'Day % missing required fields (start, end, closed, breaks)', day;
        END IF;
        
        -- Validate time format (basic check)
        IF NOT (day_config->>'closed')::BOOLEAN THEN
            -- Only validate times if not closed
            IF (day_config->>'start')::TIME >= (day_config->>'end')::TIME THEN
                RAISE EXCEPTION 'Day % start time must be before end time', day;
            END IF;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: -
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


--
-- Name: secrets_encrypt_secret_secret(); Type: FUNCTION; Schema: vault; Owner: -
--

CREATE FUNCTION vault.secrets_encrypt_secret_secret() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
		BEGIN
		        new.secret = CASE WHEN new.secret IS NULL THEN NULL ELSE
			CASE WHEN new.key_id IS NULL THEN NULL ELSE pg_catalog.encode(
			  pgsodium.crypto_aead_det_encrypt(
				pg_catalog.convert_to(new.secret, 'utf8'),
				pg_catalog.convert_to((new.id::text || new.description::text || new.created_at::text || new.updated_at::text)::text, 'utf8'),
				new.key_id::uuid,
				new.nonce
			  ),
				'base64') END END;
		RETURN new;
		END;
		$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret text,
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL
);


--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: appointment_services; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: TABLE appointment_services; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.appointment_services IS 'Junction table for many-to-many relationship between appointments and services (items)';


--
-- Name: COLUMN appointment_services.service_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointment_services.service_price IS 'Price override for this service in this appointment';


--
-- Name: COLUMN appointment_services.service_duration_minutes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointment_services.service_duration_minutes IS 'Duration override for this service in this appointment';


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: appointments_with_services; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.appointments_with_services AS
SELECT
    NULL::uuid AS id,
    NULL::date AS appointment_date,
    NULL::time without time zone AS start_time,
    NULL::time without time zone AS end_time,
    NULL::uuid AS customer_id,
    NULL::text AS customer_name,
    NULL::text AS customer_phone,
    NULL::text AS notes,
    NULL::numeric(10,2) AS estimated_price,
    NULL::uuid AS organization_id,
    NULL::timestamp with time zone AS created_at,
    NULL::uuid AS created_by,
    NULL::timestamp with time zone AS updated_at,
    NULL::uuid AS updated_by,
    NULL::json AS services,
    NULL::numeric AS total_price,
    NULL::bigint AS total_duration_minutes;


--
-- Name: VIEW appointments_with_services; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.appointments_with_services IS 'Ultra-clean view: appointments with aggregated services data, no status complexity';


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    action text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    user_id uuid NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now(),
    ip_address inet,
    session_id text,
    is_immutable boolean DEFAULT true,
    CONSTRAINT audit_log_action_check CHECK ((action = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: cash_movements; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

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
    CONSTRAINT expenses_category_valid CHECK (public.validate_expense_category(category, user_id)),
    CONSTRAINT expenses_payment_method_check CHECK ((payment_method = ANY (ARRAY['bank'::text, 'cash'::text])))
);


--
-- Name: owner_transactions; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: provider_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider character varying(20) NOT NULL,
    transaction_date date NOT NULL,
    settlement_date date,
    gross_amount numeric(10,2) NOT NULL,
    fees numeric(10,2) DEFAULT 0.00 NOT NULL,
    net_amount numeric(10,2) NOT NULL,
    provider_transaction_id character varying(100),
    provider_reference character varying(255),
    payment_method character varying(50),
    currency character varying(3) DEFAULT 'CHF'::character varying,
    import_filename character varying(255) NOT NULL,
    import_date timestamp with time zone DEFAULT now(),
    raw_data jsonb,
    sale_id uuid,
    status character varying(20) DEFAULT 'unmatched'::character varying,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    notes text,
    organization_id uuid,
    CONSTRAINT provider_reports_provider_check CHECK (((provider)::text = ANY (ARRAY[('twint'::character varying)::text, ('sumup'::character varying)::text]))),
    CONSTRAINT provider_reports_status_check CHECK (((status)::text = ANY (ARRAY[('unmatched'::character varying)::text, ('matched'::character varying)::text, ('discrepancy'::character varying)::text])))
);


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: available_for_bank_matching; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.available_for_bank_matching AS
 SELECT s.id,
    'sale'::text AS item_type,
    (s.created_at)::date AS date,
    pr.net_amount AS amount,
    concat('Sale #', s.id, ' (', pr.provider, ' net)') AS description,
    s.banking_status,
    s.organization_id
   FROM (public.sales s
     JOIN public.provider_reports pr ON ((s.provider_report_id = pr.id)))
  WHERE ((s.banking_status)::text = 'provider_matched'::text)
UNION ALL
 SELECT e.id,
    'expense'::text AS item_type,
    e.payment_date AS date,
    (- e.amount) AS amount,
    e.description,
    e.banking_status,
    e.organization_id
   FROM public.expenses e
  WHERE ((e.banking_status)::text = 'unmatched'::text)
UNION ALL
 SELECT cm.id,
    'cash_movement'::text AS item_type,
    (cm.created_at)::date AS date,
    cm.amount,
    concat('Cash Transfer: ', cm.description) AS description,
    cm.banking_status,
    cm.organization_id
   FROM public.cash_movements cm
  WHERE (((cm.banking_status)::text = 'unmatched'::text) AND ((cm.movement_type)::text = 'bank_transfer'::text))
UNION ALL
 SELECT ot.id,
    'owner_transaction'::text AS item_type,
    ot.transaction_date AS date,
        CASE ot.transaction_type
            WHEN 'deposit'::text THEN ot.amount
            WHEN 'withdrawal'::text THEN (- ot.amount)
            WHEN 'expense'::text THEN (- ot.amount)
            ELSE NULL::numeric
        END AS amount,
    concat('Owner ',
        CASE ot.transaction_type
            WHEN 'deposit'::text THEN 'Einlage'::text
            WHEN 'withdrawal'::text THEN 'Entnahme'::text
            WHEN 'expense'::text THEN 'Ausgabe'::text
            ELSE NULL::text
        END, ': ', ot.description) AS description,
    ot.banking_status,
    ot.organization_id
   FROM public.owner_transactions ot
  WHERE (((ot.payment_method)::text = 'bank_transfer'::text) AND ((ot.banking_status)::text = 'unmatched'::text))
  ORDER BY 3 DESC;


--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    bank_name character varying(50) NOT NULL,
    iban character varying(34),
    account_number character varying(50),
    current_balance numeric(12,2) DEFAULT 0.00,
    last_statement_date date,
    is_active boolean DEFAULT true,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    notes text,
    organization_id uuid
);


--
-- Name: bank_import_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_import_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bank_account_id uuid NOT NULL,
    import_filename character varying(255) NOT NULL,
    import_type character varying(20) DEFAULT 'camt053'::character varying,
    total_entries integer NOT NULL,
    new_entries integer NOT NULL,
    duplicate_entries integer NOT NULL,
    error_entries integer NOT NULL,
    statement_from_date date,
    statement_to_date date,
    status character varying(20) DEFAULT 'completed'::character varying,
    imported_by uuid,
    imported_at timestamp with time zone DEFAULT now(),
    notes text,
    organization_id uuid,
    CONSTRAINT bank_import_sessions_import_type_check CHECK (((import_type)::text = ANY (ARRAY[('camt053'::character varying)::text, ('csv'::character varying)::text]))),
    CONSTRAINT bank_import_sessions_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('completed'::character varying)::text, ('failed'::character varying)::text])))
);


--
-- Name: bank_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bank_account_id uuid NOT NULL,
    transaction_date date NOT NULL,
    booking_date date,
    amount numeric(12,2) NOT NULL,
    description text NOT NULL,
    reference character varying(255),
    transaction_code character varying(20),
    import_batch_id uuid,
    import_filename character varying(255),
    import_date timestamp with time zone DEFAULT now(),
    raw_data jsonb,
    status character varying(20) DEFAULT 'unmatched'::character varying,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    notes text,
    transaction_number character varying(20),
    organization_id uuid,
    CONSTRAINT bank_transactions_status_check CHECK (((status)::text = ANY (ARRAY[('unmatched'::character varying)::text, ('matched'::character varying)::text, ('ignored'::character varying)::text])))
);


--
-- Name: business_settings; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: customer_notes; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: daily_summaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_summaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_date date NOT NULL,
    sales_cash numeric(10,2) DEFAULT 0 NOT NULL,
    sales_twint numeric(10,2) DEFAULT 0 NOT NULL,
    sales_sumup numeric(10,2) DEFAULT 0 NOT NULL,
    sales_total numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_cash numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_bank numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_total numeric(10,2) DEFAULT 0 NOT NULL,
    cash_starting numeric(10,2) DEFAULT 0 NOT NULL,
    cash_ending numeric(10,2) DEFAULT 0 NOT NULL,
    cash_difference numeric(10,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    notes text,
    created_by uuid,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    closed_at timestamp with time zone,
    organization_id uuid,
    CONSTRAINT daily_summaries_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'closed'::text])))
);


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
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: items; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: monthly_summaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monthly_summaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    sales_cash numeric(10,2) DEFAULT 0 NOT NULL,
    sales_twint numeric(10,2) DEFAULT 0 NOT NULL,
    sales_sumup numeric(10,2) DEFAULT 0 NOT NULL,
    sales_total numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_cash numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_bank numeric(10,2) DEFAULT 0 NOT NULL,
    expenses_total numeric(10,2) DEFAULT 0 NOT NULL,
    transaction_count integer DEFAULT 0 NOT NULL,
    avg_daily_revenue numeric(10,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    notes text,
    created_by uuid,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    closed_at timestamp with time zone,
    organization_id uuid,
    CONSTRAINT monthly_summaries_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'closed'::text])))
);


--
-- Name: organization_users; Type: TABLE; Schema: public; Owner: -
--

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
-- Name: provider_import_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_import_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider character varying(20) NOT NULL,
    filename character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    imported_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    import_type character varying(20) DEFAULT 'csv'::character varying,
    total_records integer DEFAULT 0,
    new_records integer DEFAULT 0,
    duplicate_records integer DEFAULT 0,
    error_records integer DEFAULT 0,
    date_range_from date,
    date_range_to date,
    completed_at timestamp with time zone,
    notes text,
    records_imported integer DEFAULT 0,
    records_failed integer DEFAULT 0,
    organization_id uuid
);


--
-- Name: recent_missing_closures; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.recent_missing_closures AS
 SELECT find_missing_daily_closures.missing_date,
    find_missing_daily_closures.sales_count,
    find_missing_daily_closures.sales_total,
    find_missing_daily_closures.has_draft_summary,
    (CURRENT_DATE - find_missing_daily_closures.missing_date) AS days_ago
   FROM public.find_missing_daily_closures(((CURRENT_DATE - '30 days'::interval))::date, ((CURRENT_DATE - '1 day'::interval))::date) find_missing_daily_closures(missing_date, sales_count, sales_total, has_draft_summary)
  ORDER BY find_missing_daily_closures.missing_date DESC;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: transaction_matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transaction_matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bank_transaction_id uuid NOT NULL,
    matched_type character varying(20) NOT NULL,
    matched_id uuid NOT NULL,
    matched_amount numeric(10,2) NOT NULL,
    match_confidence numeric(5,2) DEFAULT 0.00,
    match_type character varying(20) DEFAULT 'manual'::character varying,
    matched_by uuid,
    matched_at timestamp with time zone DEFAULT now(),
    notes text,
    organization_id uuid,
    CONSTRAINT transaction_matches_match_type_check CHECK (((match_type)::text = ANY (ARRAY[('automatic'::character varying)::text, ('manual'::character varying)::text, ('suggested'::character varying)::text]))),
    CONSTRAINT transaction_matches_matched_type_check CHECK (((matched_type)::text = ANY (ARRAY[('sale'::character varying)::text, ('expense'::character varying)::text, ('provider_batch'::character varying)::text, ('cash_movement'::character varying)::text, ('owner_transaction'::character varying)::text])))
);


--
-- Name: unified_transactions_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.unified_transactions_view AS
 WITH transaction_base AS (
         SELECT s.id,
            'sale'::text AS transaction_type,
            'VK'::text AS type_code,
            s.receipt_number,
            s.created_at AS transaction_date,
            s.total_amount AS amount,
            s.payment_method,
            s.status,
            s.user_id,
            s.organization_id,
            COALESCE(( SELECT string_agg(i.name, ', '::text) AS string_agg
                   FROM (public.sale_items si
                     JOIN public.items i ON ((si.item_id = i.id)))
                  WHERE (si.sale_id = s.id)), 'Verkauf'::text) AS description,
            d.id AS document_id,
                CASE
                    WHEN (d.id IS NOT NULL) THEN true
                    ELSE false
                END AS has_pdf,
            s.banking_status,
            pr.fees AS provider_fee,
            pr.net_amount,
            s.provider_report_id,
                CASE
                    WHEN (s.provider_report_id IS NOT NULL) THEN true
                    ELSE false
                END AS has_real_provider_fees,
            s.customer_id,
            s.customer_name
           FROM ((public.sales s
             LEFT JOIN public.documents d ON (((d.reference_id = s.id) AND (d.type = 'receipt'::text))))
             LEFT JOIN public.provider_reports pr ON ((s.provider_report_id = pr.id)))
        UNION ALL
         SELECT e.id,
            'expense'::text AS transaction_type,
            'AG'::text AS type_code,
            e.receipt_number,
            e.created_at AS transaction_date,
            (- e.amount) AS amount,
            e.payment_method,
            'completed'::text AS status,
            e.user_id,
            e.organization_id,
            e.description,
            d.id AS document_id,
                CASE
                    WHEN (d.id IS NOT NULL) THEN true
                    ELSE false
                END AS has_pdf,
            e.banking_status,
            NULL::numeric AS provider_fee,
            NULL::numeric AS net_amount,
            NULL::uuid AS provider_report_id,
            false AS has_real_provider_fees,
            NULL::uuid AS customer_id,
            NULL::character varying(255) AS customer_name
           FROM (public.expenses e
             LEFT JOIN public.documents d ON (((d.reference_id = e.id) AND (d.type = 'expense_receipt'::text))))
        UNION ALL
         SELECT cm.id,
            'cash_movement'::text AS transaction_type,
            'CM'::text AS type_code,
            cm.movement_number AS receipt_number,
            cm.created_at AS transaction_date,
                CASE
                    WHEN (cm.type = 'cash_in'::text) THEN cm.amount
                    ELSE (- cm.amount)
                END AS amount,
            'cash'::text AS payment_method,
            'completed'::text AS status,
            cm.user_id,
            cm.organization_id,
            cm.description,
            NULL::uuid AS document_id,
            false AS has_pdf,
            cm.banking_status,
            NULL::numeric AS provider_fee,
            NULL::numeric AS net_amount,
            NULL::uuid AS provider_report_id,
            false AS has_real_provider_fees,
            NULL::uuid AS customer_id,
            NULL::character varying(255) AS customer_name
           FROM public.cash_movements cm
        UNION ALL
         SELECT bt.id,
            'bank_transaction'::text AS transaction_type,
            'BT'::text AS type_code,
            bt.transaction_number AS receipt_number,
            bt.created_at AS transaction_date,
            bt.amount,
            'bank'::text AS payment_method,
            bt.status,
            bt.user_id,
            bt.organization_id,
            bt.description,
            NULL::uuid AS document_id,
            false AS has_pdf,
            bt.status AS banking_status,
            NULL::numeric AS provider_fee,
            NULL::numeric AS net_amount,
            NULL::uuid AS provider_report_id,
            false AS has_real_provider_fees,
            NULL::uuid AS customer_id,
            NULL::character varying(255) AS customer_name
           FROM public.bank_transactions bt
        )
 SELECT tb.id,
    tb.transaction_type,
    tb.type_code,
    tb.receipt_number,
    tb.transaction_date,
    tb.amount,
    tb.payment_method,
    tb.status,
    tb.user_id,
    tb.organization_id,
    tb.description,
    tb.document_id,
    tb.has_pdf,
    tb.banking_status,
    date(tb.transaction_date) AS date_only,
    to_char(tb.transaction_date, 'HH24:MI'::text) AS time_only,
    lower(tb.description) AS description_lower,
    lower((tb.receipt_number)::text) AS receipt_number_lower,
    tb.provider_fee,
    tb.net_amount,
    tb.provider_report_id,
    tb.has_real_provider_fees,
    tb.customer_id,
    tb.customer_name
   FROM transaction_base tb
  ORDER BY tb.transaction_date DESC;


--
-- Name: unmatched_bank_transactions; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.unmatched_bank_transactions AS
 SELECT bt.id,
    bt.bank_account_id,
    bt.transaction_date,
    bt.booking_date,
    bt.amount,
    bt.description,
    bt.reference,
    bt.transaction_code,
    bt.import_batch_id,
    bt.import_filename,
    bt.import_date,
    bt.raw_data,
    bt.status,
    bt.user_id,
    bt.organization_id,
    bt.created_at,
    bt.updated_at,
    bt.notes,
    ba.name AS bank_account_name,
        CASE
            WHEN (bt.amount > (0)::numeric) THEN '⬆️ Eingang'::text
            ELSE '⬇️ Ausgang'::text
        END AS direction_display,
    abs(bt.amount) AS amount_abs
   FROM (public.bank_transactions bt
     JOIN public.bank_accounts ba ON ((bt.bank_account_id = ba.id)))
  WHERE ((bt.status)::text = 'unmatched'::text)
  ORDER BY bt.transaction_date DESC;


--
-- Name: unmatched_provider_reports; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.unmatched_provider_reports AS
 SELECT pr.id,
    pr.provider,
    pr.transaction_date,
    pr.settlement_date,
    pr.gross_amount,
    pr.fees,
    pr.net_amount,
    pr.provider_transaction_id,
    pr.provider_reference,
    pr.payment_method,
    pr.currency,
    pr.import_filename,
    pr.import_date,
    pr.raw_data,
    pr.sale_id,
    pr.status,
    pr.user_id,
    pr.organization_id,
    pr.created_at,
    pr.updated_at,
    pr.notes,
        CASE
            WHEN ((pr.provider)::text = 'twint'::text) THEN '🟦 TWINT'::character varying
            WHEN ((pr.provider)::text = 'sumup'::text) THEN '🟧 SumUp'::character varying
            ELSE pr.provider
        END AS provider_display
   FROM public.provider_reports pr
  WHERE ((pr.status)::text = 'unmatched'::text)
  ORDER BY pr.transaction_date DESC;


--
-- Name: unmatched_sales_for_provider; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.unmatched_sales_for_provider AS
 SELECT s.id,
    s.total_amount,
    s.payment_method,
    s.status,
    s.notes,
    s.user_id,
    s.organization_id,
    s.created_at,
    s.gross_amount,
    s.provider_fee,
    s.net_amount,
    s.settlement_status,
    s.settlement_date,
    s.provider_reference_id,
    s.provider_report_id,
    s.bank_transaction_id,
    s.banking_status,
        CASE s.payment_method
            WHEN 'twint'::text THEN '🟦 TWINT'::text
            WHEN 'sumup'::text THEN '🟧 SumUp'::text
            ELSE s.payment_method
        END AS payment_display
   FROM public.sales s
  WHERE ((s.payment_method = ANY (ARRAY['twint'::text, 'sumup'::text])) AND (s.provider_report_id IS NULL) AND ((s.banking_status)::text = 'unmatched'::text))
  ORDER BY s.created_at DESC;


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
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: -
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: -
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: -
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: decrypted_secrets; Type: VIEW; Schema: vault; Owner: -
--

CREATE VIEW vault.decrypted_secrets AS
 SELECT secrets.id,
    secrets.name,
    secrets.description,
    secrets.secret,
        CASE
            WHEN (secrets.secret IS NULL) THEN NULL::text
            ELSE
            CASE
                WHEN (secrets.key_id IS NULL) THEN NULL::text
                ELSE convert_from(pgsodium.crypto_aead_det_decrypt(decode(secrets.secret, 'base64'::text), convert_to(((((secrets.id)::text || secrets.description) || (secrets.created_at)::text) || (secrets.updated_at)::text), 'utf8'::name), secrets.key_id, secrets.nonce), 'utf8'::name)
            END
        END AS decrypted_secret,
    secrets.key_id,
    secrets.nonce,
    secrets.created_at,
    secrets.updated_at
   FROM vault.secrets;


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: appointment_services appointment_services_appointment_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_appointment_id_item_id_key UNIQUE (appointment_id, item_id);


--
-- Name: appointment_services appointment_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: bank_import_sessions bank_import_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_pkey PRIMARY KEY (id);


--
-- Name: bank_transactions bank_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_pkey PRIMARY KEY (id);


--
-- Name: bank_transactions bank_transactions_transaction_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_transaction_number_key UNIQUE (transaction_number);


--
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- Name: cash_movements cash_movements_movement_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_movement_number_key UNIQUE (movement_number);


--
-- Name: cash_movements cash_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_pkey PRIMARY KEY (id);


--
-- Name: customer_notes customer_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: daily_summaries daily_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_pkey PRIMARY KEY (id);


--
-- Name: daily_summaries daily_summaries_report_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_report_date_key UNIQUE (report_date);


--
-- Name: document_sequences document_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_pkey PRIMARY KEY (type);


--
-- Name: documents documents_document_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_document_number_key UNIQUE (document_number);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_receipt_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_receipt_number_key UNIQUE (receipt_number);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: monthly_summaries monthly_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_pkey PRIMARY KEY (id);


--
-- Name: monthly_summaries monthly_summaries_year_month_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_year_month_key UNIQUE (year, month);


--
-- Name: organization_users organization_users_organization_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_organization_id_user_id_key UNIQUE (organization_id, user_id);


--
-- Name: organization_users organization_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_pkey PRIMARY KEY (id);


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
-- Name: owner_transactions owner_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_pkey PRIMARY KEY (id);


--
-- Name: provider_import_sessions provider_import_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_pkey PRIMARY KEY (id);


--
-- Name: provider_reports provider_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: sales sales_receipt_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_receipt_number_key UNIQUE (receipt_number);


--
-- Name: suppliers suppliers_normalized_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_normalized_name_key UNIQUE (normalized_name);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: transaction_matches transaction_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_pkey PRIMARY KEY (id);


--
-- Name: bank_transactions unique_bank_reference_per_account; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT unique_bank_reference_per_account UNIQUE (bank_account_id, reference);


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
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: business_settings_org_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX business_settings_org_unique ON public.business_settings USING btree (organization_id);


--
-- Name: idx_appointment_services_appointment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_services_appointment ON public.appointment_services USING btree (appointment_id);


--
-- Name: idx_appointment_services_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_services_item ON public.appointment_services USING btree (item_id);


--
-- Name: idx_appointment_services_sort; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_services_sort ON public.appointment_services USING btree (appointment_id, sort_order);


--
-- Name: idx_appointments_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_customer ON public.appointments USING btree (customer_id) WHERE (customer_id IS NOT NULL);


--
-- Name: idx_appointments_date_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_date_range ON public.appointments USING btree (appointment_date, start_time, end_time);


--
-- Name: idx_appointments_organization_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_organization_date ON public.appointments USING btree (organization_id, appointment_date);


--
-- Name: idx_audit_log_table_record; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_table_record ON public.audit_log USING btree (table_name, record_id);


--
-- Name: idx_audit_log_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_timestamp ON public.audit_log USING btree ("timestamp");


--
-- Name: idx_bank_accounts_iban; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_accounts_iban ON public.bank_accounts USING btree (iban);


--
-- Name: idx_bank_accounts_org_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_accounts_org_active ON public.bank_accounts USING btree (organization_id, is_active);


--
-- Name: idx_bank_accounts_user_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_accounts_user_active ON public.bank_accounts USING btree (user_id, is_active);


--
-- Name: idx_bank_import_sessions_account; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_import_sessions_account ON public.bank_import_sessions USING btree (bank_account_id);


--
-- Name: idx_bank_import_sessions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_import_sessions_date ON public.bank_import_sessions USING btree (imported_at);


--
-- Name: idx_bank_import_sessions_filename; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_import_sessions_filename ON public.bank_import_sessions USING btree (import_filename);


--
-- Name: idx_bank_transactions_account_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transactions_account_date ON public.bank_transactions USING btree (bank_account_id, transaction_date);


--
-- Name: idx_bank_transactions_amount; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transactions_amount ON public.bank_transactions USING btree (amount);


--
-- Name: idx_bank_transactions_booking_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transactions_booking_date ON public.bank_transactions USING btree (booking_date);


--
-- Name: idx_bank_transactions_import_batch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transactions_import_batch ON public.bank_transactions USING btree (import_batch_id);


--
-- Name: idx_bank_transactions_import_filename; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transactions_import_filename ON public.bank_transactions USING btree (import_filename);


--
-- Name: idx_bank_transactions_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transactions_number ON public.bank_transactions USING btree (transaction_number);


--
-- Name: idx_bank_transactions_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transactions_reference ON public.bank_transactions USING btree (reference);


--
-- Name: idx_bank_transactions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transactions_status ON public.bank_transactions USING btree (status);


--
-- Name: idx_bank_transactions_status_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transactions_status_date ON public.bank_transactions USING btree (status, transaction_date);


--
-- Name: idx_cash_movements_bank_transaction; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_bank_transaction ON public.cash_movements USING btree (bank_transaction_id);


--
-- Name: idx_cash_movements_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_created_at ON public.cash_movements USING btree (created_at);


--
-- Name: idx_cash_movements_movement_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_movement_type ON public.cash_movements USING btree (movement_type);


--
-- Name: idx_cash_movements_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_number ON public.cash_movements USING btree (movement_number);


--
-- Name: idx_cash_movements_org_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_org_date ON public.cash_movements USING btree (organization_id, created_at DESC);


--
-- Name: idx_cash_movements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_movements_user_id ON public.cash_movements USING btree (user_id);


--
-- Name: idx_customer_notes_block_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_notes_block_name ON public.customer_notes USING btree (block_name);


--
-- Name: idx_customer_notes_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_notes_customer_id ON public.customer_notes USING btree (customer_id);


--
-- Name: idx_customer_notes_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_notes_organization_id ON public.customer_notes USING btree (organization_id);


--
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email) WHERE (email IS NOT NULL);


--
-- Name: idx_customers_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_name ON public.customers USING btree (name);


--
-- Name: idx_customers_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_organization_id ON public.customers USING btree (organization_id);


--
-- Name: idx_customers_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_phone ON public.customers USING btree (phone) WHERE (phone IS NOT NULL);


--
-- Name: idx_daily_summaries_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_summaries_created_by ON public.daily_summaries USING btree (created_by);


--
-- Name: idx_daily_summaries_report_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_summaries_report_date ON public.daily_summaries USING btree (report_date);


--
-- Name: idx_document_sequences_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_sequences_type ON public.document_sequences USING btree (type);


--
-- Name: idx_documents_document_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_document_date ON public.documents USING btree (document_date);


--
-- Name: idx_documents_document_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_document_number ON public.documents USING btree (document_number);


--
-- Name: idx_documents_org_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_org_type ON public.documents USING btree (organization_id, type);


--
-- Name: idx_documents_reference_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_reference_type_id ON public.documents USING btree (reference_type, reference_id);


--
-- Name: idx_documents_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_type ON public.documents USING btree (type);


--
-- Name: idx_documents_type_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_type_date ON public.documents USING btree (type, document_date);


--
-- Name: idx_documents_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_user_id ON public.documents USING btree (user_id);


--
-- Name: idx_documents_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_user_type ON public.documents USING btree (user_id, type);


--
-- Name: idx_expenses_bank_transaction; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_bank_transaction ON public.expenses USING btree (bank_transaction_id);


--
-- Name: idx_expenses_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);


--
-- Name: idx_expenses_org_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_org_date ON public.expenses USING btree (organization_id, payment_date DESC);


--
-- Name: idx_expenses_payment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_payment_date ON public.expenses USING btree (payment_date);


--
-- Name: idx_expenses_receipt_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_receipt_number ON public.expenses USING btree (receipt_number);


--
-- Name: idx_expenses_supplier_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_supplier_id ON public.expenses USING btree (supplier_id);


--
-- Name: idx_expenses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_user_id ON public.expenses USING btree (user_id);


--
-- Name: idx_items_org_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_org_active ON public.items USING btree (organization_id, active);


--
-- Name: idx_monthly_summaries_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_monthly_summaries_created_by ON public.monthly_summaries USING btree (created_by);


--
-- Name: idx_monthly_summaries_year_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_monthly_summaries_year_month ON public.monthly_summaries USING btree (year, month);


--
-- Name: idx_owner_transactions_banking_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_banking_status ON public.owner_transactions USING btree (banking_status);


--
-- Name: idx_owner_transactions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_date ON public.owner_transactions USING btree (transaction_date);


--
-- Name: idx_owner_transactions_payment_method; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_payment_method ON public.owner_transactions USING btree (payment_method);


--
-- Name: idx_owner_transactions_related_expense; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_related_expense ON public.owner_transactions USING btree (related_expense_id);


--
-- Name: idx_owner_transactions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_type ON public.owner_transactions USING btree (transaction_type);


--
-- Name: idx_owner_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_owner_transactions_user_id ON public.owner_transactions USING btree (user_id);


--
-- Name: idx_provider_reports_import_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_reports_import_date ON public.provider_reports USING btree (import_date);


--
-- Name: idx_provider_reports_provider_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_reports_provider_status ON public.provider_reports USING btree (provider, status);


--
-- Name: idx_provider_reports_sale_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_reports_sale_id ON public.provider_reports USING btree (sale_id);


--
-- Name: idx_provider_reports_transaction_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_reports_transaction_date ON public.provider_reports USING btree (transaction_date);


--
-- Name: idx_sale_items_org_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sale_items_org_user ON public.sale_items USING btree (organization_id, user_id);


--
-- Name: idx_sale_items_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sale_items_user_id ON public.sale_items USING btree (user_id);


--
-- Name: idx_sales_bank_transaction; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_bank_transaction ON public.sales USING btree (bank_transaction_id);


--
-- Name: idx_sales_banking_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_banking_status ON public.sales USING btree (banking_status);


--
-- Name: idx_sales_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_created_at ON public.sales USING btree (created_at);


--
-- Name: idx_sales_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_customer_id ON public.sales USING btree (customer_id) WHERE (customer_id IS NOT NULL);


--
-- Name: idx_sales_customer_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_customer_name ON public.sales USING btree (customer_name) WHERE (customer_name IS NOT NULL);


--
-- Name: idx_sales_org_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_org_created ON public.sales USING btree (organization_id, created_at DESC);


--
-- Name: idx_sales_payment_method; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_payment_method ON public.sales USING btree (payment_method);


--
-- Name: idx_sales_provider_report; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_provider_report ON public.sales USING btree (provider_report_id);


--
-- Name: idx_sales_receipt_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_receipt_number ON public.sales USING btree (receipt_number);


--
-- Name: idx_sales_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_user_id ON public.sales USING btree (user_id);


--
-- Name: idx_suppliers_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_active ON public.suppliers USING btree (is_active);


--
-- Name: idx_suppliers_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_category ON public.suppliers USING btree (category);


--
-- Name: idx_suppliers_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_created_at ON public.suppliers USING btree (created_at);


--
-- Name: idx_suppliers_name_fts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_name_fts ON public.suppliers USING gin (to_tsvector('german'::regconfig, (name)::text));


--
-- Name: idx_suppliers_normalized_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_normalized_name ON public.suppliers USING btree (normalized_name);


--
-- Name: idx_transaction_matches_bank_transaction; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_matches_bank_transaction ON public.transaction_matches USING btree (bank_transaction_id);


--
-- Name: idx_transaction_matches_confidence; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_matches_confidence ON public.transaction_matches USING btree (match_confidence);


--
-- Name: idx_transaction_matches_matched_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_matches_matched_type_id ON public.transaction_matches USING btree (matched_type, matched_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: appointments_with_services _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.appointments_with_services AS
 SELECT a.id,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.customer_id,
    a.customer_name,
    a.customer_phone,
    a.notes,
    a.estimated_price,
    a.organization_id,
    a.created_at,
    a.created_by,
    a.updated_at,
    a.updated_by,
    COALESCE(json_agg(json_build_object('id', i.id, 'name', i.name, 'price', COALESCE(aps.service_price, i.default_price), 'duration_minutes', COALESCE(aps.service_duration_minutes, i.duration_minutes), 'notes', aps.service_notes, 'sort_order', aps.sort_order) ORDER BY aps.sort_order) FILTER (WHERE (i.id IS NOT NULL)), '[]'::json) AS services,
    COALESCE(sum(COALESCE(aps.service_price, i.default_price)), (0)::numeric) AS total_price,
    COALESCE(sum(COALESCE(aps.service_duration_minutes, i.duration_minutes)), (0)::bigint) AS total_duration_minutes
   FROM ((public.appointments a
     LEFT JOIN public.appointment_services aps ON ((a.id = aps.appointment_id)))
     LEFT JOIN public.items i ON ((aps.item_id = i.id)))
  GROUP BY a.id;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT OR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: users on_auth_user_deleted; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_deleted BEFORE DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();


--
-- Name: appointment_services appointment_services_update_parent; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER appointment_services_update_parent AFTER INSERT OR DELETE OR UPDATE ON public.appointment_services FOR EACH ROW EXECUTE FUNCTION public.update_appointment_on_service_change();


--
-- Name: cash_movements audit_cash_movements_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_cash_movements_changes AFTER INSERT OR DELETE OR UPDATE ON public.cash_movements FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();


--
-- Name: expenses audit_expenses_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_expenses_changes AFTER INSERT OR DELETE OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();


--
-- Name: sale_items audit_sale_items_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_sale_items_changes AFTER INSERT OR DELETE OR UPDATE ON public.sale_items FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();


--
-- Name: sales audit_sales_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_sales_changes AFTER INSERT OR DELETE OR UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();


--
-- Name: bank_transactions trigger_auto_bank_transaction_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_bank_transaction_number BEFORE INSERT ON public.bank_transactions FOR EACH ROW EXECUTE FUNCTION public.auto_generate_bank_transaction_number();


--
-- Name: cash_movements trigger_auto_cash_movement_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_cash_movement_number BEFORE INSERT ON public.cash_movements FOR EACH ROW EXECUTE FUNCTION public.auto_generate_cash_movement_number();


--
-- Name: documents trigger_auto_document_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_document_number BEFORE INSERT ON public.documents FOR EACH ROW EXECUTE FUNCTION public.auto_generate_document_number();


--
-- Name: expenses trigger_auto_expenses_receipt_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_expenses_receipt_number BEFORE INSERT ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.auto_generate_expenses_receipt_number();


--
-- Name: expenses trigger_auto_populate_supplier_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_populate_supplier_id BEFORE INSERT OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.auto_populate_supplier_id();


--
-- Name: sales trigger_auto_sales_receipt_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_sales_receipt_number BEFORE INSERT ON public.sales FOR EACH ROW EXECUTE FUNCTION public.auto_generate_sales_receipt_number();


--
-- Name: suppliers trigger_suppliers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_suppliers_updated_at();


--
-- Name: bank_transactions trigger_update_bank_balance; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_bank_balance AFTER INSERT OR DELETE OR UPDATE ON public.bank_transactions FOR EACH ROW EXECUTE FUNCTION public.update_bank_account_balance();


--
-- Name: owner_transactions trigger_update_owner_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_owner_transactions_updated_at BEFORE UPDATE ON public.owner_transactions FOR EACH ROW EXECUTE FUNCTION public.update_owner_transactions_updated_at();


--
-- Name: provider_reports trigger_update_sales_banking_status; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_sales_banking_status AFTER UPDATE ON public.provider_reports FOR EACH ROW EXECUTE FUNCTION public.update_sales_banking_status();


--
-- Name: business_settings update_business_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON public.business_settings FOR EACH ROW EXECUTE FUNCTION public.update_business_settings_updated_at();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: appointment_services appointment_services_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointment_services appointment_services_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE RESTRICT;


--
-- Name: appointments appointments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: appointments appointments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bank_accounts bank_accounts_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: bank_accounts bank_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: bank_import_sessions bank_import_sessions_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: bank_import_sessions bank_import_sessions_imported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_imported_by_fkey FOREIGN KEY (imported_by) REFERENCES auth.users(id);


--
-- Name: bank_import_sessions bank_import_sessions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_import_sessions
    ADD CONSTRAINT bank_import_sessions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: bank_transactions bank_transactions_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: bank_transactions bank_transactions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: bank_transactions bank_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: business_settings business_settings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: cash_movements cash_movements_bank_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);


--
-- Name: cash_movements cash_movements_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: cash_movements cash_movements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: customer_notes customer_notes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: customer_notes customer_notes_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_notes customer_notes_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: customers customers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: customers customers_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: daily_summaries daily_summaries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: daily_summaries daily_summaries_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: daily_summaries daily_summaries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: documents documents_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: documents documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: expenses expenses_bank_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);


--
-- Name: expenses expenses_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: expenses expenses_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: expenses expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: items items_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: monthly_summaries monthly_summaries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: monthly_summaries monthly_summaries_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: monthly_summaries monthly_summaries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_summaries
    ADD CONSTRAINT monthly_summaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: organization_users organization_users_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id);


--
-- Name: organization_users organization_users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_users organization_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: owner_transactions owner_transactions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: owner_transactions owner_transactions_related_bank_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_related_bank_transaction_id_fkey FOREIGN KEY (related_bank_transaction_id) REFERENCES public.bank_transactions(id);


--
-- Name: owner_transactions owner_transactions_related_expense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_related_expense_id_fkey FOREIGN KEY (related_expense_id) REFERENCES public.expenses(id);


--
-- Name: owner_transactions owner_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_transactions
    ADD CONSTRAINT owner_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: provider_import_sessions provider_import_sessions_imported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_imported_by_fkey FOREIGN KEY (imported_by) REFERENCES auth.users(id);


--
-- Name: provider_import_sessions provider_import_sessions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_import_sessions
    ADD CONSTRAINT provider_import_sessions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: provider_reports provider_reports_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: provider_reports provider_reports_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: provider_reports provider_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_reports
    ADD CONSTRAINT provider_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: sale_items sale_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: sale_items sale_items_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: sale_items sale_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sales sales_bank_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);


--
-- Name: sales sales_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: sales sales_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: sales sales_provider_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_provider_report_id_fkey FOREIGN KEY (provider_report_id) REFERENCES public.provider_reports(id);


--
-- Name: sales sales_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: suppliers suppliers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: suppliers suppliers_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: transaction_matches transaction_matches_bank_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);


--
-- Name: transaction_matches transaction_matches_matched_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_matched_by_fkey FOREIGN KEY (matched_by) REFERENCES auth.users(id);


--
-- Name: transaction_matches transaction_matches_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_matches
    ADD CONSTRAINT transaction_matches_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: business_settings Enable all access for service role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for service role" ON public.business_settings TO service_role USING (true);


--
-- Name: appointment_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;

--
-- Name: appointment_services appointment_services_organization_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY appointment_services_organization_access ON public.appointment_services USING ((appointment_id IN ( SELECT appointments.id
   FROM public.appointments
  WHERE (appointments.organization_id IN ( SELECT organization_users.organization_id
           FROM public.organization_users
          WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))))));


--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments appointments_organization_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY appointments_organization_policy ON public.appointments USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_log audit_log_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY audit_log_insert_policy ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: audit_log audit_log_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY audit_log_select_policy ON public.audit_log FOR SELECT TO authenticated USING (true);


--
-- Name: business_settings authenticated_full_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_full_access ON public.business_settings TO authenticated USING (true);


--
-- Name: bank_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: bank_accounts bank_accounts_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bank_accounts_access ON public.bank_accounts USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));


--
-- Name: bank_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: bank_transactions bank_transactions_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bank_transactions_access ON public.bank_transactions USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));


--
-- Name: business_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: cash_movements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

--
-- Name: cash_movements cash_movements_organization_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cash_movements_organization_access ON public.cash_movements USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: customer_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_notes customer_notes_organization_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customer_notes_organization_policy ON public.customer_notes USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

--
-- Name: customers customers_organization_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customers_organization_policy ON public.customers USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: daily_summaries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_summaries daily_summaries_organization_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY daily_summaries_organization_access ON public.daily_summaries USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: document_sequences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

--
-- Name: document_sequences document_sequences_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY document_sequences_access ON public.document_sequences TO authenticated USING (true) WITH CHECK (true);


--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: documents documents_organization_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY documents_organization_access ON public.documents USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: business_settings enable_all_access_for_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY enable_all_access_for_service_role ON public.business_settings TO service_role USING (true);


--
-- Name: expenses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: expenses expenses_org_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY expenses_org_access ON public.expenses TO authenticated USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

--
-- Name: items items_organization_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY items_organization_access ON public.items USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: monthly_summaries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

--
-- Name: monthly_summaries monthly_summaries_organization_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY monthly_summaries_organization_access ON public.monthly_summaries USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: owner_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.owner_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: owner_transactions owner_transactions_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY owner_transactions_access ON public.owner_transactions USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));


--
-- Name: provider_import_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.provider_import_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: provider_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.provider_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: provider_reports provider_reports_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY provider_reports_access ON public.provider_reports USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));


--
-- Name: provider_import_sessions provider_sessions_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY provider_sessions_insert ON public.provider_import_sessions FOR INSERT WITH CHECK ((auth.uid() = imported_by));


--
-- Name: provider_import_sessions provider_sessions_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY provider_sessions_select ON public.provider_import_sessions FOR SELECT USING ((auth.uid() = imported_by));


--
-- Name: provider_import_sessions provider_sessions_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY provider_sessions_update ON public.provider_import_sessions FOR UPDATE USING ((auth.uid() = imported_by));


--
-- Name: sale_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

--
-- Name: sale_items sale_items_organization_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sale_items_organization_access ON public.sale_items USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: sales; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

--
-- Name: sales sales_organization_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sales_organization_access ON public.sales USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: suppliers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

--
-- Name: suppliers suppliers_organization_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY suppliers_organization_access ON public.suppliers USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: transaction_matches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transaction_matches ENABLE ROW LEVEL SECURITY;

--
-- Name: transaction_matches transaction_matches_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY transaction_matches_access ON public.transaction_matches USING (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.bank_transactions bt
  WHERE ((bt.id = transaction_matches.bank_transaction_id) AND (bt.user_id = auth.uid()))))));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: users users_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_insert_own ON public.users FOR INSERT WITH CHECK (((auth.uid() = id) OR (current_setting('role'::text) = 'postgres'::text)));


--
-- Name: users users_select_organization_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_select_organization_members ON public.users FOR SELECT USING ((id IN ( SELECT ou.user_id
   FROM public.organization_users ou
  WHERE (ou.organization_id IN ( SELECT ou2.organization_id
           FROM public.organization_users ou2
          WHERE (ou2.user_id = auth.uid()))))));


--
-- Name: users users_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_select_own ON public.users FOR SELECT USING ((auth.uid() = id));


--
-- Name: users users_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_update_own ON public.users FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Users manage organization documents; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users manage organization documents" ON storage.objects USING (((bucket_id = 'documents'::text) AND ((storage.foldername(name))[1] IN ( SELECT (organization_users.organization_id)::text AS organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true))))));


--
-- Name: objects Users manage organization logos; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users manage organization logos" ON storage.objects USING (((bucket_id = 'business-logos'::text) AND ((storage.foldername(name))[1] IN ( SELECT (organization_users.organization_id)::text AS organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true))))));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

