-- Create business-logos storage bucket and policies

-- Create the bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('business-logos', 'business-logos', true);

-- Create storage policy for organization-based access
CREATE POLICY "Users manage organization logos" ON storage.objects 
FOR ALL USING (
    bucket_id = 'business-logos' 
    AND (storage.foldername(name))[1] IN (
        SELECT organization_id::text 
        FROM organization_users 
        WHERE user_id = auth.uid() 
        AND active = true
    )
);

-- Verify bucket was created
SELECT id, name, public FROM storage.buckets WHERE id = 'business-logos';