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

## 10. Production Deployment (Self-Hosted)

### 10.1 Überblick

Supabase kann kostenlos auf einem eigenen VPS selbst gehostet werden. Dies bietet:

- **Kostenvorteile**: Nur VPS-Kosten (ca. 10-30€/Monat) statt Supabase Cloud Pricing
- **Volle Kontrolle**: Keine Limits wie bei Supabase Cloud
- **DSGVO-Konformität**: Daten bleiben auf deutschem/europäischem Server
- **Skalierbarkeit**: Selbstbestimmte Ressourcenzuteilung

### 10.2 Server-Vorbereitung

#### VPS-Anforderungen
- **Minimum**: 2 CPU, 4GB RAM, 40GB SSD
- **Empfohlen**: 4 CPU, 8GB RAM, 80GB SSD
- **Provider**: Hetzner, DigitalOcean, Linode

#### Docker Installation
```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Docker installieren
sudo apt install docker.io docker-compose -y

# Docker-Service starten
sudo systemctl enable docker
sudo systemctl start docker

# Benutzer zur Docker-Gruppe hinzufügen
sudo usermod -aG docker $USER
```

### 10.3 Supabase Production Setup

#### Repository Setup
```bash
# Supabase Repository klonen
git clone https://github.com/supabase/supabase.git /opt/supabase
cd /opt/supabase/docker

# Backup der Original-Konfiguration
cp .env.example .env.backup
```

#### Sichere Umgebungsvariablen (.env)
```env
# ⚠️ WICHTIG: Alle Standard-Passwörter MÜSSEN geändert werden!

# Database
POSTGRES_PASSWORD=ihr_sehr_sicheres_db_passwort_2024!
POSTGRES_DB=postgres

# JWT Secret (mindestens 32 Zeichen)
JWT_SECRET=ihr-super-sicherer-jwt-token-mindestens-32-zeichen-lang-2024

# Site URL (Ihre Domain)
SITE_URL=https://ihre-domain.de
ADDITIONAL_REDIRECT_URLS=https://ihre-domain.de/auth/callback

# Dashboard Schutz
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=sehr_sicheres_dashboard_passwort_2024!

# SMTP Konfiguration (empfohlen: AWS SES oder TransMail)
SMTP_HOST=smtp.ihre-domain.de
SMTP_PORT=587
SMTP_USER=noreply@ihre-domain.de
SMTP_PASS=smtp_passwort
SMTP_SENDER_NAME="Ihr Firmenname"

# Optional: S3-kompatible Storage
# GLOBAL_S3_BUCKET=ihr-storage-bucket
# STORAGE_S3_ENDPOINT=https://s3.eu-central-1.amazonaws.com
# STORAGE_S3_ACCESS_KEY_ID=ihr_access_key
# STORAGE_S3_SECRET_ACCESS_KEY=ihr_secret_key
```

#### Datenpersistenz konfigurieren
```bash
# Volumes-Verzeichnis erstellen
sudo mkdir -p /opt/supabase/volumes/db/data
sudo chown -R 999:999 /opt/supabase/volumes/db/data

# In docker-compose.yml sicherstellen:
# volumes:
#   - ./volumes/db/data:/var/lib/postgresql/data
```

### 10.4 Reverse Proxy mit Nginx

#### Nginx Installation
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

#### Nginx Konfiguration
```nginx
# /etc/nginx/sites-available/supabase
server {
    listen 80;
    server_name api.ihre-domain.de;
    
    # SSL-Redirect
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.ihre-domain.de;
    
    # SSL-Zertifikat (wird von certbot automatisch hinzugefügt)
    
    # Supabase API
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket Support für Realtime
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Dashboard (optional, nur für Admin-Zugang)
    location /dashboard {
        proxy_pass http://localhost:8000/dashboard;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Zusätzlicher IP-Schutz (optional)
        # allow 192.168.1.0/24;  # Ihre IP-Range
        # deny all;
    }
}
```

#### SSL-Zertifikat einrichten
```bash
# Site aktivieren
sudo ln -s /etc/nginx/sites-available/supabase /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Let's Encrypt SSL-Zertifikat
sudo certbot --nginx -d api.ihre-domain.de
```

### 10.5 Deployment

#### Supabase starten
```bash
cd /opt/supabase/docker

# Container starten
sudo docker-compose up -d

# Status überprüfen
sudo docker-compose ps
sudo docker-compose logs -f
```

#### Gesundheitscheck
```bash
# API testen
curl https://api.ihre-domain.de/rest/v1/

# Dashboard (mit Basic Auth)
curl -u admin:ihr_passwort https://api.ihre-domain.de/dashboard
```

### 10.6 Backup-Strategie

#### Automatisches Datenbank-Backup
```bash
# Backup-Script erstellen: /opt/scripts/backup-supabase.sh
#!/bin/bash
BACKUP_DIR="/opt/backups/supabase"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Datenbank-Backup
docker exec supabase-db pg_dumpall -U postgres > $BACKUP_DIR/db_backup_$DATE.sql

# Volumes-Backup (optional)
tar -czf $BACKUP_DIR/volumes_backup_$DATE.tar.gz /opt/supabase/volumes/

# Alte Backups löschen (älter als 7 Tage)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

#### Cron-Job für automatische Backups
```bash
# Crontab bearbeiten
sudo crontab -e

# Täglich um 2:00 Uhr
0 2 * * * /opt/scripts/backup-supabase.sh
```

### 10.7 Monitoring und Logging

#### Container-Logs überwachen
```bash
# Alle Logs
sudo docker-compose logs -f

# Spezifische Services
sudo docker-compose logs -f supabase-db
sudo docker-compose logs -f supabase-kong
```

#### Systemd Service (optional)
```bash
# /etc/systemd/system/supabase.service
[Unit]
Description=Supabase Stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/supabase/docker
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

### 10.8 Updates

#### Supabase Updates
```bash
cd /opt/supabase
git pull origin master

cd docker
sudo docker-compose pull
sudo docker-compose up -d
```

### 10.9 Sicherheit

#### Firewall konfigurieren
```bash
# UFW aktivieren
sudo ufw enable

# Nur notwendige Ports öffnen
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Supabase-Ports nur lokal
sudo ufw deny 8000
sudo ufw deny 5432
```

#### Regelmäßige Sicherheitsupdates
```bash
# Automatische Updates aktivieren
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure unattended-upgrades
```

### 10.10 NextJS App Konfiguration

#### Production Environment Variables
```env
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://api.ihre-domain.de
NEXT_PUBLIC_SUPABASE_ANON_KEY=ihr_anon_key_aus_supabase_dashboard
SUPABASE_SERVICE_ROLE_KEY=ihr_service_role_key_aus_dashboard
```

### 10.11 Kosten-Vergleich

| Option | Monatliche Kosten | Vorteile |
|--------|------------------|----------|
| **Supabase Cloud** | Ab $25 + Pay-per-Use | Managed, Support, Auto-Backups |
| **Self-Hosted VPS** | €10-30 (VPS-Kosten) | Volle Kontrolle, keine Limits, DSGVO |

### 10.12 Troubleshooting Production

#### Häufige Probleme
- **502 Bad Gateway**: Supabase-Container prüfen (`docker-compose ps`)
- **SSL-Probleme**: Zertifikat erneuern (`certbot renew`)
- **DB-Verbindung**: Logs prüfen (`docker-compose logs supabase-db`)

#### Notfall-Recovery
```bash
# Container neustarten
sudo docker-compose restart

# Aus Backup wiederherstellen
cat /opt/backups/supabase/db_backup_DATUM.sql | sudo docker exec -i supabase-db psql -U postgres
```