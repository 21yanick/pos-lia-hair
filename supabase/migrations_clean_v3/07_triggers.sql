-- ============================================================================
-- TRIGGERS: Automated triggers (depend on functions)
-- ============================================================================

CREATE TRIGGER on_auth_user_created AFTER INSERT OR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_deleted BEFORE DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

CREATE TRIGGER audit_cash_movements_changes AFTER INSERT OR DELETE OR UPDATE ON public.cash_movements FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

CREATE TRIGGER audit_expenses_changes AFTER INSERT OR DELETE OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

CREATE TRIGGER audit_sale_items_changes AFTER INSERT OR DELETE OR UPDATE ON public.sale_items FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

CREATE TRIGGER audit_sales_changes AFTER INSERT OR DELETE OR UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

CREATE TRIGGER trigger_auto_bank_transaction_number BEFORE INSERT ON public.bank_transactions FOR EACH ROW EXECUTE FUNCTION public.auto_generate_bank_transaction_number();

CREATE TRIGGER trigger_auto_cash_movement_number BEFORE INSERT ON public.cash_movements FOR EACH ROW EXECUTE FUNCTION public.auto_generate_cash_movement_number();

CREATE TRIGGER trigger_auto_document_number BEFORE INSERT ON public.documents FOR EACH ROW EXECUTE FUNCTION public.auto_generate_document_number();

CREATE TRIGGER trigger_auto_expenses_receipt_number BEFORE INSERT ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.auto_generate_expenses_receipt_number();

CREATE TRIGGER trigger_auto_populate_supplier_id BEFORE INSERT OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.auto_populate_supplier_id();

CREATE TRIGGER trigger_auto_sales_receipt_number BEFORE INSERT ON public.sales FOR EACH ROW EXECUTE FUNCTION public.auto_generate_sales_receipt_number();

CREATE TRIGGER trigger_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_suppliers_updated_at();

CREATE TRIGGER trigger_update_bank_balance AFTER INSERT OR DELETE OR UPDATE ON public.bank_transactions FOR EACH ROW EXECUTE FUNCTION public.update_bank_account_balance();

CREATE TRIGGER trigger_update_owner_transactions_updated_at BEFORE UPDATE ON public.owner_transactions FOR EACH ROW EXECUTE FUNCTION public.update_owner_transactions_updated_at();

CREATE TRIGGER trigger_update_sales_banking_status AFTER UPDATE ON public.provider_reports FOR EACH ROW EXECUTE FUNCTION public.update_sales_banking_status();

CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON public.business_settings FOR EACH ROW EXECUTE FUNCTION public.update_business_settings_updated_at();

