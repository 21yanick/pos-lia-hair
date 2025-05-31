"use client"

import { useState, useEffect } from "react"
import { useExpenses, EXPENSE_CATEGORIES, type ExpenseCategory } from "@/shared/hooks/business/useExpenses"
import { useToast } from "@/shared/hooks/core/useToast"
import { format, parseISO } from "date-fns"
import { de } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Plus, Upload, Download, Search, Filter, Calendar } from "lucide-react"
import { supabase } from "@/shared/lib/supabase/client"

export default function ExpensesPage() {
  const {
    expenses,
    loading,
    error,
    createExpense,
    loadExpenses,
    loadCurrentMonthExpenses,
    calculateExpenseStats,
    getExpensesByCategory,
    uploadExpenseReceipt,
    generatePlaceholderReceipt,
    EXPENSE_CATEGORIES
  } = useExpenses()
  
  const { toast } = useToast()
  
  // State für neue Ausgabe
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [receiptType, setReceiptType] = useState<'upload' | 'physical'>('upload')
  const [archiveLocation, setArchiveLocation] = useState('')
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '' as ExpenseCategory | '',
    payment_method: '' as 'bank' | 'cash' | '',
    payment_date: new Date().toISOString().split('T')[0],
    supplier_name: '',
    invoice_number: '',
    notes: ''
  })
  
  // Filter State
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Lade Ausgaben beim Start
  useEffect(() => {
    loadExpenses() // Lädt alle Ausgaben statt nur aktueller Monat
  }, [])
  
  // Fehlerbehandlung
  useEffect(() => {
    if (error) {
      toast({
        title: "Fehler",
        description: error,
        variant: "destructive"
      })
    }
  }, [error, toast])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.description || !formData.category || !formData.payment_method) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive"
      })
      return
    }

    if (receiptType === 'upload' && !selectedFile) {
      toast({
        title: "Fehler", 
        description: "Bitte laden Sie einen Beleg hoch oder wählen Sie 'Physischer Beleg'.",
        variant: "destructive"
      })
      return
    }
    
    // Get current user
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein.",
        variant: "destructive",
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
      supplier_name: formData.supplier_name || null,
      invoice_number: formData.invoice_number || null,
      notes: formData.notes || null,
      user_id: userData.user.id
    }

    let result
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
            title: "Warnung",
            description: "Ausgabe erstellt, aber Platzhalter-Beleg konnte nicht generiert werden.",
            variant: "destructive"
          })
        }
      }
    }
    
    if (result.success) {
      toast({
        title: "Erfolg",
        description: receiptType === 'upload' 
          ? "Ausgabe und Beleg wurden erfolgreich erstellt."
          : "Ausgabe und Platzhalter-Beleg wurden erfolgreich erstellt."
      })
      setIsDialogOpen(false)
      setFormData({
        amount: '',
        description: '',
        category: '',
        payment_method: '',
        payment_date: new Date().toISOString().split('T')[0],
        supplier_name: '',
        invoice_number: '',
        notes: ''
      })
      setSelectedFile(null)
      setReceiptType('upload')
      setArchiveLocation('')
    }
  }
  
  // Gefilterte Ausgaben
  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory
    const matchesPaymentMethod = filterPaymentMethod === 'all' || expense.payment_method === filterPaymentMethod
    const matchesSearch = searchQuery === '' || 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesPaymentMethod && matchesSearch
  })
  
  // Statistiken
  const stats = calculateExpenseStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ausgaben</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Geschäftsausgaben und Lieferantenrechnungen
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neue Ausgabe
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
                  <Label htmlFor="amount">Betrag (CHF) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Zahlungsdatum *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="z.B. Büromiete Januar 2024"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as ExpenseCategory }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Zahlungsart *</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value as 'bank' | 'cash' }))}>
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
                  <Label htmlFor="supplier_name">Lieferant/Firma</Label>
                  <Input
                    id="supplier_name"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
                    placeholder="z.B. Muster GmbH"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Rechnungsnummer</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                    placeholder="z.B. R-2024-001"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
                      id="receipt-upload"
                      name="receiptType"
                      value="upload"
                      checked={receiptType === 'upload'}
                      onChange={(e) => setReceiptType(e.target.value as 'upload' | 'physical')}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor="receipt-upload" className="cursor-pointer">
                      Digitalen Beleg hochladen
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="receipt-physical"
                      name="receiptType"
                      value="physical"
                      checked={receiptType === 'physical'}
                      onChange={(e) => setReceiptType(e.target.value as 'upload' | 'physical')}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor="receipt-physical" className="cursor-pointer">
                      Physischer Beleg vorhanden
                    </Label>
                  </div>
                </div>

                {/* Upload Section - nur wenn Upload gewählt */}
                {receiptType === 'upload' && (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label 
                      htmlFor="file-upload" 
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
                    <Label htmlFor="archive-location">Archiv-Standort (optional)</Label>
                    <Input
                      id="archive-location"
                      value={archiveLocation}
                      onChange={(e) => setArchiveLocation(e.target.value)}
                      placeholder="z.B. Ordner 2025-A, Aktenschrank 3, etc."
                    />
                    <p className="text-xs text-muted-foreground">
                      📁 Es wird automatisch ein Platzhalter-PDF erstellt mit Verweis auf den physischen Beleg.
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtausgaben</CardTitle>
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
            <CardTitle className="text-sm font-medium">Überweisungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {stats.totalBank.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per Bank bezahlt</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Größte Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(stats.byCategory).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0] ? 
                EXPENSE_CATEGORIES[Object.entries(stats.byCategory).reduce((a, b) => a[1] > b[1] ? a : b)[0] as ExpenseCategory] : 
                'Keine'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              CHF {Object.entries(stats.byCategory).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[1].toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle Kategorien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
              <SelectTrigger className="w-48">
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
      <Card>
        <CardHeader>
          <CardTitle>Ausgaben</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Lade Ausgaben...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Keine Ausgaben gefunden
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium">{expense.description}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Badge variant="outline">
                          {EXPENSE_CATEGORIES[expense.category as ExpenseCategory]}
                        </Badge>
                        <Badge variant={expense.payment_method === 'cash' ? 'default' : 'secondary'}>
                          {expense.payment_method === 'cash' ? 'Bar' : 'Bank'}
                        </Badge>
                        <span>{format(parseISO(expense.payment_date), 'dd.MM.yyyy', { locale: de })}</span>
                      </div>
                      {expense.supplier_name && (
                        <p className="text-sm text-muted-foreground">{expense.supplier_name}</p>
                      )}
                      {expense.invoice_number && (
                        <p className="text-sm text-muted-foreground">Rechnung: {expense.invoice_number}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">CHF {expense.amount.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}