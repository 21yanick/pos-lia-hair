/**
 * Organization state persistence with mobile fallbacks
 */
import { deviceDetection } from '@/shared/utils/deviceDetection'

const STORAGE_KEY = 'pos_lia_current_org'
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

interface PersistedOrg {
  id: string
  slug: string
  timestamp: number
}

class OrganizationPersistence {
  private memoryCache: PersistedOrg | null = null
  private storageType: 'localStorage' | 'sessionStorage' | 'cookie' | 'memory'

  constructor() {
    this.storageType = deviceDetection.getStorageType()
    console.log(`[OrganizationPersistence] Using ${this.storageType} for storage`)
  }

  /**
   * Save organization state
   */
  save(organizationId: string, organizationSlug: string): void {
    const data: PersistedOrg = {
      id: organizationId,
      slug: organizationSlug,
      timestamp: Date.now()
    }

    // Always save to memory
    this.memoryCache = data

    try {
      switch (this.storageType) {
        case 'localStorage':
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
          // Also save to sessionStorage as backup
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
          } catch (e) {}
          break

        case 'sessionStorage':
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
          break

        case 'cookie':
          this.setCookie(STORAGE_KEY, JSON.stringify(data), SESSION_TIMEOUT)
          break

        case 'memory':
          // Already saved to memoryCache
          break
      }
    } catch (e) {
      console.warn('[OrganizationPersistence] Failed to save:', e)
    }
  }

  /**
   * Load organization state
   */
  load(): PersistedOrg | null {
    try {
      let data: PersistedOrg | null = null

      // Try different storage methods in order
      switch (this.storageType) {
        case 'localStorage':
          const localData = localStorage.getItem(STORAGE_KEY)
          if (localData) {
            data = JSON.parse(localData)
          } else {
            // Fallback to sessionStorage
            const sessionData = sessionStorage.getItem(STORAGE_KEY)
            if (sessionData) {
              data = JSON.parse(sessionData)
            }
          }
          break

        case 'sessionStorage':
          const sessionData = sessionStorage.getItem(STORAGE_KEY)
          if (sessionData) {
            data = JSON.parse(sessionData)
          }
          break

        case 'cookie':
          const cookieData = this.getCookie(STORAGE_KEY)
          if (cookieData) {
            data = JSON.parse(cookieData)
          }
          break

        case 'memory':
          data = this.memoryCache
          break
      }

      // Validate data
      if (data && this.isValid(data)) {
        this.memoryCache = data
        return data
      }

      // Try memory cache as last resort
      if (this.memoryCache && this.isValid(this.memoryCache)) {
        return this.memoryCache
      }

      return null
    } catch (e) {
      console.warn('[OrganizationPersistence] Failed to load:', e)
      return this.memoryCache
    }
  }

  /**
   * Clear organization state
   */
  clear(): void {
    this.memoryCache = null

    try {
      switch (this.storageType) {
        case 'localStorage':
          localStorage.removeItem(STORAGE_KEY)
          sessionStorage.removeItem(STORAGE_KEY)
          break

        case 'sessionStorage':
          sessionStorage.removeItem(STORAGE_KEY)
          break

        case 'cookie':
          this.deleteCookie(STORAGE_KEY)
          break
      }
    } catch (e) {
      console.warn('[OrganizationPersistence] Failed to clear:', e)
    }
  }

  /**
   * Validate persisted data
   */
  private isValid(data: PersistedOrg): boolean {
    if (!data || !data.id || !data.slug || !data.timestamp) {
      return false
    }

    // Check if session expired
    const age = Date.now() - data.timestamp
    return age < SESSION_TIMEOUT
  }

  /**
   * Cookie helpers
   */
  private setCookie(name: string, value: string, maxAge: number): void {
    const expires = new Date(Date.now() + maxAge).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
    return match ? decodeURIComponent(match[2]) : null
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }
}

// Export singleton
export const organizationPersistence = new OrganizationPersistence()