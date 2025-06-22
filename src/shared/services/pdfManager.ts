/**
 * Minimal PDF Manager - handles PDF viewing and cleanup
 */
class PdfManager {
  private openWindows = new Map<string, Window>()
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.cleanup())
    }
  }

  /**
   * Open PDF with automatic cleanup
   */
  open(id: string, url: string): void {
    // Close existing window for same ID
    this.close(id)
    
    // Open new window
    const pdfWindow = window.open(url, `pdf_${id}`, 'width=800,height=600')
    
    if (pdfWindow) {
      this.openWindows.set(id, pdfWindow)
      
      // Monitor window and cleanup when closed
      const checkClosed = setInterval(() => {
        if (pdfWindow.closed) {
          clearInterval(checkClosed)
          this.openWindows.delete(id)
        }
      }, 1000)
    }
  }

  /**
   * Close specific PDF window
   */
  close(id: string): void {
    const window = this.openWindows.get(id)
    if (window && !window.closed) {
      window.close()
    }
    this.openWindows.delete(id)
  }

  /**
   * Close all PDF windows
   */
  cleanup(): void {
    this.openWindows.forEach((window, id) => {
      if (!window.closed) {
        window.close()
      }
    })
    this.openWindows.clear()
  }

  /**
   * Get open windows count
   */
  getOpenCount(): number {
    // Clean up closed windows first
    const closedIds: string[] = []
    this.openWindows.forEach((window, id) => {
      if (window.closed) {
        closedIds.push(id)
      }
    })
    closedIds.forEach(id => this.openWindows.delete(id))
    
    return this.openWindows.size
  }
}

// Singleton instance
export const pdfManager = new PdfManager()