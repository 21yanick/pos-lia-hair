# POS-LIA-HAIR Buchhaltungs-Konzept

**Version:** 1.0  
**Datum:** 25.01.2025  
**Status:** Final Draft

## Übersicht

Das POS-LIA-HAIR System ist ein vereinfachtes Point-of-Sale und Buchhaltungssystem für den Schweizer Coiffeursalon "LIA Hair". Das System trennt sauber zwischen **Salon-Betrieb** (Verkäufe, Tagesabschlüsse) und **Business-Ausgaben** (Miete, Einkäufe, etc.) und stellt eine zentrale Dokumentenverwaltung bereit.

## Kernprinzipien

1. **Saubere Trennung**: Salon-Betrieb ≠ Business-Ausgaben
2. **Unveränderlichkeit**: Geschlossene Abschlüsse sind final (mit kontrollierten Korrekturen)
3. **Nachvollziehbarkeit**: Jede Änderung wird dokumentiert
4. **Buchhaltungs-konform**: Getrennte Export-Listen nach Kategorien
5. **Pragmatisch**: Korrekturen sind möglich, aber kontrolliert

---

## 1. Datenstruktur (7 Kern-Tabellen)

### Stammdaten
- **`users`**: Benutzer mit Rollen (admin, staff)
- **`items`**: Produkte & Dienstleistungen

### Transaktions-System
- **`sales`**: POS-Verkäufe (cash, twint, sumup)
- **`sale_items`**: Verkaufsdetails
- **`expenses`**: Business-Ausgaben (rent, supplies, salary, utilities, insurance, other)
- **`cash_movements`**: Bargeld-Tracking (automatisch bei Bar-Transaktionen)

### Reporting & Dokumente
- **`daily_summaries`**: Tagesabschlüsse (NUR Salon-Verkäufe)
- **`documents`**: Alle PDFs (Quittungen, Berichte, Belege)

---

## 2. Tagesabschluss-System

### Inhalt (NUR Salon-Betrieb)
```
✅ Verkäufe nach Zahlungsart (cash, twint, sumup)
✅ Bargeld-Kassensturz (Start/Ende/Differenz)
❌ Business-Ausgaben (gehören NICHT in Tagesabschluss)
```

### Status-Logik
```
🟡 DRAFT (automatisch):
├── System erstellt täglich automatisch
├── Aktualisiert sich bei jedem neuen Verkauf
└── PDF wird bei jeder Änderung neu generiert

🔴 CLOSED (manuell):
├── Mitarbeiter schließt bewusst ab (nach Kassensturz)
├── KEINE automatischen Updates mehr
├── PDF ist final und unveränderlich
└── Neue Verkäufe → Warnung oder Korrektur-System

🟠 CORRECTED (bei Nachbuchungen):
├── Nachträgliche Anpassungen dokumentiert
├── Neues PDF mit Korrektur-Anhang
└── Original-PDF bleibt archiviert
```

### Täglicher Workflow
```
🌅 Morgens: daily_summary (DRAFT) automatisch erstellt
📱 Tagsüber: Verkäufe → automatische Updates
🌙 Abends: Kassensturz → Endbetrag eingeben → Status CLOSED
```

---

## 3. Korrektur-System

### Erlaubte Nachbuchungen
```
📝 Trinkgeld bei Kartenzahlung:
├── Erst auf Abrechnung sichtlich
├── Nachbuchung zur entsprechenden Zahlungsart
└── Automatische Dokumentation

📝 Nachträgliche Verkäufe:
├── Kunde kommt zurück am selben Tag
├── Wird als "Late Sale" markiert
└── Grund: "Nachträglicher Verkauf"

📝 Tippfehler-Korrekturen:
├── Falsche Beträge korrigieren
├── Zahlungsart-Änderungen
└── Nur durch Admin mit Begründung
```

### Korrektur-Prozess
```
1. Berechtigung prüfen (nur Admin)
2. Grund dokumentieren (Dropdown + Freitext)
3. Betrag & Zahlungsart eingeben
4. Status → CORRECTED
5. Neues PDF mit Korrektur-Anhang generieren
6. Original archivieren (Audit-Trail)
```

---

## 4. Ausgaben-System

### Kategorien & Zahlungsarten
```
📂 KATEGORIEN:
├── rent (Miete)
├── supplies (Einkauf/Material)
├── salary (Lohn)
├── utilities (Nebenkosten)
├── insurance (Versicherung)
└── other (Sonstiges)

💳 ZAHLUNGSARTEN:
├── cash → Bargeld-Bewegung wird automatisch erstellt
└── bank → Nur Buchung, kein Cash-Impact
```

### Workflow
```
💳 Ausgabe erfassen:
├── Betrag, Kategorie, Zahlungsart eingeben
├── Zahlungsdatum (wichtig für korrekte Zuordnung)
├── Bei Bargeld: automatische cash_movement
├── Beleg hochladen (optional)
└── KEIN Impact auf Tagesabschluss!
```

**Wichtig:** Ausgaben werden **SEPARAT** vom Tagesabschluss verwaltet und erst im Monatsabschluss zusammengeführt.

---

## 5. Monatsabschluss-System

### Voraussetzungen
```
✅ Alle Tagesabschlüsse des Monats: CLOSED oder CORRECTED
✅ Alle Ausgaben des Monats erfasst
✅ Alle Belege hochgeladen
```

### Monatsabschluss-Inhalt
```
📊 SALON-BEREICH (aus daily_summaries):
├── Summe aller Tagesabschlüsse (inkl. Korrekturen)
├── Aufschlüsselung nach Zahlungsarten
└── Liste aller Korrekturen (Transparenz)

💰 AUSGABEN-BEREICH (aus expenses):
├── Nach Kategorien gruppiert
├── Nach Zahlungsarten aufgeteilt
└── Getrennt von Salon-Umsätzen dargestellt

📄 KORREKTUR-ANHANG:
├── Alle Nachbuchungen des Monats
├── Mit Begründungen und Zeitstempeln
└── Chronologisch sortiert
```

