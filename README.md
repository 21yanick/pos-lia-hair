# POS-LIA-HAIR

Ein modernes Point-of-Sale (POS) System für den Schweizer Coiffeursalon "LIA Hair", entwickelt mit Next.js und Supabase.

![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-latest-3ECF8E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC)
![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-latest-000000)

## 📋 Funktionen

- 👤 Authentifizierung und Benutzerrechte
- 🧠 Intuitiver Verkaufsbildschirm für schnelle Transaktionen
- 💰 Kassenverwaltung mit Öffnen/Schließen-Funktionalität
- 📊 Tagesabschlüsse und Berichte
- 📝 Kassenbuch für Bargeldbewegungen
- 🏷️ Produkt- und Dienstleistungsverwaltung
- 📑 Lieferantenrechnungen (Kreditoren) Tracking
- 📄 Dokumentenverwaltung

## 🚀 Schnellstart

### Voraussetzungen

- Node.js 18+ und npm/pnpm
- Docker und docker-compose für die lokale Supabase-Instanz

### Installation

1. Repository klonen
   ```bash
   git clone https://github.com/yourusername/pos-lia-hair.git
   cd pos-lia-hair
   ```

2. Abhängigkeiten installieren
   ```bash
   pnpm install
   ```

3. Supabase lokal einrichten
   ```bash
   # Supabase-Repository im separaten Verzeichnis klonen
   mkdir -p supabase-local
   cd supabase-local
   git clone --depth 1 https://github.com/supabase/supabase .
   
   # In das Docker-Verzeichnis wechseln
   cd docker
   
   # Umgebungsvariablen konfigurieren
   cp .env.example .env
   
   # Docker-Compose starten
   docker-compose up -d
   ```

### Supabase starten und stoppen

- Supabase-Container stoppen (um Ports freizugeben):
  ```bash
  docker stop $(docker ps -q --filter "name=supabase")
  ```

- Supabase-Container wieder starten:
  ```bash
  cd /home/satoshi/projects/private/pos-lia-hair/supabase-local/docker
  docker-compose up -d
  ```

4. Umgebungsvariablen konfigurieren
   ```bash
   # In das Hauptverzeichnis zurückkehren
   cd /pfad/zu/pos-lia-hair
   
   # .env.local erstellen
   cp .env.example .env.local
   
   # Anpassen der Werte in .env.local
   ```

5. Datenbank initialisieren
   ```bash
   # Im Supabase Studio die Migrations ausführen
   # Öffne http://localhost:8000 und melde dich an
   # Gehe zu SQL Editor und führe die Migrations aus /supabase/migrations/ aus
   ```

6. Entwicklungsserver starten
   ```bash
   pnpm dev
   ```

7. Browser öffnen und zur Anwendung navigieren
   ```
   http://localhost:3000
   ```

## 🏗️ Projektstruktur

```
/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Geschützter Bereich
│   │   ├── dashboard/          # Dashboard-Seite
│   │   ├── documents/          # Dokumentenverwaltung
│   │   ├── pos/                # Kassensystem / Verkaufsbildschirm
│   │   ├── products/           # Produktverwaltung
│   │   ├── reports/            # Berichtsbereich
│   │   ├── settings/           # Einstellungen
│   │   └── supplier-invoices/  # Lieferantenrechnungen
│   ├── login/                  # Login-Seite
│   └── ...                     # Weitere Seiten
├── components/                 # UI-Komponenten
├── lib/                        # Hilfsfunktionen und Hooks
│   ├── hooks/                  # Custom React Hooks
│   ├── supabase/               # Supabase Client Konfiguration
│   └── utils.ts                # Allgemeine Hilfsfunktionen
├── supabase/                   # Supabase-Konfiguration
│   └── migrations/             # SQL-Migrations-Dateien
├── types/                      # TypeScript-Typendefinitionen
└── ...                         # Weitere Dateien
```

## 🛠️ Technologie-Stack

### Frontend
- **Framework**: Next.js 15.1.0 mit App Router
- **Sprache**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI-Komponenten**: Shadcn/UI (basierend auf Radix UI)
- **Formulare**: React Hook Form mit Zod
- **Icons**: Lucide React
- **Diagramme**: Recharts

### Backend
- **Datenbank**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **API**: Supabase API (RESTful)
- **Datensicherheit**: Row Level Security (RLS)

## 📄 Datenbankschema

Das System verwendet folgende Tabellen:

1. **users**: Benutzerinformationen und Rollen
2. **items**: Produkte und Dienstleistungen
3. **transactions**: Verkaufstransaktionen
4. **transaction_items**: Einzelposten innerhalb einer Transaktion
5. **daily_reports**: Tagesberichte
6. **monthly_reports**: Monatsberichte
7. **cash_register**: Kassenbucheinträge
8. **register_status**: Status der Kasse (offen/geschlossen)
9. **supplier_invoices**: Lieferantenrechnungen
10. **documents**: Dokumentenverwaltung
11. **business_settings**: Geschäftseinstellungen

Detaillierte Schemadefinitionen finden Sie in `/supabase/migrations/00_initial_schema.sql`.

## 🔄 Entwicklungsworkflow

1. **Kasse öffnen**: Täglicher Betrieb beginnt mit dem Öffnen der Kasse
2. **Verkäufe durchführen**: Erfassung von Produkten und Dienstleistungen
3. **Kassenbuchführung**: Verwaltung von Bargeldein- und -ausgängen
4. **Kasse schließen**: Tagesabschluss mit Bestandsabgleich
5. **Berichterstattung**: Auswertung der Tages- und Monatsdaten

## 🔐 Authentifizierung und Autorisierung

Das System verwendet Supabase Auth für die Authentifizierung und Row Level Security (RLS) für die Autorisierung. Benutzerrollen umfassen:

- **admin**: Vollzugriff auf alle Funktionen
- **staff**: Zugriff auf Verkauf und Grundfunktionen

## 📚 Dokumentation

Weitere Dokumentation finden Sie im `/docs`-Verzeichnis:

- [Verzeichnisstruktur](/docs/verzeichnisstruktur.md) - Detaillierte Projektübersicht
- [Supabase-Einrichtung](/docs/setup_supabase.md) - Anleitung zur Supabase-Konfiguration
- [Aktueller Stand](/docs/aktueller_stand.md) - Status der Implementierung
- [POS-Dokumentation](/docs/pos-doc.md) - Funktionelle Spezifikation

## 🤝 Mitwirken

Beiträge sind willkommen! Bitte folgen Sie dem typischen GitHub-Workflow:

1. Fork des Repositories
2. Feature-Branch erstellen (`git checkout -b feature/meine-funktion`)
3. Änderungen committen (`git commit -m 'Neue Funktion hinzugefügt'`)
4. Branch pushen (`git push origin feature/meine-funktion`)
5. Pull Request erstellen

## 📝 Lizenz

Dieses Projekt ist lizenziert unter der [MIT Lizenz](LICENSE).

## 🙏 Danksagungen

- [Next.js](https://nextjs.org/) für das Framework
- [Supabase](https://supabase.io/) für die Backend-Dienste
- [Shadcn/UI](https://ui.shadcn.com/) für die UI-Komponenten
- [Tailwind CSS](https://tailwindcss.com/) für das Styling-System