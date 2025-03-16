# Projektdokumentation: POS-LIA-HAIR

## Übersicht

POS-LIA-HAIR ist ein modernes Point-of-Sale (POS) System für den Schweizer Coiffeursalon "LIA Hair". Das System bietet umfassende Funktionen für die Verwaltung des täglichen Betriebs eines Friseursalons, von der Durchführung von Verkaufstransaktionen über die Kassenverwaltung bis hin zur Berichterstattung und Dokumentenverwaltung.

## Technologiestack

### Frontend
- **Framework**: Next.js 15.1.0 mit App Router
- **Sprache**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI-Komponenten**: Shadcn/UI (basierend auf Radix UI)
- **Formulare**: React Hook Form mit Zod zur Validierung
- **Icons**: Lucide React
- **Diagramme**: Recharts

### Backend
- **Datenbank**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **API**: Supabase API (RESTful)
- **Datensicherheit**: Row Level Security (RLS)

## Projektstruktur

Die Anwendung verwendet den App Router von Next.js und folgt der neuesten Konvention für Verzeichnisstruktur und Routing.

```
/home/satoshi/projects/private/pos-lia-hair/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Geschützter Bereich (erfordert Login)
│   │   ├── dashboard/          # Dashboard-Seite
│   │   ├── documents/          # Dokumentenverwaltung
│   │   ├── layout.tsx          # Layout für den authentifizierten Bereich
│   │   ├── pos/                # Kassensystem / Verkaufsbildschirm
│   │   ├── products/           # Produktverwaltung
│   │   ├── reports/            # Berichtsbereich
│   │   │   ├── cash-register/  # Kassenbuch
│   │   │   ├── daily/          # Tagesberichte
│   │   │   └── monthly/        # Monatsberichte
│   │   ├── settings/           # Einstellungen
│   │   └── supplier-invoices/  # Lieferantenrechnungen
│   ├── globals.css             # Globale CSS-Definitionen
│   ├── layout.tsx              # Root-Layout
│   ├── login/                  # Login-Seite
│   └── page.tsx                # Startseite
├── components/                 # Wiederverwendbare Komponenten
│   ├── debug/                  # Debug-Komponenten
│   ├── layout/                 # Layout-Komponenten
│   ├── theme-provider.tsx      # Theme-Provider für Light/Dark-Modus
│   └── ui/                     # Shadcn/UI Komponenten
├── docs/                       # Projekdokumentation
├── hooks/                      # Alte hooks (wurden nach lib/hooks verschoben)
├── lib/                        # Bibliotheken und Hilfsfunktionen
│   ├── hooks/                  # Custom React Hooks
│   ├── supabase/               # Supabase Client Konfiguration
│   └── utils.ts                # Allgemeine Hilfsfunktionen
├── middleware.ts               # Next.js Middleware (für Auth)
├── public/                     # Statische Dateien
├── styles/                     # Zusätzliche Styles
├── supabase/                   # Supabase-Konfiguration und Migrationen
│   └── migrations/             # SQL-Migrations-Dateien
└── types/                      # TypeScript-Typendefinitionen
```

## Schlüsselkonzepte und Implementierungen

### 1. Authentifizierung und Autorisierung

Die Authentifizierung wird über Supabase Auth implementiert. Der Workflow umfasst:

1. **Login-Seite** (`app/login/page.tsx`): Benutzer geben E-Mail und Passwort ein.
2. **Middleware** (`middleware.ts`): Überprüft die Authentifizierung und leitet nicht eingeloggte Benutzer zur Login-Seite um.
3. **Supabase Auth Helpers**: Verwendung von `createMiddlewareClient` und `createServerClient` für serverseitige Authentifizierung.
4. **Automatische Benutzersynchronisierung**: Der Middleware synchronisiert Benutzer zwischen Supabase Auth und der `users`-Tabelle.
5. **Row Level Security (RLS)**: SQL-Policies steuern den Zugriff auf Datenbankebene basierend auf der Benutzerrolle.

### 2. Custom Hooks System

Das Projekt verwendet ein umfassendes System von React Custom Hooks, um die Geschäftslogik zu kapseln und die Datenbankinteraktion zu vereinfachen:

1. **useItems** (`lib/hooks/useItems.ts`): Verwaltung von Produkten und Dienstleistungen.
2. **useRegisterStatus**: Verwaltung der Kassenöffnung und -schließung.
3. **useCashRegister**: Verwaltung des Kassenbuchs.
4. **useDailyReports**: Verwaltung der Tagesberichte.
5. **useToast** (`lib/hooks/useToast.ts`): Toast-Benachrichtigungssystem.
6. **useMobile** (`lib/hooks/useMobile.tsx`): Responsive Design Unterstützung.

