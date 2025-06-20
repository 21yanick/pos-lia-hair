# Legacy Banking Code - Backup

**Date**: 2025-01-06  
**Migration**: Banking System Rebuild (06_banking_system_rebuild.sql)

## Backed Up Files

### Hooks
- `useBankReconciliation.ts` - Legacy session-based reconciliation system
- `useSettlementImport.ts` - Old TWINT/SumUp import logic

### Utils
- `settlementImport.ts` - Legacy file parsers (TWINT/SumUp/Bank)
- `testSettlementParsers.ts` - Old test data generation

### Components  
- `SettlementTestDataGenerator.tsx` - Legacy test data UI component

## Why Moved

These files implemented a **session-based banking reconciliation system** that was replaced by the new **provider-reports + bank-transactions system**.

### Old Architecture (Replaced)
```sql
bank_reconciliation_sessions (year, month, status)
bank_reconciliation_matches (bank_entry, match_type, confidence)
```

### New Architecture (Current)
```sql
bank_accounts (name, iban, current_balance)
bank_transactions (amount, description, status)
provider_reports (provider, gross_amount, fees, net_amount)
transaction_matches (bank_transaction_id, matched_type, matched_id)
```

## Key Differences

1. **Session-based** → **Continuous matching**
2. **Monthly reconciliation** → **Real-time status tracking**
3. **Complex confidence algorithms** → **Simple click-to-connect UX**
4. **JSON storage** → **Relational tables**

## Reusable Code

Some parsing logic from `settlementImport.ts` may be useful for the new file import services:

- TWINT CSV parsing patterns
- SumUp data extraction  
- Raiffeisen CAMT.053 XML parsing
- Date/amount validation logic

## Migration Notes

- Database tables `bank_reconciliation_*` were **dropped** in migration 06
- New banking UI uses completely different data structure
- File import formats remain the same (TWINT/SumUp CSV, Bank XML)
- Core business logic was reimplemented for simpler 2-tab UX