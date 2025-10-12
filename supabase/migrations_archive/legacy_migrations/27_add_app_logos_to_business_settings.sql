-- Add App Logo support to business_settings
-- This allows organizations to customize their app branding with theme-aware logos

-- Add app logo columns for light and dark themes
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS app_logo_light_url TEXT,
ADD COLUMN IF NOT EXISTS app_logo_light_storage_path TEXT,
ADD COLUMN IF NOT EXISTS app_logo_dark_url TEXT,
ADD COLUMN IF NOT EXISTS app_logo_dark_storage_path TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.business_settings.app_logo_light_url IS 
'URL for the app logo displayed in light theme (header, login, sidebar)';

COMMENT ON COLUMN public.business_settings.app_logo_light_storage_path IS 
'Supabase storage path for the light theme app logo file';

COMMENT ON COLUMN public.business_settings.app_logo_dark_url IS 
'URL for the app logo displayed in dark theme (header, login, sidebar)';

COMMENT ON COLUMN public.business_settings.app_logo_dark_storage_path IS 
'Supabase storage path for the dark theme app logo file';

-- Example data structure:
-- app_logo_light_url: 'https://your-project.supabase.co/storage/v1/object/public/logos/org-id/app-logo-light.png'
-- app_logo_dark_url: 'https://your-project.supabase.co/storage/v1/object/public/logos/org-id/app-logo-dark.png'