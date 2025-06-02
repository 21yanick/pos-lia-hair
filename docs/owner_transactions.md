# Owner Transactions - Saubere Implementation

**Status**: ✅ COMPLETED & DEPLOYED  
**Ziel**: Vollständige Owner-Eigenkapital-Transaktionen für Swiss Banking Compliance

## Problem Statement

**Aktuelle Situation**: POS-System trackt nur Business Cash Flow  
**Fehlende Funktionalität**: Owner Private ↔ Business Transaktionen

### Vollständige Use Cases

#### **💰 Geld IN das Geschäft (Owner → Business)**
1. **Bank Transfer**: Privatkonto → Geschäftskonto (5000 CHF)
2. **Cash Einlage**: Private Münzen → Geschäftskasse (200 CHF) 
3. **Private Geschäftsausgabe**: Private Karte zahlt Geschäftsrechnung (150 CHF Föhn)

#### **💸 Geld AUS dem Geschäft (Business → Owner)**
4. **Owner Entnahme**: Geschäftskonto → Privatkonto (1000 CHF)
5. **Cash Entnahme**: Geschäftskasse → Owner privat (300 CHF)

## Saubere Solution: Owner Transactions Tabelle

### **🎯 Strategie: Dedizierte Owner Tabelle mit Smart Integration**

**Warum sauberer?**
- ✅ Clean Data Model für Owner Transactions
- ✅ Zentrale Owner Transaction History & Audit Trail
- ✅ Smart Integration in bestehende Banking/Cash Module
- ✅ Future-Proof für Swiss Accounting Export

### **💎 Database Schema:**

```sql
-- Migration: 13_owner_transactions.sql
CREATE TABLE owner_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction Details
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'expense', 'withdrawal')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0), -- Always positive, type determines direction
    description TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('bank_transfer', 'private_card', 'private_cash')),
    
    -- Smart Banking Integration
    related_expense_id UUID REFERENCES expenses(id), -- Link zu bezahlter Expense
    related_bank_transaction_id UUID REFERENCES bank_transactions(id), -- Link zu Bank Transaction
    banking_status VARCHAR(20) DEFAULT 'unmatched' CHECK (banking_status IN ('unmatched', 'matched')),
    
    -- Metadata
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);
```

### **🔄 Transaction Types & Payment Methods:**

| **Transaction Type** | **Beschreibung** | **Amount Direction** |
|---------------------|------------------|---------------------|
| `deposit` | Privatgeld ins Geschäft | +Positive (Geld ins Business) |
| `expense` | Private Zahlung für Geschäft | +Positive (Owner gab Geld aus) |
| `withdrawal` | Geld zurück an Owner | +Positive (wird als -Negative gerechnet) |

| **Payment Method** | **Beschreibung** | **Integration** |
|-------------------|------------------|-----------------|
| `bank_transfer` | Privatkonto ↔ Geschäftskonto | Banking Tab 2 Matching |
| `private_card` | Private Debit/Kreditkarte | Standalone Owner Record |
| `private_cash` | Privates Bargeld | Optional Cash Register Integration |

### **🔄 Owner Balance Calculation - Clean & Simple:**
```sql
CREATE OR REPLACE FUNCTION get_owner_loan_balance(user_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_deposits DECIMAL(10,2) := 0;
    total_expenses DECIMAL(10,2) := 0;
    total_withdrawals DECIMAL(10,2) := 0;
BEGIN
    -- Owner Einlagen (Geld ins Geschäft)
    SELECT COALESCE(SUM(amount), 0) INTO total_deposits
    FROM owner_transactions 
    WHERE user_id = user_uuid AND transaction_type = 'deposit';
    
    -- Owner private Ausgaben (Owner zahlte für Business)
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses
    FROM owner_transactions 
    WHERE user_id = user_uuid AND transaction_type = 'expense';
    
    -- Owner Entnahmen (Geld raus aus Business)
    SELECT COALESCE(SUM(amount), 0) INTO total_withdrawals
    FROM owner_transactions 
    WHERE user_id = user_uuid AND transaction_type = 'withdrawal';
    
    -- Positive = Business schuldet Owner Geld
    -- Negative = Owner schuldet Business Geld
    RETURN (total_deposits + total_expenses - total_withdrawals);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

### **📊 Owner Balance Dashboard:**
```
┌─────────────────────────────────────┐
│ Owner Darlehen: +1,450.00 CHF      │
├─────────────────────────────────────┤
│ ✅ Einlagen:      +5,200.00 CHF    │
│ ✅ Private Ausg.: +  650.00 CHF    │
│ ❌ Entnahmen:     -4,400.00 CHF    │
└─────────────────────────────────────┘
```

## **🎨 Elegante UX Integration**

### **Owner Transaction Buttons (in Banking Module)**
```typescript
<div className="flex gap-2">
  {/* Bestehende Cash Transfer Buttons */}
  <Button onClick={() => openCashTransferDialog('to_bank')}>
    Geld in Bank einzahlen
  </Button>
  <Button onClick={() => openCashTransferDialog('from_bank')}>
    Geld von Bank abheben
  </Button>
  
  {/* Neue Owner Transaction Buttons */}
  <Button 
    variant="outline" 
    className="border-blue-500 text-blue-600"
    onClick={() => openOwnerTransactionDialog('deposit')}
  >
    💰 Owner Einlage
  </Button>
  <Button 
    variant="outline" 
    className="border-red-500 text-red-600"
    onClick={() => openOwnerTransactionDialog('withdrawal')}
  >
    💸 Owner Entnahme
  </Button>
