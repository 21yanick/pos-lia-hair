/**
 * Generate Settlement Test Data
 * 
 * Creates POS transaction data that matches the real provider settlement files
 * for testing the settlement import system.
 */

import type { SaleImport, ItemImport, ExpenseImport } from '@/lib/types/import'

// ============================================================================
// REAL PROVIDER DATA ANALYSIS
// ============================================================================

// SumUp transactions from real CSV (April 2025)
const REAL_SUMUP_TRANSACTIONS = [
  { date: '2025-04-30', time: '18:19', amount: 165.0, fee: 4.13, net: 160.87, id: 'TAAAUNVQ73Q' },
  { date: '2025-04-30', time: '15:37', amount: 90.0, fee: 1.35, net: 88.65, id: 'TAAAUNTMAZP' },
  { date: '2025-04-26', time: '10:47', amount: 220.0, fee: 3.3, net: 216.7, id: 'TAAAUL9LZN6' },
  { date: '2025-04-19', time: '11:45', amount: 309.0, fee: 4.64, net: 304.36, id: 'TAAAUHXV7UL' },
  { date: '2025-04-15', time: '19:25', amount: 262.0, fee: 3.93, net: 258.07, id: 'TAAAUGP7K6X' },
  { date: '2025-04-12', time: '11:20', amount: 197.0, fee: 2.96, net: 194.04, id: 'TAAAUFFR3EU' },
  { date: '2025-04-11', time: '17:12', amount: 87.0, fee: 1.31, net: 85.69, id: 'TAAAUE6TDSE' },
  { date: '2025-04-02', time: '13:10', amount: 47.0, fee: 0.71, net: 46.29, id: 'TAAAUBQ2X96' }
]

// TWINT transactions from real CSV (April 2025)  
const REAL_TWINT_TRANSACTIONS = [
  { date: '2025-04-02', time: '10:04', amount: 76.99, fee: 1.01, id: 'ddc27e5c-83ab-445f-b2cd-cef1575d4951' },
  { date: '2025-04-02', time: '11:15', amount: 29.61, fee: 0.39, id: '70d0909a-4d4d-4295-ac01-595dbdb97b3b' },
  { date: '2025-04-02', time: '11:17', amount: 24.67, fee: 0.33, id: 'be7c9c7d-2d26-46e6-bdd9-75a8b8f0255b' },
  { date: '2025-04-09', time: '11:11', amount: 95.74, fee: 1.26, id: 'db2506d3-290e-4cc4-a739-2f1162446c84' },
  { date: '2025-04-09', time: '12:15', amount: 54.28, fee: 0.72, id: 'd192c774-4def-4487-a1bd-b5540bc3a335' },
  { date: '2025-04-11', time: '14:32', amount: 39.48, fee: 0.52, id: '16d5a389-4829-44bf-852f-a9f3d39c55d1' },
  { date: '2025-04-12', time: '17:18', amount: 276.36, fee: 3.64, id: '11d84820-c22f-44d3-83c1-5ff17e2e0696' },
  { date: '2025-04-15', time: '11:21', amount: 61.19, fee: 0.81, id: '4cbc29c1-1506-4298-afbc-0ddcacc11bee' },
  { date: '2025-04-16', time: '10:19', amount: 29.61, fee: 0.39, id: '93fe6ad5-6ecd-40c7-bfa8-ef0f7fd8b026' },
  { date: '2025-04-16', time: '10:19', amount: 24.67, fee: 0.33, id: '70e0f64e-76ad-4dd1-8d94-be9591ee11f3' },
  { date: '2025-04-19', time: '16:08', amount: 111.53, fee: 1.47, id: 'de10455b-3afd-4215-904c-a083117d1310' },
  { date: '2025-04-26', time: '11:39', amount: 88.83, fee: 1.17, id: '157be383-d611-4319-9e00-78ad3f9c01f4' },
  { date: '2025-04-30', time: '11:44', amount: 155.95, fee: 2.05, id: 'bcc705e1-ae2d-40b1-96dc-718728e9ec68' },
  { date: '2025-04-30', time: '14:25', amount: 29.61, fee: 0.39, id: '6da1d4d5-709d-4780-a35c-45c926d8f0f6' },
  { date: '2025-04-30', time: '14:25', amount: 24.67, fee: 0.33, id: '2a810d1e-c4c3-4454-bfed-65d353d62545' }
]

