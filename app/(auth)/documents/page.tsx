"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter,
  AlertCircle,
  Receipt,
  CreditCard,
  Calendar
} from "lucide-react"
import { useToast } from "@/lib/hooks/core/useToast"
import { useSales } from "@/lib/hooks/business/useSales"
import { useExpenses } from "@/lib/hooks/business/useExpenses"
import { useDocuments } from "@/lib/hooks/business/useDocuments"

// Phase 1B Components - Erweiterte Transaction List mit Settlement Details
import { TransactionsList } from "@/app/(auth)/reports/daily/components/TransactionsList" 
import { formatAllTransactions } from "@/app/(auth)/reports/daily/utils/dailyHelpers"

// Renamed Components 
import { DocumentsStats } from "./components/DocumentsStats"
import { DocumentsTable } from "./components/DocumentsTable"
import { DocumentsUpload } from "./components/DocumentsUpload"

// Types and Utils
import type { TransactionItem } from "@/shared/types/transactions"
import { getCurrentYearMonth, getMonthOptions, formatMonthYear } from "@/shared/utils/reportHelpers"

export default function DocumentsPage() {
  const { toast } = useToast()
  
  // Hooks for data fetching
  const { sales, loadSalesForDateRange, loading: salesLoading, error: salesError } = useSales()
  const { expenses, loadExpensesByDateRange, loading: expensesLoading, error: expensesError } = useExpenses()
  const {
    documents,
    summary,
    loading: documentsLoading,
    error: documentsError,
    loadDocuments,
    uploadDocument,
    deleteDocument,
  } = useDocuments()

  // State for filters and search
  const [activeTab, setActiveTab] = useState("financial") // NEW: Start with financial transactions
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<"all" | "cash" | "twint" | "sumup" | "bank">("all")
  const [settlementStatusFilter, setSettlementStatusFilter] = useState<"all" | "pending" | "settled" | "failed">("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<"30days" | "7days" | "today" | "all" | "month">("30days")
  const [typeFilter, setTypeFilter] = useState<"all" | "sale" | "expense" | "bank_deposit">("all")
  
  // Monthly filter state
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth())
  const [isMonthlyView, setIsMonthlyView] = useState(false)
  
  // Document filters
  const [documentTypeFilter, setDocumentTypeFilter] = useState<"all" | "receipt" | "daily_report" | "monthly_report" | "expense_receipt">("all")
  const [documentDateFilter, setDocumentDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [documentSortBy, setDocumentSortBy] = useState<"date" | "type" | "name">("date")

  // Upload dialog state (kept for documents functionality)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // Process sales data to transactions with settlement details
  const [transactions, setTransactions] = useState<TransactionItem[]>([])

  // Load data on mount and when date range changes
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        let endDate = new Date()
        let startDate = new Date()
        
        // Calculate start date based on filter
        if (isMonthlyView) {
          // Monthly view: use selected month
          const [year, month] = selectedMonth.split('-').map(Number)
          startDate = new Date(year, month - 1, 1)
          endDate = new Date(year, month, 0, 23, 59, 59)
        } else {
          // Regular date range filter
          switch (dateRangeFilter) {
            case "today":
              startDate = new Date()
              break
            case "7days":
              startDate.setDate(startDate.getDate() - 7)
              break
            case "30days":
              startDate.setDate(startDate.getDate() - 30)
              break
            case "all":
              startDate.setFullYear(startDate.getFullYear() - 1) // Last year
              break
          }
        }
        
        await Promise.all([
          loadSalesForDateRange(
            startDate.toISOString().split('T')[0] + 'T00:00:00',
            endDate.toISOString().split('T')[0] + 'T23:59:59'
          ),
          loadExpensesByDateRange(
            startDate.toISOString().split('T')[0] + 'T00:00:00',
            endDate.toISOString().split('T')[0] + 'T23:59:59'
          ),
          loadDocuments()
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }
    
    loadInitialData()
  }, [dateRangeFilter, isMonthlyView, selectedMonth])

  // Process all data to transactions when data changes
  useEffect(() => {
    // Warten bis alle Daten geladen sind
    if (!salesLoading && !expensesLoading) {
      const formattedTransactions = formatAllTransactions(
        sales || [], 
        expenses || [], 
        [] // Bank Deposits - zukünftig
      )
      
      // Apply filters
      let filteredTransactions = formattedTransactions

      // Type filter
      if (typeFilter !== "all") {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter)
      }

      // Payment method filter
      if (paymentMethodFilter !== "all") {
        filteredTransactions = filteredTransactions.filter(t => t.method === paymentMethodFilter)
      }

      // Settlement status filter (only for TWINT/SumUp)
      if (settlementStatusFilter !== "all") {
        filteredTransactions = filteredTransactions.filter(t => {
          if (t.method === "cash") return settlementStatusFilter === "settled" // Cash is always "settled"
          return t.settlementStatus === settlementStatusFilter
        })
      }

      // Search filter
      if (searchQuery.trim()) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.amount.toString().includes(searchQuery)
        )
      }

      setTransactions(filteredTransactions)
    }
  }, [sales, expenses, salesLoading, expensesLoading, typeFilter, paymentMethodFilter, settlementStatusFilter, searchQuery])

  // Process and filter documents
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([])

  useEffect(() => {
    if (documents && documents.length > 0) {
      let filtered = [...documents]

      // Type filter
      if (documentTypeFilter !== "all") {
        filtered = filtered.filter(doc => doc.type === documentTypeFilter)
      }

      // Date filter
      if (documentDateFilter !== "all") {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        filtered = filtered.filter(doc => {
          const docDate = new Date(doc.document_date || doc.created_at)
          
          switch (documentDateFilter) {
            case "today":
              return docDate >= today
            case "week":
              const weekAgo = new Date(today)
              weekAgo.setDate(weekAgo.getDate() - 7)
              return docDate >= weekAgo
            case "month":
              const monthAgo = new Date(today)
              monthAgo.setMonth(monthAgo.getMonth() - 1)
              return docDate >= monthAgo
            default:
              return true
          }
        })
      }

      // Search filter
      if (searchQuery.trim()) {
        filtered = filtered.filter(doc =>
          (doc.displayName || doc.file_path || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      // Sort documents
      filtered.sort((a, b) => {
        switch (documentSortBy) {
          case "date":
            const dateA = new Date(a.document_date || a.created_at || 0)
            const dateB = new Date(b.document_date || b.created_at || 0)
            return dateB.getTime() - dateA.getTime() // Newest first
          case "type":
            return (a.type || '').localeCompare(b.type || '')
          case "name":
            const nameA = a.displayName || a.file_path || ''
            const nameB = b.displayName || b.file_path || ''
            return nameA.localeCompare(nameB)
          default:
            return 0
        }
      })

      setFilteredDocuments(filtered)
    } else {
      setFilteredDocuments([])
    }
  }, [documents, documentTypeFilter, documentDateFilter, documentSortBy, searchQuery])

  // Filter documents when tab changes
  useEffect(() => {
    if (activeTab === "documents") {
      loadDocuments()
    }
  }, [activeTab])

  const handleUpload = async (
    file: File,
    type: "receipt" | "daily_report" | "monthly_report" | "expense_receipt",
    referenceId: string,
    customName?: string
  ) => {
    try {
      const result = await uploadDocument(file, type, referenceId, customName)

      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Dokument wurde erfolgreich hochgeladen",
        })
        loadDocuments()
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Dokument konnte nicht hochgeladen werden",
          variant: "destructive",
        })
      }

      return result
    } catch (err: any) {
      const errorMsg = err.message || "Ein unerwarteter Fehler ist aufgetreten"
      toast({
        title: "Fehler",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false, error: errorMsg }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteDocument(id)

      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Dokument wurde erfolgreich gelöscht",
        })
        loadDocuments()
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Dokument konnte nicht gelöscht werden",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const loading = salesLoading || expensesLoading || documentsLoading
  const error = salesError || expensesError || documentsError

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {isMonthlyView ? `Dokumente - ${formatMonthYear(selectedMonth)}` : "Dokumente & Belege"}
        </h1>
        <p className="text-muted-foreground">
          {isMonthlyView 
            ? `Monatliche Übersicht aller Dokumente für ${formatMonthYear(selectedMonth)}`
            : "Komplette Übersicht aller Dokumente mit Settlement-Status und zugehörigen Belegen"
          }
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md flex items-center gap-2">
          <AlertCircle className="text-destructive" size={20} />
          <p className="text-destructive-foreground">{error}</p>
        </div>
      )}

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <CreditCard size={16} />
            Finanztransaktionen
            {transactions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {transactions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Receipt size={16} />
            Belege & PDFs
            {summary.total > 0 && (
              <Badge variant="secondary" className="ml-1">
                {summary.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Financial Transactions Tab */}
        <TabsContent value="financial" className="space-y-6">
          {/* Transaction Filters */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Monthly View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={isMonthlyView ? "default" : "outline"}
                size="sm"
                onClick={() => setIsMonthlyView(!isMonthlyView)}
              >
                <Calendar size={16} className="mr-2" />
                Monatsansicht
              </Button>
              
              {isMonthlyView && (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Monat auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMonthOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Suche nach Dokumenten..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="all">Alle Arten</option>
              <option value="sale">Verkäufe</option>
              <option value="expense">Ausgaben</option>
              <option value="bank_deposit">Bankeinzahlungen</option>
            </select>

            {/* Payment Method Filter */}
            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
            >
              <option value="all">Alle Zahlungsarten</option>
              <option value="cash">Bargeld</option>
              <option value="twint">TWINT</option>
              <option value="sumup">SumUp</option>
              <option value="bank">Bank</option>
            </select>

            {/* Settlement Status Filter */}
            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={settlementStatusFilter}
              onChange={(e) => setSettlementStatusFilter(e.target.value as any)}
            >
              <option value="all">Alle Settlement Status</option>
              <option value="pending">Pending</option>
              <option value="settled">Settled</option>
              <option value="failed">Failed</option>
            </select>

            {/* Date Range Filter - nur wenn nicht in Monatsansicht */}
            {!isMonthlyView && (
              <select 
                className="px-3 py-2 border rounded-md bg-background"
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value as any)}
              >
                <option value="today">Heute</option>
                <option value="7days">Letzte 7 Tage</option>
                <option value="30days">Letzte 30 Tage</option>
                <option value="all">Alle Dokumente</option>
              </select>
            )}
          </div>

          {/* Transactions List with Settlement Details */}
          <TransactionsList 
            transactions={transactions}
            loading={loading}
            showSettlementDetails={true} // PHASE 1B: Settlement details enabled here!
          />

          {/* Link to Monthly Settlement */}
          {transactions.some(t => t.settlementStatus === 'pending') && (
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Settlement Import erforderlich</h3>
                    <p className="text-sm text-muted-foreground">
                      {transactions.filter(t => t.settlementStatus === 'pending').length} Transaktionen warten auf Settlement
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <a href="/monthly-closure">Zum Monatsabschluss</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          {/* Stats */}
          <DocumentsStats summary={summary} />

          {/* Enhanced Document Filters */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Suche nach Belegen..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Document Type Filter */}
            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value as any)}
            >
              <option value="all">Alle Dokument-Typen</option>
              <option value="receipt">Quittungen</option>
              <option value="daily_report">Tagesabschlüsse</option>
              <option value="monthly_report">Monatsabschlüsse</option>
              <option value="expense_receipt">Ausgaben-Belege</option>
            </select>

            {/* Document Date Filter */}
            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={documentDateFilter}
              onChange={(e) => setDocumentDateFilter(e.target.value as any)}
            >
              <option value="all">Alle Zeiträume</option>
              <option value="today">Heute</option>
              <option value="week">Diese Woche</option>
              <option value="month">Dieser Monat</option>
            </select>

            {/* Document Sort */}
            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={documentSortBy}
              onChange={(e) => setDocumentSortBy(e.target.value as any)}
            >
              <option value="date">Nach Datum</option>
              <option value="type">Nach Typ</option>
              <option value="name">Nach Name</option>
            </select>
          </div>

          {/* Filter Results Info */}
          {!loading && (
            <div className="text-sm text-muted-foreground">
              {filteredDocuments.length} von {documents.length} Dokumenten angezeigt
              {documentTypeFilter !== "all" && ` • Typ: ${documentTypeFilter}`}
              {documentDateFilter !== "all" && ` • Zeitraum: ${documentDateFilter}`}
              {searchQuery && ` • Suche: "${searchQuery}"`}
            </div>
          )}

          {/* Documents Table */}
          {filteredDocuments.length > 0 || loading ? (
            <DocumentsTable 
              documents={filteredDocuments}
              loading={loading}
              onDelete={handleDelete}
            />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Receipt className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Keine Belege gefunden</h3>
                  <p className="text-muted-foreground mb-4">
                    Laden Sie Belege hoch oder erstellen Sie neue Dokumente.
                  </p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>Beleg hochladen</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}