</div>
```

### **Smart Owner Transaction Dialog:**
```typescript
<OwnerTransactionDialog 
  isOpen={ownerDialogOpen} 
  transactionType="deposit" // oder "withdrawal"
  onClose={closeOwnerDialog}
  onSuccess={handleOwnerTransactionSuccess}
>
  {/* Context-Aware basierend auf transactionType */}
  <Select name="payment_method">
    <option value="bank_transfer">Bank Transfer</option>
    <option value="private_card">Private Karte</option>
    <option value="private_cash">Privates Bargeld</option>
  </Select>
  
  <Input type="number" placeholder="5000.00" name="amount" />
  <Input placeholder="Beschreibung: Startkapital Einlage" name="description" />
  <Input type="date" name="transaction_date" />
  
  {/* Conditional: Wenn expense payment */}
  {transactionType === 'expense' && (
    <ExpenseSelector 
      label="Welche Ausgabe wurde privat bezahlt?"
      onSelect={setRelatedExpenseId}
    />
  )}
</OwnerTransactionDialog>
```

### **Owner Balance Card (neben Bank Balance):**
```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  {/* Bank Balance Card */}
  <Card>
    <CardContent className="p-6">
      <div className="text-3xl font-bold text-green-600">
        {bankAccount.current_balance.toFixed(2)} CHF
      </div>
      <p className="text-sm text-muted-foreground">
        Raiffeisen Bank Balance
      </p>
    </CardContent>
  </Card>

  {/* Owner Balance Card */}
  <Card>
    <CardContent className="p-6">
      <div className="text-3xl font-bold text-blue-600">
        {ownerBalance > 0 ? '+' : ''}{ownerBalance.toFixed(2)} CHF
      </div>
      <p className="text-sm text-muted-foreground">
        Owner Darlehen 
        {ownerBalance > 0 ? '(Business schuldet Owner)' : '(Owner schuldet Business)'}
      </p>
    </CardContent>
  </Card>
</div>
```

## **🚀 Implementation Status - COMPLETED**

### **✅ Phase 1: Database Migration (DEPLOYED)**
```sql
-- Migration: 13_owner_transactions.sql
-- Status: EXECUTED & DEPLOYED
-- ✅ owner_transactions Tabelle mit allen Constraints
-- ✅ Banking Integration in available_for_bank_matching View
-- ✅ Owner Balance Calculation Function get_owner_loan_balance()
-- ✅ RLS Policies und Performance Indexes
-- ✅ Berechtigungen für authenticated role gesetzt
```

### **✅ Phase 2: TypeScript Types (COMPLETED)**
```typescript
// src/modules/banking/types/banking.ts - IMPLEMENTIERT
export interface OwnerTransactionRow {
  id: string
  transaction_type: 'deposit' | 'expense' | 'withdrawal'
  amount: number
  description: string
  transaction_date: string
  payment_method: 'bank_transfer' | 'private_card' | 'private_cash'
  related_expense_id?: string
  related_bank_transaction_id?: string
  banking_status: 'unmatched' | 'matched'
  user_id: string
  created_at: string
  notes?: string
}

export interface OwnerBalance {
  total_deposits: number
  total_expenses: number  
  total_withdrawals: number
  net_balance: number // Positive = Business owes Owner
}
```

### **✅ Phase 3: API Services (COMPLETED)**
```typescript
// src/modules/banking/services/ownerTransactionsApi.ts - IMPLEMENTIERT
✅ createOwnerTransaction(transaction: OwnerTransactionInsert)
✅ getOwnerBalance(userId: string): Promise<OwnerBalance>
✅ getOwnerTransactions(userId: string): Promise<OwnerTransaction[]>
✅ markOwnerTransactionAsMatched(ownerTransactionId, bankTransactionId)
✅ getOwnerTransactionsForBanking(userId: string)
```

### **✅ Phase 4: UI Integration (COMPLETED)**
```typescript
// src/modules/banking/components/OwnerTransactionDialog.tsx - IMPLEMENTIERT
✅ Smart Dialog mit Context-aware UI für alle 3 Transaction Types
✅ Banking Integration Hints für bank_transfer
✅ Form Validation und Error Handling
✅ Tailwind Theme Compliance

