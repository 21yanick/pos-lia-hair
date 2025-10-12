-- ============================================================================
-- TRANSACTIONS: Bank Transactions, Expenses, Sales, Summaries, Documents
-- ============================================================================
-- Depends on: bank_accounts, suppliers, organizations, users

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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: bank_transactions unique_bank_reference_per_account; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT unique_bank_reference_per_account UNIQUE (bank_account_id, reference);


--
-- Name: CONSTRAINT unique_bank_reference_per_account ON bank_transactions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT unique_bank_reference_per_account ON public.bank_transactions IS 'Prevents importing same bank transaction twice per account';


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
-- Name: bank_transactions trigger_auto_bank_transaction_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_bank_transaction_number BEFORE INSERT ON public.bank_transactions FOR EACH ROW EXECUTE FUNCTION public.auto_generate_bank_transaction_number();


--
-- Name: bank_transactions trigger_update_bank_balance; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_bank_balance AFTER INSERT OR DELETE OR UPDATE ON public.bank_transactions FOR EACH ROW EXECUTE FUNCTION public.update_bank_account_balance();


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
-- Name: bank_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: bank_transactions bank_transactions_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bank_transactions_access ON public.bank_transactions USING (((auth.role() = 'authenticated'::text) AND (user_id = auth.uid())));


--
-- PostgreSQL database dump complete
--


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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: expenses audit_expenses_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_expenses_changes AFTER INSERT OR DELETE OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

ALTER TABLE public.expenses DISABLE TRIGGER audit_expenses_changes;


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
-- PostgreSQL database dump complete
--


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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: sales audit_sales_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_sales_changes AFTER INSERT OR DELETE OR UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

ALTER TABLE public.sales DISABLE TRIGGER audit_sales_changes;


--
-- Name: sales trigger_auto_sales_receipt_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_sales_receipt_number BEFORE INSERT ON public.sales FOR EACH ROW EXECUTE FUNCTION public.auto_generate_sales_receipt_number();


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
-- Name: sales; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

--
-- Name: sales sales_org_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sales_org_access ON public.sales TO authenticated USING (true) WITH CHECK (true);


--
-- PostgreSQL database dump complete
--


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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: documents trigger_auto_document_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_document_number BEFORE INSERT ON public.documents FOR EACH ROW EXECUTE FUNCTION public.auto_generate_document_number();


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
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: documents documents_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY documents_access ON public.documents TO authenticated USING (true) WITH CHECK (true);


--
-- PostgreSQL database dump complete
--


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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: idx_daily_summaries_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_summaries_created_by ON public.daily_summaries USING btree (created_by);


--
-- Name: idx_daily_summaries_report_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_summaries_report_date ON public.daily_summaries USING btree (report_date);


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
-- Name: daily_summaries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_summaries daily_summaries_business_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY daily_summaries_business_access ON public.daily_summaries TO authenticated USING (true) WITH CHECK (true);


--
-- PostgreSQL database dump complete
--


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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: idx_monthly_summaries_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_monthly_summaries_created_by ON public.monthly_summaries USING btree (created_by);


--
-- Name: idx_monthly_summaries_year_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_monthly_summaries_year_month ON public.monthly_summaries USING btree (year, month);


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
-- Name: monthly_summaries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

--
-- Name: monthly_summaries monthly_summaries_business_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY monthly_summaries_business_access ON public.monthly_summaries TO authenticated USING (true) WITH CHECK (true);


--
-- PostgreSQL database dump complete
--


