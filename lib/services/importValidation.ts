// Import Validation Services
// Centralized validation logic for all import data types

import type { 
  ItemImport, 
  SaleImport, 
  ExpenseImport, 
  ImportDataContainer,
  ValidationResult 
} from '@/shared/types/import'

// =================================
// Individual Validation Functions
// =================================

export function validateItems(items: ItemImport[]): ValidationResult {
  const errors: string[] = []
  
  items.forEach((item, index) => {
    if (!item.name || item.name.trim() === '') {
      errors.push(`Item ${index + 1}: Name ist erforderlich`)
    }
    
    if (!item.default_price || item.default_price <= 0) {
      errors.push(`Item ${index + 1}: Preis muss positiv sein`)
    }
    
    if (!['service', 'product'].includes(item.type)) {
      errors.push(`Item ${index + 1}: Type muss 'service' oder 'product' sein`)
    }
  })

  // Check for duplicate names
  const names = items.map(item => item.name.trim().toLowerCase())
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
  if (duplicates.length > 0) {
    errors.push(`Doppelte Item-Namen gefunden: ${duplicates.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateSales(sales: SaleImport[]): ValidationResult {
  const errors: string[] = []
  
  sales.forEach((sale, index) => {
    if (!sale.date) {
      errors.push(`Sale ${index + 1}: Datum ist erforderlich`)
    }
    
    if (!sale.total_amount || sale.total_amount <= 0) {
      errors.push(`Sale ${index + 1}: Betrag muss positiv sein`)
    }
    
    if (!['cash', 'twint', 'sumup'].includes(sale.payment_method)) {
      errors.push(`Sale ${index + 1}: Ungültige Zahlungsmethode`)
    }
    
    if (!sale.items || sale.items.length === 0) {
      errors.push(`Sale ${index + 1}: Mindestens ein Item erforderlich`)
    }

    // Validate sum of items equals total
    const itemsSum = sale.items.reduce((sum, item) => sum + item.price, 0)
    if (Math.abs(itemsSum - sale.total_amount) > 0.01) {
      errors.push(`Sale ${index + 1}: Summe der Items (${itemsSum}) != Gesamtbetrag (${sale.total_amount})`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateExpenses(expenses: ExpenseImport[]): ValidationResult {
  const errors: string[] = []
  
  expenses.forEach((expense, index) => {
    if (!expense.date) {
      errors.push(`Expense ${index + 1}: Datum ist erforderlich`)
    }
    
    if (!expense.amount || expense.amount <= 0) {
      errors.push(`Expense ${index + 1}: Betrag muss positiv sein`)
    }
    
    if (!expense.description || expense.description.trim() === '') {
      errors.push(`Expense ${index + 1}: Beschreibung ist erforderlich`)
    }
    
    if (!['rent', 'supplies', 'salary', 'utilities', 'insurance', 'other'].includes(expense.category)) {
      errors.push(`Expense ${index + 1}: Ungültige Kategorie`)
    }
    
    if (!['bank', 'cash'].includes(expense.payment_method)) {
      errors.push(`Expense ${index + 1}: Ungültige Zahlungsmethode`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// =================================
// Master Validation Function
// =================================

export function validateImportData(data: ImportDataContainer): ValidationResult {
  const allErrors: string[] = []
  
  if (data.items) {
    const itemResult = validateItems(data.items)
    allErrors.push(...itemResult.errors)
  }
  
  if (data.sales) {
    const saleResult = validateSales(data.sales)
    allErrors.push(...saleResult.errors)
  }
  
  if (data.expenses) {
    const expenseResult = validateExpenses(data.expenses)
    allErrors.push(...expenseResult.errors)
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}