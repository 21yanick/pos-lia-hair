'use client'

import {
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  Replace,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useToast } from '@/shared/hooks/core/useToast'
import type { Expense } from '@/shared/types/expenses'
import { useExpensePDFs } from '../hooks/useExpensePDFs'
import { ExpenseEditDialog } from './ExpenseEditDialog'
import { PDFReplaceDialog } from './PDFReplaceDialog'

interface ExpenseActionsProps {
  expense: Expense
  onUpdate: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
  onDuplicate?: (expense: Expense) => void
  onReplaceReceipt: (expenseId: string, file: File) => Promise<{ success: boolean; error?: string }>
}

export function ExpenseActions({
  expense,
  onUpdate,
  onDelete,
  onDuplicate,
  onReplaceReceipt,
}: ExpenseActionsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // PDF functionality
  const { getExpensePDFsFromCache, hasExpensePDFs, invalidateCache, loadExpensePDFs } =
    useExpensePDFs()

  const pdfs = getExpensePDFsFromCache(expense.id)
  const hasPDFs = hasExpensePDFs(expense.id)
  const isTemporaryExpense = expense.id.startsWith('temp-')

  const handleDelete = async () => {
    setLoading(true)
    try {
      const result = await onDelete(expense.id)
      if (result.success) {
        toast({
          title: 'Erfolgreich gelöscht',
          description: `Ausgabe "${expense.description}" wurde gelöscht.`,
        })
        setDeleteDialogOpen(false)
      } else {
        throw new Error(result.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      toast({
        title: 'Fehler beim Löschen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(expense)
      toast({
        title: 'Ausgabe dupliziert',
        description: 'Die Ausgabe wurde als Vorlage geladen.',
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // PDF Handler Functions
  const handleViewPDF = (url: string, _fileName: string) => {
    if (url) {
      window.open(url, '_blank')
    } else {
      toast({
        title: 'Fehler',
        description: 'PDF konnte nicht geladen werden.',
        variant: 'destructive',
      })
    }
  }

  const handleDownloadPDF = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName || `beleg-${expense.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: 'Download erfolgreich',
        description: `${fileName} wurde heruntergeladen.`,
      })
    } catch (_error) {
      toast({
        title: 'Download fehlgeschlagen',
        description: 'Die Datei konnte nicht heruntergeladen werden.',
        variant: 'destructive',
      })
    }
  }

  const handleReplaceSuccess = () => {
    invalidateCache(expense.id)
    // Reload PDFs after replacement
    setTimeout(() => {
      loadExpensePDFs(expense.id)
    }, 500)

    toast({
      title: 'Beleg erfolgreich ersetzt',
      description: 'Der neue Beleg wurde hochgeladen.',
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setDetailsDialogOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Details anzeigen
          </DropdownMenuItem>

          {/* PDF Actions - always available except for temporary expenses */}
          {!isTemporaryExpense && (
            <>
              <DropdownMenuSeparator />

              {/* View/Download options - only when PDFs exist */}
              {hasPDFs &&
                pdfs.length > 0 &&
                (pdfs.length === 1 ? (
                  // Single PDF actions
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        handleViewPDF(pdfs[0]?.url || '', pdfs[0]?.displayName || 'beleg.pdf')
                      }
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      PDF in neuem Tab öffnen
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleDownloadPDF(pdfs[0]?.url || '', pdfs[0]?.displayName || 'beleg.pdf')
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      PDF herunterladen
                    </DropdownMenuItem>
                  </>
                ) : (
                  // Multiple PDFs - show submenu items
                  pdfs
                    .slice(0, 3)
                    .map((pdf, index) => (
                      <DropdownMenuItem
                        key={pdf.id}
                        onClick={() =>
                          handleViewPDF(pdf.url || '', pdf.displayName || `beleg-${index + 1}.pdf`)
                        }
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {pdf.displayName || `Beleg ${index + 1}`}
                      </DropdownMenuItem>
                    ))
                ))}

              {/* PDF Replace/Add - always available for saved expenses */}
              <DropdownMenuItem onClick={() => setReplaceDialogOpen(true)}>
                {hasPDFs && pdfs.length > 0 ? (
                  <Replace className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {hasPDFs && pdfs.length > 0 ? 'Beleg ersetzen' : 'PDF hinzufügen'}
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </DropdownMenuItem>

          {onDuplicate && (
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplizieren
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <ExpenseEditDialog
        expense={expense}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={onUpdate}
      />

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ausgaben-Details</DialogTitle>
            <DialogDescription>Vollständige Informationen zu dieser Ausgabe</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Betrag:</span>
                <p className="text-lg font-bold">{formatCurrency(expense.amount)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Zahlungsdatum:</span>
                <p>{formatDate(expense.payment_date)}</p>
              </div>
            </div>

            <div>
              <span className="font-medium text-muted-foreground">Beschreibung:</span>
              <p>{expense.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Kategorie:</span>
                <p>{expense.category}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Zahlungsart:</span>
                <p>{expense.payment_method === 'cash' ? 'Barzahlung' : 'Banküberweisung'}</p>
              </div>
            </div>

            {expense.supplier_name && (
              <div>
                <span className="font-medium text-muted-foreground">Lieferant:</span>
                <p>{expense.supplier_name}</p>
              </div>
            )}

            {expense.invoice_number && (
              <div>
                <span className="font-medium text-muted-foreground">Rechnungsnummer:</span>
                <p>{expense.invoice_number}</p>
              </div>
            )}

            {expense.notes && (
              <div>
                <span className="font-medium text-muted-foreground">Notizen:</span>
                <p className="whitespace-pre-wrap">{expense.notes}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>Erstellt: {formatDate(expense.created_at)}</p>
              <p>ID: {expense.id}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ausgabe löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diese Ausgabe löschen möchten? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <p className="font-medium">{expense.description}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(expense.amount)} • {formatDate(expense.payment_date)}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Wird gelöscht...' : 'Löschen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Replace Dialog */}
      <PDFReplaceDialog
        open={replaceDialogOpen}
        onOpenChange={setReplaceDialogOpen}
        expenseId={expense.id}
        expenseDescription={expense.description}
        onReplaceSuccess={handleReplaceSuccess}
        onReplace={onReplaceReceipt}
      />
    </>
  )
}
