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
    return (
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    ) // iPad Pro
  },

  /**
   * Check if running on Android
   */
  isAndroid(): boolean {
    if (typeof window === 'undefined') return false

    const userAgent = window.navigator.userAgent.toLowerCase()
    return /android/.test(userAgent)
  },

  /**
   * Check if running Chrome browser
   */
  isChrome(): boolean {
    if (typeof window === 'undefined') return false

    const userAgent = window.navigator.userAgent.toLowerCase()
    return /chrome/.test(userAgent) && !/edge|edg|opr/.test(userAgent)
  },

  /**
   * Check if running Chrome on Android
   */
  isAndroidChrome(): boolean {
    return this.isAndroid() && this.isChrome()
  },

  /**
   * Check if running in standalone mode (PWA)
   */
  isStandalone(): boolean {
    if (typeof window === 'undefined') return false

    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    )
  },

  /**
   * Check if browser supports opening PDFs inline
   */
  canOpenPDFInline(): boolean {
    if (typeof window === 'undefined') return false

    // iOS Safari has issues with PDF viewing in new tabs
    if (this.isIOS()) {
      return false
    }

    // Android Chrome: Use direct navigation for better reliability
    if (this.isAndroidChrome()) {
      return true
    }

    // Other browsers: Check for PDF plugin
    const hasPDFPlugin = navigator.mimeTypes['application/pdf']
    return hasPDFPlugin !== undefined
  },

  /**
   * Get optimal PDF opening strategy for current browser
   * IMPORTANT: Always use new-tab for mobile to keep React app alive
   */
  getPDFStrategy(): 'direct-navigation' | 'new-tab' | 'download' {
    if (typeof window === 'undefined') return 'download'

    // Mobile: ALWAYS new tab to keep React app alive
    // Direct navigation (window.location.href) kills the entire app
    if (this.isMobile()) {
      return 'new-tab'
    }

    // Desktop: New tab
    return 'new-tab'
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
  },
}
