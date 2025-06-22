/**
 * Device detection utilities
 */

export const deviceDetection = {
  /**
   * Check if running on mobile device
   */
  isMobile(): boolean {
    if (typeof window === 'undefined') return false
    
    // Check via UserAgent
    const userAgent = window.navigator.userAgent.toLowerCase()
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
    
    // Check via touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    // Check viewport width
    const isSmallScreen = window.innerWidth <= 768
    
    return mobileRegex.test(userAgent) || (hasTouch && isSmallScreen)
  },

  /**
   * Check if running on iOS
   */
  isIOS(): boolean {
    if (typeof window === 'undefined') return false
    
    const userAgent = window.navigator.userAgent.toLowerCase()
    return /iphone|ipad|ipod/.test(userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // iPad Pro
  },

  /**
   * Check if running in standalone mode (PWA)
   */
  isStandalone(): boolean {
    if (typeof window === 'undefined') return false
    
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  },

  /**
   * Check if browser supports opening PDFs inline
   */
  canOpenPDFInline(): boolean {
    if (typeof window === 'undefined') return false
    
    // iOS Safari has issues with PDF viewing
    if (this.isIOS()) {
      return false
    }
    
    // Check if browser has PDF plugin
    const hasPDFPlugin = navigator.mimeTypes['application/pdf']
    
    return hasPDFPlugin !== undefined
  },

  /**
   * Get available storage mechanism
   */
  getStorageType(): 'localStorage' | 'sessionStorage' | 'cookie' | 'memory' {
    if (typeof window === 'undefined') return 'memory'
    
    // Test localStorage
    try {
      const test = '__storage_test__'
      window.localStorage.setItem(test, test)
      window.localStorage.removeItem(test)
      return 'localStorage'
    } catch (e) {
      // localStorage not available (private browsing, etc)
    }
    
    // Test sessionStorage
    try {
      const test = '__storage_test__'
      window.sessionStorage.setItem(test, test)
      window.sessionStorage.removeItem(test)
      return 'sessionStorage'
    } catch (e) {
      // sessionStorage not available
    }
    
    // Fallback to cookies
    if (navigator.cookieEnabled) {
      return 'cookie'
    }
    
    // Last resort: in-memory only
    return 'memory'
  }
}