#!/bin/bash
# Script zum kompletten Neusetup der Datenbank mit neuer monthly_summaries Struktur
# Autor: Claude Code
# Datum: 25.01.2025

echo "🎯 Starte komplettes Datenbank-Neusetup..."

CONTAINER_NAME="supabase-db"

# Prüfe, ob der Container läuft
if ! docker ps | grep -q $CONTAINER_NAME; then
  echo "❌ Fehler: Der Container '$CONTAINER_NAME' läuft nicht."
  echo "Bitte starte den Container und versuche es erneut."
  exit 1
fi

echo "✅ Container '$CONTAINER_NAME' läuft"

# 1. Clean Restart Migration ausführen
echo "🧹 Führe 04_clean_restart.sql aus..."
docker cp supabase/migrations/04_clean_restart.sql $CONTAINER_NAME:/tmp/04_clean_restart.sql
docker exec $CONTAINER_NAME psql -U postgres -d postgres -f /tmp/04_clean_restart.sql

if [ $? -eq 0 ]; then
    echo "✅ Clean Restart erfolgreich"
else
    echo "❌ Fehler bei Clean Restart"
    exit 1
fi

# 2. Monthly Summaries Migration ausführen
echo "📊 Führe 05_monthly_summaries.sql aus..."
docker cp supabase/migrations/05_monthly_summaries.sql $CONTAINER_NAME:/tmp/05_monthly_summaries.sql
docker exec $CONTAINER_NAME psql -U postgres -d postgres -f /tmp/05_monthly_summaries.sql

if [ $? -eq 0 ]; then
    echo "✅ Monthly Summaries Migration erfolgreich"
else
    echo "❌ Fehler bei Monthly Summaries Migration"
    exit 1
fi

# 3. Storage Buckets Migration ausführen (falls vorhanden)
if [ -f "supabase/migrations/02_storage_buckets.sql" ]; then
    echo "📁 Führe 02_storage_buckets.sql aus..."
    docker cp supabase/migrations/02_storage_buckets.sql $CONTAINER_NAME:/tmp/02_storage_buckets.sql
    docker exec $CONTAINER_NAME psql -U postgres -d postgres -f /tmp/02_storage_buckets.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Storage Buckets Migration erfolgreich"
    else
        echo "⚠️  Storage Buckets Migration fehlgeschlagen (optional)"
    fi
fi

# 4. Datenbankstatus prüfen
echo "📋 Prüfe Datenbankstatus..."
docker exec $CONTAINER_NAME psql -U postgres -d postgres -c "
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
"

echo ""
echo "📊 Prüfe monthly_summaries Tabelle..."
docker exec $CONTAINER_NAME psql -U postgres -d postgres -c "
SELECT COUNT(*) as row_count FROM monthly_summaries;
"

echo ""
echo "🎯 Setup abgeschlossen!"
echo ""
echo "✅ Erfolgreich durchgeführt:"
echo "   - Alte Tabellen entfernt"
echo "   - Neue vereinfachte Struktur erstellt"
echo "   - monthly_summaries Tabelle hinzugefügt"
echo "   - Demo-Daten eingefügt"
echo ""
echo "🚀 Das System ist bereit für den Test!"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. App neu starten (npm run dev)"
echo "   2. Zu Monthly Reports Page navigieren"
echo "   3. Neuen Monatsabschluss testen"