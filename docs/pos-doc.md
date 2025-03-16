# Coiffeursalon POS System - NextJS-Implementation
**Anforderungen und Spezifikationen für einen kompletten Neuaufbau**

## 1. Projektziele und Überblick

### 1.1 Ausgangslage
Es soll ein modernes Point-of-Sale (POS) System für einen Schweizer Coiffeursalon entwickelt werden. Die Anforderungen und Funktionen wurden basierend auf den Bedürfnissen eines Friseursalons definiert, wobei besonderer Wert auf Benutzerfreundlichkeit und effizientes Arbeiten gelegt wird.

### 1.2 Ziele des Projekts
- **Moderner Tech-Stack**: Entwicklung mit NextJS als Frontend-Framework
- **Effizientes Backend**: Implementierung mit Supabase (self-hosted)
- **Containerisierte Lösung**: Deployment mittels Docker/docker-compose
- **Optimale Benutzerführung**: Intuitive UI/UX speziell für Salon-Anwendungen
- **Skalierbarkeit**: Zukunftssichere Architektur für potenzielle Erweiterungen

### 1.3 Hauptfunktionen
Das POS-System ist für einen Schweizer Coiffeursalon konzipiert und umfasst:
- Verkaufsabwicklung für Dienstleistungen und Produkte
- Kassenverwaltung (öffnen/schließen) mit Kassenbestandskontrolle
- Tages- und Monatsabschlüsse
- Kassenbuch für Bargeldbewegungen
- Produkt- und Dienstleistungsverwaltung
- Lieferantenrechnungen (Kreditoren) Verwaltung
- Dokumentenverwaltung (Quittungen, Berichte)
- Einstellungen für Geschäftsdaten

## 2. Technischer Stack und Architektur

### 2.1 Frontend
- **Framework**: NextJS (App Router)
- **Sprache**: TypeScript
- **CSS-Framework**: Tailwind CSS
- **State Management**: React Context API + Zustand
- **Formulare**: React Hook Form + Zod Validierung
- **UI-Komponenten**: Shadcn/UI (basierend auf Radix UI)

### 2.2 Backend
- **Supabase (self-hosted)**:
  - PostgreSQL Datenbank
  - Auth-Service (JWT-basiert)
  - Storage für Dokumente (PDF-Speicherung)
  - Edge Functions für spezielle Serverlogik
  - Row-Level Security für Datenzugriffskontrolle

### 2.3 Containerisierung
- Docker und docker-compose
- Separate Container für:
  - NextJS Frontend
  - Supabase
  - PostgreSQL Datenbank
  - MinIO (für Dokumentenspeicherung)
  - NGINX (Reverse Proxy)

### 2.4 Systemarchitektur
- **Frontend-First-Ansatz**: Maximale Logik im Frontend
- **API-Basierte Kommunikation**: REST/GraphQL über Supabase
- **Inkrementelles Rendering**: Für optimale Performance
- **Edge Computing**: Für rechenintensive Operationen (PDF-Generierung)

## 3. Datenbankschema und Migration

