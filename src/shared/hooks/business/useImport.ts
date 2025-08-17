'use client'

import { useCallback, useState } from 'react'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import {
  // generateDailyReportPDFs, // Disabled - Banking Module will replace Daily Reports
  generateExpenseReceiptPDFs,
  generateReceiptPDFsForSales,
} from '@/shared/services/importPdfServices'
import {
  calculateDailySummariesForImport,
  generateCashMovements,
  importBankAccounts,
  importExpenses,
  importItems,
  importOwnerTransactions,
  importSales,
  importSuppliers,
  importUsers,
} from '@/shared/services/importServices'

// Import Services
import { validateImportData } from '@/shared/services/importValidation'
// Import Types
import type { ImportConfig, ImportDataContainer, ImportState } from '@/shared/types/import'
import { DEFAULT_CONFIG as CONFIG, SYSTEM_USER_ID as SYSTEM_ID } from '@/shared/types/import'

export function useImport() {
  const [state, setState] = useState<ImportState>({
    status: 'idle',
    progress: 0,
    currentPhase: '',
    results: null,
    errors: [],
  })

  // 🔒 SECURITY: Multi-Tenant Organization Context
  const { currentOrganization, user } = useCurrentOrganization()

  const updateProgress = useCallback((progress: number, phase: string) => {
    setState((prev) => ({
      ...prev,
      progress,
      currentPhase: phase,
    }))
  }, [])

  // Note: addError is available but not currently used in the orchestrator
  // Individual services handle their own error throwing
  const addError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      errors: [...prev.errors, error],
    }))
  }, [])

  // Main Import Function (Multi-Tenant)
  const processImport = useCallback(
    async (data: ImportDataContainer, config: Partial<ImportConfig> = {}) => {
      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        setState({
          status: 'error',
          progress: 0,
          currentPhase: 'Fehler: Keine Organization ausgewählt',
          results: null,
          errors: ['Keine Organization ausgewählt. Import abgebrochen.'],
        })
        return
      }

      if (!user) {
        setState({
          status: 'error',
          progress: 0,
          currentPhase: 'Fehler: Nicht angemeldet',
          results: null,
          errors: ['Nicht angemeldet. Import abgebrochen.'],
        })
        return
      }

      // Multi-Tenant Config: Use authenticated user and organization
      const fullConfig = {
        ...CONFIG,
        ...config,
        targetUserId: user.id, // 🔒 Use authenticated user instead of hardcoded
        organizationId: currentOrganization.id, // 🔒 SECURITY: Organization-scoped
      }
      const startTime = Date.now()

      setState({
        status: 'processing',
        progress: 0,
        currentPhase: 'Initialisierung (Multi-Tenant)...',
        results: null,
        errors: [],
      })

      try {
        // Phase 1: Validation
        updateProgress(5, 'Validiere Daten...')

        const validationResult = validateImportData(data)

        if (!validationResult.isValid) {
          setState({
            status: 'error',
            progress: 0,
            currentPhase: 'Validierung fehlgeschlagen',
            results: null,
            errors: validationResult.errors,
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
              usersImported: data.users?.length || 0,
              ownerTransactionsImported: data.owner_transactions?.length || 0,
              bankAccountsImported: data.bank_accounts?.length || 0,
              suppliersImported: data.suppliers?.length || 0,
              salesImported: data.sales?.length || 0,
              expensesImported: data.expenses?.length || 0,
              cashMovementsGenerated: 0,
              documentsGenerated: 0,
              dailySummariesCalculated: 0,
              totalProcessingTime: Date.now() - startTime,
            },
            errors: [],
          })
          return
        }

        // Phase 2: Business Data Import (Items, Users, Owner Transactions, Bank Accounts)
        let itemsImported = 0
        let usersImported = 0
        let ownerTransactionsImported = 0
        let bankAccountsImported = 0
        let suppliersImported = 0

        if (data.items && data.items.length > 0) {
          itemsImported = await importItems(data.items, updateProgress)
        }

        if (data.users && data.users.length > 0) {
          usersImported = await importUsers(data.users, updateProgress)
        }

        if (data.owner_transactions && data.owner_transactions.length > 0) {
          ownerTransactionsImported = await importOwnerTransactions(
            data.owner_transactions,
            fullConfig.targetUserId,
            updateProgress
          )
        }

        if (data.bank_accounts && data.bank_accounts.length > 0) {
          bankAccountsImported = await importBankAccounts(
            data.bank_accounts,
            fullConfig.targetUserId,
            updateProgress
          )
        }

        if (data.suppliers && data.suppliers.length > 0) {
          suppliersImported = await importSuppliers(
            data.suppliers,
            fullConfig.targetUserId,
            updateProgress
          )
        }

        // Phase 3: User Data Import (Sales & Expenses)
        let salesImported = 0
        let expensesImported = 0

        if (data.sales && data.sales.length > 0) {
          salesImported = await importSales(data.sales, fullConfig.targetUserId, updateProgress)
        }

        if (data.expenses && data.expenses.length > 0) {
          expensesImported = await importExpenses(
            data.expenses,
            fullConfig.targetUserId,
            updateProgress
          )
        }

        // Phase 4: Cash Movement Generation
        let cashMovementsGenerated = 0
        if ((data.sales && data.sales.length > 0) || (data.expenses && data.expenses.length > 0)) {
          cashMovementsGenerated = await generateCashMovements(
            data.sales || [],
            data.expenses || [],
            fullConfig.targetUserId,
            updateProgress
          )
        }

        // Phase 5: Daily Summary Calculation
        let dailySummariesCalculated = 0
        if ((data.sales && data.sales.length > 0) || (data.expenses && data.expenses.length > 0)) {
          dailySummariesCalculated = await calculateDailySummariesForImport(
            data.sales || [],
            data.expenses || [],
            updateProgress
          )
        }

        // Phase 6: Document Generation (PDF Generation)
        let documentsGenerated = 0

        // 6a: Receipt PDFs for Sales
        if (data.sales && data.sales.length > 0) {
          const receiptPDFs = await generateReceiptPDFsForSales(
            data.sales,
            fullConfig.targetUserId,
            updateProgress
          )
          documentsGenerated += receiptPDFs
        }

        // 6b: Daily Report PDFs
        if ((data.sales && data.sales.length > 0) || (data.expenses && data.expenses.length > 0)) {
          // Daily Report PDFs disabled - Banking Module will replace Daily Reports
          const dailyReportPDFs: { id: string; filePath: string }[] = []
          // await generateDailyReportPDFs(data.sales || [], data.expenses || [], fullConfig.targetUserId, updateProgress)
          documentsGenerated += dailyReportPDFs.length
        }

        // 6c: Expense Receipt PDFs
        if (data.expenses && data.expenses.length > 0) {
          const expenseReceiptPDFs = await generateExpenseReceiptPDFs(
            data.expenses,
            fullConfig.targetUserId,
            updateProgress
          )
          documentsGenerated += expenseReceiptPDFs
        }

        updateProgress(100, 'Import erfolgreich abgeschlossen')

        setState({
          status: 'success',
          progress: 100,
          currentPhase: 'Abgeschlossen',
          results: {
            itemsImported,
            usersImported,
            ownerTransactionsImported,
            bankAccountsImported,
            suppliersImported,
            salesImported,
            expensesImported,
            cashMovementsGenerated,
            documentsGenerated,
            dailySummariesCalculated,
            totalProcessingTime: Date.now() - startTime,
          },
          errors: [],
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
        setState({
          status: 'error',
          progress: 0,
          currentPhase: 'Fehler beim Import',
          results: null,
          errors: [errorMessage],
        })
      }
    },
    [updateProgress, currentOrganization, user]
  )

  const resetState = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      currentPhase: '',
      results: null,
      errors: [],
    })
  }, [])

  return {
    state,
    processImport,
    resetState,
    // Constants für externe Verwendung
    SYSTEM_USER_ID: SYSTEM_ID,
    DEFAULT_CONFIG: CONFIG,
  }
}

// Re-export types for backwards compatibility
export type {
  ExpenseImport,
  ImportConfig,
  ImportResults,
  ImportState,
  ItemImport,
  SaleImport,
} from '@/shared/types/import'
