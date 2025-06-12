"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { FileText, Download, Replace, ExternalLink, MoreHorizontal, Eye } from "lucide-react"
import { useExpensePDFs } from "../hooks/useExpensePDFs"
import { PDFReplaceDialog } from "./PDFReplaceDialog"
import { useToast } from "@/shared/hooks/core/useToast"
import type { Expense } from "@/shared/types/expenses"

interface ExpensePDFActionsProps {
  expense: Expense
  onReplace: (expenseId: string, file: File) => Promise<{ success: boolean; error?: string }>
}

export function ExpensePDFActions({ expense, onReplace }: ExpensePDFActionsProps) {
  const { 
    loadExpensePDFs, 
    getExpensePDFsFromCache, 
    hasExpensePDFs,
    invalidateCache,
    loading 
  } = useExpensePDFs()
  
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [pdfsLoaded, setPdfsLoaded] = useState(false)
  const { toast } = useToast()

  // Load PDFs on mount
  useEffect(() => {
    const loadPDFs = async () => {
      await loadExpensePDFs(expense.id)
      setPdfsLoaded(true)
    }
    loadPDFs()
  }, [expense.id, loadExpensePDFs])

  const pdfs = getExpensePDFsFromCache(expense.id)
  const hasPDFs = hasExpensePDFs(expense.id)

  const handleViewPDF = (url: string, fileName: string) => {
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
    } catch (error) {
      toast({
        title: "Download fehlgeschlagen",
        description: "Die Datei konnte nicht heruntergeladen werden.",
        variant: "destructive"
      })
    }
  }

  const handleReplaceSuccess = () => {
    invalidateCache(expense.id)
    // Reload PDFs after replacement
    setTimeout(() => {
      loadExpensePDFs(expense.id)
    }, 500)
  }

  // Show loading state until PDFs are loaded
  if (!pdfsLoaded || loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <FileText className="h-4 w-4 animate-pulse" />
      </Button>
    )
  }

  // No PDFs available
  if (!hasPDFs || pdfs.length === 0) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground"
        disabled
      >
        <FileText className="h-4 w-4" />
      </Button>
    )
  }

  // Single PDF - direct actions
  if (pdfs.length === 1) {
    const pdf = pdfs[0]
    return (
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewPDF(pdf.url || '', pdf.displayName || 'beleg.pdf')}
          title="PDF anzeigen"
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewPDF(pdf.url || '', pdf.displayName || 'beleg.pdf')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              In neuem Tab öffnen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownloadPDF(pdf.url || '', pdf.displayName || 'beleg.pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Herunterladen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setReplaceDialogOpen(true)}>
              <Replace className="mr-2 h-4 w-4" />
              Beleg ersetzen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <PDFReplaceDialog
          open={replaceDialogOpen}
          onOpenChange={setReplaceDialogOpen}
          expenseId={expense.id}
          expenseDescription={expense.description}
          onReplaceSuccess={handleReplaceSuccess}
          onReplace={onReplace}
        />
      </div>
    )
  }

  // Multiple PDFs - dropdown menu
  return (
    <div className="flex items-center space-x-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <FileText className="h-4 w-4" />
            <span className="ml-1 text-xs">({pdfs.length})</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {pdfs.map((pdf, index) => (
            <DropdownMenuItem 
              key={pdf.id}
              onClick={() => handleViewPDF(pdf.url || '', pdf.displayName || `beleg-${index + 1}.pdf`)}
            >
              <FileText className="mr-2 h-4 w-4" />
              {pdf.displayName || `Beleg ${index + 1}`}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => setReplaceDialogOpen(true)}>
            <Replace className="mr-2 h-4 w-4" />
            Belege ersetzen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PDFReplaceDialog
        open={replaceDialogOpen}
        onOpenChange={setReplaceDialogOpen}
        expenseId={expense.id}
        expenseDescription={expense.description}
        onReplaceSuccess={handleReplaceSuccess}
        onReplace={onReplace}
      />
    </div>
  )
}