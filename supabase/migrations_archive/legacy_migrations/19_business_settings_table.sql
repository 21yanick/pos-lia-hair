-- Business Settings Migration
-- Creates table for configurable company data and PDF settings

CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Company Data
  company_name TEXT,
  company_tagline TEXT,
  company_address TEXT,
  company_postal_code TEXT,
  company_city TEXT,
  company_phone TEXT,
  company_email TEXT,
  company_website TEXT,
  company_uid TEXT,
  
  -- Logo
  logo_url TEXT,
  logo_storage_path TEXT,
  
  -- Settings
  default_currency TEXT DEFAULT 'CHF',
  tax_rate DECIMAL(5,2) DEFAULT 7.7,
  pdf_show_logo BOOLEAN DEFAULT true,
  pdf_show_company_details BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own settings" ON business_settings 
  FOR ALL USING (auth.uid() = user_id);

-- Updated At Trigger
CREATE OR REPLACE FUNCTION update_business_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON business_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_business_settings_updated_at();

-- Storage Bucket for Logos
INSERT INTO storage.buckets (id, name, public) VALUES ('business-logos', 'business-logos', true);

-- Storage Policies
CREATE POLICY "Users manage own logos" ON storage.objects 
  FOR ALL USING (
    bucket_id = 'business-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );