# 📚 Dokumentation - Multi-Tenant Hair Salon POS

**Zentrale Dokumentation** für die Multi-Tenant SaaS Platform. Alle Dokumente sind jetzt **strukturiert und auf Deutsch** organisiert.

## 🎯 **Schnellstart**

| Bereich | Beschreibung | Wichtigste Dokumente |
|---------|--------------|---------------------|
| **🚀 Setup** | Entwicklung & Deployment | [`setup/setup_supabase.md`](setup/setup_supabase.md) |
| **💼 Business** | Konzepte & Features | [`business/konzept.md`](business/konzept.md) |
| **⚙️ Technical** | Architektur & Implementation | [`technical/SYSTEM_ANALYSIS_2025.md`](technical/SYSTEM_ANALYSIS_2025.md) |

## 📁 **Dokumentationsstruktur**

### **💼 Business & Konzepte** [`business/`](business/)
*Business-Logik, Schweizer Compliance und Feature-Konzepte*

- **[`konzept.md`](business/konzept.md)** - 🎯 **Hauptkonzept**: Schweizer Buchhaltungs-Workflows
- **[`buchhaltung_zukunftskonzept.md`](business/buchhaltung_zukunftskonzept.md)** - Strategische Langzeit-Vision
- **[`belegnummer-system.md`](business/belegnummer-system.md)** - Schweizer Belegnummerierung
- **[`BETRAGSDARSTELLUNG_KONZEPT.md`](business/BETRAGSDARSTELLUNG_KONZEPT.md)** - Betrags-Formatierung
- **[`owner_transactions.md`](business/owner_transactions.md)** - Owner-Eigenkapital-Transaktionen
- **[`MULTI_TENANT_IMPLEMENTATION_PLAN.md`](business/MULTI_TENANT_IMPLEMENTATION_PLAN.md)** - Multi-Tenant Architektur
- **[`ai_integration_konzept.md`](business/ai_integration_konzept.md)** - KI-Integration Zukunftsvision

### **⚙️ Technical & Implementation** [`technical/`](technical/)
*Architektur, Development und technische Details*

- **[`SYSTEM_ANALYSIS_2025.md`](technical/SYSTEM_ANALYSIS_2025.md)** - 🎯 **System-Status**: Ehrliche Bewertung
- **[`BANKING_MODULE_DEVELOPMENT.md`](technical/BANKING_MODULE_DEVELOPMENT.md)** - Banking-Integration Details  
- **[`banking_module_concept.md`](technical/banking_module_concept.md)** - Banking-Konzept (Deutsch)
- **[`MODULARE_ARCHITEKTUR_MIGRATION.md`](technical/MODULARE_ARCHITEKTUR_MIGRATION.md)** - Architektur-Migration
- **[`refactoring-cleanup-2025.md`](technical/refactoring-cleanup-2025.md)** - Code-Bereinigung
- **[`IMPLEMENTATION_STATUS.md`](technical/IMPLEMENTATION_STATUS.md)** - Implementation-Status

### **🚀 Setup & Development** [`setup/`](setup/)
*Entwicklungsumgebung und Deployment*

- **[`setup_supabase.md`](setup/setup_supabase.md)** - 🎯 **Gold-Standard**: 610 Zeilen Setup-Guide
  - Lokale Entwicklung mit Docker
  - Production Deployment (Self-Hosted Supabase)
  - Security & Backup-Strategien

### **✅ Abgeschlossene Tasks** [`abgeschlossene_tasks/`](abgeschlossene_tasks/)
*Dokumentierte, erledigte Entwicklungsaufgaben*

- **[`Business-Centric-Refactoring.md`](abgeschlossene_tasks/Business-Centric-Refactoring.md)** - Architektur-Umstellung
- **[`Import.md`](abgeschlossene_tasks/Import.md)** - Import-System Implementation  
- **[`refactor_styling.md`](abgeschlossene_tasks/refactor_styling.md)** - UI-Refactoring

### **📚 Archiv** [`archive/`](archive/)
*Archivierte Dokumentation (Debug, Legacy, Lessons Learned)*

- **[`debug/`](archive/debug/)** - Debug-Sessions und Test-Dokumentation
- **[`legacy/`](archive/legacy/)** - Legacy Code und veraltete Konzepte  
- **[`lessons/`](archive/lessons/)** - Lessons Learned und Over-Engineering Beispiele
- **[`optimization/`](archive/optimization/)** - Performance-Analysen

## 🔗 **Navigation nach Themen**

### **📖 Für neue Entwickler:**
1. **Start:** [`../README.md`](../README.md) - Projekt-Übersicht
2. **Setup:** [`setup/setup_supabase.md`](setup/setup_supabase.md) - Entwicklungsumgebung
3. **Konzept:** [`business/konzept.md`](business/konzept.md) - Business-Logik verstehen
4. **Architektur:** [`technical/SYSTEM_ANALYSIS_2025.md`](technical/SYSTEM_ANALYSIS_2025.md) - System-Status

### **🏢 Für Business-Stakeholder:**
1. **Vision:** [`business/buchhaltung_zukunftskonzept.md`](business/buchhaltung_zukunftskonzept.md) - Langzeit-Strategie
2. **Features:** [`business/konzept.md`](business/konzept.md) - Aktuelle Features
3. **Compliance:** [`business/belegnummer-system.md`](business/belegnummer-system.md) - Schweizer Standards
4. **Status:** [`../STATUS.md`](../STATUS.md) - Live-System Status

### **⚙️ Für DevOps/Deployment:**
1. **Setup:** [`setup/setup_supabase.md`](setup/setup_supabase.md) - Komplettes Setup
2. **Deployment:** [`../DEPLOYMENT.md`](../DEPLOYMENT.md) - Production Deployment
3. **Status:** [`../STATUS.md`](../STATUS.md) - Hetzner Live-System
4. **Checklist:** [`../PRE_DEPLOYMENT_CHECKLIST.md`](../PRE_DEPLOYMENT_CHECKLIST.md) - Go-Live

## 📊 **Live-System (Hetzner)**

Das System läuft bereits **live auf Hetzner** und wird aktiv getestet:

- **Server:** 167.235.150.94 (Hetzner Cloud VPS)  
- **Database:** https://db.lia-hair.ch ✅ **LIVE**
- **Status:** 🧪 **Currently Testing Multi-Tenant Workflows**

Siehe [`../STATUS.md`](../STATUS.md) für aktuellen Testing-Status.

## 🏗️ **Dokumentations-Prinzipien**

- **🇩🇪 Deutsch bevorzugt** - Konsistente Sprache für bessere Verständlichkeit
- **📂 Logische Struktur** - Business/Technical/Setup/Archive Trennung
- **🔗 Cross-References** - Verknüpfungen zwischen verwandten Dokumenten  
- **📱 Aktualität** - Veraltete Docs archiviert, nicht gelöscht
- **🎯 Navigation** - Dieser Master-Index als zentrale Anlaufstelle

## 🤝 **Beitragen zur Dokumentation**

**Neue Dokumentation:**
- **Business-Konzepte** → `docs/business/`
- **Technische Details** → `docs/technical/`  
- **Setup-Anleitungen** → `docs/setup/`

**Veraltete Dokumentation:**
- **Nicht löschen** → Nach `docs/archive/` verschieben
- **Begründung hinzufügen** im Commit

---

**📞 Support:** Für Fragen zur Dokumentation siehe [`../README.md`](../README.md) oder erstelle ein GitHub Issue.

**🔄 Letzte Aktualisierung:** Diese Dokumentationsstruktur wurde am 2025-01-20 vollständig reorganisiert und auf Deutsch vereinheitlicht.