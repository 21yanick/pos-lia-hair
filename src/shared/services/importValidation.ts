// Import Validation Services
// Centralized validation logic for all import data types

import type {
  ExpenseImport,
  ImportDataContainer,
  ItemImport,
  SaleImport,
  ValidationResult,
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
  const names = items.map((item) => item.name.trim().toLowerCase())
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
  if (duplicates.length > 0) {
    errors.push(`Doppelte Item-Namen gefunden: ${duplicates.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
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
      errors.push(
        `Sale ${index + 1}: Summe der Items (${itemsSum}) != Gesamtbetrag (${sale.total_amount})`
      )
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
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

    if (
      !['rent', 'supplies', 'salary', 'utilities', 'insurance', 'other'].includes(expense.category)
    ) {
      errors.push(`Expense ${index + 1}: Ungültige Kategorie`)
    }

    if (!['bank', 'cash'].includes(expense.payment_method)) {
      errors.push(`Expense ${index + 1}: Ungültige Zahlungsmethode`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateUsers(users: any[]): ValidationResult {
  const errors: string[] = []

  users.forEach((user, index) => {
    if (!user.name || user.name.trim() === '') {
      errors.push(`User ${index + 1}: Name ist erforderlich`)
    }

    if (!user.username || user.username.trim() === '') {
      errors.push(`User ${index + 1}: Username ist erforderlich`)
    }

    if (!user.email || user.email.trim() === '') {
      errors.push(`User ${index + 1}: E-Mail ist erforderlich`)
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(user.email)) {
        errors.push(`User ${index + 1}: Ungültiges E-Mail Format`)
      }
    }

    if (!['admin', 'staff'].includes(user.role)) {
      errors.push(`User ${index + 1}: Rolle muss 'admin' oder 'staff' sein`)
    }
  })

  // Check for duplicate emails and usernames
  const emails = users.map((user) => user.email?.trim()?.toLowerCase()).filter(Boolean)
  const usernames = users.map((user) => user.username?.trim()?.toLowerCase()).filter(Boolean)

  const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index)
  if (duplicateEmails.length > 0) {
    errors.push(`Doppelte E-Mail Adressen gefunden: ${[...new Set(duplicateEmails)].join(', ')}`)
  }

  const duplicateUsernames = usernames.filter(
    (username, index) => usernames.indexOf(username) !== index
  )
  if (duplicateUsernames.length > 0) {
    errors.push(`Doppelte Benutzernamen gefunden: ${[...new Set(duplicateUsernames)].join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateOwnerTransactions(ownerTransactions: any[]): ValidationResult {
  const errors: string[] = []

  ownerTransactions.forEach((transaction, index) => {
    if (!['deposit', 'expense', 'withdrawal'].includes(transaction.transaction_type)) {
      errors.push(
        `Owner Transaction ${index + 1}: Transaktionstyp muss 'deposit', 'expense' oder 'withdrawal' sein`
      )
    }

    if (!transaction.amount || transaction.amount <= 0) {
      errors.push(`Owner Transaction ${index + 1}: Betrag muss positiv sein`)
    }

    if (!transaction.description || transaction.description.trim() === '') {
      errors.push(`Owner Transaction ${index + 1}: Beschreibung ist erforderlich`)
    }

    if (!transaction.transaction_date) {
      errors.push(`Owner Transaction ${index + 1}: Transaktionsdatum ist erforderlich`)
    } else {
      const date = new Date(transaction.transaction_date)
      if (Number.isNaN(date.getTime())) {
        errors.push(`Owner Transaction ${index + 1}: Ungültiges Datum`)
      }
    }

    if (!['bank_transfer', 'private_card', 'private_cash'].includes(transaction.payment_method)) {
      errors.push(
        `Owner Transaction ${index + 1}: Zahlungsmethode muss 'bank_transfer', 'private_card' oder 'private_cash' sein`
      )
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateBankAccounts(bankAccounts: any[]): ValidationResult {
  const errors: string[] = []

  bankAccounts.forEach((account, index) => {
    if (!account.name || account.name.trim() === '') {
      errors.push(`Bank Account ${index + 1}: Kontoname ist erforderlich`)
    }

    if (!account.bank_name || account.bank_name.trim() === '') {
      errors.push(`Bank Account ${index + 1}: Bankname ist erforderlich`)
    }

    if (account.current_balance !== undefined && account.current_balance < 0) {
      errors.push(`Bank Account ${index + 1}: Negativer Kontostand nicht erlaubt`)
    }

    // Validate IBAN format if provided
    if (account.iban && account.iban.trim() !== '') {
      const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,32}$/
      const cleanIban = account.iban.replace(/\s/g, '').toUpperCase()
      if (!ibanRegex.test(cleanIban)) {
        errors.push(`Bank Account ${index + 1}: Ungültiges IBAN Format`)
      }
    }
  })

  // Check for duplicate names
  const names = bankAccounts.map((account) => account.name?.trim()?.toLowerCase()).filter(Boolean)
  const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index)
  if (duplicateNames.length > 0) {
    errors.push(`Doppelte Kontonamen gefunden: ${[...new Set(duplicateNames)].join(', ')}`)
  }

  // Check for duplicate IBANs
  const ibans = bankAccounts
    .map((account) => account.iban?.replace(/\s/g, '')?.toUpperCase())
    .filter(Boolean)
  const duplicateIbans = ibans.filter((iban, index) => ibans.indexOf(iban) !== index)
  if (duplicateIbans.length > 0) {
    errors.push(`Doppelte IBANs gefunden: ${[...new Set(duplicateIbans)].join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
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

  if (data.users) {
    const userResult = validateUsers(data.users)
    allErrors.push(...userResult.errors)
  }

  if (data.owner_transactions) {
    const ownerTransactionResult = validateOwnerTransactions(data.owner_transactions)
    allErrors.push(...ownerTransactionResult.errors)
  }

  if (data.bank_accounts) {
    const bankAccountResult = validateBankAccounts(data.bank_accounts)
    allErrors.push(...bankAccountResult.errors)
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
    errors: allErrors,
  }
}
