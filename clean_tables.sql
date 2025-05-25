-- Skript zum Leeren aller Tabellen außer der 'users'-Tabelle
-- Deaktiviert temporär die Referenzüberprüfung, um Konflikte zu vermeiden
-- Autor: Claude Code
-- Erstellungsdatum: 05.05.2025

-- Starte eine Transaktion für Atomarität (alles oder nichts)
BEGIN;

-- Deaktiviere vorübergehend die Referenzüberprüfung
SET session_replication_role = 'replica';

-- Leere alle Tabellen außer 'users' in der richtigen Reihenfolge
-- Reihenfolge berücksichtigt Fremdschlüsselbeziehungen

-- Zuerst Tabellen ohne eingehende Abhängigkeiten oder Tabellen am Ende von Abhängigkeitsketten
TRUNCATE TABLE transaction_items CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE supplier_invoices CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE cash_register CASCADE;
TRUNCATE TABLE register_status CASCADE;

-- Dann Tabellen mit weniger Abhängigkeiten
TRUNCATE TABLE daily_reports CASCADE;
TRUNCATE TABLE monthly_reports CASCADE;

-- Zuletzt unabhängige Tabellen
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE business_settings CASCADE;

-- Aktiviere die Referenzüberprüfung wieder
SET session_replication_role = 'origin';

-- Bestätige die Transaktion
COMMIT;

-- Protokolliere Erfolg
DO $$
BEGIN
    RAISE NOTICE 'Alle Tabellen außer der users-Tabelle wurden erfolgreich geleert.';
END $$;