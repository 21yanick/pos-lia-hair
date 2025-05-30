// Import PDF Generation Services
// Handles all PDF generation for import processes

import { supabase } from '@/lib/supabase/client'
import type { SaleImport, ExpenseImport } from '@/lib/types/import'

// =================================
// Progress Callback Type
// =================================

type ProgressCallback = (progress: number, phase: string) => void

// =================================
// Common PDF Upload & Document Creation
// =================================

async function uploadPDFToStorage(
  pdfBlob: Blob, 
  filePath: string, 
  fileName: string
): Promise<void> {
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (uploadError) {
    throw new Error(`Upload Error für ${fileName}: ${uploadError.message}`)
  }

  console.log(`✅ PDF uploaded: ${filePath}`)
}

async function createDocumentRecord(
  documentData: {
    type: 'receipt' | 'daily_report' | 'expense_receipt'
    reference_type: 'sale' | 'report' | 'expense'
    reference_id: string
    file_name: string
    file_path: string
    file_size: number
    mime_type: string
    document_date: string
    user_id: string
    notes: string
    payment_method?: string
  }
): Promise<void> {
  const { error: docError } = await supabase
    .from('documents')
    .insert(documentData)

  if (docError) {
    throw new Error(`Document Record Error: ${docError.message}`)
  }

  console.log(`✅ Document record erstellt für ${documentData.reference_type} ${documentData.reference_id}`)
}

// =================================
// Receipt PDF Generation
// =================================

export async function generateReceiptPDFsForSales(
  sales: SaleImport[], 
  targetUserId: string,
  updateProgress: ProgressCallback
): Promise<number> {
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
        user_id: targetUserId,
        // Settlement fields (null for import data)
        gross_amount: null,
        provider_fee: null,
        net_amount: null,
        settlement_status: 'pending' as const,
        settlement_date: null,
        provider_reference_id: null
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
      
      // Generate actual PDF using React-PDF
      try {
        // Import PDF library dynamically
        const { pdf } = await import('@react-pdf/renderer')
        const { ReceiptPDF } = await import('@/components/pdf/ReceiptPDF')
        const { createElement } = await import('react')
        
        // Generate PDF blob
        const pdfDocument = createElement(ReceiptPDF, {
          sale: saleForPDF,
          items: itemsForPDF
        })
        
        const pdfBlob = await pdf(pdfDocument).toBlob()
        
        console.log(`🔍 PDF generated successfully, size: ${pdfBlob.size} bytes`)
        
        // Upload to Supabase Storage
        const fileName = `receipt_${sale.id}.pdf`
        const filePath = `documents/receipts/${fileName}`
        
        await uploadPDFToStorage(pdfBlob, filePath, fileName)
        
        // Create document record in database
        await createDocumentRecord({
          type: 'receipt',
          reference_type: 'sale',
          reference_id: sale.id,
          file_name: fileName,
          file_path: filePath,
          file_size: pdfBlob.size,
          mime_type: 'application/pdf',
          document_date: sale.created_at ? sale.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          user_id: targetUserId,
          notes: 'Import: Receipt automatisch generiert'
        })
        
        generatedPDFs++
        
      } catch (pdfError) {
        console.error(`❌ PDF Library Error für Sale ${sale.id}:`, pdfError)
        
        // Fallback: Create placeholder PDF if React-PDF fails
        const placeholderPDF = new Blob([
          `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</ProcSet[/PDF/Text]>>>>endobj
xref
0 4
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
228
%%EOF`
        ], { type: 'application/pdf' })
        
        const fileName = `receipt_${sale.id}.pdf`
        const filePath = `documents/receipts/${fileName}`
        
        await uploadPDFToStorage(placeholderPDF, filePath, fileName)
        
        await createDocumentRecord({
          type: 'receipt',
          reference_type: 'sale',
          reference_id: sale.id,
          file_name: fileName,
          file_path: filePath,
          file_size: placeholderPDF.size,
          mime_type: 'application/pdf',
          document_date: sale.created_at ? sale.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          user_id: targetUserId,
          notes: 'Import: Placeholder Receipt (PDF generation failed)'
        })
        
        generatedPDFs++
      }
      
    } catch (error) {
      console.error(`❌ Receipt PDF Generation Fehler für Sale ${sale.id}:`, error)
      // Continue with next sale
    }
  }
  
  return generatedPDFs
}

// =================================
// Daily Report PDF Generation
// =================================

