/**
 * Organization State Persistence Service
 * Ensures organization context survives page refreshes
 */

const STORAGE_KEYS = {
  LAST_ORGANIZATION_ID: 'pos_lia_last_org_id',
  LAST_ORGANIZATION_SLUG: 'pos_lia_last_org_slug',
  SESSION_TIMESTAMP: 'pos_lia_session_ts',
} as const

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

interface PersistedOrgState {
  organizationId: string
  organizationSlug: string
  timestamp: number
}

class OrganizationPersistenceService {
  /**
   * Save organization state to localStorage
   */
  saveOrganizationState(organizationId: string, organizationSlug: string): void {
    try {
      const state: PersistedOrgState = {
        organizationId,
        organizationSlug,
        timestamp: Date.now(),
      }

      localStorage.setItem(STORAGE_KEYS.LAST_ORGANIZATION_ID, organizationId)
      localStorage.setItem(STORAGE_KEYS.LAST_ORGANIZATION_SLUG, organizationSlug)
      localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, String(state.timestamp))

      // Also save to sessionStorage for tab-specific state
      sessionStorage.setItem('current_org_state', JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save organization state:', error)
    }
  }

  /**
   * Get last organization state if still valid
   */
  getLastOrganizationState(): PersistedOrgState | null {
    try {
      // First check sessionStorage (tab-specific)
      const sessionState = sessionStorage.getItem('current_org_state')
      if (sessionState) {
        const state = JSON.parse(sessionState) as PersistedOrgState
        if (this.isSessionValid(state.timestamp)) {
          return state
        }
      }

      // Fallback to localStorage
      const organizationId = localStorage.getItem(STORAGE_KEYS.LAST_ORGANIZATION_ID)
      const organizationSlug = localStorage.getItem(STORAGE_KEYS.LAST_ORGANIZATION_SLUG)
      const timestamp = localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP)

      if (organizationId && organizationSlug && timestamp) {
        const state: PersistedOrgState = {
          organizationId,
          organizationSlug,
          timestamp: parseInt(timestamp, 10),
        }

        if (this.isSessionValid(state.timestamp)) {
          return state
        }
      }

      return null
    } catch (error) {
      console.error('Failed to get organization state:', error)
      return null
    }
  }

  /**
   * Clear organization state
   */
  clearOrganizationState(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LAST_ORGANIZATION_ID)
      localStorage.removeItem(STORAGE_KEYS.LAST_ORGANIZATION_SLUG)
      localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP)
      sessionStorage.removeItem('current_org_state')
    } catch (error) {
      console.error('Failed to clear organization state:', error)
    }
  }

  /**
   * Check if session is still valid
   */
  private isSessionValid(timestamp: number): boolean {
    const now = Date.now()
    const age = now - timestamp
    return age < SESSION_TIMEOUT
  }

  /**
   * Get organization ID from URL
   */
  getOrganizationSlugFromUrl(): string | null {
    if (typeof window === 'undefined') return null

    const match = window.location.pathname.match(/^\/org\/([^/]+)/)
    return match ? match[1] : null
  }

  /**
   * Should restore organization state?
   */
  shouldRestoreState(): boolean {
    // Check if we're on an org-specific route
    const urlSlug = this.getOrganizationSlugFromUrl()
    if (!urlSlug) return false

    // Check if we have valid persisted state
    const persistedState = this.getLastOrganizationState()
    if (!persistedState) return false

    // Only restore if URL matches persisted state
    return urlSlug === persistedState.organizationSlug
  }

  /**
   * Listen for storage events (cross-tab sync)
   */
  startCrossTabSync(callback: (state: PersistedOrgState | null) => void): () => void {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.LAST_ORGANIZATION_ID && event.newValue) {
        const state = this.getLastOrganizationState()
        callback(state)
      }
    }

    window.addEventListener('storage', handler)

    // Cleanup function
    return () => {
      window.removeEventListener('storage', handler)
    }
  }
}

export const organizationPersistence = new OrganizationPersistenceService()