// src/modules/banking/BankingPage.tsx - ERWEITERT
✅ Owner Transaction Buttons (💰 Owner Einlage, 💸 Owner Entnahme)
✅ Owner Balance Card mit farbkodierter Balance-Anzeige
✅ Owner Transaction Dialog Integration
✅ Automatic Data Refresh nach Owner Transaction

// src/modules/banking/hooks/useBankingData.ts - ERWEITERT  
✅ Owner Balance automatisch geladen
✅ Integration in Banking Data Hook
```

### **🎯 Deployed Features:**
- ✅ **Clean Data Model**: Zentrale Owner Transaction History
- ✅ **Banking Integration**: `bank_transfer` Owner Transactions erscheinen automatisch in Tab 2
- ✅ **Cash Movement Integration**: `private_cash` Transactions aktualisieren automatisch Kassenbuch
- ✅ **Smart Payment Logic**: Context-aware Payment Methods je Transaction Type
- ✅ **Audit Trail**: Vollständige Owner Transaction Nachverfolgung
- ✅ **Future-Proof**: Swiss Accounting Export direkt aus owner_transactions
- ✅ **UI Integration**: Owner Balance Card & Transaction Buttons mit Theme Colors
- ✅ **Real-time Updates**: Automatic refresh nach Transaktionen

## **🎯 Smart Banking Integration**

### **Automatisches Banking Tab 2 Matching:**
- Owner Transactions mit `payment_method='bank_transfer'` erscheinen automatisch in "Available for Bank Matching"
- Normale Bank Matching Workflow funktioniert sofort
- `related_bank_transaction_id` wird bei Matching automatisch gesetzt

### **Clean Owner Balance:**
- Ein einziger API Call für komplette Owner Balance
- Keine String-Parsing oder komplexe UNION Queries nötig
- Direkte Integration in Banking Dashboard

### **Expense Integration:**
- Owner private Ausgaben können über `related_expense_id` mit bestehenden Expenses verlinkt werden
- "Owner bezahlt" Badge bei verlinkten Expenses möglich
- Clean separation zwischen Business und Owner Transactions

## **🔥 TESTING CHECKLIST**

### **✅ Basic Functionality Tests: PASSED**
- [x] **Owner Einlage (Deposit)** erstellen via 💰 "Geld ins Geschäft einzahlen" Button
- [x] **Owner Entnahme (Withdrawal)** erstellen via 💸 "Geld aus Geschäft entnehmen" Button  
- [x] **Owner Balance Card** zeigt korrekte Werte mit Color-Coding an
- [x] **Banking Tab 2** zeigt bank_transfer Owner Transactions

### **✅ Payment Method Logic Tests: PASSED**
- [x] **Deposit/Withdrawal**: Nur bank_transfer + private_cash verfügbar
- [x] **Expense**: Alle 3 Methods (bank_transfer + private_card + private_cash) verfügbar
- [x] **Auto-Adjust**: Payment method ändert sich automatisch bei Transaction Type switch
- [x] **Smart Badges**: "Banking", "Kassenbuch", "Owner Record" Labels

### **✅ Cash Movement Integration Tests: PASSED**
- [x] **Private Cash Deposit**: Erstellt automatisch cash_movement (cash_in)
- [x] **Private Cash Withdrawal**: Erstellt automatisch cash_movement (cash_out)
- [x] **Private Cash Expense**: Erstellt KEINEN cash_movement (korrekt!)
- [x] **Kassenbuch Update**: Owner private_cash Transactions ändern Kassenstand
- [x] **Rollback Logic**: Fehlerhafte cash_movements rollen owner_transaction zurück

### **✅ Banking Integration Tests: PASSED**
- [x] **Bank Transfer Owner Transaction** erscheint in Tab 2 Available for Matching
- [x] **Bank Matching** funktioniert für Owner Transactions
- [x] **Owner Balance** wird nach Bank Matching korrekt aktualisiert
- [x] **Real-time Refresh** nach Owner Transaction Creation

### **✅ UI/UX Tests: PASSED**
- [x] **Dialog Forms** validieren Input korrekt mit * Pflichtfeld-Markierung
- [x] **Tailwind Theme** Colors sind konsistent (kein Hardcoding)
- [x] **Error Handling** zeigt verständliche Fehlermeldungen
- [x] **Loading States** funktionieren während API Calls
- [x] **Button Descriptions** sind benutzerfreundlich deutsch

### **✅ Data Integrity Tests: PASSED**
- [x] **Owner Balance Calculation** ist mathematisch korrekt
- [x] **Database Constraints** verhindern invalid data
- [x] **RLS Policies** erlauben nur User-eigene Transaktionen
- [x] **Audit Trail** ist vollständig und nachverfolgbar
- [x] **Cash Movement Constraints** erweitert für owner_transaction reference_type

**→ Das ist eine saubere, skalierbare und future-proof Lösung! 🎯**

---

**Implementation abgeschlossen am:** 2025-01-06  
**Testing abgeschlossen am:** 2025-01-06  
**Status:** 🏆 PRODUCTION READY  
**Nächste Schritte:** Swiss Accounting Export Integration