### 3.1 Hauptentitäten
Das Datenbankschema ist für PostgreSQL optimiert und umfasst folgende Tabellen:

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### items (Produkte & Dienstleistungen)
```sql
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    default_price DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('service', 'product')),
    description TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### monthly_reports
```sql
CREATE TABLE monthly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    cash_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    twint_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    sumup_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('draft', 'closed')),
    notes TEXT,
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (year, month)
);
```

#### daily_reports
```sql
CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    cash_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    twint_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    sumup_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    starting_cash DECIMAL(10,2) NOT NULL,
    ending_cash DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'closed')),
    notes TEXT,
    monthly_report_id UUID REFERENCES monthly_reports(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### transactions
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'twint', 'sumup')),
    status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled', 'refunded')),
    notes TEXT,
    daily_report_id UUID REFERENCES daily_reports(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### transaction_items
```sql
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    price DECIMAL(10,2) NOT NULL,
    notes TEXT
);
```

#### cash_register
```sql
CREATE TABLE cash_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    daily_report_id UUID REFERENCES daily_reports(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### supplier_invoices
```sql
CREATE TABLE supplier_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
    payment_date DATE,
    notes TEXT,
    document_id UUID REFERENCES documents(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### documents
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('receipt', 'daily_report', 'monthly_report', 'supplier_invoice')),
    reference_id UUID NOT NULL,
    file_path TEXT NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### business_settings
```sql
CREATE TABLE business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    address_street TEXT NOT NULL,
    address_city TEXT NOT NULL,
    address_zip TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    receipt_footer_text TEXT,
    show_logo BOOLEAN DEFAULT TRUE,
    additional_info TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 Datenimport (falls erforderlich)
- Einfache Import-Skripte zum Laden von Testdaten oder vorhandenen Daten
- Validierung der Datenintegrität
- Initialscripts für das Erstellen von Grundeinstellungen
- Beispieldaten für Entwicklung und Testing

### 3.3 Row-Level Security
Für Supabase werden RLS-Richtlinien implementiert:

```sql
-- Example für transactions Tabelle
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transactions sind für authentifizierte Benutzer lesbar" 
ON transactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Nur Staff und Admin können Transactions erstellen" 
ON transactions FOR INSERT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND (users.role = 'staff' OR users.role = 'admin')
));
```

## 4. Frontend-Struktur und UI-Design

### 4.1 Verzeichnisstruktur
```
src/
├── app/                       # App Router Pfade
│   ├── (auth)/                # Geschützte Routen
│   │   ├── dashboard/         # Dashboard
│   │   ├── pos/               # Verkaufsscreen
│   │   ├── reports/           # Abschlüsse
│   │   │   ├── daily/         # Tagesabschlüsse
│   │   │   ├── monthly/       # Monatsabschlüsse
│   │   │   └── cash-register/ # Kassenbuch
│   │   ├── products/          # Produktverwaltung
│   │   ├── supplier-invoices/ # Lieferantenrechnungen
│   │   ├── documents/         # Dokumentenverwaltung
│   │   └── settings/          # Einstellungen
│   ├── login/                 # Login-Seite
│   └── layout.tsx             # Root Layout
├── components/                # UI-Komponenten
│   ├── auth/                  # Auth-Komponenten
│   ├── layout/                # Layout-Komponenten
│   │   ├── sidebar/           # Seitenleiste
│   │   └── header/            # Kopfbereich
│   ├── pos/                   # POS-Komponenten
│   ├── products/              # Produkt-Komponenten
│   ├── reports/               # Report-Komponenten
│   ├── supplier-invoices/     # Lieferantenrechnungs-Komponenten
│   ├── documents/             # Dokument-Komponenten
│   ├── ui/                    # Basis-UI-Komponenten (shadcn)
│   └── dialogs/               # Modal-Dialoge
├── lib/                       # Hilfsfunktionen
│   ├── supabase/              # Supabase Client
│   ├── pdf/                   # PDF-Generator
│   ├── utils/                 # Allgemeine Hilfsfunktionen
│   └── hooks/                 # Custom Hooks
├── types/                     # TypeScript Typdefinitionen
├── store/                     # Zustand State Management
├── styles/                    # Globale Styles & Tailwind
├── public/                    # Statische Assets
└── middleware.ts              # NextJS Middleware (Auth)
```

### 4.2 UI Design System
- **Farbpalette**:
  - Primär: #3b82f6 (Blau)
  - Sekundär: #10b981 (Grün für Erfolg)
  - Warnung: #f59e0b (Gelb)
  - Gefahr: #ef4444 (Rot)
  - Neutral: #1f2937, #374151, #6b7280, #9ca3af, #e5e7eb

- **Typografie**:
  - Hauptschrift: Inter (Sans-Serif)
  - Überschriften: font-weight: 600
  - Text: font-weight: 400
  - 5 Größen: xs, sm, base, lg, xl, 2xl

- **Komponenten-Design**:
  - Clean, minimalistisch
  - Konsistente Abstände und Rundungen
  - Responsive für Tablet-Nutzung optimiert
  - High-Contrast für gute Lesbarkeit

### 4.3 Responsive Design
- Mobile-First-Ansatz
- Schlüssel-Breakpoints:
  - sm: 640px (Smartphones)
  - md: 768px (Tablets)
  - lg: 1024px (Kleine Desktops)
  - xl: 1280px (Große Desktops)

## 5. Seitendetails und Funktionen

### 5.1 Sidebar
- Einklappbare Sidebar (persistent zwischen Seitenwechseln)
- Navigationspunkte mit Icons für:
  - Dashboard
  - Verkauf
  - Abschlüsse
  - Produkte
  - Lieferantenrechnungen
  - Dokumente
  - Einstellungen
- Abmelden-Button am unteren Rand
- Visuelles Feedback für aktive Seite

### 5.2 Dashboard
- **Kassenstatus-Anzeige**:
  - Großer visueller Indikator (offen/geschlossen)
  - Bei geöffneter Kasse: Zeitpunkt der Öffnung, aktueller Kassenbestand
- **Quick-Actions**:
  - 3x3 Grid mit großen Buttons für:
    - Neuer Verkauf
    - Tagesabschluss
    - Kassenbuch
    - Monatsabschluss
- **Tagesstatistik**:
  - Umsatz heute
  - Anzahl Transaktionen
  - Verteilung nach Zahlungsarten (Kreisdiagramm)
  - Letzte 5 Transaktionen als Mini-Liste
- **Dialog: Kasse öffnen**:
  - Datums- und Uhrzeitanzeige
  - Eingabefeld für Bargeldbestand (numerisch)
  - Notizen (optional)
  - Abbrechen/Bestätigen-Buttons

### 5.3 Verkaufsscreen
- **Layout**: 2/3 zu 1/3 Split (links Produkte, rechts Warenkorb)
- **Linker Bereich**:
  - Tabs für "Dienstleistungen/Produkte/Favoriten"
  - Suchfeld für schnelles Finden
  - Grid mit Produkt-/Dienstleistungskarten
  - Jede Karte zeigt: Name, Preis
- **Rechter Bereich (Warenkorb)**:
  - Liste der ausgewählten Items
  - Pro Item: Name, Einzelpreis, Menge, Gesamtpreis
  - Steuerelemente für Mengenanpassung, Preisanpassung und Entfernen
  - Zwischensummen-Bereich
  - Gesamtbetrag (fett hervorgehoben)
  - "Bezahlen"-Button (groß, am unteren Rand)
- **Dialog: Zahlung**:
  - Zahlungsmethoden-Auswahl (Bar/Twint/SumUp)
  - Bei Barzahlung: Eingabefeld für erhaltenen Betrag, automatische Rückgeldberechnung
  - Abbrechen/Bestätigen-Buttons
- **Dialog: Zahlungsbestätigung**:
  - Erfolgsanzeige mit Animation
  - Übersicht der getätigten Transaktion
  - Optionen:
    - PDF-Quittung anzeigen/herunterladen
    - Quittung per E-Mail senden (mit E-Mail-Eingabefeld)
    - Neuer Verkauf starten
    - Zurück zum Dashboard

### 5.4 Abschlüsse

#### 5.4.1 Tagesabschluss
- **Header**:
  - Datum des Abschlusses (mit Datumswähler für frühere Abschlüsse)
  - Status (Entwurf/Abgeschlossen)
  - "Abschließen"-Button (wenn im Entwurfsstatus)
- **Hauptbereich (70/30-Split)**:
  - **Links**: 
    - Chronologische Liste aller Transaktionen
    - Pro Transaktion: Uhrzeit, Betrag, Zahlungsart, Status
    - Filtermöglichkeiten
  - **Rechts**:
    - Zusammenfassung nach Zahlungsarten
    - Kassenbestandsberechnung
    - Beginnender Bestand / Endbestand
    - Differenz-Anzeige (farblich markiert)
- **Dialog: Tagesabschluss erstellen**:
  - Zusammenfassung des Tagesumsatzes
  - Eingabefeld für gezählten Bargeldbestand
  - Automatische Differenzberechnung
  - Notizfeld für Erklärungen bei Differenzen
  - Abbrechen/Bestätigen-Buttons

#### 5.4.2 Monatsabschluss
- **Header**:
  - Monatsauswahl (mit Dropdown)
  - Status (Entwurf/Abgeschlossen)
  - "Abschließen"-Button (wenn im Entwurfsstatus)
- **Statistik-Bereich**:
  - Monatsumsatz (mit Vormonatsvergleich)
  - Anzahl Transaktionen
  - Durchschnittlicher Tagesumsatz
- **Hauptbereich (70/30-Split)**:
  - **Links**: 
    - Tagesübersichtstabelle mit Tagesumsätzen
    - Heatmap zur Visualisierung von Umsatzschwankungen
  - **Rechts**:
    - Umsatzverteilung (Dienstleistungen/Produkte)
    - Zahlungsarten-Verteilung
    - Top-5-Services des Monats
- **Lieferantenrechnungen**:
  - Referenztabelle mit bezahlten Rechnungen des Monats
  - Summierung nach Kategorien/Lieferanten
- **Dialog: Monatsabschluss erstellen**:
  - Übersicht der abzuschließenden Daten
  - Warnhinweise für fehlende Tagesabschlüsse
  - Abbrechen/Bestätigen-Buttons

#### 5.4.3 Kassenbuch
- **Header**:
  - Datumsfilter
  - "+ Eintrag"-Button
  - Export-Button
- **Statistik-Grid (4-spaltig)**:
  - Heutiger Eingang
  - Heutiger Ausgang
  - Monatlicher Eingang
  - Monatlicher Ausgang
- **Haupttabelle**:
  - Datum/Uhrzeit
  - Beschreibung
  - Betrag (Ein-/Ausgang farblich differenziert)
  - Laufender Saldo
- **Dialog: Kassenbucheintrag erstellen**:
  - Typ-Auswahl (Einnahme/Ausgabe)
  - Betragsfeld
  - Beschreibungsfeld
  - Datumswähler
  - Abbrechen/Bestätigen-Buttons

### 5.5 Produkte
- **Header**:
  - Suchfeld
  - Filterleiste (Alle/Dienstleistungen/Produkte/Favoriten)
  - "+ Produkt"-Button
- **Tabelle**:
  - Name
  - Typ (Dienstleistung/Produkt)
  - Preis
  - Favorit (Toggle)
  - Status (Aktiv/Inaktiv)
  - Aktions-Buttons (Bearbeiten, Löschen)
- **Dialog: Produkt erstellen/bearbeiten**:
  - Formular mit:
    - Name
    - Typ-Auswahl (Dienstleistung/Produkt)
    - Preis
    - Beschreibung (optional)
    - Favorit-Toggle
    - Aktiv-Toggle
  - Abbrechen/Speichern-Buttons

### 5.6 Lieferantenrechnungen (Kreditoren)
- **Header**:
  - Suchfeld
  - Datumsfilter (Erstellungsdatum/Fälligkeitsdatum)
  - Status-Filter (Offen/Bezahlt)
  - "+ Lieferantenrechnung"-Button
  
- **Statistik-Bereich**:
  - Gesamtsumme offener Rechnungen
  - Fällige Rechnungen (rot hervorgehoben)
  - Rechnungen, die in den nächsten 7 Tagen fällig werden
  - Bezahlte Rechnungen des aktuellen Monats
  
- **Haupttabelle**:
  - Lieferant
  - Rechnungsnummer
  - Rechnungsdatum
  - Fälligkeitsdatum
  - Betrag
  - Status (farblich markiert)
  - Aktionen (Anzeigen, Bearbeiten, Als bezahlt markieren)
  
- **Dialog: Lieferantenrechnung erstellen/bearbeiten**:
  - Formular mit:
    - Lieferantenname (mit Autovervollständigung aus vorhandenen Lieferanten)
    - Rechnungsnummer
    - Betrag
    - Rechnungsdatum (Datepicker)
    - Fälligkeitsdatum (Datepicker)
    - Status-Dropdown (Offen/Bezahlt)
    - Bezahldatum (falls bezahlt)
    - Notizen
    - Dokument-Upload-Bereich (PDF)
  - Abbrechen/Speichern-Buttons
  
- **Dialog: Als bezahlt markieren**:
  - Aktuelles Datum vorausgefüllt
  - Möglichkeit, das Bezahldatum anzupassen
  - Notiz für zusätzliche Informationen
  - Abbrechen/Bestätigen-Buttons
  
- **Monatsansicht**:
  - Gruppierung aller Lieferantenrechnungen nach Monat
  - Summe pro Monat
  - Filterung nach Jahr/Monat
  - Export-Möglichkeit für Buchhaltungszwecke
  
- **Integration in Monatsabschluss**:
  - Automatische Einbeziehung bezahlter Kreditoren in den Monatsabschluss
  - Differenzierte Darstellung in Berichtsform
  - Summierung nach Lieferanten

### 5.7 Dokumente
- **Header**:
  - Suchfeld
  - Datumsfilter (Von-Bis)
  - Typ-Filter (Dropdown: Quittungen, Tagesabschlüsse, Monatsabschlüsse, Lieferantenrechnungen)
  - "+ Dokument"-Button
- **Tabelle**:
  - Dokumentenname
  - Typ-Icon
  - Erstellungsdatum
  - Betrag (falls zutreffend)
  - Zugehöriger Datensatz (z.B. Transaktions-ID, Rechnungsnummer)
  - Aktionen (Anzeigen, Herunterladen, Löschen)
- **Filter und Suche**:
  - Volltextsuche über Dokumentennamen und Metadaten
  - Erweiterte Filter für Dokumententypen
  - Datumsbereichsauswahl (letzte Woche, letzter Monat, benutzerdefiniert)
- **Dokumentenverwaltung**:
  - Direktes Öffnen/Vorschau der Dokumente
  - Möglichkeit zum Versenden per E-Mail
  - Batch-Download mehrerer Dokumente
  - Archivierungsfunktion für ältere Dokumente

### 5.8 Einstellungen
- **Tab-Navigation**:
  - Geschäftsdaten
  - Rechnungen & Dokumente
  - E-Mail & Benachrichtigungen
  - Backup & Export
- **Geschäftsdaten**:
  - Formular für:
    - Geschäftsname
    - Adresse (Straße, PLZ, Ort)
    - Kontaktdaten (Telefon, E-Mail)
    - UID-Nummer (optional)
- **Rechnungen & Dokumente**:
  - Logo-Upload
  - Toggle für Logo-Anzeige
  - Fußzeilentext für Rechnungen
  - Zusätzliche Informationen
  - Rechnungsvorlage-Auswahl
- **E-Mail & Benachrichtigungen**:
  - E-Mail-Einstellungen für Quittungsversand
  - Absender-E-Mail
  - Standard-Betreffzeile
  - Standard-Nachrichtentext
  - Platzhalter-Liste für dynamische Inhalte
- **Backup & Export**:
  - Manuelles Backup erstellen
  - Automatische Backup-Konfiguration
  - Datenexport-Optionen

### 5.9 Login
- Minimalistisches Design
- Logo/Titel des Salons oben
- Eingabefelder für:
  - Benutzername
  - Passwort
- "Angemeldet bleiben"-Checkbox
- Login-Button
- Fehlermeldungen bei ungültigen Credentials

## 6. API-Endpunkte und Datenmodelle

### 6.1 Auth API
```typescript
// Authentifizierung
POST /auth/login             // Login mit Benutzername & Passwort
POST /auth/logout            // Logout
GET  /auth/user              // Aktuellen Benutzer abrufen
```

### 6.2 POS API
```typescript
// Register-Management
POST /pos/register/open      // Kasse öffnen
POST /pos/register/close     // Kasse schließen
GET  /pos/register/status    // Kassenstatus abrufen

