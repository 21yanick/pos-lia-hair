# 📊 Import Requirements Specification
**Vollständige Definition aller historischen Geschäftsdaten**

*Erstellt: 13.06.2025 | Letzte Aktualisierung: 13.06.2025 | Status: IMPLEMENTED ✅*

---

## 🎯 **ZIEL: VOLLSTÄNDIGE HISTORISCHE DATENERFASSUNG**

**Problem:** Neues POS-System braucht alle historischen Geschäftsdaten um:
- Korrekte Buchhaltung zu ermöglichen
- Banking-Abgleiche durchzuführen  
- Owner-Balance zu berechnen
- Compliance und Audit-Trail zu gewährleisten

**Lösung:** Strukturierter Import ALLER Business-relevanten Daten seit Geschäftsbeginn

---

## 📋 **BUSINESS-PROZESS ANALYSE**

### **1. VERKAUFSTRANSAKTIONEN (SALES)**
**Business Context:** Alle Dienstleistungen und Produktverkäufe
**Warum wichtig:** Core Revenue, Steuern, Provider-Abgleiche

#### **Benötigte Import-Felder:**
```csv
# sales.csv
date,time,total_amount,payment_method,items,description,notes
2024-01-15,14:30,85.00,twint,"Haarschnitt Damen:60.00;Styling:25.00","Kundin Maria","Stammkundin"
2024-01-15,15:45,45.00,cash,Herrenschnitt:45.00,"Standard Herrenschnitt",""
```

#### **Erweiterte Felder (falls Provider-Daten verfügbar):**
```csv
# sales_with_provider.csv  
date,time,total_amount,payment_method,items,provider_fee,net_amount,settlement_date,provider_reference
2024-01-15,14:30,85.00,twint,"Haarschnitt:60.00",1.36,83.64,2024-01-17,TW20240115001
```

**DB-Tabellen:** `sales`, `sale_items`
**Abhängigkeiten:** Items müssen existieren
**Auto-Generiert:** Receipt Numbers, Cash Movements (bei cash)

---

### **2. GESCHÄFTSAUSGABEN (EXPENSES)**  
**Business Context:** Alle geschäftlichen Kosten und Investitionen
**Warum wichtig:** Steuerabzüge, Gewinn-Verlust-Rechnung, Banking-Abgleiche

#### **Benötigte Import-Felder:**
```csv
# expenses.csv
date,amount,description,category,payment_method,supplier,invoice_number,notes
2024-01-10,1200.00,"Monatsmiete Salon",rent,bank,"Immobilien AG","INV-2024-001","Miete Januar"
2024-01-12,156.80,"Shampoo Nachbestellung",supplies,cash,"Beauty Supply GmbH","BS-445",""
2024-01-15,2500.00,"Gehalt Mitarbeiterin",salary,bank,"Sarah Müller","LOHN-2024-01",""
```

**DB-Tabellen:** `expenses`
**Payment Methods:** `bank`, `cash`
**Categories:** `rent`, `supplies`, `salary`, `utilities`, `insurance`, `other`
**Auto-Generiert:** Receipt Numbers, Cash Movements (bei cash)

---

### **3. KASSENBEWEGUNGEN (CASH MOVEMENTS)**
**Business Context:** Manuelle Kassen-Ein/Auszahlungen, Wechselgeld, Trinkgelder
**Warum wichtig:** Kassenbuch-Compliance, Differenzen-Tracking

#### **Benötigte Import-Felder:**
```csv
# cash_movements.csv
date,amount,type,description,reference_type,reference_description
2024-01-10,500.00,cash_in,"Startkapital Tageskasse",adjustment,"Kasse aufgefüllt"
2024-01-12,-50.00,cash_out,"Wechselgeld beschafft",adjustment,"Bank Münzen geholt"  
2024-01-15,20.00,cash_in,"Trinkgeld von Kundin",adjustment,"Extra Trinkgeld"
```

**DB-Tabellen:** `cash_movements`
**Types:** `cash_in`, `cash_out`
**Reference Types:** `sale`, `expense`, `adjustment`, `owner_transaction`

---

### **4. OWNER TRANSAKTIONEN (OWNER TRANSACTIONS)**
**Business Context:** Privatgeld ↔ Geschäftsgeld Bewegungen
**Warum wichtig:** Owner-Balance, Steuerliche Trennung, Eigenkapital-Tracking

