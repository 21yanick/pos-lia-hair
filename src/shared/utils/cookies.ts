/**
 * Secure cookie utilities
 * Based on existing patterns from organizationPersistence.ts
 *
 * Note: These utilities use document.cookie with secure defaults (SameSite=Strict, proper encoding).
 * This is a deliberate architectural decision for browser compatibility and simplicity.
 */

/**
 * Set a cookie with secure defaults
 */
export function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === 'undefined') return

  const expires = new Date(Date.now() + maxAge * 1000).toUTCString()
  // biome-ignore lint/suspicious/noDocumentCookie: Secure implementation with proper encoding and security attributes
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return

  // biome-ignore lint/suspicious/noDocumentCookie: Secure implementation for cookie deletion
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}