// ============================================================================
// SERVICE CATALOG (Realistic Lia Hair Services)
// ============================================================================

const HAIR_SERVICES: ItemImport[] = [
  // Haarschnitte
  { name: 'Haarschnitt Damen', default_price: 85.00, type: 'service', is_favorite: true },
  { name: 'Haarschnitt Herren', default_price: 65.00, type: 'service', is_favorite: true },
  { name: 'Kinderhaarschnitt', default_price: 45.00, type: 'service' },
  { name: 'Pony schneiden', default_price: 25.00, type: 'service' },
  
  // Färbungen & Tönung
  { name: 'Komplettfärbung', default_price: 120.00, type: 'service', is_favorite: true },
  { name: 'Ansatzfärbung', default_price: 80.00, type: 'service', is_favorite: true },
  { name: 'Strähnen', default_price: 95.00, type: 'service' },
  { name: 'Balayage', default_price: 150.00, type: 'service' },
  { name: 'Tönung', default_price: 60.00, type: 'service' },
  
  // Styling & Pflege
  { name: 'Föhnen & Styling', default_price: 35.00, type: 'service' },
  { name: 'Hochsteckfrisur', default_price: 75.00, type: 'service' },
  { name: 'Haarkur-Behandlung', default_price: 45.00, type: 'service' },
  { name: 'Kopfhautmassage', default_price: 25.00, type: 'service' },
  
  // Spezialbehandlungen
  { name: 'Dauerwelle', default_price: 110.00, type: 'service' },
  { name: 'Glättung', default_price: 130.00, type: 'service' },
  { name: 'Haarverlängerung', default_price: 220.00, type: 'service' },
  
  // Produkte
  { name: 'Shampoo Professional', default_price: 28.00, type: 'product' },
  { name: 'Conditioner Professional', default_price: 32.00, type: 'product' },
  { name: 'Haaröl Treatment', default_price: 45.00, type: 'product' },
  { name: 'Styling Gel', default_price: 22.00, type: 'product' }
]

// ============================================================================
// INTELLIGENT SERVICE MATCHING
// ============================================================================

/**
 * Match transaction amounts to realistic service combinations
 * FIXED: Always return exact amount match
 */
function generateRealisticServiceCombination(targetAmount: number): Array<{item_name: string, price: number}> {
  // Round to 2 decimal places to avoid floating point issues
  const exactAmount = Math.round(targetAmount * 100) / 100
  
  // For settlement test data, we use a single "Individueller Betrag" service
  // This matches the real provider data which shows "Individueller Betrag" in descriptions
  return [{ 
    item_name: 'Individueller Betrag', 
    price: exactAmount 
  }]
}

// Add the "Individueller Betrag" service to our catalog
const SETTLEMENT_SERVICES: ItemImport[] = [
  ...HAIR_SERVICES,
  // Add the flexible service for exact amount matching
  { 
    name: 'Individueller Betrag', 
    default_price: 50.00, 
    type: 'service',
    is_favorite: false,
    active: true
  }
]

// ============================================================================
// TEST DATA GENERATION
// ============================================================================

/**
 * Generate POS sales data that matches the real provider settlements
 */