Diese Hooks bieten vollständige CRUD-Operationen, unterstützen Fehlerbehandlung, Ladezustände und lokales State-Management.

### 3. Layoutsystem

Das Layout-System nutzt die Next.js App Router-Funktionen:

1. **Root Layout** (`app/layout.tsx`): Setzt grundlegende HTML-Struktur, Theme-Provider und Toaster-Komponente.
2. **Auth Layout** (`app/(auth)/layout.tsx`): Layout für authentifizierte Bereiche mit Sidebar und Header.
3. **Sidebar** (`components/layout/sidebar.tsx`): Kollabierbare Navigationsleiste.
4. **Header** (`components/layout/header.tsx`): Kopfzeile mit Seitentitel und Benutzermenü.

### 4. Kassensystem und Geschäftsprozess

Der Hauptgeschäftsprozess umfasst:

1. **Kassenöffnung**: Über das Dashboard mit anfänglichem Bargeldbestand.
2. **Verkaufsabwicklung**: Im POS-Bereich mit Produktauswahl und Zahlungsabwicklung.
3. **Kassenbuchführung**: Automatische Erfassung von Bargeldtransaktionen.
4. **Kassenschließung**: Bestandsabgleich und Erfassung des Endbestands.
5. **Tagesabschluss**: Automatische Erstellung eines Tagesberichts.

### 5. Supabase und Datenbanksystem

Supabase ist eine Open-Source Firebase-Alternative, die verschiedene Dienste wie Datenbank, Authentifizierung, Storage und mehr bietet. Im POS-LIA-HAIR Projekt wird Supabase sowohl für die Backend-Logik als auch für die Benutzerverwaltung eingesetzt.

#### 5.1 Supabase-Architektur

Die Supabase-Infrastruktur besteht aus mehreren Komponenten:

1. **PostgreSQL**: Eine leistungsstarke relationale Datenbank
2. **PostgREST**: Automatische RESTful API für die Datenbank
3. **GoTrue**: JWT-basierter Authentifizierungsdienst
4. **Storage**: Objektspeicher für Dateien und Medien
5. **Edge Functions**: Serverlose Funktionen (ähnlich wie AWS Lambda)

Im Projekt wird Supabase lokal für die Entwicklung eingesetzt und kann später in der Cloud oder selbst gehostet betrieben werden.

#### 5.2 Lokale Entwicklungsumgebung

Die lokale Supabase-Umgebung wird mit Docker eingerichtet:

```bash
# Supabase-Repository klonen
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

Diese Container stellen die komplette Supabase-Infrastruktur auf Port 8000 zur Verfügung. Die Anwendung verbindet sich über den Supabase Client zu dieser lokalen Instanz.

#### 5.3 Supabase Client Konfiguration

Die Konfiguration des Supabase Clients erfolgt in zwei Dateien:

1. **`lib/supabase/client.ts`**: Client für Browseranfragen
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   import { Database } from '@/types/supabase';
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000';
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '...';
   
   export const supabase = createClient<Database>(
     supabaseUrl, 
     supabaseAnonKey
   );
   ```

2. **`lib/supabase/server.ts`**: Server-side Client mit Cookie-Handling
   ```typescript
   'use server';
   
   import { createServerClient } from '@supabase/ssr';
   import { cookies } from 'next/headers';
   import { Database } from '@/types/supabase';
   
   export async function createServerSupabaseClient() {
     const cookieStore = cookies();
     
     return createServerClient<Database>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get(name) { return cookieStore.get(name)?.value; },
           set(name, value, options) { cookieStore.set({ name, value, ...options }); },
           remove(name, options) { cookieStore.set({ name, value: '', ...options }); },
         },
       }
     );
   }
   ```

#### 5.4 Datenbank-Initialisierung und Migrations

Die Datenbankinitialisierung erfolgt über SQL-Migrations-Dateien im Verzeichnis `supabase/migrations/`:

1. **`00_initial_schema.sql`**: Enthält die Definition aller Tabellen und grundlegende RLS-Policies
2. **`01_auth_triggers.sql`**: Implementiert Trigger für die Synchronisierung zwischen auth.users und public.users

Diese Migrations-Dateien werden bei der Initialisierung der lokalen Supabase-Instanz ausgeführt oder können manuell im Supabase Studio ausgeführt werden.

#### 5.5 Datenbank-Schema

Die PostgreSQL-Datenbank umfasst folgende Haupttabellen:

