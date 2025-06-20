"use client"

import { useEffect, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Eye } from "lucide-react"
import { useExpensePDFs } from "../hooks/useExpensePDFs"
import { useToast } from "@/shared/hooks/core/useToast"
import type { Expense } from "@/shared/types/expenses"

interface ExpensePDFActionsProps {
  expense: Expense
}

export function ExpensePDFActions({ expense }: ExpensePDFActionsProps) {
  const { 
    loadExpensePDFs, 
    getExpensePDFsFromCache, 
    hasExpensePDFs,
    loading 
  } = useExpensePDFs()
  
  const [pdfsLoaded, setPdfsLoaded] = useState(false)
  const { toast } = useToast()

  // 🛡️ VALIDATION: Check if this is a temporary expense from optimistic update
  const isTemporaryExpense = expense.id.startsWith('temp-')

  // Load PDFs on mount (skip for temporary expenses)
  useEffect(() => {
    if (isTemporaryExpense) {
      setPdfsLoaded(true)
      return
    }

    const loadPDFs = async () => {
      try {
        await loadExpensePDFs(expense.id)
        setPdfsLoaded(true)
      } catch (error) {
        console.error('Error loading PDFs:', error)
        setPdfsLoaded(true) // Set to true anyway to show empty state
      }
    }
    loadPDFs()
  }, [expense.id, loadExpensePDFs, isTemporaryExpense])

  const pdfs = getExpensePDFsFromCache(expense.id)
  const hasPDFs = hasExpensePDFs(expense.id)

  const handleViewPDF = (url: string, _fileName: string) => {
    if (url) {
      window.open(url, '_blank')
    } else {
      toast({
        title: "Fehler",
        description: "PDF konnte nicht geladen werden.",
        variant: "destructive"
      })
    }
  }


  // 🛡️ EARLY RETURN: Temporary expenses show disabled Eye button
  if (isTemporaryExpense) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground"
        disabled
        title="Belege werden nach dem Speichern verfügbar"
      >
        <Eye className="h-4 w-4" />
      </Button>
    )
  }

  // Show loading state until PDFs are loaded - consistent Eye icon
  if (!pdfsLoaded || loading) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        disabled
        title="PDFs werden geladen..."
      >
        <Eye className="h-4 w-4 animate-pulse" />
      </Button>
    )
  }

  // Always show Eye button - works for PDFs if available, disabled if not
  if (hasPDFs && pdfs.length > 0) {
    // PDFs available - show clickable Eye
    const pdf = pdfs[0] // Always show first PDF
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleViewPDF(pdf.url || '', pdf.displayName || 'beleg.pdf')}
        title={pdfs.length > 1 ? `PDF anzeigen (${pdfs.length} Belege)` : "PDF anzeigen"}
      >
        <Eye className="h-4 w-4" />
        {pdfs.length > 1 && <span className="ml-1 text-xs">({pdfs.length})</span>}
      </Button>
    )
  }
  
  // No PDFs - show disabled Eye
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-muted-foreground"
      disabled
      title="Kein PDF verfügbar"
    >
      <Eye className="h-4 w-4" />
    </Button>
  )
}