export function generateSettlementTestData(): {
  items: ItemImport[]
  sales: SaleImport[]
  expenses: ExpenseImport[]
  description: string
} {
  const sales: SaleImport[] = []
  
  // Generate SumUp sales
  REAL_SUMUP_TRANSACTIONS.forEach(transaction => {
    const serviceItems = generateRealisticServiceCombination(transaction.amount)
    
    sales.push({
      date: transaction.date,
      time: transaction.time,
      total_amount: transaction.amount,
      payment_method: 'sumup',
      status: 'completed',
      items: serviceItems,
      notes: `Settlement Test - SumUp ID: ${transaction.id}`
    })
  })
  
  // Generate TWINT sales
  REAL_TWINT_TRANSACTIONS.forEach(transaction => {
    const serviceItems = generateRealisticServiceCombination(transaction.amount)
    
    sales.push({
      date: transaction.date,
      time: transaction.time,
      total_amount: transaction.amount,
      payment_method: 'twint',
      status: 'completed',
      items: serviceItems,
      notes: `Settlement Test - TWINT ID: ${transaction.id}`
    })
  })
  
  // Add some cash sales for completeness
  const cashSales = [
    { date: '2025-04-01', time: '09:30', amount: 85.00, service: 'Haarschnitt Damen' },
    { date: '2025-04-05', time: '14:15', amount: 65.00, service: 'Haarschnitt Herren' },
    { date: '2025-04-10', time: '11:45', amount: 120.00, service: 'Komplettfärbung' },
    { date: '2025-04-18', time: '16:20', amount: 45.00, service: 'Kinderhaarschnitt' },
    { date: '2025-04-25', time: '10:00', amount: 95.00, service: 'Strähnen' }
  ]
  
  cashSales.forEach(sale => {
    sales.push({
      date: sale.date,
      time: sale.time,
      total_amount: sale.amount,
      payment_method: 'cash',
      status: 'completed',
      items: [{ item_name: sale.service, price: sale.amount }],
      notes: 'Settlement Test - Cash payment'
    })
  })
  
  // ============================================================================
  // REALISTIC BANK EXPENSES (for Bank Settlement Testing)
  // ============================================================================
  
  // Expenses that would show up in Raiffeisen CAMT.053 as bank transfers/debits
  const bankExpenses: ExpenseImport[] = [
    // Monthly rent - typical for Swiss salon
    { 
      date: '2025-04-01', 
      amount: 2800.00, 
      description: 'Monatsmiete April 2025', 
      category: 'rent', 
      payment_method: 'bank',
      supplier_name: 'Immobilien AG Zürich',
      invoice_number: 'RENT-2025-04',
      notes: 'Settlement Test - Bank transfer'
    },
    
    // Professional hair products supplier
    { 
      date: '2025-04-03', 
      amount: 485.60, 
      description: 'Haarprodukte Lieferung', 
      category: 'supplies', 
      payment_method: 'bank',
      supplier_name: 'L\'Oréal Professional Schweiz',
      invoice_number: 'LOR-2025-1156',
      notes: 'Settlement Test - Bank transfer'
    },
    
    // Utilities - electricity
    { 
      date: '2025-04-08', 
      amount: 156.90, 
      description: 'Stromrechnung März 2025', 
      category: 'utilities', 
      payment_method: 'bank',
      supplier_name: 'EWZ Elektrizitätswerke',
      invoice_number: 'EWZ-2025-03-789',
      notes: 'Settlement Test - Bank transfer'
    },
    
    // Insurance - business liability 
    { 
      date: '2025-04-12', 
      amount: 289.50, 
      description: 'Betriebshaftpflicht Q2/2025', 
      category: 'insurance', 
      payment_method: 'bank',
      supplier_name: 'Zurich Versicherung',
      invoice_number: 'ZUR-BH-2025-Q2',
      notes: 'Settlement Test - Bank transfer'
    },
    
    // Staff salary (partial for testing)
    { 
      date: '2025-04-30', 
      amount: 4200.00, 
      description: 'Lohn April 2025 - Angestellte', 
      category: 'salary', 
      payment_method: 'bank',
      supplier_name: 'Maria Schneider',
      invoice_number: 'SALARY-2025-04',
      notes: 'Settlement Test - Bank transfer'
    },
    
    // Equipment maintenance
    { 
      date: '2025-04-15', 
      amount: 125.00, 
      description: 'Föhn Reparatur', 
      category: 'other', 
      payment_method: 'bank',
      supplier_name: 'Friseur-Tech GmbH',
      invoice_number: 'FT-2025-445',
      notes: 'Settlement Test - Bank transfer'
    },
    
    // REAL BANK EXPENSES from Raiffeisen CAMT.053 XML (for perfect matching)
    { 
      date: '2025-04-19', 
      amount: 139.10, 
      description: 'Zahlung Ausgleichskasse des Kantons Solothurn', 
      category: 'insurance', 
      payment_method: 'bank',
      supplier_name: 'Ausgleichskasse Kanton Solothurn',
      invoice_number: 'AK-2025-Q1',
      notes: 'Settlement Test - Real Bank XML expense'
    },
    
    { 
      date: '2025-04-20', 
      amount: 520.00, 
      description: 'Dauerauftrag Heavenly Beauty', 
      category: 'rent', 
      payment_method: 'bank',
      supplier_name: 'Heavenly Beauty AG',
      invoice_number: 'HB-DA-2025-04',
      notes: 'Settlement Test - Real Bank XML expense'
    },
    
    // Cash expenses for comparison
    { 
      date: '2025-04-05', 
      amount: 45.80, 
      description: 'Büromaterial', 
      category: 'supplies', 
      payment_method: 'cash',
      notes: 'Settlement Test - Cash payment'
    },
    
    { 
      date: '2025-04-22', 
      amount: 28.50, 
      description: 'Reinigungsmittel', 
      category: 'supplies', 
      payment_method: 'cash',
      notes: 'Settlement Test - Cash payment'
    }
  ]
  
  // Sort by date and time
  sales.sort((a, b) => {
    const dateTimeA = `${a.date} ${a.time}`
    const dateTimeB = `${b.date} ${b.time}`
    return dateTimeA.localeCompare(dateTimeB)
  })
  
  const cashExpenses = bankExpenses.filter(e => e.payment_method === 'cash')
  const bankExpensesOnly = bankExpenses.filter(e => e.payment_method === 'bank')
  
  const description = `
Settlement Test Data Generated:
- ${REAL_SUMUP_TRANSACTIONS.length} SumUp transactions (matching real CSV data)
- ${REAL_TWINT_TRANSACTIONS.length} TWINT transactions (matching real CSV data)  
- ${cashSales.length} Cash sales (for completeness)
- ${bankExpensesOnly.length} Bank expenses (for Bank Settlement testing)
- ${cashExpenses.length} Cash expenses (for completeness)
- ${SETTLEMENT_SERVICES.length} Hair salon services and products (incl. "Individueller Betrag")
- Total: ${sales.length} sales + ${bankExpenses.length} expenses from April 2025

Bank Expenses Total: CHF ${bankExpensesOnly.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
Includes 2 REAL Bank expenses (CHF 659.10) matching the actual Raiffeisen CAMT.053 XML debits.
This will test complete Bank Settlement reconciliation with perfect matching.

This data matches the real provider settlement files:
- SumUp_20250401-20250430-MF9236HP-transactions-report.csv
- Twint_20250529-TransactionReport.csv
- Raiffeisen_camt053_001_08_ch5180808002007735062_20250529165122.xml

After importing this data, you can test the settlement import system with the real provider files to verify automatic transaction matching.
`
  
  return {
    items: SETTLEMENT_SERVICES, // Use extended services including "Individueller Betrag"
    sales,
    expenses: bankExpenses,
    description
  }
}

