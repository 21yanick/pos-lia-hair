"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

// Types für Import-System
export interface ImportConfig {
  validateOnly: boolean          // Dry-run Modus
  batchSize: number             // Records pro Batch  
  targetUserId: string          // User für Sales/Expenses
  systemUserId: string          // System User für Summaries
  generateMissingReceipts: boolean // Dummy PDFs für Expenses
  overwriteExisting: boolean    // Duplikat-Behandlung
  useSystemUserForSummaries: boolean // System User für Daily Summaries
}

export interface ImportState {
  status: 'idle' | 'processing' | 'success' | 'error'
  progress: number
  currentPhase: string
  results: ImportResults | null
  errors: string[]
}

export interface ImportResults {
  itemsImported: number
  salesImported: number
  expensesImported: number
  cashMovementsGenerated: number
  documentsGenerated: number
  dailySummariesCalculated: number
  totalProcessingTime: number
}

export interface ItemImport {
  name: string
  default_price: number
  type: 'service' | 'product'
  is_favorite?: boolean
  active?: boolean
}

export interface SaleImport {
  date: string
  time: string
  total_amount: number
  payment_method: 'cash' | 'twint' | 'sumup'
  status: 'completed'
  items: {
    item_name: string
    price: number
    notes?: string
  }[]
  notes?: string
}

export interface ExpenseImport {
  date: string
  amount: number
  description: string
  category: 'rent' | 'supplies' | 'salary' | 'utilities' | 'insurance' | 'other'
  payment_method: 'bank' | 'cash'
  supplier_name?: string
  invoice_number?: string
  notes?: string
}

// Import Phases
export enum ImportPhase {
  VALIDATION = 'validation',
  BUSINESS_DATA_IMPORT = 'business_data_import',     // Items (shared)
  USER_DATA_IMPORT = 'user_data_import',             // Sales, Expenses
  CASH_MOVEMENT_GENERATION = 'cash_movement_generation',
  DOCUMENT_GENERATION = 'document_generation',
  SUMMARY_RECALCULATION = 'summary_recalculation'
}

// Constants
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

const DEFAULT_CONFIG: ImportConfig = {
  validateOnly: false,
  batchSize: 100,
  targetUserId: '',
  systemUserId: SYSTEM_USER_ID,
  generateMissingReceipts: true,
  overwriteExisting: false,
  useSystemUserForSummaries: true
}