// Transaktion
POST /pos/transactions       // Neue Transaktion erstellen
GET  /pos/transactions/{id}  // Transaktion abrufen
GET  /pos/transactions       // Alle Transaktionen abfragen (mit Filtern)
PATCH /pos/transactions/{id}/void // Transaktion stornieren
POST /pos/receipts/{id}/send  // Quittung per E-Mail senden
```

### 6.3 Reports API
```typescript
// Tagesabschluss
POST /reports/daily/create    // Tagesabschluss erstellen
GET  /reports/daily/{date}    // Tagesabschluss abrufen
GET  /reports/daily/current   // Aktuellen Tagesabschluss abrufen
PATCH /reports/daily/{id}/close // Tagesabschluss abschließen

// Monatsabschluss
POST /reports/monthly/create  // Monatsabschluss erstellen
GET  /reports/monthly/{year}/{month} // Monatsabschluss abrufen
PATCH /reports/monthly/{id}/close // Monatsabschluss abschließen

// Kassenbuch
GET  /reports/cash-register    // Kassenbucheinträge abfragen
POST /reports/cash-register    // Kassenbucheintrag erstellen
```

### 6.4 Products API
```typescript
// Produkte & Dienstleistungen
GET  /products                // Alle Produkte abfragen
POST /products                // Produkt erstellen
PUT  /products/{id}           // Produkt aktualisieren
PATCH /products/{id}/toggle-active // Produkt aktivieren/deaktivieren
PATCH /products/{id}/toggle-favorite // Als Favorit markieren/demarkieren
```

### 6.5 Supplier Invoices API
```typescript
// Lieferantenrechnungen (Kreditoren)
GET  /supplier-invoices                // Alle Lieferantenrechnungen abfragen
POST /supplier-invoices                // Neue Lieferantenrechnung erstellen
GET  /supplier-invoices/{id}           // Lieferantenrechnung abrufen
PATCH /supplier-invoices/{id}          // Lieferantenrechnung aktualisieren
PATCH /supplier-invoices/{id}/pay      // Lieferantenrechnung als bezahlt markieren
GET  /supplier-invoices/statistics     // Statistiken über Lieferantenrechnungen
GET  /supplier-invoices/due            // Fällige Lieferantenrechnungen abrufen
GET  /supplier-invoices/month/{year}/{month} // Monatsübersicht für Lieferantenrechnungen
```

### 6.6 Documents API
```typescript
// Dokumente
GET  /documents               // Alle Dokumente abfragen
GET  /documents/{id}          // Dokument abrufen
GET  /documents/download/{id} // Dokument herunterladen
POST /documents/upload        // Dokument hochladen
GET  /documents/generate/{type}/{id} // Dokument generieren (PDF)
```

### 6.7 Settings API
```typescript
// Einstellungen
GET  /settings/business       // Geschäftsdaten abrufen
PUT  /settings/business       // Geschäftsdaten aktualisieren
GET  /settings/invoice        // Rechnungseinstellungen abrufen
PUT  /settings/invoice        // Rechnungseinstellungen aktualisieren
GET  /settings/email          // E-Mail-Einstellungen abrufen
PUT  /settings/email          // E-Mail-Einstellungen aktualisieren
POST /settings/backup/create  // Manuelles Backup erstellen
GET  /settings/backup/list    // Verfügbare Backups abrufen
```

### 6.8 Datenmodelle (TypeScript Interfaces)

```typescript
// Core Interfaces
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Item {
  id: string;
  name: string;
  default_price: number;
  type: 'service' | 'product';
  description?: string;
  is_favorite: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  total_amount: number;
  payment_method: 'cash' | 'twint' | 'sumup';
  status: 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  daily_report_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  items: TransactionItem[];
  user?: User;
}

