# 🚀 Quick Start - Multi-Tenant Hair Salon POS

**Schnellstart-Anleitung** für die lokale Entwicklung. 

**💡 Live System:** Das System läuft bereits auf Hetzner (167.235.150.94) und wird aktiv getestet!

## ⚡ **Express Setup (5 Minuten)**

### **1. Repository klonen**
```bash
git clone https://github.com/yourusername/multi-tenant-pos.git
cd multi-tenant-pos
pnpm install
```

### **2. Supabase starten**
```bash
# Automatisches Setup (empfohlen)
./setup_fresh_db.sh

# ODER manuell (siehe docs/setup/setup_supabase.md für Details)
cd supabase-local/docker
docker-compose up -d
```

### **3. Environment konfigurieren**
```bash
cp .env.example .env.local
# .env.local bearbeiten mit lokalen Supabase-URLs
```

### **4. Development Server**
```bash
pnpm dev
# → http://localhost:3000
```

### **5. Erste Organisation erstellen**
1. **Registrieren:** http://localhost:3000/register
2. **Organisation erstellen:** http://localhost:3000/organizations/create  
3. **Salon einrichten:** http://localhost:3000/org/[ihr-slug]/settings

## 🎯 **Was du dann hast:**

- ✅ **Multi-Tenant POS System** mit eigenem Salon-Slug
- ✅ **Team Management** - Mitarbeiter mit Rollen einladen
- ✅ **Swiss POS** - Verkäufe mit TWINT/SumUp/Bar
- ✅ **Banking** - CAMT.053 Import für Zahlungsabgleichung
- ✅ **Business Management** - Ausgaben, Lieferanten, Reporting

## 📚 **Weitere Dokumentation:**

- **Detailliertes Setup:** [`docs/setup/setup_supabase.md`](docs/setup/setup_supabase.md) (610 Zeilen)
- **Dokumentation:** [`docs/README.md`](docs/README.md) - Komplette Dokumentations-Navigation
- **Production Deployment:** [`DEPLOYMENT.md`](DEPLOYMENT.md)
- **System Status:** [`STATUS.md`](STATUS.md)

## 🛠️ **Troubleshooting:**

**Supabase läuft nicht?**
```bash
cd supabase-local/docker
docker-compose ps  # Status checken
docker-compose up -d  # Neustarten
```

**App startet nicht?**
```bash
# Environment-Variablen prüfen
cat .env.local
# Sollte NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000 enthalten
```

**Datenbank leer?**
```bash
# Fresh Setup nochmal ausführen
./setup_fresh_db.sh
```

## 🔐 **Standard-Zugänge:**

- **Supabase Studio:** http://localhost:8000 (supabase / this_password_is_insecure_and_should_be_updated)
- **App:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health

## 🌍 **Live Environment (Hetzner):**

- **Live Database:** https://db.lia-hair.ch ✅ **AKTIV**
- **Server:** 167.235.150.94 (Hetzner Cloud VPS)
- **Status:** 🧪 **Currently Testing Multi-Tenant Workflows**

---

**🏢 Production Setup bereits deployed - siehe [`STATUS.md`](STATUS.md) für aktuellen Testing-Status**