/**
 * Generate JSON import file for easy testing
 */
export function generateSettlementTestJSON(): string {
  const testData = generateSettlementTestData()
  
  const importData = {
    metadata: {
      version: '1.0',
      created_at: new Date().toISOString(),
      created_by: 'Settlement Test Data Generator',
      description: testData.description.trim(),
      total_records: {
        items: testData.items.length,
        sales: testData.sales.length,
        expenses: testData.expenses.length
      }
    },
    items: testData.items,
    sales: testData.sales,
    expenses: testData.expenses
  }
  
  return JSON.stringify(importData, null, 2)
}

/**
 * Statistics about the test data
 */
export function getTestDataStats() {
  const testData = generateSettlementTestData()
  
  const sumupTotal = REAL_SUMUP_TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0)
  const twintTotal = REAL_TWINT_TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0)
  const cashTotal = testData.sales
    .filter(s => s.payment_method === 'cash')
    .reduce((sum, s) => sum + s.total_amount, 0)
  
  const bankExpensesTotal = testData.expenses
    .filter(e => e.payment_method === 'bank')
    .reduce((sum, e) => sum + e.amount, 0)
  const cashExpensesTotal = testData.expenses
    .filter(e => e.payment_method === 'cash')
    .reduce((sum, e) => sum + e.amount, 0)
  
  return {
    totalTransactions: testData.sales.length,
    totalExpenses: testData.expenses.length,
    sumupTransactions: REAL_SUMUP_TRANSACTIONS.length,
    twintTransactions: REAL_TWINT_TRANSACTIONS.length,
    cashTransactions: testData.sales.filter(s => s.payment_method === 'cash').length,
    bankExpenses: testData.expenses.filter(e => e.payment_method === 'bank').length,
    cashExpenses: testData.expenses.filter(e => e.payment_method === 'cash').length,
    totalAmount: sumupTotal + twintTotal + cashTotal,
    totalExpenseAmount: bankExpensesTotal + cashExpensesTotal,
    sumupTotal,
    twintTotal,
    cashTotal,
    bankExpensesTotal,
    cashExpensesTotal,
    dateRange: {
      from: '2025-04-01',
      to: '2025-04-30'
    }
  }
}