interface TransactionItem {
  id: string;
  transaction_id: string;
  item_id: string;
  price: number;
  notes?: string;
  item?: Item;
}

interface DailyReport {
  id: string;
  date: string;
  cash_total: number;
  twint_total: number;
  sumup_total: number;
  starting_cash: number;
  ending_cash: number;
  status: 'draft' | 'closed';
  notes?: string;
  monthly_report_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  transactions?: Transaction[];
  cash_entries?: CashRegisterEntry[];
}

interface MonthlyReport {
  id: string;
  year: number;
  month: number;
  total_revenue: number;
  cash_total: number;
  twint_total: number;
  sumup_total: number;
  status: 'draft' | 'closed';
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  daily_reports?: DailyReport[];
}

interface CashRegisterEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  daily_report_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface SupplierInvoice {
  id: string;
  supplier_name: string;
  invoice_number: string;
  amount: number;
  invoice_date: string;
  due_date: string;
  status: 'pending' | 'paid';
  payment_date?: string;
  notes?: string;
  document_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  document?: Document;
}

interface Document {
  id: string;
  type: 'receipt' | 'daily_report' | 'monthly_report' | 'supplier_invoice';
  reference_id: string;
  file_path: string;
  user_id: string;
  created_at: string;
  metadata?: any;
}

