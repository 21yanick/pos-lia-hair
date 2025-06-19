-- Create documents storage bucket for PDF receipts and invoices

-- Create the documents bucket (public for easy access to PDFs)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true);

-- Create storage policy for organization-based document access
CREATE POLICY "Users manage organization documents" ON storage.objects 
FOR ALL USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] IN (
        SELECT organization_id::text 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- Verify bucket was created
SELECT id, name, public FROM storage.buckets WHERE id = 'documents';