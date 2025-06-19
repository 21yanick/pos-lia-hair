-- ============================================================================
-- FUNCTION-BASED CONSTRAINTS & CIRCULAR FOREIGN KEYS
-- ============================================================================
-- Must run AFTER functions and all tables are created

-- Add validation constraint for expense categories
-- This depends on validate_expense_category() function
ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_category_valid 
CHECK (public.validate_expense_category(category, user_id));

-- Add circular foreign key constraints (sales <-> provider_reports)
-- These must be added after both tables exist
ALTER TABLE public.sales 
ADD CONSTRAINT sales_provider_report_id_fkey 
FOREIGN KEY (provider_report_id) REFERENCES public.provider_reports(id);

ALTER TABLE public.provider_reports 
ADD CONSTRAINT provider_reports_sale_id_fkey 
FOREIGN KEY (sale_id) REFERENCES public.sales(id);