interface BusinessSettings {
  id: string;
  business_name: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  contact_phone: string;
  contact_email: string;
  receipt_footer_text?: string;
  show_logo: boolean;
  additional_info?: string;
  updated_at: string;
}
```

## 7. Docker-Setup und Deployment

### 7.1 Docker-Compose Konfiguration

```yaml
version: '3.8'

services:
  # NextJS Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      - supabase
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=http://supabase:8000
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next

  # Supabase
  supabase:
    image: supabase/supabase-local
    restart: unless-stopped
    depends_on:
      - db
      - storage
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_URL=http://supabase:8000
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - POSTGRES_CONNECTION_STRING=postgres://postgres:${POSTGRES_PASSWORD}@db:5432/postgres

  # PostgreSQL Datenbank
  db:
    image: postgres:15
    restart: unless-stopped
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./supabase/init:/docker-entrypoint-initdb.d

  # Storage für Dokumente
  storage:
    image: minio/minio
    command: server /data --console-address ":9001"
    restart: unless-stopped
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    volumes:
      - minio-data:/data

  # NGINX Reverse Proxy
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
      - ./nginx/certbot/conf:/etc/letsencrypt
      - ./nginx/certbot/www:/var/www/certbot
    depends_on:
      - frontend
      - supabase
      - storage

  # Certbot für SSL
  certbot:
    image: certbot/certbot
    restart: unless-stopped
    volumes:
      - ./nginx/certbot/conf:/etc/letsencrypt
      - ./nginx/certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres-data:
  minio-data:
