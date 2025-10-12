-- Create Suppliers Master Table
-- Provides normalized supplier data for consistent analytics

-- Supplier Category Enum
CREATE TYPE supplier_category AS ENUM (
  'beauty_supplies',    -- Haarprodukte, Kosmetik
  'equipment',          -- Geräte, Möbel  
  'utilities',          -- Strom, Wasser, Internet
  'rent',              -- Miete, Nebenkosten
  'insurance',         -- Versicherungen
  'professional_services', -- Steuerberater, Anwalt
  'retail',            -- Coop, Migros für Büromaterial
  'online_marketplace', -- AliExpress, Amazon
  'real_estate',       -- Immobilienfirmen
  'other'              -- Sonstiges
);

-- Suppliers Master Table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,                    -- Display name: "NewFlag AG"
  normalized_name VARCHAR(255) NOT NULL UNIQUE,  -- Search key: "newflag"
  category supplier_category DEFAULT 'other',
  
  -- Contact Information
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  website VARCHAR(255),
  
  -- Address (optional)
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  postal_code VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(2) DEFAULT 'CH',
  
  -- Financial Information
  iban VARCHAR(34),                             -- For direct payments
  vat_number VARCHAR(50),                       -- Swiss UID
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_suppliers_normalized_name ON suppliers(normalized_name);
CREATE INDEX idx_suppliers_category ON suppliers(category);
CREATE INDEX idx_suppliers_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_created_at ON suppliers(created_at);

-- Full-text search for supplier names
CREATE INDEX idx_suppliers_name_fts ON suppliers USING gin(to_tsvector('german', name));

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_suppliers_updated_at();

-- Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_access" ON suppliers
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE suppliers IS 'Master table for supplier normalization and analytics';
COMMENT ON COLUMN suppliers.normalized_name IS 'Lowercase, trimmed name for matching and deduplication';
COMMENT ON COLUMN suppliers.category IS 'Business category for expense analytics';
COMMENT ON COLUMN suppliers.vat_number IS 'Swiss UID number for tax purposes';