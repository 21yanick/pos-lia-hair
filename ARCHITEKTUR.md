# pos-lia-hair Architektur

**Multi-tenant POS-System mit React Query, Next.js 15, TypeScript & Supabase**

---

## Kern-Architektur-Pattern

### 4-Schichten-Architektur
```
┌─ Komponenten-Schicht  ─────────────┐  Nur UI, Props & JSX
├─ Hook-Schicht        ─────────────┤  React Query + Business Logic 
├─ Service-Schicht     ─────────────┤  Pure Functions + Validierung
└─ Datenbank-Schicht   ─────────────┘  Supabase + Generierte Types
```

### Feature-Modul-Struktur
```
src/modules/{feature}/
  ├── components/           # UI-Komponenten (< 400 Zeilen)
  │   ├── {Feature}Page.tsx        # Haupt-Seiten-Komponente 
  │   ├── {Feature}Dialog.tsx      # Modal-Komponenten
  │   ├── {Feature}Card.tsx        # Anzeige-Komponenten
  │   └── ...
  ├── hooks/                # React Query Hooks
  │   ├── use{Feature}Query.ts     # Daten-Fetching (useQuery)
  │   ├── use{Feature}Actions.ts   # CRUD-Operationen (useMutation)
  │   └── ...
  ├── services/            # Business Logic (in shared/services/)
  ├── types/               # Feature-spezifische Types
  └── utils/               # Feature-Utilities
```

---

## Etablierte Standards

### 1. Komponenten-Schicht Regeln
```typescript
// ✅ KORREKT: Nur UI, verwendet Hooks
export function CustomersPage() {
  const { data: customers } = useCustomersQuery(orgId)
  const { createCustomer } = useCustomerActions(orgId)
  
  return <div>{/* Nur JSX */}</div>
}

// ❌ FALSCH: Business Logic in Komponente
export function SchlechteSeite() {
  const [loading, setLoading] = useState(false)
  
  const handleSave = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('customers').insert({...})
    // Business Logic vermischt mit UI
  }
}
```

**Regeln:**
- **Max. Größe:** 400 Zeilen
- **Verantwortlichkeiten:** UI-Rendering, Event-Delegation
- **Keine direkten:** Supabase-Aufrufe, Business Logic, Validierung
- **Verwendet:** Nur Query-Hooks, Action-Hooks

### 2. Hook-Schicht Pattern

#### Query Hooks (Daten-Fetching)
```typescript
// Pattern: use{Entity}Query.ts
export const useCustomersQuery = (organizationId: string) => {
  return useQuery({
    queryKey: queryKeys.business.customers.list(organizationId),
    queryFn: () => getCustomers(organizationId),
    staleTime: 2 * 60 * 1000,
    enabled: !!organizationId,
  })
}
```

#### Action Hooks (CRUD-Operationen)  
```typescript
// Pattern: use{Entity}Actions.ts
export const useCustomerActions = (organizationId: string) => {
  const queryClient = useQueryClient()
  
  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) => createCustomer(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.customers.all(organizationId)
      })
    },
  })
  
  return { createCustomer: createMutation }
}
```

**Regeln:**
- **Query Hooks:** Nur Lese-Operationen
- **Action Hooks:** CRUD-Operationen mit optimistischen Updates
- **Max. Größe:** 200 Zeilen pro Hook
- **Immer:** Organisation-spezifisch, verwendet queryKeys
- **Beinhaltet:** Cache-Invalidierung, optimistische Updates, Error-Handling

### 3. Service-Schicht Pattern
```typescript
// Pattern: {entity}Service.ts in shared/services/
export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Omit<...>

export async function createCustomer(
  organizationId: string, 
  data: CustomerFormData
): Promise<CustomerMutationResult> {
  validateOrganizationId(organizationId)
  
  const { data: customer, error } = await supabase
    .from('customers')
    .insert({ ...data, organization_id: organizationId })
    .select()
    .single()
    
  if (error) return { success: false, error: error.message }
  return { success: true, data: customer }
}
```

**Regeln:**
- **Pure Functions:** Keine React-Hooks, keine Seiteneffekte
- **Multi-tenant:** Immer organizationId validieren 
- **Type-safe:** Generierte Database-Types verwenden
- **Error-Handling:** Result-Pattern mit success/error
- **Max. Größe:** 600 Zeilen pro Service

### 4. Type-System Standards
```typescript
// Datenbank-Types (Generiert)
export type Customer = Database['public']['Tables']['customers']['Row']

// Insert-Types (System-Felder ausschließen)
export type CustomerInsert = Omit<
  Database['public']['Tables']['customers']['Insert'],
  'id' | 'created_at' | 'updated_at'
>

// Update-Types (Partial + erforderliche ID)
export type CustomerUpdate = Partial<CustomerInsert> & { id: string }

// Form-Types (UI-spezifisch)
export type CustomerFormData = {
  name: string
  phone?: string
  email?: string
}

// Result-Types (Service-Schicht)
export type CustomerMutationResult = 
  | { success: true; data: Customer }
  | { success: false; error: string }
```

---

## Technische Stack-Standards

### React Query Konfiguration
```typescript
// Caching-Strategie
const cacheConfig = {
  customers: { staleTime: 2 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  products: { staleTime: 15 * 60 * 1000, gcTime: 30 * 60 * 1000 },
  sales: { staleTime: 30 * 1000, gcTime: 5 * 60 * 1000 },
}

// Query-Key-Struktur
const queryKeys = {
  business: {
    customers: {
      list: (orgId: string, filters?: object) => ['customers', orgId, 'list', filters],
      detail: (orgId: string, customerId: string) => ['customers', orgId, customerId],
    }
  }
}
```