#### **Benötigte Import-Felder:**
```csv
# owner_transactions.csv
date,transaction_type,amount,description,payment_method,related_expense_description,notes
2024-01-01,deposit,10000.00,"Startkapital Geschäftseröffnung",bank_transfer,"","Eigenkapital Einlage"
2024-01-05,expense,156.80,"Private Karte: Shampoo für Salon",private_card,"Shampoo Nachbestellung","Geschäftsausgabe privat bezahlt"
2024-01-31,withdrawal,1500.00,"Gewinnentnahme Januar",bank_transfer,"","Monatlicher Gewinn"
2024-02-03,deposit,200.00,"Bargeld ins Geschäft",private_cash,"","Kassenauffüllung privat"
```

**DB-Tabellen:** `owner_transactions`
**Transaction Types:** `deposit` (Geld ins Geschäft), `expense` (Private Zahlung), `withdrawal` (Entnahme)
**Payment Methods:** `bank_transfer`, `private_card`, `private_cash`

---

### **5. BANKKONTEN & STAMMDATEN (BANK ACCOUNTS)**
**Business Context:** Geschäftskonten Setup und Startsaldi
**Warum wichtig:** Banking-Basis für alle Abgleiche

#### **Benötigte Import-Felder:**
```csv
# bank_accounts.csv
bank_name,account_name,iban,account_number,starting_balance,starting_date,notes
"Raiffeisen Bank","Geschäftskonto Lia Hair","CH51 8080 8002 0077 3506 2","2007735062",8500.00,2024-01-01,"Hauptgeschäftskonto"
```

**DB-Tabellen:** `bank_accounts`
**Wichtig:** Startsaldo für korrekten Balance-Verlauf

---

### **6. BANK TRANSAKTIONEN (BANK TRANSACTIONS)**  
**Business Context:** Historische Kontoauszüge (CAMT.053 XML oder CSV)
**Warum wichtig:** Vollständiger Banking-Abgleich mit Sales/Expenses

#### **Option A: CAMT.053 XML Import (Preferred)**
```
# Existierende CAMT.053 Dateien aus Banking Module nutzen
# Bereits implementiert in /modules/banking/components/BankImportDialog.tsx
```

#### **Option B: Simplified CSV Import**
```csv
# bank_transactions.csv
date,booking_date,amount,description,reference,transaction_code
2024-01-01,2024-01-01,10000.00,"Eigenkapital Einlage","STARTKAPITAL","CREDIT"
2024-01-15,-1200.00,"Miete Januar Immobilien AG","MIETE-2024-01","DEBIT"
2024-01-17,83.64,"TWINT Settlement","TW20240115001","CREDIT"
```

**DB-Tabellen:** `bank_transactions`
**Status:** `unmatched` (für späteren Abgleich)

---

### **7. PROVIDER REPORTS (TWINT/SUMUP SETTLEMENTS)**
**Business Context:** Historische Provider-Abrechnungen 
**Warum wichtig:** Exakte Gebühren-Berechnung, Settlement-Abgleiche

#### **Option A: Original CSV Import (Preferred)**
```
# Existierende CSV-Dateien von TWINT/SumUp nutzen
# Bereits implementiert in /modules/banking/components/ProviderImportDialog.tsx
```

#### **Option B: Simplified CSV Import**
```csv
# provider_reports.csv
provider,transaction_date,settlement_date,gross_amount,fees,net_amount,provider_transaction_id
twint,2024-01-15,2024-01-17,85.00,1.36,83.64,TW20240115001
sumup,2024-01-16,2024-01-18,45.00,0.84,44.16,SU20240116001
```

**DB-Tabellen:** `provider_reports`
**Providers:** `twint`, `sumup`
**Status:** `unmatched` (für späteren Abgleich)

---

### **8. PRODUKT-KATALOG (ITEMS)**
**Business Context:** Alle Dienstleistungen und Produkte mit Preisen
**Warum wichtig:** Konsistente Verkaufsdaten, Preishistorie

#### **Benötigte Import-Felder:**
```csv
# items.csv
name,default_price,type,is_favorite,active,notes
"Haarschnitt Damen",60.00,service,true,true,"Standard Damenschnitt"
"Herrenschnitt",45.00,service,true,true,"Standard Herrenschnitt"
"Styling",25.00,service,false,true,"Föhnen und Styling"
"Shampoo Premium",18.50,product,false,true,"Verkaufsprodukt"
```

