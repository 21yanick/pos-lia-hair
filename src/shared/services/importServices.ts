// Import Business Logic Services
// Core database operations and business logic for imports

import { supabase } from '@/shared/lib/supabase/client'
import type { ItemImport, SaleImport, ExpenseImport } from '@/shared/types/import'

// =================================
// Progress Callback Type
// =================================

type ProgressCallback = (progress: number, phase: string) => void

// =================================
// Item Import Services
// =================================

export async function importItems(
  items: ItemImport[], 
  updateProgress: ProgressCallback
): Promise<number> {
  updateProgress(10, 'Importiere Produkte...')
  
  // Check for existing items to prevent duplicates
  const existingItems = await supabase
    .from('items')
    .select('name')
  
  const existingNames = new Set(existingItems.data?.map(item => item.name.toLowerCase()) || [])
  
  // Filter out items that already exist
  const newItems = items.filter(item => !existingNames.has(item.name.toLowerCase()))
  
  if (newItems.length === 0) {
    return 0 // No new items to import
  }
  
  // Business-Centric: Items haben keine user_id!
  const { data, error } = await supabase
    .from('items')
    .insert(newItems)
    .select()

  if (error) {
    throw new Error(`Items Import Fehler: ${error.message}`)
  }

  return data?.length || 0
}

// =================================
// User Import Services
// =================================