1. **users**: Benutzerinformationen und Rollen.
2. **items**: Produkte und Dienstleistungen.
3. **transactions**: Verkaufstransaktionen.
4. **transaction_items**: Einzelposten innerhalb einer Transaktion.
5. **daily_reports**: Tagesberichte.
6. **monthly_reports**: Monatsberichte.
7. **cash_register**: Kassenbucheinträge.
8. **register_status**: Status der Kasse (offen/geschlossen).
9. **supplier_invoices**: Lieferantenrechnungen.
10. **documents**: Dokumentenverwaltung.
11. **business_settings**: Geschäftseinstellungen.

#### 5.6 TypeScript-Integration

Das Schema wird in TypeScript über die Datei `types/supabase.ts` abgebildet, die die Struktur der Datenbank als Typen definiert:

```typescript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: { /* Spalten für SELECT-Abfragen */ }
        Insert: { /* Spalten für INSERT-Operationen */ }
        Update: { /* Spalten für UPDATE-Operationen */ }
      },
      items: { 
        Row: { /* ... */ }
        Insert: { /* ... */ }
        Update: { /* ... */ }
      },
      // Weitere Tabellen...
    }
  }
}
```

Diese Typendefinitionen werden dann beim Supabase Client verwendet, um typsichere Datenbankabfragen zu ermöglichen:

```typescript
const { data, error } = await supabase
  .from('items')  // Client kennt diese Tabelle aus den Typdefinitionen
  .select('*')    // Rückgabewerte sind korrekt typisiert
```

#### 5.7 Row Level Security (RLS)

Ein wichtiger Sicherheitsaspekt von Supabase ist die Row Level Security, die auf Datenbankebene implementiert wird:

```sql
-- Beispiel für die items-Tabelle
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Nur authentifizierte Benutzer können items sehen
CREATE POLICY "Produkte sind für authentifizierte Benutzer lesbar" 
ON items FOR SELECT
TO authenticated
USING (true);

-- Nur Administratoren können items hinzufügen
CREATE POLICY "Nur Admins können Produkte einfügen" 
ON items FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
));
```

Diese Policies werden beim Erstellen der Datenbank automatisch angewendet und stellen sicher, dass Benutzer nur auf die Daten zugreifen können, für die sie berechtigt sind.

#### 5.8 Zugriff auf Supabase Studio

Für die Administration der Datenbank ist Supabase Studio über http://localhost:8000 erreichbar:

- **Datenbank-Editor**: Zum manuellen Bearbeiten von Tabellen und Ausführen von SQL-Abfragen
- **Authentifizierung**: Verwaltung von Benutzern und Authentifizierungseinstellungen
- **Storage**: Verwaltung von Dateien und Ordnern
- **API-Dokumentation**: Automatisch generierte API-Dokumentation

#### 5.9 Typische Datenbankoperationen

Hier einige Beispiele für typische Datenbankoperationen mit dem Supabase Client:

```typescript
// Daten abrufen
const { data, error } = await supabase
  .from('items')
  .select('*')
  .eq('type', 'service');

// Daten einfügen
const { data, error } = await supabase
  .from('items')
  .insert({
    name: 'Haarschnitt',
    type: 'service',
    default_price: 45.00
  })
  .select()
  .single();

// Daten aktualisieren
const { data, error } = await supabase
  .from('items')
  .update({ default_price: 50.00 })
  .eq('id', itemId)
  .select()
  .single();

// Daten löschen
const { error } = await supabase
  .from('items')
  .delete()
  .eq('id', itemId);
```

## Umgesetzte Funktionalitäten

### ✅ Vollständig implementiert

1. **Authentifizierung**:
   - Login/Logout-Funktionalität
   - Middleware zur Authentifizierungsprüfung
   - Benutzersynchronisierung zwischen Auth und Datenbank

2. **Produktverwaltung**:
   - CRUD-Operationen für Produkte/Dienstleistungen
   - Favoriten und Aktivierung/Deaktivierung
   - Filterung und Suche

3. **Dashboard**:
   - Kassenstatus-Anzeige und -Verwaltung
   - Schnellzugriff auf wichtige Funktionen
   - Tagesstatistiken

4. **Kassensystem**:
   - Kasse öffnen/schließen mit Bestandsprüfung
   - Bargeldbestandsverwaltung
   - Soll/Ist-Vergleich der Bargeldbestände

5. **Verkaufsabwicklung**:
   - Produktauswahl und Warenkorb
   - Zahlungsabwicklung mit verschiedenen Methoden (Bar, Twint, SumUp)
   - Transaktionsaufzeichnung

