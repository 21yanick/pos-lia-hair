-- Fix audit trigger for consistent schema
-- Now that all financial tables have user_id, the trigger can be simplified

CREATE OR REPLACE FUNCTION public.log_financial_changes()
RETURNS trigger
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
            user_id,           -- ✅ NOW CONSISTENT: All financial tables have user_id
            ip_address
        ) VALUES (
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            TG_OP,
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
            COALESCE(NEW.user_id, OLD.user_id),   -- ✅ FIXED: sale_items now has user_id
            inet_client_addr()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Verify all financial tables have user_id column
SELECT 
    table_name,
    CASE 
        WHEN column_name = 'user_id' THEN '✅ HAS user_id'
        ELSE '❌ MISSING user_id'
    END as status
FROM information_schema.columns 
WHERE table_name IN ('sales', 'sale_items', 'expenses', 'cash_movements') 
AND table_schema = 'public'
AND column_name = 'user_id'
ORDER BY table_name;