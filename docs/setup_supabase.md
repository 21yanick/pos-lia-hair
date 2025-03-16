# Supabase-Einrichtung für POS-LIA-HAIR

Diese Dokumentation beschreibt die vollständige Einrichtung der lokalen Supabase-Entwicklungsumgebung für das POS-LIA-HAIR Projekt.

## Überblick

Supabase ist eine Open-Source Firebase-Alternative, die folgende Dienste bietet:
- **PostgreSQL-Datenbank** mit Row-Level Security (RLS)
- **Authentifizierung** mit JWT-basierter Benutzerverwaltung
- **Storage** für Dateien und Dokumente
- **Realtime** für Echtzeit-Datensynchronisation
- **Edge Functions** für serverlose Funktionen
- **Supabase Studio** zur Datenbankverwaltung

## 1. Installation

### 1.1 Supabase lokal einrichten

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
```schau scha

### 1.2 Umgebungsvariablen für die Anwendung

Die Anwendung benötigt folgende Umgebungsvariablen in der `.env.local` Datei:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

# Supabase Auth-Konfiguration
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-change-me
```

**Wichtig:** Im Produktionseinsatz sollten diese Schlüssel mit sicheren Werten ersetzt werden.

## 2. Zugang zu Supabase

### 2.1 Supabase Studio

Supabase Studio ist die Weboberfläche für die Verwaltung der Datenbank und anderer Dienste:

- **URL:** http://localhost:8000
- **Benutzername:** supabase
- **Passwort:** this_password_is_insecure_and_should_be_updated

### 2.2 Verfügbare Dienste

Alle Dienste werden über den API-Gateway (Kong) auf Port 8000 verfügbar gemacht:

- **REST API:** http://localhost:8000/rest/v1/
- **Auth API:** http://localhost:8000/auth/v1/
- **Storage API:** http://localhost:8000/storage/v1/
- **Realtime API:** http://localhost:8000/realtime/v1/
- **Edge Functions:** http://localhost:8000/functions/v1/

### 2.3 Direkter Datenbankzugriff

Für direkten Zugriff auf die PostgreSQL-Datenbank:

```bash
# Mit der Datenbank verbinden
docker exec -it supabase-db psql -U postgres -d postgres
```

## 3. Datenbankschema und Migration

### 3.1 Schema einrichten

Das Datenbankschema kann manuell über Supabase Studio oder automatisch über Migrations-Skripte eingerichtet werden.

1. In Supabase Studio einloggen
2. "SQL Editor" auswählen
3. SQL aus der Datei `supabase/migrations/00_initial_schema.sql` ausführen

### 3.2 Row-Level Security (RLS)

Row-Level Security ist ein wichtiger Bestandteil der Supabase-Sicherheitsarchitektur. Die Standardkonfiguration:

```sql
-- Beispiel einer RLS-Policy
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leserechte für authentifizierte Benutzer" 
ON [table_name] FOR SELECT
TO authenticated
USING (true);
```

## 4. Supabase-Client in der Anwendung

### 4.1 Client-Konfiguration

Der Supabase-Client für Browser-Zugriff (`lib/supabase/client.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey
);
```

### 4.2 Server-Konfiguration

Server-seitiger Supabase-Client mit Cookie-basierter Authentifizierung (`lib/supabase/server.ts`):

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
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

export async function getServerClient() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  return { supabase, session };
}
```

### 4.3 Middleware für geschützte Routen

Die NextJS-Middleware für Authentifizierung (`middleware.ts`):

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
```

## 5. Verwendung in der Anwendung

### 5.1 Authentifizierung

```typescript
// Anmelden
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password'
});

// Abmelden
await supabase.auth.signOut();
```

### 5.2 Datenbankabfragen

```typescript
// Daten abrufen
const { data, error } = await supabase
  .from('items')
  .select('*')
  .eq('type', 'product');

// Eintrag erstellen
const { data, error } = await supabase
  .from('items')
  .insert([
    { name: 'Neues Produkt', default_price: 25.00, type: 'product' }
  ]);
```

### 5.3 Dateispeicher

```typescript
// Datei hochladen
const { data, error } = await supabase.storage
  .from('documents')
  .upload('path/to/file.pdf', fileData);

// Datei abrufen
const { data, error } = await supabase.storage
  .from('documents')
  .download('path/to/file.pdf');
```

## 6. Verwaltung und Wartung

### 6.1 Supabase Docker-Container verwalten

```bash
# Container-Status überprüfen
cd supabase-local/docker
docker-compose ps

# Container neustarten
docker-compose restart

# Container stoppen
docker-compose down

# Container mit Volumes entfernen (VORSICHT: Daten werden gelöscht)
docker-compose down -v
```

### 6.2 Datenbank-Backup

```bash
# Manuelles Backup der Datenbank erstellen
docker exec -t supabase-db pg_dumpall -c -U postgres > backup_$(date +%Y%m%d).sql

# Backup wiederherstellen
cat backup_file.sql | docker exec -i supabase-db psql -U postgres
```

## 7. Fehlerbehebung

### 7.1 Häufige Probleme

- **"auth.role() does not exist" Fehler**: Dies tritt auf, wenn RLS-Policies verwendet werden, bevor die Supabase-Auth-Erweiterungen installiert sind.
- **Verbindungsprobleme**: Überprüfe, ob alle Container laufen und die Ports korrekt zugeordnet sind.
- **Auth-Probleme**: Stelle sicher, dass die richtigen API-Keys in den Umgebungsvariablen gesetzt sind.

### 7.2 Logs überprüfen

```bash
# Logs anzeigen
docker-compose logs

# Container-spezifische Logs
docker-compose logs supabase-db
docker-compose logs supabase-auth
```

## 8. Nützliche Ressourcen

- [Offizielle Supabase-Dokumentation](https://supabase.io/docs)
- [Supabase JavaScript Client](https://supabase.io/docs/client/supabase-client)
- [NextJS mit Supabase](https://supabase.io/docs/guides/with-nextjs)
- [Row-Level Security](https://supabase.io/docs/guides/auth/row-level-security)
- [GitHub Repository](https://github.com/supabase/supabase)

## 9. Migrationsablauf

Um Änderungen am Datenbankschema vorzunehmen:

1. SQL-Migrations-Datei erstellen (z.B. `01_add_new_table.sql`)
2. Die Datei im Ordner `supabase/migrations` speichern
3. SQL im Supabase Studio oder direkt auf der Datenbank ausführen

Die Migrations-Dateien dienen auch als Dokumentation für Schemaänderungen und erleichtern die Reproduzierbarkeit der Entwicklungsumgebung.