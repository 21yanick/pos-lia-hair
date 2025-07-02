# Customer Transaction Features - Implementation Plan

## 🎯 Scope
- Customer display in transaction overview
- Nachträgliche Kundenzuordnung über Modal
- Nutzt bestehende Customer-Infrastructure

## 📋 Implementation Steps

### 1. Database Enhancement
```sql
-- File: supabase/migrations/33_add_customer_to_unified_transactions_view.sql
-- Erweitere unified_transactions_view um customer_id, customer_name für Sales
-- Nur Sales-Section betroffen (Expenses haben keine Kunden)
```

### 2. Type System Update
```typescript
// File: src/modules/transactions/types/unifiedTransactions.ts
interface UnifiedTransaction {
  // ... existing fields
  customer_id: string | null        // NEW
  customer_name: string | null      // NEW
}
```

### 3. Customer Assignment Service
```typescript
// File: src/modules/transactions/hooks/useTransactionCustomer.ts
- assignCustomerToTransaction(transactionId, customer, organizationId)
- Optimistic updates mit React Query
- Organization-scoped security
```

### 4. Customer Assignment Dialog
```tsx
// File: src/modules/transactions/components/CustomerAssignDialog.tsx
- Modal mit CustomerAutocomplete (existing component)
- Follows existing dialog patterns (wie ExpenseEditDialog)
- Mobile-optimized layout
```

### 5. UI Integration
```tsx
// File: src/modules/transactions/components/TransactionPage.tsx
- Customer Badge: {transaction.customer_name && <Badge>👤 {customer_name}</Badge>}
- "Kunde zuweisen" Button neben PDF-Actions
- Modal integration
```

## 🔧 Files to Modify
1. `supabase/migrations/33_*.sql` - DB View
2. `unifiedTransactions.ts` - Types
3. `TransactionPage.tsx` - UI Integration  
4. `CustomerAssignDialog.tsx` - NEW Component
5. `useTransactionCustomer.ts` - NEW Hook

## 🎨 UI Layout
```
[Transaction Card]
├── [Type Badge] [Receipt#] [PDF Action] [Customer Action] <- NEW
├── Description
├── [Customer Badge] [Amount] <- NEW
└── Date/Time
```

## ♻️ Reused Components
- ✅ CustomerAutocomplete (existing)
- ✅ customerService (existing)
- ✅ Modal patterns (existing)
- ✅ React Query patterns (existing)

## 🚀 Benefits
- Customer Namen in Transaction Overview
- Nachträgliche Kundenzuordnung möglich
- Textsuche findet Kunden automatisch
- Clean Integration mit bestehendem Code

## 📱 UX Flow
1. Transaction Overview zeigt Customer Badge (wenn vorhanden)
2. "👤" Button → CustomerAssignDialog öffnet
3. Customer auswählen/erstellen → Assignment speichern
4. Optimistic Update → sofortiges UI Feedback