```

### 7.2 Deployment-Ablauf

1. **Vorbereitung**:
   - Repository klonen
   - `.env` Datei mit Umgebungsvariablen erstellen
   - Docker und docker-compose installieren

2. **Erste Einrichtung**:
   ```bash
   # Repository klonen
   git clone https://github.com/username/coiffeursalon-pos-nextjs.git
   cd coiffeursalon-pos-nextjs
   
   # .env Datei erstellen (aus .env.example)
   cp .env.example .env
   
   # Docker-Container starten
   docker-compose up -d
   
   # Datenbankmigrationen ausführen
   docker-compose exec frontend npm run migrate
   
   # Admin-Benutzer erstellen
   docker-compose exec frontend npm run create-admin
   ```

3. **Updates**:
   ```bash
   # Repository aktualisieren
   git pull
   
   # Container neu bauen und starten
   docker-compose build
   docker-compose up -d
   
   # Migrationen ausführen (falls notwendig)
   docker-compose exec frontend npm run migrate
   ```

4. **Backup**:
   ```bash
   # Datenbank-Backup erstellen
   docker-compose exec db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
   
   # Dokumente sichern
   docker-compose exec storage mc cp -r /data backup/
   ```

### 7.3 Infrastruktur-Anforderungen
- Mindestens 2GB RAM
- 20GB SSD-Speicher
- Linux-Server (Ubuntu 22.04 LTS empfohlen)
- Docker und docker-compose installiert
- Internet-Verbindung für Software-Updates
- Optional: Domain für SSL-Zertifikat

## 8. Komponenten-Bibliothek und UI-Design

### 8.1 Basis-Komponenten
Für eine konsistente und effiziente Entwicklung werden folgende Basis-Komponenten benötigt:

#### UI-Grundkomponenten
- Button (verschiedene Varianten und Größen)
- Input (Text, Number, Date, etc.)
- Select / Dropdown
- Modal / Dialog
- Table / DataGrid
- Toast / Notifications
- Tabs
- Card
- Badge

#### Funktionale Komponenten
- Authentifizierungs-Komponenten (Login-Formular)
- Suchfelder mit Filterung
- Warenkorb-Komponente
- Zahlungs-Dialog
- PDF-Viewer
- Statistik-Karten und -Diagramme

### 8.2 Komponenten-Implementierung
Bei der Implementierung der Komponenten sollen die modernen Features von NextJS und die Vorteile von Shadcn/UI genutzt werden:

1. **Server und Client Komponenten**: Richtige Aufteilung für optimale Performance
2. **Reusable Hooks**: Gemeinsame Logik in Custom Hooks auslagern
3. **Typensicherheit**: Strikte TypeScript-Definitionen für alle Props

### 8.3 Beispiel-Komponente: Button

```tsx
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 rounded-md",
        lg: "h-12 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

