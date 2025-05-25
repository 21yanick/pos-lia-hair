// Debug-Script für Sales-Abfrage
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:8000'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugSales() {
  console.log('🔍 Debug Sales Query...')
  
  // 1. Prüfe Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('User:', user)
  console.log('Auth Error:', authError)
  
  // 2. Teste einfache Sales-Abfrage
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .limit(5)
  
  console.log('Sales Data:', salesData)
  console.log('Sales Error:', salesError)
  
  // 3. Teste Sales mit Zeitbereich
  const { data: salesWithRange, error: rangeError } = await supabase
    .from('sales')
    .select('*')
    .gte('created_at', '2025-05-24T22:00:00.000Z')
    .lte('created_at', '2025-05-25T21:59:59.999Z')
  
  console.log('Sales with Range:', salesWithRange)
  console.log('Range Error:', rangeError)
}

debugSales()