**DB-Tabellen:** `items`
**Types:** `service`, `product`

---

### **9. MITARBEITER (USERS)**
**Business Context:** Alle Personen die im System arbeiten
**Warum wichtig:** Daten-Zuordnung, Berechtigungen, Audit-Trail

#### **Benötigte Import-Felder:**
```csv
# users.csv  
name,username,email,role,active,notes
"Zilfije Rupp","zilfije","zilfije@lia-hair.ch",admin,true,"Inhaberin"
"Sarah Müller","sarah","sarah@lia-hair.ch",staff,true,"Mitarbeiterin"
```

**DB-Tabellen:** `users`
**Roles:** `admin`, `staff`
**Wichtig:** Alle importierten Daten brauchen user_id Zuordnung

---

## 🎯 **IMPORT-PRIORITÄTEN & REIHENFOLGE**

### **Phase 1: Basis-Setup (KRITISCH)**
1. **Users** - Mitarbeiter-Accounts erstellen
2. **Bank Accounts** - Geschäftskonten mit Startsaldi
3. **Items** - Produkt-Katalog für Verkäufe

### **Phase 2: Core Business Data (HOCH)**  
4. **Sales** - Alle historischen Verkäufe
5. **Expenses** - Alle Geschäftsausgaben
6. **Owner Transactions** - Private ↔ Business Bewegungen

### **Phase 3: Banking Integration (MITTEL)**
7. **Bank Transactions** - Historische Kontoauszüge  
8. **Provider Reports** - TWINT/SumUp Settlements
9. **Cash Movements** - Manuelle Kassenbewegungen (falls nicht auto-generiert)

### **Phase 4: Reconciliation (NIEDRIG)**
10. **Transaction Matches** - Bestehende Abgleiche (falls vorhanden)
11. **Documents** - PDF-Belege (falls digitalisiert)

---

## 🔧 **IMPORT-SYSTEM STATUS ✅ FERTIGGESTELLT**

### **Settings Import Module Status:**
- ✅ **Items, Sales, Expenses** - Bereits funktional
- ✅ **Users** - **NEU IMPLEMENTIERT** ✨
- ✅ **Owner Transactions** - **NEU IMPLEMENTIERT** ✨  
- ✅ **Bank Accounts** - **NEU IMPLEMENTIERT** ✨
- ❌ **Cash Movements** - Manual Import Option (optional)

### **Banking Import Integration:**
- ✅ **Bank Transactions** - CAMT.053 bereits funktional
- ✅ **Provider Reports** - CSV bereits funktional
- ✅ **Settings Integration** - **VOLLSTÄNDIG GETRENNT** (by design)

### **Enhanced Sales Import:**
- ❌ **Multi-Item Sales** - Mehrere Produkte pro Verkauf (future)
- ❌ **Provider Fields** - Fees, Settlement-Daten (future)
- ❌ **Banking Status** - Für Abgleich-Vorbereitung (future)

---

## 📊 **BUSINESS LOGIC & VALIDIERUNGEN**

### **Automatische Berechnungen:**
- **Cash Movements** bei cash Sales/Expenses
- **Owner Balance** aus allen Owner Transactions
- **Bank Balance** aus Startsaldo + Transaktionen
- **Receipt Numbers** für alle Transaktionen
- **Daily Summaries** aus Sales/Expenses

### **Validierungen:**
- **Date Ranges** - Keine Zukunftsdaten
- **Amount Validation** - Positive Werte, CHF Format
- **Payment Method Logic** - cash/twint/sumup für Sales
- **User Assignment** - Alle Daten brauchen user_id
- **Reference Integrity** - Items müssen für Sales existieren

### **Business Rules:**
- **Owner Transactions** mit `private_cash` erstellen automatisch Cash Movements
- **Sales** mit `cash` erstellen automatisch Cash Movements
- **Expenses** mit `cash` erstellen automatisch Cash Movements
- **Bank Transactions** aktualisieren automatisch Bank Balance

---

## 📋 **MISSING: ADDITIONAL BUSINESS PROCESSES**

### **10. ~~TAGESABSCHLÜSSE (DAILY REPORTS)~~ - ENTFERNT**
**~~Business Context~~:** ~~Historische Kassenschluss-Daten~~  
**NEUES SYSTEM:** **Rolling Banking Abgleich** + **Real-time Transaction Center**

