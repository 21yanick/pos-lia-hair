#!/bin/bash
# Script zum Ausführen des clean_tables.sql in einem Docker-Container
# Autor: Claude Code
# Erstellungsdatum: 05.05.2025

echo "Starte Bereinigung der Datenbank..."

# Annahme: Der Container-Name ist 'supabase-db'
# Ändere dies entsprechend deiner Docker-Setup
CONTAINER_NAME="supabase-db"

# Prüfe, ob der Container läuft
if ! docker ps | grep -q $CONTAINER_NAME; then
  echo "Fehler: Der Container '$CONTAINER_NAME' läuft nicht."
  echo "Bitte starte den Container und versuche es erneut."
  exit 1
fi

# Führe das SQL-Skript im Container aus
docker exec -i $CONTAINER_NAME psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/clean_tables.sql

# Kopiere das SQL-Skript in den Container
echo "Kopiere clean_tables.sql in den Container..."
docker cp clean_tables.sql $CONTAINER_NAME:/docker-entrypoint-initdb.d/

# Führe das SQL-Skript im Container aus
echo "Führe clean_tables.sql aus..."
docker exec -i $CONTAINER_NAME psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/clean_tables.sql

echo "Bereinigung abgeschlossen!"