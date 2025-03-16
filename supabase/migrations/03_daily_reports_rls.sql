-- Migration für die RLS-Richtlinien der Daily Reports Tabelle

-- RLS (Row Level Security) für die daily_reports Tabelle
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Policy für Lesezugriff
CREATE POLICY "Tagesberichte sind für authentifizierte Benutzer lesbar" 
ON daily_reports FOR SELECT
TO authenticated
USING (true);

-- Policy für Schreibzugriff
CREATE POLICY "Nur autorisierte Benutzer können Tagesberichte erstellen" 
ON daily_reports FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND (users.role = 'admin' OR users.role = 'staff')
));

-- Policy für Aktualisierungen
CREATE POLICY "Nur autorisierte Benutzer können Tagesberichte aktualisieren" 
ON daily_reports FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND (users.role = 'admin' OR users.role = 'staff')
));

-- Policy für Löschvorgänge
CREATE POLICY "Nur Admins können Tagesberichte löschen" 
ON daily_reports FOR DELETE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
));