### Status
```
🟡 DRAFT: Automatisch generiert, noch änderbar
🔴 CLOSED: Final abgeschlossen, keine Änderungen mehr
```

---

## 6. Documents Page - Zentrale Dokumentenverwaltung

### Dokument-Kategorien
```
📄 AUTOMATISCH GENERIERT:
├── receipt (Kundenquittungen)
├── daily_report (Tagesabschlüsse)
├── daily_correction (Korrektur-Anhänge)
└── monthly_report (Monatsberichte)

📄 MANUELL HOCHGELADEN:
├── expense_receipt (Ausgaben-Belege)
├── bank_statement (Bankauszüge)
├── tax_document (Steuer-Dokumente)
└── other (Sonstiges)
```

### Ansichten
```
📅 CHRONOLOGISCH (Default):
├── Alle Dokumente nach Datum sortiert
├── Farbkodierung nach Typ
└── Schnelle Tagesübersicht

📂 NACH KATEGORIEN:
├── Gruppiert nach Dokumenttyp
├── Statistiken pro Kategorie
└── Bulk-Aktionen möglich

📥 UPLOAD-BEREICH:
├── Drag & Drop für neue Dokumente
├── Automatische Kategorisierung
└── Zuletzt hochgeladene anzeigen
```

### Buchhaltungs-Export
```
📤 EXPORT-FUNKTION:
├── Zeitraum wählen (Monat/Quartal/Jahr)
├── Ordner-Struktur nach Zahlungsarten:
│   ├── /Quittungen_Bar/
│   ├── /Quittungen_TWINT/
│   ├── /Quittungen_SumUp/
│   ├── /Tagesabschlüsse/
│   ├── /Ausgaben_nach_Kategorie/
│   └── /Bankauszüge/
├── Master-Transaktionsliste (Excel)
└── Als ZIP downloadbar
```

---

## 7. Benutzer-Management

### Rollen & Berechtigungen
```
👑 ADMIN:
├── Alle Funktionen verfügbar
├── Korrekturen durchführen
├── Monatsabschlüsse erstellen
├── Benutzer verwalten
└── System-Einstellungen ändern

👤 STAFF:
├── POS-Verkäufe durchführen
├── Ausgaben erfassen
├── Tagesabschlüsse ansehen
├── Dokumente einsehen
└── KEINE Korrekturen oder Monatsabschlüsse
```

---

## 8. Sicherheit & Audit

### Audit-Trail
```
📋 ALLE ÄNDERUNGEN WERDEN GELOGGT:
├── Wer hat was wann geändert
├── Alte und neue Werte
├── Grund für Änderung
└── IP-Adresse und Session-Info
```

### Unveränderlichkeit
```
🔒 GESCHLOSSENE DOKUMENTE:
├── daily_summary (CLOSED) → nur via Korrektur-System
├── monthly_report (CLOSED) → keine Änderungen mehr
├── Original-PDFs bleiben immer archiviert
└── Korrektur-Kette ist nachvollziehbar
```

---

## 9. Praktische Anwendung

### Normaler Arbeitstag
```
09:00 → System erstellt daily_summary (DRAFT) automatisch
09:30 → Erster Verkauf → Quittung + Tagesabschluss aktualisiert
[...]
18:00 → Letzter Verkauf
18:30 → Kassensturz: Bargeld zählen
18:35 → Endbetrag eingeben → Status CLOSED
18:36 → Finales PDF generiert und archiviert
```

### Korrektur-Fall
```
19:00 → Kunde ruft an: "Habe 5 CHF Trinkgeld bei Kartenzahlung gegeben"
19:05 → Admin öffnet Documents → Tagesabschluss 
19:06 → "Korrektur hinzufügen" → "Trinkgeld-Nachbuchung"
19:07 → 5 CHF, SumUp, "Nachträgliches Trinkgeld Herr Müller"
19:08 → Status → CORRECTED, neues PDF mit Korrektur-Anhang
```

### Monatsende
```
Ende Monat → Prüfung: Alle Tage CLOSED oder CORRECTED?
→ Alle Ausgaben erfasst und Belege hochgeladen?
→ Monatsabschluss generieren
→ PDF für Buchhaltung über Documents-Export herunterladen
→ Status → CLOSED (keine Änderungen mehr möglich)
```

---

## 10. Technische Umsetzung

### Zentrale Funktionen
```
calculate_daily_summary(date) → Automatische Tagesabschluss-Berechnung
get_current_cash_balance() → Aktueller Bargeld-Bestand
create_correction(summary_id, type, amount, reason) → Korrektur hinzufügen
generate_monthly_report(year, month) → Monatsabschluss erstellen
export_documents(start_date, end_date, types[]) → Buchhaltungs-Export
```

### Status-Übergänge
```
daily_summary: draft → closed → corrected
monthly_report: draft → closed
documents: auto-generated | manually uploaded
```

---

## Fazit

Dieses Konzept gewährleistet:
- **Buchhaltungs-konforme** Trennung von Geschäftsbereichen
- **Audit-sichere** Dokumentation aller Änderungen  
- **Pragmatische** Korrektur-Möglichkeiten für den Alltag
- **Zentrale** Dokumentenverwaltung für die Buchhaltung
- **Skalierbare** Struktur für zukünftige Erweiterungen

Das System ist bereit für den produktiven Einsatz und erfüllt alle Anforderungen eines modernen POS- und Buchhaltungssystems für einen Schweizer Coiffeursalon.