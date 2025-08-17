'use client'

import { useCallback, useState } from 'react'

interface PDFModalState {
  url: string
  title: string
}

interface UsePDFModalReturn {
  pdf: PDFModalState | null
  isOpen: boolean
  openPDF: (url: string, title: string) => void
  closePDF: () => void
}

/**
 * Simple PDF Modal Hook
 *
 * BEFORE: Complex EnterprisePDFProvider (355 lines)
 * AFTER:  Simple hook-based PDF viewing (~20 lines)
 *
 * Usage:
 * const { pdf, isOpen, openPDF, closePDF } = usePDFModal()
 * openPDF('/path/to/file.pdf', 'Document Title')
 */
export function usePDFModal(): UsePDFModalReturn {
  const [pdf, setPdf] = useState<PDFModalState | null>(null)

  const openPDF = useCallback((url: string, title: string) => {
    setPdf({ url, title })
  }, [])

  const closePDF = useCallback(() => {
    setPdf(null)
  }, [])

  return {
    pdf,
    isOpen: !!pdf,
    openPDF,
    closePDF,
  }
}
