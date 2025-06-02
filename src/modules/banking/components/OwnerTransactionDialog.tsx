// =====================================================
// Owner Transaction Dialog Component
// =====================================================
// Smart Dialog für Owner Einlagen, Ausgaben & Entnahmen
// Context-aware based on transaction type

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Loader2, AlertCircle, DollarSign, CreditCard, Banknote } from 'lucide-react'
import { createOwnerTransaction, type OwnerTransactionInsert } from '../services/ownerTransactionsApi'
import { supabase } from '@/shared/lib/supabase/client'

// =====================================================
// COMPONENT INTERFACE
// =====================================================

export interface OwnerTransactionDialogProps {
  isOpen: boolean
  transactionType: 'deposit' | 'expense' | 'withdrawal'
  onClose: () => void
  onSuccess?: () => void
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getTransactionConfig = (type: 'deposit' | 'expense' | 'withdrawal') => {
  switch (type) {
    case 'deposit':
      return {
        title: '💰 Owner Einlage',
        description: 'Privatgeld ins Geschäft einzahlen',
        amountLabel: 'Einlage Betrag',
        descriptionPlaceholder: 'z.B. Startkapital Einlage, Liquiditätshilfe',
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      }
    case 'withdrawal':
      return {
        title: '💸 Owner Entnahme',
        description: 'Geld aus dem Geschäft entnehmen',
        amountLabel: 'Entnahme Betrag',
        descriptionPlaceholder: 'z.B. Gewinnentnahme, Privatentnahme',
        color: 'text-destructive',
        bgColor: 'bg-destructive/10'
      }
    case 'expense':
      return {
        title: '🛒 Private Geschäftsausgabe',
        description: 'Private Zahlung für Geschäftsausgabe',
        amountLabel: 'Ausgabe Betrag',
        descriptionPlaceholder: 'z.B. Föhn mit privater Karte gekauft',
        color: 'text-secondary-foreground',
        bgColor: 'bg-secondary/10'
      }
  }
}

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'bank_transfer': return <Banknote className="h-4 w-4" />
    case 'private_card': return <CreditCard className="h-4 w-4" />
    case 'private_cash': return <DollarSign className="h-4 w-4" />
    default: return null
  }
}

const getAvailablePaymentMethods = (transactionType: 'deposit' | 'expense' | 'withdrawal') => {
  switch (transactionType) {
    case 'deposit':
      return [
        { value: 'bank_transfer', label: 'Bank Transfer', hint: 'Banking' },
        { value: 'private_cash', label: 'Privates Bargeld', hint: 'Kassenbuch' }
      ]
    case 'withdrawal':
      return [
        { value: 'bank_transfer', label: 'Bank Transfer', hint: 'Banking' },
        { value: 'private_cash', label: 'Privates Bargeld', hint: 'Kassenbuch' }
      ]
    case 'expense':
      return [
        { value: 'bank_transfer', label: 'Bank Transfer', hint: 'Banking' },
        { value: 'private_card', label: 'Private Karte', hint: 'Owner Record' },
        { value: 'private_cash', label: 'Privates Bargeld', hint: 'Kassenbuch' }
      ]
    default:
      return []
  }
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function OwnerTransactionDialog({ 
  isOpen, 
  transactionType, 
  onClose, 
  onSuccess 
}: OwnerTransactionDialogProps) {
  
  // Form State
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState(() => 
    new Date().toISOString().split('T')[0] // Today's date
  )
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'private_card' | 'private_cash'>('bank_transfer')
  const [notes, setNotes] = useState('')
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    }
    getUser()
  }, [])
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('')
      setDescription('')
      setTransactionDate(new Date().toISOString().split('T')[0])
      setPaymentMethod('bank_transfer')
      setNotes('')
      setError(null)
    }
  }, [isOpen])

  // Auto-adjust payment method when transaction type changes
  useEffect(() => {
    const availableMethods = getAvailablePaymentMethods(transactionType)
    const currentMethodAvailable = availableMethods.some(method => method.value === paymentMethod)
    
    if (!currentMethodAvailable && availableMethods.length > 0) {
      setPaymentMethod(availableMethods[0].value as any)
    }
  }, [transactionType, paymentMethod])
  
  // Get transaction configuration
  const config = getTransactionConfig(transactionType)
  
  // =====================================================
  // FORM SUBMISSION
  // =====================================================
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) {
      setError('User not authenticated')
      return
    }
    
    if (!amount || !description) {
      setError('Amount and description are required')
      return
    }
    
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const transactionData: OwnerTransactionInsert = {
        transaction_type: transactionType,
        amount: numericAmount,
        description: description.trim(),
        transaction_date: transactionDate,
        payment_method: paymentMethod,
        user_id: userId,
        notes: notes.trim() || null
      }
      
      const { data, error: apiError } = await createOwnerTransaction(transactionData)
      
      if (apiError) {
        throw new Error(apiError.message || 'Failed to create owner transaction')
      }
      
      // Success
      onSuccess?.()
      onClose()
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error creating owner transaction:', err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // =====================================================
  // RENDER
  // =====================================================
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={config.color}>
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">{config.amountLabel} (CHF) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-medium"
              required
            />
          </div>
          
          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung *</Label>
            <Input
              id="description"
              placeholder={config.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="date">Datum *</Label>
            <Input
              id="date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </div>
          
          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label>Zahlungsart</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={(value: 'bank_transfer' | 'private_card' | 'private_cash') => 
                setPaymentMethod(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailablePaymentMethods(transactionType).map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(method.value)}
                      <span>{method.label}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {method.hint}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          
          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Zusätzliche Informationen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !amount || !description}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                `${config.title.split(' ')[0]} Erstellen`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}