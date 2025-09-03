'use client'

import { Plus, Search, Upload } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { SupplierAutocomplete } from '@/shared/components/supplier/SupplierAutocomplete'
import { SupplierCreateDialog } from '@/shared/components/supplier/SupplierCreateDialog'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useExpenseCategories } from '@/shared/hooks/business/useExpenseCategories'
import { type ExpenseCategory, useExpenses } from '@/shared/hooks/business/useExpenses'
import { useToast } from '@/shared/hooks/core/useToast'
import { supabase } from '@/shared/lib/supabase/client'
import type { Supplier } from '@/shared/types/suppliers'
import { SUPPLIER_CATEGORIES } from '@/shared/types/suppliers'
import { formatDateForAPI, formatDateForDisplay } from '@/shared/utils/dateUtils'
import { ExpenseActions } from './ExpenseActions'
import { ExpensePDFActions } from './ExpensePDFActions'

export function ExpensesPage() {
  const {
    expenses,
    loading,
    error,
    createExpense,
    loadExpenses,
    updateExpense,
    deleteExpense,
    calculateExpenseStats,
    replaceExpenseReceipt,
    generatePlaceholderReceipt,
  } = useExpenses()

  const { categories: EXPENSE_CATEGORIES } = useExpenseCategories()

  const { toast } = useToast()
  const { currentOrganization } = useCurrentOrganization() // V6.1: Multi-tenant support

  // State für neue Ausgabe
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [receiptType, setReceiptType] = useState<'upload' | 'physical'>('upload')
  const [archiveLocation, setArchiveLocation] = useState('')

  // Supplier State
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '' as ExpenseCategory | '',
    payment_method: '' as 'bank' | 'cash' | '',
    payment_date: formatDateForAPI(new Date()),
    invoice_number: '',
    notes: '',
  })

  // 🆔 Generate unique IDs for accessibility compliance
  const amountId = useId()
  const paymentDateId = useId()
  const descriptionId = useId()
  const invoiceNumberId = useId()
  const notesId = useId()
  const receiptUploadId = useId()
  const receiptPhysicalId = useId()
  const fileUploadId = useId()
  const archiveLocationId = useId()

  // Filter State
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Lade Ausgaben beim Start
  useEffect(() => {
    loadExpenses() // Lädt alle Ausgaben statt nur aktueller Monat
  }, [loadExpenses])

  // Load current user ID for supplier creation
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        setCurrentUserId(userData.user.id)
      }
    }
    getCurrentUser()
  }, [])

  // Fehlerbehandlung
  useEffect(() => {
    if (error) {
      toast({
        title: 'Fehler',
        description: error,
        variant: 'destructive',
      })
    }
  }, [error, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.amount ||
      !formData.description ||
      !formData.category ||
      !formData.payment_method ||
      !selectedSupplier
    ) {
      toast({
        title: 'Fehler',
        description: 'Bitte füllen Sie alle Pflichtfelder aus (inkl. Lieferant).',
        variant: 'destructive',
      })
      return
    }

    if (receiptType === 'upload' && !selectedFile) {
      toast({
        title: 'Fehler',
        description: "Bitte laden Sie einen Beleg hoch oder wählen Sie 'Physischer Beleg'.",
        variant: 'destructive',
      })
      return
    }

    if (receiptType === 'physical' && !archiveLocation.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie den Archiv-Standort für den physischen Beleg an.',
        variant: 'destructive',
      })
      return
    }

    // Get current user
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      toast({
        title: 'Fehler',
        description: 'Sie müssen angemeldet sein.',
        variant: 'destructive',
      })
      return
    }

    // Create expense data
    const expenseData = {
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category as ExpenseCategory,
      payment_method: formData.payment_method as 'bank' | 'cash',
      payment_date: formData.payment_date,
      supplier_id: selectedSupplier?.id || null,
      supplier_name: selectedSupplier?.name || null, // Keep for backward compatibility
      invoice_number: formData.invoice_number || null,
      notes: formData.notes || null,
      user_id: userData.user.id,
      organization_id: currentOrganization?.id || '', // V6.1: Required field for multi-tenant
    }

    let result: Awaited<ReturnType<typeof createExpense>>
    if (receiptType === 'upload' && selectedFile) {
      // Traditional upload flow
      result = await createExpense(expenseData, selectedFile)
    } else {
      // Physical receipt flow - create expense without file first
      result = await createExpense(expenseData)

      if (result.success && result.expense) {
        // Then generate placeholder receipt
        const placeholderResult = await generatePlaceholderReceipt(
          result.expense.id,
          archiveLocation || undefined
        )

        if (!placeholderResult.success) {
          toast({
            title: 'Warnung',
            description: 'Ausgabe erstellt, aber Platzhalter-Beleg konnte nicht generiert werden.',
            variant: 'destructive',
          })
        }
      }
    }

    if (result.success) {
      toast({
        title: 'Erfolg',
        description:
          receiptType === 'upload'
            ? 'Ausgabe und Beleg wurden erfolgreich erstellt.'
            : 'Ausgabe und Platzhalter-Beleg wurden erfolgreich erstellt.',
      })
      setIsDialogOpen(false)
      setFormData({
        amount: '',
        description: '',
        category: '',
        payment_method: '',
        payment_date: formatDateForAPI(new Date()),
        invoice_number: '',
        notes: '',
      })
      setSelectedSupplier(null)
      setSelectedFile(null)
      setReceiptType('upload')
      setArchiveLocation('')
    }
  }

  // Supplier Handler Functions
  const handleSupplierSelect = (supplier: Supplier | null) => {
    setSelectedSupplier(supplier)
  }

  const handleSupplierCreateNew = (name: string) => {
    setNewSupplierName(name)
    setIsSupplierDialogOpen(true)
  }

  const handleSupplierCreated = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setNewSupplierName('')
  }

  // Gefilterte Ausgaben
  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory
    const matchesPaymentMethod =
      filterPaymentMethod === 'all' || expense.payment_method === filterPaymentMethod
    const matchesSearch =
      searchQuery === '' ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesPaymentMethod && matchesSearch
  })

  // Statistiken
  const stats = calculateExpenseStats()

  return (
    <div className="px-4 py-6 sm:px-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
        <div>
          <p className="text-muted-foreground text-sm sm:text-base">Geschäftsausgaben verwalten</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Neue Ausgabe</span>
              <span className="sm:hidden">Hinzufügen</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Neue Ausgabe erfassen</DialogTitle>
              <DialogDescription>
                Erfassen Sie eine neue Geschäftsausgabe oder Lieferantenrechnung.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={amountId}>Betrag (CHF) *</Label>
                  <Input
                    id={amountId}
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={paymentDateId}>Zahlungsdatum *</Label>
                  <Input
                    id={paymentDateId}
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, payment_date: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={descriptionId}>Beschreibung *</Label>
                <Input
                  id={descriptionId}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="z.B. Büromiete Januar 2024"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value as ExpenseCategory }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">Zahlungsart *</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, payment_method: value as 'bank' | 'cash' }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Zahlungsart wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Banküberweisung</SelectItem>
                      <SelectItem value="cash">Barzahlung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Lieferant/Firma *</Label>
                  <SupplierAutocomplete
                    value={selectedSupplier}
                    onSelect={handleSupplierSelect}
                    onCreateNew={handleSupplierCreateNew}
                    placeholder="Lieferant auswählen oder neu erstellen..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={invoiceNumberId}>Rechnungsnummer</Label>
                  <Input
                    id={invoiceNumberId}
                    value={formData.invoice_number}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, invoice_number: e.target.value }))
                    }
                    placeholder="z.B. R-2024-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={notesId}>Notizen</Label>
                <Textarea
                  id={notesId}
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Zusätzliche Informationen..."
                  rows={3}
                />
              </div>

              {/* Beleg-Optionen */}
              <div className="space-y-4">
                <Label>Beleg-Verwaltung *</Label>

                {/* Receipt Type Selection */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={receiptUploadId}
                      name="receiptType"
                      value="upload"
                      checked={receiptType === 'upload'}
                      onChange={(e) => setReceiptType(e.target.value as 'upload' | 'physical')}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor={receiptUploadId} className="cursor-pointer">
                      Digitalen Beleg hochladen
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={receiptPhysicalId}
                      name="receiptType"
                      value="physical"
                      checked={receiptType === 'physical'}
                      onChange={(e) => setReceiptType(e.target.value as 'upload' | 'physical')}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor={receiptPhysicalId} className="cursor-pointer">
                      Physischer Beleg vorhanden
                    </Label>
                  </div>
                </div>

                {/* Upload Section - nur wenn Upload gewählt */}
                {receiptType === 'upload' && (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      id={fileUploadId}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor={fileUploadId}
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      {selectedFile ? (
                        <div className="text-sm">
                          <p className="font-medium text-success">✓ {selectedFile.name}</p>
                          <p className="text-muted-foreground">Klicken zum Ändern</p>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium">Rechnung oder Beleg hochladen</p>
                          <p>PDF, JPG, PNG (max. 10MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {/* Archive Location - nur wenn Physical gewählt */}
                {receiptType === 'physical' && (
                  <div className="space-y-2">
                    <Label htmlFor={archiveLocationId}>Archiv-Standort *</Label>
                    <Input
                      id={archiveLocationId}
                      value={archiveLocation}
                      onChange={(e) => setArchiveLocation(e.target.value)}
                      placeholder="z.B. Ordner 2025-A, Aktenschrank 3, etc."
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      📁 Es wird automatisch ein Platzhalter-PDF erstellt mit Verweis auf den
                      physischen Beleg.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={loading}>
                  Ausgabe erstellen
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiken */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full max-w-full overflow-hidden">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Gesamtausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{stats.count} Ausgaben</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barzahlungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {stats.totalCash.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Bar bezahlt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Überweisungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {stats.totalBank.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per Bank bezahlt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Größte Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(stats.byCategory).reduce((a, b) => (a[1] > b[1] ? a : b), ['', 0])[0]
                ? EXPENSE_CATEGORIES[
                    Object.entries(stats.byCategory).reduce((a, b) =>
                      a[1] > b[1] ? a : b
                    )[0] as ExpenseCategory
                  ]
                : 'Keine'}
            </div>
            <p className="text-xs text-muted-foreground">
              CHF{' '}
              {Object.entries(stats.byCategory)
                .reduce((a, b) => (a[1] > b[1] ? a : b), ['', 0])[1]
                .toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4">
            <div className="flex items-center space-x-2 flex-1 sm:flex-none sm:min-w-0">
              <Search className="h-4 w-4 flex-shrink-0" />
              <Input
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 min-w-0"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Alle Kategorien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Alle Zahlungsarten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Zahlungsarten</SelectItem>
                <SelectItem value="bank">Banküberweisung</SelectItem>
                <SelectItem value="cash">Barzahlung</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ausgaben Liste */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Ausgaben</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {loading ? (
            <div className="text-center py-4">Lade Ausgaben...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">Keine Ausgaben gefunden</div>
          ) : (
            <div className="space-y-4 w-full max-w-full overflow-hidden">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="border rounded-lg p-4 w-full max-w-full overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 w-full max-w-full overflow-hidden">
                    <div className="space-y-2 flex-1 min-w-0 max-w-full overflow-hidden">
                      <h3
                        className="font-medium text-base leading-tight break-words"
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {expense.description}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground max-w-full overflow-hidden">
                        <Badge
                          variant="outline"
                          className="text-xs truncate max-w-32 flex-shrink-0"
                        >
                          {EXPENSE_CATEGORIES[expense.category as ExpenseCategory]}
                        </Badge>
                        <Badge
                          variant={expense.payment_method === 'cash' ? 'default' : 'secondary'}
                          className="text-xs flex-shrink-0"
                        >
                          {expense.payment_method === 'cash' ? 'Bar' : 'Bank'}
                        </Badge>
                        <span className="text-xs flex-shrink-0">
                          {formatDateForDisplay(expense.payment_date)}
                        </span>
                      </div>
                      {/* Supplier Display - prioritize supplier relation over supplier_name */}
                      {expense.supplier ? (
                        <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground max-w-full overflow-hidden">
                          <span className="text-xs flex-shrink-0">Lieferant:</span>
                          <Badge
                            variant="outline"
                            className="text-xs max-w-48 truncate flex-shrink-0"
                          >
                            {expense.supplier.name}
                          </Badge>
                          {expense.supplier.category && (
                            <span className="text-xs opacity-60 max-w-32 truncate hidden sm:inline flex-shrink-0">
                              (
                              {SUPPLIER_CATEGORIES[
                                expense.supplier.category as keyof typeof SUPPLIER_CATEGORIES
                              ] || expense.supplier.category}
                              )
                            </span>
                          )}
                        </div>
                      ) : (
                        expense.supplier_name && (
                          <div className="text-sm text-muted-foreground max-w-full overflow-hidden">
                            <span className="text-xs">Lieferant: </span>
                            <span
                              className="break-words text-xs"
                              style={{ wordBreak: 'break-word' }}
                            >
                              {expense.supplier_name}
                            </span>
                          </div>
                        )
                      )}
                      {expense.invoice_number && (
                        <div className="text-sm text-muted-foreground max-w-full overflow-hidden">
                          <span className="text-xs">Rechnung: </span>
                          <span className="break-words text-xs" style={{ wordBreak: 'break-word' }}>
                            {expense.invoice_number}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 flex-shrink-0 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-start">
                        <ExpensePDFActions expense={expense} />
                        <ExpenseActions
                          expense={expense}
                          onUpdate={updateExpense}
                          onDelete={deleteExpense}
                          onReplaceReceipt={replaceExpenseReceipt}
                          onDuplicate={(expense) => {
                            // Duplizieren: Dialog mit vorausgefüllten Daten öffnen
                            setFormData({
                              amount: expense.amount.toString(),
                              description: `${expense.description} (Kopie)`,
                              category: expense.category as ExpenseCategory,
                              payment_method: expense.payment_method as 'bank' | 'cash',
                              payment_date: formatDateForAPI(new Date()),
                              invoice_number: '',
                              notes: expense.notes || '',
                            })
                            // V6.1: expense.supplier doesn't exist in schema
                            if (expense.supplier_name) {
                              setSelectedSupplier(null) // V6.1: Clean state - supplier_name handled in form data
                            }
                            setIsDialogOpen(true)
                          }}
                        />
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold whitespace-nowrap">
                          CHF {expense.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplier Create Dialog */}
      {currentUserId && (
        <SupplierCreateDialog
          open={isSupplierDialogOpen}
          onOpenChange={setIsSupplierDialogOpen}
          onSuccess={handleSupplierCreated}
          initialName={newSupplierName}
          userId={currentUserId}
        />
      )}
    </div>
  )
}