**✅ MODERNE ARCHITEKTUR:**
- Kontinuierliche Banking-Reconciliation (keine "Abschlüsse")
- Live Stats Dashboard (automatische Berechnung)
- Real-time Cash Flow Tracking
- Continuous Compliance (kein manueller Kassenschluss)

**❌ NICHT MEHR BENÖTIGT:**
- ~~Daily Summaries Tabelle~~ (entfernt)
- ~~Manuelle Tagesabschlüsse~~ (eliminiert)
- ~~Cash Starting/Ending Balance~~ (durch continuous tracking ersetzt)

**📋 LEGACY DOCUMENTS:** 11 daily_report PDFs existieren noch im System (historisch)

---

### **11. ~~MONATSBERICHTE (MONTHLY REPORTS)~~ - ENTFERNT**
**~~Business Context~~:** ~~Historische Monatsabschlüsse~~  
**NEUES SYSTEM:** **Live Dashboard** mit **automatischen Statistiken**

**✅ MODERNE BERICHTERSTATTUNG:**
- Transaction Center zeigt automatisch Monatsstatistiken
- Banking Dashboard mit Provider-Summaries  
- Real-time Financial Overview
- Export-Funktionen für Steuer-Reports

**❌ NICHT MEHR BENÖTIGT:**
- ~~Monthly Summaries Tabelle~~ (entfernt)
- ~~Manuelle Monatsabschlüsse~~ (eliminiert)
- ~~Periodische Berichte~~ (durch live dashboard ersetzt)

**📋 LEGACY DOCUMENTS:** 2 monthly_report PDFs existieren noch im System (historisch)

---

### **12. STORNIERTE/REFUND VERKÄUFE**
**Business Context:** Ungültige Transaktionen, Rückerstattungen
**Warum wichtig:** Vollständiger Audit-Trail, Steuerliche Korrektheit

#### **Benötigte Import-Felder:**
```csv
# cancelled_sales.csv
original_date,cancellation_date,total_amount,payment_method,items,reason,status,notes,cancelled_by
2024-01-20,2024-01-20,85.00,twint,"Haarschnitt Damen:60.00","Kundin unzufrieden",cancelled,"Sofort storniert",zilfije
2024-01-25,2024-01-27,45.00,cash,"Herrenschnitt:45.00","Falsche Abrechnung",refunded,"Rückerstattung bar",sarah
```

**DB-Tabellen:** `sales` (mit status: cancelled/refunded)
**Status:** `cancelled`, `refunded`
**Wichtig:** Original-Transaktion referenzieren

---

### **13. DOKUMENT-ANHÄNGE (DOCUMENT ATTACHMENTS)**
**Business Context:** Historische PDF-Belege und Reports
**Warum wichtig:** Lückenloser Beleg-Trail, Audit-Compliance

#### **Benötigte Import-Daten:**
```csv
# documents.csv
type,reference_type,reference_description,file_name,document_date,document_number,notes
receipt,sale,"Verkauf 85.00 CHF TWINT","receipt_VK2024000015.pdf",2024-01-15,VK2024000015,"Auto-generiert"
expense_receipt,expense,"Miete Januar 1200.00 CHF","expense_AG2024000001.pdf",2024-01-10,AG2024000001,"Mietbeleg"
daily_report,report,"Tagesabschluss 15.01.2024","daily_2024-01-15.pdf",2024-01-15,TR2024000015,"Kassenschluss"
monthly_report,report,"Monatsabschluss Januar 2024","monthly_2024-01.pdf",2024-01-31,MR2024000001,"Monatsbericht"
```

**DB-Tabellen:** `documents`
**File Handling:** PDF-Dateien müssen in `/uploads/` gespeichert werden
**Types:** `receipt`, `expense_receipt`, `daily_report`, `monthly_report`, `yearly_report`

---

### **14. AUDIT TRAIL (HISTORICAL CHANGES)**
**Business Context:** Historische Änderungen und User-Aktivitäten
**Warum wichtig:** Compliance, Nachverfolgbarkeit, Betrugsschutz

#### **Benötigte Import-Felder:**
```csv
# audit_trail.csv
timestamp,table_name,record_description,action,old_values,new_values,user_name,ip_address,reason
2024-01-15T14:30:00Z,sales,"Verkauf VK2024000015",UPDATE,"{'amount': 80.00}","{'amount': 85.00}",zilfije,192.168.1.100,"Preiskorrektur"
2024-01-20T09:15:00Z,sales,"Verkauf VK2024000020",UPDATE,"{'status': 'completed'}","{'status': 'cancelled'}",zilfije,192.168.1.100,"Kundenstorno"
```

