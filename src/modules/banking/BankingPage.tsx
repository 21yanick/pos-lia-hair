"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { CreditCard, Building2, AlertCircle, Loader2, ArrowRightLeft, ArrowUpToLine, ArrowDownToLine, Upload, FileBarChart } from "lucide-react"
import { useBankingData } from './hooks/useBankingData'
import { CashTransferDialog } from './components/CashTransferDialog'
import { BankImportDialog } from './components/BankImportDialog'
import { ProviderImportDialog } from './components/ProviderImportDialog'
import { OwnerTransactionDialog } from './components/OwnerTransactionDialog'
import { formatDateForDisplay } from '@/shared/utils/dateUtils'
import { 
  EnhancedProviderTables,
  EnhancedBankTables
} from './components/intelligent'
import { ReconciliationReportTab } from './components/ReconciliationReportTab'
import { supabase } from '@/shared/lib/supabase/client'

export function BankingPage() {
  // Selection state for click-to-connect
  const [selectedSale, setSelectedSale] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  
  // Bank matching state (simplified for EnhancedBankTables)
  const [selectedBankTransaction, setSelectedBankTransaction] = useState<string | null>(null)
  const [selectedBankItems, setSelectedBankItems] = useState<string[]>([])
  const [isMatching, setIsMatching] = useState(false)

  // Cash Transfer Dialog state
  const [cashTransferDialog, setCashTransferDialog] = useState<{
    isOpen: boolean
    direction: 'to_bank' | 'from_bank'
  }>({ isOpen: false, direction: 'to_bank' })

  // Bank Import Dialog state
  const [bankImportOpen, setBankImportOpen] = useState(false)

  // Provider Import Dialog state
  const [providerImportOpen, setProviderImportOpen] = useState(false)

  // Owner Transaction Dialog state
  const [ownerTransactionDialog, setOwnerTransactionDialog] = useState<{
    isOpen: boolean
    transactionType: 'deposit' | 'expense' | 'withdrawal'
  }>({ isOpen: false, transactionType: 'deposit' })

  // Real data from Banking API  
  const {
    unmatchedSales,
    unmatchedProviderReports,
    stats,
    isLoading,
    error,
    handleProviderMatch,
    refetchData,
    bankAccounts,
    ownerBalance,
    handleProviderImportSuccess
  } = useBankingData()

  // Get first bank account (Raiffeisen)
  const raiffeisenAccount = bankAccounts?.[0]

  // Provider matching (Tab 1)
  const handleProviderMatchClick = async () => {
    if (!selectedSale || !selectedProvider) return
    
    setIsMatching(true)
    const success = await handleProviderMatch(selectedSale, selectedProvider)
    
    if (success) {
      setSelectedSale(null)
      setSelectedProvider(null)
    }
    setIsMatching(false)
  }

  // Enhanced Bank Matching Handlers for EnhancedBankTables
  const handleBankTransactionSelect = (transactionId: string) => {
    setSelectedBankTransaction(transactionId)
    setSelectedBankItems([]) // Reset items when bank transaction changes
  }

  const handleBankItemsSelect = (itemIds: string[]) => {
    setSelectedBankItems(itemIds)
  }

  const handleBankMatchComplete = () => {
    // Reset state after successful match
    setSelectedBankTransaction(null)
    setSelectedBankItems([])
    // EnhancedBankTables handles the actual matching internally
  }

  // Cash Transfer handlers
  const openCashTransferDialog = (direction: 'to_bank' | 'from_bank') => {
    setCashTransferDialog({ isOpen: true, direction })
  }

  const closeCashTransferDialog = () => {
    setCashTransferDialog({ isOpen: false, direction: 'to_bank' })
  }

  const handleCashTransferSuccess = () => {
    // Refresh banking data to show new cash movement in Tab 2
    refetchData()
  }

  // Bank Import handlers
  const openBankImportDialog = () => {
    setBankImportOpen(true)
  }

  const closeBankImportDialog = () => {
    setBankImportOpen(false)
  }

  const handleBankImportSuccess = () => {
    // Refresh banking data to show new bank transactions in Tab 2
    refetchData()
  }

  // Provider Import handlers
  const openProviderImportDialog = () => {
    setProviderImportOpen(true)
  }

  const closeProviderImportDialog = () => {
    setProviderImportOpen(false)
  }

  const handleProviderImportSuccessLocal = async () => {
    // Refresh banking data to show new provider reports in Tab 1
    await handleProviderImportSuccess()
    // console.log('Banking data refreshed after provider import')
  }

  // Owner Transaction handlers
  const openOwnerTransactionDialog = (transactionType: 'deposit' | 'expense' | 'withdrawal') => {
    setOwnerTransactionDialog({ isOpen: true, transactionType })
  }

  const closeOwnerTransactionDialog = () => {
    setOwnerTransactionDialog({ isOpen: false, transactionType: 'deposit' })
  }

  const handleOwnerTransactionSuccess = () => {
    // Refresh banking data to show new owner transactions in Tab 2 (if bank_transfer)
    refetchData()
  }

  // Get current user ID from auth
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUserId(session?.user?.id || null)
    }
    getUser()
  }, [])

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header - Mobile Centered */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold">Banking</h1>
      </div>
      
      {/* Action Buttons - Separated from Header */}
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto lg:max-w-none lg:mx-0">
          {/* Bank Transfer Buttons */}
          <Button
            onClick={() => openCashTransferDialog('to_bank')}
            variant="outline"
            className="h-14 sm:h-12 flex items-center justify-center gap-3 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground px-4 py-3 transition-all active:scale-95 group"
          >
            <ArrowUpToLine className="h-5 w-5 flex-shrink-0 group-hover:animate-pulse" />
            <div className="text-center sm:text-left">
              <div className="text-sm font-semibold">Bank Einzahlung</div>
              <div className="text-xs opacity-75">Geld in Bank einzahlen</div>
            </div>
          </Button>
          
          <Button
            onClick={() => openCashTransferDialog('from_bank')}
            variant="outline"
            className="h-14 sm:h-12 flex items-center justify-center gap-3 text-chart-3 border-chart-3 hover:bg-chart-3 hover:text-background px-4 py-3 transition-all active:scale-95 group"
          >
            <ArrowDownToLine className="h-5 w-5 flex-shrink-0 group-hover:animate-pulse" />
            <div className="text-center sm:text-left">
              <div className="text-sm font-semibold">Bank Abhebung</div>
              <div className="text-xs opacity-75">Geld von Bank abheben</div>
            </div>
          </Button>
          
          {/* Owner Transaction Buttons */}
          <Button 
            onClick={() => openOwnerTransactionDialog('deposit')}
            variant="outline"
            className="h-14 sm:h-12 flex items-center justify-center gap-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 py-3 transition-all active:scale-95 group"
          >
            <span className="text-xl group-hover:animate-bounce">💰</span>
            <div className="text-center sm:text-left">
              <div className="text-sm font-semibold">Geschäft Einzahlung</div>
              <div className="text-xs opacity-75">Geld ins Geschäft</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => openOwnerTransactionDialog('withdrawal')}
            variant="outline"
            className="h-14 sm:h-12 flex items-center justify-center gap-3 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground px-4 py-3 transition-all active:scale-95 group"
          >
            <span className="text-xl group-hover:animate-bounce">💸</span>
            <div className="text-center sm:text-left">
              <div className="text-sm font-semibold">Geschäft Entnahme</div>
              <div className="text-xs opacity-75">Geld aus Geschäft</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={refetchData}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Bank Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Bank Balance Card */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-3xl font-bold text-chart-3">
                {raiffeisenAccount ? `${raiffeisenAccount.current_balance.toFixed(2)}` : '0.00'} CHF
              </div>
            )}
            <p className="text-sm text-muted-foreground flex items-center mt-2">
              <CreditCard className="h-4 w-4 mr-1" />
              Raiffeisen Bank Balance
            </p>
            {raiffeisenAccount?.last_statement_date && (
              <p className="text-xs text-muted-foreground mt-1">
                Letzter Import: {formatDateForDisplay(raiffeisenAccount.last_statement_date)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Owner Balance Card */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className={`text-3xl font-bold ${
                ownerBalance && ownerBalance.net_balance > 0 
                  ? 'text-primary' 
                  : ownerBalance && ownerBalance.net_balance < 0 
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              }`}>
                {ownerBalance ? 
                  `${ownerBalance.net_balance > 0 ? '+' : ''}${ownerBalance.net_balance.toFixed(2)}` : 
                  '0.00'
                } CHF
              </div>
            )}
            <p className="text-sm text-muted-foreground flex items-center mt-2">
              <Building2 className="h-4 w-4 mr-1" />
              Owner Darlehen
            </p>
            {ownerBalance && (
              <p className="text-xs text-muted-foreground mt-1">
                {ownerBalance.net_balance > 0 
                  ? 'Business schuldet Owner' 
                  : ownerBalance.net_balance < 0 
                    ? 'Owner schuldet Business'
                    : 'Ausgeglichen'
                }
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats ? stats.unmatchedBankTransactions + stats.unmatchedSales : 0}
              </div>
            )}
            <p className="text-sm text-muted-foreground flex items-center mt-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              Offene Abgleiche
            </p>
            {stats && (
              <p className="text-xs text-muted-foreground mt-1">
                {stats.unmatchedSales} Sales, {stats.unmatchedBankTransactions} Bank
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Three-Tab System - Mobile Optimized */}
      <Tabs defaultValue="provider" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-12 sm:h-10">
          <TabsTrigger value="provider" className="h-11 sm:h-9 px-2 sm:px-3 flex items-center justify-center gap-2 sm:gap-1 text-xs sm:text-sm">
            <CreditCard className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Provider-Gebühren</span>
            <span className="sm:hidden font-medium">Provider</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="h-11 sm:h-9 px-2 sm:px-3 flex items-center justify-center gap-2 sm:gap-1 text-xs sm:text-sm">
            <Building2 className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Bank-Abgleich</span>
            <span className="sm:hidden font-medium">Bank</span>
          </TabsTrigger>
          <TabsTrigger value="report" className="h-11 sm:h-9 px-2 sm:px-3 flex items-center justify-center gap-2 sm:gap-1 text-xs sm:text-sm">
            <FileBarChart className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Abgleich-Bericht</span>
            <span className="sm:hidden font-medium">Bericht</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Provider Settlements */}
        <TabsContent value="provider" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">POS Sales ↔ Provider Settlements</h2>
            <div className="flex gap-2">
              <Button 
                onClick={openProviderImportDialog}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import TWINT/SumUp
              </Button>
              <Button 
                onClick={handleProviderMatchClick}
                disabled={!selectedSale || !selectedProvider || isMatching}
              >
                {isMatching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                )}
                {isMatching ? 'Matching...' : 'Match Selected'}
              </Button>
            </div>
          </div>

          {/* Enhanced Provider Tables with Intelligent Matching */}
          <EnhancedProviderTables
            selectedSale={selectedSale}
            selectedProvider={selectedProvider}
            onSaleSelect={setSelectedSale}
            onProviderSelect={setSelectedProvider}
            onMatchComplete={refetchData}
          />
        </TabsContent>

        {/* Tab 2: Bank Reconciliation - Enhanced 2-Column Design */}
        <TabsContent value="bank" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bank Settlement & Matching</h2>
            <div className="flex gap-2">
              <Button 
                onClick={openBankImportDialog}
                variant="outline"
                className="flex items-center gap-2"
                disabled={!raiffeisenAccount}
              >
                <Upload className="h-4 w-4" />
                Bank-Daten importieren
              </Button>
            </div>
          </div>


          {/* Enhanced Bank Tables - 2 Column Design with Settlement Detection */}
          <EnhancedBankTables
            selectedBankTransaction={selectedBankTransaction}
            selectedItems={selectedBankItems}
            onBankTransactionSelect={handleBankTransactionSelect}
            onItemsSelect={handleBankItemsSelect}
            onMatchComplete={handleBankMatchComplete}
          />
        </TabsContent>

        {/* Tab 3: Reconciliation Report */}
        <TabsContent value="report" className="space-y-4">
          <ReconciliationReportTab />
        </TabsContent>
      </Tabs>

      {/* Cash Transfer Dialog */}
      <CashTransferDialog
        isOpen={cashTransferDialog.isOpen}
        direction={cashTransferDialog.direction}
        onClose={closeCashTransferDialog}
        onSuccess={handleCashTransferSuccess}
      />

      {/* Bank Import Dialog */}
      {raiffeisenAccount && currentUserId && (
        <BankImportDialog
          isOpen={bankImportOpen}
          bankAccountId={raiffeisenAccount.id}
          userId={currentUserId}
          onClose={closeBankImportDialog}
          onSuccess={handleBankImportSuccess}
        />
      )}

      {/* Provider Import Dialog */}
      {currentUserId && (
        <ProviderImportDialog
          isOpen={providerImportOpen}
          userId={currentUserId}
          onClose={closeProviderImportDialog}
          onSuccess={handleProviderImportSuccessLocal}
        />
      )}

      {/* Owner Transaction Dialog */}
      <OwnerTransactionDialog
        isOpen={ownerTransactionDialog.isOpen}
        transactionType={ownerTransactionDialog.transactionType}
        onClose={closeOwnerTransactionDialog}
        onSuccess={handleOwnerTransactionSuccess}
      />
    </div>
  )
}