6. **Kassenbuch**:
   - Ein- und Ausgänge verwalten
   - Automatische Berechnung des laufenden Saldos
   - Suche und Filterung

7. **Tagesberichte**:
   - Automatische Erstellung beim Kassenschließen
   - Zusammenfassung nach Zahlungsarten
   - Tagesumsatzberechnung

### ⏳ Teilweise implementiert oder in Arbeit

1. **Monatsberichte**:
   - Grundstruktur vorhanden, aber noch nicht vollständig

2. **Lieferantenrechnungen**:
   - Grundstruktur vorhanden, aber noch nicht vollständig

3. **Dokumentenverwaltung**:
   - Grundstruktur vorhanden, aber noch nicht vollständig

### ❌ Noch nicht implementiert

1. **PDF-Generierung** für Quittungen und Berichte
2. **E-Mail-Versand** für Dokumente
3. **Erweiterte Benutzerrollen und -verwaltung**
4. **Erweiterte Diagramme und Visualisierungen**
5. **Deployment und Produktionsumgebung**

## UI-Komponenten

Das Projekt nutzt Shadcn/UI, eine Sammlung von wiederverwendbaren Komponenten basierend auf Radix UI:

1. **Layout-Komponenten**: Sidebar, Header, Card
2. **Form-Komponenten**: Input, Select, Button, Checkbox, Switch
3. **Feedback-Komponenten**: Toast, Dialog, Alert
4. **Daten-Komponenten**: Table, Tabs, Dropdown
5. **Utility-Komponenten**: Badge, Avatar, Skeleton

Diese sind im `components/ui/`-Verzeichnis definiert und können überall in der Anwendung verwendet werden.

## Hook-System im Detail

### useItems.ts

Dieser Hook verwaltet die Produktdaten:

```typescript
export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Laden aller Items mit automatischer Synchronisierung
  useEffect(() => { ... });

  // CRUD-Funktionen
  const addItem = async (newItem: ItemInsert) => { ... };
  const updateItem = async (updatedItem: ItemUpdate) => { ... };
  const toggleFavorite = async (id: string, currentValue: boolean) => { ... };
  const toggleActive = async (id: string, currentValue: boolean) => { ... };
  const deleteItem = async (id: string) => { ... };
  const syncAuthUser = async () => { ... };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    toggleFavorite,
    toggleActive,
    deleteItem,
    syncAuthUser
  };
}
```

Dieser Pattern wird für alle Datenoperationen verwendet, wobei jeder Hook:
- Lokalen State mit useState verwaltet
- Daten beim ersten Rendering lädt
- CRUD-Funktionen exponiert
- Lade- und Fehlerzustände nachverfolgt

## Middleware und Authentifizierung

Die Middleware (`middleware.ts`) ist ein kritischer Teil des Systems:

```typescript
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Wenn nicht eingeloggt und Zugriff auf geschützte Route versucht wird
  if (!session && req.nextUrl.pathname.startsWith('/(auth)')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Benutzersynchronisierung
  if (session && req.nextUrl.pathname.startsWith('/(auth)')) {
    try {
      // Prüfen, ob der Benutzer in der users-Tabelle existiert
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single();

      // Benutzer erstellen, wenn nicht vorhanden
      if (userError && userError.code === 'PGRST116') {
        await supabase
          .from('users')
          .insert({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email,
            username: session.user.email.split('@')[0],
            email: session.user.email,
            role: 'admin',
            active: true
          });
      }
    } catch (err) {
      console.error('Middleware: Fehler bei der Benutzersynchronisierung:', err);
    }
  }

  return res;
}
```

Dies ermöglicht:
1. Authentifizierungsprüfung für geschützte Routen
2. Automatische Umleitung zur Login-Seite
3. Automatische Benutzersynchronisierung zwischen Auth- und users-Tabelle

## Stärken des Projekts

1. **Moderne Technologiestack**: Verwendung aktueller Technologien wie Next.js 15, TypeScript und Supabase.
2. **Gut organisierte Codebasis**: Klare Verzeichnisstruktur und Separation of Concerns.
3. **Custom Hooks System**: Wiederverwendbare, gut modulare Logik.
4. **Vollständiger Geschäftsprozess**: Kompletter Workflow für den Salon-Betrieb.
5. **TypeScript-Typsicherheit**: Umfassende Typdefinitionen für die Datenbank und Komponenten.
6. **Responsive Design**: Anpassung an verschiedene Bildschirmgrößen.
7. **Skalierbare Architektur**: Klare Trennung von Daten, Logik und UI.

## Verbesserungspotential

