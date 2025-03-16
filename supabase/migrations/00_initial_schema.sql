-- Initiales Datenbankschema für POS-LIA-HAIR

-- Benutzer-Tabelle
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Produkte & Dienstleistungen
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    default_price DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('service', 'product')),
    description TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monatsberichte
CREATE TABLE monthly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    cash_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    twint_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    sumup_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('draft', 'closed')),
    notes TEXT,
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (year, month)
);

-- Tagesberichte
CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    cash_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    twint_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    sumup_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    starting_cash DECIMAL(10,2) NOT NULL,
    ending_cash DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'closed')),
    notes TEXT,
    monthly_report_id UUID REFERENCES monthly_reports(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaktionen
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'twint', 'sumup')),
    status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled', 'refunded')),
    notes TEXT,
    daily_report_id UUID REFERENCES daily_reports(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaktionsposten
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    price DECIMAL(10,2) NOT NULL,
    notes TEXT
);

-- Kassenbuch
CREATE TABLE cash_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    daily_report_id UUID REFERENCES daily_reports(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dokumente (muss vor supplier_invoices definiert werden, da es referenziert wird)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('receipt', 'daily_report', 'monthly_report', 'supplier_invoice')),
    reference_id UUID NOT NULL,
    file_path TEXT NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lieferantenrechnungen
CREATE TABLE supplier_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
    payment_date DATE,
    notes TEXT,
    document_id UUID REFERENCES documents(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geschäftseinstellungen
CREATE TABLE business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    address_street TEXT NOT NULL,
    address_city TEXT NOT NULL,
    address_zip TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    receipt_footer_text TEXT,
    show_logo BOOLEAN DEFAULT TRUE,
    additional_info TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row-Level Security (RLS) Richtlinien

-- Für users Tabelle
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benutzer sind für authentifizierte Benutzer lesbar" 
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Nur Admins können Benutzer einfügen" 
ON users FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
));

CREATE POLICY "Nur Admins können Benutzer aktualisieren" 
ON users FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
));

CREATE POLICY "Nur Admins können Benutzer löschen" 
ON users FOR DELETE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
));

-- Für items Tabelle
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produkte sind für authentifizierte Benutzer lesbar" 
ON items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Nur Admins können Produkte einfügen" 
ON items FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
));

CREATE POLICY "Nur Admins können Produkte aktualisieren" 
ON items FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
));

CREATE POLICY "Nur Admins können Produkte löschen" 
ON items FOR DELETE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
));

-- Für transactions Tabelle
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transaktionen sind für authentifizierte Benutzer lesbar" 
ON transactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Nur Staff und Admin können Transaktionen erstellen" 
ON transactions FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND (users.role = 'staff' OR users.role = 'admin')
));

-- Erstelle einen Admin-Benutzer
INSERT INTO users (name, username, email, role)
VALUES ('Admin', 'admin', 'admin@example.com', 'admin');