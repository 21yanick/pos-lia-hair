/**
 * Simple organization state persistence
 */
const STORAGE_KEY = 'pos_lia_current_org'
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

interface PersistedOrg {
  id: string
  slug: string
  timestamp: number
}

export const organizationPersistence = {
  save(organizationId: string, organizationSlug: string) {
    try {
      const data: PersistedOrg = {
        id: organizationId,
        slug: organizationSlug,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      // Fail silently - persistence is optional
    }
  },

  load(): PersistedOrg | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      
      const data = JSON.parse(stored) as PersistedOrg
      
      // Check if session expired
      if (Date.now() - data.timestamp > SESSION_TIMEOUT) {
        this.clear()
        return null
      }
      
      return data
    } catch (e) {
      return null
    }
  },

  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      // Fail silently
    }
  }
}