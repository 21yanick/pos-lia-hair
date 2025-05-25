-- Fix Storage Policies für documents bucket

-- Lösche alte Policies
DROP POLICY IF EXISTS "Alle können Dokumente sehen 1rp84hlo" ON storage.objects;
DROP POLICY IF EXISTS "Angemeldete können Dokumente hochladen 1f8v84js" ON storage.objects;
DROP POLICY IF EXISTS "Besitzer können eigene Dokumente löschen 1c8f94ml" ON storage.objects;

-- Erstelle neue, korrekte Policies
CREATE POLICY "documents_select_policy" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "documents_insert_policy" ON storage.objects  
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents' AND auth.uid() = owner);

CREATE POLICY "documents_update_policy" ON storage.objects
  FOR UPDATE  
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'documents' AND auth.uid() = owner);

CREATE POLICY "documents_delete_policy" ON storage.objects
  FOR DELETE
  TO authenticated  
  USING (bucket_id = 'documents' AND auth.uid() = owner);

-- Zeige neue Policies
SELECT 'Neue Storage Policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE 'documents_%';