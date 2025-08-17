/**
 * Simple PDF Manager - Direct window.open approach
 *
 * BEFORE: Complex EnterprisePDFProvider modal system (355+ lines)
 * AFTER:  Simple window.open for PDF viewing (~20 lines)
 *
 * This is the planned simplification from our refactoring.
 */

class SimplePdfManager {
  /**
   * Open PDF in new tab - Simple approach
   *
   * BEFORE: Complex modal system with setModalHandler, proxy URLs, mobile workarounds
   * AFTER:  Direct window.open (much simpler, works reliably)
   */
  open(_id: string, url: string, _title?: string): void {
    // Validate inputs
    if (!url || url.trim() === '') {
      console.error('[PdfManager] Invalid PDF URL provided')
      return
    }

    // Simple window.open approach - no complex modal system needed
    window.open(url, '_blank')
  }

  /**
   * Close PDF - No-op in simple approach (new tab handles itself)
   */
  close(_id: string): void {
    // No-op: New tab manages itself
  }

  /**
   * Cleanup - No-op in simple approach
   */
  cleanup(): void {
    // No-op: No complex state to clean
  }

  /**
   * Check if PDF is open - Always false in simple approach
   */
  isOpen(_id: string): boolean {
    return false // New tabs are independent
  }

  /**
   * Get count of open PDFs - Always 0 in simple approach
   */
  getOpenCount(): number {
    return 0 // New tabs are independent
  }
}

// Singleton instance
export const pdfManager = new SimplePdfManager()

// Keep backward compatibility with existing code
export default pdfManager
