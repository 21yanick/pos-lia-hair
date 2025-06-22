/**
 * PDF Manager with mobile optimization
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
   * Mobile: ALWAYS use new tab to keep app alive
   */
  private openMobile(id: string, url: string): void {
    try {
      // Validate URL
      if (!url || url.trim() === '') {
        console.error('[PDFManager] Invalid PDF URL provided')
        toast.error('PDF URL ungültig')
        return
      }
      
      remoteDebugger.log('PDFManager', 'MOBILE_STRATEGY', 'FORCE_NEW_TAB - Keep app alive!')
      
      // ALWAYS use new tab for mobile to keep React app alive
      // Even if Android Chrome might prefer direct navigation,
      // keeping the app alive is more important than optimal UX
      this.openNewTab(id, url)
      
    } catch (error) {
      console.error('Error opening PDF on mobile:', error)
      remoteDebugger.log('PDFManager', 'MOBILE_ERROR', error)
      this.downloadPdf(url, id)
    }
  }

  /**
   * Direct navigation (Android Chrome)
   */
  private openDirectNavigation(id: string, url: string): void {
    remoteDebugger.log('PDFManager', 'DIRECT_NAVIGATION_START', { id, url: url.substring(0, 100) + '...' })
    
    // Save current state for return navigation
    const currentUrl = window.location.href
    const currentTitle = document.title
    
    remoteDebugger.log('PDFManager', 'BACKUP_CURRENT_STATE', { currentUrl, currentTitle })
    
    // Store return information
    sessionStorage.setItem('pdf_return_url', currentUrl)
    sessionStorage.setItem('pdf_return_title', currentTitle)
    sessionStorage.setItem('pdf_return_timestamp', Date.now().toString())
    
    // Force organization state persistence before navigation
    if (typeof window !== 'undefined' && (window as any).__organization_store) {
      const orgStore = (window as any).__organization_store
      if (orgStore.getState) {
        const state = orgStore.getState()
        const orgState = {
          hasCurrentOrg: !!state.currentOrganization,
          orgSlug: state.currentOrganization?.slug,
          userRole: state.userRole
        }
        remoteDebugger.log('PDFManager', 'ORG_STORE_STATE', orgState)
        
        if (state.currentOrganization) {
          // Include both organization and user role
          const backupData = {
            ...state.currentOrganization,
            userRole: state.userRole
          }
          sessionStorage.setItem('pdf_org_backup', JSON.stringify(backupData))
          remoteDebugger.log('PDFManager', 'ORG_BACKUP_SAVED', { slug: backupData.slug })
        }
      }
    }
    
    remoteDebugger.log('PDFManager', 'NAVIGATE_TO_PDF', 'Leaving app...')
    
    // Navigate directly to PDF
    window.location.href = url
    
    // Track as opened
    this.openPdfs.set(id, {
      id,
      url,
      openedAt: new Date()
    })
  }

  /**
   * New tab approach (iOS, Desktop, Mobile)
   */
  private openNewTab(id: string, url: string): void {
    remoteDebugger.log('PDFManager', 'NEW_TAB_ATTEMPT', { id, isMobile: deviceDetection.isMobile() })
    
    // Try different window.open strategies for better mobile compatibility
    let win: Window | null = null
    
    // Strategy 1: Standard new tab
    win = window.open(url, '_blank')
    
    // Strategy 2: If blocked, try with noopener/noreferrer
    if (!win) {
      remoteDebugger.log('PDFManager', 'NEW_TAB_RETRY', 'Trying with noopener')
      win = window.open(url, '_blank', 'noopener,noreferrer')
    }
    
    // Strategy 3: If still blocked, try with minimal features
    if (!win) {
      remoteDebugger.log('PDFManager', 'NEW_TAB_RETRY', 'Trying with minimal features')
      win = window.open(url, '_blank', 'width=800,height=600')
    }
    
    if (win) {
      remoteDebugger.log('PDFManager', 'NEW_TAB_SUCCESS', 'PDF opened in new tab')
      
      // Track the window
      this.openPdfs.set(id, {
        id,
        window: win,
        url,
        openedAt: new Date()
      })
      
      // Show user feedback for mobile
      if (deviceDetection.isMobile()) {
        toast.info('PDF wird in neuem Tab geöffnet')
      }
    } else {
      remoteDebugger.log('PDFManager', 'NEW_TAB_BLOCKED', 'All window.open attempts failed')
      
      // Show user instructions for unblocking
      if (deviceDetection.isMobile()) {
        toast.error('Pop-ups blockiert. Bitte in Browser-Einstellungen erlauben.')
      }
      
      // Fallback to download
      this.downloadPdf(url, id)
    }
  }
  
  /**
   * Download PDF as fallback
   */
  private downloadPdf(url: string, id: string): void {
    try {
      remoteDebugger.log('PDFManager', 'DOWNLOAD_FALLBACK', { id })
      
      const link = document.createElement('a')
      link.href = url
      link.download = `dokument_${id}.pdf`
      link.style.display = 'none'
      link.setAttribute('target', '_blank')
      
      document.body.appendChild(link)
      
      // Add click event listener to detect if download started
      let downloadStarted = false
      link.addEventListener('click', () => {
        downloadStarted = true
        remoteDebugger.log('PDFManager', 'DOWNLOAD_TRIGGERED', 'Download link clicked')
      })
      
      link.click()
      document.body.removeChild(link)
      
      // Show appropriate feedback
      if (deviceDetection.isMobile()) {
        toast.info('PDF wird heruntergeladen. Prüfen Sie den Downloads-Ordner.')
      } else {
        toast.info('PDF wird heruntergeladen...')
      }
      
      // If click didn't work, show manual instructions
      setTimeout(() => {
        if (!downloadStarted) {
          remoteDebugger.log('PDFManager', 'DOWNLOAD_FAILED', 'Automatic download failed')
          toast.error('Download fehlgeschlagen. Bitte PDF-URL direkt öffnen.')
        }
      }, 1000)
      
    } catch (error) {
      remoteDebugger.log('PDFManager', 'DOWNLOAD_ERROR', error)
      console.error('Error downloading PDF:', error)
      toast.error('PDF konnte nicht geöffnet werden')
      
      // Last resort: show URL to user
      if (url && url.length < 200) {
        console.log('PDF URL for manual access:', url)
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