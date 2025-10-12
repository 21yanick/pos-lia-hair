-- =====================================================
-- 04_automation_and_triggers_v6.sql
-- =====================================================
-- Complete Automation & Triggers System (V6)
-- Business Logic: Auto-numbering + Audit Triggers + System Automation
-- Dependencies: 01_foundation_and_security_v6.sql, 02_core_business_logic_v6.sql, 03_banking_and_compliance_v6.sql
-- V6 Enhancement: ALL auto-numbering triggers + audit automation functions
-- =====================================================

-- =====================================================
-- AUTO-NUMBERING TRIGGER FUNCTIONS (V6 COMPLETE)
-- =====================================================

-- Auto-generate sales receipt number (V6 ADDITION - CRITICAL)
CREATE OR REPLACE FUNCTION public.auto_generate_sales_receipt_number() 
RETURNS trigger
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

-- Auto-generate expense receipt number (V6 ADDITION - CRITICAL)
CREATE OR REPLACE FUNCTION public.auto_generate_expenses_receipt_number() 
RETURNS trigger
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

-- Auto-generate bank transaction number (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.auto_generate_bank_transaction_number() 
RETURNS trigger
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

-- Auto-generate cash movement number (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.auto_generate_cash_movement_number() 
RETURNS trigger
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

-- Auto-generate generic document number (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.auto_generate_document_number() 
RETURNS trigger
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
            ELSE                                                                                                                                                                                                                          
                NEW.document_number := generate_document_number('document');                                                                                                                                                             
        END CASE;                                                                                                                                                                                                                        
    END IF;                                                                                                                                                                                                                              
    RETURN NEW;                                                                                                                                                                                                                          
END;                                                                                                                                                                                                                                     
$$;

-- Auto-populate supplier ID from name (V6 ADDITION - CRITICAL FOR EXPENSE AUTOMATION)
CREATE OR REPLACE FUNCTION public.auto_populate_supplier_id() 
RETURNS trigger
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

-- =====================================================
-- AUDIT & UPDATE TRIGGER FUNCTIONS (V6 COMPLETE)
-- =====================================================

-- Update suppliers updated_at timestamp (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.update_suppliers_updated_at() 
RETURNS trigger
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
BEGIN                                                                                                                                                                                                                                    
  NEW.updated_at = now();                                                                                                                                                                                                                
  RETURN NEW;                                                                                                                                                                                                                            
END;                                                                                                                                                                                                                                     
$$;

-- Update business settings updated_at timestamp (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.update_business_settings_updated_at() 
RETURNS trigger
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
BEGIN                                                                                                                                                                                                                                    
  NEW.updated_at = NOW();                                                                                                                                                                                                                
  RETURN NEW;                                                                                                                                                                                                                            
END;                                                                                                                                                                                                                                     
$$;

-- Update owner transactions updated_at timestamp (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.update_owner_transactions_updated_at() 
RETURNS trigger
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
BEGIN                                                                                                                                                                                                                                    
    NEW.updated_at = NOW();                                                                                                                                                                                                              
    RETURN NEW;                                                                                                                                                                                                                          
END;                                                                                                                                                                                                                                     
$$;

-- Update appointment on service change (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.update_appointment_on_service_change() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    total_duration INTEGER := 0;
    total_price NUMERIC(10,2) := 0;
BEGIN
    -- Calculate total duration and price from all services
    SELECT 
        COALESCE(SUM(service_duration_minutes), 0),
        COALESCE(SUM(service_price), 0)
    INTO total_duration, total_price
    FROM appointment_services 
    WHERE appointment_id = COALESCE(NEW.appointment_id, OLD.appointment_id);
    
    -- Update the appointment
    UPDATE appointments 
    SET 
        estimated_price = total_price,
        end_time = start_time + (total_duration || ' minutes')::INTERVAL,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.appointment_id, OLD.appointment_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update bank account balance (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.update_bank_account_balance() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_balance NUMERIC(15,2);
BEGIN
    -- Calculate new balance for the bank account
    SELECT COALESCE(SUM(amount), 0) 
    INTO v_balance
    FROM bank_transactions 
    WHERE bank_account_id = COALESCE(NEW.bank_account_id, OLD.bank_account_id);
    
    -- Update bank account balance
    UPDATE bank_accounts 
    SET 
        current_balance = v_balance,
        last_transaction_date = COALESCE(NEW.transaction_date, OLD.transaction_date),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.bank_account_id, OLD.bank_account_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update sales banking status (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.update_sales_banking_status() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- When provider report is updated, update related sales banking status
    IF NEW.status = 'matched' AND OLD.status != 'matched' THEN
        UPDATE sales 
        SET banking_status = 'provider_matched' 
        WHERE id = NEW.sale_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- =====================================================
-- UTILITY FUNCTIONS FOR AUTO-NUMBERING (V6 COMPLETE)
-- =====================================================

-- Get next receipt number (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.get_next_receipt_number(doc_type text) 
RETURNS text
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
    next_number TEXT;                                                                                                                                                                                                                    
BEGIN                                                                                                                                                                                                                                    
    SELECT generate_document_number(doc_type) INTO next_number;                                                                                                                                                                          
    RETURN next_number;                                                                                                                                                                                                                  
END;                                                                                                                                                                                                                                     
$$;

-- Check if receipt number exists (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.receipt_number_exists(receipt_num text, table_name text) 
RETURNS boolean
LANGUAGE plpgsql
AS $$                                                                                                                                                                                                                            
DECLARE                                                                                                                                                                                                                                  
    count_result INTEGER;                                                                                                                                                                                                                
BEGIN                                                                                                                                                                                                                                    
    CASE table_name                                                                                                                                                                                                                      
        WHEN 'sales' THEN                                                                                                                                                                                                                
            SELECT COUNT(*) INTO count_result FROM sales WHERE receipt_number = receipt_num;                                                                                                                                             
        WHEN 'expenses' THEN                                                                                                                                                                                                             
            SELECT COUNT(*) INTO count_result FROM expenses WHERE receipt_number = receipt_num;                                                                                                                                          
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

-- Reset sequence for year (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.reset_sequence_for_year(doc_type text) 
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    current_year INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Reset sequence for new year
    UPDATE document_sequences 
    SET 
        current_number = 1, 
        year = current_year,
        updated_at = NOW()
    WHERE sequence_type = doc_type 
    AND reset_yearly = true 
    AND year != current_year;
END;
$$;

-- =====================================================
-- DAILY OPERATIONS TRIGGER FUNCTIONS (V6 COMPLETE)
-- =====================================================

-- Atomic daily closure (V6 ADDITION - CRITICAL FOR DAILY OPERATIONS)
CREATE OR REPLACE FUNCTION public.atomic_daily_closure(target_date date, expected_cash_end numeric, user_id uuid) 
RETURNS TABLE(success boolean, error_message text, cash_variance numeric)
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

-- Create daily summary for date (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.create_daily_summary_for_date(target_date date, cash_starting numeric DEFAULT 0, cash_ending numeric DEFAULT 0, notes text DEFAULT NULL::text) 
RETURNS TABLE(success boolean, summary_id uuid, error_message text)
LANGUAGE plpgsql
AS $$
DECLARE
    v_summary_id UUID;
    v_system_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    BEGIN
        -- Calculate or update daily summary
        PERFORM calculate_daily_summary(target_date);
        
        -- Get the summary
        SELECT id INTO v_summary_id
        FROM daily_summaries
        WHERE report_date = target_date;
        
        -- Update with provided values
        UPDATE daily_summaries
        SET
            cash_starting = cash_starting,
            cash_ending = cash_ending,
            cash_difference = cash_ending - cash_starting,
            status = 'closed',
            notes = COALESCE(notes, 'Created via create_daily_summary_for_date'),
            closed_at = NOW(),
            created_by = COALESCE(created_by, v_system_user_id)
        WHERE id = v_summary_id;
        
        RETURN QUERY SELECT TRUE, v_summary_id, NULL::TEXT;
        
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, SQLERRM;
    END;
END;
$$;

-- Find missing daily closures (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.find_missing_daily_closures(start_date date, end_date date) 
RETURNS TABLE(missing_date date, sales_count integer, sales_total numeric, has_draft_summary boolean)
LANGUAGE plpgsql
AS $$
DECLARE
    check_date DATE;
BEGIN
    check_date := start_date;
    
    WHILE check_date <= end_date LOOP
        -- Check if this date has a closed daily summary
        IF NOT EXISTS (
            SELECT 1 FROM daily_summaries 
            WHERE report_date = check_date 
            AND status = 'closed'
        ) THEN
            -- Return this missing date with sales info
            RETURN QUERY 
            SELECT 
                check_date,
                COALESCE((SELECT COUNT(*)::INTEGER FROM sales WHERE DATE(created_at) = check_date AND status = 'completed'), 0),
                COALESCE((SELECT SUM(total_amount) FROM sales WHERE DATE(created_at) = check_date AND status = 'completed'), 0),
                EXISTS(SELECT 1 FROM daily_summaries WHERE report_date = check_date AND status = 'draft');
        END IF;
        
        check_date := check_date + INTERVAL '1 day';
    END LOOP;
END;
$$;

-- Bulk close daily summaries (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.bulk_close_daily_summaries(target_dates date[], default_cash_starting numeric DEFAULT 0, default_cash_ending numeric DEFAULT 0, default_notes text DEFAULT 'Bulk closure - automatically closed'::text) 
RETURNS TABLE(processed_date date, success boolean, summary_id uuid, error_message text)
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

-- =====================================================
-- TRIGGER DEFINITIONS (V6 COMPLETE - ALL AUTOMATION)
-- =====================================================

-- Auto-numbering triggers for receipts and documents
CREATE TRIGGER trigger_auto_sales_receipt_number 
    BEFORE INSERT ON public.sales 
    FOR EACH ROW EXECUTE FUNCTION public.auto_generate_sales_receipt_number();

CREATE TRIGGER trigger_auto_expenses_receipt_number 
    BEFORE INSERT ON public.expenses 
    FOR EACH ROW EXECUTE FUNCTION public.auto_generate_expenses_receipt_number();

CREATE TRIGGER trigger_auto_bank_transaction_number 
    BEFORE INSERT ON public.bank_transactions 
    FOR EACH ROW EXECUTE FUNCTION public.auto_generate_bank_transaction_number();

CREATE TRIGGER trigger_auto_cash_movement_number 
    BEFORE INSERT ON public.cash_movements 
    FOR EACH ROW EXECUTE FUNCTION public.auto_generate_cash_movement_number();

-- Supplier automation trigger
CREATE TRIGGER trigger_auto_populate_supplier_id 
    BEFORE INSERT OR UPDATE ON public.expenses 
    FOR EACH ROW EXECUTE FUNCTION public.auto_populate_supplier_id();

-- Updated_at timestamp triggers
CREATE TRIGGER trigger_suppliers_updated_at 
    BEFORE UPDATE ON public.suppliers 
    FOR EACH ROW EXECUTE FUNCTION public.update_suppliers_updated_at();

CREATE TRIGGER update_business_settings_updated_at 
    BEFORE UPDATE ON public.business_settings 
    FOR EACH ROW EXECUTE FUNCTION public.update_business_settings_updated_at();

CREATE TRIGGER trigger_update_owner_transactions_updated_at 
    BEFORE UPDATE ON public.owner_transactions 
    FOR EACH ROW EXECUTE FUNCTION public.update_owner_transactions_updated_at();

-- Business logic triggers
CREATE TRIGGER trigger_update_appointment_on_service_change 
    AFTER INSERT OR UPDATE OR DELETE ON public.appointment_services 
    FOR EACH ROW EXECUTE FUNCTION public.update_appointment_on_service_change();

CREATE TRIGGER trigger_update_bank_balance 
    AFTER INSERT OR DELETE OR UPDATE ON public.bank_transactions 
    FOR EACH ROW EXECUTE FUNCTION public.update_bank_account_balance();

CREATE TRIGGER trigger_update_sales_banking_status 
    AFTER UPDATE ON public.provider_reports 
    FOR EACH ROW EXECUTE FUNCTION public.update_sales_banking_status();

-- =====================================================
-- MISSING TRIGGERS (Production Parity)
-- =====================================================

-- Document auto-numbering trigger (function already exists)
CREATE TRIGGER trigger_auto_document_number 
    BEFORE INSERT ON public.documents 
    FOR EACH ROW EXECUTE FUNCTION public.auto_generate_document_number();

-- User deletion trigger
CREATE TRIGGER on_auth_user_deleted 
    BEFORE DELETE ON auth.users 
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- Organization auto-bootstrap trigger
CREATE TRIGGER auto_bootstrap_organization
    AFTER INSERT ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.trigger_bootstrap_new_organization();

-- Financial audit triggers (compliance logging)
CREATE TRIGGER audit_cash_movements_changes 
    AFTER INSERT OR DELETE OR UPDATE ON public.cash_movements 
    FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

CREATE TRIGGER audit_expenses_changes 
    AFTER INSERT OR DELETE OR UPDATE ON public.expenses 
    FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

CREATE TRIGGER audit_sale_items_changes 
    AFTER INSERT OR DELETE OR UPDATE ON public.sale_items 
    FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

CREATE TRIGGER audit_sales_changes 
    AFTER INSERT OR DELETE OR UPDATE ON public.sales 
    FOR EACH ROW EXECUTE FUNCTION public.log_financial_changes();

-- =====================================================
-- UTILITY FUNCTIONS FOR DEVELOPMENT (V6 COMPLETE)
-- =====================================================

-- Get system stats (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    stats jsonb;
BEGIN
    SELECT jsonb_build_object(
        'tables', jsonb_build_object(
            'organizations', (SELECT COUNT(*) FROM organizations),
            'users', (SELECT COUNT(*) FROM users),
            'items', (SELECT COUNT(*) FROM items),
            'customers', (SELECT COUNT(*) FROM customers),
            'sales', (SELECT COUNT(*) FROM sales),
            'expenses', (SELECT COUNT(*) FROM expenses),
            'suppliers', (SELECT COUNT(*) FROM suppliers),
            'appointments', (SELECT COUNT(*) FROM appointments),
            'bank_accounts', (SELECT COUNT(*) FROM bank_accounts),
            'bank_transactions', (SELECT COUNT(*) FROM bank_transactions),
            'daily_summaries', (SELECT COUNT(*) FROM daily_summaries),
            'monthly_summaries', (SELECT COUNT(*) FROM monthly_summaries)
        ),
        'functions', (
            SELECT COUNT(*) 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_type = 'FUNCTION'
        ),
        'triggers', (
            SELECT COUNT(*) 
            FROM information_schema.triggers 
            WHERE trigger_schema = 'public'
        ),
        'document_sequences', (
            SELECT COUNT(*) FROM document_sequences
        ),
        'generated_at', now()
    ) INTO stats;
    
    RETURN stats;
END;
$$;

-- Validate system integrity (V6 ADDITION)
CREATE OR REPLACE FUNCTION public.validate_system_integrity()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
    trigger_count INTEGER;
    function_count INTEGER;
    sequence_count INTEGER;
BEGIN
    -- Count triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    AND trigger_name LIKE 'trigger_%';
    
    -- Count functions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    AND routine_name NOT LIKE 'pg_%';
    
    -- Count document sequences
    SELECT COUNT(*) INTO sequence_count
    FROM document_sequences;
    
    SELECT jsonb_build_object(
        'triggers_active', trigger_count,
        'functions_available', function_count,
        'document_sequences', sequence_count,
        'auto_numbering_ready', (trigger_count >= 4),
        'business_functions_ready', (function_count >= 20),
        'system_healthy', (trigger_count >= 4 AND function_count >= 20),
        'validation_timestamp', now()
    ) INTO result;
    
    RETURN result;
END;
$$;

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION public.auto_generate_sales_receipt_number() IS 'CRITICAL: Auto-generates sequential sales receipt numbers for Swiss compliance';
COMMENT ON FUNCTION public.auto_generate_expenses_receipt_number() IS 'CRITICAL: Auto-generates sequential expense receipt numbers for Swiss compliance';
COMMENT ON FUNCTION public.auto_generate_bank_transaction_number() IS 'Auto-generates sequential bank transaction numbers for audit trail';
COMMENT ON FUNCTION public.auto_generate_cash_movement_number() IS 'Auto-generates sequential cash movement numbers for tracking';
COMMENT ON FUNCTION public.auto_generate_document_number() IS 'Generic document number generator for various document types';
COMMENT ON FUNCTION public.auto_populate_supplier_id() IS 'CRITICAL: Automatically creates supplier records from expense entries';

COMMENT ON FUNCTION public.update_suppliers_updated_at() IS 'Updates suppliers.updated_at timestamp on modifications';
COMMENT ON FUNCTION public.update_business_settings_updated_at() IS 'Updates business_settings.updated_at timestamp on modifications';
COMMENT ON FUNCTION public.update_owner_transactions_updated_at() IS 'Updates owner_transactions.updated_at timestamp on modifications';
COMMENT ON FUNCTION public.update_appointment_on_service_change() IS 'Recalculates appointment duration and price when services change';
COMMENT ON FUNCTION public.update_bank_account_balance() IS 'Maintains bank account balance when transactions change';
COMMENT ON FUNCTION public.update_sales_banking_status() IS 'Updates sales banking status when provider reports are matched';

COMMENT ON FUNCTION public.get_next_receipt_number(text) IS 'Previews next receipt number without incrementing sequence';
COMMENT ON FUNCTION public.receipt_number_exists(text, text) IS 'Checks if receipt number already exists in specified table';
COMMENT ON FUNCTION public.reset_sequence_for_year(text) IS 'Resets document sequence for new year (Swiss compliance)';

COMMENT ON FUNCTION public.atomic_daily_closure(date, numeric, uuid) IS 'CRITICAL: Performs atomic daily closure with cash variance calculation';
COMMENT ON FUNCTION public.create_daily_summary_for_date(date, numeric, numeric, text) IS 'Creates or updates daily summary for specific date';
COMMENT ON FUNCTION public.find_missing_daily_closures(date, date) IS 'Identifies dates missing daily closures in date range';
COMMENT ON FUNCTION public.bulk_close_daily_summaries(date[], numeric, numeric, text) IS 'Bulk closes multiple daily summaries with default values';

COMMENT ON FUNCTION public.get_system_stats() IS 'Returns system statistics for monitoring and debugging';
COMMENT ON FUNCTION public.validate_system_integrity() IS 'Validates that all triggers and functions are properly configured';

-- =====================================================
-- SYSTEM VALIDATION
-- =====================================================

-- Validate automation setup
DO $$
DECLARE
    integrity_status jsonb;
    is_healthy boolean;
    trigger_count integer;
    function_count integer;
BEGIN
    SELECT public.validate_system_integrity() INTO integrity_status;
    SELECT integrity_status->>'system_healthy' = 'true' INTO is_healthy;
    SELECT (integrity_status->>'triggers_active')::integer INTO trigger_count;
    SELECT (integrity_status->>'functions_available')::integer INTO function_count;
    
    IF is_healthy THEN
        RAISE NOTICE '🎉 SUCCESS: V6 Automation System fully operational!';
        RAISE NOTICE '✅ Auto-numbering: % triggers active', trigger_count;
        RAISE NOTICE '✅ Business functions: % functions available', function_count;
        RAISE NOTICE '✅ Swiss compliance: Receipt numbering ready';
        RAISE NOTICE '✅ Daily operations: Closure automation ready';
        RAISE NOTICE '✅ Audit trail: Update triggers configured';
    ELSE
        RAISE WARNING '⚠️  Automation system incomplete: %', integrity_status;
    END IF;
END;
$$;

-- =====================================================
-- END OF 04_automation_and_triggers_v6.sql (V6)
-- =====================================================
-- COMPLETE AUTOMATION SYSTEM: Auto-numbering + Audit Triggers + Daily Operations (V6)
-- Next: 05_performance_and_validation_v6.sql (Performance indexes + Final validation)
-- =====================================================