export async function generateDailyReportPDFs(
  sales: SaleImport[], 
  expenses: ExpenseImport[], 
  targetUserId: string,
  updateProgress: ProgressCallback
): Promise<number> {
  updateProgress(97, 'Generiere Daily Report PDFs...')
  
  let generatedPDFs = 0
  
  // Get all unique dates from imported data
  const allDates = new Set<string>()
  sales.forEach(sale => allDates.add(sale.date))
  expenses.forEach(expense => allDates.add(expense.date))
  const uniqueDates = Array.from(allDates).sort()
  
  console.log(`🔍 Generating Daily Report PDFs for dates: ${uniqueDates.join(', ')}`)
  
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
          time: sale.created_at ? sale.created_at.split('T')[1].substring(0, 5) : '12:00',
          description: sale.sale_items?.map(item => item.items?.name).join(', ') || 'Verkauf',
          amount: sale.total_amount,
          payment_method: sale.payment_method,
          running_balance: 0 // Will be calculated by PDF component
        })),
        ...(expensesData || []).map(expense => ({
          id: expense.id,
          type: 'expense' as const,
          time: expense.created_at ? expense.created_at.split('T')[1].substring(0, 5) : '12:00',
          description: expense.description,
          amount: -expense.amount,
          payment_method: expense.payment_method,
          running_balance: 0 // Will be calculated by PDF component
        }))
      ].sort((a, b) => a.time.localeCompare(b.time))
      
      console.log(`🔍 Generating Daily Report PDF for ${date}...`)
      
      try {
        // Import PDF libraries dynamically
        const { pdf } = await import('@react-pdf/renderer')
        const { DailyReportPDF } = await import('@/components/pdf/DailyReportPDF')
        const { createElement } = await import('react')
        
        // Generate PDF blob
        const pdfDocument = createElement(DailyReportPDF, {
          summary,
          transactions,
          date
        })
        
        const pdfBlob = await pdf(pdfDocument).toBlob()
        
        console.log(`🔍 Daily Report PDF generated, size: ${pdfBlob.size} bytes`)
        
        // Upload to Supabase Storage
        const fileName = `daily_report_${date}.pdf`
        const filePath = `documents/daily_reports/${fileName}`
        
        await uploadPDFToStorage(pdfBlob, filePath, fileName)
        
        // Create document record in database
        await createDocumentRecord({
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
        })
        
        generatedPDFs++
        
      } catch (pdfError) {
        console.error(`❌ Daily Report PDF Error für ${date}:`, pdfError)
        // Continue with next date
      }
      
    } catch (error) {
      console.error(`❌ Daily Report PDF Generation Fehler für ${date}:`, error)
      // Continue with next date
    }
  }
  
  return generatedPDFs
}

// =================================
// Expense Receipt PDF Generation
// =================================

export async function generateExpenseReceiptPDFs(
  expenses: ExpenseImport[], 
  targetUserId: string,
  updateProgress: ProgressCallback
): Promise<number> {
  updateProgress(98, 'Generiere Expense Receipt PDFs...')
  
  let generatedPDFs = 0
  
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
      
      try {
        // Import PDF libraries dynamically
        const { pdf } = await import('@react-pdf/renderer')
        const { PlaceholderReceiptPDF } = await import('@/components/pdf/PlaceholderReceiptPDF')
        const { createElement } = await import('react')
        
        // Generate PDF blob
        const pdfDocument = createElement(PlaceholderReceiptPDF, {
          expense: dbExpense
        })
        
        const pdfBlob = await pdf(pdfDocument).toBlob()
        
        console.log(`🔍 Expense PDF generated, size: ${pdfBlob.size} bytes`)
        
        // Upload to Supabase Storage
        const fileName = `import-expense-${dbExpense.id}.pdf`
        const filePath = `documents/expense_receipts/${fileName}`
        
        await uploadPDFToStorage(pdfBlob, filePath, fileName)
        
        // Create document record in database
        await createDocumentRecord({
          type: 'expense_receipt',
          reference_type: 'expense',
          reference_id: dbExpense.id,
          file_name: fileName,
          file_path: filePath,
          file_size: pdfBlob.size,
          mime_type: 'application/pdf',
          document_date: dbExpense.payment_date,
          user_id: targetUserId,
          notes: 'Import: Physischer Beleg archiviert - Original nicht digital verfügbar',
          payment_method: dbExpense.payment_method
        })
        
        generatedPDFs++
        
      } catch (pdfError) {
        console.error(`❌ Expense PDF Library Error für ${dbExpense.id}:`, pdfError)
        
        // Fallback: Create placeholder text PDF
        const placeholderPDF = new Blob([
          `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</ProcSet[/PDF/Text]>>>>endobj
xref
0 4
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
228
%%EOF`
        ], { type: 'application/pdf' })
        
        const fileName = `import-expense-${dbExpense.id}.pdf`
        const filePath = `documents/expense_receipts/${fileName}`
        
        await uploadPDFToStorage(placeholderPDF, filePath, fileName)
        
        await createDocumentRecord({
          type: 'expense_receipt',
          reference_type: 'expense',
          reference_id: dbExpense.id,
          file_name: fileName,
          file_path: filePath,
          file_size: placeholderPDF.size,
          mime_type: 'application/pdf',
          document_date: dbExpense.payment_date,
          user_id: targetUserId,
          notes: 'Import: Placeholder Receipt (PDF generation failed)',
          payment_method: dbExpense.payment_method
        })
        
        generatedPDFs++
      }
      
    } catch (error) {
      console.error(`❌ PDF Generation Fehler für Expense ${dbExpense.id}:`, error)
      // Continue with next expense
    }
  }
  
  console.log(`🎉 Expense Receipt PDF Generation completed: ${generatedPDFs} PDFs created`)
  return generatedPDFs
}