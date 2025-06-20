import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Supabase configuration with production fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://db.lia-hair.ch';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1MDI4Nzk2MCwiZXhwIjo0OTA1OTYxNTYwLCJyb2xlIjoiYW5vbiJ9.w__hClUJSKYmQ-DJh3t-1wNOAeFLpdP-J9_T_Kcxem0';

// Runtime validation (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase Config:', {
    url: supabaseUrl,
    keyExists: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length
  });
}

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey
);