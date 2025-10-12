-- ============================================================================
-- VIEWS, INDEXES, SECURITY & SEED DATA
-- ============================================================================
-- Final setup: Views, Performance Indexes, RLS Policies, Essential Data

-- CUSTOM VIEWS
 CREATE OR REPLACE VIEW available_for_bank_matching AS                                                                                                                                                               +
  SELECT s.id,                                                                                                                                                                                                       +
     'sale'::text AS item_type,                                                                                                                                                                                      +
     (s.created_at)::date AS date,                                                                                                                                                                                   +
     pr.net_amount AS amount,                                                                                                                                                                                        +
     concat('Sale #', s.id, ' (', pr.provider, ' net)') AS description,                                                                                                                                              +
     s.banking_status,                                                                                                                                                                                               +
     s.organization_id                                                                                                                                                                                               +
    FROM (sales s                                                                                                                                                                                                    +
      JOIN provider_reports pr ON ((s.provider_report_id = pr.id)))                                                                                                                                                  +
   WHERE ((s.banking_status)::text = 'provider_matched'::text)                                                                                                                                                       +
 UNION ALL                                                                                                                                                                                                           +
  SELECT e.id,                                                                                                                                                                                                       +
     'expense'::text AS item_type,                                                                                                                                                                                   +
     e.payment_date AS date,                                                                                                                                                                                         +
     (- e.amount) AS amount,                                                                                                                                                                                         +
     e.description,                                                                                                                                                                                                  +
     e.banking_status,                                                                                                                                                                                               +
     e.organization_id                                                                                                                                                                                               +
    FROM expenses e                                                                                                                                                                                                  +
   WHERE ((e.banking_status)::text = 'unmatched'::text)                                                                                                                                                              +
 UNION ALL                                                                                                                                                                                                           +
  SELECT cm.id,                                                                                                                                                                                                      +
     'cash_movement'::text AS item_type,                                                                                                                                                                             +
     (cm.created_at)::date AS date,                                                                                                                                                                                  +
     cm.amount,                                                                                                                                                                                                      +
     concat('Cash Transfer: ', cm.description) AS description,                                                                                                                                                       +
     cm.banking_status,                                                                                                                                                                                              +
     cm.organization_id                                                                                                                                                                                              +
    FROM cash_movements cm                                                                                                                                                                                           +
   WHERE (((cm.banking_status)::text = 'unmatched'::text) AND ((cm.movement_type)::text = 'bank_transfer'::text))                                                                                                    +
 UNION ALL                                                                                                                                                                                                           +
  SELECT ot.id,                                                                                                                                                                                                      +
     'owner_transaction'::text AS item_type,                                                                                                                                                                         +
     ot.transaction_date AS date,                                                                                                                                                                                    +
         CASE ot.transaction_type                                                                                                                                                                                    +
             WHEN 'deposit'::text THEN ot.amount                                                                                                                                                                     +
             WHEN 'withdrawal'::text THEN (- ot.amount)                                                                                                                                                              +
             WHEN 'expense'::text THEN (- ot.amount)                                                                                                                                                                 +
             ELSE NULL::numeric                                                                                                                                                                                      +
         END AS amount,                                                                                                                                                                                              +
     concat('Owner ',                                                                                                                                                                                                +
         CASE ot.transaction_type                                                                                                                                                                                    +
             WHEN 'deposit'::text THEN 'Einlage'::text                                                                                                                                                               +
             WHEN 'withdrawal'::text THEN 'Entnahme'::text                                                                                                                                                           +
             WHEN 'expense'::text THEN 'Ausgabe'::text                                                                                                                                                               +
             ELSE NULL::text                                                                                                                                                                                         +
         END, ': ', ot.description) AS description,                                                                                                                                                                  +
     ot.banking_status,                                                                                                                                                                                              +
     ot.organization_id                                                                                                                                                                                              +
    FROM owner_transactions ot                                                                                                                                                                                       +
   WHERE (((ot.payment_method)::text = 'bank_transfer'::text) AND ((ot.banking_status)::text = 'unmatched'::text))                                                                                                   +
   ORDER BY 3 DESC;;                                                                                                                                                                                                 +
                                                                                                                                                                                                                     +
 
 CREATE OR REPLACE VIEW recent_missing_closures AS                                                                                                                                                                   +
  SELECT find_missing_daily_closures.missing_date,                                                                                                                                                                   +
     find_missing_daily_closures.sales_count,                                                                                                                                                                        +
     find_missing_daily_closures.sales_total,                                                                                                                                                                        +
     find_missing_daily_closures.has_draft_summary,                                                                                                                                                                  +
     (CURRENT_DATE - find_missing_daily_closures.missing_date) AS days_ago                                                                                                                                           +
    FROM find_missing_daily_closures(((CURRENT_DATE - '30 days'::interval))::date, ((CURRENT_DATE - '1 day'::interval))::date) find_missing_daily_closures(missing_date, sales_count, sales_total, has_draft_summary)+
   ORDER BY find_missing_daily_closures.missing_date DESC;;                                                                                                                                                          +
                                                                                                                                                                                                                     +
 
 CREATE OR REPLACE VIEW unified_transactions_view AS                                                                                                                                                                 +
  WITH transaction_base AS (                                                                                                                                                                                         +
          SELECT s.id,                                                                                                                                                                                               +
             'sale'::text AS transaction_type,                                                                                                                                                                       +
             'VK'::text AS type_code,                                                                                                                                                                                +
             s.receipt_number,                                                                                                                                                                                       +
             s.created_at AS transaction_date,                                                                                                                                                                       +
             s.total_amount AS amount,                                                                                                                                                                               +
             s.payment_method,                                                                                                                                                                                       +
             s.status,                                                                                                                                                                                               +
             s.user_id,                                                                                                                                                                                              +
             s.organization_id,                                                                                                                                                                                      +
             COALESCE(( SELECT string_agg(i.name, ', '::text) AS string_agg                                                                                                                                          +
                    FROM (sale_items si                                                                                                                                                                              +
                      JOIN items i ON ((si.item_id = i.id)))                                                                                                                                                         +
                   WHERE (si.sale_id = s.id)), 'Verkauf'::text) AS description,                                                                                                                                      +
             d.id AS document_id,                                                                                                                                                                                    +
                 CASE                                                                                                                                                                                                +
                     WHEN (d.id IS NOT NULL) THEN true                                                                                                                                                               +
                     ELSE false                                                                                                                                                                                      +
                 END AS has_pdf,                                                                                                                                                                                     +
             s.banking_status,                                                                                                                                                                                       +
             pr.fees AS provider_fee,                                                                                                                                                                                +
             pr.net_amount,                                                                                                                                                                                          +
             s.provider_report_id,                                                                                                                                                                                   +
                 CASE                                                                                                                                                                                                +
                     WHEN (s.provider_report_id IS NOT NULL) THEN true                                                                                                                                               +
                     ELSE false                                                                                                                                                                                      +
                 END AS has_real_provider_fees                                                                                                                                                                       +
            FROM ((sales s                                                                                                                                                                                           +
              LEFT JOIN documents d ON (((d.reference_id = s.id) AND (d.type = 'receipt'::text))))                                                                                                                   +
              LEFT JOIN provider_reports pr ON ((s.provider_report_id = pr.id)))                                                                                                                                     +
         UNION ALL                                                                                                                                                                                                   +
          SELECT e.id,                                                                                                                                                                                               +
             'expense'::text AS transaction_type,                                                                                                                                                                    +
             'AG'::text AS type_code,                                                                                                                                                                                +
             e.receipt_number,                                                                                                                                                                                       +
             e.created_at AS transaction_date,                                                                                                                                                                       +
             (- e.amount) AS amount,                                                                                                                                                                                 +
             e.payment_method,                                                                                                                                                                                       +
             'completed'::text AS status,                                                                                                                                                                            +
             e.user_id,                                                                                                                                                                                              +
             e.organization_id,                                                                                                                                                                                      +
             e.description,                                                                                                                                                                                          +
             d.id AS document_id,                                                                                                                                                                                    +
                 CASE                                                                                                                                                                                                +
                     WHEN (d.id IS NOT NULL) THEN true                                                                                                                                                               +
                     ELSE false                                                                                                                                                                                      +
                 END AS has_pdf,                                                                                                                                                                                     +
             e.banking_status,                                                                                                                                                                                       +
             NULL::numeric AS provider_fee,                                                                                                                                                                          +
             NULL::numeric AS net_amount,                                                                                                                                                                            +
             NULL::uuid AS provider_report_id,                                                                                                                                                                       +
             false AS has_real_provider_fees                                                                                                                                                                         +
            FROM (expenses e                                                                                                                                                                                         +
              LEFT JOIN documents d ON (((d.reference_id = e.id) AND (d.type = 'expense_receipt'::text))))                                                                                                           +
         UNION ALL                                                                                                                                                                                                   +
          SELECT cm.id,                                                                                                                                                                                              +
             'cash_movement'::text AS transaction_type,                                                                                                                                                              +
             'CM'::text AS type_code,                                                                                                                                                                                +
             cm.movement_number AS receipt_number,                                                                                                                                                                   +
             cm.created_at AS transaction_date,                                                                                                                                                                      +
                 CASE                                                                                                                                                                                                +
                     WHEN (cm.type = 'cash_in'::text) THEN cm.amount                                                                                                                                                 +
                     ELSE (- cm.amount)                                                                                                                                                                              +
                 END AS amount,                                                                                                                                                                                      +
             'cash'::text AS payment_method,                                                                                                                                                                         +
             'completed'::text AS status,                                                                                                                                                                            +
             cm.user_id,                                                                                                                                                                                             +
             cm.organization_id,                                                                                                                                                                                     +
             cm.description,                                                                                                                                                                                         +
             NULL::uuid AS document_id,                                                                                                                                                                              +
             false AS has_pdf,                                                                                                                                                                                       +
             cm.banking_status,                                                                                                                                                                                      +
             NULL::numeric AS provider_fee,                                                                                                                                                                          +
             NULL::numeric AS net_amount,                                                                                                                                                                            +
             NULL::uuid AS provider_report_id,                                                                                                                                                                       +
             false AS has_real_provider_fees                                                                                                                                                                         +
            FROM cash_movements cm                                                                                                                                                                                   +
         UNION ALL                                                                                                                                                                                                   +
          SELECT bt.id,                                                                                                                                                                                              +
             'bank_transaction'::text AS transaction_type,                                                                                                                                                           +
             'BT'::text AS type_code,                                                                                                                                                                                +
             bt.transaction_number AS receipt_number,                                                                                                                                                                +
             bt.created_at AS transaction_date,                                                                                                                                                                      +
             bt.amount,                                                                                                                                                                                              +
             'bank'::text AS payment_method,                                                                                                                                                                         +
             bt.status,                                                                                                                                                                                              +
             bt.user_id,                                                                                                                                                                                             +
             bt.organization_id,                                                                                                                                                                                     +
             bt.description,                                                                                                                                                                                         +
             NULL::uuid AS document_id,                                                                                                                                                                              +
             false AS has_pdf,                                                                                                                                                                                       +
             bt.status AS banking_status,                                                                                                                                                                            +
             NULL::numeric AS provider_fee,                                                                                                                                                                          +
             NULL::numeric AS net_amount,                                                                                                                                                                            +
             NULL::uuid AS provider_report_id,                                                                                                                                                                       +
             false AS has_real_provider_fees                                                                                                                                                                         +
            FROM bank_transactions bt                                                                                                                                                                                +
         )                                                                                                                                                                                                           +
  SELECT transaction_base.id,                                                                                                                                                                                        +
     transaction_base.transaction_type,                                                                                                                                                                              +
     transaction_base.type_code,                                                                                                                                                                                     +
     transaction_base.receipt_number,                                                                                                                                                                                +
     transaction_base.transaction_date,                                                                                                                                                                              +
     transaction_base.amount,                                                                                                                                                                                        +
     transaction_base.payment_method,                                                                                                                                                                                +
     transaction_base.status,                                                                                                                                                                                        +
     transaction_base.user_id,                                                                                                                                                                                       +
     transaction_base.organization_id,                                                                                                                                                                               +
     transaction_base.description,                                                                                                                                                                                   +
     transaction_base.document_id,                                                                                                                                                                                   +
     transaction_base.has_pdf,                                                                                                                                                                                       +
     transaction_base.banking_status,                                                                                                                                                                                +
     date(transaction_base.transaction_date) AS date_only,                                                                                                                                                           +
     to_char(transaction_base.transaction_date, 'HH24:MI'::text) AS time_only,                                                                                                                                       +
     lower(transaction_base.description) AS description_lower,                                                                                                                                                       +
     lower((transaction_base.receipt_number)::text) AS receipt_number_lower,                                                                                                                                         +
     transaction_base.provider_fee,                                                                                                                                                                                  +
     transaction_base.net_amount,                                                                                                                                                                                    +
     transaction_base.provider_report_id,                                                                                                                                                                            +
     transaction_base.has_real_provider_fees                                                                                                                                                                         +
    FROM transaction_base                                                                                                                                                                                            +
   ORDER BY transaction_base.transaction_date DESC;;                                                                                                                                                                 +
                                                                                                                                                                                                                     +
 
 CREATE OR REPLACE VIEW unmatched_bank_transactions AS                                                                                                                                                               +
  SELECT bt.id,                                                                                                                                                                                                      +
     bt.bank_account_id,                                                                                                                                                                                             +
     bt.transaction_date,                                                                                                                                                                                            +
     bt.booking_date,                                                                                                                                                                                                +
     bt.amount,                                                                                                                                                                                                      +
     bt.description,                                                                                                                                                                                                 +
     bt.reference,                                                                                                                                                                                                   +
     bt.transaction_code,                                                                                                                                                                                            +
     bt.import_batch_id,                                                                                                                                                                                             +
     bt.import_filename,                                                                                                                                                                                             +
     bt.import_date,                                                                                                                                                                                                 +
     bt.raw_data,                                                                                                                                                                                                    +
     bt.status,                                                                                                                                                                                                      +
     bt.user_id,                                                                                                                                                                                                     +
     bt.organization_id,                                                                                                                                                                                             +
     bt.created_at,                                                                                                                                                                                                  +
     bt.updated_at,                                                                                                                                                                                                  +
     bt.notes,                                                                                                                                                                                                       +
     ba.name AS bank_account_name,                                                                                                                                                                                   +
         CASE                                                                                                                                                                                                        +
             WHEN (bt.amount > (0)::numeric) THEN '⬆️ Eingang'::text                                                                                                                                                  +
             ELSE '⬇️ Ausgang'::text                                                                                                                                                                                  +
         END AS direction_display,                                                                                                                                                                                   +
     abs(bt.amount) AS amount_abs                                                                                                                                                                                    +
    FROM (bank_transactions bt                                                                                                                                                                                       +
      JOIN bank_accounts ba ON ((bt.bank_account_id = ba.id)))                                                                                                                                                       +
   WHERE ((bt.status)::text = 'unmatched'::text)                                                                                                                                                                     +
   ORDER BY bt.transaction_date DESC;;                                                                                                                                                                               +
                                                                                                                                                                                                                     +
 
 CREATE OR REPLACE VIEW unmatched_provider_reports AS                                                                                                                                                                +
  SELECT pr.id,                                                                                                                                                                                                      +
     pr.provider,                                                                                                                                                                                                    +
     pr.transaction_date,                                                                                                                                                                                            +
     pr.settlement_date,                                                                                                                                                                                             +
     pr.gross_amount,                                                                                                                                                                                                +
     pr.fees,                                                                                                                                                                                                        +
     pr.net_amount,                                                                                                                                                                                                  +
     pr.provider_transaction_id,                                                                                                                                                                                     +
     pr.provider_reference,                                                                                                                                                                                          +
     pr.payment_method,                                                                                                                                                                                              +
     pr.currency,                                                                                                                                                                                                    +
     pr.import_filename,                                                                                                                                                                                             +
     pr.import_date,                                                                                                                                                                                                 +
     pr.raw_data,                                                                                                                                                                                                    +
     pr.sale_id,                                                                                                                                                                                                     +
     pr.status,                                                                                                                                                                                                      +
     pr.user_id,                                                                                                                                                                                                     +
     pr.organization_id,                                                                                                                                                                                             +
     pr.created_at,                                                                                                                                                                                                  +
     pr.updated_at,                                                                                                                                                                                                  +
     pr.notes,                                                                                                                                                                                                       +
         CASE                                                                                                                                                                                                        +
             WHEN ((pr.provider)::text = 'twint'::text) THEN '🟦 TWINT'::character varying                                                                                                                           +
             WHEN ((pr.provider)::text = 'sumup'::text) THEN '🟧 SumUp'::character varying                                                                                                                           +
             ELSE pr.provider                                                                                                                                                                                        +
         END AS provider_display                                                                                                                                                                                     +
    FROM provider_reports pr                                                                                                                                                                                         +
   WHERE ((pr.status)::text = 'unmatched'::text)                                                                                                                                                                     +
   ORDER BY pr.transaction_date DESC;;                                                                                                                                                                               +
                                                                                                                                                                                                                     +
 
 CREATE OR REPLACE VIEW unmatched_sales_for_provider AS                                                                                                                                                              +
  SELECT s.id,                                                                                                                                                                                                       +
     s.total_amount,                                                                                                                                                                                                 +
     s.payment_method,                                                                                                                                                                                               +
     s.status,                                                                                                                                                                                                       +
     s.notes,                                                                                                                                                                                                        +
     s.user_id,                                                                                                                                                                                                      +
     s.organization_id,                                                                                                                                                                                              +
     s.created_at,                                                                                                                                                                                                   +
     s.gross_amount,                                                                                                                                                                                                 +
     s.provider_fee,                                                                                                                                                                                                 +
     s.net_amount,                                                                                                                                                                                                   +
     s.settlement_status,                                                                                                                                                                                            +
     s.settlement_date,                                                                                                                                                                                              +
     s.provider_reference_id,                                                                                                                                                                                        +
     s.provider_report_id,                                                                                                                                                                                           +
     s.bank_transaction_id,                                                                                                                                                                                          +
     s.banking_status,                                                                                                                                                                                               +
         CASE s.payment_method                                                                                                                                                                                       +
             WHEN 'twint'::text THEN '🟦 TWINT'::text                                                                                                                                                                +
             WHEN 'sumup'::text THEN '🟧 SumUp'::text                                                                                                                                                                +
             ELSE s.payment_method                                                                                                                                                                                   +
         END AS payment_display                                                                                                                                                                                      +
    FROM sales s                                                                                                                                                                                                     +
   WHERE ((s.payment_method = ANY (ARRAY['twint'::text, 'sumup'::text])) AND (s.provider_report_id IS NULL) AND ((s.banking_status)::text = 'unmatched'::text))                                                      +
   ORDER BY s.created_at DESC;;                                                                                                                                                                                      +
                                                                                                                                                                                                                     +
 