export function useImport() {
  const [state, setState] = useState<ImportState>({
    status: 'idle',
    progress: 0,
    currentPhase: '',
    results: null,
    errors: []
  })

  const updateProgress = useCallback((progress: number, phase: string) => {
    setState(prev => ({
      ...prev,
      progress,
      currentPhase: phase
    }))
  }, [])

  const addError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      errors: [...prev.errors, error]
    }))
  }, [])

  // Validierungs-Funktionen
  const validateItems = useCallback((items: ItemImport[]): string[] => {
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

    return errors
  }, [])

  const validateSales = useCallback((sales: SaleImport[]): string[] => {
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

    return errors
  }, [])

  const validateExpenses = useCallback((expenses: ExpenseImport[]): string[] => {
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

    return errors
  }, [])

  // Import Items (Business-Level, shared resources)
  const importItems = useCallback(async (items: ItemImport[]): Promise<number> => {
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
  }, [updateProgress])

  // Helper: Get Item ID by name (robust against duplicates)
  const getItemIdByName = useCallback(async (itemName: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from('items')
      .select('id')
      .eq('name', itemName)
      .limit(1) // Take first match if duplicates exist
    
    if (error || !data || data.length === 0) {
      return null
    }
    
    return data[0].id
  }, [])

  // Import Sales (User-Level, mit user_id für Audit)
  const importSales = useCallback(async (sales: SaleImport[], targetUserId: string): Promise<number> => {
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
  }, [updateProgress, getItemIdByName])

  // Import Expenses (User-Level, mit user_id für Audit)
  const importExpenses = useCallback(async (expenses: ExpenseImport[], targetUserId: string): Promise<number> => {
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
  }, [updateProgress])

  // Generate Cash Movements (Automatic from Sales/Expenses)
  const generateCashMovements = useCallback(async (sales: SaleImport[], expenses: ExpenseImport[], targetUserId: string): Promise<number> => {
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
  }, [updateProgress])

  // Calculate Daily Summaries for Import (Phase 5 - NEW)
  const calculateDailySummariesForImport = useCallback(async (sales: SaleImport[], expenses: ExpenseImport[]): Promise<number> => {
    updateProgress(90, 'Berechne Daily Summaries...')
    
    // Collect all unique dates from imported data
    const allDates = new Set<string>()
    
    // Add sales dates
    sales.forEach(sale => allDates.add(sale.date))
    
    // Add expense dates
    expenses.forEach(expense => allDates.add(expense.date))
    
    const uniqueDates = Array.from(allDates).sort()
    let calculatedSummaries = 0
    
    // Calculate daily summary for each affected date
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
        console.warn(`Konnte Daily Summary Status nicht auf "closed" setzen für ${date}:`, updateError)
      }
      
      calculatedSummaries++
    }
    
    return calculatedSummaries
  }, [updateProgress])

  // Generate Receipt PDFs for Import (Phase 6 - REAL PDF GENERATION)
  const generateReceiptPDFsForSales = useCallback(async (sales: SaleImport[], targetUserId: string): Promise<number> => {
    updateProgress(95, 'Generiere Receipt PDFs...')
    
    let generatedPDFs = 0
    
    console.log('🔍 PDF Generation Debug - Input sales:', sales.length)
    
    // Get all recent sales for this user with complete data
    const { data: recentSales, error: salesError } = await supabase
      .from('sales')
      .select(`
        id,
        total_amount,
        payment_method,
        status,
        notes,
        created_at,
        sale_items (
          id,
          price,
          notes,
          items (
            id,
            name,
            type
          )
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(sales.length * 2) // Get more than we imported to be safe
    
    console.log('🔍 PDF Generation Debug - Found sales:', recentSales?.length || 0)
    
    if (salesError) {
      console.error('🔍 PDF Generation Error:', salesError)
      throw new Error(`Fehler beim Abrufen der Sales für PDF-Generation: ${salesError.message}`)
    }
    
    if (!recentSales || recentSales.length === 0) {
      console.warn('🔍 PDF Generation - No sales found for user:', targetUserId)
      return 0
    }
    
    // Import PDF library dynamically (only for import operations)
    const { pdf } = await import('@react-pdf/renderer')
    const { ReceiptPDF } = await import('@/components/pdf/ReceiptPDF')
    const { createElement } = await import('react')
    
    // For each sale, generate actual PDF
    for (const sale of recentSales) {
      console.log(`🔍 Processing sale ${sale.id} for PDF generation...`)
      
      // Check if document already exists
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('reference_type', 'sale')
        .eq('reference_id', sale.id)
        .maybeSingle()
      
      if (existingDoc) {
        console.log(`🔍 Document already exists for sale ${sale.id}, skipping`)
        continue // Skip if document already exists
      }
      
      try {
        // Transform sale data for PDF component
        const saleForPDF = {
          id: sale.id,
          total_amount: sale.total_amount,
          payment_method: sale.payment_method,
          status: sale.status,
          notes: sale.notes,
          created_at: sale.created_at,
          user_id: targetUserId
        }
        
        const itemsForPDF = sale.sale_items?.map(item => ({
          id: item.id,
          item_id: item.items?.id || '',
          name: item.items?.name || 'Unknown Item',
          price: item.price || 0,
          total: item.price || 0, // For single items, total equals price  
          quantity: 1, // Import always assumes quantity 1
          notes: item.notes || '',
          type: item.items?.type || 'service'
        })) || []
        
        console.log(`🔍 Generating PDF for sale ${sale.id}...`)
        
        // Generate PDF blob
        const pdfElement = createElement(ReceiptPDF, {
          sale: saleForPDF,
          items: itemsForPDF
        })
        
        const pdfBlob = await pdf(pdfElement).toBlob()
        
        console.log(`🔍 PDF generated, size: ${pdfBlob.size} bytes`)
        
        // Upload to Supabase Storage (consistent with useSales.ts)
        const fileName = `receipt_${sale.id}.pdf`
        const filePath = `documents/receipts/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          })
        
        if (uploadError) {
          console.error(`❌ Upload Error für ${fileName}:`, uploadError)
          continue
        }
        
        console.log(`✅ PDF uploaded: ${filePath}`)
        
        // Create document record in database
        const documentData = {
          type: 'receipt',
          reference_type: 'sale',
          reference_id: sale.id,
          file_name: fileName,
          file_path: filePath,
          file_size: pdfBlob.size,
          mime_type: 'application/pdf',
          document_date: sale.created_at.split('T')[0],
          user_id: targetUserId,
          notes: 'Import: Receipt automatisch generiert'
        }
        
        const { error: docError } = await supabase
          .from('documents')
          .insert(documentData)
        
        if (docError) {
          console.error(`❌ Document Record Error für Sale ${sale.id}:`, docError)
        } else {
          console.log(`✅ Document record und PDF erfolgreich erstellt für Sale ${sale.id}`)
          generatedPDFs++
        }
        
      } catch (pdfError) {
        console.error(`❌ PDF Generation Fehler für Sale ${sale.id}:`, pdfError)
        // Continue with next sale
      }
    }
    
    return generatedPDFs
  }, [updateProgress])

  // Generate Daily Report PDFs for closed summaries (Phase 6b - NEW)
  const generateDailyReportPDFs = useCallback(async (sales: SaleImport[], expenses: ExpenseImport[], targetUserId: string): Promise<number> => {
    updateProgress(97, 'Generiere Daily Report PDFs...')
    
    let generatedPDFs = 0
    
    // Get all unique dates from imported data
    const allDates = new Set<string>()
    sales.forEach(sale => allDates.add(sale.date))
    expenses.forEach(expense => allDates.add(expense.date))
    const uniqueDates = Array.from(allDates).sort()
    
    console.log(`🔍 Generating Daily Report PDFs for dates: ${uniqueDates.join(', ')}`)
    
    // Import PDF libraries dynamically
    const { pdf } = await import('@react-pdf/renderer')
    const { DailyReportPDF } = await import('@/components/pdf/DailyReportPDF')
    const { createElement } = await import('react')
    
    for (const date of uniqueDates) {
      try {
        // Get daily summary for this date
        const { data: summary, error: summaryError } = await supabase
          .from('daily_summaries')
          .select('*')
          .eq('report_date', date)
          .single()
        
        if (summaryError || !summary) {
          console.warn(`❌ No daily summary found for ${date}`)
          continue
        }
        
        // Check if daily report PDF already exists
        const { data: existingDoc } = await supabase
          .from('documents')
          .select('id')
          .eq('type', 'daily_report')
          .eq('reference_type', 'report')
          .eq('reference_id', summary.id)
          .maybeSingle()
        
        if (existingDoc) {
          console.log(`🔍 Daily report PDF already exists for ${date}, skipping`)
          continue
        }
        
        // Get transactions for this date
        const { data: salesData } = await supabase
          .from('sales')
          .select(`
            id,
            total_amount,
            payment_method,
            created_at,
            sale_items (
              price,
              items (name)
            )
          `)
          .gte('created_at', `${date}T00:00:00`)
          .lt('created_at', `${date}T23:59:59`)
          .order('created_at', { ascending: true })
        
        const { data: expensesData } = await supabase
          .from('expenses')
          .select('id, amount, description, payment_method, created_at')
          .eq('payment_date', date)
          .order('created_at', { ascending: true })
        
        // Transform data for PDF component
        const transactions = [
          ...(salesData || []).map(sale => ({
            id: sale.id,
            type: 'sale' as const,
            time: sale.created_at.split('T')[1].substring(0, 5),
            description: sale.sale_items?.map(item => item.items?.name).join(', ') || 'Verkauf',
            amount: sale.total_amount,
            payment_method: sale.payment_method,
            running_balance: 0 // Will be calculated by PDF component
          })),
          ...(expensesData || []).map(expense => ({
            id: expense.id,
            type: 'expense' as const,
            time: expense.created_at.split('T')[1].substring(0, 5),
            description: expense.description,
            amount: -expense.amount,
            payment_method: expense.payment_method,
            running_balance: 0 // Will be calculated by PDF component
          }))
        ].sort((a, b) => a.time.localeCompare(b.time))
        
        console.log(`🔍 Generating Daily Report PDF for ${date}...`)
        
        // Generate PDF blob
        const pdfElement = createElement(DailyReportPDF, {
          summary,
          transactions
        })
        
        const pdfBlob = await pdf(pdfElement).toBlob()
        
        console.log(`🔍 Daily Report PDF generated, size: ${pdfBlob.size} bytes`)
        
        // Upload to Supabase Storage (consistent structure)
        const fileName = `daily_report_${date}.pdf`
        const filePath = `documents/daily_reports/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          })
        
        if (uploadError) {
          console.error(`❌ Upload Error für ${fileName}:`, uploadError)
          continue
        }
        
        console.log(`✅ Daily Report PDF uploaded: ${filePath}`)
        
        // Create document record in database
        const documentData = {
          type: 'daily_report',
          reference_type: 'report',
          reference_id: summary.id,
          file_name: fileName,
          file_path: filePath,
          file_size: pdfBlob.size,
          mime_type: 'application/pdf',
          document_date: date,
          user_id: targetUserId,
          notes: 'Import: Daily Report automatisch generiert'
        }
        
        const { error: docError } = await supabase
          .from('documents')
          .insert(documentData)
        
        if (docError) {
          console.error(`❌ Document Record Error für Daily Report ${date}:`, docError)
        } else {
          console.log(`✅ Daily Report document und PDF erfolgreich erstellt für ${date}`)
          generatedPDFs++
        }
        
      } catch (pdfError) {
        console.error(`❌ Daily Report PDF Generation Fehler für ${date}:`, pdfError)
        // Continue with next date
      }
    }
    
    return generatedPDFs
  }, [updateProgress])

  // Generate Expense Receipt PDFs for imported expenses (Phase 6c - NEW)
  const generateExpenseReceiptPDFs = useCallback(async (expenses: ExpenseImport[], targetUserId: string): Promise<number> => {
    updateProgress(98, 'Generiere Expense Receipt PDFs...')
    
    let generatedPDFs = 0
    
    // Import PDF libraries dynamically
    const { pdf } = await import('@react-pdf/renderer')
    const { PlaceholderReceiptPDF } = await import('@/components/pdf/PlaceholderReceiptPDF')
    const { createElement } = await import('react')
    
    console.log(`🔍 Generating Expense Receipt PDFs for ${expenses.length} expenses`)
    
    // Get the actual expenses from database (they should be created by now)
    const { data: dbExpenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(expenses.length * 2) // Get more than imported to be safe
    
    if (expensesError) {
      console.error('🔍 Error loading expenses for PDF generation:', expensesError)
      return 0
    }
    
    if (!dbExpenses || dbExpenses.length === 0) {
      console.warn('🔍 No expenses found for PDF generation')
      return 0
    }
    
    for (const dbExpense of dbExpenses) {
      try {
        // Check if document already exists for this expense
        const { data: existingDoc } = await supabase
          .from('documents')
          .select('id')
          .eq('type', 'expense_receipt')
          .eq('reference_type', 'expense')
          .eq('reference_id', dbExpense.id)
          .maybeSingle()
        
        if (existingDoc) {
          console.log(`🔍 Document already exists for expense ${dbExpense.id}, skipping`)
          continue
        }
        
        console.log(`🔍 Generating PDF for expense ${dbExpense.id}...`)
        
        // Generate PDF blob
        const pdfElement = createElement(PlaceholderReceiptPDF, {
          expense: dbExpense,
          archiveLocation: 'Import - Original physisch archiviert',
          createdBy: 'Import System'
        })
        
        const pdfBlob = await pdf(pdfElement).toBlob()
        
        console.log(`🔍 PDF generated, size: ${pdfBlob.size} bytes`)
        
        // Upload to Supabase Storage
        const fileName = `import-expense-${dbExpense.id}.pdf`
        const filePath = `documents/expense_receipts/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          })
        
        if (uploadError) {
          console.error(`❌ Upload Error für ${fileName}:`, uploadError)
          continue
        }
        
        console.log(`✅ Expense Receipt PDF uploaded: ${filePath}`)
        
        // Create document record in database
        const documentData = {
          type: 'expense_receipt' as const,
          reference_type: 'expense' as const,
          reference_id: dbExpense.id,
          file_name: fileName,
          file_path: filePath,
          file_size: pdfBlob.size,
          mime_type: 'application/pdf',
          notes: 'Import: Physischer Beleg archiviert - Original nicht digital verfügbar',
          payment_method: dbExpense.payment_method,
          document_date: dbExpense.payment_date,
          user_id: targetUserId
        }
        
        const { error: docError } = await supabase
          .from('documents')
          .insert(documentData)
        
        if (docError) {
          console.error(`❌ Document Record Error für Expense ${dbExpense.id}:`, docError)
        } else {
          console.log(`✅ Expense Receipt document erstellt für ${dbExpense.id}`)
          generatedPDFs++
        }
        
      } catch (pdfError) {
        console.error(`❌ PDF Generation Fehler für Expense ${dbExpense.id}:`, pdfError)
        // Continue with next expense
      }
    }
    
    console.log(`🎉 Expense Receipt PDF Generation completed: ${generatedPDFs} PDFs created`)
    return generatedPDFs
  }, [updateProgress])

  // Main Import Function
  const processImport = useCallback(async (
    data: {
      items?: ItemImport[]
      sales?: SaleImport[]
      expenses?: ExpenseImport[]
    },
    config: Partial<ImportConfig> = {}
  ) => {
    const fullConfig = { ...DEFAULT_CONFIG, ...config }
    const startTime = Date.now()

    setState({
      status: 'processing',
      progress: 0,
      currentPhase: 'Initialisierung...',
      results: null,
      errors: []
    })

    try {
      // Phase 1: Validation
      updateProgress(5, 'Validiere Daten...')
      
      const allErrors: string[] = []
      
      if (data.items) {
        const itemErrors = validateItems(data.items)
        allErrors.push(...itemErrors)
      }
      
      if (data.sales) {
        const saleErrors = validateSales(data.sales)
        allErrors.push(...saleErrors)
      }
      
      if (data.expenses) {
        const expenseErrors = validateExpenses(data.expenses)
        allErrors.push(...expenseErrors)
      }

      if (allErrors.length > 0) {
        setState({
          status: 'error',
          progress: 0,
          currentPhase: 'Validierung fehlgeschlagen',
          results: null,
          errors: allErrors
        })
        return
      }

      if (fullConfig.validateOnly) {
        setState({
          status: 'success',
          progress: 100,
          currentPhase: 'Validierung erfolgreich (Dry-Run)',
          results: {
            itemsImported: data.items?.length || 0,
            salesImported: data.sales?.length || 0,
            expensesImported: data.expenses?.length || 0,
            cashMovementsGenerated: 0,
            documentsGenerated: 0,
            dailySummariesCalculated: 0,
            totalProcessingTime: Date.now() - startTime
          },
          errors: []
        })
        return
      }

      // Phase 2: Business Data Import (Items)
      let itemsImported = 0
      if (data.items && data.items.length > 0) {
        itemsImported = await importItems(data.items)
      }

      // Phase 3: User Data Import (Sales & Expenses)
      let salesImported = 0
      let expensesImported = 0
      let cashMovementsGenerated = 0

      if (data.sales && data.sales.length > 0) {
        salesImported = await importSales(data.sales, fullConfig.targetUserId)
      }

      if (data.expenses && data.expenses.length > 0) {
        expensesImported = await importExpenses(data.expenses, fullConfig.targetUserId)
      }

      // Phase 4: Cash Movement Generation
      if ((data.sales && data.sales.length > 0) || (data.expenses && data.expenses.length > 0)) {
        cashMovementsGenerated = await generateCashMovements(
          data.sales || [], 
          data.expenses || [], 
          fullConfig.targetUserId
        )
      }

      // Phase 5: Daily Summary Calculation (NEW!)
      let dailySummariesCalculated = 0
      if ((data.sales && data.sales.length > 0) || (data.expenses && data.expenses.length > 0)) {
        dailySummariesCalculated = await calculateDailySummariesForImport(
          data.sales || [], 
          data.expenses || []
        )
      }

      // Phase 6: Document Generation (Receipt PDFs) - NEW!
      let documentsGenerated = 0
      if (data.sales && data.sales.length > 0) {
        documentsGenerated = await generateReceiptPDFsForSales(data.sales, fullConfig.targetUserId)
      }

      // Phase 6b: Daily Report PDF Generation - NEW!
      let dailyReportsGenerated = 0
      if ((data.sales && data.sales.length > 0) || (data.expenses && data.expenses.length > 0)) {
        dailyReportsGenerated = await generateDailyReportPDFs(
          data.sales || [], 
          data.expenses || [], 
          fullConfig.targetUserId
        )
      }

      // Phase 6c: Expense Receipt PDF Generation - NEW!
      let expenseReceiptsGenerated = 0
      if (data.expenses && data.expenses.length > 0) {
        expenseReceiptsGenerated = await generateExpenseReceiptPDFs(
          data.expenses,
          fullConfig.targetUserId
        )
      }

      const totalDocumentsGenerated = documentsGenerated + dailyReportsGenerated + expenseReceiptsGenerated

      updateProgress(100, 'Import erfolgreich abgeschlossen')

      setState({
        status: 'success',
        progress: 100,
        currentPhase: 'Abgeschlossen',
        results: {
          itemsImported,
          salesImported,
          expensesImported,
          cashMovementsGenerated,
          documentsGenerated: totalDocumentsGenerated,
          dailySummariesCalculated,
          totalProcessingTime: Date.now() - startTime
        },
        errors: []
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
      setState({
        status: 'error',
        progress: 0,
        currentPhase: 'Fehler beim Import',
        results: null,
        errors: [errorMessage]
      })
    }
  }, [updateProgress, validateItems, validateSales, validateExpenses, importItems, importSales, importExpenses, generateCashMovements, calculateDailySummariesForImport, generateReceiptPDFsForSales, generateDailyReportPDFs, generateExpenseReceiptPDFs, getItemIdByName])

  const resetState = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      currentPhase: '',
      results: null,
      errors: []
    })
  }, [])

  return {
    state,
    processImport,
    resetState,
    // Constants für externe Verwendung
    SYSTEM_USER_ID,
    DEFAULT_CONFIG
  }
}