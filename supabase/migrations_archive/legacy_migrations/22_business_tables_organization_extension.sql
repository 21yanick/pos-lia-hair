-- Multi-Tenant Foundation: Extend Business Tables with Organization ID
-- Part 2: Add organization_id to all business tables

-- 1. Add organization_id to core business tables
ALTER TABLE sales ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE expenses ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE items ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE cash_movements ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE documents ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 2. Add organization_id to banking tables
ALTER TABLE bank_accounts ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE bank_transactions ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE provider_reports ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 3. Add organization_id to summary tables
ALTER TABLE daily_summaries ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE monthly_summaries ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 4. Add organization_id to business_settings (special case - will be unique per org)
ALTER TABLE business_settings ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 5. Add organization_id to import/session tables
ALTER TABLE bank_import_sessions ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE provider_import_sessions ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 6. Add organization_id to owner_transactions
ALTER TABLE owner_transactions ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 7. Add organization_id to suppliers (shared resources per organization)
ALTER TABLE suppliers ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 8. Add organization_id to sale_items (child of sales)
ALTER TABLE sale_items ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 9. Add organization_id to transaction_matches (banking reconciliation)
ALTER TABLE transaction_matches ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 10. Create composite indexes for organization-scoped queries
-- Sales indexes
CREATE INDEX idx_sales_org_created ON sales(organization_id, created_at DESC);
CREATE INDEX idx_sales_org_status ON sales(organization_id, status);
CREATE INDEX idx_sales_org_payment ON sales(organization_id, payment_method);

-- Expenses indexes  
CREATE INDEX idx_expenses_org_date ON expenses(organization_id, payment_date DESC);
CREATE INDEX idx_expenses_org_category ON expenses(organization_id, category);

-- Items indexes
CREATE INDEX idx_items_org_active ON items(organization_id, active);

-- Cash movements indexes
CREATE INDEX idx_cash_movements_org_date ON cash_movements(organization_id, created_at DESC);
CREATE INDEX idx_cash_movements_org_type ON cash_movements(organization_id, type);

-- Banking indexes
CREATE INDEX idx_bank_accounts_org_active ON bank_accounts(organization_id, is_active);
CREATE INDEX idx_bank_transactions_org_date ON bank_transactions(organization_id, value_date DESC);
CREATE INDEX idx_bank_transactions_org_status ON bank_transactions(organization_id, status);

-- Documents indexes
CREATE INDEX idx_documents_org_type ON documents(organization_id, type);
CREATE INDEX idx_documents_org_date ON documents(organization_id, created_at DESC);

-- Summary indexes
CREATE INDEX idx_daily_summaries_org_date ON daily_summaries(organization_id, date DESC);
CREATE INDEX idx_monthly_summaries_org_date ON monthly_summaries(organization_id, year DESC, month DESC);

-- Suppliers indexes
CREATE INDEX idx_suppliers_org_name ON suppliers(organization_id, name);

-- Comments for documentation
COMMENT ON COLUMN sales.organization_id IS 'Organization this sale belongs to';
COMMENT ON COLUMN expenses.organization_id IS 'Organization this expense belongs to';
COMMENT ON COLUMN items.organization_id IS 'Organization this item belongs to';
COMMENT ON COLUMN business_settings.organization_id IS 'Organization these settings belong to (unique per org)';
COMMENT ON COLUMN suppliers.organization_id IS 'Organization this supplier belongs to';