1. **Weitere Tests**: Hinzufügen von Unit-, Integration- und E2E-Tests.
2. **State Management**: Einführung eines zentralisierten State Management wie Zustand für komplexere Zustandslogik.
3. **Weitere Dokumentation**: Hinzufügen von JSDoc-Kommentaren und API-Dokumentation.
4. **Performance-Optimierungen**: Einführung von React Query für besseres Caching und Datenaktualisierung.
5. **Fehlerbehandlung**: Implementierung globaler Fehlerbehandlung mit Error Boundaries.
6. **Internationalisierung**: Unterstützung für mehrere Sprachen.
7. **Zugänglichkeit**: Verbesserte ARIA-Unterstützung und Keyboard-Navigation.

## Supabase Wartung und Entwicklung

### Datenbank-Backups

Für die Sicherung der Datenbank bietet Supabase mehrere Möglichkeiten:

```bash
# Manuelles Backup der Postgres-Datenbank erstellen
docker exec -t supabase-db pg_dumpall -c -U postgres > backup_$(date +%Y%m%d).sql

# Backup wiederherstellen
cat backup_file.sql | docker exec -i supabase-db psql -U postgres
```

### Erweitern des Schemas

Wenn das Datenbankschema erweitert werden muss, sollte dies immer über neue Migrations-Dateien erfolgen:

1. Erstellen einer neuen Migrations-Datei wie `02_add_new_features.sql`
2. Implementieren der Änderungen (neue Tabellen, Spalten, etc.)
3. Ausführen der Migration auf der Datenbank:
   
   ```sql
   -- Beispiel: Hinzufügen einer neuen Spalte
   ALTER TABLE items ADD COLUMN category TEXT;
   
   -- Beispiel: Erstellen eines neuen Index
   CREATE INDEX idx_items_category ON items(category);
   
   -- Beispiel: Neue RLS-Policy
   CREATE POLICY "Policy-Name" ON tabelle FOR operation USING (Bedingung);
   ```

4. Aktualisieren der TypeScript-Typendefinitionen in `types/supabase.ts`

### Debugging und Troubleshooting

Bei Problemen mit Supabase können folgende Schritte helfen:

1. **Logs der Supabase-Container**:
   ```bash
   docker-compose logs supabase-db
   docker-compose logs supabase-auth
   docker-compose logs supabase-rest
   ```

2. **Direkter Datenbankzugriff für Debugging**:
   ```bash
   docker exec -it supabase-db psql -U postgres -d postgres
   ```

3. **Häufige Probleme**:
   - "auth.role() does not exist" - RLS-Fehler bei fehlender Auth-Konfiguration
   - Verbindungsprobleme - Port-Mappings und Umgebungsvariablen prüfen
   - Auth-Fehler - API-Keys und JWT-Konfiguration überprüfen

### Production-Deployment

Für die Produktionsumgebung gibt es zwei Hauptoptionen:

1. **Supabase Cloud**: Verwaltete Plattform mit einfacher Setup-Erfahrung
   - Migrations über die UI oder CLI anwenden
   - Automatische Backups und Skalierung

2. **Self-Hosting**: Eigenes Hosting der Supabase-Stack
   - Docker-Compose für einfachere Setups
   - Kubernetes für größere Installationen
   - Benötigt eigene Backup- und Monitoring-Lösungen

## Schlussfolgerung

Das POS-LIA-HAIR Projekt ist eine gut strukturierte, moderne Webanwendung, die auf bewährten Technologien und Designmustern basiert. Die Anwendung bietet einen vollständigen Geschäftsprozess für einen Friseursalon, mit Schwerpunkt auf Benutzerfreundlichkeit und Effizienz.

Die Kombination aus Next.js App Router, TypeScript, Tailwind CSS und Supabase bietet eine robuste Grundlage für ein zukunftssicheres System. Die klare Strukturierung des Codes, die umfassenden Custom Hooks und die durchdachte UI machen das Projekt für weitere Entwicklungen gut skalierbar.

Besonders hervorzuheben ist die Integration von Supabase, die eine moderne Backend-Lösung bietet, ohne dass ein traditioneller Server aufgesetzt werden muss. Die Kombination aus PostgreSQL, automatisch generierter RESTful API und sicherer Authentifizierung ermöglicht eine schnelle Entwicklung bei gleichzeitig hoher Sicherheit.

Die begonnene Implementierung deckt bereits die Kernfunktionalitäten ab, während einige fortgeschrittene Features wie PDF-Generierung, E-Mail-Versand und erweiterte Berichte noch Raum für zukünftige Erweiterungen bieten.