### Multi-tenant Sicherheits-Pattern
```typescript
// Obligatorisch in allen Services
export function validateOrganizationId(organizationId: string | undefined): string {
  if (!organizationId) {
    throw new Error('Keine Organisation ausgewählt. Multi-Tenant Sicherheit verletzt.')
  }
  return organizationId
}

// Verwendung in jeder Service-Funktion
export async function getCustomers(organizationId: string) {
  validateOrganizationId(organizationId) // Immer erste Zeile
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('organization_id', organizationId) // Immer nach Organisation filtern
}
```

### Performance-Standards
- **Komponenten-Re-renders:** `useCallback` für Handler verwenden
- **Query-Optimierung:** Angemessene staleTime/gcTime setzen
- **Bundle-Größe:** Komponenten < 400 Zeilen, Services < 600 Zeilen
- **Optimistische Updates:** Für alle Mutation-Operationen

---

## Dateigrößen-Standards

### Durchgesetzte Grenzen
```
Komponenten-Dateien:  < 400 Zeilen    (UI-Komplexitäts-Management)
Hook-Dateien:         < 200 Zeilen    (Einzelne Verantwortlichkeit)  
Service-Dateien:      < 600 Zeilen    (Business Logic-Fokus)
Utility-Dateien:     < 300 Zeilen    (Hilfsfunktionen)
```

### Wenn Dateien Grenzen überschreiten:
1. **Nach Verantwortlichkeit aufteilen:** Custom Hooks extrahieren
2. **Nach Domain aufteilen:** In feature-spezifische Module verschieben
3. **Utilities extrahieren:** Geteilte Utility-Funktionen erstellen
4. **Komponenten-Komposition:** In kleinere Komponenten aufbrechen

---

## Modul-Organisation

### Shared-Schicht (`src/shared/`)
```
shared/
├── components/ui/          # shadcn/ui Komponenten
├── hooks/                  # Cross-Feature-Hooks
│   ├── auth/              # Authentifizierungs-Hooks
│   ├── business/          # Business Logic-Hooks  
│   └── core/              # Core-Utility-Hooks
├── services/              # Business Logic-Services
├── types/                 # Geteilte TypeScript-Types
└── utils/                 # Utility-Funktionen
```

### Modul-Schicht (`src/modules/`)
```
modules/
├── customers/             # Kundenverwaltung
├── products/              # Produkt-/Service-Katalog
├── pos/                   # Point-of-Sale Operationen
├── banking/               # Zahlungsabgleich
├── expenses/              # Ausgabenverwaltung
├── settings/              # Anwendungseinstellungen
└── organization/          # Multi-tenant Verwaltung
```

---

## Qualitäts-Standards

### Code-Qualitäts-Regeln
- **TypeScript:** Strict-Modus, keine `any` Types
- **Testing:** Services müssen Unit-getestet werden
- **Error-Handling:** Result-Pattern, keine geworfenen Exceptions in Services
- **Accessibility:** Alle Komponenten WCAG 2.1 AA konform
- **Performance:** Optimistische Updates, ordentliche Loading-States

### Dokumentations-Anforderungen
- **Services:** JSDoc für alle öffentlichen Funktionen
- **Types:** Exportierte Types müssen dokumentiert werden
- **Komponenten:** PropTypes oder TypeScript-Interfaces
- **Hooks:** Verwendungsbeispiele in Kommentaren

---

## Anti-Patterns zu vermeiden

### ❌ God-Komponenten
```typescript
// NICHT: 900+ Zeilen Komponenten mit vermischten Verantwortlichkeiten
export function MassiveImportComponent() {
  // File-Upload + Validierung + Transformation + UI = zu viel
}
```

### ❌ God-Classes/Services  
```typescript
// NICHT: Static-only Classes mit 20+ Methoden
export class CsvTransformer {
  static transformItems() {}
  static transformSales() {}
  static transformExpenses() {}
  // ... 15+ weitere Methoden
}
```

### ❌ Vermischte Verantwortlichkeiten
```typescript
// NICHT: Business Logic in Komponenten
export function SchlechteKomponente() {
  const handleSave = async () => {
    const { data } = await supabase.from('...').insert({...})
    // Supabase-Aufrufe gehören in Services
  }
}
```

---

## Migration-Strategie für Legacy-Code

Wenn Dateien gefunden werden, die diese Patterns verletzen:

1. **Pattern-Verletzungen identifizieren:** Größe, Verantwortlichkeiten, Struktur
2. **Extraktion planen:** Services → Hooks → Komponenten  
3. **API-Kompatibilität beibehalten:** Bestehende Verwendung nicht brechen
4. **Gründlich testen:** Funktionalitäts-Beibehaltung sicherstellen
5. **Inkrementell aktualisieren:** Kleine, fokussierte Änderungen

**Prioritäts-Reihenfolge:**
1. God Classes (> 1000 Zeilen) 
2. God Components (> 500 Zeilen)
3. Vermischte Verantwortlichkeiten (Business Logic in Komponenten)
4. Übergroße Services (> 800 Zeilen)

Diese Architektur stellt wartbaren, skalierbaren und performanten Code sicher, der etablierten React- und TypeScript-Best-Practices folgt.