**DB-Tabellen:** `audit_log`
**Actions:** `INSERT`, `UPDATE`, `DELETE`
**Wichtig:** Vollständige Change-History für Compliance

---

### **15. IMPORT HISTORY (DATA PROVENANCE)**
**Business Context:** Tracking aller durchgeführten Daten-Imports
**Warum wichtig:** Datenherkunft, Re-Import Verhinderung, Audit

#### **Benötigte Import-Felder:**
```csv
# import_sessions.csv
import_date,import_type,filename,total_records,successful_records,failed_records,imported_by,notes
2024-01-01,sales,"historical_sales_2023.csv",245,245,0,zilfije,"Historische Daten 2023"
2024-01-02,expenses,"historical_expenses_2023.csv",89,86,3,zilfije,"3 Fehler: Ungültige Kategorien"
```

**DB-Tabellen:** `provider_import_sessions` (erweitern), neue `import_sessions`

---

## 🏦 **BANKING & COMPLIANCE ERGÄNZUNGEN**

### **16. SCHWEIZER STEUER-COMPLIANCE**
**Business Context:** MwSt-Berechnungen und Steuer-Reports
**Warum wichtig:** Gesetzliche Pflicht, Steuerprüfungen

#### **Zusätzliche Felder für Sales/Expenses:**
```csv
# sales_with_vat.csv - Erweitert
date,total_amount,vat_rate,vat_amount,net_amount,vat_exempt,vat_code
2024-01-15,85.00,7.7,6.11,78.89,false,77
```

### **17. BANKING RECONCILIATION STATUS**
**Business Context:** Status aller Banking-Abgleiche
**Warum wichtig:** Vollständige Finanz-Übersicht

#### **Erweiterte Banking Status:**
- `unmatched` - Noch nicht abgeglichen  
- `provider_matched` - Provider abgeglichen, Bank ausstehend
- `bank_matched` - Bank abgeglichen, Provider ausstehend  
- `fully_matched` - Vollständig abgeglichen

---

## 🎯 **ÜBERARBEITETE IMPORT-PRIORITÄTEN**

### **Phase 1: Basis-Setup (KRITISCH)**
1. **Users** - Mitarbeiter-Accounts erstellen
2. **Bank Accounts** - Geschäftskonten mit Startsaldi  
3. **Items** - Produkt-Katalog für Verkäufe

### **Phase 2: Core Business Data (HOCH)**
4. **Sales** (inkl. cancelled/refunded) - Alle historischen Verkäufe
5. **Expenses** - Alle Geschäftsausgaben
6. **Owner Transactions** - Private ↔ Business Bewegungen
7. **Cash Movements** - Manuelle Kassenbewegungen

### **Phase 3: Banking Integration (HOCH)**
8. **Bank Transactions** - Historische Kontoauszüge
9. **Provider Reports** - TWINT/SumUp Settlements  

### **Phase 4: Documents & Compliance (MITTEL)**
10. **Documents** - PDF-Belege (receipts, expense_receipts)
11. **Legacy Report PDFs** - Historische daily/monthly report PDFs (optional)

### **Phase 5: Audit & History (NIEDRIG)**
12. **Audit Trail** - Historische Änderungen (falls verfügbar)
13. **Import Sessions** - Import-History
14. **Transaction Matches** - Bestehende Abgleiche

---

## 🎯 **FINALE IMPORT-PRIORITÄTEN (MODERN)**

### **WIRKLICH KRITISCH (Phase 1-3):**
1. **Users** - Mitarbeiter-Accounts 
2. **Bank Accounts** - Konten mit Startsaldi
3. **Items** - Produktkatalog
4. **Sales** (+ cancelled/refunded) - Alle Verkäufe
5. **Expenses** - Alle Ausgaben  
6. **Owner Transactions** - Private ↔ Business
7. **Bank Transactions** - Kontoauszüge
8. **Provider Reports** - TWINT/SumUp
9. **Cash Movements** - Falls manuell erforderlich

### **OPTIONAL (Phase 4-5):**
10. **Receipt PDFs** - 40 bestehende Belege
11. **Legacy Report PDFs** - 13 alte Berichte (historisch)
12. **Audit Trail** - Änderungshistorie
13. **Import Sessions** - Import-Tracking

