/**
 * PDF Manager with mobile optimization
 */
import { deviceDetection } from '@/shared/utils/deviceDetection'
import { toast } from 'sonner'

interface PdfWindow {
  id: string
  window?: Window
  iframe?: HTMLIFrameElement
  url: string
  openedAt: Date
}

class PdfManager {
  private openPdfs = new Map<string, PdfWindow>()
  
  constructor() {
    if (typeof window !== 'undefined') {
      // Cleanup on page unload
      window.addEventListener('beforeunload', () => this.cleanup())
      
      // Cleanup on visibility change (mobile background)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && deviceDetection.isMobile()) {
          // Close all PDFs when app goes to background on mobile
          this.cleanup()
        }
      })
    }
  }

  /**
   * Open PDF - mobile optimized
   */
  open(id: string, url: string): void {
    // Close existing PDF for same ID
    this.close(id)
    
    if (deviceDetection.isMobile()) {
      this.openMobile(id, url)
    } else {
      this.openDesktop(id, url)
    }
  }

  /**
   * Desktop: Open in new window
   */
  private openDesktop(id: string, url: string): void {
    try {
      // Validate URL
      if (!url || url.trim() === '') {
        console.error('[PDFManager] Invalid PDF URL provided')
        toast.error('PDF URL ungültig')
        return
      }
      
      const pdfWindow = window.open(url, `pdf_${id}`, 'width=800,height=600')
      
      if (pdfWindow) {
        this.openPdfs.set(id, {
          id,
          window: pdfWindow,
          url,
          openedAt: new Date()
        })
        
        // Monitor window
        const checkInterval = setInterval(() => {
          if (pdfWindow.closed) {
            clearInterval(checkInterval)
            this.openPdfs.delete(id)
          }
        }, 1000)
        
        // Auto-close after 10 minutes
        setTimeout(() => {
          if (!pdfWindow.closed) {
            pdfWindow.close()
          }
          this.openPdfs.delete(id)
        }, 10 * 60 * 1000)
      } else {
        toast.error('Pop-up blockiert. Bitte Pop-ups erlauben.')
      }
    } catch (error) {
      console.error('Error opening PDF:', error)
      toast.error('PDF konnte nicht geöffnet werden')
    }
  }

  /**
   * Mobile: Open in new tab (keeps app alive)
   */
  private openMobile(id: string, url: string): void {
    try {
      // Validate URL
      if (!url || url.trim() === '') {
        console.error('[PDFManager] Invalid PDF URL provided')
        toast.error('PDF URL ungültig')
        return
      }
      
      // Open PDF in new tab for all mobile browsers
      // This keeps the React app alive and maintains all state
      const win = window.open(url, '_blank')
      
      if (win) {
        // Track the window
        this.openPdfs.set(id, {
          id,
          window: win,
          url,
          openedAt: new Date()
        })
      } else {
        // Popup blocked - fallback to download
        this.downloadPdf(url, id)
      }
    } catch (error) {
      console.error('Error opening PDF on mobile:', error)
      // Fallback to download on any error
      this.downloadPdf(url, id)
    }
  }
  
  /**
   * Download PDF as fallback
   */
  private downloadPdf(url: string, id: string): void {
    try {
      const link = document.createElement('a')
      link.href = url
      link.download = `dokument_${id}.pdf`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.info('PDF wird heruntergeladen...')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('PDF konnte nicht geöffnet werden')
    }
  }

  /**
   * Close specific PDF
   */
  close(id: string): void {
    const pdf = this.openPdfs.get(id)
    if (!pdf) return
    
    if (pdf.window && !pdf.window.closed) {
      pdf.window.close()
    }
    
    // No more iframe/modal cleanup needed for mobile
    
    this.openPdfs.delete(id)
  }

  /**
   * Close all PDFs
   */
  cleanup(): void {
    // Close all windows
    this.openPdfs.forEach((pdf) => {
      if (pdf.window && !pdf.window.closed) {
        pdf.window.close()
      }
    })
    
    // No modal cleanup needed anymore
    
    this.openPdfs.clear()
  }

  /**
   * Get open PDF count
   */
  getOpenCount(): number {
    // Clean up closed windows
    const toDelete: string[] = []
    this.openPdfs.forEach((pdf, id) => {
      if (pdf.window && pdf.window.closed) {
        toDelete.push(id)
      }
    })
    toDelete.forEach(id => this.openPdfs.delete(id))
    
    return this.openPdfs.size
  }

  /**
   * Check if a PDF is open
   */
  isOpen(id: string): boolean {
    const pdf = this.openPdfs.get(id)
    if (!pdf) return false
    
    if (pdf.window) {
      return !pdf.window.closed
    }
    
    return false // Mobile PDFs are handled via navigation/download now
  }
}

// Singleton instance
export const pdfManager = new PdfManager()