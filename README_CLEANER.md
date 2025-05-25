# Datenbankbereinigungsskript für POS-LIA-HAIR

Dieses Dokument beschreibt die Verwendung des SQL-Skripts `clean_tables.sql` und des Ausführungsskripts `run_cleaner.sh`, die alle Tabellen in der POS-LIA-HAIR-Datenbank außer der `users`-Tabelle leeren.

## Zweck

Das Bereinigungs-Skript wurde entwickelt, um die Datenbank für Testzwecke oder nach der Entwicklung zurückzusetzen, ohne die Benutzerkonten zu löschen. Dies ist nützlich für:

- Zurücksetzen der Produktionsdatenbank nach der Testphase
- Löschen aller Transaktions- und Geschäftsdaten, während die Benutzerkonten erhalten bleiben
- Vorbereitung der Datenbank für den produktiven Einsatz nach der Entwicklung

## Betroffene Tabellen

Das Skript leert folgende Tabellen:

1. `transaction_items` - Transaktionsdetails
2. `transactions` - Transaktionen
3. `supplier_invoices` - Lieferantenrechnungen
4. `documents` - Dokumente
5. `cash_register` - Kassenbuch
6. `register_status` - Kassenstatus
7. `daily_reports` - Tagesberichte
8. `monthly_reports` - Monatsberichte
9. `items` - Produkte & Dienstleistungen
10. `business_settings` - Geschäftseinstellungen

Die `users`-Tabelle bleibt unberührt.

## Verwendung

### Mit Docker

1. Stellen Sie sicher, dass Ihr Supabase Docker-Container läuft.
2. Führen Sie das Skript `run_cleaner.sh` aus:

```bash
./run_cleaner.sh
```

Das Skript kopiert die SQL-Datei in den Container und führt sie aus.

### Manuell

1. Stellen Sie sicher, dass Ihr Supabase Docker-Container läuft.
2. Kopieren Sie das Skript in den Container:

```bash
docker cp clean_tables.sql CONTAINER_NAME:/docker-entrypoint-initdb.d/
```

3. Führen Sie das Skript im Container aus:

```bash
docker exec -i CONTAINER_NAME psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/clean_tables.sql
```

Ersetzen Sie `CONTAINER_NAME` durch den Namen Ihres Docker-Containers (standardmäßig `supabase-db`).

## Hinweise

- Das Skript verwendet eine Transaktion, um sicherzustellen, dass entweder alle Tabellen oder keine geleert werden.
- Temporär werden Referenzprüfungen deaktiviert, um Constraint-Verletzungen zu vermeiden.
- Die Reihenfolge der TRUNCATE-Befehle berücksichtigt die Abhängigkeiten zwischen den Tabellen.
- Führen Sie dieses Skript nicht in einer Produktionsumgebung aus, es sei denn, Sie möchten wirklich alle Daten außer Benutzerkonten entfernen.

## Anpassung

Falls Sie bestimmte Tabellen vom Löschvorgang ausschließen möchten, entfernen Sie die entsprechenden TRUNCATE-Befehle aus dem `clean_tables.sql`-Skript.

## Autor

Erstellt am 05.05.2025