-- PERFORMANCE INDEXES
 CREATE INDEX idx_audit_log_table_record ON public.audit_log USING btree (table_name, record_id);                                       +
 
 CREATE INDEX idx_audit_log_timestamp ON public.audit_log USING btree ("timestamp");                                                    +
 
 CREATE INDEX idx_bank_accounts_iban ON public.bank_accounts USING btree (iban);                                                        +
 
 CREATE INDEX idx_bank_accounts_org_active ON public.bank_accounts USING btree (organization_id, is_active);                            +
 
 CREATE INDEX idx_bank_accounts_user_active ON public.bank_accounts USING btree (user_id, is_active);                                   +
 
 CREATE INDEX idx_bank_import_sessions_account ON public.bank_import_sessions USING btree (bank_account_id);                            +
 
 CREATE INDEX idx_bank_import_sessions_date ON public.bank_import_sessions USING btree (imported_at);                                   +
 
 CREATE INDEX idx_bank_import_sessions_filename ON public.bank_import_sessions USING btree (import_filename);                           +
 
 CREATE UNIQUE INDEX bank_transactions_transaction_number_key ON public.bank_transactions USING btree (transaction_number);             +
 
 CREATE INDEX idx_bank_transactions_account_date ON public.bank_transactions USING btree (bank_account_id, transaction_date);           +
 
 CREATE INDEX idx_bank_transactions_amount ON public.bank_transactions USING btree (amount);                                            +
 
 CREATE INDEX idx_bank_transactions_booking_date ON public.bank_transactions USING btree (booking_date);                                +
 
 CREATE INDEX idx_bank_transactions_import_batch ON public.bank_transactions USING btree (import_batch_id);                             +
 
 CREATE INDEX idx_bank_transactions_import_filename ON public.bank_transactions USING btree (import_filename);                          +
 
 CREATE INDEX idx_bank_transactions_number ON public.bank_transactions USING btree (transaction_number);                                +
 
 CREATE INDEX idx_bank_transactions_reference ON public.bank_transactions USING btree (reference);                                      +
 
 CREATE INDEX idx_bank_transactions_status ON public.bank_transactions USING btree (status);                                            +
 
 CREATE INDEX idx_bank_transactions_status_date ON public.bank_transactions USING btree (status, transaction_date);                     +
 
 CREATE UNIQUE INDEX unique_bank_reference_per_account ON public.bank_transactions USING btree (bank_account_id, reference);            +
 
 CREATE UNIQUE INDEX business_settings_user_org_unique ON public.business_settings USING btree (user_id, organization_id);              +
 
 CREATE UNIQUE INDEX cash_movements_movement_number_key ON public.cash_movements USING btree (movement_number);                         +
 
 CREATE INDEX idx_cash_movements_bank_transaction ON public.cash_movements USING btree (bank_transaction_id);                           +
 
 CREATE INDEX idx_cash_movements_created_at ON public.cash_movements USING btree (created_at);                                          +
 
 CREATE INDEX idx_cash_movements_movement_type ON public.cash_movements USING btree (movement_type);                                    +
 
 CREATE INDEX idx_cash_movements_number ON public.cash_movements USING btree (movement_number);                                         +
 
 CREATE INDEX idx_cash_movements_org_date ON public.cash_movements USING btree (organization_id, created_at DESC);                      +
 
 CREATE INDEX idx_cash_movements_user_id ON public.cash_movements USING btree (user_id);                                                +
 
 CREATE UNIQUE INDEX daily_summaries_report_date_key ON public.daily_summaries USING btree (report_date);                               +
 
 CREATE INDEX idx_daily_summaries_created_by ON public.daily_summaries USING btree (created_by);                                        +
 
 CREATE INDEX idx_daily_summaries_report_date ON public.daily_summaries USING btree (report_date);                                      +
 
 CREATE INDEX idx_document_sequences_type ON public.document_sequences USING btree (type);                                              +
 
 CREATE UNIQUE INDEX documents_document_number_key ON public.documents USING btree (document_number);                                   +
 
 CREATE INDEX idx_documents_document_date ON public.documents USING btree (document_date);                                              +
 
 CREATE INDEX idx_documents_document_number ON public.documents USING btree (document_number);                                          +
 
 CREATE INDEX idx_documents_org_type ON public.documents USING btree (organization_id, type);                                           +
 
 CREATE INDEX idx_documents_reference_type_id ON public.documents USING btree (reference_type, reference_id);                           +
 
 CREATE INDEX idx_documents_type ON public.documents USING btree (type);                                                                +
 
 CREATE INDEX idx_documents_type_date ON public.documents USING btree (type, document_date);                                            +
 
 CREATE INDEX idx_documents_user_id ON public.documents USING btree (user_id);                                                          +
 
 CREATE INDEX idx_documents_user_type ON public.documents USING btree (user_id, type);                                                  +
 
 CREATE UNIQUE INDEX expenses_receipt_number_key ON public.expenses USING btree (receipt_number);                                       +
 
 CREATE INDEX idx_expenses_bank_transaction ON public.expenses USING btree (bank_transaction_id);                                       +
 
 CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);                                                          +
 
 CREATE INDEX idx_expenses_org_date ON public.expenses USING btree (organization_id, payment_date DESC);                                +
 
 CREATE INDEX idx_expenses_payment_date ON public.expenses USING btree (payment_date);                                                  +
 
 CREATE INDEX idx_expenses_receipt_number ON public.expenses USING btree (receipt_number);                                              +
 
 CREATE INDEX idx_expenses_supplier_id ON public.expenses USING btree (supplier_id);                                                    +
 
 CREATE INDEX idx_expenses_user_id ON public.expenses USING btree (user_id);                                                            +
 
 CREATE INDEX idx_items_org_active ON public.items USING btree (organization_id, active);                                               +
 
 CREATE INDEX idx_monthly_summaries_created_by ON public.monthly_summaries USING btree (created_by);                                    +
 
 CREATE INDEX idx_monthly_summaries_year_month ON public.monthly_summaries USING btree (year, month);                                   +
 
 CREATE UNIQUE INDEX monthly_summaries_year_month_key ON public.monthly_summaries USING btree (year, month);                            +
 
 CREATE UNIQUE INDEX organization_users_organization_id_user_id_key ON public.organization_users USING btree (organization_id, user_id);+
 
 CREATE UNIQUE INDEX organizations_slug_key ON public.organizations USING btree (slug);                                                 +
 
 CREATE INDEX idx_owner_transactions_banking_status ON public.owner_transactions USING btree (banking_status);                          +
 
 CREATE INDEX idx_owner_transactions_date ON public.owner_transactions USING btree (transaction_date);                                  +
 
 CREATE INDEX idx_owner_transactions_payment_method ON public.owner_transactions USING btree (payment_method);                          +
 
 CREATE INDEX idx_owner_transactions_related_expense ON public.owner_transactions USING btree (related_expense_id);                     +
 
 CREATE INDEX idx_owner_transactions_type ON public.owner_transactions USING btree (transaction_type);                                  +
 
 CREATE INDEX idx_owner_transactions_user_id ON public.owner_transactions USING btree (user_id);                                        +
 
 CREATE INDEX idx_provider_reports_import_date ON public.provider_reports USING btree (import_date);                                    +
 
 CREATE INDEX idx_provider_reports_provider_status ON public.provider_reports USING btree (provider, status);                           +
 
 CREATE INDEX idx_provider_reports_sale_id ON public.provider_reports USING btree (sale_id);                                            +
 
 CREATE INDEX idx_provider_reports_transaction_date ON public.provider_reports USING btree (transaction_date);                          +
 
 CREATE INDEX idx_sales_bank_transaction ON public.sales USING btree (bank_transaction_id);                                             +
 
 CREATE INDEX idx_sales_banking_status ON public.sales USING btree (banking_status);                                                    +
 
 CREATE INDEX idx_sales_created_at ON public.sales USING btree (created_at);                                                            +
 
 CREATE INDEX idx_sales_org_created ON public.sales USING btree (organization_id, created_at DESC);                                     +
 
 CREATE INDEX idx_sales_payment_method ON public.sales USING btree (payment_method);                                                    +
 
 CREATE INDEX idx_sales_provider_report ON public.sales USING btree (provider_report_id);                                               +
 
 CREATE INDEX idx_sales_receipt_number ON public.sales USING btree (receipt_number);                                                    +
 
 CREATE INDEX idx_sales_user_id ON public.sales USING btree (user_id);                                                                  +
 
 CREATE UNIQUE INDEX sales_receipt_number_key ON public.sales USING btree (receipt_number);                                             +
 
 CREATE INDEX idx_suppliers_active ON public.suppliers USING btree (is_active);                                                         +
 
 CREATE INDEX idx_suppliers_category ON public.suppliers USING btree (category);                                                        +
 
 CREATE INDEX idx_suppliers_created_at ON public.suppliers USING btree (created_at);                                                    +
 
 CREATE INDEX idx_suppliers_name_fts ON public.suppliers USING gin (to_tsvector('german'::regconfig, (name)::text));                    +
 
 CREATE INDEX idx_suppliers_normalized_name ON public.suppliers USING btree (normalized_name);                                          +
 
 CREATE UNIQUE INDEX suppliers_normalized_name_key ON public.suppliers USING btree (normalized_name);                                   +
 
 CREATE INDEX idx_transaction_matches_bank_transaction ON public.transaction_matches USING btree (bank_transaction_id);                 +
 
 CREATE INDEX idx_transaction_matches_confidence ON public.transaction_matches USING btree (match_confidence);                          +
 
 CREATE INDEX idx_transaction_matches_matched_type_id ON public.transaction_matches USING btree (matched_type, matched_id);             +
 
 CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);                                                               +
 
 CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);                                                         +
 


