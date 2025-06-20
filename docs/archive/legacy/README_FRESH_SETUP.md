# Fresh Database Setup für POS-LIA-HAIR

## 🎯 Übersicht

Dieses Script setzt die Datenbank komplett zurück und erstellt die neue Struktur mit `monthly_summaries` Tabelle.

## 🏗️ Neue Datenbankstruktur

### Kern-Tabellen
- `users` - Benutzer mit Rollen
- `items` - Produkte & Dienstleistungen
- `sales` - POS-Verkäufe
- `sale_items` - Verkaufsdetails
- `expenses` - Business-Ausgaben
- `cash_movements` - Bargeld-Tracking
- `documents` - Alle PDFs
- `daily_summaries` - Tagesabschlüsse mit Status
- **`monthly_summaries`** - **NEU:** Monatsabschlüsse mit Status

### Status-Management

**Daily Summaries:**
- `draft` → automatisch erstellt, updates bei neuen Verkäufen
- `closed` → manuell geschlossen, keine Updates mehr

**Monthly Summaries:** 
- `draft` → automatisch berechnet aus daily_summaries + expenses
- `closed` → manuell geschlossen, PDF erstellt

## 🚀 Setup ausführen

```bash
# Script ausführbar machen (falls nötig)
chmod +x setup_fresh_db.sh

# Komplettes Neusetup
./setup_fresh_db.sh
```

## 📋 Was das Script macht

1. **Clean Restart:** Entfernt alle alten Tabellen
2. **Neue Struktur:** Erstellt 8 Kern-Tabellen
3. **Monthly Summaries:** Fügt monthly_summaries Tabelle hinzu
4. **Storage:** Erstellt Storage Buckets (optional)
5. **Demo-Daten:** Fügt Beispiel-Items ein
6. **Validierung:** Prüft ob alles korrekt erstellt wurde

## 🔧 Nach dem Setup

### 1. App neu starten
```bash
npm run dev
```

### 2. Funktionen testen

**POS System:**
- Verkäufe erstellen → Automatische Quittungs-PDFs
- Bargeld-Verkäufe → Automatische cash_movements

**Daily Reports:**
- Tagesabschluss erstellen → Status: draft
- Kassensturz eingeben → Status: closed

**Monthly Reports:** 
- Monatsauswahl → Automatische Berechnung
- Monatsabschluss → Status: closed + PDF
- PDF erscheint in Documents Page

**Documents Page:**
- Alle PDFs sichtbar mit korrekten Namen
- Filter nach Dokumenttypen funktional
- Upload von Ausgaben-Belegen möglich

## 🐛 Debugging

### Logs prüfen
```bash
# Browser Console (F12) für Frontend-Logs
# Docker Logs für Backend
docker logs supabase-db
```

### Datenbank direkt prüfen
```bash
# In Container einloggen
docker exec -it supabase-db psql -U postgres -d postgres

# Tabellen anzeigen
\dt

# Monthly summaries prüfen
SELECT * FROM monthly_summaries;

# Daily summaries prüfen  
SELECT * FROM daily_summaries;
```

## 📊 Erwartete Ergebnisse

**Nach erfolgreichem Setup:**
- ✅ 8 Tabellen erstellt
- ✅ RLS Policies aktiv
- ✅ Demo-Items vorhanden
- ✅ Helper-Funktionen verfügbar
- ✅ Storage Buckets bereit

**Beim Testen:**
- ✅ Monthly Reports lädt ohne "Daten werden geladen"
- ✅ Status bleibt persistent nach Seitenwechsel
- ✅ PDFs erscheinen in Documents Page
- ✅ Alle Beträge werden korrekt angezeigt

## 🎯 Bekannte Unterschiede

**Vorher:**
- Monthly Reports nur mit documents Tabelle
- Status nicht persistent
- PDFs erschienen nicht in Documents

**Nachher:**
- Monthly Reports mit eigener monthly_summaries Tabelle
- Status persistent wie bei daily_summaries
- Vollständige Integration in Documents System

## 📝 Autor

Erstellt am 25.01.2025 für das POS-LIA-HAIR System v2.0