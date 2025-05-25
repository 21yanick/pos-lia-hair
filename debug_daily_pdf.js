// Debug Script für Daily PDF Generierung
// Kann manuell im Browser Console ausgeführt werden

console.log("🔧 Daily PDF Debug Script gestartet")

// Test: Existiert die Summary?
const summaryId = "2a8fa710-3320-47d0-902b-69990f4bb7f6"
console.log("📋 Testen mit Summary ID:", summaryId)

// Test: Supabase Verbindung
console.log("🔌 Teste Supabase Verbindung...")

// Test: Storage Bucket
supabase.storage.from('documents').list('daily_reports', { limit: 10 })
  .then(result => {
    console.log("📁 Storage Bucket Test:", result)
  })
  .catch(err => {
    console.error("❌ Storage Fehler:", err)
  })

// Test: Documents Tabelle
supabase.from('documents').select('*').eq('type', 'daily_report')
  .then(result => {
    console.log("📄 Documents Tabelle:", result)
  })
  .catch(err => {
    console.error("❌ Documents Fehler:", err)
  })

// Test: Daily Summary laden
supabase.from('daily_summaries').select('*').eq('id', summaryId).single()
  .then(result => {
    console.log("📊 Daily Summary:", result)
    
    if (result.data) {
      console.log("✅ Summary gefunden, versuche PDF zu erstellen...")
      
      // Hier würde die PDF-Generierung starten
      console.log("📝 Summary Daten:", {
        id: result.data.id,
        date: result.data.report_date,
        status: result.data.status,
        sales_total: result.data.sales_total
      })
    }
  })
  .catch(err => {
    console.error("❌ Summary Fehler:", err)
  })

console.log("🚀 Debug Script beendet. Überprüfe die Console für Ergebnisse.")