## 9. Testing und CI/CD

### 9.1 Testing-Strategie
- **Unit-Tests**: Für Kernfunktionen und Utility-Funktionen
- **Komponententests**: Für UI-Komponenten mit React Testing Library
- **Integration-Tests**: Für komplexe Workflows
- **End-to-End-Tests**: Für kritische Benutzerflows mit Playwright

### 9.2 Test-Setup
```typescript
// Beispiel für einen Komponententest
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

### 9.3 CI/CD-Pipeline
GitHub Actions oder GitLab CI für:
- Code-Linting
- Unit- und Komponententests
- Build-Prozess
- Deployment-Automatisierung
- Docker-Image-Building
- Automatisiertes Deployment

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run linter
        run: npm run lint
      - name: Run tests
        run: npm test
        
  build:
    needs: test
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build and push
        uses: docker/build-push-action@v3
        with:
          push: true
          tags: username/coiffeursalon-pos:latest
          
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /path/to/app
            docker-compose pull
            docker-compose up -d
```

## 10. Anforderungen an den Entwickler

### 10.1 Technische Fähigkeiten
- Erfahrung mit NextJS (App Router)
- TypeScript-Kenntnisse
- Tailwind CSS
- Supabase / PostgreSQL
- Docker / docker-compose
- React Hooks und moderne React-Patterns
- PDF-Generierung (React-PDF oder ähnliche Bibliotheken)

### 10.2 Entwicklungsprozess
- Regelmäßige Code-Reviews
- Klare Commit-Messages
- Komponentendokumentation
- Umfassende Tests
- CI/CD-Integration

### 10.3 Abnahmekriterien
- Vollständige Funktionalität gemäß Spezifikation
- Responsive Design für alle Viewports
- Zugänglichkeit (WCAG AA)
- Bestehen aller Tests
- Dokumentation für Weiterentwicklung

## 11. Externe Ressourcen
- [NextJS Dokumentation](https://nextjs.org/docs)
- [Supabase Dokumentation](https://supabase.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/UI Komponenten](https://ui.shadcn.com)
- [Docker-Compose Dokumentation](https://docs.docker.com/compose/)
