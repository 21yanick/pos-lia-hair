"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { CreditCard, Building2, ArrowRightLeft, CheckCircle2, AlertCircle, Loader2, ArrowUpToLine, ArrowDownToLine, Upload } from "lucide-react"
import { useBankingData } from './hooks/useBankingData'
import { CashTransferDialog } from './components/CashTransferDialog'
import { BankImportDialog } from './components/BankImportDialog'
import { ProviderImportDialog } from './components/ProviderImportDialog'
import { OwnerTransactionDialog } from './components/OwnerTransactionDialog'
import { 
  ProviderAutoMatchButtonV2, 
  EnhancedProviderTables,
  ProviderSummaryDashboard, 
  BankMatchSuggestions 
} from './components/intelligent'
import { supabase } from '@/shared/lib/supabase/client'

export function BankingPage() {
  // Selection state for click-to-connect
  const [selectedSale, setSelectedSale] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
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
    unmatchedBankTransactions,
    availableForMatching,
    stats,
    isLoading,
    error,
    handleProviderMatch,
    handleBankMatch,
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

  // Bank matching (Tab 2)
  const handleBankMatchClick = async () => {
    if (!selectedBank || selectedItems.length === 0) return
    
    setIsMatching(true)
    
    // Find selected items with their data
    const matchedItems = selectedItems.map(itemId => {
      const item = availableForMatching.find(i => i.id === itemId)
      if (!item) throw new Error(`Item ${itemId} not found`)
      
      return {
        type: item.item_type,
        id: item.id,
        amount: Math.abs(item.amount)
      }
    })
    
    const success = await handleBankMatch(selectedBank, matchedItems)
    
    if (success) {
      setSelectedBank(null)
      setSelectedItems([])
    }
    setIsMatching(false)
  }

  // Multi-select for Tab 2
  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
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
    console.log('Banking data refreshed after provider import')
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banking</h1>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Cash Transfer Buttons */}
          <Button
            onClick={() => openCashTransferDialog('to_bank')}
            variant="outline"
            className="flex items-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <ArrowUpToLine className="h-4 w-4" />
            Geld in Bank einzahlen
          </Button>
          <Button
            onClick={() => openCashTransferDialog('from_bank')}
            variant="outline" 
            className="flex items-center gap-2 text-chart-3 border-chart-3 hover:bg-chart-3 hover:text-background"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Geld von Bank abheben
          </Button>
          
          {/* Owner Transaction Buttons */}
          <Button 
            onClick={() => openOwnerTransactionDialog('deposit')}
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            💰 Geld ins Geschäft einzahlen
          </Button>
          <Button 
            onClick={() => openOwnerTransactionDialog('withdrawal')}
            variant="outline" 
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            💸 Geld aus Geschäft entnehmen
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
                Letzter Import: {new Date(raiffeisenAccount.last_statement_date).toLocaleDateString()}
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

      {/* Two-Tab System */}
      <Tabs defaultValue="provider" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="provider">
            <CreditCard className="h-4 w-4 mr-2" />
            Provider-Gebühren
          </TabsTrigger>
          <TabsTrigger value="bank">
            <Building2 className="h-4 w-4 mr-2" />
            Bank-Abgleich
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

        {/* Tab 2: Bank Reconciliation */}
        <TabsContent value="bank" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bank-Transaktionen ↔ Alle Geschäftsvorfälle</h2>
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
              <Button 
                onClick={handleBankMatchClick}
                disabled={!selectedBank || selectedItems.length === 0 || isMatching}
              >
                {isMatching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                )}
                {isMatching ? 'Verknüpfen...' : `Auswahl verknüpfen (${selectedItems.length})`}
              </Button>
            </div>
          </div>

          {/* Provider Summary Dashboard */}
          <ProviderSummaryDashboard className="mb-4" />

          <div className="grid grid-cols-3 gap-6">
            {/* Left: Bank Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Bank-Transaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Betrag</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeleton
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                      ))
                    ) : unmatchedBankTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No unmatched bank transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      unmatchedBankTransactions.map((transaction) => (
                        <TableRow 
                          key={transaction.id}
                          className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedBank === transaction.id ? 'bg-accent border-l-4 border-primary' : 'hover:bg-muted/30'
                          }`}
                          onClick={() => setSelectedBank(transaction.id)}
                        >
                          <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
                          <TableCell className={transaction.amount > 0 ? 'text-success' : 'text-destructive'}>
                            {transaction.direction_display} {transaction.amount_abs.toFixed(2)} CHF
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Pending</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Right: Expenses & Provider Batches */}
            <Card>
              <CardHeader>
                <CardTitle>Ausgaben & Abgeglichene Verkäufe</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Auswahl</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Betrag</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead>Typ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeleton
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                      ))
                    ) : availableForMatching.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No items available for bank matching
                        </TableCell>
                      </TableRow>
                    ) : (
                      availableForMatching.map((item) => (
                        <TableRow 
                          key={item.id}
                          className={`transition-colors ${
                            selectedItems.includes(item.id) ? 'bg-accent/50' : 'hover:bg-muted/30'
                          }`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() => handleItemSelect(item.id)}
                              aria-label={`Select ${item.item_type} ${item.description}`}
                            />
                          </TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className={item.amount > 0 ? 'text-success' : 'text-destructive'}>
                            {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)} CHF
                          </TableCell>
                          <TableCell>
                          <div className="flex items-start gap-2 flex-wrap">
                            {/* Provider Badge with strong theme colors */}
                            {(item.description.toLowerCase().includes('sumup') || 
                              item.description.includes('sumup net') ||
                              item.description.includes('SUMUP PAYMENTS')) && (
                              <Badge 
                                variant="secondary" 
                                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none' }}
                                className="font-semibold shadow-sm hover:opacity-90"
                              >
                                SumUp
                              </Badge>
                            )}
                            {(item.description.toLowerCase().includes('twint') || 
                              item.description.includes('TWINT Acquiring') ||
                              item.description.includes('Gutschrift TWINT')) && (
                              <Badge 
                                variant="secondary" 
                                style={{ backgroundColor: '#d97706', color: 'white', border: 'none' }}
                                className="font-semibold shadow-sm hover:opacity-90"
                              >
                                TWINT
                              </Badge>
                            )}
                            {item.item_type === 'cash_movement' && (
                              <Badge 
                                variant="secondary" 
                                style={{ backgroundColor: '#16a34a', color: 'white', border: 'none' }}
                                className="font-semibold shadow-sm hover:opacity-90"
                              >
                                Cash
                              </Badge>
                            )}
                            {item.item_type === 'expense' && (
                              <Badge 
                                variant="destructive" 
                                style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}
                                className="font-semibold shadow-sm hover:opacity-90"
                              >
                                Ausgabe
                              </Badge>
                            )}
                            <div className="text-sm leading-relaxed">
                              {item.description.replace(/\(sumup net\)|\(twint\)/gi, '').trim()}
                            </div>
                          </div>
                        </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.item_type === 'sale' ? 'Sale' : 
                               item.item_type === 'expense' ? 'Expense' : 'Cash'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Right: Smart Bank Match Suggestions */}
            <BankMatchSuggestions 
              bankTransactionId={selectedBank}
              onMatchComplete={() => {
                refetchData()
                setSelectedBank(null)
                setSelectedItems([])
              }}
            />
          </div>
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