### **❌ NICHT MEHR RELEVANT:**
- ~~Daily Summaries~~ → Live Dashboard
- ~~Monthly Summaries~~ → Real-time Stats  
- ~~Manuelle Abschlüsse~~ → Continuous Reconciliation

---

## 🎯 **NÄCHSTE SCHRITTE**

1. **Data Inventory** - Welche historischen CSV/Excel Dateien sind verfügbar?
2. **Settings Import Extension** - Module um Missing Types erweitern
3. **Data Preparation** - CSV-Dateien nach Spezifikation vorbereiten
4. **Stufenweiser Import** - Phase 1-3 kritische Daten
5. **Banking Integration** - Kontinuierliche Abgleiche einrichten
6. **Validation** - Vollständige Datenintegrität prüfen

**Das moderne POS-System braucht KEINE manuellen Abschlüsse mehr! 🎯**

---

## ⚡ **IMPLEMENTATION STRATEGY - KEEP IT SIMPLE!**

### **🚨 WICHTIGE UNTERSCHEIDUNG:**
- **📋 BUSINESS REQUIREMENTS** (oben) = Vollständige Analyse aller möglichen Daten
- **⚡ IMPLEMENTATION SCOPE** (unten) = Was wirklich gebaut wird

### **🎯 SIMPLE IMPLEMENTATION APPROACH:**

#### **BESTEHENDE SETTINGS IMPORT ERWEITERN (MINIMAL):**
```typescript
// Aktuelle Settings Import Types:
✅ Items     - Funktioniert bereits
✅ Sales     - Funktioniert bereits  
✅ Expenses  - Funktioniert bereits

// Minimal erweitern um:
➕ Users             - 1-2 Mitarbeiter CSV
➕ Owner Transactions - Private/Business CSV
➕ Bank Accounts     - 1-2 Konten CSV
```

#### **BANKING BLEIBT GETRENNT:**
```typescript
// Banking Modul (bereits funktional):
✅ Bank Transactions  - CAMT.053 XML Import
✅ Provider Reports   - TWINT/SumUp CSV Import
✅ Banking Reconciliation - Funktioniert perfekt
```

#### **❌ NICHT IMPLEMENTIEREN (Over-Engineering):**
- ~~VAT/MwSt Import Engine~~
- ~~Audit Trail Import System~~  
- ~~Document Management Import~~
- ~~Complex Multi-Module Integration~~
- ~~Daily/Monthly Report Import~~
- ~~17-Type Universal Import System~~

### **🔧 CONCRETE IMPLEMENTATION PLAN:**

#### **✅ Phase 1: Settings Import Extension (ABGESCHLOSSEN)**
1. ✅ **Extended CsvImport.tsx** - 3 neue Import-Typen hinzugefügt
2. ✅ **Added Column Mapping** - Für users, owner_transactions, bank_accounts 
3. ✅ **Validation Logic** - Vollständige field validation implementiert
4. ✅ **CSV Templates** - Download-Funktionalität für alle 6 Typen

#### **⏳ Phase 2: Historical Data Import (IN PROGRESS)**
1. **Prepare 6 CSV Files:** ⏳ USER ACTION REQUIRED
   - users.csv (1-2 rows)
   - bank_accounts.csv (1-2 rows)  
   - items.csv (existing products)
   - sales.csv (historical sales)
   - expenses.csv (historical expenses)
   - owner_transactions.csv (private/business)
2. **Import via Settings** - UI ist bereit ✅
3. **Verify in Transaction Center** - Nach Import prüfen

#### **✅ Phase 3: Banking Integration (BEREITS FERTIG)**
- ✅ Bank statements via Banking Module
- ✅ Provider reports via Banking Module
- ✅ Reconciliation via Banking Module

### **🎯 SUCCESS CRITERIA:**
- **Transaction Center zeigt echte historische Daten**
- **Banking Abgleiche funktionieren**
- **Owner Balance ist korrekt**
- **Implementation bleibt unter 200 Zeilen Code**

### **📊 SCOPE BOUNDARIES:**
- **IN SCOPE:** Core business data import (9 types)
- **OUT OF SCOPE:** Advanced compliance, audit, documents
- **FUTURE:** Banking stays in Banking Module
- **PRINCIPLE:** Extend existing, don't rebuild

**Remember: Die beste Lösung ist die einfachste Lösung die funktioniert! 🎯**