-- RLS POLICIES
 ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;                                                                                                               +
 CREATE POLICY audit_log_insert_policy ON audit_log FOR INSERT TO authenticated WITH CHECK (true);                                                              +
 
 ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;                                                                                                               +
 CREATE POLICY audit_log_select_policy ON audit_log FOR SELECT TO authenticated USING (true) ;                                                                  +
 
 ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;                                                                                                           +
 CREATE POLICY bank_accounts_access ON bank_accounts FOR ALL TO public USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid()))) ;             +
 
 ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;                                                                                                       +
 CREATE POLICY bank_transactions_access ON bank_transactions FOR ALL TO public USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid()))) ;     +
 
 ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;                                                                                                       +
 CREATE POLICY Enable all access for service role ON business_settings FOR ALL TO service_role USING (true) ;                                                   +
 
 ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;                                                                                                       +
 CREATE POLICY business_settings_org_access ON business_settings FOR ALL TO authenticated USING ((organization_id IN ( SELECT organization_users.organization_id+
    FROM organization_users                                                                                                                                     +
   WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true))))) ;                                                                +
 
 ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;                                                                                                          +
 CREATE POLICY cash_movements_access ON cash_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);                                                 +
 
 ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;                                                                                                         +
 CREATE POLICY daily_summaries_business_access ON daily_summaries FOR ALL TO authenticated USING (true) WITH CHECK (true);                                      +
 
 ALTER TABLE document_sequences ENABLE ROW LEVEL SECURITY;                                                                                                      +
 CREATE POLICY document_sequences_access ON document_sequences FOR ALL TO authenticated USING (true) WITH CHECK (true);                                         +
 
 ALTER TABLE documents ENABLE ROW LEVEL SECURITY;                                                                                                               +
 CREATE POLICY documents_access ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);                                                           +
 
 ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;                                                                                                                +
 CREATE POLICY expenses_org_access ON expenses FOR ALL TO authenticated USING ((organization_id IN ( SELECT organization_users.organization_id                  +
    FROM organization_users                                                                                                                                     +
   WHERE ((organization_users.user_id = auth.uid()) AND (organization_users.active = true))))) ;                                                                +
 
 ALTER TABLE items ENABLE ROW LEVEL SECURITY;                                                                                                                   +
 CREATE POLICY items_business_access ON items FOR ALL TO authenticated USING (true) WITH CHECK (true);                                                          +
 
 ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;                                                                                                       +
 CREATE POLICY monthly_summaries_business_access ON monthly_summaries FOR ALL TO authenticated USING (true) WITH CHECK (true);                                  +
 
 ALTER TABLE owner_transactions ENABLE ROW LEVEL SECURITY;                                                                                                      +
 CREATE POLICY owner_transactions_access ON owner_transactions FOR ALL TO public USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid()))) ;   +
 
 ALTER TABLE provider_import_sessions ENABLE ROW LEVEL SECURITY;                                                                                                +
 CREATE POLICY provider_sessions_insert ON provider_import_sessions FOR INSERT TO public WITH CHECK ((auth.uid() = imported_by));                               +
 
 ALTER TABLE provider_import_sessions ENABLE ROW LEVEL SECURITY;                                                                                                +
 CREATE POLICY provider_sessions_select ON provider_import_sessions FOR SELECT TO public USING ((auth.uid() = imported_by)) ;                                   +
 
 ALTER TABLE provider_import_sessions ENABLE ROW LEVEL SECURITY;                                                                                                +
 CREATE POLICY provider_sessions_update ON provider_import_sessions FOR UPDATE TO public USING ((auth.uid() = imported_by)) ;                                   +
 
 ALTER TABLE provider_reports ENABLE ROW LEVEL SECURITY;                                                                                                        +
 CREATE POLICY provider_reports_access ON provider_reports FOR ALL TO public USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid()))) ;       +
 
 ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;                                                                                                              +
 CREATE POLICY sale_items_access ON sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);                                                         +
 
 ALTER TABLE sales ENABLE ROW LEVEL SECURITY;                                                                                                                   +
 CREATE POLICY sales_org_access ON sales FOR ALL TO authenticated USING (true) WITH CHECK (true);                                                               +
 
 ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;                                                                                                               +
 CREATE POLICY suppliers_access ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);                                                           +
 
 ALTER TABLE transaction_matches ENABLE ROW LEVEL SECURITY;                                                                                                     +
 CREATE POLICY transaction_matches_access ON transaction_matches FOR ALL TO public USING (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1         +
    FROM bank_transactions bt                                                                                                                                   +
   WHERE ((bt.id = transaction_matches.bank_transaction_id) AND (bt.user_id = auth.uid())))))) ;                                                                +
 
 ALTER TABLE users ENABLE ROW LEVEL SECURITY;                                                                                                                   +
 CREATE POLICY users_select_own ON users FOR SELECT TO public USING ((auth.uid() = id)) ;                                                                       +
 
 ALTER TABLE users ENABLE ROW LEVEL SECURITY;                                                                                                                   +
 CREATE POLICY users_update_own ON users FOR UPDATE TO public USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));                                         +
 


-- ESSENTIAL SEED DATA
