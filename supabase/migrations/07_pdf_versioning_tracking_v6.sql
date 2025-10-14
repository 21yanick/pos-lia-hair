-- =====================================================
-- 07_pdf_versioning_tracking_v6.sql
-- =====================================================
-- PDF Versioning & Audit Trail Support
-- Minimal schema extension for tracking document replacements
-- Dependencies: 03_banking_and_compliance_v6.sql (documents table)
-- =====================================================

-- Add tracking columns to existing documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS
  replaced_by uuid REFERENCES public.documents(id);

ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS
  replacement_reason text
  CHECK (replacement_reason IN ('customer_changed', 'correction', 'data_fix'));

-- Index for performance (only active/current PDFs)
-- Active documents have replacement_reason IS NULL (not yet replaced)
CREATE INDEX IF NOT EXISTS idx_documents_active_receipts
  ON public.documents(reference_id, type, organization_id)
  WHERE replacement_reason IS NULL;

-- Comments for documentation
COMMENT ON COLUMN public.documents.replaced_by
  IS 'Links to newer version of this document (audit trail chain)';

COMMENT ON COLUMN public.documents.replacement_reason
  IS 'Why was this document replaced: customer_changed, correction, data_fix';

-- =====================================================
-- END OF 07_pdf_versioning_tracking_v6.sql
-- =====================================================
-- AUDIT TRAIL: Minimal overhead, maximum traceability
-- No breaking changes to existing documents
-- =====================================================
