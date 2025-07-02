-- Add customer fields to unified_transactions_view
-- This extends the view to include customer information for sales transactions

-- Drop existing view
DROP VIEW IF EXISTS unified_transactions_view;

-- Recreate view with customer fields
CREATE VIEW unified_transactions_view AS
WITH transaction_base AS (
    -- SALES with customer information
    SELECT 
        s.id,
        'sale'::text AS transaction_type,
        'VK'::text AS type_code,
        s.receipt_number,
        s.created_at AS transaction_date,
        s.total_amount AS amount,
        s.payment_method,
        s.status,
        s.user_id,
        s.organization_id,
        COALESCE(
            (SELECT string_agg(i.name, ', ') 
             FROM sale_items si 
             JOIN items i ON si.item_id = i.id 
             WHERE si.sale_id = s.id),
            'Verkauf'
        ) AS description,
        d.id AS document_id,
        CASE WHEN d.id IS NOT NULL THEN true ELSE false END AS has_pdf,
        s.banking_status,
        pr.fees AS provider_fee,
        pr.net_amount,
        s.provider_report_id,
        CASE WHEN s.provider_report_id IS NOT NULL THEN true ELSE false END AS has_real_provider_fees,
        -- NEW: Customer fields for sales
        s.customer_id,
        s.customer_name
    FROM sales s
    LEFT JOIN documents d ON d.reference_id = s.id AND d.type = 'receipt'
    LEFT JOIN provider_reports pr ON s.provider_report_id = pr.id

    UNION ALL

    -- EXPENSES (no customers)
    SELECT 
        e.id,
        'expense'::text AS transaction_type,
        'AG'::text AS type_code,
        e.receipt_number,
        e.created_at AS transaction_date,
        -e.amount AS amount,
        e.payment_method,
        'completed'::text AS status,
        e.user_id,
        e.organization_id,
        e.description,
        d.id AS document_id,
        CASE WHEN d.id IS NOT NULL THEN true ELSE false END AS has_pdf,
        e.banking_status,
        NULL::numeric AS provider_fee,
        NULL::numeric AS net_amount,
        NULL::uuid AS provider_report_id,
        false AS has_real_provider_fees,
        -- Customer fields NULL for expenses
        NULL::uuid AS customer_id,
        NULL::varchar(255) AS customer_name
    FROM expenses e
    LEFT JOIN documents d ON d.reference_id = e.id AND d.type = 'expense_receipt'

    UNION ALL

    -- CASH MOVEMENTS (no customers)
    SELECT 
        cm.id,
        'cash_movement'::text AS transaction_type,
        'CM'::text AS type_code,
        cm.movement_number AS receipt_number,
        cm.created_at AS transaction_date,
        CASE WHEN cm.type = 'cash_in' THEN cm.amount ELSE -cm.amount END AS amount,
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
        -- Customer fields NULL for cash movements
        NULL::uuid AS customer_id,
        NULL::varchar(255) AS customer_name
    FROM cash_movements cm

    UNION ALL

    -- BANK TRANSACTIONS (no customers)
    SELECT 
        bt.id,
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
        -- Customer fields NULL for bank transactions
        NULL::uuid AS customer_id,
        NULL::varchar(255) AS customer_name
    FROM bank_transactions bt
)
SELECT 
    tb.id,
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
    DATE(tb.transaction_date) AS date_only,
    TO_CHAR(tb.transaction_date, 'HH24:MI') AS time_only,
    LOWER(tb.description) AS description_lower,
    LOWER(tb.receipt_number::text) AS receipt_number_lower,
    tb.provider_fee,
    tb.net_amount,
    tb.provider_report_id,
    tb.has_real_provider_fees,
    -- NEW: Customer fields in final output
    tb.customer_id,
    tb.customer_name
FROM transaction_base tb
ORDER BY tb.transaction_date DESC;