-- ============================================================================
-- Migration 14: Document Sequences for Receipt Numbers
-- Erstellt fortlaufende Belegnummern-System zusätzlich zu UUIDs
-- ============================================================================

-- Document sequences table for managing receipt numbers
CREATE TABLE document_sequences (
    type VARCHAR(20) PRIMARY KEY,
    current_number INTEGER NOT NULL DEFAULT 0,
    prefix VARCHAR(10) NOT NULL,
    format VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial sequence configurations
INSERT INTO document_sequences (type, current_number, prefix, format) VALUES 
('sale_receipt', 0, 'VK', 'VK{YYYY}{number:06d}'),
('expense_receipt', 0, 'AG', 'AG{YYYY}{number:06d}'),
('daily_report', 0, 'TB', 'TB{YYYY}{number:04d}'),
('monthly_report', 0, 'MB', 'MB{YYYY}{number:03d}'),
('bank_transaction', 0, 'BT', 'BT{YYYY}{number:06d}'),
('cash_movement', 0, 'CM', 'CM{YYYY}{number:06d}');

-- Function to generate sequential document numbers
CREATE OR REPLACE FUNCTION generate_document_number(doc_type TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Function to reset sequence for new year (optional utility)
CREATE OR REPLACE FUNCTION reset_sequence_for_year(doc_type TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE document_sequences 
    SET current_number = 0,
        updated_at = NOW()
    WHERE type = doc_type;
END;
$$ LANGUAGE plpgsql;

-- Create index for performance
CREATE INDEX idx_document_sequences_type ON document_sequences(type);

-- Add RLS policy for document_sequences
ALTER TABLE document_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_sequences_access"
ON document_sequences
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON document_sequences TO authenticated;
GRANT EXECUTE ON FUNCTION generate_document_number(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_sequence_for_year(TEXT) TO authenticated;