export async function importUsers(
  users: any[], 
  updateProgress: ProgressCallback
): Promise<number> {
  updateProgress(10, 'Importiere Benutzer...')
  
  // Check for existing users to prevent duplicates
  const existingUsers = await supabase
    .from('users')
    .select('email, username')
  
  const existingEmails = new Set(existingUsers.data?.map(user => user.email.toLowerCase()) || [])
  const existingUsernames = new Set(existingUsers.data?.map(user => user.username.toLowerCase()) || [])
  
  // Filter out users that already exist
  const newUsers = users.filter(user => 
    !existingEmails.has(user.email.toLowerCase()) && 
    !existingUsernames.has(user.username.toLowerCase())
  )
  
  if (newUsers.length === 0) {
    return 0 // No new users to import
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert(newUsers)
    .select()

  if (error) {
    throw new Error(`Users Import Fehler: ${error.message}`)
  }

  return data?.length || 0
}

// =================================
// Owner Transaction Import Services
// =================================

export async function importOwnerTransactions(
  ownerTransactions: any[], 
  userId: string,
  updateProgress: ProgressCallback
): Promise<number> {
  updateProgress(10, 'Importiere Inhabertransaktionen...')
  
  // Add user_id to all transactions
  const transactionsWithUserId = ownerTransactions.map(transaction => ({
    ...transaction,
    user_id: userId
  }))
  
  const { data, error } = await supabase
    .from('owner_transactions')
    .insert(transactionsWithUserId)
    .select()

  if (error) {
    throw new Error(`Owner Transactions Import Fehler: ${error.message}`)
  }

  return data?.length || 0
}

// =================================
// Bank Account Import Services
// =================================

export async function importBankAccounts(
  bankAccounts: any[], 
  userId: string,
  updateProgress: ProgressCallback
): Promise<number> {
  updateProgress(10, 'Importiere Bankkonten...')
  
  // Check for existing bank accounts to prevent duplicates (by name and IBAN)
  const existingAccounts = await supabase
    .from('bank_accounts')
    .select('name, iban')
    .eq('user_id', userId)
  
  const existingNames = new Set(existingAccounts.data?.map(account => account.name.toLowerCase()) || [])
  const existingIbans = new Set(existingAccounts.data?.filter(account => account.iban).map(account => account.iban) || [])
  
  // Filter out accounts that already exist
  const newAccounts = bankAccounts.filter(account => {
    const nameExists = existingNames.has(account.name.toLowerCase())
    const ibanExists = account.iban && existingIbans.has(account.iban)
    return !nameExists && !ibanExists
  })
  
  if (newAccounts.length === 0) {
    return 0 // No new accounts to import
  }
  
  // Add user_id and timestamps to all accounts
  const accountsWithUserId = newAccounts.map(account => ({
    ...account,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
  
  const { data, error } = await supabase
    .from('bank_accounts')
    .insert(accountsWithUserId)
    .select()

  if (error) {
    throw new Error(`Bank Accounts Import Fehler: ${error.message}`)
  }

  return data?.length || 0
}

// =================================
// Supplier Import Services
// =================================

export async function importSuppliers(
  suppliers: any[], 
  userId: string,
  updateProgress: ProgressCallback
): Promise<number> {
  updateProgress(10, 'Importiere Lieferanten...')
  
  // Check for existing suppliers to prevent duplicates (by name)
  const existingSuppliers = await supabase
    .from('suppliers')
    .select('name')
    .eq('user_id', userId)
  
  const existingNames = new Set(existingSuppliers.data?.map(supplier => supplier.name.toLowerCase()) || [])
  
  // Filter out suppliers that already exist
  const newSuppliers = suppliers.filter(supplier => 
    !existingNames.has(supplier.name.toLowerCase())
  )
  
  if (newSuppliers.length === 0) {
    return 0 // No new suppliers to import
  }
  
  // Add user_id and timestamps to all suppliers
  const suppliersWithUserId = newSuppliers.map(supplier => ({
    ...supplier,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
  
  const { data, error } = await supabase
    .from('suppliers')
    .insert(suppliersWithUserId)
    .select()

  if (error) {
    throw new Error(`Suppliers Import Fehler: ${error.message}`)
  }

  return data?.length || 0
}

// =================================
// Helper Functions
// =================================

export async function getItemIdByName(itemName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('items')
    .select('id')
    .eq('name', itemName)
    .limit(1) // Take first match if duplicates exist
  
  if (error || !data || data.length === 0) {
    return null
  }
  
  return data[0].id
}

// =================================
// Sales Import Services
// =================================

export async function importSales(
  sales: SaleImport[], 
  targetUserId: string,
  updateProgress: ProgressCallback
): Promise<number> {
  updateProgress(40, 'Importiere Verkäufe...')
  
  let totalSalesImported = 0
  
  for (const sale of sales) {
    // 1. Create Sale
    const saleData = {
      total_amount: sale.total_amount,
      payment_method: sale.payment_method,
      status: sale.status,
      notes: sale.notes || null,
      created_at: `${sale.date}T${sale.time}:00`,
      user_id: targetUserId // User-Level: Wer hat verkauft
    }

    const { data: saleResult, error: saleError } = await supabase
      .from('sales')
      .insert(saleData)
      .select()
      .single()

    if (saleError) {
      throw new Error(`Sales Import Fehler: ${saleError.message}`)
    }

    // 2. Resolve item names to IDs and create Sale Items
    const saleItemsData = []
    
    for (const item of sale.items) {
      const itemId = await getItemIdByName(item.item_name)
      
      if (!itemId) {
        throw new Error(`Item nicht gefunden: ${item.item_name}`)
      }
      
      saleItemsData.push({
        sale_id: saleResult.id,
        item_id: itemId, // Use item_id instead of item_name
        price: item.price,
        notes: item.notes || null
      })
    }

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItemsData)

    if (itemsError) {
      throw new Error(`Sale Items Import Fehler: ${itemsError.message}`)
    }

    totalSalesImported++
  }

  return totalSalesImported
}

// =================================
// Expense Import Services
// =================================

export async function importExpenses(
  expenses: ExpenseImport[], 
  targetUserId: string,
  updateProgress: ProgressCallback
): Promise<number> {
  updateProgress(60, 'Importiere Ausgaben...')
  
  const expensesData = expenses.map(expense => ({
    amount: expense.amount,
    description: expense.description,
    category: expense.category,
    payment_method: expense.payment_method,
    payment_date: expense.date, // Required field
    supplier_name: expense.supplier_name || null,
    invoice_number: expense.invoice_number || null,
    notes: expense.notes || null,
    created_at: `${expense.date}T12:00:00`, // Default time for expenses
    user_id: targetUserId // User-Level: Wer hat erfasst
  }))

  const { data, error } = await supabase
    .from('expenses')
    .insert(expensesData)
    .select()

  if (error) {
    throw new Error(`Expenses Import Fehler: ${error.message}`)
  }

  return data?.length || 0
}

// =================================
// Cash Movement Generation
// =================================

export async function generateCashMovements(
  sales: SaleImport[], 
  expenses: ExpenseImport[], 
  targetUserId: string,
  updateProgress: ProgressCallback
): Promise<number> {
  updateProgress(80, 'Generiere Kassenbuch-Einträge...')
  
  const movements: Array<{
    amount: number
    type: 'cash_in' | 'cash_out'
    description: string
    reference_type: 'sale' | 'expense' | 'adjustment'
    reference_id?: string | null
    user_id: string
    created_at: string
  }> = []
  
  // Cash Sales → Cash In
  for (const sale of sales.filter(s => s.payment_method === 'cash')) {
    movements.push({
      amount: sale.total_amount,
      type: 'cash_in' as const,
      description: `Verkauf vom ${sale.date} ${sale.time}`,
      reference_type: 'sale' as const,
      reference_id: null, // We'll need to get the actual sale ID later
      user_id: targetUserId,
      created_at: `${sale.date}T${sale.time}:00`
    })
  }
  
  // Cash Expenses → Cash Out  
  for (const expense of expenses.filter(e => e.payment_method === 'cash')) {
    movements.push({
      amount: expense.amount,
      type: 'cash_out' as const,
      description: `${expense.description}`,
      reference_type: 'expense' as const,
      reference_id: null, // We'll need to get the actual expense ID later
      user_id: targetUserId,
      created_at: `${expense.date}T12:00:00`
    })
  }

  if (movements.length > 0) {
    const { data, error } = await supabase
      .from('cash_movements')
      .insert(movements)
      .select()

    if (error) {
      throw new Error(`Cash Movements Fehler: ${error.message}`)
    }

    return data?.length || 0
  }

  return 0
}

// =================================
// Daily Summary Calculation
// =================================

export async function calculateDailySummariesForImport(
  sales: SaleImport[], 
  _expenses: ExpenseImport[],
  updateProgress: ProgressCallback
): Promise<number> {
  updateProgress(90, 'Berechne Daily Summaries...')
  
  // Collect unique dates ONLY from sales data (not expenses!)
  // Daily Summaries = Verkaufstage, nicht Ausgaben-Tage
  const salesDates = new Set<string>()
  
  // Add ONLY sales dates - expenses don't create daily summaries
  sales.forEach(sale => salesDates.add(sale.date))
  
  // REMOVED: expense dates don't trigger daily summaries
  // expenses.forEach(expense => allDates.add(expense.date))
  
  const uniqueDates = Array.from(salesDates).sort()
  let calculatedSummaries = 0
  
  // Calculate daily summary for each sales date (not expense dates)
  for (const date of uniqueDates) {
    const { error } = await supabase.rpc('calculate_daily_summary', {
      summary_date: date
    })
    
    if (error) {
      throw new Error(`Daily Summary Berechnung Fehler für ${date}: ${error.message}`)
    }
    
    // Mark daily summary as completed (like normal POS usage)
    const { error: updateError } = await supabase
      .from('daily_summaries')
      .update({ 
        status: 'closed',
        cash_ending: 200.00, // Placeholder - should be calculated properly
        notes: 'Automatisch abgeschlossen durch Import'
      })
      .eq('report_date', date)
    
    if (updateError) {
      // console.warn(`Konnte Daily Summary Status nicht auf "closed" setzen für ${date}:`, updateError)
    }
    
    calculatedSummaries++
  }
  
  // Note: Expenses are imported separately and DO NOT create daily summaries
  // Expenses are tracked in monthly summaries and expense reports only
  // console.log(`✅ Daily Summaries erstellt: ${calculatedSummaries} (nur für Verkaufstage)`)
  
  return calculatedSummaries
}