"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { useToast } from "@/shared/hooks/core/useToast"
import { useExpenseCategories } from "@/shared/hooks/business/useExpenseCategories"
import { SupplierAutocomplete } from '@/shared/components/supplier/SupplierAutocomplete'
import { SupplierCreateDialog } from '@/shared/components/supplier/SupplierCreateDialog'
import { supabase } from "@/shared/lib/supabase/client"
import type { Expense, ExpenseCategory } from "@/shared/types/expenses"
import type { Supplier } from '@/shared/types/suppliers'

interface ExpenseEditDialogProps {
  expense: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>
}

export function ExpenseEditDialog({ expense, open, onOpenChange, onUpdate }: ExpenseEditDialogProps) {
  const { categories: EXPENSE_CATEGORIES } = useExpenseCategories()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '' as ExpenseCategory | '',
    payment_method: '' as 'bank' | 'cash' | '',
    payment_date: '',
    invoice_number: '',
    notes: ''
  })

  // Initialize form data when expense changes
  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description,
        category: expense.category as ExpenseCategory,
        payment_method: expense.payment_method as 'bank' | 'cash',
        payment_date: expense.payment_date,
        invoice_number: expense.invoice_number || '',
        notes: expense.notes || ''
      })
      
      // Set supplier if available
      if (expense.supplier) {
        setSelectedSupplier(expense.supplier)
      } else if (expense.supplier_name) {
        // Create a minimal supplier object for display
        setSelectedSupplier({
          id: '',
          name: expense.supplier_name,
          category: 'other',
          is_active: true,
          created_at: '',
          organization_id: ''
        })
      } else {
        setSelectedSupplier(null)
      }
    }
  }, [expense])

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
    
    setLoading(true)
    
    try {
      const updates = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        supplier_id: selectedSupplier?.id || null,
        supplier_name: selectedSupplier?.name || null,
        invoice_number: formData.invoice_number || null,
        notes: formData.notes || null
      }
      
      const result = await onUpdate(expense.id, updates)
      
      if (result.success) {
        toast({
          title: "Erfolgreich aktualisiert",
          description: "Die Ausgabe wurde erfolgreich bearbeitet."
        })
        onOpenChange(false)
      } else {
        throw new Error(result.error || 'Fehler beim Aktualisieren')
      }
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ausgabe bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Details dieser Ausgabe.
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
                <Label htmlFor="supplier">Lieferant/Firma</Label>
                <SupplierAutocomplete
                  value={selectedSupplier}
                  onSelect={handleSupplierSelect}
                  onCreateNew={handleSupplierCreateNew}
                  placeholder="Lieferant auswählen oder neu erstellen..."
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
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
    </>
  )
}