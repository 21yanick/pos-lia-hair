/**
 * Enhanced PDF Manager with Direct Link Approach for Android Chrome
 */
import { deviceDetection } from '@/shared/utils/deviceDetection'
import { toast } from 'sonner'
import { debugLogger } from '@/shared/utils/debugLogger'
import { remoteDebugger } from '@/shared/utils/remoteDebug'

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
   * Open PDF - Enhanced mobile approach
   */
  open(id: string, url: string): void {
    // Close existing PDF for same ID
    this.close(id)
    
    if (deviceDetection.isMobile()) {
      this.openMobileEnhanced(id, url)
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
   * Enhanced Mobile PDF Opening - Direct Link Approach
   */
  private openMobileEnhanced(id: string, url: string): void {
    try {
      // Validate URL
      if (!url || url.trim() === '') {
        console.error('[PDFManager] Invalid PDF URL provided')
        toast.error('PDF URL ungültig')
        return
      }
      
      remoteDebugger.log('PDFManager', 'MOBILE_ENHANCED_START', { id, isAndroid: deviceDetection.isAndroid() })
      
      // Strategy 1: Create invisible link and click it (most reliable on mobile)
      this.createAndClickLink(id, url)
      
    } catch (error) {
      console.error('Error opening PDF on mobile:', error)
      remoteDebugger.log('PDFManager', 'MOBILE_ENHANCED_ERROR', error)
      this.downloadPdf(url, id)
    }
  }

  /**
   * Create and click a link - most reliable method for mobile
   */
  private createAndClickLink(id: string, url: string): void {
    remoteDebugger.log('PDFManager', 'CREATE_LINK_APPROACH', { id })
    
    // Create a temporary link element
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.style.display = 'none'
    
    // Add to DOM
    document.body.appendChild(link)
    
    // Track attempt
    this.openPdfs.set(id, {
      id,
      url,
      openedAt: new Date()
    })
    
    // Click the link
    try {
      link.click()
      remoteDebugger.log('PDFManager', 'LINK_CLICKED', 'Direct link clicked')
      
      // Show user feedback
      toast.info('PDF wird geöffnet...')
      
      // Remove link after click
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
      }, 100)
      
    } catch (error) {
      remoteDebugger.log('PDFManager', 'LINK_CLICK_FAILED', error)
      document.body.removeChild(link)
      
      // Fallback to window.open
      this.fallbackWindowOpen(id, url)
    }
  }

  /**
   * Fallback to window.open with multiple strategies
   */
  private fallbackWindowOpen(id: string, url: string): void {
    remoteDebugger.log('PDFManager', 'FALLBACK_WINDOW_OPEN', { id })
    
    let win: Window | null = null
    
    // Try different window.open strategies
    const strategies = [
      () => window.open(url, '_blank'),
      () => window.open(url, '_blank', 'noopener,noreferrer'),
      () => window.open(url, '_blank', 'width=800,height=600')
    ]
    
    for (let i = 0; i < strategies.length && !win; i++) {
      try {
        win = strategies[i]()
        if (win) {
          remoteDebugger.log('PDFManager', 'WINDOW_OPEN_SUCCESS', `Strategy ${i + 1} worked`)
          toast.info('PDF wird in neuem Tab geöffnet')
          return
        }
      } catch (error) {
        remoteDebugger.log('PDFManager', 'WINDOW_OPEN_FAILED', `Strategy ${i + 1} failed: ${error}`)
      }
    }
    
    // All window.open strategies failed
    remoteDebugger.log('PDFManager', 'ALL_WINDOW_OPEN_FAILED', 'Falling back to download')
    
    // Show user instructions
    toast.error('Pop-ups blockiert. PDF wird heruntergeladen.')
    
    // Final fallback: download
    this.downloadPdf(url, id)
  }

  
  /**
   * Download PDF as final fallback
   */
  private downloadPdf(url: string, id: string): void {
    try {
      remoteDebugger.log('PDFManager', 'DOWNLOAD_FALLBACK', { id })
      
      const link = document.createElement('a')
      link.href = url
      link.download = `dokument_${id}.pdf`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.info('PDF wird heruntergeladen...')
      
    } catch (error) {
      remoteDebugger.log('PDFManager', 'DOWNLOAD_ERROR', error)
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