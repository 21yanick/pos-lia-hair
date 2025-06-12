-- Migration: Net Revenue Calculation Function for Provider Fees
-- This function calculates correct net revenue by subtracting provider fees from TWINT/SumUp sales
-- Addresses critical accounting issue where provider fees were not deducted from profit calculations

-- Function to calculate net revenue for a given period, accounting for provider fees
CREATE OR REPLACE FUNCTION get_net_revenue_for_period(start_date DATE, end_date DATE)
RETURNS DECIMAL(10,2) 
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

-- Function to get detailed revenue breakdown (gross, fees, net) for a period
CREATE OR REPLACE FUNCTION get_revenue_breakdown_for_period(start_date DATE, end_date DATE)
RETURNS TABLE(
    gross_revenue DECIMAL(10,2),
    total_fees DECIMAL(10,2),
    net_revenue DECIMAL(10,2),
    cash_revenue DECIMAL(10,2),
    provider_revenue DECIMAL(10,2)
)
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

-- Function to calculate net profit for a period (net revenue minus expenses)
CREATE OR REPLACE FUNCTION get_net_profit_for_period(start_date DATE, end_date DATE)
RETURNS DECIMAL(10,2)
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