'use client'

import React, { useState, useEffect } from 'react'
import { EnterprisePDFViewer } from './EnterprisePDFViewer'
import { pdfManager } from '@/shared/services/pdfManager'

interface PDFModalData {
  id: string
  url: string
  title?: string
}

interface EnterprisePDFProviderProps {
  children: React.ReactNode
}

/**
 * Enterprise PDF Provider - Global Modal Integration
 * 
 * Provides app-wide PDF modal functionality by:
 * 1. Managing modal state for PDF viewing
 * 2. Connecting pdfManager to modal handler
 * 3. Rendering EnterprisePDFViewer when needed
 */
export function EnterprisePDFProvider({ children }: EnterprisePDFProviderProps) {
  const [pdfModal, setPdfModal] = useState<PDFModalData | null>(null)

  // Connect pdfManager to modal handler on mount
  useEffect(() => {
    console.log('[EnterprisePDFProvider] Setting up modal handler')
    
    // Set the modal handler in pdfManager
    pdfManager.setModalHandler((data: PDFModalData | null) => {
      console.log('[EnterprisePDFProvider] Modal handler called:', data)
      setPdfModal(data)
    })

    // Cleanup when component unmounts
    return () => {
      console.log('[EnterprisePDFProvider] Cleaning up modal handler')
      pdfManager.cleanup()
    }
  }, [])

  const handleClosePDF = () => {
    console.log('[EnterprisePDFProvider] Closing PDF modal')
    setPdfModal(null)
    
    // Also close via pdfManager if there was an ID
    if (pdfModal?.id) {
      pdfManager.close(pdfModal.id)
    }
  }

  return (
    <>
      {children}
      
      {/* Enterprise PDF Modal - Rendered when needed */}
      <EnterprisePDFViewer
        isOpen={!!pdfModal}
        pdfUrl={pdfModal?.url || ''}
        title={pdfModal?.title}
        onClose={handleClosePDF}
      />
    </>
  )
}