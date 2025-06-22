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
  private currentModal: HTMLDivElement | null = null
  
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
   * Mobile: Open in modal with iframe
   */
  private openMobile(id: string, url: string): void {
    try {
      // Create modal container
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 z-50 bg-black/90 flex flex-col'
      modal.style.touchAction = 'none' // Prevent scroll issues
      
      // Create header
      const header = document.createElement('div')
      header.className = 'flex items-center justify-between p-4 bg-background border-b'
      header.innerHTML = `
        <h3 class="font-semibold">PDF Dokument</h3>
        <button class="p-2 hover:bg-muted rounded-lg transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `
      
      // Create iframe container
      const iframeContainer = document.createElement('div')
      iframeContainer.className = 'flex-1 overflow-hidden'
      
      // Create iframe
      const iframe = document.createElement('iframe')
      iframe.src = url
      iframe.className = 'w-full h-full border-0'
      iframe.style.touchAction = 'auto' // Allow pinch-zoom in iframe
      
      // Handle iOS specific issues
      if (deviceDetection.isIOS()) {
        // iOS needs special handling for PDFs
        iframe.style.webkitOverflowScrolling = 'touch'
        iframe.setAttribute('scrolling', 'yes')
      }
      
      // Assemble modal
      iframeContainer.appendChild(iframe)
      modal.appendChild(header)
      modal.appendChild(iframeContainer)
      
      // Close handler
      const closeButton = header.querySelector('button')
      const closeModal = () => {
        document.body.removeChild(modal)
        document.body.style.overflow = ''
        this.openPdfs.delete(id)
        this.currentModal = null
      }
      
      closeButton?.addEventListener('click', closeModal)
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      // Add to DOM
      document.body.appendChild(modal)
      this.currentModal = modal
      
      // Track
      this.openPdfs.set(id, {
        id,
        iframe,
        url,
        openedAt: new Date()
      })
      
      // Auto-close after 30 minutes on mobile
      setTimeout(() => {
        if (document.body.contains(modal)) {
          closeModal()
        }
      }, 30 * 60 * 1000)
      
    } catch (error) {
      console.error('Error opening PDF on mobile:', error)
      
      // Fallback: Direct navigation
      if (deviceDetection.canOpenPDFInline()) {
        window.location.href = url
      } else {
        // Last resort: download
        const link = document.createElement('a')
        link.href = url
        link.download = `document_${id}.pdf`
        link.click()
        toast.info('PDF wird heruntergeladen...')
      }
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
    
    if (pdf.iframe && this.currentModal) {
      document.body.removeChild(this.currentModal)
      document.body.style.overflow = ''
      this.currentModal = null
    }
    
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
    
    // Close modal if exists
    if (this.currentModal && document.body.contains(this.currentModal)) {
      document.body.removeChild(this.currentModal)
      document.body.style.overflow = ''
      this.currentModal = null
    }
    
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
    
    return pdf.iframe !== undefined && this.currentModal !== null
  }
}

// Singleton instance
export const pdfManager = new PdfManager()