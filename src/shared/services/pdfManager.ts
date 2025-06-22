/**
 * Enterprise PDF Manager - Simplified Modal Approach
 * 
 * BEFORE: 500+ lines of complex mobile workarounds
 * AFTER:  50 lines of simple modal logic
 */

interface PDFModalData {
  id: string
  url: string
  title?: string
}

type PDFModalHandler = (data: PDFModalData | null) => void

class EnterprisePdfManager {
  private modalHandler: PDFModalHandler | null = null
  private openPdfs = new Set<string>()

  /**
   * Set modal handler (called from root layout)
   */
  setModalHandler(handler: PDFModalHandler): void {
    this.modalHandler = handler
  }

  /**
   * Open PDF in modal - Enterprise approach
   * 
   * BEFORE: window.open() / window.location.href → App dies
   * AFTER:  showModal() → App stays alive
   */
  open(id: string, url: string, title?: string): void {
    // Validate inputs
    if (!url || url.trim() === '') {
      console.error('[EnterprisePdfManager] Invalid PDF URL provided')
      return
    }

    if (!this.modalHandler) {
      console.error('[EnterprisePdfManager] Modal handler not set. Call setModalHandler() first.')
      // Fallback to window.open for development
      window.open(url, '_blank')
      return
    }

    // Close any existing PDF
    this.close(id)

    // Show PDF in modal
    this.modalHandler({
      id,
      url,
      title: title || `PDF Dokument ${id}`
    })

    // Track as open
    this.openPdfs.add(id)
  }

  /**
   * Close specific PDF
   */
  close(id: string): void {
    if (this.openPdfs.has(id)) {
      this.openPdfs.delete(id)
      
      // Close modal if this was the current PDF
      if (this.modalHandler) {
        this.modalHandler(null)
      }
    }
  }

  /**
   * Close all PDFs
   */
  cleanup(): void {
    this.openPdfs.clear()
    
    if (this.modalHandler) {
      this.modalHandler(null)
    }
  }

  /**
   * Check if PDF is open
   */
  isOpen(id: string): boolean {
    return this.openPdfs.has(id)
  }

  /**
   * Get count of open PDFs
   */
  getOpenCount(): number {
    return this.openPdfs.size
  }
}

// Singleton instance
export const pdfManager = new EnterprisePdfManager()

// Keep backward compatibility with existing code
export default pdfManager