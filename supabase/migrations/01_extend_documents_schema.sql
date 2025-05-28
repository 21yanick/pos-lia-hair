-- Migration: Extend documents table for import system and central documents page
-- Created: 2025-05-28
-- Purpose: Add missing columns that import system expects + better metadata

-- Add missing columns for import system
ALTER TABLE documents ADD COLUMN file_name TEXT;
ALTER TABLE documents ADD COLUMN file_size INTEGER;
ALTER TABLE documents ADD COLUMN mime_type TEXT DEFAULT 'application/pdf';
ALTER TABLE documents ADD COLUMN reference_type TEXT CHECK (reference_type IN ('sale', 'expense', 'report'));
ALTER TABLE documents ADD COLUMN notes TEXT;

-- Update existing documents to have proper values
UPDATE documents SET 
  file_name = split_part(file_path, '/', -1),
  mime_type = 'application/pdf',
  reference_type = CASE 
    WHEN type = 'receipt' THEN 'sale'
    WHEN type = 'expense_receipt' THEN 'expense'
    WHEN type IN ('daily_report', 'monthly_report', 'yearly_report') THEN 'report'
    ELSE 'report'
  END,
  file_size = 15420  -- Default PDF size ~15KB for existing documents
WHERE file_name IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_reference_type_id ON documents(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_documents_type_date ON documents(type, document_date);
CREATE INDEX IF NOT EXISTS idx_documents_user_type ON documents(user_id, type);

-- Comment the table for documentation
COMMENT ON COLUMN documents.file_name IS 'Original filename for display purposes';
COMMENT ON COLUMN documents.file_size IS 'File size in bytes for UI display';
COMMENT ON COLUMN documents.mime_type IS 'MIME type for proper file handling';
COMMENT ON COLUMN documents.reference_type IS 'Type of referenced entity (sale/expense/report)';
COMMENT ON COLUMN documents.notes IS 'Additional notes, especially for import-generated documents';