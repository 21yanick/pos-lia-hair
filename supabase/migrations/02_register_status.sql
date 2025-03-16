-- Migration für die Kassenstatus-Verwaltung

-- Tabelle für den Kassenstatus (Öffnen/Schließen)
CREATE TABLE register_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed')),
    starting_amount DECIMAL(10,2) NOT NULL,
    ending_amount DECIMAL(10,2),
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnellen Zugriff nach Datum
CREATE INDEX register_status_date_idx ON register_status(date);

-- RLS (Row Level Security) für die Tabelle
ALTER TABLE register_status ENABLE ROW LEVEL SECURITY;

-- Policy für Lesezugriff
CREATE POLICY "Kassenstatus ist für authentifizierte Benutzer lesbar" 
ON register_status FOR SELECT
TO authenticated
USING (true);

-- Policy für Schreibzugriff
CREATE POLICY "Nur autorisierte Benutzer können Kassenstatus ändern" 
ON register_status FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND (users.role = 'admin' OR users.role = 'staff')
));

-- Policy für Aktualisierungen
CREATE POLICY "Nur autorisierte Benutzer können Kassenstatus aktualisieren" 
ON register_status FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND (users.role = 'admin' OR users.role = 'staff')
));

-- Funktion, die prüft, ob die Kasse bereits an einem bestimmten Tag geöffnet wurde
CREATE OR REPLACE FUNCTION is_register_open_for_date(check_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
    is_open BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM register_status 
        WHERE date = check_date 
        AND status = 'open'
    ) INTO is_open;
    
    RETURN is_open;
END;
$$ LANGUAGE plpgsql;