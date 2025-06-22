/**
 * Handle PDF return navigation and state restoration
 */

interface PDFReturnInfo {
  returnUrl: string
  returnTitle: string
  timestamp: number
  orgBackup?: any
}

export const pdfReturnHandler = {
  /**
   * Check if we're returning from a PDF view and restore state
   */
  checkAndRestore(): boolean {
    if (typeof window === 'undefined') return false
    
    const returnUrl = sessionStorage.getItem('pdf_return_url')
    const returnTitle = sessionStorage.getItem('pdf_return_title')
    const timestamp = sessionStorage.getItem('pdf_return_timestamp')
    const orgBackup = sessionStorage.getItem('pdf_org_backup')
    
    if (!returnUrl || !timestamp) return false
    
    // Check if return info is recent (within 5 minutes)
    const now = Date.now()
    const pdfTime = parseInt(timestamp)
    const isRecent = (now - pdfTime) < 5 * 60 * 1000
    
    if (!isRecent) {
      // Clear old return info
      this.clearReturnInfo()
      return false
    }
    
    console.log('[PDFReturnHandler] Detected PDF return - restoring state')
    
    // We're returning from PDF - restore organization state if available
    if (orgBackup && typeof window !== 'undefined') {
      try {
        const orgData = JSON.parse(orgBackup)
        console.log('[PDFReturnHandler] Restoring organization:', orgData.slug)
        
        // Store for OrganizationProvider to pick up
        sessionStorage.setItem('pdf_restore_organization', orgBackup)
        sessionStorage.setItem('pdf_restore_flag', 'true')
        
        // Try to restore to Zustand store if available
        if ((window as any).__organization_store) {
          const orgStore = (window as any).__organization_store
          if (orgStore.setState) {
            console.log('[PDFReturnHandler] Restoring to Zustand store')
            orgStore.setState({ 
              currentOrganization: orgData,
              userRole: orgData.userRole || null
            })
          }
        }
        
        // Force navigation to correct URL if needed
        const currentUrl = window.location.href
        const expectedUrl = `/org/${orgData.slug}`
        
        // If we're on a PDF URL or not on the correct org URL, redirect
        if (this.isPDFUrl(currentUrl) || !currentUrl.includes(expectedUrl)) {
          console.log('[PDFReturnHandler] Redirecting from PDF back to app:', expectedUrl)
          
          // Try to restore to the exact page user was on
          const returnUrl = sessionStorage.getItem('pdf_return_url')
          if (returnUrl && returnUrl.includes(expectedUrl)) {
            window.location.href = returnUrl
          } else {
            // Fallback to dashboard
            window.location.href = `${expectedUrl}/dashboard`
          }
        }
        
      } catch (error) {
        console.error('Failed to restore organization state:', error)
      }
    }
    
    // Don't clear return info here - let OrganizationProvider handle it
    // This ensures the restore flags are available for React effects
    
    return true
  },
  
  /**
   * Clear all PDF return information
   */
  clearReturnInfo(): void {
    if (typeof window === 'undefined') return
    
    sessionStorage.removeItem('pdf_return_url')
    sessionStorage.removeItem('pdf_return_title')
    sessionStorage.removeItem('pdf_return_timestamp')
    sessionStorage.removeItem('pdf_org_backup')
  },
  
  /**
   * Check if current URL looks like a PDF URL
   */
  isPDFUrl(url: string = window.location.href): boolean {
    if (!url) return false
    
    // Check for PDF file extension
    if (url.endsWith('.pdf')) return true
    
    // Check for storage URLs (Supabase, etc.)
    if (url.includes('/storage/') && url.includes('object/')) return true
    
    // Check for blob URLs
    if (url.startsWith('blob:')) return true
    
    return false
  },
  
  /**
   * Initialize PDF return handler
   */
  initialize(): void {
    if (typeof window === 'undefined') return
    
    // Check on page load
    this.checkAndRestore()
    
    // Monitor for PDF URLs in current page
    const currentUrl = window.location.href
    if (this.isPDFUrl(currentUrl)) {
      // We're on a PDF page - this means direct navigation worked
      // Don't do anything special, let user navigate back normally
      return
    }
    
    // Set up visibility change listener for Android
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Page became visible - check for PDF return
        setTimeout(() => {
          this.checkAndRestore()
        }, 100)
      }
    })
  }
}