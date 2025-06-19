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

DROP EVENT TRIGGER IF EXISTS pgrst_drop_watch;
DROP EVENT TRIGGER IF EXISTS pgrst_ddl_watch;
DROP EVENT TRIGGER IF EXISTS issue_pg_net_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_graphql_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_cron_access;
DROP EVENT TRIGGER IF EXISTS issue_graphql_placeholder;
DROP PUBLICATION IF EXISTS supabase_realtime;
DROP POLICY IF EXISTS documents_public_read ON storage.objects;
DROP POLICY IF EXISTS documents_owner_delete ON storage.objects;
DROP POLICY IF EXISTS documents_objects_access ON storage.objects;
DROP POLICY IF EXISTS documents_authenticated_upload ON storage.objects;
DROP POLICY IF EXISTS "documents bucket policy" ON storage.objects;
DROP POLICY IF EXISTS "Enable logo access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS users_update_own ON public.users;
DROP POLICY IF EXISTS users_select_own ON public.users;
DROP POLICY IF EXISTS transaction_matches_access ON public.transaction_matches;
DROP POLICY IF EXISTS suppliers_access ON public.suppliers;
DROP POLICY IF EXISTS sales_org_access ON public.sales;
DROP POLICY IF EXISTS sale_items_access ON public.sale_items;
DROP POLICY IF EXISTS provider_sessions_update ON public.provider_import_sessions;
DROP POLICY IF EXISTS provider_sessions_select ON public.provider_import_sessions;
DROP POLICY IF EXISTS provider_sessions_insert ON public.provider_import_sessions;
DROP POLICY IF EXISTS provider_reports_access ON public.provider_reports;
DROP POLICY IF EXISTS owner_transactions_access ON public.owner_transactions;
DROP POLICY IF EXISTS monthly_summaries_business_access ON public.monthly_summaries;
DROP POLICY IF EXISTS items_business_access ON public.items;
DROP POLICY IF EXISTS expenses_org_access ON public.expenses;
DROP POLICY IF EXISTS documents_access ON public.documents;
DROP POLICY IF EXISTS document_sequences_access ON public.document_sequences;
DROP POLICY IF EXISTS daily_summaries_business_access ON public.daily_summaries;
DROP POLICY IF EXISTS cash_movements_access ON public.cash_movements;
DROP POLICY IF EXISTS business_settings_org_access ON public.business_settings;
DROP POLICY IF EXISTS bank_transactions_access ON public.bank_transactions;
DROP POLICY IF EXISTS bank_accounts_access ON public.bank_accounts;
DROP POLICY IF EXISTS audit_log_select_policy ON public.audit_log;
DROP POLICY IF EXISTS audit_log_insert_policy ON public.audit_log;
DROP POLICY IF EXISTS "Enable all access for service role" ON public.business_settings;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS "prefixes_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS "objects_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY public.transaction_matches DROP CONSTRAINT IF EXISTS transaction_matches_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transaction_matches DROP CONSTRAINT IF EXISTS transaction_matches_matched_by_fkey;
ALTER TABLE IF EXISTS ONLY public.transaction_matches DROP CONSTRAINT IF EXISTS transaction_matches_bank_transaction_id_fkey;
ALTER TABLE IF EXISTS ONLY public.suppliers DROP CONSTRAINT IF EXISTS suppliers_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.suppliers DROP CONSTRAINT IF EXISTS suppliers_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.sales DROP CONSTRAINT IF EXISTS sales_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales DROP CONSTRAINT IF EXISTS sales_provider_report_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales DROP CONSTRAINT IF EXISTS sales_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales DROP CONSTRAINT IF EXISTS sales_bank_transaction_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sale_items DROP CONSTRAINT IF EXISTS sale_items_sale_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sale_items DROP CONSTRAINT IF EXISTS sale_items_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sale_items DROP CONSTRAINT IF EXISTS sale_items_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.provider_reports DROP CONSTRAINT IF EXISTS provider_reports_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.provider_reports DROP CONSTRAINT IF EXISTS provider_reports_sale_id_fkey;
ALTER TABLE IF EXISTS ONLY public.provider_reports DROP CONSTRAINT IF EXISTS provider_reports_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.provider_import_sessions DROP CONSTRAINT IF EXISTS provider_import_sessions_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.provider_import_sessions DROP CONSTRAINT IF EXISTS provider_import_sessions_imported_by_fkey;
ALTER TABLE IF EXISTS ONLY public.owner_transactions DROP CONSTRAINT IF EXISTS owner_transactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.owner_transactions DROP CONSTRAINT IF EXISTS owner_transactions_related_expense_id_fkey;
ALTER TABLE IF EXISTS ONLY public.owner_transactions DROP CONSTRAINT IF EXISTS owner_transactions_related_bank_transaction_id_fkey;
ALTER TABLE IF EXISTS ONLY public.owner_transactions DROP CONSTRAINT IF EXISTS owner_transactions_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_users DROP CONSTRAINT IF EXISTS organization_users_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_users DROP CONSTRAINT IF EXISTS organization_users_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_users DROP CONSTRAINT IF EXISTS organization_users_invited_by_fkey;
ALTER TABLE IF EXISTS ONLY public.monthly_summaries DROP CONSTRAINT IF EXISTS monthly_summaries_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.monthly_summaries DROP CONSTRAINT IF EXISTS monthly_summaries_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.monthly_summaries DROP CONSTRAINT IF EXISTS monthly_summaries_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.items DROP CONSTRAINT IF EXISTS items_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_supplier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_bank_transaction_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_summaries DROP CONSTRAINT IF EXISTS daily_summaries_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_summaries DROP CONSTRAINT IF EXISTS daily_summaries_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_summaries DROP CONSTRAINT IF EXISTS daily_summaries_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_movements DROP CONSTRAINT IF EXISTS cash_movements_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_movements DROP CONSTRAINT IF EXISTS cash_movements_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_movements DROP CONSTRAINT IF EXISTS cash_movements_bank_transaction_id_fkey;
ALTER TABLE IF EXISTS ONLY public.business_settings DROP CONSTRAINT IF EXISTS business_settings_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.business_settings DROP CONSTRAINT IF EXISTS business_settings_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transactions DROP CONSTRAINT IF EXISTS bank_transactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transactions DROP CONSTRAINT IF EXISTS bank_transactions_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transactions DROP CONSTRAINT IF EXISTS bank_transactions_bank_account_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_import_sessions DROP CONSTRAINT IF EXISTS bank_import_sessions_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_import_sessions DROP CONSTRAINT IF EXISTS bank_import_sessions_imported_by_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_import_sessions DROP CONSTRAINT IF EXISTS bank_import_sessions_bank_account_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_accounts DROP CONSTRAINT IF EXISTS bank_accounts_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_accounts DROP CONSTRAINT IF EXISTS bank_accounts_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_log DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
ALTER TABLE IF EXISTS ONLY _realtime.extensions DROP CONSTRAINT IF EXISTS extensions_tenant_external_id_fkey;
DROP TRIGGER IF EXISTS update_objects_updated_at ON storage.objects;
DROP TRIGGER IF EXISTS prefixes_delete_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS prefixes_create_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS objects_update_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_insert_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_delete_delete_prefix ON storage.objects;
DROP TRIGGER IF EXISTS tr_check_filters ON realtime.subscription;
DROP TRIGGER IF EXISTS update_business_settings_updated_at ON public.business_settings;
DROP TRIGGER IF EXISTS trigger_update_sales_banking_status ON public.provider_reports;
DROP TRIGGER IF EXISTS trigger_update_owner_transactions_updated_at ON public.owner_transactions;
DROP TRIGGER IF EXISTS trigger_update_bank_balance ON public.bank_transactions;
DROP TRIGGER IF EXISTS trigger_suppliers_updated_at ON public.suppliers;
DROP TRIGGER IF EXISTS trigger_auto_sales_receipt_number ON public.sales;
DROP TRIGGER IF EXISTS trigger_auto_populate_supplier_id ON public.expenses;
DROP TRIGGER IF EXISTS trigger_auto_expenses_receipt_number ON public.expenses;
DROP TRIGGER IF EXISTS trigger_auto_document_number ON public.documents;
DROP TRIGGER IF EXISTS trigger_auto_cash_movement_number ON public.cash_movements;
DROP TRIGGER IF EXISTS trigger_auto_bank_transaction_number ON public.bank_transactions;
DROP TRIGGER IF EXISTS audit_sales_changes ON public.sales;
DROP TRIGGER IF EXISTS audit_sale_items_changes ON public.sale_items;
DROP TRIGGER IF EXISTS audit_expenses_changes ON public.expenses;
DROP TRIGGER IF EXISTS audit_cash_movements_changes ON public.cash_movements;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP INDEX IF EXISTS supabase_functions.supabase_functions_hooks_request_id_idx;
DROP INDEX IF EXISTS supabase_functions.supabase_functions_hooks_h_table_id_h_name_idx;
DROP INDEX IF EXISTS storage.objects_bucket_id_level_idx;
DROP INDEX IF EXISTS storage.name_prefix_search;
DROP INDEX IF EXISTS storage.idx_prefixes_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name;
DROP INDEX IF EXISTS storage.idx_name_bucket_unique;
DROP INDEX IF EXISTS storage.idx_multipart_uploads_list;
DROP INDEX IF EXISTS storage.bucketid_objname;
DROP INDEX IF EXISTS storage.bname;
DROP INDEX IF EXISTS realtime.subscription_subscription_id_entity_filters_key;
DROP INDEX IF EXISTS realtime.ix_realtime_subscription_entity;
DROP INDEX IF EXISTS public.idx_transaction_matches_matched_type_id;
DROP INDEX IF EXISTS public.idx_transaction_matches_confidence;
DROP INDEX IF EXISTS public.idx_transaction_matches_bank_transaction;
DROP INDEX IF EXISTS public.idx_suppliers_normalized_name;
DROP INDEX IF EXISTS public.idx_suppliers_name_fts;
DROP INDEX IF EXISTS public.idx_suppliers_created_at;
DROP INDEX IF EXISTS public.idx_suppliers_category;
DROP INDEX IF EXISTS public.idx_suppliers_active;
DROP INDEX IF EXISTS public.idx_sales_user_id;
DROP INDEX IF EXISTS public.idx_sales_receipt_number;
DROP INDEX IF EXISTS public.idx_sales_provider_report;
DROP INDEX IF EXISTS public.idx_sales_payment_method;
DROP INDEX IF EXISTS public.idx_sales_org_created;
DROP INDEX IF EXISTS public.idx_sales_created_at;
DROP INDEX IF EXISTS public.idx_sales_banking_status;
DROP INDEX IF EXISTS public.idx_sales_bank_transaction;
DROP INDEX IF EXISTS public.idx_provider_reports_transaction_date;
DROP INDEX IF EXISTS public.idx_provider_reports_sale_id;
DROP INDEX IF EXISTS public.idx_provider_reports_provider_status;
DROP INDEX IF EXISTS public.idx_provider_reports_import_date;
DROP INDEX IF EXISTS public.idx_owner_transactions_user_id;
DROP INDEX IF EXISTS public.idx_owner_transactions_type;
DROP INDEX IF EXISTS public.idx_owner_transactions_related_expense;
DROP INDEX IF EXISTS public.idx_owner_transactions_payment_method;
DROP INDEX IF EXISTS public.idx_owner_transactions_date;
DROP INDEX IF EXISTS public.idx_owner_transactions_banking_status;
DROP INDEX IF EXISTS public.idx_monthly_summaries_year_month;
DROP INDEX IF EXISTS public.idx_monthly_summaries_created_by;
DROP INDEX IF EXISTS public.idx_items_org_active;
DROP INDEX IF EXISTS public.idx_expenses_user_id;
DROP INDEX IF EXISTS public.idx_expenses_supplier_id;
DROP INDEX IF EXISTS public.idx_expenses_receipt_number;
DROP INDEX IF EXISTS public.idx_expenses_payment_date;
DROP INDEX IF EXISTS public.idx_expenses_org_date;
DROP INDEX IF EXISTS public.idx_expenses_category;
DROP INDEX IF EXISTS public.idx_expenses_bank_transaction;
DROP INDEX IF EXISTS public.idx_documents_user_type;
DROP INDEX IF EXISTS public.idx_documents_user_id;
DROP INDEX IF EXISTS public.idx_documents_type_date;
DROP INDEX IF EXISTS public.idx_documents_type;
DROP INDEX IF EXISTS public.idx_documents_reference_type_id;
DROP INDEX IF EXISTS public.idx_documents_org_type;
DROP INDEX IF EXISTS public.idx_documents_document_number;
DROP INDEX IF EXISTS public.idx_documents_document_date;
DROP INDEX IF EXISTS public.idx_document_sequences_type;
DROP INDEX IF EXISTS public.idx_daily_summaries_report_date;
DROP INDEX IF EXISTS public.idx_daily_summaries_created_by;
DROP INDEX IF EXISTS public.idx_cash_movements_user_id;
DROP INDEX IF EXISTS public.idx_cash_movements_org_date;
DROP INDEX IF EXISTS public.idx_cash_movements_number;
DROP INDEX IF EXISTS public.idx_cash_movements_movement_type;
DROP INDEX IF EXISTS public.idx_cash_movements_created_at;
DROP INDEX IF EXISTS public.idx_cash_movements_bank_transaction;
DROP INDEX IF EXISTS public.idx_bank_transactions_status_date;
DROP INDEX IF EXISTS public.idx_bank_transactions_status;
DROP INDEX IF EXISTS public.idx_bank_transactions_reference;
DROP INDEX IF EXISTS public.idx_bank_transactions_number;
DROP INDEX IF EXISTS public.idx_bank_transactions_import_filename;
DROP INDEX IF EXISTS public.idx_bank_transactions_import_batch;
DROP INDEX IF EXISTS public.idx_bank_transactions_booking_date;
DROP INDEX IF EXISTS public.idx_bank_transactions_amount;
DROP INDEX IF EXISTS public.idx_bank_transactions_account_date;
DROP INDEX IF EXISTS public.idx_bank_import_sessions_filename;
DROP INDEX IF EXISTS public.idx_bank_import_sessions_date;
DROP INDEX IF EXISTS public.idx_bank_import_sessions_account;
DROP INDEX IF EXISTS public.idx_bank_accounts_user_active;
DROP INDEX IF EXISTS public.idx_bank_accounts_org_active;
DROP INDEX IF EXISTS public.idx_bank_accounts_iban;
DROP INDEX IF EXISTS public.idx_audit_log_timestamp;
DROP INDEX IF EXISTS public.idx_audit_log_table_record;
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
DROP INDEX IF EXISTS _realtime.tenants_external_id_index;
DROP INDEX IF EXISTS _realtime.extensions_tenant_external_id_type_index;
DROP INDEX IF EXISTS _realtime.extensions_tenant_external_id_index;
ALTER TABLE IF EXISTS ONLY supabase_functions.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY supabase_functions.hooks DROP CONSTRAINT IF EXISTS hooks_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_pkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS prefixes_pkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS objects_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_name_key;
ALTER TABLE IF EXISTS ONLY storage.buckets DROP CONSTRAINT IF EXISTS buckets_pkey;
ALTER TABLE IF EXISTS ONLY realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY realtime.subscription DROP CONSTRAINT IF EXISTS pk_subscription;
ALTER TABLE IF EXISTS ONLY realtime.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.bank_transactions DROP CONSTRAINT IF EXISTS unique_bank_reference_per_account;
ALTER TABLE IF EXISTS ONLY public.transaction_matches DROP CONSTRAINT IF EXISTS transaction_matches_pkey;
ALTER TABLE IF EXISTS ONLY public.suppliers DROP CONSTRAINT IF EXISTS suppliers_pkey;
ALTER TABLE IF EXISTS ONLY public.suppliers DROP CONSTRAINT IF EXISTS suppliers_normalized_name_key;
ALTER TABLE IF EXISTS ONLY public.sales DROP CONSTRAINT IF EXISTS sales_receipt_number_key;
ALTER TABLE IF EXISTS ONLY public.sales DROP CONSTRAINT IF EXISTS sales_pkey;
ALTER TABLE IF EXISTS ONLY public.sale_items DROP CONSTRAINT IF EXISTS sale_items_pkey;
ALTER TABLE IF EXISTS ONLY public.provider_reports DROP CONSTRAINT IF EXISTS provider_reports_pkey;
ALTER TABLE IF EXISTS ONLY public.provider_import_sessions DROP CONSTRAINT IF EXISTS provider_import_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.owner_transactions DROP CONSTRAINT IF EXISTS owner_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.organizations DROP CONSTRAINT IF EXISTS organizations_slug_key;
ALTER TABLE IF EXISTS ONLY public.organizations DROP CONSTRAINT IF EXISTS organizations_pkey;
ALTER TABLE IF EXISTS ONLY public.organization_users DROP CONSTRAINT IF EXISTS organization_users_pkey;
ALTER TABLE IF EXISTS ONLY public.organization_users DROP CONSTRAINT IF EXISTS organization_users_organization_id_user_id_key;
ALTER TABLE IF EXISTS ONLY public.monthly_summaries DROP CONSTRAINT IF EXISTS monthly_summaries_year_month_key;
ALTER TABLE IF EXISTS ONLY public.monthly_summaries DROP CONSTRAINT IF EXISTS monthly_summaries_pkey;
ALTER TABLE IF EXISTS ONLY public.items DROP CONSTRAINT IF EXISTS items_pkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_receipt_number_key;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_pkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_document_number_key;
ALTER TABLE IF EXISTS ONLY public.document_sequences DROP CONSTRAINT IF EXISTS document_sequences_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_summaries DROP CONSTRAINT IF EXISTS daily_summaries_report_date_key;
ALTER TABLE IF EXISTS ONLY public.daily_summaries DROP CONSTRAINT IF EXISTS daily_summaries_pkey;
ALTER TABLE IF EXISTS ONLY public.cash_movements DROP CONSTRAINT IF EXISTS cash_movements_pkey;
ALTER TABLE IF EXISTS ONLY public.cash_movements DROP CONSTRAINT IF EXISTS cash_movements_movement_number_key;
ALTER TABLE IF EXISTS ONLY public.business_settings DROP CONSTRAINT IF EXISTS business_settings_user_org_unique;
ALTER TABLE IF EXISTS ONLY public.business_settings DROP CONSTRAINT IF EXISTS business_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.bank_transactions DROP CONSTRAINT IF EXISTS bank_transactions_transaction_number_key;
ALTER TABLE IF EXISTS ONLY public.bank_transactions DROP CONSTRAINT IF EXISTS bank_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.bank_import_sessions DROP CONSTRAINT IF EXISTS bank_import_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.bank_accounts DROP CONSTRAINT IF EXISTS bank_accounts_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_log DROP CONSTRAINT IF EXISTS audit_log_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS ONLY _realtime.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY _realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY _realtime.extensions DROP CONSTRAINT IF EXISTS extensions_pkey;
ALTER TABLE IF EXISTS supabase_functions.hooks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP VIEW IF EXISTS vault.decrypted_secrets;
DROP TABLE IF EXISTS supabase_functions.migrations;
DROP SEQUENCE IF EXISTS supabase_functions.hooks_id_seq;
DROP TABLE IF EXISTS supabase_functions.hooks;
DROP TABLE IF EXISTS storage.s3_multipart_uploads_parts;
DROP TABLE IF EXISTS storage.s3_multipart_uploads;
DROP TABLE IF EXISTS storage.prefixes;
DROP TABLE IF EXISTS storage.objects;
DROP TABLE IF EXISTS storage.migrations;
DROP TABLE IF EXISTS storage.buckets;
DROP TABLE IF EXISTS realtime.subscription;
DROP TABLE IF EXISTS realtime.schema_migrations;
DROP TABLE IF EXISTS realtime.messages;
DROP TABLE IF EXISTS public.users;
DROP VIEW IF EXISTS public.unmatched_sales_for_provider;
DROP VIEW IF EXISTS public.unmatched_provider_reports;
DROP VIEW IF EXISTS public.unmatched_bank_transactions;
DROP VIEW IF EXISTS public.unified_transactions_view;
DROP TABLE IF EXISTS public.transaction_matches;
DROP TABLE IF EXISTS public.suppliers;
DROP TABLE IF EXISTS public.sale_items;
DROP VIEW IF EXISTS public.recent_missing_closures;
DROP TABLE IF EXISTS public.provider_import_sessions;
DROP TABLE IF EXISTS public.organizations;
DROP TABLE IF EXISTS public.organization_users;
DROP TABLE IF EXISTS public.monthly_summaries;
DROP TABLE IF EXISTS public.items;
DROP TABLE IF EXISTS public.documents;
DROP TABLE IF EXISTS public.document_sequences;
DROP TABLE IF EXISTS public.daily_summaries;
DROP TABLE IF EXISTS public.business_settings;
DROP TABLE IF EXISTS public.bank_transactions;
DROP TABLE IF EXISTS public.bank_import_sessions;
DROP TABLE IF EXISTS public.bank_accounts;
DROP VIEW IF EXISTS public.available_for_bank_matching;
DROP TABLE IF EXISTS public.sales;
DROP TABLE IF EXISTS public.provider_reports;
DROP TABLE IF EXISTS public.owner_transactions;
DROP TABLE IF EXISTS public.expenses;
DROP TABLE IF EXISTS public.cash_movements;
DROP TABLE IF EXISTS public.audit_log;
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP TABLE IF EXISTS _realtime.tenants;
DROP TABLE IF EXISTS _realtime.schema_migrations;
DROP TABLE IF EXISTS _realtime.extensions;
DROP FUNCTION IF EXISTS vault.secrets_encrypt_secret_secret();
DROP FUNCTION IF EXISTS supabase_functions.http_request();
DROP FUNCTION IF EXISTS storage.update_updated_at_column();
DROP FUNCTION IF EXISTS storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text);
DROP FUNCTION IF EXISTS storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.prefixes_insert_trigger();
DROP FUNCTION IF EXISTS storage.operation();
DROP FUNCTION IF EXISTS storage.objects_insert_prefix_trigger();
DROP FUNCTION IF EXISTS storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);
DROP FUNCTION IF EXISTS storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION IF EXISTS storage.get_size_by_bucket();
DROP FUNCTION IF EXISTS storage.get_prefixes(name text);
DROP FUNCTION IF EXISTS storage.get_prefix(name text);
DROP FUNCTION IF EXISTS storage.get_level(name text);
DROP FUNCTION IF EXISTS storage.foldername(name text);
DROP FUNCTION IF EXISTS storage.filename(name text);
DROP FUNCTION IF EXISTS storage.extension(name text);
DROP FUNCTION IF EXISTS storage.delete_prefix_hierarchy_trigger();
DROP FUNCTION IF EXISTS storage.delete_prefix(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION IF EXISTS storage.add_prefixes(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS realtime.topic();
DROP FUNCTION IF EXISTS realtime.to_regrole(role_name text);
DROP FUNCTION IF EXISTS realtime.subscription_check_filters();
DROP FUNCTION IF EXISTS realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION IF EXISTS realtime.quote_wal2json(entity regclass);
DROP FUNCTION IF EXISTS realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION IF EXISTS realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION IF EXISTS realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION IF EXISTS realtime."cast"(val text, type_ regtype);
DROP FUNCTION IF EXISTS realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION IF EXISTS realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION IF EXISTS realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION IF EXISTS public.validate_monthly_closure_prerequisites(check_year integer, check_month integer);
DROP FUNCTION IF EXISTS public.validate_expense_category(category_key text, user_id_param uuid);
DROP FUNCTION IF EXISTS public.update_suppliers_updated_at();
DROP FUNCTION IF EXISTS public.update_sales_banking_status();
DROP FUNCTION IF EXISTS public.update_owner_transactions_updated_at();
DROP FUNCTION IF EXISTS public.update_business_settings_updated_at();
DROP FUNCTION IF EXISTS public.update_bank_account_balance();
DROP FUNCTION IF EXISTS public.reset_sequence_for_year(doc_type text);
DROP FUNCTION IF EXISTS public.receipt_number_exists(receipt_num text, table_name text);
DROP FUNCTION IF EXISTS public.normalize_supplier_name(supplier_name text);
DROP FUNCTION IF EXISTS public.migrate_existing_sales_receipt_numbers();
DROP FUNCTION IF EXISTS public.migrate_existing_expenses_receipt_numbers();
DROP FUNCTION IF EXISTS public.migrate_existing_documents_numbers();
DROP FUNCTION IF EXISTS public.migrate_existing_cash_movements_numbers();
DROP FUNCTION IF EXISTS public.migrate_existing_bank_transactions_numbers();
DROP FUNCTION IF EXISTS public.log_financial_changes();
DROP FUNCTION IF EXISTS public.handle_user_delete();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_revenue_breakdown_for_period(start_date date, end_date date);
DROP FUNCTION IF EXISTS public.get_owner_loan_balance(user_uuid uuid);
DROP FUNCTION IF EXISTS public.get_or_create_supplier(supplier_name_input text, user_id_input uuid);
DROP FUNCTION IF EXISTS public.get_next_receipt_number(doc_type text);
DROP FUNCTION IF EXISTS public.get_net_revenue_for_period(start_date date, end_date date);
DROP FUNCTION IF EXISTS public.get_net_profit_for_period(start_date date, end_date date);
DROP FUNCTION IF EXISTS public.get_current_cash_balance_for_org(org_id uuid);
DROP FUNCTION IF EXISTS public.get_current_cash_balance();
DROP FUNCTION IF EXISTS public.generate_document_number(doc_type text);
DROP FUNCTION IF EXISTS public.find_missing_daily_closures(start_date date, end_date date);
DROP FUNCTION IF EXISTS public.execute_exact_matches();
DROP FUNCTION IF EXISTS public.create_daily_summary_for_date(target_date date, cash_starting numeric, cash_ending numeric, notes text);
DROP FUNCTION IF EXISTS public.create_bank_transfer_cash_movement(p_user_id uuid, p_amount numeric, p_description text, p_direction character varying, p_organization_id uuid);
DROP FUNCTION IF EXISTS public.create_bank_reconciliation_session(p_year integer, p_month integer, p_bank_statement_filename text, p_bank_entries_count integer, p_bank_entries_total_amount numeric, p_user_id uuid);
DROP FUNCTION IF EXISTS public.complete_bank_reconciliation_session(p_session_id uuid, p_user_id uuid);
DROP FUNCTION IF EXISTS public.check_period_overlap(p_from_date date, p_to_date date, p_bank_account_id uuid);
DROP FUNCTION IF EXISTS public.check_file_already_imported(p_filename character varying, p_bank_account_id uuid);
DROP FUNCTION IF EXISTS public.check_duplicate_references(p_references text[], p_bank_account_id uuid);
DROP FUNCTION IF EXISTS public.check_bank_reconciliation_completion(p_year integer, p_month integer);
DROP FUNCTION IF EXISTS public.calculate_monthly_summary(summary_year integer, summary_month integer);
DROP FUNCTION IF EXISTS public.calculate_daily_summary(summary_date date);
DROP FUNCTION IF EXISTS public.bulk_close_daily_summaries(target_dates date[], default_cash_starting numeric, default_cash_ending numeric, default_notes text);
DROP FUNCTION IF EXISTS public.auto_populate_supplier_id();
DROP FUNCTION IF EXISTS public.auto_generate_sales_receipt_number();
DROP FUNCTION IF EXISTS public.auto_generate_expenses_receipt_number();
DROP FUNCTION IF EXISTS public.auto_generate_document_number();
DROP FUNCTION IF EXISTS public.auto_generate_cash_movement_number();
DROP FUNCTION IF EXISTS public.auto_generate_bank_transaction_number();
DROP FUNCTION IF EXISTS public.atomic_daily_closure(target_date date, expected_cash_end numeric, user_id uuid);
DROP FUNCTION IF EXISTS pgbouncer.get_auth(p_usename text);
DROP FUNCTION IF EXISTS extensions.set_graphql_placeholder();
DROP FUNCTION IF EXISTS extensions.pgrst_drop_watch();
DROP FUNCTION IF EXISTS extensions.pgrst_ddl_watch();
DROP FUNCTION IF EXISTS extensions.grant_pg_net_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_graphql_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_cron_access();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS realtime.wal_rls;
DROP TYPE IF EXISTS realtime.wal_column;
DROP TYPE IF EXISTS realtime.user_defined_filter;
DROP TYPE IF EXISTS realtime.equality_op;
DROP TYPE IF EXISTS realtime.action;
DROP TYPE IF EXISTS public.supplier_category;
DROP TYPE IF EXISTS auth.one_time_token_type;
DROP TYPE IF EXISTS auth.factor_type;
DROP TYPE IF EXISTS auth.factor_status;
DROP TYPE IF EXISTS auth.code_challenge_method;
DROP TYPE IF EXISTS auth.aal_level;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS supabase_vault;
DROP EXTENSION IF EXISTS pgjwt;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP EXTENSION IF EXISTS pg_graphql;
DROP SCHEMA IF EXISTS vault;
DROP SCHEMA IF EXISTS supabase_functions;
DROP SCHEMA IF EXISTS storage;
DROP SCHEMA IF EXISTS realtime;
-- *not* dropping schema, since initdb creates it
DROP EXTENSION IF EXISTS pgsodium;
DROP SCHEMA IF EXISTS pgsodium;
DROP SCHEMA IF EXISTS pgbouncer;
DROP EXTENSION IF EXISTS pg_net;
DROP SCHEMA IF EXISTS graphql_public;
DROP SCHEMA IF EXISTS graphql;
DROP SCHEMA IF EXISTS extensions;
DROP SCHEMA IF EXISTS auth;
DROP SCHEMA IF EXISTS _realtime;
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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


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
-- Name: FUNCTION auto_generate_bank_transaction_number(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.auto_generate_bank_transaction_number() IS 'Auto-generates transaction numbers for bank transactions (format: BT2025000001)';


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
-- Name: FUNCTION auto_generate_cash_movement_number(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.auto_generate_cash_movement_number() IS 'Auto-generates movement numbers for cash movements (format: CM2025000001)';


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
-- Name: FUNCTION auto_generate_document_number(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.auto_generate_document_number() IS 'Auto-generates document numbers based on document type';


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
-- Name: FUNCTION auto_generate_expenses_receipt_number(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.auto_generate_expenses_receipt_number() IS 'Auto-generates receipt numbers for new expenses (format: AG2025000001)';


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
-- Name: FUNCTION auto_generate_sales_receipt_number(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.auto_generate_sales_receipt_number() IS 'Auto-generates receipt numbers for new sales (format: VK2025000001)';


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
-- Name: FUNCTION get_or_create_supplier(supplier_name_input text, user_id_input uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_or_create_supplier(supplier_name_input text, user_id_input uuid) IS 'Auto-creates supplier record if not exists, returns supplier_id';


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
    -- Formula: (Owner gave) - (Owner received) = (Expenses + Deposits) - Withdrawals
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
-- Name: FUNCTION validate_expense_category(category_key text, user_id_param uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.validate_expense_category(category_key text, user_id_param uuid) IS 'Validates expense category against default + custom categories';


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
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
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
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
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
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
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
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


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
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
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
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
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
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
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
    CONSTRAINT cash_movements_banking_status_check CHECK (((banking_status)::text = ANY ((ARRAY['unmatched'::character varying, 'matched'::character varying])::text[]))),
    CONSTRAINT cash_movements_movement_type_check CHECK (((movement_type)::text = ANY ((ARRAY['cash_operation'::character varying, 'bank_transfer'::character varying])::text[]))),
    CONSTRAINT cash_movements_reference_type_check CHECK ((reference_type = ANY (ARRAY['sale'::text, 'expense'::text, 'adjustment'::text, 'owner_transaction'::text]))),
    CONSTRAINT cash_movements_type_check CHECK ((type = ANY (ARRAY['cash_in'::text, 'cash_out'::text])))
);


--
-- Name: COLUMN cash_movements.movement_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_movements.movement_number IS 'Human-readable cash movement number (e.g., CM2025000001)';


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
    CONSTRAINT expenses_banking_status_check CHECK (((banking_status)::text = ANY ((ARRAY['unmatched'::character varying, 'matched'::character varying])::text[]))),
    CONSTRAINT expenses_category_valid CHECK (public.validate_expense_category(category, user_id)),
    CONSTRAINT expenses_payment_method_check CHECK ((payment_method = ANY (ARRAY['bank'::text, 'cash'::text])))
);


--
-- Name: COLUMN expenses.receipt_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.expenses.receipt_number IS 'Human-readable expense receipt number (e.g., AG2025000001)';


--
-- Name: COLUMN expenses.supplier_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.expenses.supplier_id IS 'Foreign key to suppliers table - preferred over supplier_name';


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
    CONSTRAINT owner_transactions_banking_status_check CHECK (((banking_status)::text = ANY ((ARRAY['unmatched'::character varying, 'matched'::character varying])::text[]))),
    CONSTRAINT owner_transactions_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['bank_transfer'::character varying, 'private_card'::character varying, 'private_cash'::character varying])::text[]))),
    CONSTRAINT owner_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['deposit'::character varying, 'expense'::character varying, 'withdrawal'::character varying])::text[])))
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
    CONSTRAINT provider_reports_provider_check CHECK (((provider)::text = ANY ((ARRAY['twint'::character varying, 'sumup'::character varying])::text[]))),
    CONSTRAINT provider_reports_status_check CHECK (((status)::text = ANY ((ARRAY['unmatched'::character varying, 'matched'::character varying, 'discrepancy'::character varying])::text[])))
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
    CONSTRAINT sales_banking_status_check CHECK (((banking_status)::text = ANY ((ARRAY['unmatched'::character varying, 'provider_matched'::character varying, 'bank_matched'::character varying, 'fully_matched'::character varying])::text[]))),
    CONSTRAINT sales_payment_method_check CHECK ((payment_method = ANY (ARRAY['cash'::text, 'twint'::text, 'sumup'::text]))),
    CONSTRAINT sales_settlement_status_check CHECK ((settlement_status = ANY (ARRAY['pending'::text, 'settled'::text, 'failed'::text, 'weekend_delay'::text, 'charged_back'::text]))),
    CONSTRAINT sales_status_check CHECK ((status = ANY (ARRAY['completed'::text, 'cancelled'::text, 'refunded'::text])))
);


--
-- Name: COLUMN sales.receipt_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sales.receipt_number IS 'Human-readable receipt number (e.g., VK2025000001)';


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
    CONSTRAINT bank_import_sessions_import_type_check CHECK (((import_type)::text = ANY ((ARRAY['camt053'::character varying, 'csv'::character varying])::text[]))),
    CONSTRAINT bank_import_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
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
    CONSTRAINT bank_transactions_status_check CHECK (((status)::text = ANY ((ARRAY['unmatched'::character varying, 'matched'::character varying, 'ignored'::character varying])::text[])))
);


--
-- Name: COLUMN bank_transactions.reference; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bank_transactions.reference IS 'Bank unique reference (AcctSvcrRef in CAMT.053) - used for duplicate prevention';


--
-- Name: COLUMN bank_transactions.transaction_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bank_transactions.transaction_number IS 'Human-readable bank transaction number (e.g., BT2025000001)';


--
-- Name: business_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
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
    app_logo_dark_storage_path text
);


--
-- Name: COLUMN business_settings.custom_expense_categories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_settings.custom_expense_categories IS 'User-defined expense categories as JSON object: {"key": "Display Name"}';


--
-- Name: COLUMN business_settings.app_logo_light_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_settings.app_logo_light_url IS 'URL for the app logo displayed in light theme';


--
-- Name: COLUMN business_settings.app_logo_dark_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_settings.app_logo_dark_url IS 'URL for the app logo displayed in dark theme';


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
-- Name: COLUMN documents.file_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.documents.file_name IS 'Original filename for display purposes';


--
-- Name: COLUMN documents.file_size; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.documents.file_size IS 'File size in bytes for UI display';


--
-- Name: COLUMN documents.mime_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.documents.mime_type IS 'MIME type for proper file handling';


--
-- Name: COLUMN documents.reference_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.documents.reference_type IS 'Type of referenced entity (sale/expense/report)';


--
-- Name: COLUMN documents.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.documents.notes IS 'Additional notes, especially for import-generated documents';


--
-- Name: COLUMN documents.document_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.documents.document_number IS 'Human-readable document number based on document type';


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
-- Name: TABLE organization_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organization_users IS 'Multi-tenancy enforced by frontend logic, not RLS (Docker Supabase limitation)';


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
-- Name: TABLE organizations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organizations IS 'Multi-tenancy enforced by frontend logic, not RLS (Docker Supabase limitation)';


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
    organization_id uuid
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
-- Name: TABLE suppliers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.suppliers IS 'Master table for supplier normalization and analytics';


--
-- Name: COLUMN suppliers.normalized_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.suppliers.normalized_name IS 'Lowercase, trimmed name for matching and deduplication';


--
-- Name: COLUMN suppliers.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.suppliers.category IS 'Business category for expense analytics';


--
-- Name: COLUMN suppliers.vat_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.suppliers.vat_number IS 'Swiss UID number for tax purposes';


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
    CONSTRAINT transaction_matches_match_type_check CHECK (((match_type)::text = ANY ((ARRAY['automatic'::character varying, 'manual'::character varying, 'suggested'::character varying])::text[]))),
    CONSTRAINT transaction_matches_matched_type_check CHECK (((matched_type)::text = ANY ((ARRAY['sale'::character varying, 'expense'::character varying, 'provider_batch'::character varying, 'cash_movement'::character varying, 'owner_transaction'::character varying])::text[])))
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
                END AS has_real_provider_fees
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
            false AS has_real_provider_fees
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
            false AS has_real_provider_fees
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
            false AS has_real_provider_fees
           FROM public.bank_transactions bt
        )
 SELECT transaction_base.id,
    transaction_base.transaction_type,
    transaction_base.type_code,
    transaction_base.receipt_number,
    transaction_base.transaction_date,
    transaction_base.amount,
    transaction_base.payment_method,
    transaction_base.status,
    transaction_base.user_id,
    transaction_base.organization_id,
    transaction_base.description,
    transaction_base.document_id,
    transaction_base.has_pdf,
    transaction_base.banking_status,
    date(transaction_base.transaction_date) AS date_only,
    to_char(transaction_base.transaction_date, 'HH24:MI'::text) AS time_only,
    lower(transaction_base.description) AS description_lower,
    lower((transaction_base.receipt_number)::text) AS receipt_number_lower,
    transaction_base.provider_fee,
    transaction_base.net_amount,
    transaction_base.provider_report_id,
    transaction_base.has_real_provider_fees
   FROM transaction_base
  ORDER BY transaction_base.transaction_date DESC;


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
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


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
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: -
--

COPY _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at) FROM stdin;
6bcbd2db-92da-404d-b1b6-4f319bf155fe	postgres_cdc_rls	{"region": "us-east-1", "db_host": "QhixI0o7PYIABziLUL4f0A==", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "eGxa2ZKVreSn7eWieRQdp74vN25K+qFgdnxmDCKe4p20+C0410WXonzXTEj9CgYx", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}	realtime-dev	2025-06-17 18:36:17	2025-06-17 18:36:17
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: _realtime; Owner: -
--

COPY _realtime.schema_migrations (version, inserted_at) FROM stdin;
20210706140551	2025-03-16 17:58:36
20220329161857	2025-03-16 17:58:36
20220410212326	2025-03-16 17:58:36
20220506102948	2025-03-16 17:58:36
20220527210857	2025-03-16 17:58:36
20220815211129	2025-03-16 17:58:36
20220815215024	2025-03-16 17:58:36
20220818141501	2025-03-16 17:58:36
20221018173709	2025-03-16 17:58:36
20221102172703	2025-03-16 17:58:36
20221223010058	2025-03-16 17:58:36
20230110180046	2025-03-16 17:58:36
20230810220907	2025-03-16 17:58:36
20230810220924	2025-03-16 17:58:36
20231024094642	2025-03-16 17:58:36
20240306114423	2025-03-16 17:58:36
20240418082835	2025-03-16 17:58:36
20240625211759	2025-03-16 17:58:36
20240704172020	2025-03-16 17:58:36
20240902173232	2025-03-16 17:58:36
20241106103258	2025-03-16 17:58:36
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: _realtime; Owner: -
--

COPY _realtime.tenants (id, name, external_id, jwt_secret, max_concurrent_users, inserted_at, updated_at, max_events_per_second, postgres_cdc_default, max_bytes_per_second, max_channels_per_client, max_joins_per_second, suspend, jwt_jwks, notify_private_alpha, private_only) FROM stdin;
2e3668ed-60d6-4467-9a66-828e8b810450	realtime-dev	realtime-dev	eGxa2ZKVreSn7eWieRQdp60i5H6KJLiST7splFU6MVHylMSAoQ2SjsTrTTQo/+bmYjQcO4hNnGTU+D1wtlXreA==	200	2025-06-17 18:36:17	2025-06-17 18:36:17	100	postgres_cdc_rls	100000	100	100	f	\N	f	f
\.


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	5aebbb20-1ccb-46a8-bf99-f85252eeb33f	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@lia-hair.ch","user_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","user_phone":""}}	2025-03-16 18:01:14.804235+00	
00000000-0000-0000-0000-000000000000	d71de215-3490-4d13-964f-baaf2e121d31	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-03-16 18:01:30.270971+00	
00000000-0000-0000-0000-000000000000	dda10e99-2234-452e-8a75-69edecd3a956	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-16 19:42:45.47681+00	
00000000-0000-0000-0000-000000000000	2c24e7d3-bf0f-4705-88f0-83b4806d529a	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-16 19:42:45.477218+00	
00000000-0000-0000-0000-000000000000	965f3bf2-37ba-4c60-b170-6c81723c929d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-03-16 19:59:26.664338+00	
00000000-0000-0000-0000-000000000000	791adcba-3b05-4b82-bf59-4c3655014977	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-16 20:57:33.2746+00	
00000000-0000-0000-0000-000000000000	8e5defd7-1c4f-403b-913f-12651fdcbf6c	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-16 20:57:33.275664+00	
00000000-0000-0000-0000-000000000000	393c68c3-5689-4653-94cc-d06e4897283b	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-16 21:56:03.013359+00	
00000000-0000-0000-0000-000000000000	c629fa9d-9e37-4fdd-8853-ed41de4a2a4e	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-16 21:56:03.014134+00	
00000000-0000-0000-0000-000000000000	859eb99f-91ca-4467-8c99-0ffe4ee1cf76	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-03-16 22:47:41.259379+00	
00000000-0000-0000-0000-000000000000	3d2b7e68-eeea-4653-8d61-5faa498180d1	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-16 23:45:49.260712+00	
00000000-0000-0000-0000-000000000000	568a9c48-ac73-4ef0-bc7b-4640532eb2c7	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-16 23:45:49.261574+00	
00000000-0000-0000-0000-000000000000	4a09b9cb-bb77-4f65-92a5-d5a911335fe8	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-17 00:44:07.973777+00	
00000000-0000-0000-0000-000000000000	8deffc19-5379-47e8-9ec8-882b9ff6bdf1	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-17 00:44:07.974633+00	
00000000-0000-0000-0000-000000000000	c060db36-2bf7-4e31-93dd-4bec073728a8	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-17 11:39:25.634459+00	
00000000-0000-0000-0000-000000000000	7452d1a1-2d17-420a-8023-ab655990ff19	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-17 11:39:25.63706+00	
00000000-0000-0000-0000-000000000000	6e59eda9-98e9-457f-92a2-89204e5d895d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-03-17 11:39:39.064272+00	
00000000-0000-0000-0000-000000000000	b1cb1238-5d98-479c-90da-84eaede6a8e7	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-03-17 11:39:50.636844+00	
00000000-0000-0000-0000-000000000000	1e37a618-70a8-40f9-a638-c1bf1031d73d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-03-17 11:40:01.512182+00	
00000000-0000-0000-0000-000000000000	edb51b60-d932-4a66-926c-b10731ca5df4	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-17 18:28:00.275869+00	
00000000-0000-0000-0000-000000000000	4501e6d9-e03f-4963-a4e1-064c99594daa	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-03-17 18:28:00.276387+00	
00000000-0000-0000-0000-000000000000	e3ee1c33-d0bf-4ab2-bbb1-2149aabc88d8	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-04 15:34:11.578327+00	
00000000-0000-0000-0000-000000000000	049630b0-9a55-4ddd-99ae-b18ddc2e9bcc	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-04 15:34:11.579097+00	
00000000-0000-0000-0000-000000000000	a3a3a726-3a08-4a27-a535-043ba949e73f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 15:35:16.916505+00	
00000000-0000-0000-0000-000000000000	47fdd925-9f7f-4888-9402-cad13893bcfa	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-05-04 16:23:09.813188+00	
00000000-0000-0000-0000-000000000000	94e46b80-731f-49cf-932d-400dcde8860c	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 16:23:13.902406+00	
00000000-0000-0000-0000-000000000000	f4570ecc-0123-49e1-8ba7-b8e90fe6eb1e	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-05-04 16:24:13.923429+00	
00000000-0000-0000-0000-000000000000	c9f030eb-3b64-49df-ab35-044de4503096	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 16:27:51.908527+00	
00000000-0000-0000-0000-000000000000	07a58591-2359-42d1-a39f-6e2faabe1b48	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-05-04 16:28:20.810747+00	
00000000-0000-0000-0000-000000000000	27bd328b-ee49-4aac-b0e6-22b5aa4b0a6e	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 16:30:26.460759+00	
00000000-0000-0000-0000-000000000000	a99ba57a-bb3b-4fd7-ab3c-0facd7cbc757	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-05-04 16:31:49.890627+00	
00000000-0000-0000-0000-000000000000	820f6bb6-ec02-4083-9fc0-54b6b9847f44	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 16:31:55.394983+00	
00000000-0000-0000-0000-000000000000	8f1c130b-ae66-4041-859e-90f630c5d288	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-04 17:39:08.590754+00	
00000000-0000-0000-0000-000000000000	4f9f4df6-86e3-4cfa-8318-c67477b37a35	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-04 17:39:08.591107+00	
00000000-0000-0000-0000-000000000000	427c7e16-0772-4081-9d23-986acc02b237	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-04 18:37:28.063546+00	
00000000-0000-0000-0000-000000000000	54d49921-b79e-493b-86bf-13c56319bbd0	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-04 18:37:28.064073+00	
00000000-0000-0000-0000-000000000000	6e33688a-5ce1-4168-bdb5-bef1b2ca263d	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-04 19:36:37.496525+00	
00000000-0000-0000-0000-000000000000	b17d2731-2818-4d24-8a9f-27de1452d6c5	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-04 19:36:37.496987+00	
00000000-0000-0000-0000-000000000000	0b7099d3-ce0d-4116-a866-8348f63f47a6	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 19:42:08.104071+00	
00000000-0000-0000-0000-000000000000	6a7c4527-ea9b-4cba-84ec-73ff7db6433e	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 19:46:02.085546+00	
00000000-0000-0000-0000-000000000000	93f7ef82-dcf0-465a-9a61-e827f163552b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 20:27:00.005653+00	
00000000-0000-0000-0000-000000000000	c59aaf01-b688-4a20-aa05-2f8ffb715112	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-04 21:32:47.960665+00	
00000000-0000-0000-0000-000000000000	84550a0e-9e4e-496f-970e-36497ee066fd	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-04 21:32:47.960841+00	
00000000-0000-0000-0000-000000000000	79f5fcb1-500e-4e00-93e2-15dc67f282eb	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 21:40:58.805638+00	
00000000-0000-0000-0000-000000000000	349552a2-df4b-49c8-8b2f-1de66d5eeef0	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 21:42:35.192992+00	
00000000-0000-0000-0000-000000000000	c4460375-f9a7-47d3-88f6-84ef2ebc5512	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 21:44:41.657458+00	
00000000-0000-0000-0000-000000000000	441e6be4-937d-4c50-9a93-0ee63f0715f3	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 21:49:08.156045+00	
00000000-0000-0000-0000-000000000000	039faf5d-4844-4d09-b77b-c898e8cfae83	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 21:55:19.347074+00	
00000000-0000-0000-0000-000000000000	195b6448-5bec-4c8e-a422-db17b2d30ab6	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 22:07:17.310175+00	
00000000-0000-0000-0000-000000000000	7e249ff0-3c07-47b7-9f8c-fd9b5325fbd8	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 22:09:08.810283+00	
00000000-0000-0000-0000-000000000000	c1d52328-14ba-410f-84e9-d0f85c60f227	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 22:12:08.551979+00	
00000000-0000-0000-0000-000000000000	3d98c2c5-9ee3-435f-831e-fdc79934ada1	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 22:12:44.72035+00	
00000000-0000-0000-0000-000000000000	9866fdc7-9a36-48b5-924a-20a9b70339c8	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 22:18:29.384686+00	
00000000-0000-0000-0000-000000000000	d98af31d-f1b7-48d1-8f35-a57310ddd51b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 22:19:26.993134+00	
00000000-0000-0000-0000-000000000000	ffe247b8-378d-4005-ae91-1b326b514c49	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 22:58:23.352667+00	
00000000-0000-0000-0000-000000000000	422346af-e4bd-4bb2-84f8-96747fe561ec	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 23:01:46.340865+00	
00000000-0000-0000-0000-000000000000	b01d0ba3-3a41-40ce-b947-177e4969ce18	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 23:13:38.248372+00	
00000000-0000-0000-0000-000000000000	462a1337-e432-41d0-9a60-4b4de9f71392	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 23:15:26.102535+00	
00000000-0000-0000-0000-000000000000	5e016a8b-53d1-4637-b0e0-71a6da99be3c	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 23:15:55.285371+00	
00000000-0000-0000-0000-000000000000	307438eb-f0cc-43f7-8771-8ef47dc03609	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 23:17:32.315757+00	
00000000-0000-0000-0000-000000000000	eb2ce78b-2bbd-4f5e-8a79-4078b396a8fb	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 23:20:06.977234+00	
00000000-0000-0000-0000-000000000000	762be9f0-7e24-4683-b51a-92c6a7dc08e6	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 23:21:22.292929+00	
00000000-0000-0000-0000-000000000000	2b17c9a3-8023-4fea-a496-efa9d1379274	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 23:35:31.55526+00	
00000000-0000-0000-0000-000000000000	bdc3b349-ae15-4cae-8414-6fa5f3659924	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 23:48:59.72961+00	
00000000-0000-0000-0000-000000000000	0c1e8907-519d-43bd-a7d6-c69d715e9d58	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-24 19:05:41.787389+00	
00000000-0000-0000-0000-000000000000	5a51b6a9-1872-4093-b79b-b0ed709d87a3	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-24 19:05:41.788895+00	
00000000-0000-0000-0000-000000000000	855187ef-e432-47c0-ba8d-4bf1699c26cf	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 19:05:49.598708+00	
00000000-0000-0000-0000-000000000000	b2ae3d3a-790b-42dc-9d22-39d93290d28d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 20:41:15.933906+00	
00000000-0000-0000-0000-000000000000	e30a81a3-4f01-480c-8d54-a0b4cf680d4f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 21:02:13.570433+00	
00000000-0000-0000-0000-000000000000	c3b985d6-4833-4e3c-91fd-ac3b7a950eae	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 21:29:49.391274+00	
00000000-0000-0000-0000-000000000000	1d6ab7f3-f44f-41bb-9cf3-1244775c55f8	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 21:35:39.494174+00	
00000000-0000-0000-0000-000000000000	b969ea8b-3b08-4abc-953e-4c17009ca3f0	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 21:36:04.537138+00	
00000000-0000-0000-0000-000000000000	faa50c50-98d5-4539-bcd7-5aff7e69ca21	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 22:18:51.914554+00	
00000000-0000-0000-0000-000000000000	f5d3969d-d059-45fe-bf0c-177fc79a7613	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 22:51:23.684412+00	
00000000-0000-0000-0000-000000000000	d393748d-6653-42a6-9a9e-75105c53ddbd	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-05-24 23:04:44.986874+00	
00000000-0000-0000-0000-000000000000	88ff205b-7563-432b-a6d6-ed7e39f48421	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 23:04:50.087716+00	
00000000-0000-0000-0000-000000000000	0dff289d-b6d6-4e48-b821-551cbd119388	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-05-24 23:05:30.871773+00	
00000000-0000-0000-0000-000000000000	2c3de9f2-da30-46ec-959f-aa46db6f61f2	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 23:05:38.124072+00	
00000000-0000-0000-0000-000000000000	4a354926-c58b-4964-8e9d-a653c21b9e37	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 23:27:30.736988+00	
00000000-0000-0000-0000-000000000000	227e49c3-1fe7-41a1-ae14-4521503f596b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-24 23:46:25.990208+00	
00000000-0000-0000-0000-000000000000	47f2d975-a0df-4196-8d04-02f6def624bf	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 00:44:32.859767+00	
00000000-0000-0000-0000-000000000000	0b93ce0f-7636-4ba0-b644-d063cc830cf8	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 00:44:32.860248+00	
00000000-0000-0000-0000-000000000000	906af229-e5c3-450d-a7d3-f50736031cd5	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 01:42:32.865087+00	
00000000-0000-0000-0000-000000000000	03770be4-a2d4-4a98-80dd-d258b4614873	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 01:42:32.866049+00	
00000000-0000-0000-0000-000000000000	186a5a2b-120c-477f-84f9-ccd796e768b3	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 02:40:32.858295+00	
00000000-0000-0000-0000-000000000000	045666e9-d2d4-473e-b973-33eade69973d	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 02:40:32.858725+00	
00000000-0000-0000-0000-000000000000	53a54a30-679e-4511-9f8f-04e64675656c	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 03:38:32.862687+00	
00000000-0000-0000-0000-000000000000	64f12ef8-1318-46b4-87a8-614b25ea7ff7	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 03:38:32.863191+00	
00000000-0000-0000-0000-000000000000	b97597b8-8f44-4f85-be63-bf532afee116	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 04:36:32.861534+00	
00000000-0000-0000-0000-000000000000	be030920-a98b-471a-93ca-e1b46309ddf5	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 04:36:32.86194+00	
00000000-0000-0000-0000-000000000000	62b1baae-aa86-4c41-8152-92d422c4a217	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 05:34:32.861004+00	
00000000-0000-0000-0000-000000000000	f6148830-1ddd-48d6-9862-2ea1ad2434f5	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 05:34:32.861617+00	
00000000-0000-0000-0000-000000000000	fdd5e4b3-8799-4709-b26f-bd2cf11742b2	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 06:32:32.865805+00	
00000000-0000-0000-0000-000000000000	a78cffad-7c72-4f80-b232-36039bf9a190	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 06:32:32.866849+00	
00000000-0000-0000-0000-000000000000	fcdb6b9a-02f9-40f2-9180-e4f2a5da467e	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 07:30:32.866004+00	
00000000-0000-0000-0000-000000000000	081fc381-e2e4-4718-adcd-0448bd2439b1	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 07:30:32.867033+00	
00000000-0000-0000-0000-000000000000	76872cd3-c412-4939-b9d3-d3dbd3056cfd	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 08:07:40.597013+00	
00000000-0000-0000-0000-000000000000	4032d503-913a-4bb6-8dfa-5c99cb7a3d6a	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 13:00:12.356087+00	
00000000-0000-0000-0000-000000000000	372c2a4b-f07c-43fb-865a-a415a560e43f	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 13:00:12.356691+00	
00000000-0000-0000-0000-000000000000	4842dbe0-753d-489d-ba10-8c4f90195f74	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 13:50:13.475084+00	
00000000-0000-0000-0000-000000000000	6f23e6c7-4e7c-4651-91cc-116d14fa9f6d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 13:50:56.833306+00	
00000000-0000-0000-0000-000000000000	6a6db606-67fd-4018-a3e7-903b2b46a297	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 14:39:02.888254+00	
00000000-0000-0000-0000-000000000000	e17a2a86-778e-476b-ae04-ca1572a5cc54	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 14:50:02.809904+00	
00000000-0000-0000-0000-000000000000	4773d5a0-1b23-46be-b181-9ce6e6d96da9	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 14:51:34.745952+00	
00000000-0000-0000-0000-000000000000	354769b3-2c07-4c7e-b9ae-5e4aaa882737	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 15:11:22.457008+00	
00000000-0000-0000-0000-000000000000	12e506c6-d972-4b10-86d8-63bc8a64f64f	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 16:13:54.692635+00	
00000000-0000-0000-0000-000000000000	9e65579f-5551-41bf-80a6-7b4f66ceb1d5	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 16:13:54.694254+00	
00000000-0000-0000-0000-000000000000	bb552fbd-c343-45f4-af85-badae15cb55c	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 16:25:38.256941+00	
00000000-0000-0000-0000-000000000000	f6ababbf-e136-4b02-a265-7d46ecdee0b0	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 16:50:13.45807+00	
00000000-0000-0000-0000-000000000000	0dfdcd55-fbbc-40d2-8f4d-7e46ea7c0ab9	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 16:56:51.886565+00	
00000000-0000-0000-0000-000000000000	cfdd7d83-d2d8-4390-9805-996e04b506cc	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 17:19:56.553796+00	
00000000-0000-0000-0000-000000000000	972c66fb-29a1-421a-86e9-b9a3bb3909d3	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 18:04:15.146153+00	
00000000-0000-0000-0000-000000000000	aeda6886-bc0b-43ba-b028-037cb3b0a08f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 18:16:26.669276+00	
00000000-0000-0000-0000-000000000000	feaeb278-a7db-46fc-807d-507701788ee2	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 19:14:53.551815+00	
00000000-0000-0000-0000-000000000000	dc09348c-de3d-467f-af19-bc1ed596ea64	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 19:14:53.552018+00	
00000000-0000-0000-0000-000000000000	6f93fa2d-9e44-4a4f-8997-48ba5abdcb44	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 19:18:42.647304+00	
00000000-0000-0000-0000-000000000000	d27512cf-04ae-4c1f-a89f-7a9e14f29530	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 19:35:00.145601+00	
00000000-0000-0000-0000-000000000000	12425794-ece4-4143-a99f-6497351f543f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 19:57:20.631433+00	
00000000-0000-0000-0000-000000000000	4719c604-3956-4c0a-8718-1dc1d5f73427	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 20:08:16.977935+00	
00000000-0000-0000-0000-000000000000	de04bd0e-9115-41c0-ae24-25600f28e972	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 20:27:57.495336+00	
00000000-0000-0000-0000-000000000000	4c82eef0-54f9-4ce4-9865-664ca4951925	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 20:50:56.36381+00	
00000000-0000-0000-0000-000000000000	b7973735-6a8a-4473-b9b3-a5b42ec17749	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 21:49:11.629726+00	
00000000-0000-0000-0000-000000000000	9d233396-e06a-4d56-9b5a-f8f527dae4a0	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-25 21:49:11.630865+00	
00000000-0000-0000-0000-000000000000	5a86f71e-4f6c-4741-83da-4fc340366403	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 22:03:49.060509+00	
00000000-0000-0000-0000-000000000000	968a9c31-2b75-4833-8c21-d90e8e38c0fc	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 22:10:46.609477+00	
00000000-0000-0000-0000-000000000000	e10150ce-4880-40f2-908a-8bab71d080fd	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 22:24:34.147689+00	
00000000-0000-0000-0000-000000000000	43725834-8e58-45c8-852c-6beb51880144	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 22:50:40.23602+00	
00000000-0000-0000-0000-000000000000	fee011c2-1ed8-4743-9818-85a3824eede4	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 22:56:11.189168+00	
00000000-0000-0000-0000-000000000000	8095b76c-800e-4351-a5e6-5dc379d82fa1	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 23:18:53.429904+00	
00000000-0000-0000-0000-000000000000	33b376d2-d833-4d9a-a487-309492f520b2	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 23:44:03.832672+00	
00000000-0000-0000-0000-000000000000	2d7240cd-5ffd-4e54-8566-2a9a1553c65b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-25 23:47:37.209536+00	
00000000-0000-0000-0000-000000000000	d9f0ae76-4863-4545-b449-d8ab717b098b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-26 00:00:56.7225+00	
00000000-0000-0000-0000-000000000000	998c2d6f-8dcf-4538-a644-a6cdf626a4a3	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-26 00:12:09.21516+00	
00000000-0000-0000-0000-000000000000	3ea34a6d-bd72-4a29-a980-f71c0d6fd314	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-26 00:25:18.380009+00	
00000000-0000-0000-0000-000000000000	a94c46be-ccc5-4e82-b08f-23b2e2781f42	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-26 20:10:18.658218+00	
00000000-0000-0000-0000-000000000000	2523352c-9f55-4f2b-8260-d076cf5ddf79	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-26 20:10:18.660507+00	
00000000-0000-0000-0000-000000000000	ee7c28d5-c842-4195-a0bc-ff104d8f0450	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-26 20:10:23.874151+00	
00000000-0000-0000-0000-000000000000	8ba2e2ea-f787-4d4d-8750-6004689b4211	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-26 20:17:17.195679+00	
00000000-0000-0000-0000-000000000000	e2d6e997-1089-4e34-b921-3210bdab653b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-26 20:22:38.077008+00	
00000000-0000-0000-0000-000000000000	513b2a15-6fb5-43cf-af9e-0b0cbc04e5d7	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-26 21:07:04.319288+00	
00000000-0000-0000-0000-000000000000	0b230234-e22b-4d5c-9c39-cbcd6c4eb4af	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-26 21:30:47.214938+00	
00000000-0000-0000-0000-000000000000	f47ba866-39ec-46e4-8043-2a3b7051c96c	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-27 06:00:00.113605+00	
00000000-0000-0000-0000-000000000000	020f2ee0-bfda-4116-a97f-ab911c8dc307	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-27 06:00:00.114927+00	
00000000-0000-0000-0000-000000000000	a99a9c15-a5c1-4d3c-87b2-890679c4d1fd	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 06:00:12.097302+00	
00000000-0000-0000-0000-000000000000	43d263f0-00b7-4e9f-ba43-87395e13ca7f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 06:31:53.64538+00	
00000000-0000-0000-0000-000000000000	cbda9150-8612-4a90-a9e5-0362e03f5173	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 06:45:33.93847+00	
00000000-0000-0000-0000-000000000000	e22e7c93-f668-483e-ac70-214206aef835	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-27 07:43:52.326171+00	
00000000-0000-0000-0000-000000000000	4f855cbd-0a56-4c3f-9f55-16d387960e4d	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-27 07:43:52.326826+00	
00000000-0000-0000-0000-000000000000	54229353-f8a4-460d-bec8-daa87f998e5e	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 08:25:54.094667+00	
00000000-0000-0000-0000-000000000000	95be38e5-654a-43b8-b9d7-6a47d2686a2d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 08:32:38.809906+00	
00000000-0000-0000-0000-000000000000	82bc76e9-f1f9-48f4-a8ec-851af24a7148	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 09:14:06.67754+00	
00000000-0000-0000-0000-000000000000	edd7d1e2-410e-447f-b039-35fadea4e72b	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-27 10:12:14.09133+00	
00000000-0000-0000-0000-000000000000	97e4c024-0f8d-4856-9c52-2a216369ab5f	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-27 10:12:14.091686+00	
00000000-0000-0000-0000-000000000000	7792cf5a-7fc9-4351-81d1-c12dd36dc9b0	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-27 11:10:14.088331+00	
00000000-0000-0000-0000-000000000000	b7a3d8c8-bed5-46fe-81f5-3bdc3e7a0581	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-27 11:10:14.088785+00	
00000000-0000-0000-0000-000000000000	b9c651c1-b6a4-455b-b20f-dfa727ca2da0	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 11:42:28.214096+00	
00000000-0000-0000-0000-000000000000	74ee3712-39aa-448b-be03-efc2a61e54cd	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 11:52:18.593412+00	
00000000-0000-0000-0000-000000000000	e5bf281e-2a84-45ba-bc37-feec5c420082	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 12:02:44.262203+00	
00000000-0000-0000-0000-000000000000	d9d80da9-01f9-4be9-b2a5-5aa2dd41cc14	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 12:45:46.802493+00	
00000000-0000-0000-0000-000000000000	a57b460c-9658-46fa-959a-26c4198e9ad3	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-27 13:44:15.579328+00	
00000000-0000-0000-0000-000000000000	3044b5af-fd50-411b-b777-a551a92833a1	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-27 13:44:15.579696+00	
00000000-0000-0000-0000-000000000000	89d96fa0-583d-44b9-b71b-d2826025c486	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 14:04:46.3301+00	
00000000-0000-0000-0000-000000000000	2755bff1-4fe6-4b8d-be1c-afa0131c100b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 14:15:53.514332+00	
00000000-0000-0000-0000-000000000000	d6e7593d-37cf-4429-b1e5-3de36595b253	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 14:31:30.766129+00	
00000000-0000-0000-0000-000000000000	644b28e6-49df-47e5-b9f8-2d7a054b98e4	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 14:38:41.226531+00	
00000000-0000-0000-0000-000000000000	f4f54fff-68d3-4436-bd45-10dc6c99a63b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-27 14:42:42.596053+00	
00000000-0000-0000-0000-000000000000	8665063b-3fee-44b6-8bf2-e0c8ff0be7bd	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 05:57:05.393149+00	
00000000-0000-0000-0000-000000000000	38ece66a-4b85-48df-931c-d49b10735e48	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 05:57:05.393975+00	
00000000-0000-0000-0000-000000000000	4648ef1c-d7ef-48f3-b754-64ca475358c6	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 05:57:30.573027+00	
00000000-0000-0000-0000-000000000000	1ea7968d-28b2-4045-bbb7-37371a72009a	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 06:55:39.636548+00	
00000000-0000-0000-0000-000000000000	611fd176-eb6f-4add-b58b-e9d826c34099	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 06:55:39.637109+00	
00000000-0000-0000-0000-000000000000	a9b71537-efc5-4580-b041-97dca72c2c89	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 07:53:52.89997+00	
00000000-0000-0000-0000-000000000000	89723e1b-dba2-43cb-9675-ca6f2c95614d	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 07:53:52.900352+00	
00000000-0000-0000-0000-000000000000	5ccf13c9-88ab-45d3-9513-d738b54f55ed	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 08:55:42.600541+00	
00000000-0000-0000-0000-000000000000	abc6f9d0-fb2a-443a-afd6-2bd8a5baa4b7	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 08:55:42.600951+00	
00000000-0000-0000-0000-000000000000	7e55ccb8-1b1c-441b-844d-18e66ebbf097	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 08:58:08.691175+00	
00000000-0000-0000-0000-000000000000	bc6f3852-b56e-4208-bfbc-1ba8f844ce45	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 09:17:50.261713+00	
00000000-0000-0000-0000-000000000000	aadf43cb-005b-47c5-b37d-4aafa7bbbb79	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 09:20:48.461674+00	
00000000-0000-0000-0000-000000000000	e27b0ada-a06c-4588-8c5d-b7b5efecce90	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 10:57:39.827821+00	
00000000-0000-0000-0000-000000000000	6f44f3c9-b446-4e8a-86ec-7c447201d053	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 10:57:39.828316+00	
00000000-0000-0000-0000-000000000000	89311777-6dfe-4e7f-93b0-33b94ae8da07	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 10:58:29.67968+00	
00000000-0000-0000-0000-000000000000	1a669ec3-cc16-4614-9083-f12df828b55c	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 11:57:00.87185+00	
00000000-0000-0000-0000-000000000000	de45f402-03ea-4a3c-8e7e-9db5e3ac5e37	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 11:57:00.873183+00	
00000000-0000-0000-0000-000000000000	ec00ae18-4a55-4781-80c8-95ef55dff9c5	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 12:03:49.598483+00	
00000000-0000-0000-0000-000000000000	28eeed3c-58ec-4376-8303-47fa3d806c16	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 13:02:15.886524+00	
00000000-0000-0000-0000-000000000000	b8873b38-499d-4964-8e87-e51710134677	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 13:02:15.887294+00	
00000000-0000-0000-0000-000000000000	0022bf2f-46d4-43e0-a3f7-fa66b681e2bc	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 14:00:32.060601+00	
00000000-0000-0000-0000-000000000000	c8c58388-82da-4b01-9168-1db3c7f5855b	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 14:00:32.061314+00	
00000000-0000-0000-0000-000000000000	71bf713d-9a54-4483-8f81-fc029af48efc	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 14:06:32.070926+00	
00000000-0000-0000-0000-000000000000	94a3b0f3-56e8-4b10-9a32-d592d19d983b	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 16:28:14.072294+00	
00000000-0000-0000-0000-000000000000	fea7e605-7523-4626-a0da-86579d6998ee	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 16:28:14.074167+00	
00000000-0000-0000-0000-000000000000	50bd10dd-a880-4ca0-b987-ba48181b2ac6	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 16:28:39.507977+00	
00000000-0000-0000-0000-000000000000	edaec6a3-bf03-44e8-a476-c55ab01dc58f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 16:44:17.919822+00	
00000000-0000-0000-0000-000000000000	835ae304-7b8f-4034-b7b7-72eca7a393e3	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 17:03:10.256133+00	
00000000-0000-0000-0000-000000000000	65fd32ab-a415-41a8-9995-832ca2fd0091	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 21:34:24.170671+00	
00000000-0000-0000-0000-000000000000	d158d571-ddfb-4993-bbe3-b553a50421d6	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-28 21:34:24.172092+00	
00000000-0000-0000-0000-000000000000	771f31b1-cb42-428b-9142-40f79d9c8d46	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 21:36:56.375626+00	
00000000-0000-0000-0000-000000000000	0977daf9-ca7c-43b5-a328-d27b5cc1c920	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 22:08:35.250782+00	
00000000-0000-0000-0000-000000000000	34e0a09b-9b9a-4774-84d7-726e125b6669	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 22:14:02.072666+00	
00000000-0000-0000-0000-000000000000	874c2499-c5b7-4f07-8953-bbbcac6e05c6	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 22:33:18.017276+00	
00000000-0000-0000-0000-000000000000	41f319d0-ef96-49cb-9f7c-677ad73d2e21	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 22:34:02.736602+00	
00000000-0000-0000-0000-000000000000	b5817998-97b9-4f48-b7d6-91ad822cf5eb	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 23:05:57.044712+00	
00000000-0000-0000-0000-000000000000	56b616d6-6e83-4d45-b637-9137712a19c8	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-28 23:27:12.744638+00	
00000000-0000-0000-0000-000000000000	c0944861-1e44-4d6b-9b1f-83ffdfa4e357	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 09:14:58.072046+00	
00000000-0000-0000-0000-000000000000	ee773869-738f-497e-afac-de2ae350a070	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 09:14:58.072264+00	
00000000-0000-0000-0000-000000000000	fd37b029-4815-4635-8b7b-de9e859091b7	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 09:15:02.508325+00	
00000000-0000-0000-0000-000000000000	6e594428-53e7-47f4-a9ff-5b43fa0d0017	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 09:21:54.868423+00	
00000000-0000-0000-0000-000000000000	d324192d-bc34-474c-bc2f-54cd350c6db5	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 09:27:34.939392+00	
00000000-0000-0000-0000-000000000000	f9981591-c6d2-428d-94a0-cb7cd27bd799	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 10:26:11.961657+00	
00000000-0000-0000-0000-000000000000	53d64c58-0b7e-4212-b2d2-e98e9e238e88	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 10:26:11.962558+00	
00000000-0000-0000-0000-000000000000	ae57172d-4832-4302-b3b7-af5518fc1c24	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 10:26:17.811273+00	
00000000-0000-0000-0000-000000000000	b351f3ca-458b-4ded-b39d-4b7727c8ea09	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 10:27:44.527115+00	
00000000-0000-0000-0000-000000000000	bff9a2b2-6ac6-49cf-b043-a5faec5b776d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 11:15:25.140124+00	
00000000-0000-0000-0000-000000000000	b53d9923-b9b7-46c7-8efc-b89a356b3de9	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 12:13:39.189424+00	
00000000-0000-0000-0000-000000000000	a50b6c12-4aa3-41ce-9a50-8a7f36c5b490	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 12:13:39.190765+00	
00000000-0000-0000-0000-000000000000	17e00c82-3be7-439b-8b9c-5d5c4db63f1f	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 13:25:03.629705+00	
00000000-0000-0000-0000-000000000000	a25b726f-8188-4483-86ca-2f010c1d0599	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 13:25:03.630708+00	
00000000-0000-0000-0000-000000000000	0e1325c2-476b-4973-aec8-7ea9d1a79b22	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 14:45:02.629505+00	
00000000-0000-0000-0000-000000000000	566f3af3-26de-450b-88bb-9e5453840769	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 14:45:02.639786+00	
00000000-0000-0000-0000-000000000000	2bd6f09f-bf8a-44da-9b84-0deaa4c847b9	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 15:15:15.382744+00	
00000000-0000-0000-0000-000000000000	c87f3600-3274-4b3b-b512-750ee7a25187	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 16:13:29.157284+00	
00000000-0000-0000-0000-000000000000	85f823fd-e72f-4632-b51a-1604b1404d11	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 16:13:29.157763+00	
00000000-0000-0000-0000-000000000000	e595f2bd-9dd5-481c-867b-a5e5ad08cb0a	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 17:11:29.158017+00	
00000000-0000-0000-0000-000000000000	8279bfa3-aacd-4805-8673-9b7c6c0436bf	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 17:11:29.158485+00	
00000000-0000-0000-0000-000000000000	4fd52341-ffdb-49ff-85d0-8d46b2ac8f76	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 18:09:29.156062+00	
00000000-0000-0000-0000-000000000000	9187c708-3a40-402e-a5af-61fffbecda40	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 18:09:29.156453+00	
00000000-0000-0000-0000-000000000000	de92bdda-7ad3-46ae-88d4-3d741bcbd333	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 18:31:25.76781+00	
00000000-0000-0000-0000-000000000000	26f2d784-c3ca-45a6-b3f9-b8bebe2a2af2	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 18:45:31.848967+00	
00000000-0000-0000-0000-000000000000	da5a7ef8-125a-48f7-b24c-16e25f902e09	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 19:44:36.263413+00	
00000000-0000-0000-0000-000000000000	17e420cc-22dc-4818-a3e3-03fd7db37e2a	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 19:44:36.264399+00	
00000000-0000-0000-0000-000000000000	b50f334e-737a-4cfb-9220-9039b8fde7db	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 20:53:11.748211+00	
00000000-0000-0000-0000-000000000000	0568c0ec-7ae7-4264-ae61-7551355457dc	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 20:53:11.74926+00	
00000000-0000-0000-0000-000000000000	96cd3f92-d9b9-4000-be9f-033e57171166	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 20:58:03.557733+00	
00000000-0000-0000-0000-000000000000	112d84bd-74dc-44e9-9aa3-e34b53812328	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 21:05:25.510594+00	
00000000-0000-0000-0000-000000000000	52ac4da3-2848-471c-8606-a70285dcffe7	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 21:15:37.26541+00	
00000000-0000-0000-0000-000000000000	f8025d25-81b8-48a9-9c0e-c68db95408d0	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 22:13:46.827238+00	
00000000-0000-0000-0000-000000000000	658b58f7-4de3-4c25-8a01-06af05b9f3cf	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 22:13:46.82783+00	
00000000-0000-0000-0000-000000000000	d22ca927-c57d-42e6-94f3-039be5a7a4b1	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 23:11:46.825883+00	
00000000-0000-0000-0000-000000000000	7e0474e6-4c51-49c3-845c-cf855813ae05	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-29 23:11:46.826841+00	
00000000-0000-0000-0000-000000000000	d51ffd7e-7128-4057-afa1-42b96a0e52f9	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 00:09:46.82256+00	
00000000-0000-0000-0000-000000000000	9370b60d-3a5a-49b0-96c5-5267624ff4d2	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 00:09:46.823343+00	
00000000-0000-0000-0000-000000000000	95198da3-c3c3-4a56-806f-7d780074e13f	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 05:27:50.62002+00	
00000000-0000-0000-0000-000000000000	dd813de5-02c6-4a59-8d56-09f892d471ab	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 05:27:50.620994+00	
00000000-0000-0000-0000-000000000000	502f4e87-87ed-4773-8a22-9fe8098f9384	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 06:25:55.679439+00	
00000000-0000-0000-0000-000000000000	22544217-0a1e-4ca9-8fc4-dfb06f117da0	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 06:25:55.680162+00	
00000000-0000-0000-0000-000000000000	bc0709d9-9c36-4da9-ac39-5c2ae7daf86d	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 07:32:45.09014+00	
00000000-0000-0000-0000-000000000000	5fa2f8d1-b61d-4fb2-a88e-860ef554c581	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 07:32:45.091223+00	
00000000-0000-0000-0000-000000000000	9fee7d3d-ca59-482a-b64e-f1144e9552bb	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 07:33:56.755691+00	
00000000-0000-0000-0000-000000000000	ef65bb3f-a19c-4739-8c13-476fd1dbbbd9	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 08:35:15.441059+00	
00000000-0000-0000-0000-000000000000	cf745f86-5498-438d-81db-8f2e90ce58d7	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 08:35:15.441671+00	
00000000-0000-0000-0000-000000000000	83d8f216-3e28-4298-bf05-7d7f5064e99e	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 09:43:53.339374+00	
00000000-0000-0000-0000-000000000000	753f3147-c174-41ee-add1-c571fa19d544	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 09:43:53.339989+00	
00000000-0000-0000-0000-000000000000	01d0a596-8878-401a-b784-021afa880c15	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 10:41:57.803357+00	
00000000-0000-0000-0000-000000000000	c9667e5b-fcec-4711-b6b3-e2bcf64d55a0	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 10:41:57.80358+00	
00000000-0000-0000-0000-000000000000	4135b0ef-61d5-4e9a-a0aa-b4571751119e	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 11:40:23.659212+00	
00000000-0000-0000-0000-000000000000	a5ec82d5-af33-4c17-8f32-3a119867b939	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 11:40:23.659643+00	
00000000-0000-0000-0000-000000000000	9345dfd3-0f6d-414c-949d-c9117615e379	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 12:30:46.124057+00	
00000000-0000-0000-0000-000000000000	948118c5-22b6-4c56-bb95-29dabacf0ea8	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 13:09:37.115284+00	
00000000-0000-0000-0000-000000000000	2a9aedc9-917a-4b5a-b28f-a2972d355684	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 14:07:58.160784+00	
00000000-0000-0000-0000-000000000000	d984a265-7d85-47ea-bd91-71efa04c4daf	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 14:07:58.161225+00	
00000000-0000-0000-0000-000000000000	389b8cf0-385a-46e4-8d8e-ae618d0ea431	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 15:06:14.070825+00	
00000000-0000-0000-0000-000000000000	a0d03b10-4c54-4c89-b3cc-bc26431e14d3	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 15:06:14.072044+00	
00000000-0000-0000-0000-000000000000	8662c6b7-b5b5-49f0-a0f6-f587763b6e7a	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 16:04:18.14504+00	
00000000-0000-0000-0000-000000000000	0c87c9e1-b5a4-495e-82ab-2f0753f14575	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 16:04:18.146074+00	
00000000-0000-0000-0000-000000000000	55b394e6-e9aa-4137-ad87-56b55f105ff6	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 17:02:44.066069+00	
00000000-0000-0000-0000-000000000000	da080107-3e00-457f-8406-d3b4f72e7d94	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 17:02:44.0666+00	
00000000-0000-0000-0000-000000000000	7c8fb621-e95c-456f-bd56-98cf2220d955	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 18:00:44.065589+00	
00000000-0000-0000-0000-000000000000	9131f342-ec23-48b8-91c3-d051e8541c96	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 18:00:44.066244+00	
00000000-0000-0000-0000-000000000000	b190d5c5-ebd0-4d1c-8139-a12c00d90a78	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 18:59:13.119225+00	
00000000-0000-0000-0000-000000000000	fe9bf4d3-e5ba-4133-b7f3-4000b31f2e3e	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 18:59:13.119421+00	
00000000-0000-0000-0000-000000000000	91b70bed-1a48-4b3b-8277-c7b5c4b89214	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 19:04:19.575367+00	
00000000-0000-0000-0000-000000000000	aaf1a757-fd91-4f87-b709-a5397a4af21f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 19:09:28.837561+00	
00000000-0000-0000-0000-000000000000	1b7260e2-300d-4f31-a6f8-f67b5f786acc	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 19:13:59.525717+00	
00000000-0000-0000-0000-000000000000	75bb26c9-dccb-4639-8317-5bd658a857f7	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 20:12:12.933125+00	
00000000-0000-0000-0000-000000000000	3ab33fee-137a-47c8-b5e9-46340c54766c	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 20:12:12.934248+00	
00000000-0000-0000-0000-000000000000	7bfb9a6e-56fd-4201-8820-25c411834d0b	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 21:10:12.912089+00	
00000000-0000-0000-0000-000000000000	066d194b-f2ba-4b2a-8baa-5e9a26ba96c0	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 21:10:12.913071+00	
00000000-0000-0000-0000-000000000000	37c19896-3903-4fb9-807e-b2a2aadfd1b5	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 22:08:12.913579+00	
00000000-0000-0000-0000-000000000000	fc6a50b2-da7b-4ca5-8cd4-d4e78f9ee958	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-30 22:08:12.914754+00	
00000000-0000-0000-0000-000000000000	26c5a569-8157-4b20-ace2-7481fc6fcfd0	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 22:47:16.591356+00	
00000000-0000-0000-0000-000000000000	7bcffc51-689f-4e3e-ac7f-911f0f3c766d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 22:55:59.451777+00	
00000000-0000-0000-0000-000000000000	ac5d31af-cb45-439c-8c4c-7ab8c7cc7b9f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 23:23:16.693477+00	
00000000-0000-0000-0000-000000000000	f5f3cff9-45d1-4636-9cde-4b400c824ad5	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 23:51:01.693114+00	
00000000-0000-0000-0000-000000000000	372b29e5-4daf-47f2-96a7-c1a4ab6c7b7f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 23:54:01.729083+00	
00000000-0000-0000-0000-000000000000	6ebbc29d-75c4-4596-9108-0da07580de06	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 00:05:32.736155+00	
00000000-0000-0000-0000-000000000000	43e79cdb-0693-4cd2-be8f-e830cfc33e38	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 07:20:13.996091+00	
00000000-0000-0000-0000-000000000000	ef7c12e2-b566-47cd-a818-d7026f20f1f0	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 07:20:13.998727+00	
00000000-0000-0000-0000-000000000000	45cedafc-2662-46f0-8bc5-d9ba8e95cccd	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 07:20:30.51982+00	
00000000-0000-0000-0000-000000000000	ff933275-b38e-421e-916b-8f487678f992	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 07:38:42.758562+00	
00000000-0000-0000-0000-000000000000	b5b16662-ed46-4f9e-a46d-025adf29458b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 08:26:33.42968+00	
00000000-0000-0000-0000-000000000000	c1a51526-16e0-4446-bda4-6a319fb41e38	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 09:11:43.795408+00	
00000000-0000-0000-0000-000000000000	ab544428-ead2-4d91-a0c0-1d3297e7664a	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 10:10:12.464698+00	
00000000-0000-0000-0000-000000000000	c11a560e-930d-46ae-b3c3-6557ee03ce92	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 10:10:12.465419+00	
00000000-0000-0000-0000-000000000000	877a2d1e-4652-4785-a676-04c7bbb165df	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 11:08:12.464495+00	
00000000-0000-0000-0000-000000000000	2347d645-c20e-4495-9e87-a34eebf1e1ab	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 11:08:12.465079+00	
00000000-0000-0000-0000-000000000000	2dfdad05-58cb-4fab-a546-5874c84f6036	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 12:06:12.465497+00	
00000000-0000-0000-0000-000000000000	49b1e6e5-75e0-44e9-aaab-317239f7a0d8	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 12:06:12.466019+00	
00000000-0000-0000-0000-000000000000	7266de61-0c0a-4ce3-8e82-aa8da753b8c7	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 13:04:12.464213+00	
00000000-0000-0000-0000-000000000000	2532dc74-f0ee-4039-ba74-bc7a8c2a5675	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 13:04:12.464767+00	
00000000-0000-0000-0000-000000000000	76bdb376-cb7b-478a-9a7f-f0a27949d2b4	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 14:02:12.464694+00	
00000000-0000-0000-0000-000000000000	d456d605-257d-4e09-b3e9-e86d46cff69e	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 14:02:12.465325+00	
00000000-0000-0000-0000-000000000000	ec01b20b-9b2f-4e0e-a727-b87d3d776891	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 15:00:12.464308+00	
00000000-0000-0000-0000-000000000000	17cd20e9-fcf5-4078-bac4-d615aae306d0	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 15:00:12.464739+00	
00000000-0000-0000-0000-000000000000	4f7b22d9-f660-4cfa-849a-94d7180723d3	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 15:58:12.465163+00	
00000000-0000-0000-0000-000000000000	834dea69-3946-4678-8e56-5b5cf8806150	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 15:58:12.465747+00	
00000000-0000-0000-0000-000000000000	fd447b6e-5240-40fb-861b-e6499137ff61	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 16:56:12.464329+00	
00000000-0000-0000-0000-000000000000	122948df-80a0-41f7-9215-ce84a1d47ed9	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 16:56:12.465066+00	
00000000-0000-0000-0000-000000000000	8ec63cd8-8256-4ea8-96cc-58ebbee1d228	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 17:54:12.464056+00	
00000000-0000-0000-0000-000000000000	d4148289-db49-4d66-9960-8bc4fdfae6ba	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 17:54:12.464773+00	
00000000-0000-0000-0000-000000000000	151695ec-a22f-4eaf-9826-107f3e63aea4	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 18:52:12.451874+00	
00000000-0000-0000-0000-000000000000	851ec5aa-be89-4ff6-b122-49392afba97b	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-05-31 18:52:12.452057+00	
00000000-0000-0000-0000-000000000000	5aa47834-9ac6-43bd-a5f0-5edcfdbc7717	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 19:36:53.974773+00	
00000000-0000-0000-0000-000000000000	00fae37f-b05a-47eb-99d7-f8013df3e651	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 19:41:10.54476+00	
00000000-0000-0000-0000-000000000000	379a1f14-3cb1-439d-87b6-61facdcb09e4	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 19:42:53.10807+00	
00000000-0000-0000-0000-000000000000	8ebde517-4246-4fe4-be57-34e4652b8a7b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 19:46:53.867261+00	
00000000-0000-0000-0000-000000000000	915fdd43-c34a-44ca-b184-26a308cbc2b9	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 19:48:38.613637+00	
00000000-0000-0000-0000-000000000000	ecdad9ff-56c6-44e5-bf06-0668f38b68bd	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 19:50:02.594955+00	
00000000-0000-0000-0000-000000000000	db5c0858-7342-42c0-aebf-723df11387a1	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 19:51:39.294527+00	
00000000-0000-0000-0000-000000000000	25890621-e5dd-4cd3-976a-77664b5b128b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 19:55:02.112457+00	
00000000-0000-0000-0000-000000000000	4cd1f900-f6cc-410c-9464-a4800b611413	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 20:08:47.028137+00	
00000000-0000-0000-0000-000000000000	b00a11c4-90b2-4444-958b-5e526b69dc27	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 20:10:09.098977+00	
00000000-0000-0000-0000-000000000000	3024920c-2f98-4a3f-adca-c4ce091557b1	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 20:11:40.574986+00	
00000000-0000-0000-0000-000000000000	3d9260a5-972f-4cf6-a03c-006eca153f8a	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 20:11:43.516789+00	
00000000-0000-0000-0000-000000000000	f4c610b9-5e00-460f-82c2-8785b91ce695	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 20:11:45.108495+00	
00000000-0000-0000-0000-000000000000	49c3e7f8-966c-44e4-8229-aac777bbfcd1	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-05-31 20:18:10.860906+00	
00000000-0000-0000-0000-000000000000	3f6602fa-574d-4c5e-ac43-4f2af33e33b1	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 20:19:12.022742+00	
00000000-0000-0000-0000-000000000000	c02d4cf3-e94f-495b-a4f3-d9026a8e55d3	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 20:19:33.044855+00	
00000000-0000-0000-0000-000000000000	2daf0448-c326-4746-b568-afdc6d5605c3	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 20:22:03.026437+00	
00000000-0000-0000-0000-000000000000	d688394c-bbfb-4b5e-a30a-1a40c9041143	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 21:07:51.666656+00	
00000000-0000-0000-0000-000000000000	ebaee16f-6979-4965-8831-e3ba3e3f6b98	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 21:13:58.998599+00	
00000000-0000-0000-0000-000000000000	b6c833e0-fd80-4d83-b41b-1c590b8c4f26	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 21:24:21.331987+00	
00000000-0000-0000-0000-000000000000	e26fe6c3-085f-44c4-b3d2-672c45e5f51f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 21:57:48.704617+00	
00000000-0000-0000-0000-000000000000	c58db6a4-e967-4c6c-baee-0a0f70853fa8	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 22:39:58.163009+00	
00000000-0000-0000-0000-000000000000	c1adc8c6-2bc1-46eb-9f77-8046acae8bf2	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 13:40:46.220635+00	
00000000-0000-0000-0000-000000000000	126a2dde-517f-4fcc-ba47-1366fe39ed01	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 13:40:46.222244+00	
00000000-0000-0000-0000-000000000000	0971a53d-6e98-4352-a207-3dba2f2a8de1	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-01 13:40:57.370525+00	
00000000-0000-0000-0000-000000000000	42a172f8-dd2d-4e42-9f7b-b8cd34c9b09b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-01 14:05:56.597803+00	
00000000-0000-0000-0000-000000000000	14455d8b-6a3f-40f9-b3f4-789ad59d0a57	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-01 14:49:40.783+00	
00000000-0000-0000-0000-000000000000	180ae227-9a40-4fcd-8c41-1183f49c0b04	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 17:19:20.468151+00	
00000000-0000-0000-0000-000000000000	3d7a0f45-a171-4619-847e-7f159a7f5efb	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 17:19:20.469509+00	
00000000-0000-0000-0000-000000000000	899bd8a5-6baa-4362-a2c1-c768260392ba	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-01 17:19:34.108174+00	
00000000-0000-0000-0000-000000000000	297d58e2-0c2e-47c1-850f-fba377328a8f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-01 17:43:39.149066+00	
00000000-0000-0000-0000-000000000000	86e6b879-7503-4d57-8238-7769fcecfae2	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-01 18:18:09.32541+00	
00000000-0000-0000-0000-000000000000	b433b387-b436-49a0-a533-1b32551205e3	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-01 18:35:04.874836+00	
00000000-0000-0000-0000-000000000000	cbf448cd-26e8-4570-b1a0-d01bbacc7f78	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-01 18:35:06.771909+00	
00000000-0000-0000-0000-000000000000	37375bf5-800f-4e0f-8d54-d16ef4a6f3f6	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 19:33:08.929529+00	
00000000-0000-0000-0000-000000000000	284f3dc9-2d2c-4711-b518-20f146df795a	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 19:33:08.930069+00	
00000000-0000-0000-0000-000000000000	8298ecd7-d5f1-4791-b7e1-3b4516f3baca	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 20:45:01.420185+00	
00000000-0000-0000-0000-000000000000	297013b3-68fb-47ab-a131-d8123505ef7a	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 20:45:01.421275+00	
00000000-0000-0000-0000-000000000000	5eb75288-8a65-49e0-bb53-730b5b86e89e	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 21:44:06.629751+00	
00000000-0000-0000-0000-000000000000	39788894-04da-4b16-babd-87ef1efbf11c	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 21:44:06.630853+00	
00000000-0000-0000-0000-000000000000	6585ad47-e482-4a99-8093-bee8963df7e1	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 22:42:16.738057+00	
00000000-0000-0000-0000-000000000000	2da5133b-86bf-4e28-b87a-38ad8fad91be	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 22:42:16.738507+00	
00000000-0000-0000-0000-000000000000	a01e9d85-5719-42c7-97a0-4e2f75cfc77c	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 23:40:16.736665+00	
00000000-0000-0000-0000-000000000000	5e6569b9-3b3a-4ed0-abff-98a4051df682	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-01 23:40:16.737449+00	
00000000-0000-0000-0000-000000000000	44b2af0a-da19-45e8-8041-b2130053a1f6	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 00:38:16.737135+00	
00000000-0000-0000-0000-000000000000	0af5597c-a664-4967-a1da-b7b75fad6b07	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 00:38:16.737544+00	
00000000-0000-0000-0000-000000000000	34c4d788-f992-4876-847c-72044e0341c9	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 01:36:16.737753+00	
00000000-0000-0000-0000-000000000000	1a04e6b7-925b-469c-bd73-3b88a8e16fd7	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 01:36:16.738441+00	
00000000-0000-0000-0000-000000000000	554a6fba-cef4-4fdc-9478-653c10dfeb2f	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 02:34:16.738901+00	
00000000-0000-0000-0000-000000000000	74cccdbd-34e9-41a2-ad28-6d262b8d53b3	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 02:34:16.7395+00	
00000000-0000-0000-0000-000000000000	0cbf4114-b936-4f6d-89bf-50d768259845	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 03:32:16.735316+00	
00000000-0000-0000-0000-000000000000	f8e1c5fb-d11d-4a8c-b72b-688c242c6e72	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 03:32:16.735757+00	
00000000-0000-0000-0000-000000000000	46285c22-f550-49e6-ab9e-b9f439403ea2	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 04:30:16.727281+00	
00000000-0000-0000-0000-000000000000	326bd70a-694f-4a77-af86-ff3e545c4c30	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 04:30:16.727455+00	
00000000-0000-0000-0000-000000000000	733d77b6-8cfc-4b37-8c0b-d4f9a3d42696	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 05:28:16.741076+00	
00000000-0000-0000-0000-000000000000	1cc03655-71e6-4b30-a463-0ff7f67de3d4	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 05:28:16.742028+00	
00000000-0000-0000-0000-000000000000	1e760bbf-77c7-499f-b695-b6c8aad7a51e	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 06:26:16.737191+00	
00000000-0000-0000-0000-000000000000	fedd25d1-cd13-4863-a777-de0e3e1c43bd	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 06:26:16.737913+00	
00000000-0000-0000-0000-000000000000	081436e0-8152-4441-93d7-51c3bb1a239e	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 07:24:43.045572+00	
00000000-0000-0000-0000-000000000000	a6c4af2b-86cb-44e6-9376-b8baa9684494	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 07:24:43.046456+00	
00000000-0000-0000-0000-000000000000	87c538b8-aa7b-42ae-a571-b4e37de1b439	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 08:08:01.147077+00	
00000000-0000-0000-0000-000000000000	260a2c15-8037-4d3e-8fec-a18edb947434	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 08:19:38.971789+00	
00000000-0000-0000-0000-000000000000	0de9769d-6b6e-4fc1-8f59-dba024e47fd2	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 08:42:28.960798+00	
00000000-0000-0000-0000-000000000000	6eab160c-a39d-4517-8970-6b9d60cfd8ba	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 09:19:47.528506+00	
00000000-0000-0000-0000-000000000000	79c77d3f-0882-4806-8705-906c16f937e8	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 09:35:43.825461+00	
00000000-0000-0000-0000-000000000000	71b1ecaa-bf46-40f9-9b93-fb2b0def37f7	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 09:35:45.327181+00	
00000000-0000-0000-0000-000000000000	14e85a2b-5aeb-46e7-a2ce-f3807b5e6079	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 09:48:29.455526+00	
00000000-0000-0000-0000-000000000000	7c5f7068-8c38-4b78-a2ea-e7a6b193ff42	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 10:10:22.376875+00	
00000000-0000-0000-0000-000000000000	761be7c8-b827-40eb-b82a-7611640fdb6b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 10:16:25.955605+00	
00000000-0000-0000-0000-000000000000	ff2e2594-47d0-4d11-8c5c-cfbeb40ad555	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 10:22:25.148846+00	
00000000-0000-0000-0000-000000000000	626cec9b-dcac-4df5-8e98-a006e0f01ced	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 11:20:49.93987+00	
00000000-0000-0000-0000-000000000000	9711cb16-a108-43a1-a603-6fefe8f79d20	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 11:20:49.940328+00	
00000000-0000-0000-0000-000000000000	1fbd4b86-99a9-4898-80a4-6b599e5324b5	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 12:04:29.490419+00	
00000000-0000-0000-0000-000000000000	4cbbc736-67bf-4667-abfe-5c7d8176b7a1	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 13:02:36.591573+00	
00000000-0000-0000-0000-000000000000	d871b08a-9750-4666-b482-f2524848506a	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 13:02:36.592214+00	
00000000-0000-0000-0000-000000000000	737290f4-6d1a-497a-b083-0c21c0a68f6d	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 14:01:02.723262+00	
00000000-0000-0000-0000-000000000000	5926ab54-db60-4bf0-b96e-6e67bcdaadca	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 14:01:02.724248+00	
00000000-0000-0000-0000-000000000000	fb8a703f-4f5d-48bf-b0ce-af2eb05103c7	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 14:59:03.757097+00	
00000000-0000-0000-0000-000000000000	0b53fd58-ea67-4ef2-b3bf-d2ebd3b7178b	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 14:59:03.758104+00	
00000000-0000-0000-0000-000000000000	3902a30b-805a-42b4-aacc-18230a0bad1c	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 15:57:10.179761+00	
00000000-0000-0000-0000-000000000000	25b929ce-0c1b-4655-9543-3e0c5dbac301	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 15:57:10.180184+00	
00000000-0000-0000-0000-000000000000	9023f335-cd62-4206-9160-3d63d7876c28	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 16:55:21.859694+00	
00000000-0000-0000-0000-000000000000	2e6bd0ae-31ce-4faf-a68d-8b8cc21f4d43	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 16:55:21.860102+00	
00000000-0000-0000-0000-000000000000	09e18a8d-e0f3-4a90-8b24-bef1143bfd11	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 17:53:40.189439+00	
00000000-0000-0000-0000-000000000000	150b142e-be54-4246-b956-696011594d35	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 17:53:40.190497+00	
00000000-0000-0000-0000-000000000000	985f31bc-55dc-4aa7-a09e-d149fb8f2b04	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 18:51:40.18568+00	
00000000-0000-0000-0000-000000000000	91fc7df9-92a0-4a0c-b09b-ff3fd051bc6d	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 18:51:40.186263+00	
00000000-0000-0000-0000-000000000000	bcc1725e-c459-4819-81ac-b296c7c555c9	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-02 19:22:16.739431+00	
00000000-0000-0000-0000-000000000000	efd21931-b057-40ad-855b-8315af343f6d	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 20:20:18.196654+00	
00000000-0000-0000-0000-000000000000	8584afa7-fe73-487c-8428-8c6881eb145f	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 20:20:18.197314+00	
00000000-0000-0000-0000-000000000000	320cac6f-eb42-422e-bdb0-4fb943672e2c	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 21:18:48.012314+00	
00000000-0000-0000-0000-000000000000	4f1e7670-f49a-43e9-9b2f-5445e11e712d	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-02 21:18:48.013322+00	
00000000-0000-0000-0000-000000000000	5678e873-963f-4014-9d02-4d42f2ace74e	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 06:36:13.068003+00	
00000000-0000-0000-0000-000000000000	a64dd1f5-a754-43c7-b22c-2c73757ee0f6	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 06:36:13.069463+00	
00000000-0000-0000-0000-000000000000	6f40e2dc-208b-4b8c-bb96-e0e0d7a6713a	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 08:41:19.252985+00	
00000000-0000-0000-0000-000000000000	1f0fac92-3894-442f-81ec-fa375d7300fe	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 08:41:19.253332+00	
00000000-0000-0000-0000-000000000000	af062e25-3aa0-43b3-b081-71b3a5bd0b68	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 08:53:38.908269+00	
00000000-0000-0000-0000-000000000000	d2cc5fa2-05c1-4499-868e-f7483b966fbf	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 09:22:31.955339+00	
00000000-0000-0000-0000-000000000000	84797426-9ad2-4820-9656-4275f148c2a0	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 09:35:17.220443+00	
00000000-0000-0000-0000-000000000000	29f66c3a-ae55-4f4b-986b-7bc11b9a8434	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 09:37:24.680554+00	
00000000-0000-0000-0000-000000000000	8d5a662a-1cc0-4e25-8fb5-478c3b0a767e	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 09:39:18.057363+00	
00000000-0000-0000-0000-000000000000	eb33fc2e-9f79-4f31-8be6-36e961bffa86	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 09:39:22.790651+00	
00000000-0000-0000-0000-000000000000	aa0e4ea7-3908-4989-a2dc-552f38660677	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 09:46:08.35103+00	
00000000-0000-0000-0000-000000000000	bcca9b01-2518-46b2-a49a-82eac4885f53	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 09:51:54.865811+00	
00000000-0000-0000-0000-000000000000	0a6309bc-883f-4618-ba5a-feb0edce0a28	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 10:50:23.296214+00	
00000000-0000-0000-0000-000000000000	ea9ed1d7-cc68-4092-b91f-b9dca1dd7691	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 10:50:23.29682+00	
00000000-0000-0000-0000-000000000000	6b346ba9-b3ea-4c78-9f5f-996bacee570d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 11:06:01.6026+00	
00000000-0000-0000-0000-000000000000	ed18ad9a-b5a7-4d8a-a037-71d31b53c132	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-03 11:31:30.495145+00	
00000000-0000-0000-0000-000000000000	ee8fe2af-8744-4a24-a40a-285e09d2066d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 11:36:58.221428+00	
00000000-0000-0000-0000-000000000000	28cc943e-8803-44e1-a187-2bc2c5860bf3	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-03 11:37:21.479661+00	
00000000-0000-0000-0000-000000000000	37f221ea-cf13-4651-81cf-b3af15594b51	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 11:40:34.599155+00	
00000000-0000-0000-0000-000000000000	90245ca3-54f6-4a30-9fce-73f146fee32b	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-03 11:40:36.829991+00	
00000000-0000-0000-0000-000000000000	b7fd1f9f-8c2a-4032-8229-2997544f5f39	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 11:41:40.121824+00	
00000000-0000-0000-0000-000000000000	f51c0bd0-5156-4173-b456-c7786dba5a29	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-03 11:41:42.831+00	
00000000-0000-0000-0000-000000000000	d9f3b379-0c4b-48fc-a04d-168b3ba08394	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 11:43:02.167197+00	
00000000-0000-0000-0000-000000000000	68ba3441-3ef2-4c89-9c40-cf9d623d7ff1	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-03 11:43:10.595189+00	
00000000-0000-0000-0000-000000000000	67e950c9-dd3b-4c5d-967f-113dd76be92f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 11:43:13.856966+00	
00000000-0000-0000-0000-000000000000	0d5ea090-201d-438c-b93d-ab38740555a1	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-03 11:43:54.771798+00	
00000000-0000-0000-0000-000000000000	b98973b3-b3ad-4ba1-8ed3-3120c2675997	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 11:44:02.20909+00	
00000000-0000-0000-0000-000000000000	ce230782-de22-445a-b8c5-199682acf8bb	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-03 11:44:05.804069+00	
00000000-0000-0000-0000-000000000000	3b70ba23-357d-45f6-96e8-a62cfae9343b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 11:48:24.436354+00	
00000000-0000-0000-0000-000000000000	86bcfbb6-cba8-4ac6-a65b-52738b416c03	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-03 11:48:36.302933+00	
00000000-0000-0000-0000-000000000000	77da821d-12fa-4806-81c5-e8fa1b411f13	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 11:59:43.682861+00	
00000000-0000-0000-0000-000000000000	e48205c0-83e6-416e-a0de-0e15f6d88a1e	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-03 11:59:48.296173+00	
00000000-0000-0000-0000-000000000000	430da126-061c-4109-8c5c-a39701bd6379	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 12:01:43.005042+00	
00000000-0000-0000-0000-000000000000	f303d7cc-37d5-4a48-8ef4-91f9ea1e4485	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 12:59:49.595169+00	
00000000-0000-0000-0000-000000000000	6e33545c-62aa-45e2-a001-103d2b44d67e	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 12:59:49.595466+00	
00000000-0000-0000-0000-000000000000	ac198606-e6dc-446b-a4aa-2507e58a1d1e	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 13:04:33.964414+00	
00000000-0000-0000-0000-000000000000	a3e3e3b5-491a-45af-98b7-5f2337c7aec3	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 13:12:05.093356+00	
00000000-0000-0000-0000-000000000000	270ceb71-300f-44d9-ab70-6c29e7f16df4	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 14:10:21.757757+00	
00000000-0000-0000-0000-000000000000	4bbc8b3e-9157-470d-8db9-90969380fa83	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 14:10:21.75826+00	
00000000-0000-0000-0000-000000000000	5130cf67-6755-4f7a-81fa-178368229e78	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 14:15:56.468824+00	
00000000-0000-0000-0000-000000000000	608922a1-315c-4974-87e8-ecb14cf2bae7	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-03 14:25:30.082254+00	
00000000-0000-0000-0000-000000000000	23663cec-256e-4601-a8d9-19ae123be558	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 14:27:48.78002+00	
00000000-0000-0000-0000-000000000000	2afccd2e-87e2-46c9-b8c0-a4b77522b7c8	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 14:31:27.639497+00	
00000000-0000-0000-0000-000000000000	dbbb0a74-b4b7-447f-8634-a4317d7e6761	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 17:54:20.649627+00	
00000000-0000-0000-0000-000000000000	2ef1dab5-617d-4bc1-818c-ad81de8eaba9	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 17:54:20.650146+00	
00000000-0000-0000-0000-000000000000	f103bdfe-e2be-46ff-a0ce-386fa305518d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 17:54:37.064888+00	
00000000-0000-0000-0000-000000000000	75fcb1b3-a141-42c2-8aa4-f078815f3ca6	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-03 17:55:22.084931+00	
00000000-0000-0000-0000-000000000000	1dc0b7ce-5d11-4b60-87a2-37c9290d27f7	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 17:55:41.605364+00	
00000000-0000-0000-0000-000000000000	010342b0-9365-4c34-8341-27aa19cf20d9	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 18:54:14.502677+00	
00000000-0000-0000-0000-000000000000	6e4e0873-f8db-4a04-9945-480a8f0788c2	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 18:54:14.503287+00	
00000000-0000-0000-0000-000000000000	63e47703-d509-4235-8e15-98abfca41bba	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 19:25:57.008926+00	
00000000-0000-0000-0000-000000000000	ff1d30e0-064e-4894-9f84-f28a552190e5	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 21:28:16.886913+00	
00000000-0000-0000-0000-000000000000	1424f731-abc7-429e-a297-140b44c0c301	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 21:28:16.888166+00	
00000000-0000-0000-0000-000000000000	99c0d4e0-62d8-4830-90a3-b2585f00fa10	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 21:28:20.366984+00	
00000000-0000-0000-0000-000000000000	4125aa17-bf3a-44a6-806d-1867963df7b8	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 21:47:23.652956+00	
00000000-0000-0000-0000-000000000000	87035b49-e19a-492f-9a23-fd856d5bcab7	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-03 22:36:20.253572+00	
00000000-0000-0000-0000-000000000000	b937ebac-5b73-4283-b696-de55a9d86378	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 23:34:48.496294+00	
00000000-0000-0000-0000-000000000000	285ccad5-1c4e-4b43-8f81-3570c3693612	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-03 23:34:48.497274+00	
00000000-0000-0000-0000-000000000000	014851c3-46a6-483c-b5bd-e6ca9964dc42	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 14:53:09.894804+00	
00000000-0000-0000-0000-000000000000	3562e1b5-1e18-4b56-a31b-0f987fe436b1	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 14:53:09.895809+00	
00000000-0000-0000-0000-000000000000	6bcdf158-65c2-47b7-bd67-9c0dd5fac420	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-04 14:53:13.446968+00	
00000000-0000-0000-0000-000000000000	c9f3741b-eec4-4a2e-a9bf-af6084f7689e	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-04 14:54:33.696703+00	
00000000-0000-0000-0000-000000000000	8865eae1-8172-4f84-9d2d-7dbde9a14250	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-04 14:55:30.11288+00	
00000000-0000-0000-0000-000000000000	c8292821-adda-4563-a57e-c434514a9bff	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-04 15:04:01.765585+00	
00000000-0000-0000-0000-000000000000	9d94ccc0-2623-4100-9b8d-fe553509d238	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-04 15:28:17.046663+00	
00000000-0000-0000-0000-000000000000	7814485b-f9e5-444b-b78b-3999dcad3a9d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-04 15:46:08.025257+00	
00000000-0000-0000-0000-000000000000	7ea71139-40e9-4de7-ae49-82a147c6e06a	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 16:44:16.977425+00	
00000000-0000-0000-0000-000000000000	124f6e2a-ceac-48a8-a64c-1b5221190234	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 16:44:16.978049+00	
00000000-0000-0000-0000-000000000000	69f0ccdf-fef2-412c-9909-abb2beaa7e22	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 17:42:16.980511+00	
00000000-0000-0000-0000-000000000000	d9cc97c6-2153-40a0-8705-4cd7f2bc9568	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 17:42:16.981105+00	
00000000-0000-0000-0000-000000000000	83de9dcb-af01-4336-813d-ff33e026ecd5	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 18:40:16.982453+00	
00000000-0000-0000-0000-000000000000	d3312ede-967f-4355-90a0-e284bf0f248c	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 18:40:16.982881+00	
00000000-0000-0000-0000-000000000000	7270a606-783f-47d2-87f7-ce73ebb80838	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 19:38:16.981567+00	
00000000-0000-0000-0000-000000000000	883052e8-723c-4f3c-a5ab-2e5381979e34	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 19:38:16.982246+00	
00000000-0000-0000-0000-000000000000	06d7c5ad-93d8-45b4-9106-2ef724b259ad	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 22:09:28.656131+00	
00000000-0000-0000-0000-000000000000	aa89b912-fb53-4740-9c6c-5c3f7927dd80	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-04 22:09:28.656659+00	
00000000-0000-0000-0000-000000000000	21166660-4f18-49e4-b3b8-a4a0f8bbebd6	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-04 22:09:40.040586+00	
00000000-0000-0000-0000-000000000000	81056330-a372-4194-90e1-2a5ae3993b7c	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 06:32:21.464234+00	
00000000-0000-0000-0000-000000000000	e540e93c-f60f-499d-a372-a3875c673431	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 06:32:21.465563+00	
00000000-0000-0000-0000-000000000000	ca65ad2f-ff4c-4283-a4b0-72086a3b9321	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-12 06:33:04.53914+00	
00000000-0000-0000-0000-000000000000	366d9ab7-165d-4d4a-8d0c-d60def041afa	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-12 07:13:29.519028+00	
00000000-0000-0000-0000-000000000000	65afc823-6a63-459f-921a-fcbb925c8e20	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-12 07:29:13.047649+00	
00000000-0000-0000-0000-000000000000	7dc65738-a9b5-4b55-91a0-fe880d4f4a0e	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-12 08:14:08.171446+00	
00000000-0000-0000-0000-000000000000	02d2e7f9-4bf2-42da-a9f8-b15a7541fb33	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-12 08:57:28.328501+00	
00000000-0000-0000-0000-000000000000	814f70a8-407c-4a54-a1f4-7d4b7e8c2f14	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 09:55:31.447288+00	
00000000-0000-0000-0000-000000000000	4032140f-56c6-45c7-88ec-eef4519a116b	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 09:55:31.447619+00	
00000000-0000-0000-0000-000000000000	64495703-9497-41e5-8926-36ebb95ebd8f	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 10:53:50.752065+00	
00000000-0000-0000-0000-000000000000	32e38f04-fb07-4fb5-adb0-3cc6b5743757	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 10:53:50.752616+00	
00000000-0000-0000-0000-000000000000	53333c58-2a3d-420b-9b77-e9463575e643	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 11:52:18.616082+00	
00000000-0000-0000-0000-000000000000	54fb8a89-31a3-4fbb-b6d8-798e00b5c306	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 11:52:18.616613+00	
00000000-0000-0000-0000-000000000000	1e5ab43e-aaf1-480a-b7e8-8f01695e30e2	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 12:50:20.233492+00	
00000000-0000-0000-0000-000000000000	95618ecc-7064-4820-b94a-a0b7d1513963	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 12:50:20.23394+00	
00000000-0000-0000-0000-000000000000	e7e133b6-49ac-4ca6-b01f-86a6e877be20	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 13:48:20.225385+00	
00000000-0000-0000-0000-000000000000	0e5bc4f4-1194-46ec-9726-451759e2f93b	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 13:48:20.22572+00	
00000000-0000-0000-0000-000000000000	124d7730-27e2-4661-bd0b-895a0822690a	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 18:29:11.345242+00	
00000000-0000-0000-0000-000000000000	9526404c-1a99-4d95-bfcf-6bf30ddedbfd	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 18:29:11.34562+00	
00000000-0000-0000-0000-000000000000	70d66cbd-3ae3-499d-93eb-260e77a4b6f6	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-12 19:00:22.872144+00	
00000000-0000-0000-0000-000000000000	14f5598e-193f-43d0-ad7f-8f663388ca25	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 21:16:19.119345+00	
00000000-0000-0000-0000-000000000000	f37f7b22-9d12-4f3d-a8ce-b0e52dbd2c7d	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-12 21:16:19.120797+00	
00000000-0000-0000-0000-000000000000	8cc31471-0257-49e7-a231-d7f16f29998d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-12 21:16:29.200904+00	
00000000-0000-0000-0000-000000000000	cea27d18-2ec5-4c29-b909-dd6b6615c9f8	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-12 21:38:03.148318+00	
00000000-0000-0000-0000-000000000000	2f394370-48cf-43c7-a830-744783e8cc92	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-12 21:47:20.346028+00	
00000000-0000-0000-0000-000000000000	0f52f93e-61e4-432c-81b4-7d87f66c39f8	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 06:34:35.593653+00	
00000000-0000-0000-0000-000000000000	5fe86e4e-36d4-4880-bd2e-f6911acb2b7e	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 06:34:35.594533+00	
00000000-0000-0000-0000-000000000000	dc231266-9903-4ce2-a5a8-1ae9cbfcd753	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-13 06:38:06.102856+00	
00000000-0000-0000-0000-000000000000	2b0b649d-3c26-4a64-be82-21d4874da278	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-13 07:28:04.152603+00	
00000000-0000-0000-0000-000000000000	bae1d416-382e-439a-b19c-22647642eb77	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-13 07:28:55.528928+00	
00000000-0000-0000-0000-000000000000	02c89bf5-1d6f-4920-a991-8555e03577c3	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-13 07:34:40.155251+00	
00000000-0000-0000-0000-000000000000	cc9d5042-194c-42ee-9da5-d90f851d1766	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 08:32:42.826309+00	
00000000-0000-0000-0000-000000000000	c039d943-1d58-4bc2-86c5-6323b15e09e6	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 08:32:42.826968+00	
00000000-0000-0000-0000-000000000000	834e3556-71e6-4e11-bd9a-29c6283d7b6d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-13 08:39:57.591146+00	
00000000-0000-0000-0000-000000000000	b6c8d7d4-929e-492f-8c8b-898d69a880ad	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 09:38:11.316049+00	
00000000-0000-0000-0000-000000000000	f47cae81-53f2-4a85-86dd-b3169fb9a86c	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 09:38:11.316969+00	
00000000-0000-0000-0000-000000000000	d5495c02-bbc8-4b36-8c8f-c984f47d8a5b	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-13 10:27:14.693628+00	
00000000-0000-0000-0000-000000000000	60a9cdb7-867d-4bd2-9a55-b2685afd2d43	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-13 10:52:17.424073+00	
00000000-0000-0000-0000-000000000000	eeee551d-324d-4310-b856-ec984c7594bb	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-13 11:09:59.853255+00	
00000000-0000-0000-0000-000000000000	19f49136-17b5-4a87-b6ae-bcf399eb7085	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 13:40:16.841448+00	
00000000-0000-0000-0000-000000000000	74aa889c-4cf6-462d-bba1-4a1da165fc74	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 13:40:16.842448+00	
00000000-0000-0000-0000-000000000000	e8d2b6d6-e48b-4f25-a92a-9175af0ee2b6	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 14:38:51.17969+00	
00000000-0000-0000-0000-000000000000	6cc69316-2c00-4883-abd1-1147e1d04248	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 14:38:51.179996+00	
00000000-0000-0000-0000-000000000000	4b08219d-a24a-4817-ae65-394e41937dc4	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 15:37:20.529647+00	
00000000-0000-0000-0000-000000000000	8ca12254-d1ff-4a3f-8a09-1b4126876b62	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 15:37:20.530407+00	
00000000-0000-0000-0000-000000000000	ed539ff7-3017-4f61-9800-c23f19577001	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 19:43:51.135683+00	
00000000-0000-0000-0000-000000000000	f4b7a0a4-fc4f-4588-a2d2-69942da1957a	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 19:43:51.136307+00	
00000000-0000-0000-0000-000000000000	ecfea758-acc4-4e3e-9572-96db4f160b9c	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 20:42:11.381398+00	
00000000-0000-0000-0000-000000000000	22f77fef-259e-4c8d-9fa4-161551bc8569	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 20:42:11.382083+00	
00000000-0000-0000-0000-000000000000	42c58eca-2ecb-4109-820a-5255468844f6	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-13 21:18:23.933267+00	
00000000-0000-0000-0000-000000000000	d5df14e0-b963-4d8f-bdc6-b2de90cc4df5	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 22:16:29.31253+00	
00000000-0000-0000-0000-000000000000	4104cbb8-4171-48b7-9667-f10b7709606d	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 22:16:29.313218+00	
00000000-0000-0000-0000-000000000000	2215e1d9-fb29-4b2a-bf55-02817f36447b	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 23:14:29.308769+00	
00000000-0000-0000-0000-000000000000	059b29a6-ac02-4303-bd20-f44f6747c55a	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-13 23:14:29.309226+00	
00000000-0000-0000-0000-000000000000	fd2a57b1-a2a6-4c29-a405-224863fb7593	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 00:12:29.312261+00	
00000000-0000-0000-0000-000000000000	a2f0613f-62b6-46d1-bfbd-2e6bd8bca5dc	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 00:12:29.312981+00	
00000000-0000-0000-0000-000000000000	0eeb7be7-22b9-4efe-9bb4-f572a8f0e0fd	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 01:10:29.3097+00	
00000000-0000-0000-0000-000000000000	009a2090-c2b0-4531-806d-9eada1c51489	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 01:10:29.31038+00	
00000000-0000-0000-0000-000000000000	15dfb26f-ccbe-4781-9ae0-072c8c32ddca	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 02:08:29.310074+00	
00000000-0000-0000-0000-000000000000	23904302-02ac-44d8-bf54-9d1d024ec40b	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 02:08:29.311039+00	
00000000-0000-0000-0000-000000000000	f12b8dd5-d7c9-4a34-bac8-1f1e198cfc7d	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 03:06:29.311744+00	
00000000-0000-0000-0000-000000000000	9b38ddb4-6308-4de6-ad6e-db6f234334bb	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 03:06:29.312511+00	
00000000-0000-0000-0000-000000000000	961ec83e-0f1b-4cf2-a11c-144cb72356bb	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 04:04:29.310847+00	
00000000-0000-0000-0000-000000000000	186bfdeb-dd07-4ef1-8ea5-fd18f8cc94ec	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 04:04:29.311396+00	
00000000-0000-0000-0000-000000000000	fbb24311-5868-4222-a0d7-25aca68c039a	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 05:02:29.309945+00	
00000000-0000-0000-0000-000000000000	c5220603-2ec7-4cab-a3cf-b6555742bedd	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 05:02:29.310388+00	
00000000-0000-0000-0000-000000000000	9d36c668-2a4e-4722-bd8d-98e9a87145ad	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 06:00:29.311034+00	
00000000-0000-0000-0000-000000000000	f9cd4737-8e73-4471-83af-29bb685e21df	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 06:00:29.311557+00	
00000000-0000-0000-0000-000000000000	11ab8373-d061-470b-8d84-f97533a9009a	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 06:58:29.311316+00	
00000000-0000-0000-0000-000000000000	225d6678-77c5-4bc1-8463-370c518dbb24	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 06:58:29.311806+00	
00000000-0000-0000-0000-000000000000	0679f601-e313-420e-ba30-cbd875549fe2	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-14 07:18:48.071788+00	
00000000-0000-0000-0000-000000000000	2883bd1c-5dec-4287-9ae3-20c602e8774b	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 08:42:08.496522+00	
00000000-0000-0000-0000-000000000000	ec42ea6f-69d8-48db-acdb-74f0a0914ee0	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-14 08:42:08.497782+00	
00000000-0000-0000-0000-000000000000	fafd09a1-97fd-42b0-8ecf-6f96c84964fc	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-14 09:24:03.613733+00	
00000000-0000-0000-0000-000000000000	f5f70feb-46ce-4aba-a234-9c5baab018e3	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 08:43:44.770612+00	
00000000-0000-0000-0000-000000000000	87e3a3ab-0890-419a-8b94-bc14ac74d9e5	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 08:43:44.771833+00	
00000000-0000-0000-0000-000000000000	9d1b5cad-e191-4d63-8298-5429711293aa	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 08:50:13.7309+00	
00000000-0000-0000-0000-000000000000	e6a8b2a7-7cb2-4596-9a43-112201b52a15	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 08:54:08.675305+00	
00000000-0000-0000-0000-000000000000	598606d9-c41a-43b6-bcf8-6b06b9e6aa99	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 08:55:07.534426+00	
00000000-0000-0000-0000-000000000000	65254f02-c606-49ee-acea-a5fc83d8cd89	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 08:58:11.625875+00	
00000000-0000-0000-0000-000000000000	6ae1a440-1046-49bc-852d-250671c3bb83	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 10:02:10.755486+00	
00000000-0000-0000-0000-000000000000	4230fd1f-92c8-49ba-9c0e-fe1566dacbe2	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 10:02:10.756361+00	
00000000-0000-0000-0000-000000000000	39684b50-88ef-446b-9ee7-67b32d6adcf0	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 10:03:15.304162+00	
00000000-0000-0000-0000-000000000000	957319a4-ad57-48d8-b1cf-2f2a58ad2885	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 10:16:56.088173+00	
00000000-0000-0000-0000-000000000000	957e81e2-3e12-4487-942a-6f128a307e44	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 10:55:11.535365+00	
00000000-0000-0000-0000-000000000000	ed9df0f7-ec42-41b3-83c8-31a27d74330d	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 11:53:20.834782+00	
00000000-0000-0000-0000-000000000000	e111094f-5578-41a0-a898-091e8daff12e	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 11:53:20.835851+00	
00000000-0000-0000-0000-000000000000	3d57bf0f-8e69-4235-8744-0773ebc7de82	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 12:05:20.72129+00	
00000000-0000-0000-0000-000000000000	bef20330-aa5a-4f8a-b777-10dc224b7cc2	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 12:09:56.931633+00	
00000000-0000-0000-0000-000000000000	04f4c288-d805-4e59-8835-5c6fc0ff1741	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 12:18:15.330173+00	
00000000-0000-0000-0000-000000000000	3477c83a-f5dc-47f1-bc42-93ef977d355c	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 13:16:43.805453+00	
00000000-0000-0000-0000-000000000000	3e4d98b8-fc9c-441b-a00e-6e829784e8cb	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 13:16:43.80605+00	
00000000-0000-0000-0000-000000000000	a6ae05f8-bd0b-47b7-a854-65044e079c4c	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 14:14:43.801751+00	
00000000-0000-0000-0000-000000000000	27211126-4890-462c-87f5-4364bce0e5be	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 14:14:43.802471+00	
00000000-0000-0000-0000-000000000000	9878ba6a-6295-4a9b-89a2-9b5c27e20210	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 15:13:05.778399+00	
00000000-0000-0000-0000-000000000000	88b5ef9a-5896-412b-ad7e-b7c74fd0e76c	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 15:13:05.779171+00	
00000000-0000-0000-0000-000000000000	3fb32cbf-db3c-43e2-b0c7-a53dbe86c229	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 16:11:05.775878+00	
00000000-0000-0000-0000-000000000000	32170acf-60a7-400f-8ebc-420fab6bf618	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 16:11:05.776433+00	
00000000-0000-0000-0000-000000000000	739bbe24-9339-41cb-884c-d2c2924f4ab6	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 16:50:53.09281+00	
00000000-0000-0000-0000-000000000000	08091c42-fe0f-46fe-afc4-490b7346b46a	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 16:56:46.645548+00	
00000000-0000-0000-0000-000000000000	fb46417a-bb44-4482-89d8-52fbe928df14	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 17:20:11.001262+00	
00000000-0000-0000-0000-000000000000	b1a1ca02-264a-4ba2-82bd-801f6516ed83	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 17:29:47.786038+00	
00000000-0000-0000-0000-000000000000	1a02858f-bb49-4c39-a37e-95bf2a06b8d3	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 17:32:43.763895+00	
00000000-0000-0000-0000-000000000000	805d27eb-797b-48ec-83a9-781326f8ea49	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 17:36:15.949902+00	
00000000-0000-0000-0000-000000000000	3ba40dd6-a30d-43e7-afae-e7945b3db3f7	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 18:55:19.203453+00	
00000000-0000-0000-0000-000000000000	2a9b3d36-faed-4b9d-bca3-3fcf86c104a8	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 18:55:19.204449+00	
00000000-0000-0000-0000-000000000000	abe00cc4-7bab-48ff-804c-9ed5bc7f3442	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 18:55:57.834927+00	
00000000-0000-0000-0000-000000000000	50daffc0-d694-4d4c-b46f-6e000e33dc1f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 19:00:12.988476+00	
00000000-0000-0000-0000-000000000000	d78e0ae3-47d3-4ede-924f-c05438c906a7	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 19:09:09.755997+00	
00000000-0000-0000-0000-000000000000	3d44ed6d-bd1b-465a-8092-29eeecdd8abd	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 19:18:01.783397+00	
00000000-0000-0000-0000-000000000000	e5c41f96-d33f-47ec-8e4f-ca47868ff306	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 19:21:27.833816+00	
00000000-0000-0000-0000-000000000000	3dc9e1f0-d3f4-42a4-8232-f2ee783d10cb	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 19:27:42.294129+00	
00000000-0000-0000-0000-000000000000	07e39375-464e-4d5b-abc5-f2c2175bd3cc	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 19:36:46.84954+00	
00000000-0000-0000-0000-000000000000	ca42c5e2-d1d7-4fe8-a504-2af69d9fe212	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 19:40:24.374416+00	
00000000-0000-0000-0000-000000000000	77de6ce1-697f-46ab-90ce-7965aafc8c16	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 19:55:46.233703+00	
00000000-0000-0000-0000-000000000000	cbba82c1-2065-45fb-84f9-2a09972d6734	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 20:55:43.772551+00	
00000000-0000-0000-0000-000000000000	b1458810-c439-42c6-b8a9-f8a4f7bccb99	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 20:55:43.773688+00	
00000000-0000-0000-0000-000000000000	f77dce36-b639-47a3-ad7f-6a0fbd28af82	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 21:02:51.438079+00	
00000000-0000-0000-0000-000000000000	4fb3c126-4805-4baf-9ce1-cd8d742fe644	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 22:01:18.929131+00	
00000000-0000-0000-0000-000000000000	bd28b93b-4f3f-46f1-b6e1-054fd9cbad1e	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 22:01:18.929694+00	
00000000-0000-0000-0000-000000000000	595d7e69-c9ea-48d0-9c37-561a6e301577	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 23:02:03.554301+00	
00000000-0000-0000-0000-000000000000	b7176b90-1ee3-43f0-8b94-fc3a22c2ffa4	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-15 23:02:03.554807+00	
00000000-0000-0000-0000-000000000000	d0f1c4c2-a442-44e5-a25e-51a525867b6d	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 23:07:02.307923+00	
00000000-0000-0000-0000-000000000000	c8f23b77-5413-451c-bd37-e1f4871dbf2f	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 00:05:07.672939+00	
00000000-0000-0000-0000-000000000000	2e4e3537-3c13-4c4d-ab31-2a991ec239f6	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 00:05:07.673568+00	
00000000-0000-0000-0000-000000000000	61059151-1673-4064-a190-9e968ae4a1a1	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 01:03:07.674774+00	
00000000-0000-0000-0000-000000000000	4f15ad91-05e5-4b58-ac2a-ed87865caf1b	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 01:03:07.675394+00	
00000000-0000-0000-0000-000000000000	e5356161-9eca-46ac-8d3a-8b6c63c3f157	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 02:01:07.675699+00	
00000000-0000-0000-0000-000000000000	644ab466-81cd-4709-ac11-69f36bf809ed	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 02:01:07.676393+00	
00000000-0000-0000-0000-000000000000	26237a30-2d98-463f-b958-baf0229b3f99	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 12:01:35.655873+00	
00000000-0000-0000-0000-000000000000	97bff00b-264b-48bf-9143-acd019402c56	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 12:01:35.658368+00	
00000000-0000-0000-0000-000000000000	1aa6ae07-e99a-4e52-adde-bfd01d2b70a0	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 12:04:01.422194+00	
00000000-0000-0000-0000-000000000000	5781b2b5-3127-459d-8b38-e39985ee4bd2	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 12:51:51.770913+00	
00000000-0000-0000-0000-000000000000	caea82ee-9fce-4d42-bdad-94952fab8c56	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 13:53:45.955565+00	
00000000-0000-0000-0000-000000000000	679b7562-9d15-403d-801e-5528f6ceee3f	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 13:53:45.955741+00	
00000000-0000-0000-0000-000000000000	1eec12d5-57a3-461c-a1d4-1d4d7c9aeb79	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 14:35:12.500135+00	
00000000-0000-0000-0000-000000000000	2127f53f-870e-4a89-b9a1-7ff81ce3f5e4	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 14:37:46.979013+00	
00000000-0000-0000-0000-000000000000	cabd2703-3bd3-440c-92a9-21db77f43ee4	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 15:36:14.939192+00	
00000000-0000-0000-0000-000000000000	6ca6a0fa-5827-4c24-bcb1-a2fb357c7477	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 15:36:14.939636+00	
00000000-0000-0000-0000-000000000000	3b5e6654-0380-4ef9-b082-a70b2cd9d1a6	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 16:34:14.9416+00	
00000000-0000-0000-0000-000000000000	082a3433-5dcf-4e4c-b001-1c50288de0b2	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 16:34:14.942256+00	
00000000-0000-0000-0000-000000000000	78309aa4-5051-4b84-b6c0-2f6ae783e4d7	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 17:32:14.942765+00	
00000000-0000-0000-0000-000000000000	5fe72ebd-203f-4fd6-accd-ed62e99ebb88	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 17:32:14.943508+00	
00000000-0000-0000-0000-000000000000	1fb47e67-af14-4eb8-aed4-2e681d6270d5	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 18:30:14.941752+00	
00000000-0000-0000-0000-000000000000	2e65c1c4-d346-43e6-b315-749b42e4637a	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 18:30:14.942753+00	
00000000-0000-0000-0000-000000000000	4351f76d-92cf-4d53-a0d9-df7c00cd5845	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 20:43:43.037377+00	
00000000-0000-0000-0000-000000000000	caf66dbb-7fc0-469c-94be-e9ddcb93e396	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-16 20:43:43.038725+00	
00000000-0000-0000-0000-000000000000	aa3cf34e-a540-4150-bfe5-d2dd45c8d90d	{"action":"logout","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account"}	2025-06-16 21:17:34.69866+00	
00000000-0000-0000-0000-000000000000	9e6d9575-995a-4907-aecc-70c677efa10f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 21:23:19.017896+00	
00000000-0000-0000-0000-000000000000	000f6e75-c61c-4eb7-add2-0fce25de3a09	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 21:33:35.118218+00	
00000000-0000-0000-0000-000000000000	119c15cf-6734-4e35-9909-268774a27135	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 21:37:44.825967+00	
00000000-0000-0000-0000-000000000000	ce474ffb-2319-493d-920a-4a96703446d0	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 21:42:36.916508+00	
00000000-0000-0000-0000-000000000000	c8c62134-a609-485e-ab35-1e3175a67dbd	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 21:48:57.23051+00	
00000000-0000-0000-0000-000000000000	fe74fa21-b8c6-48fe-91e4-19f96aa4a7e4	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 21:50:55.075557+00	
00000000-0000-0000-0000-000000000000	8bb9b5e8-c058-4467-a384-f442732c5f3f	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 08:29:19.949595+00	
00000000-0000-0000-0000-000000000000	ac82304c-7271-4349-b140-abe4396440ff	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 08:29:19.950696+00	
00000000-0000-0000-0000-000000000000	7e2cad29-0a64-4938-b429-4b77cebe1bff	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 09:27:38.404541+00	
00000000-0000-0000-0000-000000000000	843d6242-2173-4105-b4e3-5ed9d2ed8e71	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 09:27:38.405118+00	
00000000-0000-0000-0000-000000000000	678e0dd4-77eb-40ae-9d5d-33caf1ff61a1	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-17 09:28:26.884305+00	
00000000-0000-0000-0000-000000000000	85277f82-4ad6-4f51-a91d-b809f5ed41ed	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-17 09:31:59.935766+00	
00000000-0000-0000-0000-000000000000	6203a571-1428-4cf3-9397-a618afd820a9	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-17 09:34:28.637563+00	
00000000-0000-0000-0000-000000000000	0fa08bab-c974-48f8-94b9-dac78bf2169f	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-17 09:37:30.86765+00	
00000000-0000-0000-0000-000000000000	302b0d88-85a4-41ef-a630-fbecee3910ad	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-17 09:42:21.390048+00	
00000000-0000-0000-0000-000000000000	4f8c42ef-2564-4ad2-a9fe-1ed432c0ca34	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-17 09:48:22.14012+00	
00000000-0000-0000-0000-000000000000	abef8fcb-10fd-4c66-bfb7-a00629561a49	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 11:10:43.945979+00	
00000000-0000-0000-0000-000000000000	d5a85cfb-3e71-4c15-bbab-a1dc0b033e38	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 11:10:43.946301+00	
00000000-0000-0000-0000-000000000000	c213ac23-3456-4af9-9ca3-820b27998665	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 15:18:41.79133+00	
00000000-0000-0000-0000-000000000000	7fb2498a-4fd7-4db5-aa2d-90c168025c9b	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 15:18:41.791647+00	
00000000-0000-0000-0000-000000000000	982e6b62-e40a-48b1-9965-ed71710d787e	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 16:17:03.658597+00	
00000000-0000-0000-0000-000000000000	015a2762-9989-41b7-9263-7aa31b479aa0	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 16:17:03.658971+00	
00000000-0000-0000-0000-000000000000	fc8c9857-7921-4639-b1f3-d145ad4e57e3	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 17:15:08.295302+00	
00000000-0000-0000-0000-000000000000	e80d7a06-c381-4416-bee1-b317709c24e4	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 17:15:08.296098+00	
00000000-0000-0000-0000-000000000000	92fd45a6-5a21-4b01-a1cf-c22239c8cb37	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 18:13:13.775107+00	
00000000-0000-0000-0000-000000000000	afda7428-bddb-4231-b460-6a1e0dc6debb	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 18:13:13.775931+00	
00000000-0000-0000-0000-000000000000	bac4ae4c-9762-4209-b58d-76a4053ded1c	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 19:49:23.631637+00	
00000000-0000-0000-0000-000000000000	7e586423-fce0-4af6-b7d4-eff9dcd3b501	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 19:49:23.63282+00	
00000000-0000-0000-0000-000000000000	0e2b666f-d783-4601-8adc-6ef0c41c7472	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 20:47:49.640496+00	
00000000-0000-0000-0000-000000000000	a53df7b1-49df-4a8e-8b86-d9f2d5728dea	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-17 20:47:49.641245+00	
00000000-0000-0000-0000-000000000000	ef4ef5dd-7c71-4629-a236-47b9a95c2351	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 06:22:14.573699+00	
00000000-0000-0000-0000-000000000000	7aee838c-21c8-4d28-bfae-40b5387d21f0	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 06:22:14.574559+00	
00000000-0000-0000-0000-000000000000	322681ee-27df-4490-9ee5-964cc1a05571	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 07:20:58.989508+00	
00000000-0000-0000-0000-000000000000	f2dbfb86-d417-4805-86bd-ce441a07644e	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 07:20:58.989726+00	
00000000-0000-0000-0000-000000000000	3511a349-c43a-4fc7-be4f-c1c3c5e7d4cc	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 08:36:04.025016+00	
00000000-0000-0000-0000-000000000000	fc49c444-0c21-4939-9f1b-aae844e6d06e	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 08:36:04.025272+00	
00000000-0000-0000-0000-000000000000	07271892-7068-478c-9388-02292f1934b8	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 09:34:28.605121+00	
00000000-0000-0000-0000-000000000000	13f91c7e-357f-46af-a748-df183aaf68de	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 09:34:28.605676+00	
00000000-0000-0000-0000-000000000000	3c396586-9563-4c85-b7f2-7894ee4d652d	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 10:33:10.216442+00	
00000000-0000-0000-0000-000000000000	8f411938-4b61-4e82-afd5-371a3c825d1c	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 10:33:10.216818+00	
00000000-0000-0000-0000-000000000000	fde0e196-892f-4988-9c54-46333b08b8e0	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 11:42:16.165587+00	
00000000-0000-0000-0000-000000000000	58602107-6f87-475e-b90c-461bc6d2af0e	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 11:42:16.16582+00	
00000000-0000-0000-0000-000000000000	46b5a466-3546-4dc7-931f-5c5c1e0fd292	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 12:40:40.086107+00	
00000000-0000-0000-0000-000000000000	6fa9deaf-261a-43b4-949e-62e3d415d90e	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 12:40:40.086571+00	
00000000-0000-0000-0000-000000000000	7dabded6-4bc8-4fd0-bea6-9d765df940c8	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 13:39:02.931849+00	
00000000-0000-0000-0000-000000000000	a88a3736-29ac-4c3e-9760-2f0ecb055080	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 13:39:02.932683+00	
00000000-0000-0000-0000-000000000000	42f684e1-d5cc-4065-8e23-9b53d219ef13	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 14:37:32.018033+00	
00000000-0000-0000-0000-000000000000	ff8bc2c0-39a4-4514-9606-042d4e4efe7f	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 14:37:32.018276+00	
00000000-0000-0000-0000-000000000000	e6b0d02d-6a39-41a2-bfec-ca945af597fa	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 15:03:27.42506+00	
00000000-0000-0000-0000-000000000000	e4552ef1-867f-424f-839d-acaacbd6666a	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 15:04:01.761134+00	
00000000-0000-0000-0000-000000000000	73122fee-c125-46a0-9e24-e58f45185d24	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 15:04:08.17888+00	
00000000-0000-0000-0000-000000000000	3977d906-c404-4e83-b99b-7019bca5a4d3	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 16:40:35.79029+00	
00000000-0000-0000-0000-000000000000	a73aa298-3dcc-402f-b353-7853e58a9346	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 16:40:35.790581+00	
00000000-0000-0000-0000-000000000000	c24d3ceb-4aa7-43b1-8250-8da985ae1b63	{"action":"login","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 16:41:21.734122+00	
00000000-0000-0000-0000-000000000000	b7fece6b-d517-48a8-aada-46093d615a29	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 17:39:50.560026+00	
00000000-0000-0000-0000-000000000000	d238918c-e517-4fcf-82d8-604ff3fc5183	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 17:39:50.560554+00	
00000000-0000-0000-0000-000000000000	5fde596a-cccc-4213-a8ef-7af8da3d04f0	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 18:41:51.384557+00	
00000000-0000-0000-0000-000000000000	58205c6a-c076-4af5-84fa-290f5f2b70ab	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 18:41:51.385552+00	
00000000-0000-0000-0000-000000000000	6ea3ae71-68cb-40a4-9f00-3384a9f50117	{"action":"token_refreshed","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 19:48:33.05342+00	
00000000-0000-0000-0000-000000000000	54fc09c7-1a19-4784-91d1-630e20587bd6	{"action":"token_revoked","actor_id":"dd1329e7-5439-43ad-989b-0b8f5714824b","actor_username":"admin@lia-hair.ch","actor_via_sso":false,"log_type":"token"}	2025-06-18 19:48:33.05406+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
dd1329e7-5439-43ad-989b-0b8f5714824b	dd1329e7-5439-43ad-989b-0b8f5714824b	{"sub": "dd1329e7-5439-43ad-989b-0b8f5714824b", "email": "admin@lia-hair.ch", "email_verified": false, "phone_verified": false}	email	2025-03-16 18:01:14.802597+00	2025-03-16 18:01:14.802655+00	2025-03-16 18:01:14.802655+00	ef45cd9a-1a3a-4661-8f05-57091dd5fd2a
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
cb095f4e-8ad5-4b95-a0c9-5821e773de80	2025-06-16 21:23:19.02231+00	2025-06-16 21:23:19.02231+00	password	19435fae-c65b-45ba-abfe-88a0e820b1fa
66a05b27-4eed-4cbc-acb3-795ac1023b18	2025-06-16 21:33:35.121688+00	2025-06-16 21:33:35.121688+00	password	4ad386fb-c93f-45db-8e47-940fea53199d
3ea5db14-2cfd-41c9-a260-408590446a90	2025-06-16 21:37:44.830287+00	2025-06-16 21:37:44.830287+00	password	e0410b01-8666-4f09-8e92-af9cfc778dcc
d1578fdf-d786-4555-b7a6-8f873a8869db	2025-06-16 21:42:36.920014+00	2025-06-16 21:42:36.920014+00	password	146c620d-6da3-4b5e-a353-1376d5823306
a3f3ea31-3a57-4b5b-912f-ac6dbda48207	2025-06-16 21:48:57.234034+00	2025-06-16 21:48:57.234034+00	password	f0c54e86-1e96-41bd-8f90-673ca2fa7255
5255251b-7bbb-424f-a454-cfe2ac64043d	2025-06-16 21:50:55.079918+00	2025-06-16 21:50:55.079918+00	password	2979005d-e8ce-4020-b719-766bafd894a5
51e2c750-e825-4371-bb2e-f7c6af563967	2025-06-17 09:28:26.885869+00	2025-06-17 09:28:26.885869+00	password	e2d39670-76ad-4cc7-a7de-3303f2ba9792
dab9d31b-7239-4220-b077-91777d976475	2025-06-17 09:31:59.937979+00	2025-06-17 09:31:59.937979+00	password	23e8841e-f1cc-4b28-8c57-b68e9f10e0a5
5144c842-cc73-47fc-a284-a2697afb74b0	2025-06-17 09:34:28.638611+00	2025-06-17 09:34:28.638611+00	password	3955208f-0e04-46fe-8c57-22ce42a311bf
bdeedabb-93b0-41a3-9d06-f6772d7739fa	2025-06-17 09:37:30.869958+00	2025-06-17 09:37:30.869958+00	password	ee5305b4-7234-4788-b299-c99fdafe66ae
46076bd2-75dc-494e-9bf4-894dad6c9478	2025-06-17 09:42:21.392+00	2025-06-17 09:42:21.392+00	password	0b599bf1-9dcc-4d6b-943d-7ec1c3c19881
800db7d9-8e67-4f79-a332-870be3e6130b	2025-06-17 09:48:22.142921+00	2025-06-17 09:48:22.142921+00	password	c6bde929-8cd7-4590-ab71-6b35f050d9f7
aaa67d6b-7e81-4aa3-af11-d67d2febb8bd	2025-06-18 15:03:27.43984+00	2025-06-18 15:03:27.43984+00	password	d9930383-e219-458e-af92-c5c9c63cf30c
ab1a2a7e-b2a9-4a7d-9287-6836f40a59db	2025-06-18 15:04:01.773727+00	2025-06-18 15:04:01.773727+00	password	be618b3c-207d-480c-ba1c-eb6d0aeb0b54
3de7e6d8-0743-4612-b473-f7c0326ceab5	2025-06-18 15:04:08.182757+00	2025-06-18 15:04:08.182757+00	password	5484a137-7f0f-4733-b536-80a9ed8be65d
406e65e5-1246-494e-a365-c2281a7b14bd	2025-06-18 16:41:21.738295+00	2025-06-18 16:41:21.738295+00	password	b922ebdf-8c97-4567-b3c9-7bad246ee5b3
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	446	vfHTQkIVSMHV6ZSHlfWzXA	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-16 21:23:19.020657+00	2025-06-16 21:23:19.020657+00	\N	cb095f4e-8ad5-4b95-a0c9-5821e773de80
00000000-0000-0000-0000-000000000000	447	UxFHIzrE3BIFmNM31wgtkQ	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-16 21:33:35.119695+00	2025-06-16 21:33:35.119695+00	\N	66a05b27-4eed-4cbc-acb3-795ac1023b18
00000000-0000-0000-0000-000000000000	448	kT6S1ua2j4p4epRrGsdHqQ	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-16 21:37:44.828153+00	2025-06-16 21:37:44.828153+00	\N	3ea5db14-2cfd-41c9-a260-408590446a90
00000000-0000-0000-0000-000000000000	449	j-O4bknFjzw181kBoBUD1g	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-16 21:42:36.918783+00	2025-06-16 21:42:36.918783+00	\N	d1578fdf-d786-4555-b7a6-8f873a8869db
00000000-0000-0000-0000-000000000000	450	xS7AhmfQkDx1GpoqsEJ5ow	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-16 21:48:57.232472+00	2025-06-16 21:48:57.232472+00	\N	a3f3ea31-3a57-4b5b-912f-ac6dbda48207
00000000-0000-0000-0000-000000000000	451	hd3x16ZcQlxNsaYngVM4Jw	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-16 21:50:55.078033+00	2025-06-17 08:29:19.950826+00	\N	5255251b-7bbb-424f-a454-cfe2ac64043d
00000000-0000-0000-0000-000000000000	452	ojGYol1NStQYaP5rAeNV8Q	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-17 08:29:19.951183+00	2025-06-17 09:27:38.405566+00	hd3x16ZcQlxNsaYngVM4Jw	5255251b-7bbb-424f-a454-cfe2ac64043d
00000000-0000-0000-0000-000000000000	453	f9fr6v6Ei_bTeDFe3-fvrQ	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-17 09:27:38.405914+00	2025-06-17 09:27:38.405914+00	ojGYol1NStQYaP5rAeNV8Q	5255251b-7bbb-424f-a454-cfe2ac64043d
00000000-0000-0000-0000-000000000000	454	OtwaP6GopnGQvTdYr8yuTA	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-17 09:28:26.885388+00	2025-06-17 09:28:26.885388+00	\N	51e2c750-e825-4371-bb2e-f7c6af563967
00000000-0000-0000-0000-000000000000	455	HXseTeSIfL4DzL8Dl6hCFg	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-17 09:31:59.937291+00	2025-06-17 09:31:59.937291+00	\N	dab9d31b-7239-4220-b077-91777d976475
00000000-0000-0000-0000-000000000000	456	avoGcEbfQGvhYHWXS21NrA	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-17 09:34:28.638072+00	2025-06-17 09:34:28.638072+00	\N	5144c842-cc73-47fc-a284-a2697afb74b0
00000000-0000-0000-0000-000000000000	457	C_3oCjGkFHwA_m2Q3CGr-Q	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-17 09:37:30.869271+00	2025-06-17 09:37:30.869271+00	\N	bdeedabb-93b0-41a3-9d06-f6772d7739fa
00000000-0000-0000-0000-000000000000	458	D0MU69gRvHiG8ZtBi50iYQ	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-17 09:42:21.391468+00	2025-06-17 09:42:21.391468+00	\N	46076bd2-75dc-494e-9bf4-894dad6c9478
00000000-0000-0000-0000-000000000000	459	HyZwpVftV2AkqyU_KYqdRA	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-17 09:48:22.141931+00	2025-06-17 11:10:43.946547+00	\N	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	460	z2a7j7ojwm0DcB1SYHqOHQ	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-17 11:10:43.946739+00	2025-06-17 15:18:41.791893+00	HyZwpVftV2AkqyU_KYqdRA	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	461	2nL3DoKOGCLH4lwc4iJzYw	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-17 15:18:41.792074+00	2025-06-17 16:17:03.659279+00	z2a7j7ojwm0DcB1SYHqOHQ	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	462	lPaPJ-bwzZdT1EHmiW1prg	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-17 16:17:03.659494+00	2025-06-17 17:15:08.296656+00	2nL3DoKOGCLH4lwc4iJzYw	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	463	qOX3h081uqtNbGf2vpRSeA	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-17 17:15:08.297074+00	2025-06-17 18:13:13.776664+00	lPaPJ-bwzZdT1EHmiW1prg	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	464	B9fBqoxzWiHpM8t8lraXag	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-17 18:13:13.77713+00	2025-06-17 19:49:23.633099+00	qOX3h081uqtNbGf2vpRSeA	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	465	toaIsQIKh2tNmkYUH0GmuA	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-17 19:49:23.633791+00	2025-06-17 20:47:49.642383+00	B9fBqoxzWiHpM8t8lraXag	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	466	oo4kdgzb6ca5PRu4JAbMEQ	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-17 20:47:49.642868+00	2025-06-18 06:22:14.575042+00	toaIsQIKh2tNmkYUH0GmuA	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	467	_TEc_bjCNcGpcyrjt0FBKQ	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 06:22:14.575387+00	2025-06-18 07:20:58.989837+00	oo4kdgzb6ca5PRu4JAbMEQ	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	468	12t3LHuyEMNWpXZm7V7mzw	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 07:20:58.989953+00	2025-06-18 08:36:04.025385+00	_TEc_bjCNcGpcyrjt0FBKQ	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	469	WWyYbDiQKE51GZJ9HAt1Ag	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 08:36:04.025485+00	2025-06-18 09:34:28.605819+00	12t3LHuyEMNWpXZm7V7mzw	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	470	uCDvquqsfL60DYn6AcUNlg	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 09:34:28.605949+00	2025-06-18 10:33:10.216933+00	WWyYbDiQKE51GZJ9HAt1Ag	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	471	pBEWuKNQMZqaWzwN1kiVAQ	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 10:33:10.217027+00	2025-06-18 11:42:16.165962+00	uCDvquqsfL60DYn6AcUNlg	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	472	Ougaoo2UP6fAy04cZh6yMg	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 11:42:16.166056+00	2025-06-18 12:40:40.086951+00	pBEWuKNQMZqaWzwN1kiVAQ	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	473	Srg-eNAxXwhHtLmnBWIF4Q	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 12:40:40.087193+00	2025-06-18 13:39:02.933267+00	Ougaoo2UP6fAy04cZh6yMg	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	474	yQbywO6tMXeYyaZ9rQZYTA	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 13:39:02.933612+00	2025-06-18 14:37:32.018453+00	Srg-eNAxXwhHtLmnBWIF4Q	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	475	EaEViSYHvF0DfgPKOj7KLQ	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-18 14:37:32.01855+00	2025-06-18 14:37:32.01855+00	yQbywO6tMXeYyaZ9rQZYTA	800db7d9-8e67-4f79-a332-870be3e6130b
00000000-0000-0000-0000-000000000000	476	zuucJfZWNc6PShzy9VFvCA	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-18 15:03:27.43737+00	2025-06-18 15:03:27.43737+00	\N	aaa67d6b-7e81-4aa3-af11-d67d2febb8bd
00000000-0000-0000-0000-000000000000	477	190abygBPLlmWZqzJeepPA	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-18 15:04:01.772192+00	2025-06-18 15:04:01.772192+00	\N	ab1a2a7e-b2a9-4a7d-9287-6836f40a59db
00000000-0000-0000-0000-000000000000	478	RQBeCjdU0BJByrlqhtbTAA	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 15:04:08.181223+00	2025-06-18 16:40:35.790768+00	\N	3de7e6d8-0743-4612-b473-f7c0326ceab5
00000000-0000-0000-0000-000000000000	479	gmxD-Vh4ZSzLFTWT_akKXg	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-18 16:40:35.790898+00	2025-06-18 16:40:35.790898+00	RQBeCjdU0BJByrlqhtbTAA	3de7e6d8-0743-4612-b473-f7c0326ceab5
00000000-0000-0000-0000-000000000000	480	sb9T336ZGVADv7DV-a5vWw	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 16:41:21.736366+00	2025-06-18 17:39:50.560991+00	\N	406e65e5-1246-494e-a365-c2281a7b14bd
00000000-0000-0000-0000-000000000000	481	Xw7rlnbxI7bFDK9aXJBOcg	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 17:39:50.561368+00	2025-06-18 18:41:51.386413+00	sb9T336ZGVADv7DV-a5vWw	406e65e5-1246-494e-a365-c2281a7b14bd
00000000-0000-0000-0000-000000000000	482	obcwzqO4AzrlkO6d4uWLGA	dd1329e7-5439-43ad-989b-0b8f5714824b	t	2025-06-18 18:41:51.386927+00	2025-06-18 19:48:33.054745+00	Xw7rlnbxI7bFDK9aXJBOcg	406e65e5-1246-494e-a365-c2281a7b14bd
00000000-0000-0000-0000-000000000000	483	CPvpy75_NVKy0MNUNdPtSw	dd1329e7-5439-43ad-989b-0b8f5714824b	f	2025-06-18 19:48:33.055393+00	2025-06-18 19:48:33.055393+00	obcwzqO4AzrlkO6d4uWLGA	406e65e5-1246-494e-a365-c2281a7b14bd
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
cb095f4e-8ad5-4b95-a0c9-5821e773de80	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 21:23:19.019346+00	2025-06-16 21:23:19.019346+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	172.18.0.1	\N
66a05b27-4eed-4cbc-acb3-795ac1023b18	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 21:33:35.118843+00	2025-06-16 21:33:35.118843+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36	172.18.0.1	\N
3ea5db14-2cfd-41c9-a260-408590446a90	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 21:37:44.827145+00	2025-06-16 21:37:44.827145+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	172.18.0.1	\N
d1578fdf-d786-4555-b7a6-8f873a8869db	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 21:42:36.91779+00	2025-06-16 21:42:36.91779+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36	172.18.0.1	\N
a3f3ea31-3a57-4b5b-912f-ac6dbda48207	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 21:48:57.231696+00	2025-06-16 21:48:57.231696+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36	172.18.0.1	\N
3de7e6d8-0743-4612-b473-f7c0326ceab5	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 15:04:08.180043+00	2025-06-18 16:40:35.791926+00	\N	aal1	\N	2025-06-18 16:40:35.791869	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36	172.18.0.1	\N
5255251b-7bbb-424f-a454-cfe2ac64043d	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 21:50:55.077105+00	2025-06-17 09:27:38.407768+00	\N	aal1	\N	2025-06-17 09:27:38.407694	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36	172.18.0.1	\N
51e2c750-e825-4371-bb2e-f7c6af563967	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 09:28:26.884776+00	2025-06-17 09:28:26.884776+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	172.18.0.1	\N
dab9d31b-7239-4220-b077-91777d976475	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 09:31:59.936662+00	2025-06-17 09:31:59.936662+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36	172.18.0.1	\N
5144c842-cc73-47fc-a284-a2697afb74b0	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 09:34:28.63785+00	2025-06-17 09:34:28.63785+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36	172.18.0.1	\N
bdeedabb-93b0-41a3-9d06-f6772d7739fa	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 09:37:30.868571+00	2025-06-17 09:37:30.868571+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36	172.18.0.1	\N
46076bd2-75dc-494e-9bf4-894dad6c9478	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 09:42:21.390927+00	2025-06-17 09:42:21.390927+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36	172.18.0.1	\N
406e65e5-1246-494e-a365-c2281a7b14bd	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 16:41:21.735301+00	2025-06-18 19:48:33.057719+00	\N	aal1	\N	2025-06-18 19:48:33.057575	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	172.18.0.1	\N
800db7d9-8e67-4f79-a332-870be3e6130b	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 09:48:22.141193+00	2025-06-18 14:37:32.019184+00	\N	aal1	\N	2025-06-18 14:37:32.019153	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	172.18.0.1	\N
aaa67d6b-7e81-4aa3-af11-d67d2febb8bd	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 15:03:27.42623+00	2025-06-18 15:03:27.42623+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36	172.18.0.1	\N
ab1a2a7e-b2a9-4a7d-9287-6836f40a59db	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 15:04:01.771407+00	2025-06-18 15:04:01.771407+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36	172.18.0.1	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	dd1329e7-5439-43ad-989b-0b8f5714824b	authenticated	authenticated	admin@lia-hair.ch	$2a$10$BSXlc.V2ofCtx84gMGT3QO76NM1efcnvj2bCz9HlFXHvc4aagupKS	2025-03-16 18:01:14.806044+00	\N		\N		\N			\N	2025-06-18 16:41:21.735207+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-03-16 18:01:14.798176+00	2025-06-18 19:48:33.056304+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: -
--

COPY pgsodium.key (id, status, created, expires, key_type, key_id, key_context, name, associated_data, raw_key, raw_key_nonce, parent_key, comment, user_data) FROM stdin;
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_log (id, table_name, record_id, action, old_values, new_values, user_id, "timestamp", ip_address, session_id, is_immutable) FROM stdin;
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_accounts (id, name, bank_name, iban, account_number, current_balance, last_statement_date, is_active, user_id, created_at, updated_at, notes, organization_id) FROM stdin;
b0892933-f42e-4044-9b5c-827e36432519	Raiffeisen Geschäftskonto	raiffeisen	CH5180808002007735062	\N	1225.21	2025-02-01	t	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-01 17:44:45.392241+00	2025-06-16 20:45:01.51368+00	\N	\N
\.


--
-- Data for Name: bank_import_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_import_sessions (id, bank_account_id, import_filename, import_type, total_entries, new_entries, duplicate_entries, error_entries, statement_from_date, statement_to_date, status, imported_by, imported_at, notes, organization_id) FROM stdin;
\.


--
-- Data for Name: bank_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_transactions (id, bank_account_id, transaction_date, booking_date, amount, description, reference, transaction_code, import_batch_id, import_filename, import_date, raw_data, status, user_id, created_at, updated_at, notes, transaction_number, organization_id) FROM stdin;
9fa32485-c1a3-4136-b87a-e9a20547bff4	b0892933-f42e-4044-9b5c-827e36432519	2025-01-28	\N	-75.50	Zahlung Reinigung Müller	ZAH-RM-28JAN	DEBIT	\N	\N	2025-06-15 14:59:46.714994+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:46.714994+00	2025-06-15 14:59:46.714994+00	\N	BT2025000014	49c9314c-e527-4df4-ab10-799fb5da0d1d
b466f70f-2346-4f59-b0b8-3e5c0d047a61	b0892933-f42e-4044-9b5c-827e36432519	2025-01-25	\N	-800.00	Entnahme Owner Privatentnahme	OWNER-WD-25JAN	DEBIT	\N	\N	2025-06-15 14:59:46.714994+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:46.714994+00	2025-06-15 14:59:46.714994+00	\N	BT2025000017	49c9314c-e527-4df4-ab10-799fb5da0d1d
8e13d643-a9c5-4f60-9320-80df856b851d	b0892933-f42e-4044-9b5c-827e36432519	2025-01-31	\N	-35.00	Kontoführungsgebühr Januar	GEBUEHR-JAN25	DEBIT	\N	\N	2025-06-15 14:59:46.714994+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:46.714994+00	2025-06-15 14:59:46.714994+00	\N	BT2025000015	49c9314c-e527-4df4-ab10-799fb5da0d1d
b8713174-4845-41a9-89d4-5a63d6cfe502	b0892933-f42e-4044-9b5c-827e36432519	2025-01-07	\N	-520.00	Dauerauftrag Heavenly Beauty	DA-HB-JAN25	DEBIT	\N	\N	2025-06-15 14:59:46.714994+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:46.714994+00	2025-06-15 14:59:46.714994+00	\N	BT2025000011	49c9314c-e527-4df4-ab10-799fb5da0d1d
51f4424e-3cc4-4330-841c-119eb426e1cf	b0892933-f42e-4044-9b5c-827e36432519	2025-01-03	\N	2000.00	Einzahlung Conto-Service RB Owner Kapital	OWNER-DEP-03JAN	CREDIT	\N	\N	2025-06-15 14:59:46.714994+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:46.714994+00	2025-06-15 14:59:46.714994+00	\N	BT2025000016	49c9314c-e527-4df4-ab10-799fb5da0d1d
84685e9a-cc61-4449-8b93-da9b62b340f3	b0892933-f42e-4044-9b5c-827e36432519	2025-01-20	\N	-150.00	Zahlung Beauty Supply AG	ZAH-BS-20JAN	DEBIT	\N	\N	2025-06-15 14:59:46.714994+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:46.714994+00	2025-06-15 14:59:46.714994+00	\N	BT2025000013	49c9314c-e527-4df4-ab10-799fb5da0d1d
138a25f8-11a1-473c-becc-3248b73522b3	b0892933-f42e-4044-9b5c-827e36432519	2025-01-15	\N	-285.60	Zahlung Salon Supplies GmbH	ZAH-SS-15JAN	DEBIT	\N	\N	2025-06-15 14:59:46.714994+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:46.714994+00	2025-06-15 14:59:46.714994+00	\N	BT2025000012	49c9314c-e527-4df4-ab10-799fb5da0d1d
169062d8-afc1-4b1c-9819-b6b6fc28a9f6	b0892933-f42e-4044-9b5c-827e36432519	2025-02-01	\N	82.45	TWINT AG Settlement Batch 250201	TW-BATCH-01FEB	CREDIT	\N	\N	2025-06-15 14:59:46.714994+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:46.714994+00	2025-06-15 14:59:46.714994+00	\N	BT2025000009	49c9314c-e527-4df4-ab10-799fb5da0d1d
2b500c23-c59a-4db8-a9d5-96d6145d1cf6	b0892933-f42e-4044-9b5c-827e36432519	2025-01-08	\N	145.08	TWINT AG Settlement Batch 250108	TW-BATCH-08JAN	CREDIT	\N	\N	2025-06-15 14:59:46.714994+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:46.714994+00	2025-06-15 14:59:46.714994+00	\N	BT2025000001	49c9314c-e527-4df4-ab10-799fb5da0d1d
249f450b-8d1b-4c57-81ef-8789a495d1a5	b0892933-f42e-4044-9b5c-827e36432519	2025-01-17	\N	53.35	TWINT Individual Payment 250117	TW-BATCH-17JAN	CREDIT	\N	\N	2025-06-15 14:59:46.714994+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:46.714994+00	2025-06-15 14:59:46.714994+00	\N	BT2025000004	49c9314c-e527-4df4-ab10-799fb5da0d1d
35f878c9-f263-480a-bc61-40634ce1c946	b0892933-f42e-4044-9b5c-827e36432519	2025-01-15	\N	135.80	SUMUP Settlement Batch 2 Payments	\N	\N	\N	\N	2025-06-15 20:18:17.812766+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:17.812766+00	2025-06-15 20:18:17.812766+00	\N	BT2025000018	49c9314c-e527-4df4-ab10-799fb5da0d1d
8d09b2ab-4641-4ab2-bfed-d6cc4f069e4d	b0892933-f42e-4044-9b5c-827e36432519	2025-01-30	\N	145.50	SUMUP Settlement Batch 2 Payments	\N	\N	\N	\N	2025-06-15 20:18:17.812766+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:17.812766+00	2025-06-15 20:18:17.812766+00	\N	BT2025000019	49c9314c-e527-4df4-ab10-799fb5da0d1d
927da670-7bcd-4354-9a4b-9a48ba806fa5	b0892933-f42e-4044-9b5c-827e36432519	2025-01-18	\N	121.25	SUMUP Individual Payment	\N	\N	\N	\N	2025-06-15 20:18:17.812766+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:17.812766+00	2025-06-15 20:18:17.812766+00	\N	BT2025000020	49c9314c-e527-4df4-ab10-799fb5da0d1d
850dd19f-8224-49da-a0d9-5353ae5cf2ac	b0892933-f42e-4044-9b5c-827e36432519	2025-01-11	\N	175.08	TWINT Settlement Batch 2 Payments	\N	\N	\N	\N	2025-06-15 20:18:17.812766+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:17.812766+00	2025-06-15 20:18:17.812766+00	\N	BT2025000021	49c9314c-e527-4df4-ab10-799fb5da0d1d
464f2b76-03b9-411a-bd4e-369f292a8459	b0892933-f42e-4044-9b5c-827e36432519	2025-01-22	\N	130.95	TWINT Settlement Batch 2 Payments	\N	\N	\N	\N	2025-06-15 20:18:17.812766+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:17.812766+00	2025-06-15 20:18:17.812766+00	\N	BT2025000022	49c9314c-e527-4df4-ab10-799fb5da0d1d
2986c16b-a0e6-4f61-a06d-45b8fda1597b	b0892933-f42e-4044-9b5c-827e36432519	2025-01-29	\N	101.85	TWINT Individual Payment	\N	\N	\N	\N	2025-06-15 20:18:17.812766+00	\N	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:17.812766+00	2025-06-15 20:18:17.812766+00	\N	BT2025000023	49c9314c-e527-4df4-ab10-799fb5da0d1d
\.


--
-- Data for Name: business_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_settings (id, user_id, company_name, company_tagline, company_address, company_postal_code, company_city, company_phone, company_email, company_website, company_uid, logo_url, logo_storage_path, default_currency, tax_rate, pdf_show_logo, pdf_show_company_details, created_at, updated_at, custom_expense_categories, organization_id, custom_supplier_categories, app_logo_light_url, app_logo_light_storage_path, app_logo_dark_url, app_logo_dark_storage_path) FROM stdin;
e4017212-e321-4035-8de1-cf81e2eb67c7	dd1329e7-5439-43ad-989b-0b8f5714824b	Lia Hair by Zilfije Rupp		Römerstrasse 6	4512	Bellach	+41791976484	hello@lia-hair.ch	https://lia-hair.ch/	CHE-254.243.935	http://localhost:8000/storage/v1/object/public/business-logos/49c9314c-e527-4df4-ab10-799fb5da0d1d/logo-1750270805490.png	49c9314c-e527-4df4-ab10-799fb5da0d1d/logo-1750270805490.png	CHF	7.70	t	t	2025-06-14 09:19:21.621431+00	2025-06-18 18:20:05.638761+00	{"tesla": "Tesla"}	49c9314c-e527-4df4-ab10-799fb5da0d1d	{}	http://localhost:8000/storage/v1/object/public/business-logos/49c9314c-e527-4df4-ab10-799fb5da0d1d/app-logo-light-1750270771470.png	49c9314c-e527-4df4-ab10-799fb5da0d1d/app-logo-light-1750270771470.png	http://localhost:8000/storage/v1/object/public/business-logos/49c9314c-e527-4df4-ab10-799fb5da0d1d/app-logo-dark-1750270781799.png	49c9314c-e527-4df4-ab10-799fb5da0d1d/app-logo-dark-1750270781799.png
6bb00c10-7c69-44a7-9839-30efe6ef3608	dd1329e7-5439-43ad-989b-0b8f5714824b	Test Salon	\N	Teststrasse 123	8001	Zürich	+41 44 123 45 67	test@test-salon.ch	https://test-salon.ch	CHE-999.888.777	\N	\N	CHF	7.70	t	t	2025-06-17 17:18:38.788528+00	2025-06-17 17:18:38.788528+00	{}	d3e70d00-36ef-4d1f-81b6-92be7d6163cf	{}	\N	\N	\N	\N
\.


--
-- Data for Name: cash_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_movements (id, amount, type, description, reference_type, reference_id, user_id, created_at, bank_transaction_id, banking_status, movement_type, movement_number, organization_id) FROM stdin;
7657c95e-9462-4612-a3ec-11fa9777423b	130.00	cash_in	Owner Einlage: sqwd	owner_transaction	2252ddd9-9006-4406-a5a8-cb28a24b287c	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 21:05:22.129814+00	\N	unmatched	cash_operation	CM2025000019	49c9314c-e527-4df4-ab10-799fb5da0d1d
57013914-86fc-4d13-8031-7eaaa8fb0445	71.00	cash_in	Barzahlung (Verkauf: a34f090d-9bb9-4a7d-a17d-e96f2f9a9d4e)	sale	a34f090d-9bb9-4a7d-a17d-e96f2f9a9d4e	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 21:32:16.458821+00	\N	unmatched	cash_operation	CM2025000021	d3e70d00-36ef-4d1f-81b6-92be7d6163cf
f4edab24-4823-4adc-b898-8cedb3f1d377	100.00	cash_out	Owner Entnahme: iuhniu	owner_transaction	7d148623-1cca-4883-9624-c4645449781e	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 21:05:30.610077+00	\N	unmatched	cash_operation	CM2025000020	49c9314c-e527-4df4-ab10-799fb5da0d1d
96f0a04a-5601-4981-8cc8-870028921bc7	45.00	cash_in	Barzahlung (Verkauf: 36dec7f9-04d5-4077-9b2b-3a872caafb96)	sale	36dec7f9-04d5-4077-9b2b-3a872caafb96	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:17:25.221631+00	\N	unmatched	cash_operation	CM2025000001	49c9314c-e527-4df4-ab10-799fb5da0d1d
567f5390-ff17-4f66-86c1-360f855cf4f0	120.00	cash_in	Verkauf Bar	sale	902d9836-2f44-47fd-a8d8-3f55f34e4246	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-07 10:15:00+00	\N	unmatched	cash_operation	CM2025000002	49c9314c-e527-4df4-ab10-799fb5da0d1d
5fb54afa-e379-45a7-8f4a-46abaa7aca91	110.00	cash_in	Verkauf Bar	sale	27acc2cb-6a6c-4cdd-80ec-04fc6521184d	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-14 09:30:00+00	\N	unmatched	cash_operation	CM2025000003	49c9314c-e527-4df4-ab10-799fb5da0d1d
06dd9c92-00b1-493f-b56e-2bc719464d33	70.00	cash_in	Verkauf Bar	sale	7b2a820f-394c-48a8-a505-7eefc08ffd1a	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-21 14:00:00+00	\N	unmatched	cash_operation	CM2025000004	49c9314c-e527-4df4-ab10-799fb5da0d1d
dbe8d9dd-c018-402b-9cf7-e09f7a098a87	135.00	cash_in	Verkauf Bar	sale	08c9174a-63d2-4d3f-bfc6-b3847c026421	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-29 13:30:00+00	\N	unmatched	cash_operation	CM2025000005	49c9314c-e527-4df4-ab10-799fb5da0d1d
381cd400-dd9d-4a46-b253-974e75e394bd	142.00	cash_in	Barzahlung (Verkauf: e9fa7dc7-73fd-4661-918b-9e60c8eb18c5)	sale	e9fa7dc7-73fd-4661-918b-9e60c8eb18c5	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 17:31:08.840412+00	\N	unmatched	cash_operation	CM2025000006	\N
d9c94b60-99b3-4004-a6e0-831bf24a9721	25.00	cash_in	Barzahlung (Verkauf: 6fdcfa6d-4014-4959-970f-c8dd35ea1b26)	sale	6fdcfa6d-4014-4959-970f-c8dd35ea1b26	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 19:59:30.429902+00	\N	unmatched	cash_operation	CM2025000007	\N
c5697005-b877-4dcd-98b5-a6bddbc4445a	50.00	cash_out	Sonstiges: schläcki	expense	bde76e44-4397-4fb7-8cbd-158d6cf9f878	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:02:46.12399+00	\N	unmatched	cash_operation	CM2025000008	\N
48c8d4cb-69e8-47ea-835c-d56605519cab	20.00	cash_in	Owner Einlage: kassic	owner_transaction	f56e3a6b-093c-4561-9961-85cbdc6c320d	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:10:38.660989+00	\N	unmatched	cash_operation	CM2025000009	\N
90adebdc-6d8b-415b-9a42-1d9c2d5a9881	21.00	cash_out	Owner Entnahme: kissuc	owner_transaction	964da200-2f45-4aee-bf31-e6ed1b7ee05f	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:10:54.253776+00	\N	unmatched	cash_operation	CM2025000010	\N
adab48b8-2da4-4a63-b1eb-25a8a42790dd	150.00	cash_out	Zur Bank gebracht: einzahlen	\N	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:11:16.588131+00	\N	unmatched	bank_transfer	CM2025000011	\N
75f4ff97-34ae-463f-a68d-5bd4a6c30cf1	150.00	cash_in	Von Bank geholt: auszahlen	\N	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:11:23.694309+00	\N	unmatched	bank_transfer	CM2025000012	\N
29240c18-aa54-4331-b42e-9bdb4bc45db4	65.00	cash_in	Barzahlung (Verkauf: 9804af6f-3bc9-4366-a52f-954f2d030018)	sale	9804af6f-3bc9-4366-a52f-954f2d030018	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:46:23.041242+00	\N	unmatched	cash_operation	CM2025000013	49c9314c-e527-4df4-ab10-799fb5da0d1d
367bd99b-00c7-486e-99a8-06facb2c4011	125.00	cash_out	Lohn: kush	expense	6c9f8cce-592f-41a9-a812-3bbc6a45f6b4	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:47:33.434085+00	\N	unmatched	cash_operation	CM2025000014	49c9314c-e527-4df4-ab10-799fb5da0d1d
da557f24-a42a-4405-a898-b1b9935d758b	150.00	cash_in	Owner Einlage: refer	owner_transaction	b3f1a3f4-7cff-493d-aaa4-4eaf960ff000	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:57:58.468158+00	\N	unmatched	cash_operation	CM2025000015	\N
f8f2f4b8-2575-4cbf-b67f-7d3a4a3a017c	150.00	cash_out	Owner Entnahme: frefre	owner_transaction	165c5df0-7da2-46b2-8a3f-6cc1df537066	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:58:10.846274+00	\N	unmatched	cash_operation	CM2025000016	\N
f6f30c51-7bf7-44a8-8174-9f338cea623a	100.00	cash_out	Zur Bank gebracht: tggtr	\N	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:58:32.065435+00	\N	unmatched	bank_transfer	CM2025000017	49c9314c-e527-4df4-ab10-799fb5da0d1d
bcfb769f-ef6d-4c7c-bd95-6ab42fa941a0	100.00	cash_in	Von Bank geholt: rtgrtg	\N	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:58:38.843218+00	\N	unmatched	bank_transfer	CM2025000018	49c9314c-e527-4df4-ab10-799fb5da0d1d
\.


--
-- Data for Name: daily_summaries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_summaries (id, report_date, sales_cash, sales_twint, sales_sumup, sales_total, expenses_cash, expenses_bank, expenses_total, cash_starting, cash_ending, cash_difference, status, notes, created_by, user_id, created_at, closed_at, organization_id) FROM stdin;
\.


--
-- Data for Name: document_sequences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_sequences (type, current_number, prefix, format, created_at, updated_at) FROM stdin;
monthly_report	36	MB	MB{YYYY}{number:03d}	2025-06-02 20:43:05.913298+00	2025-06-15 22:41:04.935372+00
expense_receipt	31	AG	AG{YYYY}{number:06d}	2025-06-02 20:43:05.913298+00	2025-06-17 20:47:35.000002+00
sale_receipt	51	VK	VK{YYYY}{number:06d}	2025-06-02 20:43:05.913298+00	2025-06-17 21:32:18.79317+00
daily_report	0	TB	TB{YYYY}{number:04d}	2025-06-02 20:43:05.913298+00	2025-06-02 20:51:30.122007+00
bank_transaction	23	BT	BT{YYYY}{number:06d}	2025-06-02 20:43:05.913298+00	2025-06-15 20:18:17.812766+00
cash_movement	21	CM	CM{YYYY}{number:06d}	2025-06-02 20:43:05.913298+00	2025-06-17 21:32:16.458821+00
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, type, reference_id, file_path, payment_method, document_date, user_id, created_at, file_name, file_size, mime_type, reference_type, notes, document_number, organization_id) FROM stdin;
8c9ab3b3-20ba-4e2c-a431-562262a75c7e	receipt	36dec7f9-04d5-4077-9b2b-3a872caafb96	documents/receipts/quittung-36dec7f9-04d5-4077-9b2b-3a872caafb96.pdf	cash	2025-06-15	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:17:26.810715+00	\N	\N	application/pdf	\N	\N	VK2025000017	49c9314c-e527-4df4-ab10-799fb5da0d1d
26644fa0-654c-4393-943f-c684b7f67afc	monthly_report	5d89d8c3-296d-4dec-ab77-8c14c8f904bc	monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 16:44:41.943741+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025001	49c9314c-e527-4df4-ab10-799fb5da0d1d
91531177-30ef-4085-b61f-476807c4ac30	monthly_report	f946d375-94d2-4df4-9cc1-55479d4f0326	monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 16:47:54.378767+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025002	49c9314c-e527-4df4-ab10-799fb5da0d1d
45ec508d-6d94-4c7c-beb4-7d23d4f275bb	monthly_report	0ddff3e4-078b-4aa3-bb8f-18a3b1cbe220	monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 16:51:53.374042+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025003	49c9314c-e527-4df4-ab10-799fb5da0d1d
2bace161-aa52-42c2-bca6-85890aa24276	monthly_report	94d20b5b-1353-4a94-90d5-aec800993ccb	monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 16:54:46.788753+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025004	49c9314c-e527-4df4-ab10-799fb5da0d1d
5b968dff-75bc-486c-a6c8-5bb6a31670bc	monthly_report	82e95e2b-9d33-48ed-b010-2fc63f4d40fe	monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 16:55:29.34355+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025005	49c9314c-e527-4df4-ab10-799fb5da0d1d
37528959-32c4-4692-91ab-0f44402369ec	monthly_report	6e8e233c-a11a-40dc-acdb-b138e388ca4e	monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 16:57:19.523813+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025006	49c9314c-e527-4df4-ab10-799fb5da0d1d
dd060054-dba4-4ce7-bac3-e0813a6c889b	monthly_report	cf558b82-e9f4-4503-9436-92c86a538e2f	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 17:20:49.047716+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025007	49c9314c-e527-4df4-ab10-799fb5da0d1d
50eea244-6bf8-407c-acd1-94919e95f735	monthly_report	96fa2245-47b9-4458-a5cb-55a4dedba310	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 17:28:56.115077+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025008	49c9314c-e527-4df4-ab10-799fb5da0d1d
25a3e8e7-2e8c-423d-b7e8-637279cc3ff5	monthly_report	7f1273d5-a1c2-4cb8-8d9e-4c9afd78a1b6	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 17:30:17.97644+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025009	49c9314c-e527-4df4-ab10-799fb5da0d1d
7ebe1037-d972-4c80-bf1f-3138d5b896f3	monthly_report	a40c5991-6bca-426e-acaa-677ab158a5e2	documents/monthly_reports/monatsabschluss-2025-06.pdf	\N	2025-06-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 17:33:33.748434+00	monatsabschluss-2025-06.pdf	\N	application/pdf	\N	\N	MB2025010	49c9314c-e527-4df4-ab10-799fb5da0d1d
821d4f6a-ac69-4bce-84a5-e4c01102dc01	monthly_report	102f3d9c-bb3b-46ed-99b9-cd7c28555765	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 17:34:59.150556+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025011	49c9314c-e527-4df4-ab10-799fb5da0d1d
f953bb35-d34b-4d0a-bb56-0ac43e3b45bb	monthly_report	544b1550-5e83-4949-8ced-11cd2691c1f5	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 17:36:41.385848+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025012	49c9314c-e527-4df4-ab10-799fb5da0d1d
369f98e2-2638-42af-a074-bfa928a7b81f	monthly_report	eae1047a-ba7b-4339-9784-98a742656eb6	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 18:56:23.477907+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025013	49c9314c-e527-4df4-ab10-799fb5da0d1d
19ac44f8-a954-42a6-be7b-1307c2e1c9f6	monthly_report	2a92deff-0df8-4c3a-b793-050392ca4178	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 18:59:26.805964+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025014	49c9314c-e527-4df4-ab10-799fb5da0d1d
80d944ca-0b04-4b8f-a041-40494d5e89ea	monthly_report	26fdfd04-171a-4de4-a946-ac024b0d539f	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 19:00:41.936337+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025015	49c9314c-e527-4df4-ab10-799fb5da0d1d
0522e03f-3bba-4e48-9f00-677a34eac1c5	monthly_report	1d848a34-7034-4174-8721-cf138305508c	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 19:03:11.587614+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025016	49c9314c-e527-4df4-ab10-799fb5da0d1d
79211d49-c04b-44b2-b937-9efdf26f531a	monthly_report	1b44aa20-af59-43b6-a191-49a36622d187	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 19:09:41.970585+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025017	49c9314c-e527-4df4-ab10-799fb5da0d1d
a30668a0-bc32-4cca-b173-4190d34ea6e3	monthly_report	93f3d7c5-2026-4201-9781-555e54924cf0	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 19:18:48.16818+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025018	49c9314c-e527-4df4-ab10-799fb5da0d1d
23631318-b4c7-4ea4-9469-065a3ac7ab01	monthly_report	da23bfbb-73a7-4d1b-aca5-5dbe49db5abe	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 19:22:17.178834+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025019	49c9314c-e527-4df4-ab10-799fb5da0d1d
50565692-68c6-43f8-a7ac-5e941b742046	expense_receipt	3abb0e84-13cb-43a9-873b-1d8c4e9232c7	documents/expense_receipts/placeholder-beleg-3abb0e84-13cb-43a9-873b-1d8c4e9232c7.pdf	bank	2025-01-28	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 19:29:06.993509+00	placeholder-beleg-3abb0e84-13cb-43a9-873b-1d8c4e9232c7.pdf	5179	application/pdf	expense	Physischer Beleg archiviert	AG2025000006	49c9314c-e527-4df4-ab10-799fb5da0d1d
e46f03f1-3df3-484f-be7f-fa0f7607f72b	monthly_report	cf9b90c7-9060-4879-8497-bddcc57f2d3e	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 19:29:35.520993+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025020	49c9314c-e527-4df4-ab10-799fb5da0d1d
84bb6c97-72b8-4a0c-8936-9cee35be1ebb	monthly_report	f5b1c62f-9686-48dc-8f87-9853e1ab9e17	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 19:37:13.538689+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025021	49c9314c-e527-4df4-ab10-799fb5da0d1d
e84e9aa9-f521-4604-ba11-4f51ccead09a	monthly_report	999a825d-2cc9-4ca7-89d6-29052459ef65	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 19:40:54.470432+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025022	49c9314c-e527-4df4-ab10-799fb5da0d1d
bee44dc2-6272-4b02-b47b-b33fa0957ad7	monthly_report	996da2e6-6cd2-40a6-b5cf-2dd00a08945a	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 19:56:17.705481+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025023	49c9314c-e527-4df4-ab10-799fb5da0d1d
0f9163e0-8045-423b-bae7-1c0f996d8d98	monthly_report	dbf0eb20-fac4-47b9-b4f0-7d5347b8d3a3	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:14:01.861449+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025024	49c9314c-e527-4df4-ab10-799fb5da0d1d
dcb5e281-f8af-4a07-88c5-ae9532a31454	monthly_report	66063c2e-d70c-4070-8e80-b9468b6138fb	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:34:13.585857+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025025	49c9314c-e527-4df4-ab10-799fb5da0d1d
655ca813-c93f-4d27-be49-7b53d78128de	monthly_report	3d36bac9-ee47-42a1-a0fd-81483e59fe47	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:38:40.643499+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025026	49c9314c-e527-4df4-ab10-799fb5da0d1d
f15fa383-9981-4efd-8ffe-05f5d9f39a71	monthly_report	5e71a455-1084-4381-93d7-9c470dfd34bd	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:42:15.158708+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025027	49c9314c-e527-4df4-ab10-799fb5da0d1d
733e7bef-6f0f-4e78-b0c6-2d2c27e792e9	monthly_report	66510b9e-8fc9-43a9-a96a-a7cf78bedca1	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:58:00.112803+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025028	49c9314c-e527-4df4-ab10-799fb5da0d1d
44a84139-75e4-4b57-a3d5-dc95b3be2a0f	monthly_report	7c845c40-fb1c-462b-9c6d-1bb443fb10d5	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 21:01:58.335174+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025029	49c9314c-e527-4df4-ab10-799fb5da0d1d
b06846f9-f47e-4ff8-baba-9f2996edfefe	monthly_report	1d6a05cc-8378-4ba2-9076-675a3f8b91bb	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 21:03:34.503094+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025030	49c9314c-e527-4df4-ab10-799fb5da0d1d
ae434bb2-fb42-4546-91a4-394e3c52ba18	monthly_report	79763ce2-1d8a-4c05-8f59-2559bc956ae0	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 21:06:51.938869+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025031	49c9314c-e527-4df4-ab10-799fb5da0d1d
dbb9c656-05b6-431b-bf35-dab4d46a1f18	monthly_report	5b980e69-c64a-4291-9941-4a496a84d45d	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 21:53:24.303225+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025032	49c9314c-e527-4df4-ab10-799fb5da0d1d
e91bcb28-e938-45bb-b580-984c82532d17	monthly_report	b715e59e-c969-4f69-b9d3-5ca9e785e40a	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 22:08:40.330526+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025033	49c9314c-e527-4df4-ab10-799fb5da0d1d
36bbccaf-f668-4e22-a464-8236532ff3f3	monthly_report	8bad33d8-fcc7-4e7e-a6ee-9f7ed0bcaaa8	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 22:11:09.166404+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025034	49c9314c-e527-4df4-ab10-799fb5da0d1d
058d7d06-0324-41c1-a81a-27f02be438f2	monthly_report	ed867d47-f3a6-4e1b-b9f8-cdddc108d49e	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 22:26:25.831671+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025035	49c9314c-e527-4df4-ab10-799fb5da0d1d
1935c4e5-323c-408f-86c3-8bae1ff0ff3c	monthly_report	18c8ec42-9c3f-4e95-887d-fbc70b6e4117	documents/monthly_reports/monatsabschluss-2025-01.pdf	\N	2025-01-01	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 22:41:04.935372+00	monatsabschluss-2025-01.pdf	\N	application/pdf	\N	\N	MB2025036	49c9314c-e527-4df4-ab10-799fb5da0d1d
2e45fc82-f997-43ef-8d36-f662a445f0ee	expense_receipt	66d2dec3-67e6-4e6a-ad3a-50a635b1cb40	documents/expense_receipts/placeholder-beleg-66d2dec3-67e6-4e6a-ad3a-50a635b1cb40.pdf	bank	2025-06-15	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 23:11:13.379649+00	placeholder-beleg-66d2dec3-67e6-4e6a-ad3a-50a635b1cb40.pdf	5081	application/pdf	expense	Physischer Beleg archiviert	AG2025000009	49c9314c-e527-4df4-ab10-799fb5da0d1d
89d1455d-129c-47d6-b0e7-66c41a1db163	expense_receipt	4115fd68-ed6b-4f62-865f-2b48c66c513e	documents/expense_receipts/placeholder-beleg-4115fd68-ed6b-4f62-865f-2b48c66c513e.pdf	bank	2025-01-15	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 23:11:40.974943+00	placeholder-beleg-4115fd68-ed6b-4f62-865f-2b48c66c513e.pdf	5218	application/pdf	expense	Physischer Beleg archiviert	AG2025000010	49c9314c-e527-4df4-ab10-799fb5da0d1d
96d36760-a93f-4070-84b4-8f234dc6476b	receipt	4d0e6dbd-8c38-4172-ac51-63c179418fc4	documents/receipts/quittung-4d0e6dbd-8c38-4172-ac51-63c179418fc4.pdf	sumup	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:04:44.349902+00	\N	\N	application/pdf	\N	\N	VK2025000019	49c9314c-e527-4df4-ab10-799fb5da0d1d
c2ddbe3b-7059-4b79-b761-cccffdd0a1eb	receipt	cd7c4cec-1ca5-4b46-87a0-19747c673015	documents/receipts/quittung-cd7c4cec-1ca5-4b46-87a0-19747c673015.pdf	twint	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:07:08.915781+00	\N	\N	application/pdf	\N	\N	VK2025000021	49c9314c-e527-4df4-ab10-799fb5da0d1d
dd561782-f60f-4539-b26a-09ac661aa146	expense_receipt	7a8f28a2-9657-4736-8135-bb0b254ad76a	documents/expense_receipts/placeholder-beleg-7a8f28a2-9657-4736-8135-bb0b254ad76a.pdf	bank	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:44:56.731216+00	placeholder-beleg-7a8f28a2-9657-4736-8135-bb0b254ad76a.pdf	5119	application/pdf	expense	Physischer Beleg archiviert	AG2025000012	49c9314c-e527-4df4-ab10-799fb5da0d1d
63544bc8-9961-4e9c-a6a4-14b24a42ff3f	receipt	9da2fcc2-e17f-4415-a667-5587a193bd8c	documents/receipts/quittung-9da2fcc2-e17f-4415-a667-5587a193bd8c.pdf	sumup	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:52:14.681597+00	\N	\N	application/pdf	\N	\N	VK2025000023	49c9314c-e527-4df4-ab10-799fb5da0d1d
f9488c81-79b6-49ce-b4bb-d9399c62ede5	receipt	d4b9994a-0ad9-49cf-bb81-b44c3bb80e9b	documents/receipts/quittung-d4b9994a-0ad9-49cf-bb81-b44c3bb80e9b.pdf	twint	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:52:45.087984+00	\N	\N	application/pdf	\N	\N	VK2025000025	49c9314c-e527-4df4-ab10-799fb5da0d1d
f6b8cd9a-590d-439d-966d-86cb82558472	receipt	bb2cf62d-9d1f-4b86-b8b7-9815e4776a68	documents/receipts/quittung-bb2cf62d-9d1f-4b86-b8b7-9815e4776a68.pdf	twint	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:53:13.196343+00	\N	\N	application/pdf	\N	\N	VK2025000027	49c9314c-e527-4df4-ab10-799fb5da0d1d
54f3ea1a-2db9-49a4-84ad-acbe3ea2f634	receipt	65cd0a58-029b-4bfc-9460-d51b1704751c	documents/receipts/quittung-65cd0a58-029b-4bfc-9460-d51b1704751c.pdf	sumup	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:56:49.639621+00	\N	\N	application/pdf	\N	\N	VK2025000029	49c9314c-e527-4df4-ab10-799fb5da0d1d
ccf64ca1-a94f-4061-a3a9-2cdb348c9085	expense_receipt	1a95db91-1253-4f7f-92cd-b23320ca5368	documents/expense_receipts/placeholder-beleg-1a95db91-1253-4f7f-92cd-b23320ca5368.pdf	bank	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:58:43.22039+00	placeholder-beleg-1a95db91-1253-4f7f-92cd-b23320ca5368.pdf	25261	application/pdf	expense	Physischer Beleg archiviert	AG2025000014	49c9314c-e527-4df4-ab10-799fb5da0d1d
5077b5e1-b784-4722-a840-a3ec9f81a957	expense_receipt	1f5479aa-b74d-452d-a086-e79894ef9cd5	documents/expense_receipts/placeholder-beleg-1f5479aa-b74d-452d-a086-e79894ef9cd5.pdf	bank	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 13:37:47.789686+00	placeholder-beleg-1f5479aa-b74d-452d-a086-e79894ef9cd5.pdf	25175	application/pdf	expense	Physischer Beleg archiviert in: ordner 3	AG2025000016	49c9314c-e527-4df4-ab10-799fb5da0d1d
05be8a02-ae69-4da0-bf26-cbef37691a4e	expense_receipt	c76a428e-f3c0-4902-8248-306c0854d2ff	documents/expense_receipts/placeholder-beleg-c76a428e-f3c0-4902-8248-306c0854d2ff.pdf	bank	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 13:41:48.85731+00	placeholder-beleg-c76a428e-f3c0-4902-8248-306c0854d2ff.pdf	23874	application/pdf	expense	Physischer Beleg archiviert	AG2025000018	49c9314c-e527-4df4-ab10-799fb5da0d1d
4f96ed14-d85b-4b07-ab15-63bdea10879a	expense_receipt	6aaa1723-6a75-4cca-979c-eec69ca89051	documents/expense_receipts/placeholder-beleg-6aaa1723-6a75-4cca-979c-eec69ca89051.pdf	bank	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 13:43:02.87723+00	placeholder-beleg-6aaa1723-6a75-4cca-979c-eec69ca89051.pdf	24064	application/pdf	expense	Physischer Beleg archiviert in: ordner xyz	AG2025000020	49c9314c-e527-4df4-ab10-799fb5da0d1d
4c1547bb-211e-4ccc-94be-90828005de48	expense_receipt	0b395afe-cf46-4eda-8447-4af68a2102aa	documents/expense_receipts/placeholder-beleg-0b395afe-cf46-4eda-8447-4af68a2102aa.pdf	bank	2025-06-10	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 13:48:43.944844+00	placeholder-beleg-0b395afe-cf46-4eda-8447-4af68a2102aa.pdf	23838	application/pdf	expense	Physischer Beleg archiviert in: ordner 2025	AG2025000022	49c9314c-e527-4df4-ab10-799fb5da0d1d
e693a3dd-b799-4829-b304-3c256ce48d85	expense_receipt	1e427b3c-a9fc-47eb-90c2-5a804e3e39d1	documents/expense_receipts/placeholder-beleg-1e427b3c-a9fc-47eb-90c2-5a804e3e39d1.pdf	bank	2025-01-07	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:20:15.997162+00	placeholder-beleg-1e427b3c-a9fc-47eb-90c2-5a804e3e39d1.pdf	23895	application/pdf	expense	Physischer Beleg archiviert	AG2025000023	49c9314c-e527-4df4-ab10-799fb5da0d1d
3d2d25a3-f1ce-4d35-8843-6b1050bf9792	receipt	6c452256-5da5-4f76-b4c9-889fc6034f57	documents/receipts/quittung-6c452256-5da5-4f76-b4c9-889fc6034f57.pdf	sumup	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:39:26.123359+00	\N	\N	application/pdf	\N	\N	VK2025000030	49c9314c-e527-4df4-ab10-799fb5da0d1d
959e278a-2c65-4240-996f-caf8e892ba80	receipt	df6058ef-d786-4c1e-91f5-9f9cd4859140	documents/receipts/quittung-df6058ef-d786-4c1e-91f5-9f9cd4859140.pdf	twint	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:40:29.901988+00	\N	\N	application/pdf	\N	\N	VK2025000031	49c9314c-e527-4df4-ab10-799fb5da0d1d
b60fcc3d-9919-4c00-9c42-7693c9b49908	expense_receipt	468549cc-4e31-46c1-a110-dee3544fc43d	documents/expense_receipts/placeholder-beleg-468549cc-4e31-46c1-a110-dee3544fc43d.pdf	bank	2025-01-20	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:41:17.409655+00	placeholder-beleg-468549cc-4e31-46c1-a110-dee3544fc43d.pdf	23945	application/pdf	expense	Physischer Beleg archiviert	AG2025000024	49c9314c-e527-4df4-ab10-799fb5da0d1d
e6634e17-19dd-4f4e-b8ae-494771815b9f	expense_receipt	27310eea-0eec-4abb-a495-1d3555a56353	documents/expense_receipts/placeholder-beleg-27310eea-0eec-4abb-a495-1d3555a56353.pdf	bank	2025-01-31	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:43:38.428251+00	placeholder-beleg-27310eea-0eec-4abb-a495-1d3555a56353.pdf	23849	application/pdf	expense	Physischer Beleg archiviert	AG2025000025	49c9314c-e527-4df4-ab10-799fb5da0d1d
8a3d5409-376b-4b71-b346-73648b94e62e	receipt	f0b5e55f-28c3-49b0-8cea-8e1b7a4055ab	documents/receipts/quittung-f0b5e55f-28c3-49b0-8cea-8e1b7a4055ab.pdf	sumup	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:43:49.490173+00	\N	\N	application/pdf	\N	\N	VK2025000032	49c9314c-e527-4df4-ab10-799fb5da0d1d
7875162d-ddbc-4b8a-96d1-16c69909f607	receipt	7b2a820f-394c-48a8-a505-7eefc08ffd1a	documents/receipts/quittung-7b2a820f-394c-48a8-a505-7eefc08ffd1a.pdf	cash	2025-06-16	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:44:04.109674+00	\N	\N	application/pdf	\N	\N	VK2025000033	49c9314c-e527-4df4-ab10-799fb5da0d1d
7c9146a4-630c-4231-a789-dad137860a11	receipt	d5ab5c62-4088-45cc-9daf-59ab996b5316	documents/receipts/quittung-d5ab5c62-4088-45cc-9daf-59ab996b5316.pdf	sumup	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 09:48:32.623766+00	\N	\N	application/pdf	\N	\N	VK2025000035	\N
2e2aacf5-5aa4-4cb1-b81f-6e696ef6e5e3	receipt	d334b18c-1921-4852-87cd-97e42cb70d09	documents/receipts/quittung-d334b18c-1921-4852-87cd-97e42cb70d09.pdf	twint	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 15:19:55.166665+00	\N	\N	application/pdf	\N	\N	VK2025000037	\N
f61eda9f-aae2-4305-ba69-7fa8bdd111fb	receipt	213d718e-8d06-4a6c-ac2a-6b9eb4d44d4c	documents/receipts/quittung-213d718e-8d06-4a6c-ac2a-6b9eb4d44d4c.pdf	twint	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 15:37:48.595411+00	\N	\N	application/pdf	\N	\N	VK2025000038	\N
e1c45546-b752-4439-bae2-e15c521e9ce3	receipt	add6aa7b-8502-48e3-88fc-629313c06065	documents/receipts/quittung-add6aa7b-8502-48e3-88fc-629313c06065.pdf	twint	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 15:43:55.28945+00	\N	\N	application/pdf	\N	\N	VK2025000039	\N
6919e7fc-ae8c-4354-89e4-27a8c5625fa9	receipt	99cee850-2c83-4d23-866d-07fcdaa51468	documents/receipts/quittung-99cee850-2c83-4d23-866d-07fcdaa51468.pdf	sumup	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 16:04:28.587369+00	\N	\N	application/pdf	\N	\N	VK2025000040	49c9314c-e527-4df4-ab10-799fb5da0d1d
2aca7bfe-f73c-4d8e-9d2a-85a80822153b	expense_receipt	38c1243e-cf76-405c-8a96-3950cc410802	documents/expense_receipts/placeholder-beleg-38c1243e-cf76-405c-8a96-3950cc410802.pdf	bank	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 16:08:48.727518+00	placeholder-beleg-38c1243e-cf76-405c-8a96-3950cc410802.pdf	23910	application/pdf	expense	Physischer Beleg archiviert in: ordner	AG2025000027	49c9314c-e527-4df4-ab10-799fb5da0d1d
cd6704ed-c7b0-4e6d-9a81-a9f550890133	receipt	08c9174a-63d2-4d3f-bfc6-b3847c026421	documents/receipts/quittung-08c9174a-63d2-4d3f-bfc6-b3847c026421.pdf	cash	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 16:09:22.059721+00	\N	\N	application/pdf	\N	\N	VK2025000041	49c9314c-e527-4df4-ab10-799fb5da0d1d
ad338950-c7e1-4582-83df-9f437979d86f	receipt	a5a88e12-0ebb-4708-b025-f451d5bf84df	documents/receipts/quittung-a5a88e12-0ebb-4708-b025-f451d5bf84df.pdf	twint	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 17:09:03.330899+00	\N	\N	application/pdf	\N	\N	VK2025000043	d3e70d00-36ef-4d1f-81b6-92be7d6163cf
0b36767d-4a50-43c8-babc-e6f834440f0c	receipt	e9fa7dc7-73fd-4661-918b-9e60c8eb18c5	documents/receipts/quittung-e9fa7dc7-73fd-4661-918b-9e60c8eb18c5.pdf	cash	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 17:31:10.286582+00	\N	\N	application/pdf	\N	\N	VK2025000045	d3e70d00-36ef-4d1f-81b6-92be7d6163cf
e402c2ee-1bfe-4a1d-8f5a-50bb42532225	receipt	6fdcfa6d-4014-4959-970f-c8dd35ea1b26	documents/receipts/quittung-6fdcfa6d-4014-4959-970f-c8dd35ea1b26.pdf	cash	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 19:59:31.737795+00	\N	\N	application/pdf	\N	\N	VK2025000047	49c9314c-e527-4df4-ab10-799fb5da0d1d
420c6db3-923d-4c60-8919-ffb1c9cbfb07	expense_receipt	bde76e44-4397-4fb7-8cbd-158d6cf9f878	documents/expense_receipts/placeholder-beleg-bde76e44-4397-4fb7-8cbd-158d6cf9f878.pdf	cash	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:02:47.483532+00	placeholder-beleg-bde76e44-4397-4fb7-8cbd-158d6cf9f878.pdf	23818	application/pdf	expense	Physischer Beleg archiviert in: ordner 2025	AG2025000029	49c9314c-e527-4df4-ab10-799fb5da0d1d
34144c2d-6226-4ea0-9c91-bb2d0afe1d86	receipt	9804af6f-3bc9-4366-a52f-954f2d030018	documents/receipts/quittung-9804af6f-3bc9-4366-a52f-954f2d030018.pdf	cash	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:46:24.766073+00	\N	\N	application/pdf	\N	\N	VK2025000049	49c9314c-e527-4df4-ab10-799fb5da0d1d
79a6f6cf-48d3-436a-a133-10192325f8f5	expense_receipt	6c9f8cce-592f-41a9-a812-3bbc6a45f6b4	documents/expense_receipts/placeholder-beleg-6c9f8cce-592f-41a9-a812-3bbc6a45f6b4.pdf	cash	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:47:35.000002+00	placeholder-beleg-6c9f8cce-592f-41a9-a812-3bbc6a45f6b4.pdf	23806	application/pdf	expense	Physischer Beleg archiviert in: orner	AG2025000031	49c9314c-e527-4df4-ab10-799fb5da0d1d
d3f19f94-032d-4465-8823-7894014193a6	receipt	a34f090d-9bb9-4a7d-a17d-e96f2f9a9d4e	documents/receipts/quittung-a34f090d-9bb9-4a7d-a17d-e96f2f9a9d4e.pdf	cash	2025-06-17	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 21:32:18.79317+00	\N	\N	application/pdf	\N	\N	VK2025000051	d3e70d00-36ef-4d1f-81b6-92be7d6163cf
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, amount, description, category, payment_method, payment_date, supplier_name, invoice_number, notes, user_id, created_at, bank_transaction_id, banking_status, receipt_number, supplier_id, organization_id) FROM stdin;
1e427b3c-a9fc-47eb-90c2-5a804e3e39d1	520.00	Miete Salon Januar	rent	bank	2025-01-07	Heavenly Beauty	\N	Monatliche Salonmiete	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:10.583521+00	b8713174-4845-41a9-89d4-5a63d6cfe502	matched	AG2025000001	c5af14ac-2c2a-406c-8ccd-b3762a8eedf4	49c9314c-e527-4df4-ab10-799fb5da0d1d
27310eea-0eec-4abb-a495-1d3555a56353	35.00	Bankgebühren Januar	other	bank	2025-01-31	\N	\N	Kontoführungsgebühr	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:10.583521+00	8e13d643-a9c5-4f60-9320-80df856b851d	matched	AG2025000005	\N	49c9314c-e527-4df4-ab10-799fb5da0d1d
3abb0e84-13cb-43a9-873b-1d8c4e9232c7	75.50	Salon Reinigung Januar	other	bank	2025-01-28	Reinigung Müller	\N	Wöchentliche Salonreinigung	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:10.583521+00	9fa32485-c1a3-4136-b87a-e9a20547bff4	matched	AG2025000004	4f262daa-55b8-4418-ade1-596d54848a19	49c9314c-e527-4df4-ab10-799fb5da0d1d
4115fd68-ed6b-4f62-865f-2b48c66c513e	285.60	Haarpflegeprodukte Bestellung	supplies	bank	2025-01-15	Salon Supplies GmbH	\N	Shampoo, Conditioner, Styling Products	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:10.583521+00	138a25f8-11a1-473c-becc-3248b73522b3	matched	AG2025000002	ba0d5202-6933-4d64-9483-a75723b61f2f	49c9314c-e527-4df4-ab10-799fb5da0d1d
468549cc-4e31-46c1-a110-dee3544fc43d	150.00	Styling Tools & Equipment	supplies	bank	2025-01-20	Beauty Supply AG	\N	Föhn, Lockenstäbe, Kämme	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:10.583521+00	84685e9a-cc61-4449-8b93-da9b62b340f3	matched	AG2025000003	3a91afd2-d2c6-4391-adaa-6df71d2ecb98	49c9314c-e527-4df4-ab10-799fb5da0d1d
66d2dec3-67e6-4e6a-ad3a-50a635b1cb40	150.00	Leasing	tesla	bank	2025-06-15	Tesla AG	\N	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 23:11:11.534506+00	\N	unmatched	AG2025000008	5596621f-1b92-4f97-a6db-1a78c2ad90b7	49c9314c-e527-4df4-ab10-799fb5da0d1d
7a8f28a2-9657-4736-8135-bb0b254ad76a	45.00	abc	supplies	bank	2025-06-16	New Flag Switzerland AG	\N	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:44:55.67475+00	\N	unmatched	AG2025000011	c77bd8e5-6114-4e97-a840-bee5bab16dd7	49c9314c-e527-4df4-ab10-799fb5da0d1d
1f5479aa-b74d-452d-a086-e79894ef9cd5	433.00	new layout	utilities	bank	2025-06-16	NewFlag	\N	fdrefre	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 13:37:46.529153+00	\N	unmatched	AG2025000015	fddc166f-15c6-4d02-a514-94f39b6744bb	49c9314c-e527-4df4-ab10-799fb5da0d1d
c76a428e-f3c0-4902-8248-306c0854d2ff	123.00	dede	utilities	bank	2025-06-16	New Flag Switzerland AG	\N	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 13:41:47.522721+00	\N	unmatched	AG2025000017	c77bd8e5-6114-4e97-a840-bee5bab16dd7	49c9314c-e527-4df4-ab10-799fb5da0d1d
0b395afe-cf46-4eda-8447-4af68a2102aa	44.00	qaywsx	rent	bank	2025-06-10	NewFlag	\N	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 13:48:43.615523+00	\N	unmatched	AG2025000021	fddc166f-15c6-4d02-a514-94f39b6744bb	49c9314c-e527-4df4-ab10-799fb5da0d1d
38c1243e-cf76-405c-8a96-3950cc410802	123.00	dwdwe	supplies	bank	2025-06-17	NewFlag	re123	123qwe	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 16:08:46.699943+00	\N	unmatched	AG2025000026	fddc166f-15c6-4d02-a514-94f39b6744bb	49c9314c-e527-4df4-ab10-799fb5da0d1d
bde76e44-4397-4fb7-8cbd-158d6cf9f878	50.00	schläcki	other	cash	2025-06-17	kiosk	\N	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:02:46.079826+00	\N	unmatched	AG2025000028	3b4f1e6c-048a-4729-ba46-26d89145c1cd	49c9314c-e527-4df4-ab10-799fb5da0d1d
6c9f8cce-592f-41a9-a812-3bbc6a45f6b4	125.00	kush	salary	cash	2025-06-17	kiosk	\N	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:47:33.353032+00	\N	unmatched	AG2025000030	3b4f1e6c-048a-4729-ba46-26d89145c1cd	49c9314c-e527-4df4-ab10-799fb5da0d1d
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.items (id, name, default_price, type, is_favorite, active, created_at, organization_id) FROM stdin;
6f249340-d343-4019-b250-5efe9d1e8adc	Haarschnitt Damen	65.00	service	t	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
5f890f72-370c-4bf0-b6c1-493f51312fc4	Haarschnitt Herren	45.00	service	t	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
361f6413-3664-48f4-a965-c0a9276b1009	Föhnen	25.00	service	f	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
dacd350e-d54d-479a-9ca4-b9638ffeb554	Waschen & Föhnen	35.00	service	t	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
76c28aeb-e62b-420f-96d2-5159de876498	Färben	85.00	service	f	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
b3967847-e900-4f43-bfa6-697d0b2bf447	Strähnchen	120.00	service	f	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
3b632f1e-afac-415a-bc8e-8cc0bff21e8c	Dauerwelle	95.00	service	f	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
5122d199-e7c5-41b7-8a92-be15ef9ecf43	Bartschnitt	25.00	service	f	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
d364f7af-0a8e-46b5-9e90-1ca5cefe2f37	Haarkur Intensiv	28.00	product	f	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
b57ce469-0056-4fa6-8c15-7d5f3b1afaca	Haarspray Extra Strong	16.00	product	t	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
2ab5102e-e58f-405a-9b3f-c308b3aebdec	Conditioner Premium	22.00	product	f	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
a79cd456-0bff-420f-80a5-d836d017998a	Shampoo Professional	18.50	product	t	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
280d1526-d9c2-4cf5-82b5-67046f72a19e	Haarschnitt Kinder	30.00	service	t	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
523a63f0-2d19-47fd-880a-e3c7cd79fa8f	Styling Gel	14.50	product	t	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
2f367a7f-2cd3-441f-be19-e4fc7f691fc7	Kinderhaarschnitt	45.00	service	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
af106f75-3a86-4359-a87f-53406279bf9d	Pony schneiden	25.00	service	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
99f66e22-1181-43c6-928e-68226ca5c0a5	Komplettfärbung	120.00	service	t	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
f8c063dd-fec8-43e0-aa5c-b746f35aa643	Ansatzfärbung	80.00	service	t	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
64652a31-2de5-4970-a517-1a000d180ad4	Strähnen	95.00	service	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
85cfb231-72f1-4556-9b3e-ee94716f6d3c	Balayage	150.00	service	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
de014f48-f97d-4ace-8288-7f3f3f1aa344	Tönung	60.00	service	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
7062d736-cb0d-4ee1-9744-c44fec755f76	Föhnen & Styling	35.00	service	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
ce5c5604-0b26-41dc-be2e-0e29c5038bb1	Hochsteckfrisur	75.00	service	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
1cbb7be3-7719-4bf1-bd1d-d429d1f636d8	Haarkur-Behandlung	45.00	service	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
a8f70dc2-a48e-4df1-bb23-4de5e6bdfde2	Kopfhautmassage	25.00	service	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
794a7acc-8c24-43f2-a55d-063c237d716a	Glättung	130.00	service	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
bc7a9160-f5ad-491e-bce6-370d0536d8a2	Haarverlängerung	220.00	service	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
b415f630-5e9d-4164-8e93-5e8712378606	Conditioner Professional	32.00	product	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
96af4a23-6f27-41a9-8193-79e1532c5b7f	Haaröl Treatment	45.00	product	\N	\N	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
6412be7f-cae4-4c9a-95fc-7072a0a98a1f	Individueller Betrag	50.00	service	f	t	2025-05-29 15:18:03.533817+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
00d3dfe0-3af6-452e-bd6a-900b53009051	Augenbrauen zupfen	15.00	service	t	t	2025-05-27 14:47:02.927141+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
c7add847-fc09-41a8-b09f-ed18d18938c2	test	45.00	product	f	t	2025-06-01 14:51:52.954386+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
eac91639-d70f-4a38-817e-5365f3cfbdc5	Herrenschnitt	45.00	service	t	t	2025-06-15 22:50:50.956214+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
d8202016-b560-492f-822f-847da16978dc	Damenschnitt	65.00	service	t	t	2025-06-15 22:50:50.956214+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
501c69de-d2b7-4e84-a4dd-2cadd9be5a5e	Waschen & Föhnen	35.00	service	t	t	2025-06-15 22:50:50.956214+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
f3a77673-39a4-4b40-97f5-1687a926e95a	Färben	85.00	service	f	t	2025-06-15 22:50:50.956214+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
6696d5fa-2a1a-4b1d-92a8-99baf3f869bb	Dauerwelle	120.00	service	f	t	2025-06-15 22:50:50.956214+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
4ba7a30c-f194-4791-8fb8-42b49da5e012	Bart trimmen	25.00	service	t	t	2025-06-15 22:50:50.956214+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
1aba8cb9-db7e-41b0-aa9f-42dd105507e9	Shampoo Professional	24.90	product	f	t	2025-06-15 22:50:50.956214+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
6d253ed3-2bb9-4891-8cc6-ff38d0fc1d4d	Conditioner	19.90	product	f	t	2025-06-15 22:50:50.956214+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
5c0291e4-33c6-4b35-b05a-5cfb1c25b763	Haargel	15.50	product	t	t	2025-06-15 22:50:50.956214+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
2a917d5b-1e70-4b48-bea1-00fa8d4b5e6b	Haarspray	18.00	product	f	t	2025-06-15 22:50:50.956214+00	49c9314c-e527-4df4-ab10-799fb5da0d1d
9035851b-9671-4ea2-bd87-fee3b6ad3b32	test salon produkt	45.00	product	f	t	2025-06-17 17:08:12.248724+00	d3e70d00-36ef-4d1f-81b6-92be7d6163cf
3be3f1a5-cb2e-44b9-8b86-658223bd24c1	testsalon dienstleistung bearbeitet	71.00	service	t	t	2025-06-17 17:08:27.956639+00	d3e70d00-36ef-4d1f-81b6-92be7d6163cf
\.


--
-- Data for Name: monthly_summaries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.monthly_summaries (id, year, month, sales_cash, sales_twint, sales_sumup, sales_total, expenses_cash, expenses_bank, expenses_total, transaction_count, avg_daily_revenue, status, notes, created_by, user_id, created_at, closed_at, organization_id) FROM stdin;
\.


--
-- Data for Name: organization_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_users (id, organization_id, user_id, role, invited_by, joined_at, created_at, active) FROM stdin;
aacd88b8-0a3f-4dfa-80d1-b4dc168a5725	49c9314c-e527-4df4-ab10-799fb5da0d1d	dd1329e7-5439-43ad-989b-0b8f5714824b	owner	\N	2025-06-16 20:44:43.683195+00	2025-06-16 20:44:43.683195+00	t
488533c9-4f78-4e07-830a-875b5a7d8fcb	d3e70d00-36ef-4d1f-81b6-92be7d6163cf	dd1329e7-5439-43ad-989b-0b8f5714824b	owner	\N	2025-06-17 16:42:20.832749+00	2025-06-17 16:42:20.832749+00	t
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, slug, display_name, created_at, updated_at, active, address, city, postal_code, phone, email, website, uid, settings) FROM stdin;
49c9314c-e527-4df4-ab10-799fb5da0d1d	Lia Hair	lia-hair	Lia Hair by Zilfije Rupp	2025-06-16 20:44:35.011459+00	2025-06-16 20:44:35.011459+00	t	\N	\N	\N	\N	admin@lia-hair.ch	\N	\N	{}
d3e70d00-36ef-4d1f-81b6-92be7d6163cf	Test Salon	test-salon	Test Salon für Multi-Tenant Testing	2025-06-17 16:42:14.804903+00	2025-06-17 16:42:14.804903+00	t	Teststrasse 123	Zürich	8001	+41 44 123 45 67	test@test-salon.ch	https://test-salon.ch	\N	{"tax_rate": 7.7, "pdf_show_logo": true, "default_currency": "CHF", "pdf_show_company_details": true, "custom_expense_categories": {}}
\.


--
-- Data for Name: owner_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.owner_transactions (id, transaction_type, amount, description, transaction_date, payment_method, related_expense_id, related_bank_transaction_id, banking_status, user_id, created_at, updated_at, notes, organization_id) FROM stdin;
223c0206-c3fa-4540-98d4-51d426ef345a	withdrawal	800.00	Privatentnahme Januar	2025-01-25	bank_transfer	\N	b466f70f-2346-4f59-b0b8-3e5c0d047a61	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:10.583521+00	2025-06-16 14:19:40.929864+00	Owner withdrawal for personal use	\N
b0dfaac7-385f-43c5-86f6-a7d92ce6fd09	deposit	2000.00	Kapitaleinlage Januar	2025-01-03	bank_transfer	\N	51f4424e-3cc4-4330-841c-119eb426e1cf	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:10.583521+00	2025-06-16 14:19:40.929864+00	Owner capital injection for business expenses	\N
f56e3a6b-093c-4561-9961-85cbdc6c320d	deposit	20.00	kassic	2025-06-17	private_cash	\N	\N	unmatched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:10:38.618316+00	2025-06-17 20:10:38.618316+00	\N	\N
964da200-2f45-4aee-bf31-e6ed1b7ee05f	withdrawal	21.00	kissuc	2025-06-17	private_cash	\N	\N	unmatched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:10:54.236817+00	2025-06-17 20:10:54.236817+00	\N	\N
861d0b1d-a2fe-4a7c-8437-58f77da0dea1	withdrawal	2000.00	sefde	2025-06-17	bank_transfer	\N	\N	unmatched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:55:59.204983+00	2025-06-17 20:55:59.204983+00	\N	\N
9edba8d7-0bc3-489a-8a0d-4f7fd861760a	deposit	2000.00	getrgrt	2025-06-17	bank_transfer	\N	\N	unmatched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:56:09.897753+00	2025-06-17 20:56:09.897753+00	\N	\N
b3f1a3f4-7cff-493d-aaa4-4eaf960ff000	deposit	150.00	refer	2025-06-17	private_cash	\N	\N	unmatched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:57:58.428275+00	2025-06-17 20:57:58.428275+00	\N	\N
165c5df0-7da2-46b2-8a3f-6cc1df537066	withdrawal	150.00	frefre	2025-06-17	private_cash	\N	\N	unmatched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:58:10.824218+00	2025-06-17 20:58:10.824218+00	\N	\N
2252ddd9-9006-4406-a5a8-cb28a24b287c	deposit	130.00	sqwd	2025-06-17	private_cash	\N	\N	unmatched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 21:05:22.111942+00	2025-06-17 21:05:22.111942+00	\N	49c9314c-e527-4df4-ab10-799fb5da0d1d
7d148623-1cca-4883-9624-c4645449781e	withdrawal	100.00	iuhniu	2025-06-17	private_cash	\N	\N	unmatched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 21:05:30.594096+00	2025-06-17 21:05:30.594096+00	\N	49c9314c-e527-4df4-ab10-799fb5da0d1d
\.


--
-- Data for Name: provider_import_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_import_sessions (id, provider, filename, status, imported_by, created_at, import_type, total_records, new_records, duplicate_records, error_records, date_range_from, date_range_to, completed_at, notes, records_imported, records_failed, organization_id) FROM stdin;
\.


--
-- Data for Name: provider_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_reports (id, provider, transaction_date, settlement_date, gross_amount, fees, net_amount, provider_transaction_id, provider_reference, payment_method, currency, import_filename, import_date, raw_data, sale_id, status, user_id, created_at, updated_at, notes, organization_id) FROM stdin;
a6d52cc0-2038-4d27-b6d8-61f08d2eb5e9	twint	2025-01-06	2025-01-08	85.50	2.57	82.93	TW20250106001	\N	\N	CHF	twint_january_week1.csv	2025-06-15 14:59:15.58668+00	\N	c0fc4b26-e820-4750-a1e4-cf46cea333c0	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:15.58668+00	2025-06-15 14:59:15.58668+00	\N	\N
dc7f75cd-7dc5-4bb8-94e6-70379b624350	sumup	2025-01-08	2025-01-10	65.00	1.95	63.05	SU20250108001	\N	\N	CHF	sumup_january_batch1.csv	2025-06-15 14:59:15.58668+00	\N	81514f9d-2ab2-42f3-bcfc-05c1d53035d1	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:15.58668+00	2025-06-15 14:59:15.58668+00	\N	\N
cec68e47-1b39-417c-aec7-2cd3b4686811	twint	2025-01-09	2025-01-11	95.00	2.85	92.15	TW20250109001	\N	\N	CHF	twint_january_week1.csv	2025-06-15 14:59:15.58668+00	\N	b45fff77-88ab-4f8f-9581-248b24e6685d	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:15.58668+00	2025-06-15 14:59:15.58668+00	\N	\N
82002e3f-3d39-4ba8-a9c9-9444aef6f405	sumup	2025-01-13	2025-01-15	75.00	2.25	72.75	SU20250113001	\N	\N	CHF	sumup_january_batch2.csv	2025-06-15 14:59:15.58668+00	\N	85fde96f-7094-4af4-ad5b-1e6f87c01684	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:15.58668+00	2025-06-15 14:59:15.58668+00	\N	\N
0c3fb31c-219a-4cbc-9605-3991483dae3d	twint	2025-01-15	2025-01-17	55.00	1.65	53.35	TW20250115001	\N	\N	CHF	twint_january_week2.csv	2025-06-15 14:59:15.58668+00	\N	81736ac4-b51e-4a3a-8f87-7c0a2d4d6c9e	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:15.58668+00	2025-06-15 14:59:15.58668+00	\N	\N
b7c13789-1a8c-4c10-8a53-11eac323f2d4	sumup	2025-01-16	2025-01-18	125.00	3.75	121.25	SU20250116001	\N	\N	CHF	sumup_january_batch2.csv	2025-06-15 14:59:15.58668+00	\N	99cee850-2c83-4d23-866d-07fcdaa51468	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:15.58668+00	2025-06-15 14:59:15.58668+00	\N	\N
e0826f13-9842-4e72-a2b5-3e4c511c7f70	twint	2025-01-20	2025-01-22	80.00	2.40	77.60	TW20250120001	\N	\N	CHF	twint_january_week3.csv	2025-06-15 14:59:15.58668+00	\N	add6aa7b-8502-48e3-88fc-629313c06065	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:15.58668+00	2025-06-15 14:59:15.58668+00	\N	\N
812f4f78-2314-4dfb-a317-5cb15c759d34	sumup	2025-01-22	2025-01-24	90.00	2.70	87.30	SU20250122001	\N	\N	CHF	sumup_january_batch3.csv	2025-06-15 14:59:15.58668+00	\N	f0b5e55f-28c3-49b0-8cea-8e1b7a4055ab	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:15.58668+00	2025-06-15 14:59:15.58668+00	\N	\N
9324f664-6041-4447-bb45-ebf9b7e37638	twint	2025-01-27	2025-01-29	105.00	3.15	101.85	TW20250127001	\N	\N	CHF	twint_january_week4.csv	2025-06-15 14:59:15.58668+00	\N	213d718e-8d06-4a6c-ac2a-6b9eb4d44d4c	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:15.58668+00	2025-06-15 14:59:15.58668+00	\N	\N
4d6594c0-b60b-47aa-a2ae-68e14ef9fa85	sumup	2025-01-28	2025-01-30	60.00	1.80	58.20	SU20250128001	\N	\N	CHF	sumup_january_batch4.csv	2025-06-15 14:59:15.58668+00	\N	6c452256-5da5-4f76-b4c9-889fc6034f57	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:15.58668+00	2025-06-15 14:59:15.58668+00	\N	\N
be3fdf60-a989-4a19-b2d1-4cacc794acfa	twint	2025-01-30	2025-02-01	85.00	2.55	82.45	TW20250130001	\N	\N	CHF	twint_january_week4.csv	2025-06-15 14:59:15.58668+00	\N	df6058ef-d786-4c1e-91f5-9f9cd4859140	matched	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 14:59:15.58668+00	2025-06-15 14:59:15.58668+00	\N	\N
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_items (id, sale_id, item_id, price, notes, organization_id) FROM stdin;
cee86ce9-5eec-4cab-933a-902ce5bf5185	36dec7f9-04d5-4077-9b2b-3a872caafb96	5f890f72-370c-4bf0-b6c1-493f51312fc4	45.00	\N	\N
f06348f9-02db-4680-8395-cc201c880a90	4d0e6dbd-8c38-4172-ac51-63c179418fc4	4ba7a30c-f194-4791-8fb8-42b49da5e012	25.00	\N	\N
23ded079-5017-4099-9089-56fa37c61b65	cd7c4cec-1ca5-4b46-87a0-19747c673015	4ba7a30c-f194-4791-8fb8-42b49da5e012	25.00	\N	\N
7fce651e-4eb0-46a7-b0bf-ec7c3a81f5c3	9da2fcc2-e17f-4415-a667-5587a193bd8c	00d3dfe0-3af6-452e-bd6a-900b53009051	15.00	\N	\N
715164ae-77d5-4eb2-aaed-07d137aa58e4	d4b9994a-0ad9-49cf-bb81-b44c3bb80e9b	501c69de-d2b7-4e84-a4dd-2cadd9be5a5e	35.00	\N	\N
e309e9ce-6fd2-4c7f-8cd4-de6d9f882ce2	bb2cf62d-9d1f-4b86-b8b7-9815e4776a68	a79cd456-0bff-420f-80a5-d836d017998a	18.50	\N	\N
3d3aa3fd-a6b0-4901-9664-3fbb72338a81	65cd0a58-029b-4bfc-9460-d51b1704751c	b57ce469-0056-4fa6-8c15-7d5f3b1afaca	16.00	\N	\N
eabc9e7b-ab67-472f-a176-1f248c170964	d5ab5c62-4088-45cc-9daf-59ab996b5316	eac91639-d70f-4a38-817e-5365f3cfbdc5	45.00	\N	\N
c455c082-03c6-4d42-ad51-aa066b1e2917	d334b18c-1921-4852-87cd-97e42cb70d09	d8202016-b560-492f-822f-847da16978dc	65.00	\N	\N
87166c4c-3d38-4928-bd9c-397e06559c1d	a5a88e12-0ebb-4708-b025-f451d5bf84df	3be3f1a5-cb2e-44b9-8b86-658223bd24c1	71.00	\N	\N
2cd7af0e-ac42-46ca-b95a-a6504b34336a	e9fa7dc7-73fd-4661-918b-9e60c8eb18c5	3be3f1a5-cb2e-44b9-8b86-658223bd24c1	71.00	\N	\N
4922edc5-9620-4464-a0c0-f77b5e764d9b	6fdcfa6d-4014-4959-970f-c8dd35ea1b26	4ba7a30c-f194-4791-8fb8-42b49da5e012	25.00	\N	\N
a7300aa5-2853-448a-b0a6-9353231aea49	9804af6f-3bc9-4366-a52f-954f2d030018	d8202016-b560-492f-822f-847da16978dc	65.00	\N	\N
11a98e3f-674c-4537-a5d1-3e7c6a0a6bd3	a34f090d-9bb9-4a7d-a17d-e96f2f9a9d4e	3be3f1a5-cb2e-44b9-8b86-658223bd24c1	71.00	\N	\N
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales (id, total_amount, payment_method, status, notes, user_id, created_at, gross_amount, provider_fee, net_amount, settlement_status, settlement_date, provider_reference_id, provider_report_id, bank_transaction_id, banking_status, receipt_number, organization_id) FROM stdin;
902d9836-2f44-47fd-a8d8-3f55f34e4246	120.00	cash	completed	Dauerwelle + Föhnen	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-07 10:15:00+00	\N	\N	\N	pending	\N	\N	\N	\N	fully_matched	VK2025000002	49c9314c-e527-4df4-ab10-799fb5da0d1d
27acc2cb-6a6c-4cdd-80ec-04fc6521184d	110.00	cash	completed	Extensions + Styling	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-14 09:30:00+00	\N	\N	\N	pending	\N	\N	\N	\N	fully_matched	VK2025000006	49c9314c-e527-4df4-ab10-799fb5da0d1d
7b2a820f-394c-48a8-a505-7eefc08ffd1a	70.00	cash	completed	Perm + Cut	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-21 14:00:00+00	\N	\N	\N	pending	\N	\N	\N	\N	fully_matched	VK2025000010	49c9314c-e527-4df4-ab10-799fb5da0d1d
08c9174a-63d2-4d3f-bfc6-b3847c026421	135.00	cash	completed	Full Hair Makeover	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-29 13:30:00+00	\N	\N	\N	pending	\N	\N	\N	\N	fully_matched	VK2025000014	49c9314c-e527-4df4-ab10-799fb5da0d1d
36dec7f9-04d5-4077-9b2b-3a872caafb96	45.00	cash	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:17:25.14549+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000016	49c9314c-e527-4df4-ab10-799fb5da0d1d
4d0e6dbd-8c38-4172-ac51-63c179418fc4	25.00	sumup	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:04:43.390544+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000018	49c9314c-e527-4df4-ab10-799fb5da0d1d
cd7c4cec-1ca5-4b46-87a0-19747c673015	25.00	twint	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:07:08.754775+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000020	49c9314c-e527-4df4-ab10-799fb5da0d1d
9da2fcc2-e17f-4415-a667-5587a193bd8c	15.00	sumup	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:52:13.658042+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000022	49c9314c-e527-4df4-ab10-799fb5da0d1d
d4b9994a-0ad9-49cf-bb81-b44c3bb80e9b	35.00	twint	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:52:44.911209+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000024	49c9314c-e527-4df4-ab10-799fb5da0d1d
bb2cf62d-9d1f-4b86-b8b7-9815e4776a68	18.50	twint	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:53:11.962615+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000026	49c9314c-e527-4df4-ab10-799fb5da0d1d
65cd0a58-029b-4bfc-9460-d51b1704751c	16.00	sumup	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:56:48.463203+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000028	49c9314c-e527-4df4-ab10-799fb5da0d1d
c0fc4b26-e820-4750-a1e4-cf46cea333c0	85.50	twint	completed	Haarschnitt + Styling	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-06 14:30:00+00	\N	\N	\N	pending	\N	\N	a6d52cc0-2038-4d27-b6d8-61f08d2eb5e9	\N	fully_matched	VK2025000001	49c9314c-e527-4df4-ab10-799fb5da0d1d
81514f9d-2ab2-42f3-bcfc-05c1d53035d1	65.00	sumup	completed	Färben + Schnitt	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-08 16:45:00+00	\N	\N	\N	pending	\N	\N	dc7f75cd-7dc5-4bb8-94e6-70379b624350	\N	fully_matched	VK2025000003	49c9314c-e527-4df4-ab10-799fb5da0d1d
b45fff77-88ab-4f8f-9581-248b24e6685d	95.00	twint	completed	Hochzeitsfrisur	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-09 11:20:00+00	\N	\N	\N	pending	\N	\N	cec68e47-1b39-417c-aec7-2cd3b4686811	\N	fully_matched	VK2025000004	49c9314c-e527-4df4-ab10-799fb5da0d1d
85fde96f-7094-4af4-ad5b-1e6f87c01684	75.00	sumup	completed	Balayage	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-13 15:10:00+00	\N	\N	\N	pending	\N	\N	82002e3f-3d39-4ba8-a9c9-9444aef6f405	\N	fully_matched	VK2025000005	49c9314c-e527-4df4-ab10-799fb5da0d1d
81736ac4-b51e-4a3a-8f87-7c0a2d4d6c9e	55.00	twint	completed	Wash + Cut	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-15 13:45:00+00	\N	\N	\N	pending	\N	\N	0c3fb31c-219a-4cbc-9605-3991483dae3d	\N	fully_matched	VK2025000007	49c9314c-e527-4df4-ab10-799fb5da0d1d
99cee850-2c83-4d23-866d-07fcdaa51468	125.00	sumup	completed	Keratin Treatment	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-16 17:00:00+00	\N	\N	\N	pending	\N	\N	b7c13789-1a8c-4c10-8a53-11eac323f2d4	\N	fully_matched	VK2025000008	49c9314c-e527-4df4-ab10-799fb5da0d1d
add6aa7b-8502-48e3-88fc-629313c06065	80.00	twint	completed	Color Touch-up	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-20 12:15:00+00	\N	\N	\N	pending	\N	\N	e0826f13-9842-4e72-a2b5-3e4c511c7f70	\N	fully_matched	VK2025000009	49c9314c-e527-4df4-ab10-799fb5da0d1d
f0b5e55f-28c3-49b0-8cea-8e1b7a4055ab	90.00	sumup	completed	Highlights + Blow-dry	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-22 10:30:00+00	\N	\N	\N	pending	\N	\N	812f4f78-2314-4dfb-a317-5cb15c759d34	\N	fully_matched	VK2025000011	49c9314c-e527-4df4-ab10-799fb5da0d1d
213d718e-8d06-4a6c-ac2a-6b9eb4d44d4c	105.00	twint	completed	Special Event Hair	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-27 16:20:00+00	\N	\N	\N	pending	\N	\N	9324f664-6041-4447-bb45-ebf9b7e37638	\N	fully_matched	VK2025000012	49c9314c-e527-4df4-ab10-799fb5da0d1d
6c452256-5da5-4f76-b4c9-889fc6034f57	60.00	sumup	completed	Trim + Style	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-28 11:45:00+00	\N	\N	\N	pending	\N	\N	4d6594c0-b60b-47aa-a2ae-68e14ef9fa85	\N	fully_matched	VK2025000013	49c9314c-e527-4df4-ab10-799fb5da0d1d
df6058ef-d786-4c1e-91f5-9f9cd4859140	85.00	twint	completed	Deep Conditioning + Cut	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-01-30 15:15:00+00	\N	\N	\N	pending	\N	\N	be3fdf60-a989-4a19-b2d1-4cacc794acfa	\N	fully_matched	VK2025000015	49c9314c-e527-4df4-ab10-799fb5da0d1d
d5ab5c62-4088-45cc-9daf-59ab996b5316	45.00	sumup	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 09:48:30.552373+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000034	49c9314c-e527-4df4-ab10-799fb5da0d1d
d334b18c-1921-4852-87cd-97e42cb70d09	65.00	twint	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 15:19:53.68399+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000036	49c9314c-e527-4df4-ab10-799fb5da0d1d
a5a88e12-0ebb-4708-b025-f451d5bf84df	71.00	twint	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 17:09:01.244398+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000042	d3e70d00-36ef-4d1f-81b6-92be7d6163cf
e9fa7dc7-73fd-4661-918b-9e60c8eb18c5	142.00	cash	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 17:31:08.77142+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000044	d3e70d00-36ef-4d1f-81b6-92be7d6163cf
6fdcfa6d-4014-4959-970f-c8dd35ea1b26	25.00	cash	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 19:59:30.377283+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000046	49c9314c-e527-4df4-ab10-799fb5da0d1d
9804af6f-3bc9-4366-a52f-954f2d030018	65.00	cash	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:46:22.964845+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000048	49c9314c-e527-4df4-ab10-799fb5da0d1d
a34f090d-9bb9-4a7d-a17d-e96f2f9a9d4e	71.00	cash	completed	\N	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 21:32:16.349444+00	\N	\N	\N	pending	\N	\N	\N	\N	unmatched	VK2025000050	d3e70d00-36ef-4d1f-81b6-92be7d6163cf
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, name, normalized_name, category, contact_email, contact_phone, website, address_line1, address_line2, postal_code, city, country, iban, vat_number, is_active, notes, created_at, updated_at, created_by, organization_id) FROM stdin;
da8461ef-d6b4-43b5-bb6e-4516951a52ce	HeavenlyBeauty	heavenlybeauty	rent	\N	\N	\N	\N	\N	\N	\N	CH	\N	\N	t	\N	2025-06-14 07:33:17.715413+00	2025-06-14 07:41:36.523635+00	dd1329e7-5439-43ad-989b-0b8f5714824b	\N
3a91afd2-d2c6-4391-adaa-6df71d2ecb98	Beauty Supply AG	beauty supply ag	other	\N	\N	\N	\N	\N	\N	\N	CH	\N	\N	t	Auto-created from expense entry	2025-06-15 10:52:37.795351+00	2025-06-15 10:52:37.795351+00	dd1329e7-5439-43ad-989b-0b8f5714824b	\N
4f262daa-55b8-4418-ade1-596d54848a19	Reinigung Müller	reinigung mller	other	\N	\N	\N	\N	\N	\N	\N	CH	\N	\N	t	Auto-created from expense entry	2025-06-15 10:52:37.795351+00	2025-06-15 10:52:37.795351+00	dd1329e7-5439-43ad-989b-0b8f5714824b	\N
ba0d5202-6933-4d64-9483-a75723b61f2f	Salon Supplies GmbH	salon supplies gmbh	other	\N	\N	\N	\N	\N	\N	\N	CH	\N	\N	t	Auto-created from expense entry	2025-06-15 11:02:43.404146+00	2025-06-15 11:02:43.404146+00	dd1329e7-5439-43ad-989b-0b8f5714824b	\N
c5af14ac-2c2a-406c-8ccd-b3762a8eedf4	Heavenly Beauty	heavenly beauty	other	\N	\N	\N	\N	\N	\N	\N	CH	\N	\N	t	Auto-created from expense entry	2025-06-15 12:16:00.018182+00	2025-06-15 12:16:00.018182+00	dd1329e7-5439-43ad-989b-0b8f5714824b	\N
c77bd8e5-6114-4e97-a840-bee5bab16dd7	New Flag Switzerland AG	new flag switzerland ag	other	\N	\N	\N	\N	\N	\N	\N	CH	\N	\N	t	Auto-created from expense entry	2025-06-15 12:16:00.018182+00	2025-06-15 12:16:00.018182+00	dd1329e7-5439-43ad-989b-0b8f5714824b	\N
fddc166f-15c6-4d02-a514-94f39b6744bb	NewFlag	newflag	other	\N	\N	\N	\N	\N	\N	\N	CH	\N	\N	t	Auto-created from expense entry	2025-06-15 14:58:27.659616+00	2025-06-15 14:58:27.659616+00	dd1329e7-5439-43ad-989b-0b8f5714824b	\N
67848227-a2cb-4d39-b9e8-603d9559cbd2	Aliexpress	aliexpress	other	\N	\N	\N	\N	\N	\N	\N	CH	\N	\N	t	Auto-created from expense entry	2025-06-15 14:58:27.659616+00	2025-06-15 14:58:27.659616+00	dd1329e7-5439-43ad-989b-0b8f5714824b	\N
5596621f-1b92-4f97-a6db-1a78c2ad90b7	Tesla AG	tesla ag	utilities	\N	\N	\N	\N	\N	\N	\N	CH	\N	\N	t	\N	2025-06-15 23:11:05.666832+00	2025-06-15 23:11:05.666832+00	dd1329e7-5439-43ad-989b-0b8f5714824b	\N
3b4f1e6c-048a-4729-ba46-26d89145c1cd	kiosk	kiosk	other	\N	\N	\N	\N	\N	\N	\N	CH	\N	\N	t	\N	2025-06-17 20:02:33.526297+00	2025-06-17 20:02:33.526297+00	dd1329e7-5439-43ad-989b-0b8f5714824b	\N
\.


--
-- Data for Name: transaction_matches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transaction_matches (id, bank_transaction_id, matched_type, matched_id, matched_amount, match_confidence, match_type, matched_by, matched_at, notes, organization_id) FROM stdin;
723bffce-a8cb-4971-b9a6-c57c763cb2ca	b8713174-4845-41a9-89d4-5a63d6cfe502	expense	1e427b3c-a9fc-47eb-90c2-5a804e3e39d1	520.00	100.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:12.829163+00	Auto-matched: Business expense by description	\N
6b4822e1-b3b8-48b8-a0e0-4f0de8719d6a	138a25f8-11a1-473c-becc-3248b73522b3	expense	4115fd68-ed6b-4f62-865f-2b48c66c513e	285.60	100.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:12.829163+00	Auto-matched: Business expense by description	\N
f89c4f5c-76ae-4db4-9d86-2ef13119a06e	84685e9a-cc61-4449-8b93-da9b62b340f3	expense	468549cc-4e31-46c1-a110-dee3544fc43d	150.00	100.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:12.829163+00	Auto-matched: Business expense by description	\N
4f5b0d8a-ee73-4a5b-a423-850117ced527	9fa32485-c1a3-4136-b87a-e9a20547bff4	expense	3abb0e84-13cb-43a9-873b-1d8c4e9232c7	75.50	100.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:12.829163+00	Auto-matched: Business expense by description	\N
93996895-8db1-4cff-ad08-32ba66f324ef	8e13d643-a9c5-4f60-9320-80df856b851d	expense	27310eea-0eec-4abb-a495-1d3555a56353	35.00	100.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:12.829163+00	Auto-matched: Business expense by description	\N
49315341-f2d7-4f24-acb6-b7bb51a17dc3	51f4424e-3cc4-4330-841c-119eb426e1cf	owner_transaction	b0dfaac7-385f-43c5-86f6-a7d92ce6fd09	2000.00	100.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:12.829163+00	Auto-matched: Owner transaction by amount and date	\N
d73e7604-e521-4c26-b9d1-b1c8a295fab2	b466f70f-2346-4f59-b0b8-3e5c0d047a61	owner_transaction	223c0206-c3fa-4540-98d4-51d426ef345a	800.00	100.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:00:12.829163+00	Auto-matched: Owner transaction by amount and date	\N
61cd6e49-8c0c-4edf-b92b-c698d7894063	169062d8-afc1-4b1c-9819-b6b6fc28a9f6	provider_batch	be3fdf60-a989-4a19-b2d1-4cacc794acfa	82.45	100.00	manual	\N	2025-06-15 16:28:39.100466+00	\N	\N
3c8044f9-25c2-4350-8592-c0c7e31179d8	2b500c23-c59a-4db8-a9d5-96d6145d1cf6	provider_batch	00000000-0000-0000-0000-000000000000	145.08	90.00	manual	\N	2025-06-15 16:32:52.582272+00	Settlement from previous period - January 2025 analysis confirmed no matching provider reports in current period	\N
6bea9c19-6709-4631-9c8a-91001a008ea0	35f878c9-f263-480a-bc61-40634ce1c946	provider_batch	dc7f75cd-7dc5-4bb8-94e6-70379b624350	63.05	95.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:55.927156+00	\N	\N
d34028c3-cf52-46a5-90f9-985561eb1c74	35f878c9-f263-480a-bc61-40634ce1c946	provider_batch	82002e3f-3d39-4ba8-a9c9-9444aef6f405	72.75	95.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:55.927156+00	\N	\N
38525316-5fc8-450f-a387-67d3776d8008	8d09b2ab-4641-4ab2-bfed-d6cc4f069e4d	provider_batch	812f4f78-2314-4dfb-a317-5cb15c759d34	87.30	95.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:55.927156+00	\N	\N
6c9dea86-4f24-48d3-8c39-01d28fcdbd6e	8d09b2ab-4641-4ab2-bfed-d6cc4f069e4d	provider_batch	4d6594c0-b60b-47aa-a2ae-68e14ef9fa85	58.20	95.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:55.927156+00	\N	\N
ae1338f5-57e0-4d62-ba11-38e961c9ef3a	927da670-7bcd-4354-9a4b-9a48ba806fa5	provider_batch	b7c13789-1a8c-4c10-8a53-11eac323f2d4	121.25	100.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:55.927156+00	\N	\N
a62dd0d4-3e15-4187-bd9c-d4f0481393b3	850dd19f-8224-49da-a0d9-5353ae5cf2ac	provider_batch	a6d52cc0-2038-4d27-b6d8-61f08d2eb5e9	82.93	95.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:55.927156+00	\N	\N
30f5bac9-4db4-455e-8d3e-b150c7fc0698	850dd19f-8224-49da-a0d9-5353ae5cf2ac	provider_batch	cec68e47-1b39-417c-aec7-2cd3b4686811	92.15	95.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:55.927156+00	\N	\N
1226e61a-4ab2-4b95-a47f-050ec3c2ac63	464f2b76-03b9-411a-bd4e-369f292a8459	provider_batch	0c3fb31c-219a-4cbc-9605-3991483dae3d	53.35	95.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:55.927156+00	\N	\N
35b3f59d-b1b5-4af3-b399-71cefcebc6c8	464f2b76-03b9-411a-bd4e-369f292a8459	provider_batch	e0826f13-9842-4e72-a2b5-3e4c511c7f70	77.60	95.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:55.927156+00	\N	\N
d4e7c506-0f46-4bdf-b538-adbece176c77	2986c16b-a0e6-4f61-a06d-45b8fda1597b	provider_batch	9324f664-6041-4447-bb45-ebf9b7e37638	101.85	100.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:18:55.927156+00	\N	\N
66b3f72a-6d6b-4c5d-ad05-5bcd5e491670	249f450b-8d1b-4c57-81ef-8789a495d1a5	provider_batch	0c3fb31c-219a-4cbc-9605-3991483dae3d	53.35	100.00	automatic	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 20:30:08.594389+00	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, username, email, role, active, created_at) FROM stdin;
00000000-0000-0000-0000-000000000000	System	system	system@internal	admin	t	2025-05-27 11:25:04.522488+00
dd1329e7-5439-43ad-989b-0b8f5714824b	LIA Hair	admin	admin@lia-hair.ch	admin	t	2025-05-25 17:12:38.358893+00
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-03-16 17:58:49
20211116045059	2025-03-16 17:58:49
20211116050929	2025-03-16 17:58:49
20211116051442	2025-03-16 17:58:49
20211116212300	2025-03-16 17:58:49
20211116213355	2025-03-16 17:58:49
20211116213934	2025-03-16 17:58:49
20211116214523	2025-03-16 17:58:49
20211122062447	2025-03-16 17:58:49
20211124070109	2025-03-16 17:58:49
20211202204204	2025-03-16 17:58:49
20211202204605	2025-03-16 17:58:49
20211210212804	2025-03-16 17:58:49
20211228014915	2025-03-16 17:58:49
20220107221237	2025-03-16 17:58:49
20220228202821	2025-03-16 17:58:49
20220312004840	2025-03-16 17:58:49
20220603231003	2025-03-16 17:58:49
20220603232444	2025-03-16 17:58:49
20220615214548	2025-03-16 17:58:49
20220712093339	2025-03-16 17:58:49
20220908172859	2025-03-16 17:58:49
20220916233421	2025-03-16 17:58:49
20230119133233	2025-03-16 17:58:49
20230128025114	2025-03-16 17:58:49
20230128025212	2025-03-16 17:58:49
20230227211149	2025-03-16 17:58:49
20230228184745	2025-03-16 17:58:49
20230308225145	2025-03-16 17:58:49
20230328144023	2025-03-16 17:58:49
20231018144023	2025-03-16 17:58:49
20231204144023	2025-03-16 17:58:49
20231204144024	2025-03-16 17:58:49
20231204144025	2025-03-16 17:58:49
20240108234812	2025-03-16 17:58:49
20240109165339	2025-03-16 17:58:49
20240227174441	2025-03-16 17:58:49
20240311171622	2025-03-16 17:58:49
20240321100241	2025-03-16 17:58:48
20240401105812	2025-03-16 17:58:48
20240418121054	2025-03-16 17:58:48
20240523004032	2025-03-16 17:58:48
20240618124746	2025-03-16 17:58:48
20240801235015	2025-03-16 17:58:48
20240805133720	2025-03-16 17:58:48
20240827160934	2025-03-16 17:58:48
20240919163303	2025-03-16 17:58:48
20240919163305	2025-03-16 17:58:48
20241019105805	2025-03-16 17:58:48
20241030150047	2025-03-16 17:58:48
20241108114728	2025-03-16 17:58:48
20241121104152	2025-03-16 17:58:48
20241130184212	2025-03-16 17:58:48
20241220035512	2025-03-16 17:58:48
20241220123912	2025-03-16 17:58:48
20241224161212	2025-03-16 17:58:48
20250107150512	2025-03-16 17:58:49
20250110162412	2025-03-16 17:58:49
20250123174212	2025-03-16 17:58:49
20250128220012	2025-03-16 17:58:49
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
documents	documents	\N	2025-03-16 22:43:50.737943+00	2025-03-16 22:43:50.737943+00	t	f	\N	\N	\N
business-logos	business-logos	\N	2025-06-14 08:42:23.649085+00	2025-06-14 08:42:23.649085+00	t	f	\N	\N	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-03-16 17:58:34.351349
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-03-16 17:58:34.35749
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-03-16 17:58:34.360793
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-03-16 17:58:34.377344
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-03-16 17:58:34.413088
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-03-16 17:58:34.417279
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-03-16 17:58:34.422416
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-03-16 17:58:34.427499
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-03-16 17:58:34.431565
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-03-16 17:58:34.436129
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-03-16 17:58:34.441123
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-03-16 17:58:34.446328
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-03-16 17:58:34.451288
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-03-16 17:58:34.455863
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-03-16 17:58:34.459593
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-03-16 17:58:34.502678
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-03-16 17:58:34.506746
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-03-16 17:58:34.510006
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-03-16 17:58:34.514822
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-03-16 17:58:34.520766
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-03-16 17:58:34.525503
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-03-16 17:58:34.53877
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-03-16 17:58:34.590781
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-03-16 17:58:34.638872
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-03-16 17:58:34.645401
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-03-16 17:58:34.651728
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-03-16 17:58:34.657393
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-03-16 17:58:34.689716
28	object-bucket-name-sorting	8f385d71c72f7b9f6388e22f6e393e3b78bf8617	2025-03-16 17:58:34.709133
29	create-prefixes	8416491709bbd2b9f849405d5a9584b4f78509fb	2025-03-16 17:58:34.714989
30	update-object-levels	f5899485e3c9d05891d177787d10c8cb47bae08a	2025-03-16 17:58:34.720858
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-03-16 17:58:34.738706
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-03-16 17:58:34.757452
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-03-16 17:58:34.775192
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-03-16 17:58:34.77801
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-03-16 17:58:34.785975
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
60ee01aa-367f-4181-a33d-c8e08c58de74	documents	documents/expense_receipts/import-expense-fec19782-68fe-46d1-9c7f-abc8b653aabc.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 10:56:30.761437+00	2025-05-30 10:56:30.761437+00	2025-05-30 10:56:30.761437+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T10:56:30.759Z", "contentLength": 51, "httpStatusCode": 200}	edf4e12f-45fa-4a59-96d7-37f0f0348dbc	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
0bded32f-2ca6-454b-8604-6f1a597de19d	documents	documents/expense_receipts/import-expense-3590b411-bdfc-42d4-87f4-24a7a4dce8dc.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 10:56:30.794261+00	2025-05-30 10:56:30.794261+00	2025-05-30 10:56:30.794261+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T10:56:30.793Z", "contentLength": 51, "httpStatusCode": 200}	55c31a8f-efe6-490b-b2ee-df8bdf5410c5	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
dd84895a-64f0-4e9e-8b3a-8af3ae28b96f	documents	documents/expense_receipts/import-expense-d8238e48-6caa-49be-989e-61483fabece2.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 10:56:30.826619+00	2025-05-30 10:56:30.826619+00	2025-05-30 10:56:30.826619+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T10:56:30.825Z", "contentLength": 51, "httpStatusCode": 200}	5da42542-0c62-45ff-82b5-71602a6b614e	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
c588f282-87c5-4438-9e02-1d5d205c52d0	documents	documents/receipts/quittung-f94d5cc9-14a0-49bb-a020-a417f3e5ba2b.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 23:01:30.710056+00	2025-05-30 23:01:30.710056+00	2025-05-30 23:01:30.710056+00	{"eTag": "\\"9c5c0ea9a999a0fc9f80c3adfe24e09a\\"", "size": 3227, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T23:01:30.697Z", "contentLength": 3227, "httpStatusCode": 200}	d80fd499-72dc-44fb-be9c-a0a5eb8bc3b2	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
e8aad554-c8a4-4a2c-83fa-7f537df35296	documents	documents/expense_receipts/import-expense-781e8111-bc1e-47f2-aac9-ce0ebf320279.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 10:56:30.859899+00	2025-05-30 10:56:30.859899+00	2025-05-30 10:56:30.859899+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T10:56:30.858Z", "contentLength": 51, "httpStatusCode": 200}	adcbc0a5-ef5d-40f2-95d5-a8248c2e18ac	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
ae006c1f-35be-4b0b-8a5c-41b5db34d56e	documents	documents/expense_receipts/import-expense-55dd3c54-aa54-45b7-b81a-0791c51e44dd.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 10:56:30.894543+00	2025-05-30 10:56:30.894543+00	2025-05-30 10:56:30.894543+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T10:56:30.892Z", "contentLength": 51, "httpStatusCode": 200}	927093a2-1c5f-46f2-bf28-2331042f4730	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
618bc38b-1d64-40e5-acc6-6e0fdc8a1083	documents	documents/expense_receipts/placeholder-beleg-a009264b-ce9f-48ce-8e70-6bc764604287.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-31 08:27:05.476827+00	2025-05-31 08:27:05.476827+00	2025-05-31 08:27:05.476827+00	{"eTag": "\\"394f30f55a010cca572ab3a258ceb0de\\"", "size": 4922, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-31T08:27:05.469Z", "contentLength": 4922, "httpStatusCode": 200}	36dd4eb8-93ae-4529-8c10-01991815b43f	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
01600dce-4d41-4599-a988-9d1ac60b7947	documents	documents/expense_receipts/import-expense-6d0f7827-dff0-439b-bad0-de110309f29a.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 10:56:30.932309+00	2025-05-30 10:56:30.932309+00	2025-05-30 10:56:30.932309+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T10:56:30.930Z", "contentLength": 51, "httpStatusCode": 200}	3b3cd00e-1fef-43a9-aba7-3aea600d37d7	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
6e270c51-2558-4078-b45f-1e4bd6541547	documents	documents/receipts/quittung-bfd05d3a-f380-48ce-bb58-9a0bf6c529a8.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-01 14:49:58.577283+00	2025-06-01 14:49:58.577283+00	2025-06-01 14:49:58.577283+00	{"eTag": "\\"703167b14cba25560112e00839729124\\"", "size": 3182, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-01T14:49:58.573Z", "contentLength": 3182, "httpStatusCode": 200}	7a578e37-c3af-4e8a-934d-eb9664e40163	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
3edf525a-495d-4f82-a7a2-69efd8ee6170	documents	documents/expense_receipts/placeholder-beleg-1a95db91-1253-4f7f-92cd-b23320ca5368.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:58:43.208613+00	2025-06-16 12:58:43.208613+00	2025-06-16 12:58:43.208613+00	{"eTag": "\\"c6c86af0e281cade1781879570b45ef6\\"", "size": 25261, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T12:58:43.207Z", "contentLength": 25261, "httpStatusCode": 200}	1eb25890-92ca-4184-b163-2f937768f803	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
ada3ad90-97d4-462f-a522-91b4eeb82c86	documents	documents/expense_receipts/placeholder-beleg-468549cc-4e31-46c1-a110-dee3544fc43d.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:41:17.357214+00	2025-06-16 14:41:17.357214+00	2025-06-16 14:41:17.357214+00	{"eTag": "\\"f7f1ccef0d8f1acafa833cd685f5d714\\"", "size": 23945, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T14:41:17.352Z", "contentLength": 23945, "httpStatusCode": 200}	73da188d-de80-42fa-b3a7-fedf8730335d	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
3be7e483-8507-4d1c-ae6d-7ee85c679079	documents	documents/receipts/quittung-add6aa7b-8502-48e3-88fc-629313c06065.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 15:43:55.222091+00	2025-06-17 15:43:55.222091+00	2025-06-17 15:43:55.222091+00	{"eTag": "\\"fe71e721c2ac32f224f50e5398cdaab6\\"", "size": 23852, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T15:43:55.218Z", "contentLength": 23852, "httpStatusCode": 200}	913f815e-44a5-4bec-ac36-533311464f6b	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
e380366d-ab9e-42c8-8442-ea2aa6f06c1a	business-logos	49c9314c-e527-4df4-ab10-799fb5da0d1d/app-logo-light-1750270771470.png	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 18:19:31.531522+00	2025-06-18 18:19:31.531522+00	2025-06-18 18:19:31.531522+00	{"eTag": "\\"0f27ea128cee6cd401331116246d6834\\"", "size": 20988, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-18T18:19:31.527Z", "contentLength": 20988, "httpStatusCode": 200}	8151e174-52af-4347-9198-68adddfbe0ba	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	2
313c78d7-9d03-4a9c-b5f9-52fa9247e20f	documents	documents/expense_receipts/import-expense-02bdbd4f-dc1a-4d05-a5f0-05d72a771a14.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:10:41.892961+00	2025-05-30 12:10:41.892961+00	2025-05-30 12:10:41.892961+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:10:41.891Z", "contentLength": 51, "httpStatusCode": 200}	25a97cb1-71c6-41fe-89be-280ebfc225e2	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
e9dc0d6f-d040-4b73-8523-d5fa38383827	documents	documents/expense_receipts/import-expense-15ca6a52-b74d-4618-b95c-ab40533c7fbb.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:10:41.953385+00	2025-05-30 12:10:41.953385+00	2025-05-30 12:10:41.953385+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:10:41.950Z", "contentLength": 51, "httpStatusCode": 200}	368b499f-d28a-4f70-aef8-7f49041d2553	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
b7b9064e-a89a-42fc-ac75-cc7cb424af2f	documents	documents/expense_receipts/import-expense-4076bfc7-bb5e-4882-b153-30019a0f86f2.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:10:42.000423+00	2025-05-30 12:10:42.000423+00	2025-05-30 12:10:42.000423+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:10:41.996Z", "contentLength": 51, "httpStatusCode": 200}	23db370d-c103-4c74-9e97-300cba6fc98b	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
dc97055a-2226-4306-8537-0203a791ffa8	documents	documents/receipts/quittung-5cce9e91-d38f-4a4f-b9d2-f677dcd8f86e.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 23:05:05.999719+00	2025-05-30 23:05:05.999719+00	2025-05-30 23:05:05.999719+00	{"eTag": "\\"45a30f4c33453b669a666eff806a639e\\"", "size": 3205, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T23:05:05.994Z", "contentLength": 3205, "httpStatusCode": 200}	60f3edee-030f-4c11-8f9b-d9645843fbd1	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
470b4d73-7140-4d8a-acd3-0cdcdc7f1854	documents	documents/expense_receipts/import-expense-793dd700-767d-45f2-b975-478f5c3f3937.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:10:42.052552+00	2025-05-30 12:10:42.052552+00	2025-05-30 12:10:42.052552+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:10:42.051Z", "contentLength": 51, "httpStatusCode": 200}	c1cdec1e-508b-4d5f-b205-84d485c277ca	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
19a01e86-aad9-42fe-a00b-91e803937bc6	documents	documents/expense_receipts/import-expense-3d1dbe75-811a-4ba7-9461-6d988364e823.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:10:42.101058+00	2025-05-30 12:10:42.101058+00	2025-05-30 12:10:42.101058+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:10:42.097Z", "contentLength": 51, "httpStatusCode": 200}	57ba23d0-d9ef-4b41-8ae4-b82972720e2c	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
94dc56a8-db1b-4d67-8118-8543426b4b2b	documents	documents/receipts/quittung-3dd8784c-2ed2-46a3-8abb-3db037f7a6af.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-31 20:23:20.177064+00	2025-05-31 20:23:20.177064+00	2025-05-31 20:23:20.177064+00	{"eTag": "\\"ccf4521b9008ed2be5a84e73ae9bddc1\\"", "size": 3165, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-31T20:23:20.165Z", "contentLength": 3165, "httpStatusCode": 200}	bd19cf3c-2d4d-4e81-934f-8e9891b0d2f2	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
d1b1171d-cec1-4ef9-8ab0-81c260814704	documents	documents/expense_receipts/import-expense-d4f6245e-63bf-48a7-bfda-7dcda9f3b936.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:10:42.1532+00	2025-05-30 12:10:42.1532+00	2025-05-30 12:10:42.1532+00	{"eTag": "\\"da291b53be7c78429ced516a84f93e36\\"", "size": 51, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:10:42.151Z", "contentLength": 51, "httpStatusCode": 200}	45f381fa-aa6c-4323-aa71-c9b079633b4e	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
88afe8d8-e24b-4698-81cf-ba6a6295dbe3	documents	documents/receipts/receipt_8f8d843a-9461-4b17-b782-254e4b12f4ab.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:04.834172+00	2025-05-30 12:11:04.834172+00	2025-05-30 12:11:04.834172+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:04.832Z", "contentLength": 35, "httpStatusCode": 200}	6fba7838-54e3-40b5-9914-2d94825e4ada	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
26a497e5-256e-4788-b176-3ecdf79cda0f	documents	documents/expense_receipts/placeholder-beleg-1f5479aa-b74d-452d-a086-e79894ef9cd5.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 13:37:47.77083+00	2025-06-16 13:37:47.77083+00	2025-06-16 13:37:47.77083+00	{"eTag": "\\"c9ae176e5adcb44ffac714de4871b7d6\\"", "size": 25175, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T13:37:47.768Z", "contentLength": 25175, "httpStatusCode": 200}	8caf39c7-bc75-44e3-a1e5-55421ff17e13	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
f143ceb1-c872-4d85-aa71-82d515054c6b	documents	documents/receipts/receipt_494ce4f3-38eb-4ee6-9734-c1f7f30c4c7f.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:04.877854+00	2025-05-30 12:11:04.877854+00	2025-05-30 12:11:04.877854+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:04.876Z", "contentLength": 35, "httpStatusCode": 200}	11ab0ff1-df5e-4c43-ac1a-4f0ff8fe44a4	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
86c75213-19a5-49a0-b382-6c3739f7e6a8	documents	documents/expense_receipts/placeholder-beleg-27310eea-0eec-4abb-a495-1d3555a56353.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:43:38.384176+00	2025-06-16 14:43:38.384176+00	2025-06-16 14:43:38.384176+00	{"eTag": "\\"0db19b0be59fd984d94a99fd3406d019\\"", "size": 23849, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T14:43:38.380Z", "contentLength": 23849, "httpStatusCode": 200}	4e9d7d63-08a9-4507-866d-d8dd3c869377	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
88707bec-8441-40c4-8cdc-bf6627d45ab5	documents	documents/receipts/receipt_2d0ab5b9-c27a-4734-83c7-5cf1a1c6902f.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:04.911591+00	2025-05-30 12:11:04.911591+00	2025-05-30 12:11:04.911591+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:04.910Z", "contentLength": 35, "httpStatusCode": 200}	50406e38-9e0a-4d6a-a5e5-aaca23ab6b56	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
812c07bc-c570-4e34-9979-a4d7d51548f8	documents	documents/receipts/receipt_10cc722b-6769-4e43-b737-8560ce0eda56.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:04.941628+00	2025-05-30 12:11:04.941628+00	2025-05-30 12:11:04.941628+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:04.939Z", "contentLength": 35, "httpStatusCode": 200}	61347b2a-f32f-4e7a-bb9d-06c17420d1fe	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
5809a803-56e7-4805-9996-797ea4e74c9d	documents	documents/expense_receipts/placeholder-beleg-31655668-a760-4042-bec2-4a90c6c11324.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 23:31:53.750104+00	2025-05-30 23:31:53.750104+00	2025-05-30 23:31:53.750104+00	{"eTag": "\\"b5e69b6e2104d1587cb89f52fd3a3887\\"", "size": 4931, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T23:31:53.746Z", "contentLength": 4931, "httpStatusCode": 200}	693d0954-cbcb-4f5c-b732-c1bf64599ed7	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
18229136-47c1-4894-8e64-19d3497b5b62	documents	documents/receipts/receipt_f236a47d-d8bc-4e05-b648-a294f9dbd1f2.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:04.993465+00	2025-05-30 12:11:04.993465+00	2025-05-30 12:11:04.993465+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:04.990Z", "contentLength": 35, "httpStatusCode": 200}	bb9c01b4-c3fa-45dd-9378-c7ee530e5b1c	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
850a58f2-8f4b-47ad-b1e2-3a1715aaf38e	documents	documents/receipts/quittung-5600cb21-86dd-49bd-97df-95d23e461274.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-31 20:23:52.829066+00	2025-05-31 20:23:52.829066+00	2025-05-31 20:23:52.829066+00	{"eTag": "\\"7714b4608381fb650a2fe40761c36493\\"", "size": 3144, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-31T20:23:52.824Z", "contentLength": 3144, "httpStatusCode": 200}	a14e9b3c-d3e3-4da5-9a81-10c79b9bbfc2	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
4340e1d4-ef1d-46aa-b5fa-b320cc3ec2c7	documents	documents/receipts/receipt_1345bbcf-cb16-48f0-af1d-49d5a432d741.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.047869+00	2025-05-30 12:11:05.047869+00	2025-05-30 12:11:05.047869+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.044Z", "contentLength": 35, "httpStatusCode": 200}	ea115cdc-a515-47f4-a212-2f3e2fb7ede2	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
ee51966b-8b52-439e-aaac-d9db9a8df913	documents	documents/receipts/receipt_977cab91-5bb3-4129-bfd6-43414f2475e5.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.108163+00	2025-05-30 12:11:05.108163+00	2025-05-30 12:11:05.108163+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.105Z", "contentLength": 35, "httpStatusCode": 200}	777ecd86-5b03-4f18-bb50-9dea0a77a872	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
ef52d0bb-634d-4645-804b-32a92ffd8b96	documents	documents/receipts/quittung-96c25912-ca64-4d03-bc39-1e11a1bf4317.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-01 14:50:20.374424+00	2025-06-01 14:50:20.374424+00	2025-06-01 14:50:20.374424+00	{"eTag": "\\"d9ec794c62dd2b357af6a701f10d023c\\"", "size": 3133, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-01T14:50:20.370Z", "contentLength": 3133, "httpStatusCode": 200}	98457e71-457b-46d4-8959-bc5c7e96a479	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
97842d64-caee-49a6-9cb7-86120a8b1cab	documents	documents/receipts/receipt_39c646bd-6c8d-4f55-9443-3a12c55e0c96.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.160524+00	2025-05-30 12:11:05.160524+00	2025-05-30 12:11:05.160524+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.157Z", "contentLength": 35, "httpStatusCode": 200}	695b4bcb-a89b-4aeb-a123-d1aea7ef55ba	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
a3c29b7c-d63e-4b3a-903c-d2e0057cf9e5	documents	documents/receipts/receipt_da7b4858-38a2-4408-9370-fdc337cc1a59.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.218009+00	2025-05-30 12:11:05.218009+00	2025-05-30 12:11:05.218009+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.215Z", "contentLength": 35, "httpStatusCode": 200}	8310d33b-b633-4906-8955-4d9301397695	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
61bf8430-d624-4a7e-8a56-491871c56226	documents	documents/receipts/receipt_ffd1ece7-bfa1-480c-ad05-32ac72ef18b9.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.270526+00	2025-05-30 12:11:05.270526+00	2025-05-30 12:11:05.270526+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.268Z", "contentLength": 35, "httpStatusCode": 200}	9d55f462-9c4c-4627-8b38-6e74f3da6089	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
0ab162ee-37c0-4700-b0c9-ae77cdead935	documents	documents/receipts/receipt_f4aa6611-03ad-4391-b2ce-45fe35b98e55.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.313079+00	2025-05-30 12:11:05.313079+00	2025-05-30 12:11:05.313079+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.311Z", "contentLength": 35, "httpStatusCode": 200}	df2213c4-38cd-413b-bb19-4d794647b4ed	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
3eb3aed5-e28e-4c2b-9bdf-1e93e56941ee	documents	documents/receipts/quittung-f0b5e55f-28c3-49b0-8cea-8e1b7a4055ab.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:43:49.418275+00	2025-06-16 14:43:49.418275+00	2025-06-16 14:43:49.418275+00	{"eTag": "\\"4f556e0c9a0c7382fcb60b1aad449a7e\\"", "size": 23872, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T14:43:49.414Z", "contentLength": 23872, "httpStatusCode": 200}	741f81f8-7863-4e20-a16a-072b6860d3ef	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
a6df1dc5-7879-47f8-b531-8800c2014d8b	business-logos	49c9314c-e527-4df4-ab10-799fb5da0d1d/app-logo-dark-1750270776680.png	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 18:19:36.717849+00	2025-06-18 18:19:36.717849+00	2025-06-18 18:19:36.717849+00	{"eTag": "\\"0f27ea128cee6cd401331116246d6834\\"", "size": 20988, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-18T18:19:36.710Z", "contentLength": 20988, "httpStatusCode": 200}	98502214-5663-457d-97b7-a8d7f462faaf	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	2
0abb7446-2f0f-4a48-bc0e-1417ff27414d	documents	documents/receipts/receipt_e3a0077c-d6ee-492d-b453-59706d463a9c.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.349859+00	2025-05-30 12:11:05.349859+00	2025-05-30 12:11:05.349859+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.346Z", "contentLength": 35, "httpStatusCode": 200}	a39e264c-b61d-48d6-b857-2ed0a9068598	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
b6c5dea4-4461-4cd8-a142-ad9451573775	documents	documents/daily_reports/tagesabschluss-2025-05-30.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-31 00:10:09.343938+00	2025-05-31 00:10:09.343938+00	2025-05-31 00:10:09.343938+00	{"eTag": "\\"03389e467580cf4fc40f5706b9abcc2a\\"", "size": 27239, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-31T00:10:09.339Z", "contentLength": 27239, "httpStatusCode": 200}	0774c5d8-15ce-4f4f-9721-bd1002990b04	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
a9bc9a4c-583d-4043-bd15-46e73ef29a8e	documents	documents/receipts/receipt_a9a8f97b-e27e-44ad-add3-adf5064556c3.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.402204+00	2025-05-30 12:11:05.402204+00	2025-05-30 12:11:05.402204+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.399Z", "contentLength": 35, "httpStatusCode": 200}	d0cd3822-a46c-4807-8d5e-ce7896135a11	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
f53886a9-30a2-4c7d-a9b4-ddb6911a9679	documents	documents/monthly_reports/.emptyFolderPlaceholder	\N	2025-06-15 20:23:50.177036+00	2025-06-15 20:23:50.177036+00	2025-06-15 20:23:50.177036+00	{"eTag": "\\"d41d8cd98f00b204e9800998ecf8427e\\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T20:23:50.171Z", "contentLength": 0, "httpStatusCode": 200}	1b03439d-a028-4ca8-a98c-defdbd50f010	\N	{}	3
17a04c0a-9dee-4373-bb8d-ab005dbbe43d	documents	documents/receipts/receipt_adfde570-dcfc-4b14-8760-7a2c8a82399e.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.446684+00	2025-05-30 12:11:05.446684+00	2025-05-30 12:11:05.446684+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.445Z", "contentLength": 35, "httpStatusCode": 200}	fb72d059-8c22-428e-9462-d238465667ca	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
250c1503-e2f9-4f5f-aa11-8b5c24031599	documents	documents/expense_receipts/placeholder-beleg-ad3b10e8-0e84-4779-acbf-5c472cd80caa.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-31 20:26:47.138479+00	2025-05-31 20:26:47.138479+00	2025-05-31 20:26:47.138479+00	{"eTag": "\\"ea83e12279627aab6eeefaad2b9bfe65\\"", "size": 4917, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-31T20:26:47.134Z", "contentLength": 4917, "httpStatusCode": 200}	8968a8b4-8f29-482d-9f77-027948dfe2d5	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
c18d5480-cdad-4ca0-bcf2-d45a482b12a4	documents	documents/receipts/receipt_e120ee3d-1ead-4f94-943f-bfe061f55c91.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.495021+00	2025-05-30 12:11:05.495021+00	2025-05-30 12:11:05.495021+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.493Z", "contentLength": 35, "httpStatusCode": 200}	34f02375-730d-47b9-bbec-a72a124e2c7b	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
5f7f164e-328e-4ed0-a6ed-ea43de575794	documents	documents/receipts/receipt_dc3c4f46-d885-4942-b870-15c5b6358d38.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.523777+00	2025-05-30 12:11:05.523777+00	2025-05-30 12:11:05.523777+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.522Z", "contentLength": 35, "httpStatusCode": 200}	e9540b3b-b305-447e-a20c-3b56b543cc68	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
036ba003-eb96-4bf9-b61d-7ba030848143	documents	documents/expense_receipts/placeholder-beleg-687e44e6-8b69-4685-9e75-84ba866271da.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-01 14:52:23.950109+00	2025-06-01 14:52:23.950109+00	2025-06-01 14:52:23.950109+00	{"eTag": "\\"f4ab7f1f38e9f06517aeeed47810178d\\"", "size": 4915, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-01T14:52:23.945Z", "contentLength": 4915, "httpStatusCode": 200}	e6afe85b-ad0b-416d-8a37-8717a9699f2b	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
9874fa69-4002-4474-abb5-9409c849d2bb	documents	documents/receipts/receipt_6390a0dd-5bdc-4be4-87e6-cbc6af75be98.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.553325+00	2025-05-30 12:11:05.553325+00	2025-05-30 12:11:05.553325+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.552Z", "contentLength": 35, "httpStatusCode": 200}	78ef30ac-6ce5-401b-a9c4-83f21f0b7dea	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
1aba0a70-43fe-451d-b32d-a3bb0c598ae0	documents	documents/receipts/receipt_043d197a-19cb-49d3-8452-99f893093e3e.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.579278+00	2025-05-30 12:11:05.579278+00	2025-05-30 12:11:05.579278+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.577Z", "contentLength": 35, "httpStatusCode": 200}	ff9a8fec-245c-44a4-b0c4-c1b5d97b9e9f	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
60cacec5-b736-45a2-b386-e31cbd0e868c	documents	documents/receipts/receipt_17ce794e-6bc8-41f8-813a-aa3017df3268.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.606057+00	2025-05-30 12:11:05.606057+00	2025-05-30 12:11:05.606057+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.604Z", "contentLength": 35, "httpStatusCode": 200}	75f19a51-ed47-4be0-902c-7cfdbb4bc1a1	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
3cb5cfa9-32d4-4e11-b884-b9ea2fe398c4	documents	documents/receipts/receipt_cee0bc84-017a-4f99-88c5-1133e71b4e2d.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.635999+00	2025-05-30 12:11:05.635999+00	2025-05-30 12:11:05.635999+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.634Z", "contentLength": 35, "httpStatusCode": 200}	2357b56c-a3cf-4972-ba77-ffe6626dff44	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
c2597eb8-9b3d-4ae5-89e5-3f4c9a7bdae0	documents	documents/receipts/receipt_04933a9e-725c-4ff2-b20c-3baf0b633cf5.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.662635+00	2025-05-30 12:11:05.662635+00	2025-05-30 12:11:05.662635+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.661Z", "contentLength": 35, "httpStatusCode": 200}	67d3fe8a-1002-43e7-8735-31f95c6959e0	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
cd85a2a9-dfe9-4536-b707-8384a3d1c9ab	documents	documents/receipts/quittung-3cf75bfd-2e96-4891-894e-1bd282d3b428.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-31 20:32:45.918373+00	2025-05-31 20:32:45.918373+00	2025-05-31 20:32:45.918373+00	{"eTag": "\\"a8b9dcfe5f9230736b8d7b762f4ed840\\"", "size": 3140, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-31T20:32:45.912Z", "contentLength": 3140, "httpStatusCode": 200}	d92fdff0-14b1-4545-8676-96660e9c7102	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
e9ec1eed-022e-41d1-ab8b-5ba635704ee7	documents	documents/receipts/receipt_cc389cf8-9b63-4133-b410-360b1a796d62.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.689879+00	2025-05-30 12:11:05.689879+00	2025-05-30 12:11:05.689879+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.688Z", "contentLength": 35, "httpStatusCode": 200}	5013357b-7494-4099-94b6-5fc6605a546b	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
2a586890-e38b-43af-b3ee-5242fc4090ed	documents	documents/receipts/receipt_fdcff625-666e-4670-b2b2-76de6347e84a.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.713937+00	2025-05-30 12:11:05.713937+00	2025-05-30 12:11:05.713937+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.713Z", "contentLength": 35, "httpStatusCode": 200}	173b8253-214d-4cc3-a309-b9f96a3e3a7b	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
6ea0358b-1dae-43dd-8ab1-a7a6503a45a6	documents	documents/receipts/quittung-882d861a-6e4c-4186-a814-3f8391256514.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-31 20:32:59.073735+00	2025-05-31 20:32:59.073735+00	2025-05-31 20:32:59.073735+00	{"eTag": "\\"d864285e46792228644909b46c4143c3\\"", "size": 3154, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-31T20:32:59.066Z", "contentLength": 3154, "httpStatusCode": 200}	bb4c86d1-14a8-4f63-8b06-469f70a8969a	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
6ae39dbf-5910-4d8d-b9e6-f7c425577a98	documents	documents/receipts/receipt_aa2d1a01-888c-45b3-a0c2-a7bcfb780d6d.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.742408+00	2025-05-30 12:11:05.742408+00	2025-05-30 12:11:05.742408+00	{"eTag": "\\"e93cb4765b8ee14dfe91707c3a90b7e8\\"", "size": 35, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.741Z", "contentLength": 35, "httpStatusCode": 200}	a892cf37-3392-4f3c-902f-d56e889a184a	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
f2610707-a1ff-48ea-a0ce-abf2eb6fd85a	documents	documents/daily_reports/daily_report_2024-11-02.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.787863+00	2025-05-30 12:11:05.787863+00	2025-05-30 12:11:05.787863+00	{"eTag": "\\"4bc560405f05d9359fa93de6a7961fc8\\"", "size": 48, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.786Z", "contentLength": 48, "httpStatusCode": 200}	b802ddf9-f31a-4adb-b5ac-a0115dfc06cf	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
43f4f606-6a41-4d79-89fc-bcff0f771212	documents	documents/receipts/quittung-efc0deb1-44ea-4aed-a0ab-b1a730151543.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-31 20:33:19.67292+00	2025-05-31 20:33:19.67292+00	2025-05-31 20:33:19.67292+00	{"eTag": "\\"ec720f86d60b600cca39c33cbbfe02eb\\"", "size": 3149, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-31T20:33:19.668Z", "contentLength": 3149, "httpStatusCode": 200}	e75663c0-7f9b-4132-a1d4-fdc2c2fa4208	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
0ba55004-ea64-4024-8578-d3f4dfedbf69	documents	documents/daily_reports/daily_report_2024-11-06.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.837717+00	2025-05-30 12:11:05.837717+00	2025-05-30 12:11:05.837717+00	{"eTag": "\\"4bc560405f05d9359fa93de6a7961fc8\\"", "size": 48, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.835Z", "contentLength": 48, "httpStatusCode": 200}	db700dff-4be2-4d3d-a725-3a66e8730a24	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
5c733625-58e4-4c61-966e-5d483a1e8060	documents	documents/expense_receipts/placeholder-beleg-c76a428e-f3c0-4902-8248-306c0854d2ff.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 13:41:48.837617+00	2025-06-16 13:41:48.837617+00	2025-06-16 13:41:48.837617+00	{"eTag": "\\"60b159f88500f11bf2d224c22b0dfecc\\"", "size": 23874, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T13:41:48.835Z", "contentLength": 23874, "httpStatusCode": 200}	3e43c88b-455a-43a4-bf25-0e4ad9616936	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
b0667471-8ac2-4616-a04a-ff4be7313ff1	documents	documents/daily_reports/daily_report_2024-11-09.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.884016+00	2025-05-30 12:11:05.884016+00	2025-05-30 12:11:05.884016+00	{"eTag": "\\"4bc560405f05d9359fa93de6a7961fc8\\"", "size": 48, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.883Z", "contentLength": 48, "httpStatusCode": 200}	fcab3d4e-eff9-42dd-8490-b96a2998d159	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
2dcbdfb6-83a3-42b6-9469-a8b675c7c546	documents	documents/daily_reports/daily_report_2024-11-13.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.927158+00	2025-05-30 12:11:05.927158+00	2025-05-30 12:11:05.927158+00	{"eTag": "\\"4bc560405f05d9359fa93de6a7961fc8\\"", "size": 48, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.926Z", "contentLength": 48, "httpStatusCode": 200}	5ee531b4-f0bb-4ea1-8d4f-ed43d48a0879	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
a0a75beb-7b0d-4a80-8e57-fffa199d4599	documents	documents/daily_reports/daily_report_2024-11-16.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:05.975044+00	2025-05-30 12:11:05.975044+00	2025-05-30 12:11:05.975044+00	{"eTag": "\\"4bc560405f05d9359fa93de6a7961fc8\\"", "size": 48, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:05.973Z", "contentLength": 48, "httpStatusCode": 200}	923c9e0f-c813-4a7e-b6cb-15055dd7d0ef	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
d6bc3a72-cbe7-4772-97f6-3d4ef37c38a5	documents	documents/daily_reports/tagesabschluss-2025-05-31.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-31 21:15:20.363848+00	2025-05-31 21:15:20.363848+00	2025-05-31 21:15:20.363848+00	{"eTag": "\\"842456fb0c40e0041c5862bd6ae5309b\\"", "size": 28610, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-31T21:15:20.357Z", "contentLength": 28610, "httpStatusCode": 200}	716a50e4-02a0-47e7-8ada-93f9dd8007f5	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
3cdbf249-e614-4e6d-aacf-e91672b21822	documents	documents/daily_reports/daily_report_2024-11-20.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:06.019813+00	2025-05-30 12:11:06.019813+00	2025-05-30 12:11:06.019813+00	{"eTag": "\\"4bc560405f05d9359fa93de6a7961fc8\\"", "size": 48, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:06.018Z", "contentLength": 48, "httpStatusCode": 200}	72808c37-2cad-4a65-94f4-7a83df6e1e9a	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
b0c8f063-b726-4ac5-8371-85a3c35de49f	documents	documents/receipts/quittung-c66be367-9279-4984-926f-c23d4eb56314.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-01 13:41:55.491262+00	2025-06-01 13:41:55.491262+00	2025-06-01 13:41:55.491262+00	{"eTag": "\\"9a0f2649d4e7d8e06ac7d61d270a1ce1\\"", "size": 3160, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-01T13:41:55.481Z", "contentLength": 3160, "httpStatusCode": 200}	df7a922d-60ea-45e3-a057-e025ed581aaa	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
c16e9582-1c7a-4c6f-988b-5991d7ff09fa	documents	documents/receipts/quittung-b6e403e8-693a-4d3c-937f-6efbeab8abbe.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-01 21:20:26.663899+00	2025-06-01 21:20:26.663899+00	2025-06-01 21:20:26.663899+00	{"eTag": "\\"7a31084e8adc390dc46f01b01457fed8\\"", "size": 3168, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-01T21:20:26.648Z", "contentLength": 3168, "httpStatusCode": 200}	af5bcec8-da9b-41a6-a3dd-c18120b27510	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
abdcbb4d-6abc-4f92-8bf2-20cbbafb40a7	documents	documents/daily_reports/daily_report_2024-11-21.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:06.064512+00	2025-05-30 12:11:06.064512+00	2025-05-30 12:11:06.064512+00	{"eTag": "\\"4bc560405f05d9359fa93de6a7961fc8\\"", "size": 48, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:06.062Z", "contentLength": 48, "httpStatusCode": 200}	d22b1a45-1e12-47c2-9a67-da4af9557de8	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
7845b01d-3e23-4b81-bc04-ee163243f154	documents	documents/expense_receipts/placeholder-beleg-a0d4e2e5-b129-4f5f-8329-c22030b1ca79.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-01 21:21:04.153598+00	2025-06-01 21:21:04.153598+00	2025-06-01 21:21:04.153598+00	{"eTag": "\\"9dc161ffbbc2b8d5cc780089141c93f4\\"", "size": 4916, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-01T21:21:04.149Z", "contentLength": 4916, "httpStatusCode": 200}	0c82a77f-ce31-41f1-8954-8957da8fe65e	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
7128cad1-4031-486b-9b6e-e6bda90c51d7	documents	documents/receipts/quittung-85829236-8bcc-4dd3-9991-b9e5d4316d91.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-02 12:07:24.31927+00	2025-06-02 12:07:24.31927+00	2025-06-02 12:07:24.31927+00	{"eTag": "\\"3276fe16f865b6458ce7f53dec9a70c1\\"", "size": 3152, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-02T12:07:24.314Z", "contentLength": 3152, "httpStatusCode": 200}	4c9ae3de-b9c9-42cb-ada6-9fe8688d1212	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
f6b6f874-864e-4406-893c-b02a6cc4707a	documents	documents/daily_reports/daily_report_2024-11-23.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:06.112114+00	2025-05-30 12:11:06.112114+00	2025-05-30 12:11:06.112114+00	{"eTag": "\\"4bc560405f05d9359fa93de6a7961fc8\\"", "size": 48, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:06.110Z", "contentLength": 48, "httpStatusCode": 200}	9487412d-7122-4640-b846-c65be8d8923d	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
888252f7-169c-4239-8ce9-326774fb817f	documents	documents/receipts/quittung-802c8792-15ae-4fd6-bd3e-a30eff2769b3.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-02 21:04:39.822621+00	2025-06-02 21:04:39.822621+00	2025-06-02 21:04:39.822621+00	{"eTag": "\\"8104dae80fd96e360ec41c392bec16f7\\"", "size": 3111, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-02T21:04:39.811Z", "contentLength": 3111, "httpStatusCode": 200}	48120e6b-534b-4e5c-91da-734c26f2c409	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
58a33bf0-9597-4561-9d75-6b6324ed4d0f	documents	documents/monthly_reports/monatsabschluss-2025-01.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 22:41:04.890139+00	2025-06-15 22:41:04.890139+00	2025-06-15 22:41:04.890139+00	{"eTag": "\\"ae1465b549a8b23c759095a62d3cbc8f\\"", "size": 10802, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T22:41:04.887Z", "contentLength": 10802, "httpStatusCode": 200}	29501372-0be1-42e6-8729-10d9bad05d34	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
3b95f3d2-e79b-41a5-bcaf-6c675ba4e05f	documents	documents/daily_reports/daily_report_2024-11-27.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-05-30 12:11:06.160276+00	2025-05-30 12:11:06.160276+00	2025-05-30 12:11:06.160276+00	{"eTag": "\\"4bc560405f05d9359fa93de6a7961fc8\\"", "size": 48, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-30T12:11:06.159Z", "contentLength": 48, "httpStatusCode": 200}	5f14d5ad-8707-4e90-b592-c24ca277a1ed	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
76a846fb-512f-4f29-8865-ac176a3c50ff	documents	documents/receipts/quittung-4d0e6dbd-8c38-4172-ac51-63c179418fc4.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:04:44.331829+00	2025-06-16 12:04:44.331829+00	2025-06-16 12:04:44.331829+00	{"eTag": "\\"fb1aec2408a8732a7dee7d5bfc3981e3\\"", "size": 3992, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T12:04:44.328Z", "contentLength": 3992, "httpStatusCode": 200}	e8218149-7414-4676-9c67-b958da99397b	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
7523d5be-d6b0-42a4-bc4a-dee9e5553ad9	documents	documents/receipts/quittung-ca30b285-0d09-4b10-9689-c88e5a440033.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-03 13:00:30.092564+00	2025-06-03 13:00:30.092564+00	2025-06-03 13:00:30.092564+00	{"eTag": "\\"ea65138382098eae003f89ad5e711c40\\"", "size": 3093, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-03T13:00:30.085Z", "contentLength": 3093, "httpStatusCode": 200}	30f184d3-0ac7-480c-8410-477095924c48	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
d67abd24-783d-4340-a428-b30ff7a8bc0b	business-logos	49c9314c-e527-4df4-ab10-799fb5da0d1d/app-logo-dark-1750270781799.png	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 18:19:41.83187+00	2025-06-18 18:19:41.83187+00	2025-06-18 18:19:41.83187+00	{"eTag": "\\"89fc6165df2b1b23d96f315086fae266\\"", "size": 20790, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-18T18:19:41.827Z", "contentLength": 20790, "httpStatusCode": 200}	b1a52148-1864-421f-87bb-6d8202bc696d	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	2
71224969-3e6e-4532-ad45-0ae874a00d2a	documents	documents/expense_receipts/placeholder-beleg-66d2dec3-67e6-4e6a-ad3a-50a635b1cb40.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 23:11:13.358116+00	2025-06-15 23:11:13.358116+00	2025-06-15 23:11:13.358116+00	{"eTag": "\\"5e370fbea708c6c0f2530d370e48e1a5\\"", "size": 5081, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T23:11:13.354Z", "contentLength": 5081, "httpStatusCode": 200}	86e86acf-37ac-4d31-af63-c07e9ccc2648	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
6274cd2f-4b86-4cba-b424-53ffba2e4f35	documents	documents/receipts/quittung-cd7c4cec-1ca5-4b46-87a0-19747c673015.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:07:08.883637+00	2025-06-16 12:07:08.883637+00	2025-06-16 12:07:08.883637+00	{"eTag": "\\"b7355f6c63c974ce3d8364f620e1e22d\\"", "size": 3919, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T12:07:08.879Z", "contentLength": 3919, "httpStatusCode": 200}	e6d75375-b6d5-4135-8ee6-e98d26e8900a	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
f436ddcd-277b-4ece-b5bd-3b36ff441f73	documents	documents/expense_receipts/placeholder-beleg-6aaa1723-6a75-4cca-979c-eec69ca89051.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 13:43:02.838165+00	2025-06-16 13:43:02.838165+00	2025-06-16 13:43:02.838165+00	{"eTag": "\\"ddf326281c771dd96a63e3ca0f06b2b3\\"", "size": 24064, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T13:43:02.835Z", "contentLength": 24064, "httpStatusCode": 200}	17330b95-0918-4ccb-b004-12343e697cbc	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
e5b1a70f-457f-40b5-8523-a5590f805d06	documents	documents/receipts/quittung-7b2a820f-394c-48a8-a505-7eefc08ffd1a.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:44:04.07656+00	2025-06-16 14:44:04.07656+00	2025-06-16 14:44:04.07656+00	{"eTag": "\\"1fab0f3b11df5808a3584c8f19ca7eeb\\"", "size": 23851, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T14:44:04.072Z", "contentLength": 23851, "httpStatusCode": 200}	95a9ac1c-18e9-4a64-8359-f42e75adc951	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
a992367a-d0cb-4ce1-a260-4d0df2b61359	documents	documents/receipts/quittung-99cee850-2c83-4d23-866d-07fcdaa51468.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 16:04:28.545522+00	2025-06-17 16:04:28.545522+00	2025-06-17 16:04:28.545522+00	{"eTag": "\\"b7a2c0f5a6658b262edde3b67ca8bec7\\"", "size": 23871, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T16:04:28.539Z", "contentLength": 23871, "httpStatusCode": 200}	e65f8b4b-bf17-439e-8bf0-d100664f78e7	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
6fac25b7-879e-4914-80ec-0f8f0441e7ca	documents	documents/receipts/quittung-e9fa7dc7-73fd-4661-918b-9e60c8eb18c5.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 17:31:10.255297+00	2025-06-17 17:31:10.255297+00	2025-06-17 17:31:10.255297+00	{"eTag": "\\"7c691fe4d5b8aa5f6f272a0adf76c508\\"", "size": 3917, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T17:31:10.250Z", "contentLength": 3917, "httpStatusCode": 200}	b5eb8d51-da6c-48a5-8ca8-1cee008052c6	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
608dffcc-c564-4a41-83cb-b1ef39ca7f6d	documents	documents/expense_receipts/placeholder-beleg-6c9f8cce-592f-41a9-a812-3bbc6a45f6b4.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:47:34.975847+00	2025-06-17 20:47:34.975847+00	2025-06-17 20:47:34.975847+00	{"eTag": "\\"852f5d030be1b841f5d22d333b9fea7d\\"", "size": 23806, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T20:47:34.972Z", "contentLength": 23806, "httpStatusCode": 200}	16b39552-fb72-4f13-8e91-011586f6440c	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
c1b981fe-de5c-4905-ba2f-44a0806076f5	documents	documents/receipts/quittung-a900a91b-0c99-48db-96b1-682e0ddbc3fd.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-03 14:07:18.371308+00	2025-06-03 14:07:18.371308+00	2025-06-03 14:07:18.371308+00	{"eTag": "\\"37649edbc332317e6c4bafd1ab4b730c\\"", "size": 3096, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-03T14:07:18.367Z", "contentLength": 3096, "httpStatusCode": 200}	70c325a1-10b6-42ef-ba5e-b13841204594	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
8ed0b059-5b98-43fe-8b23-d757b3c1355d	documents	documents/receipts/quittung-ae78474b-2505-4fde-aa85-82ebefce80bf.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-03 21:49:34.467946+00	2025-06-03 21:49:34.467946+00	2025-06-03 21:49:34.467946+00	{"eTag": "\\"b567c1cd995c6087ccc0b54e9f77a3d6\\"", "size": 3156, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-03T21:49:34.463Z", "contentLength": 3156, "httpStatusCode": 200}	f5fa405a-ba01-4f3b-85b8-83ce2b499b30	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
ae5faef7-750d-4a6a-86e5-e50712a21086	documents	documents/expense_receipts/placeholder-beleg-70314f92-1ded-445c-8e7c-e52df2876c00.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-12 07:15:59.15762+00	2025-06-12 07:15:59.15762+00	2025-06-12 07:15:59.15762+00	{"eTag": "\\"d64a3d559efd3d90869176293f5be052\\"", "size": 5150, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-12T07:15:59.150Z", "contentLength": 5150, "httpStatusCode": 200}	50c50b96-f6f7-4b65-847a-655cc5fb6ffc	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
d92c04da-5359-4559-acb6-5b77f82c9b4a	documents	documents/expense_receipts/placeholder-beleg-7dc6892d-1f0b-4318-b659-2165d6be15ae.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-12 07:31:08.769021+00	2025-06-12 07:31:08.769021+00	2025-06-12 07:31:08.769021+00	{"eTag": "\\"d894854972b21505897826c5d9226f51\\"", "size": 4884, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-12T07:31:08.767Z", "contentLength": 4884, "httpStatusCode": 200}	8f174906-739e-4e5c-a560-ebc4ab2f38d0	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
bdaed9b6-048f-41b1-96ae-230de52e575f	documents	documents/expense_receipts/placeholder-beleg-4115fd68-ed6b-4f62-865f-2b48c66c513e.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 23:11:40.951808+00	2025-06-15 23:11:40.951808+00	2025-06-15 23:11:40.951808+00	{"eTag": "\\"5bc8378b1d27fe07ca4106d90b6b2e98\\"", "size": 5218, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T23:11:40.946Z", "contentLength": 5218, "httpStatusCode": 200}	02a466ad-6b98-472b-b56a-02313aa82dd2	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
2c2e55e2-682c-476b-8cb4-b65446bdf879	documents	documents/expense_receipts/placeholder-beleg-edf3467e-87ca-403c-8804-6bf2aae8f392.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-14 07:33:31.977563+00	2025-06-14 07:33:31.977563+00	2025-06-14 07:33:31.977563+00	{"eTag": "\\"ba7fce8a8f4390fd349886d25ca6719f\\"", "size": 5130, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-14T07:33:31.965Z", "contentLength": 5130, "httpStatusCode": 200}	62a19e66-84a0-4637-b370-675f99d00b30	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
fbd44844-73fd-46d6-a27a-bca682899881	documents	documents/expense_receipts/placeholder-beleg-6b75814a-e69a-4c1f-a2d7-c456472ed48e.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-14 07:59:13.892744+00	2025-06-14 07:59:13.892744+00	2025-06-14 07:59:13.892744+00	{"eTag": "\\"57d353a1dc311bcbe6d59f573ee4e952\\"", "size": 4896, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-14T07:59:13.888Z", "contentLength": 4896, "httpStatusCode": 200}	23025f51-b30c-480a-92c1-cb2dad1d9f76	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
af5068b7-dd94-4f21-b419-c17b1dedeb31	documents	documents/expense_receipts/placeholder-beleg-7a8f28a2-9657-4736-8135-bb0b254ad76a.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:44:56.692219+00	2025-06-16 12:44:56.692219+00	2025-06-16 12:44:56.692219+00	{"eTag": "\\"3c9aeefa4116605e34c2025a44801ec7\\"", "size": 5119, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T12:44:56.687Z", "contentLength": 5119, "httpStatusCode": 200}	f8340848-a83f-4d5d-b0f9-b0210e790654	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
32c13452-038a-47ac-b531-0fb4c5131251	business-logos	dd1329e7-5439-43ad-989b-0b8f5714824b/logo-1749978319110.svg	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 09:05:19.256518+00	2025-06-15 09:05:19.256518+00	2025-06-15 09:05:19.256518+00	{"eTag": "\\"affc3514b4f22cc5a10c3f9eaf0fad54\\"", "size": 7465, "mimetype": "image/svg+xml", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T09:05:19.247Z", "contentLength": 7465, "httpStatusCode": 200}	886df76b-741e-458d-b401-6786b327890e	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	2
df12cbb7-a4b3-4406-b184-17e23a24b8f9	documents	documents/receipts/quittung-1db4ab84-7dba-47eb-9708-d6a69e1d2da0.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 09:16:57.414019+00	2025-06-15 09:16:57.414019+00	2025-06-15 09:16:57.414019+00	{"eTag": "\\"400533f1427a7372c698a4e4b98b572b\\"", "size": 3119, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T09:16:57.409Z", "contentLength": 3119, "httpStatusCode": 200}	4b2ac05e-1b03-41a7-9e51-faf90c55a75f	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
ad7cb804-0efe-4c7d-9df3-36b7d4bbe05d	documents	documents/expense_receipts/placeholder-beleg-0b395afe-cf46-4eda-8447-4af68a2102aa.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 13:48:43.908519+00	2025-06-16 13:48:43.908519+00	2025-06-16 13:48:43.908519+00	{"eTag": "\\"4af194e9c5695b29278596dd9534c1dd\\"", "size": 23838, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T13:48:43.903Z", "contentLength": 23838, "httpStatusCode": 200}	afb88cc1-f264-47f9-9bad-7a3bca89d68a	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
e84bd893-6cdf-4f35-aa2c-fa211bb45a9b	business-logos	dd1329e7-5439-43ad-989b-0b8f5714824b/logo-1749979095695.svg	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 09:18:15.790215+00	2025-06-15 09:18:15.790215+00	2025-06-15 09:18:15.790215+00	{"eTag": "\\"5d70cc3a7d409b6805a7334180033b9c\\"", "size": 7465, "mimetype": "image/svg+xml", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T09:18:15.786Z", "contentLength": 7465, "httpStatusCode": 200}	5d6d1b5c-539f-41e3-8612-18dfa3fd25c3	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	2
18ea00e5-9332-4436-be8b-e1d97cb74d65	business-logos	49c9314c-e527-4df4-ab10-799fb5da0d1d/logo-1750270805490.png	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 18:20:05.575836+00	2025-06-18 18:20:05.575836+00	2025-06-18 18:20:05.575836+00	{"eTag": "\\"24da89afd258de49f1020f898b5fb08d\\"", "size": 25224, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-18T18:20:05.570Z", "contentLength": 25224, "httpStatusCode": 200}	b86090c2-ab9d-4a86-b46c-98a32d156759	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	2
b70702d2-ac1b-435d-87b0-5a6dcaadbde8	documents	documents/receipts/quittung-8a21c266-c1e3-493e-b7e2-75d5eb82ce32.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 09:23:07.605662+00	2025-06-15 09:23:07.605662+00	2025-06-15 09:23:07.605662+00	{"eTag": "\\"d83b302a10a30bc1f0a0e3c0602fca0e\\"", "size": 4002, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T09:23:07.602Z", "contentLength": 4002, "httpStatusCode": 200}	270c0bda-9bd6-419a-b0d5-763f3e9dedc3	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
69691967-4fcd-4cd4-9c0f-f3f049b2d617	documents	documents/receipts/quittung-9da2fcc2-e17f-4415-a667-5587a193bd8c.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:52:14.644371+00	2025-06-16 12:52:14.644371+00	2025-06-16 12:52:14.644371+00	{"eTag": "\\"900a44fc1574150d9a6d8b37bf60f4b4\\"", "size": 3948, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T12:52:14.640Z", "contentLength": 3948, "httpStatusCode": 200}	458f583a-26e2-4569-9efb-557e43a432cd	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
2aa156d8-a3da-447f-b7cc-0cdf5237e012	documents	documents/expense_receipts/placeholder-beleg-1e427b3c-a9fc-47eb-90c2-5a804e3e39d1.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:20:15.979126+00	2025-06-16 14:20:15.979126+00	2025-06-16 14:20:15.979126+00	{"eTag": "\\"7ca0fe8c623c9fe84d3e2851c79a8d1b\\"", "size": 23895, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T14:20:15.977Z", "contentLength": 23895, "httpStatusCode": 200}	e76cb509-2c0f-4b22-93f1-b141d70c04a7	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
498b450c-50b5-436c-b50e-fa6096ff6105	documents	documents/receipts/quittung-d5ab5c62-4088-45cc-9daf-59ab996b5316.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 09:48:31.751759+00	2025-06-17 09:48:31.751759+00	2025-06-17 09:48:31.751759+00	{"eTag": "\\"c7d1e8337c9080ad479f2f118dd41d55\\"", "size": 24070, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T09:48:31.746Z", "contentLength": 24070, "httpStatusCode": 200}	ca05cdd5-570f-426a-9300-916667841767	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
d4ec1ba9-5a63-4e14-b335-dd2297e7cfa4	documents	documents/expense_receipts/placeholder-beleg-38c1243e-cf76-405c-8a96-3950cc410802.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 16:08:48.682317+00	2025-06-17 16:08:48.682317+00	2025-06-17 16:08:48.682317+00	{"eTag": "\\"8d44cf4d23d7c09f0d0e3de80ada5218\\"", "size": 23910, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T16:08:48.676Z", "contentLength": 23910, "httpStatusCode": 200}	c24e7df9-b792-4f6a-ab18-2e905bcaf6d3	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
778c9968-264c-4b5e-9484-30ab8ecb42a8	documents	documents/receipts/quittung-6fdcfa6d-4014-4959-970f-c8dd35ea1b26.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 19:59:31.718208+00	2025-06-17 19:59:31.718208+00	2025-06-17 19:59:31.718208+00	{"eTag": "\\"e5db45b675768fe097345deec83939cd\\"", "size": 24051, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T19:59:31.713Z", "contentLength": 24051, "httpStatusCode": 200}	267f7eee-aaf3-4356-93d7-110d538062fe	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
1fee6c1b-c82e-4b21-8b0d-669948eeb6d7	documents	documents/receipts/quittung-a34f090d-9bb9-4a7d-a17d-e96f2f9a9d4e.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 21:32:18.749147+00	2025-06-17 21:32:18.749147+00	2025-06-17 21:32:18.749147+00	{"eTag": "\\"a1ad2adb967e1c50bcb40cf2d040b0e0\\"", "size": 3896, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T21:32:18.744Z", "contentLength": 3896, "httpStatusCode": 200}	020c0e7c-2c0f-46a2-9e0e-d74f113bfc40	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
f36f3666-8096-4d0e-9543-cefade3bb15f	documents	documents/receipts/quittung-d4b9994a-0ad9-49cf-bb81-b44c3bb80e9b.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:52:45.049317+00	2025-06-16 12:52:45.049317+00	2025-06-16 12:52:45.049317+00	{"eTag": "\\"4eb93c76f0c1cbfc9b8af62907aa5b85\\"", "size": 3931, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T12:52:45.046Z", "contentLength": 3931, "httpStatusCode": 200}	8116240c-f6ae-4a06-a70e-cda9d43145d2	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
56dd71a0-521d-4d1b-b7f5-a974ee03d56f	documents	documents/receipts/quittung-36dec7f9-04d5-4077-9b2b-3a872caafb96.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 15:17:26.777005+00	2025-06-15 15:17:26.777005+00	2025-06-15 15:17:26.777005+00	{"eTag": "\\"0706a82eab4d1d310d1e1f8a61885e82\\"", "size": 3976, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T15:17:26.774Z", "contentLength": 3976, "httpStatusCode": 200}	2b67edfe-c28a-4939-9baa-3764bcc59610	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
41f289db-f9b4-4518-b8e0-10655b797a28	documents	documents/receipts/quittung-bb2cf62d-9d1f-4b86-b8b7-9815e4776a68.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:53:13.167336+00	2025-06-16 12:53:13.167336+00	2025-06-16 12:53:13.167336+00	{"eTag": "\\"24e6839179c303ffaaf8d8d1939f0702\\"", "size": 3931, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T12:53:13.165Z", "contentLength": 3931, "httpStatusCode": 200}	c39c0687-ba2b-4e7d-8603-bbbcf03106b2	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
5aeff5de-f0cb-4528-a0c3-4bc8f39081d3	documents	documents/receipts/quittung-6c452256-5da5-4f76-b4c9-889fc6034f57.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:39:26.081007+00	2025-06-16 14:39:26.081007+00	2025-06-16 14:39:26.081007+00	{"eTag": "\\"89959d8ca25fd7942f02dc0f91608158\\"", "size": 23871, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T14:39:26.076Z", "contentLength": 23871, "httpStatusCode": 200}	d9045112-bc94-47d5-a1b9-44b4e4adb56f	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
81ff8fcc-65d7-4bf8-99f5-fb5bc4b7aced	documents	documents/receipts/quittung-d334b18c-1921-4852-87cd-97e42cb70d09.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 15:19:55.139288+00	2025-06-17 15:19:55.139288+00	2025-06-17 15:19:55.139288+00	{"eTag": "\\"b71e5407a9f767b19d1bc95cf1f9933e\\"", "size": 24048, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T15:19:55.136Z", "contentLength": 24048, "httpStatusCode": 200}	7fc7ac0a-d904-46fe-a0ba-2eba54c9365f	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
8d603fb7-2683-4a4f-88d3-4dd93469b349	documents	documents/receipts/quittung-08c9174a-63d2-4d3f-bfc6-b3847c026421.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 16:09:22.022277+00	2025-06-17 16:09:22.022277+00	2025-06-17 16:09:22.022277+00	{"eTag": "\\"342835622b2e8bcfacf1e45ac8c9057a\\"", "size": 23849, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T16:09:22.019Z", "contentLength": 23849, "httpStatusCode": 200}	366569c1-5163-4a43-b1fe-b422eb791c4d	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
e05d4849-6dc8-4260-9b3a-1470a39b66b1	documents	documents/expense_receipts/placeholder-beleg-bde76e44-4397-4fb7-8cbd-158d6cf9f878.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:02:47.468377+00	2025-06-17 20:02:47.468377+00	2025-06-17 20:02:47.468377+00	{"eTag": "\\"77f74a953a30cea75e05584dce325676\\"", "size": 23818, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T20:02:47.466Z", "contentLength": 23818, "httpStatusCode": 200}	18428a69-4bc0-4cda-a4e3-0da82a0d014d	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
26d7b14d-106d-471f-af2a-7cf5b4ad8c3d	business-logos	49c9314c-e527-4df4-ab10-799fb5da0d1d/logo-1750270328183.png	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 18:12:08.274222+00	2025-06-18 18:12:08.274222+00	2025-06-18 18:12:08.274222+00	{"eTag": "\\"0f27ea128cee6cd401331116246d6834\\"", "size": 20988, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-18T18:12:08.269Z", "contentLength": 20988, "httpStatusCode": 200}	9c06a98a-f5c2-49ea-afee-2d428651c95d	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	2
f161af24-5dd3-427b-bbf2-baa81356d236	business-logos	49c9314c-e527-4df4-ab10-799fb5da0d1d/logo-1750270342340.png	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 18:12:22.401173+00	2025-06-18 18:12:22.401173+00	2025-06-18 18:12:22.401173+00	{"eTag": "\\"0f27ea128cee6cd401331116246d6834\\"", "size": 20988, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-18T18:12:22.396Z", "contentLength": 20988, "httpStatusCode": 200}	504983a2-478a-43c1-9466-1d41e984843d	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	2
0f109208-d91a-431e-88e3-61be2db0e66b	business-logos	49c9314c-e527-4df4-ab10-799fb5da0d1d/logo-1750270349979.png	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 18:12:30.032553+00	2025-06-18 18:12:30.032553+00	2025-06-18 18:12:30.032553+00	{"eTag": "\\"0f27ea128cee6cd401331116246d6834\\"", "size": 20988, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-18T18:12:30.029Z", "contentLength": 20988, "httpStatusCode": 200}	1250a87d-7e9a-4f2d-aedb-955498bd7c21	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	2
8d22638c-9fbe-44bb-93ee-00afcaccadbb	documents	documents/receipts/quittung-65cd0a58-029b-4bfc-9460-d51b1704751c.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 12:56:49.618875+00	2025-06-16 12:56:49.618875+00	2025-06-16 12:56:49.618875+00	{"eTag": "\\"71a815b0e7ddeaab2554890f675a35b0\\"", "size": 24081, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T12:56:49.616Z", "contentLength": 24081, "httpStatusCode": 200}	c9bdb81b-576e-4980-86ce-c99281a411e8	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
8f62ec03-4a09-4a0e-95cd-fa724ce52e07	documents	documents/receipts/quittung-df6058ef-d786-4c1e-91f5-9f9cd4859140.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-16 14:40:29.853812+00	2025-06-16 14:40:29.853812+00	2025-06-16 14:40:29.853812+00	{"eTag": "\\"41c3ce709d8d390b5128987583d1a093\\"", "size": 23853, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-16T14:40:29.847Z", "contentLength": 23853, "httpStatusCode": 200}	0c82614d-6cfa-42fd-aa23-8fa7c9d10c92	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
9a1fa57b-76fb-4f1f-906f-8e2d8f348354	documents	documents/receipts/quittung-213d718e-8d06-4a6c-ac2a-6b9eb4d44d4c.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 15:37:48.562282+00	2025-06-17 15:37:48.562282+00	2025-06-17 15:37:48.562282+00	{"eTag": "\\"825e07ca79f8632adc1bfe0e40a12454\\"", "size": 23852, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T15:37:48.558Z", "contentLength": 23852, "httpStatusCode": 200}	80acc396-86f4-4a98-a39e-d182d6882d2f	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
d00b27ed-5e1c-4c74-8db4-aec7a7cebeee	documents	documents/receipts/quittung-a5a88e12-0ebb-4708-b025-f451d5bf84df.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 17:09:03.291047+00	2025-06-17 17:09:03.291047+00	2025-06-17 17:09:03.291047+00	{"eTag": "\\"edba6ceba4493947400024e5cf8ad295\\"", "size": 3679, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T17:09:03.286Z", "contentLength": 3679, "httpStatusCode": 200}	52bd969c-f23d-412f-b3f8-7e4f020c23df	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
50882acb-fd27-4839-99f2-395cb72cdcf5	documents	documents/receipts/quittung-9804af6f-3bc9-4366-a52f-954f2d030018.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-17 20:46:24.733084+00	2025-06-17 20:46:24.733084+00	2025-06-17 20:46:24.733084+00	{"eTag": "\\"fd116223ca7f6e61b8f14d7f3df2c3df\\"", "size": 24050, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-17T20:46:24.728Z", "contentLength": 24050, "httpStatusCode": 200}	f75b3f4a-7edb-435e-ad8a-0658363577ff	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
8b245020-ec64-4b69-ab0f-059982220a7b	business-logos	49c9314c-e527-4df4-ab10-799fb5da0d1d/logo-1750270335134.png	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 18:12:15.178769+00	2025-06-18 18:12:15.178769+00	2025-06-18 18:12:15.178769+00	{"eTag": "\\"89fc6165df2b1b23d96f315086fae266\\"", "size": 20790, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-18T18:12:15.175Z", "contentLength": 20790, "httpStatusCode": 200}	36c04797-51dc-47fc-a743-f3682388518b	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	2
a867cb03-20f4-4767-bf9e-71f987e90260	business-logos	49c9314c-e527-4df4-ab10-799fb5da0d1d/logo-1750270345534.png	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-18 18:12:25.572917+00	2025-06-18 18:12:25.572917+00	2025-06-18 18:12:25.572917+00	{"eTag": "\\"0f27ea128cee6cd401331116246d6834\\"", "size": 20988, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-18T18:12:25.569Z", "contentLength": 20988, "httpStatusCode": 200}	3d811b35-dab8-4d09-bc99-6f0e4c35ca30	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	2
4c373b88-63f9-48e6-9df2-f1019648462b	documents	documents/expense_receipts/placeholder-beleg-3abb0e84-13cb-43a9-873b-1d8c4e9232c7.pdf	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 19:29:06.96681+00	2025-06-15 19:29:06.96681+00	2025-06-15 19:29:06.96681+00	{"eTag": "\\"a37c5df9fecbfe5134a00cf0afeb3d08\\"", "size": 5179, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T19:29:06.964Z", "contentLength": 5179, "httpStatusCode": 200}	a2b48bbf-666b-4a24-8c1e-4bbbe71956e9	dd1329e7-5439-43ad-989b-0b8f5714824b	{}	3
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
documents	documents/expense_receipts	2025-05-30 10:56:30.761437+00	2025-05-30 10:56:30.761437+00
documents	documents	2025-03-16 23:35:35.59878+00	2025-03-16 23:35:35.59878+00
documents	documents/daily_reports	2025-05-30 12:11:05.787863+00	2025-05-30 12:11:05.787863+00
business-logos	dd1329e7-5439-43ad-989b-0b8f5714824b	2025-06-15 09:05:19.256518+00	2025-06-15 09:05:19.256518+00
documents	documents/monthly_reports	2025-06-15 20:23:50.177036+00	2025-06-15 20:23:50.177036+00
business-logos	49c9314c-e527-4df4-ab10-799fb5da0d1d	2025-06-18 18:12:08.274222+00	2025-06-18 18:12:08.274222+00
documents	documents/receipts	2025-05-29 18:32:14.51468+00	2025-05-29 18:32:14.51468+00
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: -
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: -
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2025-03-16 17:58:30.74065+00
20210809183423_update_grants	2025-03-16 17:58:30.74065+00
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 483, true);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: -
--

SELECT pg_catalog.setval('pgsodium.key_key_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: -
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


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
-- Name: business_settings business_settings_user_org_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_user_org_unique UNIQUE (user_id, organization_id);


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
-- Name: CONSTRAINT unique_bank_reference_per_account ON bank_transactions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT unique_bank_reference_per_account ON public.bank_transactions IS 'Prevents importing same bank transaction twice per account';


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
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


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
-- Name: idx_name_bucket_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_unique ON storage.objects USING btree (name COLLATE "C", bucket_id);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT OR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: users on_auth_user_deleted; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_deleted BEFORE DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();


--
-- Name: cash_movements audit_cash_movements_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_cash_movements_changes AFTER INSERT OR DELETE OR UPDATE ON public.cash_movements FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

ALTER TABLE public.cash_movements DISABLE TRIGGER audit_cash_movements_changes;


--
-- Name: expenses audit_expenses_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_expenses_changes AFTER INSERT OR DELETE OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

ALTER TABLE public.expenses DISABLE TRIGGER audit_expenses_changes;


--
-- Name: sale_items audit_sale_items_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_sale_items_changes AFTER INSERT OR DELETE OR UPDATE ON public.sale_items FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

ALTER TABLE public.sale_items DISABLE TRIGGER audit_sale_items_changes;


--
-- Name: sales audit_sales_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_sales_changes AFTER INSERT OR DELETE OR UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

ALTER TABLE public.sales DISABLE TRIGGER audit_sales_changes;


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
-- Name: TRIGGER trigger_auto_populate_supplier_id ON expenses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER trigger_auto_populate_supplier_id ON public.expenses IS 'Auto-populates supplier_id from supplier_name during insert/update';


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
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN ((new.name <> old.name)) EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


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
-- Name: business_settings business_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: sales sales_bank_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES public.bank_transactions(id);


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
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


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
-- Name: business_settings business_settings_org_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY business_settings_org_access ON public.business_settings TO authenticated USING ((organization_id IN ( SELECT organization_users.organization_id
   FROM public.organization_users
  WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true)))));


--
-- Name: cash_movements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

--
-- Name: cash_movements cash_movements_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cash_movements_access ON public.cash_movements TO authenticated USING (true) WITH CHECK (true);


--
-- Name: daily_summaries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_summaries daily_summaries_business_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY daily_summaries_business_access ON public.daily_summaries TO authenticated USING (true) WITH CHECK (true);


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
-- Name: documents documents_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY documents_access ON public.documents TO authenticated USING (true) WITH CHECK (true);


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
-- Name: items items_business_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY items_business_access ON public.items TO authenticated USING (true) WITH CHECK (true);


--
-- Name: monthly_summaries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

--
-- Name: monthly_summaries monthly_summaries_business_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY monthly_summaries_business_access ON public.monthly_summaries TO authenticated USING (true) WITH CHECK (true);


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
-- Name: sale_items sale_items_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sale_items_access ON public.sale_items TO authenticated USING (true) WITH CHECK (true);


--
-- Name: sales; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

--
-- Name: sales sales_org_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sales_org_access ON public.sales TO authenticated USING (true) WITH CHECK (true);


--
-- Name: suppliers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

--
-- Name: suppliers suppliers_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY suppliers_access ON public.suppliers TO authenticated USING (true) WITH CHECK (true);


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
-- Name: objects Enable logo access for authenticated users; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Enable logo access for authenticated users" ON storage.objects TO authenticated USING ((bucket_id = 'business-logos'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: objects documents bucket policy; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "documents bucket policy" ON storage.objects TO authenticated USING ((bucket_id = 'documents'::text)) WITH CHECK ((bucket_id = 'documents'::text));


--
-- Name: objects documents_authenticated_upload; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY documents_authenticated_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'documents'::text));


--
-- Name: objects documents_objects_access; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY documents_objects_access ON storage.objects TO authenticated USING ((bucket_id = 'documents'::text)) WITH CHECK ((bucket_id = 'documents'::text));


--
-- Name: objects documents_owner_delete; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY documents_owner_delete ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'documents'::text) AND (auth.uid() = owner)));


--
-- Name: objects documents_public_read; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY documents_public_read ON storage.objects FOR SELECT USING ((bucket_id = 'documents'::text));


--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

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

