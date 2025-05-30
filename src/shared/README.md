# 🏗️ Shared Infrastructure

Gemeinsame Infrastruktur für alle Module des POS/Buchhaltungssystems.

## 📁 Struktur

```
src/shared/
├── components/          # Gemeinsame UI Komponenten
│   ├── ui/             # Shadcn UI Komponenten (36 Komponenten)
│   ├── layout/         # Header, Sidebar, Layout Komponenten
│   ├── pdf/            # Shared PDF Komponenten
│   └── debug/          # Debug/Development Komponenten
├── hooks/              # Geteilte React Hooks
│   ├── core/           # Infrastruktur Hooks (useCashMovements, useMobile, useToast)
│   └── business/       # Business Hooks die von mehreren Modulen verwendet werden
├── services/           # Business Services
├── utils/              # Utility Funktionen
├── types/              # TypeScript Type Definitionen
├── lib/                # External Libraries Integration
│   └── supabase/       # Database Client/Server
└── config/             # Konfigurationsdateien
```

## 🔄 Migration Status
- [x] Phase 1: POS Module abgeschlossen
- [ ] Phase 2: Shared Infrastructure (in progress)
- [ ] Phase 3: Accounting Module
- [ ] Phase 4: Products/Documents Module

## 📋 Dependency Rules

✅ **Erlaubt:**
- modules/* → shared/* (Module dürfen shared verwenden)
- app/* → modules/* (App darf Module verwenden) 
- app/* → shared/* (App darf shared verwenden)

❌ **Verboten:**
- shared/* → modules/* (Shared darf NIEMALS Module importieren)
- modules/* → modules/* (Module sollen sich nicht gegenseitig importieren)

## 🎯 Ziel

Klare Trennung zwischen geteilter Infrastruktur und domain-spezifischen Modulen für bessere Wartbarkeit und Skalierbarkeit.