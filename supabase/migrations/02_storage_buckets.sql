-- Storage-Buckets für Dokumentenspeicherung

-- Prüfe ob der Bucket bereits existiert
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'documents'
    ) THEN
        -- Bucket für Dokumente erstellen
        INSERT INTO storage.buckets (id, name, public, avif_autodetection)
        VALUES ('documents', 'documents', TRUE, FALSE);
        
        -- Unterordner für verschiedene Dokumenttypen erstellen
        -- Diese werden automatisch erstellt, wenn der erste Upload erfolgt

        -- RLS-Policies für Storage-Buckets
        -- Jeder kann lesen, nur angemeldete Benutzer können schreiben
        EXECUTE format('
            CREATE POLICY "Alle können Dokumente sehen 1rp84hlo"
              ON storage.objects FOR SELECT
              USING (bucket_id = ''documents'');
        ');

        EXECUTE format('
            CREATE POLICY "Angemeldete können Dokumente hochladen 1f8v84js"
              ON storage.objects FOR INSERT
              WITH CHECK (bucket_id = ''documents'' AND auth.role() = ''authenticated'');
        ');

        EXECUTE format('
            CREATE POLICY "Besitzer können eigene Dokumente löschen 1c8f94ml"
              ON storage.objects FOR DELETE
              USING (bucket_id = ''documents'' AND auth.uid() = owner);
        ');
        
        RAISE NOTICE 'Storage Bucket "documents" wurde erstellt.';
    ELSE
        RAISE NOTICE 'Storage Bucket "documents" existiert bereits.';
    END IF;
END
$$;