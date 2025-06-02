"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Loader2, ArrowUpToLine, ArrowDownToLine, AlertCircle } from "lucide-react"
import { supabase } from "@/shared/lib/supabase/client"
import { useDailySummaries } from "@/shared/hooks/business/useDailySummaries"

interface CashTransferDialogProps {
  isOpen: boolean
  onClose: () => void
  direction: 'to_bank' | 'from_bank'
  onSuccess: () => void
}

export function CashTransferDialog({ isOpen, onClose, direction, onSuccess }: CashTransferDialogProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cashBalance, setCashBalance] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  // Use the same cash balance logic as Cash Register
  const { getCurrentCashBalance } = useDailySummaries()

  const isToBank = direction === 'to_bank'

  // Fetch cash balance when dialog opens and is "to_bank"
  useEffect(() => {
    if (isOpen && isToBank) {
      fetchCashBalance()
    }
  }, [isOpen, isToBank])

  const fetchCashBalance = async () => {
    setLoadingBalance(true)
    try {
      // Use the same method as Cash Register for consistent balance
      const result = await getCurrentCashBalance()
      
      if (result.success) {
        setCashBalance(result.balance)
      } else {
        console.error('Error fetching cash balance:', result.error)
        setCashBalance(null)
      }
    } catch (err) {
      console.error('Error fetching cash balance:', err)
      setCashBalance(null)
    } finally {
      setLoadingBalance(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError("Bitte geben Sie einen gültigen Betrag ein")
      return
    }

    if (!description.trim()) {
      setError("Bitte geben Sie eine Beschreibung ein")
      return
    }

    // Additional validation for "to_bank" - check if amount exceeds cash balance
    if (isToBank && cashBalance !== null && numAmount > cashBalance) {
      setError(`Betrag übersteigt verfügbaren Kassenbestand (${cashBalance.toFixed(2)} CHF)`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      // Call the database function to create bank transfer cash movement
      const { data, error: dbError } = await supabase.rpc('create_bank_transfer_cash_movement', {
        p_user_id: user.id,
        p_amount: numAmount,
        p_description: description.trim(),
        p_direction: direction
      })

      if (dbError) throw dbError

      // Success!
      onSuccess()
      onClose()
      
      // Reset form
      setAmount("")
      setDescription("")
      setCashBalance(null)
      
    } catch (err) {
      console.error('Error creating cash transfer:', err)
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setAmount("")
      setDescription("")
      setError(null)
      setCashBalance(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isToBank ? (
              <>
                <ArrowUpToLine className="h-5 w-5 text-destructive" />
                Geld in Bank einzahlen
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-5 w-5 text-green-600 dark:text-green-400" />
                Geld von Bank abheben
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isToBank 
              ? "Erfassen Sie Bargeld, das Sie zur Bank gebracht haben. Dies wird später mit der entsprechenden Bank-Transaktion abgeglichen."
              : "Erfassen Sie Bargeld, das Sie von der Bank geholt haben. Dies wird später mit der entsprechenden Bank-Transaktion abgeglichen."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Cash Balance Display for "to_bank" */}
          {isToBank && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Aktueller Kassenbestand
              </div>
              {loadingBalance ? (
                <div className="text-lg font-semibold text-muted-foreground">
                  Laden...
                </div>
              ) : cashBalance !== null ? (
                <div className="text-lg font-semibold">
                  {cashBalance.toFixed(2)} CHF
                  {cashBalance < 0 && (
                    <span className="text-destructive text-sm ml-2">(Negativ)</span>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Konnte nicht geladen werden
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Betrag (CHF)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              placeholder={isToBank 
                ? "z.B. Tageseinnahmen einzahlen" 
                : "z.B. Wechselgeld abheben"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              required
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className={isToBank 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-green-600 hover:bg-green-600/90 text-white dark:bg-green-400 dark:hover:bg-green-400/90 dark:text-black"
              }
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isToBank ? (
                <ArrowUpToLine className="h-4 w-4 mr-2" />
              ) : (
                <ArrowDownToLine className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Wird erstellt...' : isToBank ? 'In Bank einzahlen' : 'Von Bank abheben'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}